import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { ordersApi } from '../services/api';

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusUpdating, setStatusUpdating] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await ordersApi.get(`/${id}`);
        setOrder(res.data.order);
      } catch (err) {
        console.error('Failed to load order', err);
        setError(err.response?.data?.message || 'Could not find the requested order.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const handleStatusProgress = async (newStatus) => {
    setStatusUpdating(true);
    try {
      const res = await ordersApi.patch(`/${id}/status`, { status: newStatus });
      setOrder(res.data.order);
    } catch (err) {
      console.error('Failed to update status', err);
      alert(err.response?.data?.message || 'Failed to update order status');
    } finally {
      setStatusUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-600 font-semibold animate-pulse text-lg">
            Loading order details...
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-1 max-w-xl mx-auto py-16 px-4 text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h2>
          <p className="text-gray-500 mb-6">{error || 'Unable to locate order.'}</p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => navigate('/orders')}
              className="px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition"
            >
              View My Orders
            </button>
            <button
              onClick={() => navigate('/home')}
              className="px-5 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition"
            >
              Back to Store
            </button>
          </div>
        </div>
      </div>
    );
  }

  const statusColors = {
    PLACED: 'bg-blue-100 text-blue-800 border-blue-200',
    CONFIRMED: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    SHIPPED: 'bg-amber-100 text-amber-800 border-amber-200',
    DELIVERED: 'bg-green-100 text-green-800 border-green-200',
    PENDING_PAYMENT: 'bg-yellow-100 text-yellow-800 border-yellow-200'
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto py-10 px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 text-green-600 rounded-full text-3xl mb-4">
            ✓
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Order Placed Successfully!</h1>
          <p className="text-gray-500 max-w-md mx-auto text-sm">
            Thank you for shopping with ShopKart. Your order has been registered and is being processed.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              to="/orders"
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg shadow-sm transition"
            >
              View My Orders
            </Link>
            <Link
              to="/home"
              className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-lg transition"
            >
              Continue Shopping
            </Link>
          </div>
        </div>

        {/* Order Details Card */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 space-y-8">
          {/* Metadata Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-gray-100">
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold">Order Reference</p>
              <p className="text-lg font-mono font-bold text-gray-900">{order._id}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold">Order Date</p>
              <p className="text-sm font-medium text-gray-700">
                {new Date(order.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1">Status</p>
              <span
                className={`inline-block px-3 py-1 text-xs font-bold rounded-full border ${
                  statusColors[order.status] || 'bg-gray-100 text-gray-800'
                }`}
              >
                {order.status}
              </span>
            </div>
          </div>

          {/* Payment & Shipping info grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-xl bg-gray-50 border border-gray-100">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">
                📍 Delivery Address
              </h3>
              <p className="text-sm font-semibold text-gray-800">{order.shippingAddress?.fullName}</p>
              <p className="text-sm text-gray-600">{order.shippingAddress?.addressLine1}</p>
              <p className="text-sm text-gray-600">
                {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
              </p>
              <p className="text-sm text-gray-500 mt-2 font-medium">📞 {order.shippingAddress?.phone}</p>
            </div>

            <div className="p-5 rounded-xl bg-gray-50 border border-gray-100">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">
                💳 Payment Information
              </h3>
              <p className="text-sm text-gray-600">
                Method: <span className="font-semibold text-gray-800">Razorpay (Test Mode)</span>
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Payment Status:{' '}
                <span className="font-bold text-green-600 uppercase">{order.paymentStatus}</span>
              </p>
              {order.razorpayPaymentId && (
                <p className="text-xs font-mono text-gray-500 mt-1 truncate">
                  Payment ID: {order.razorpayPaymentId}
                </p>
              )}
              {order.razorpayOrderId && (
                <p className="text-xs font-mono text-gray-500 mt-0.5 truncate">
                  Razorpay Order: {order.razorpayOrderId}
                </p>
              )}
            </div>
          </div>

          {/* Items Snapshot Table */}
          <div>
            <h3 className="text-base font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
              Purchased Items (Price Snapshot)
            </h3>
            <div className="divide-y divide-gray-100">
              {order.items?.map((item, index) => (
                <div key={index} className="py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-500">
                        ₹{item.price.toLocaleString('en-IN')} &times; {item.quantity} unit{item.quantity > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <span className="text-base font-extrabold text-gray-900">
                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-6 border-t border-gray-100 flex justify-between items-center">
              <span className="text-lg font-bold text-gray-900">Total Paid</span>
              <span className="text-2xl font-black text-indigo-600">
                ₹{order.totalAmount?.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Bonus status progression controls for evaluation testing */}
          <div className="pt-6 border-t border-dashed border-gray-200">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              🧪 Lab 06 Bonus: Order Status Progression Simulation
            </p>
            <div className="flex flex-wrap gap-2">
              {['PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED'].map((st) => (
                <button
                  key={st}
                  onClick={() => handleStatusProgress(st)}
                  disabled={order.status === st || statusUpdating}
                  className={`px-3 py-1 rounded text-xs font-bold transition cursor-pointer ${
                    order.status === st
                      ? 'bg-gray-800 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Mark {st}
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OrderDetails;
