import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useCart } from '../context/CartContext';
import api, { ordersApi } from '../services/api';
import { loadRazorpayScript } from '../utils/razorpay';

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, loading: cartLoading, subtotal, totalUnits, clearCartState } = useCart();

  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    phone: '',
    addressLine1: '',
    city: '',
    state: '',
    pincode: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderError, setOrderError] = useState(null);

  // Pre-fill user data if available
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get('/getMe');
        if (res.data?.user) {
          setShippingAddress((prev) => ({
            ...prev,
            fullName: prev.fullName || res.data.user.fullName || '',
            phone: prev.phone || res.data.user.phone || ''
          }));
        }
      } catch (err) {
        console.warn('Failed to pre-fetch user for checkout', err);
      }
    };
    fetchUser();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!shippingAddress.fullName.trim()) {
      newErrors.fullName = 'Full Name is required';
    }

    const phoneClean = shippingAddress.phone.trim().replace(/[\s\-()]/g, '');
    if (!phoneClean) {
      newErrors.phone = 'Phone Number is required';
    } else if (phoneClean.length < 10) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }

    if (!shippingAddress.addressLine1.trim()) {
      newErrors.addressLine1 = 'Address line is required';
    }

    if (!shippingAddress.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!shippingAddress.state.trim()) {
      newErrors.state = 'State is required';
    }

    if (!shippingAddress.pincode.trim()) {
      newErrors.pincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(shippingAddress.pincode.trim())) {
      newErrors.pincode = 'Pincode must contain exactly 6 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (cartItems.length === 0) {
      setOrderError('Your cart is empty. Please add items before placing an order.');
      return;
    }

    setIsSubmitting(true);
    setOrderError(null);

    try {
      // Step 1: Create ShopKart Pending Order and get Razorpay Order ID from backend
      const orderRes = await ordersApi.post('/create-payment-order', {
        shippingAddress
      });

      const { shopKartOrderId, razorpayOrderId, amount, currency, key } = orderRes.data;

      // Step 2: Load Razorpay Checkout Script
      const isScriptLoaded = await loadRazorpayScript();

      if (!isScriptLoaded || !window.Razorpay) {
        // Fallback simulated payment prompt for offline or blocked environments
        const proceedSimulated = window.confirm(
          'Razorpay checkout script could not be loaded directly from the CDN (offline/adblocker active).\n\nProceed with Simulated Test Mode Payment for testing?'
        );

        if (proceedSimulated) {
          const verifyRes = await ordersApi.post('/verify-payment', {
            shopKartOrderId,
            razorpay_order_id: razorpayOrderId,
            razorpay_payment_id: `pay_sim_${Date.now()}`,
            razorpay_signature: 'simulated_test_signature'
          });

          if (verifyRes.data.success) {
            clearCartState();
            navigate(`/orders/${shopKartOrderId}`);
            return;
          }
        } else {
          setOrderError('Payment cancelled. Your cart has been preserved.');
          setIsSubmitting(false);
          return;
        }
      }

      // Step 3: Open Razorpay Test Mode Checkout
      const options = {
        key: key,
        amount: amount,
        currency: currency,
        name: 'ShopKart',
        description: 'Complete your ShopKart order',
        order_id: razorpayOrderId,
        handler: async function (response) {
          try {
            // Step 4: Verify cryptographic HMAC SHA-256 signature on backend
            const verifyRes = await ordersApi.post('/verify-payment', {
              shopKartOrderId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            if (verifyRes.data.success) {
              // Clear global cart state only after verified payment
              clearCartState();
              navigate(`/orders/${shopKartOrderId}`);
            } else {
              setOrderError(verifyRes.data.message || 'Payment signature verification failed.');
            }
          } catch (verifyErr) {
            console.error('Payment verification failed:', verifyErr);
            setOrderError(
              verifyErr.response?.data?.message ||
                'Payment verification failed. Please contact support.'
            );
          } finally {
            setIsSubmitting(false);
          }
        },
        prefill: {
          name: shippingAddress.fullName,
          contact: shippingAddress.phone
        },
        theme: {
          color: '#4f46e5'
        },
        modal: {
          ondismiss: function () {
            setIsSubmitting(false);
            setOrderError('Payment was dismissed or cancelled. Your cart has not been cleared.');
          }
        }
      };

      const razorpayInstance = new window.Razorpay(options);

      razorpayInstance.on('payment.failed', function (failResponse) {
        console.error('Razorpay payment failed:', failResponse.error);
        setOrderError(
          `Payment failed: ${failResponse.error.description || 'Transaction unsuccessful'}. Your cart has not been cleared.`
        );
        setIsSubmitting(false);
      });

      razorpayInstance.open();
    } catch (err) {
      console.error('Checkout error:', err);
      setOrderError(err.response?.data?.message || 'Failed to initialize order payment.');
      setIsSubmitting(false);
    }
  };

  if (cartLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-600 font-semibold animate-pulse text-lg">
            Preparing Checkout...
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-1 max-w-xl mx-auto py-16 px-4 text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Cart is Empty</h2>
          <p className="text-gray-500 mb-6">
            You cannot proceed to checkout with an empty cart. Please add products to your cart first.
          </p>
          <Link
            to="/home"
            className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Checkout</h1>
            <p className="text-sm text-gray-500 mt-1">
              Please enter your delivery details to complete your order.
            </p>
          </div>
          <Link to="/cart" className="text-sm font-semibold text-indigo-600 hover:text-indigo-500">
            &larr; Back to Cart
          </Link>
        </div>

        {orderError && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm font-medium flex items-center justify-between">
            <span>{orderError}</span>
            <button
              onClick={() => setOrderError(null)}
              className="text-red-500 hover:text-red-700 font-bold ml-4"
            >
              &times;
            </button>
          </div>
        )}

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Shipping Address Form */}
          <div className="lg:col-span-7 bg-white rounded-xl p-6 sm:p-8 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6 pb-3 border-b border-gray-100 flex items-center gap-2">
              <span>📍</span> Shipping Details
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={shippingAddress.fullName}
                  onChange={handleChange}
                  placeholder="e.g. Aarav Sharma"
                  className={`w-full px-4 py-2.5 rounded-lg border text-sm transition focus:outline-none focus:ring-2 ${
                    errors.fullName
                      ? 'border-red-400 focus:ring-red-200'
                      : 'border-gray-300 focus:ring-indigo-200 focus:border-indigo-600'
                  }`}
                />
                {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={shippingAddress.phone}
                  onChange={handleChange}
                  placeholder="e.g. 9876543210"
                  className={`w-full px-4 py-2.5 rounded-lg border text-sm transition focus:outline-none focus:ring-2 ${
                    errors.phone
                      ? 'border-red-400 focus:ring-red-200'
                      : 'border-gray-300 focus:ring-indigo-200 focus:border-indigo-600'
                  }`}
                />
                {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Address Line 1 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="addressLine1"
                  value={shippingAddress.addressLine1}
                  onChange={handleChange}
                  placeholder="House/Flat No., Street, Landmark"
                  className={`w-full px-4 py-2.5 rounded-lg border text-sm transition focus:outline-none focus:ring-2 ${
                    errors.addressLine1
                      ? 'border-red-400 focus:ring-red-200'
                      : 'border-gray-300 focus:ring-indigo-200 focus:border-indigo-600'
                  }`}
                />
                {errors.addressLine1 && (
                  <p className="text-xs text-red-500 mt-1">{errors.addressLine1}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={shippingAddress.city}
                    onChange={handleChange}
                    placeholder="e.g. Bengaluru"
                    className={`w-full px-4 py-2.5 rounded-lg border text-sm transition focus:outline-none focus:ring-2 ${
                      errors.city
                        ? 'border-red-400 focus:ring-red-200'
                        : 'border-gray-300 focus:ring-indigo-200 focus:border-indigo-600'
                    }`}
                  />
                  {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    State <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={shippingAddress.state}
                    onChange={handleChange}
                    placeholder="e.g. Karnataka"
                    className={`w-full px-4 py-2.5 rounded-lg border text-sm transition focus:outline-none focus:ring-2 ${
                      errors.state
                        ? 'border-red-400 focus:ring-red-200'
                        : 'border-gray-300 focus:ring-indigo-200 focus:border-indigo-600'
                    }`}
                  />
                  {errors.state && <p className="text-xs text-red-500 mt-1">{errors.state}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Pincode <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    value={shippingAddress.pincode}
                    onChange={handleChange}
                    placeholder="6 digits"
                    maxLength={6}
                    className={`w-full px-4 py-2.5 rounded-lg border text-sm transition focus:outline-none focus:ring-2 ${
                      errors.pincode
                        ? 'border-red-400 focus:ring-red-200'
                        : 'border-gray-300 focus:ring-indigo-200 focus:border-indigo-600'
                    }`}
                  />
                  {errors.pincode && <p className="text-xs text-red-500 mt-1">{errors.pincode}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary & Payment Button */}
          <div className="lg:col-span-5 bg-white rounded-xl p-6 sm:p-8 shadow-sm border border-gray-100 sticky top-24">
            <h2 className="text-xl font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100 flex items-center gap-2">
              <span>🧾</span> Order Review
            </h2>

            <div className="max-h-60 overflow-y-auto divide-y divide-gray-100 mb-4">
              {cartItems.map((item) => {
                const product = item.product;
                if (!product) return null;
                return (
                  <div key={product._id} className="py-3 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded bg-gray-100 overflow-hidden shrink-0">
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 line-clamp-1">{product.name}</p>
                        <p className="text-xs text-gray-500">
                          Qty: {item.quantity} &times; ₹{product.price.toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-gray-900">
                      ₹{((product.price || 0) * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="pt-4 border-t border-gray-100 space-y-2.5 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Total Items</span>
                <span className="font-semibold text-gray-900">{cartItems.length}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Total Units</span>
                <span className="font-semibold text-gray-900">{totalUnits}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className="font-semibold text-green-600">FREE</span>
              </div>
              <div className="pt-3 border-t border-gray-100 flex justify-between items-center text-base">
                <span className="font-bold text-gray-900">Total Payable</span>
                <span className="text-2xl font-black text-indigo-600">
                  ₹{subtotal.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-6 py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold rounded-lg shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing Payment...</span>
                </>
              ) : (
                <>
                  <span>🔒 Pay with Razorpay</span>
                  <span>(₹{subtotal.toLocaleString('en-IN')})</span>
                </>
              )}
            </button>

            <p className="text-xs text-gray-400 text-center mt-3">
              Razorpay Test Mode &bull; No real money will be charged
            </p>
          </div>
        </form>
      </main>
    </div>
  );
};

export default Checkout;
