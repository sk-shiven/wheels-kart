import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useCart } from '../context/CartContext';

const Cart = () => {
  const navigate = useNavigate();
  const {
    cartItems,
    loading,
    error,
    subtotal,
    totalUnits,
    updateQuantity,
    removeFromCart,
    fetchCart
  } = useCart();

  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [actionError, setActionError] = useState(null);

  const handleQuantityChange = async (productId, currentQuantity, change, maxStock) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity < 1) return;
    if (newQuantity > maxStock) {
      setActionError(`Cannot add more. Max stock available is ${maxStock}.`);
      setTimeout(() => setActionError(null), 3000);
      return;
    }

    setActionLoadingId(productId);
    setActionError(null);
    const res = await updateQuantity(productId, newQuantity);
    if (!res.success) {
      setActionError(res.message);
      setTimeout(() => setActionError(null), 4000);
    }
    setActionLoadingId(null);
  };

  const handleRemove = async (productId) => {
    setActionLoadingId(productId);
    setActionError(null);
    const res = await removeFromCart(productId);
    if (!res.success) {
      setActionError(res.message);
      setTimeout(() => setActionError(null), 4000);
    }
    setActionLoadingId(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Shopping Cart</h1>
          <Link
            to="/home"
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-500"
          >
            &larr; Continue Shopping
          </Link>
        </div>

        {actionError && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm font-medium flex items-center justify-between">
            <span>{actionError}</span>
            <button
              onClick={() => setActionError(null)}
              className="text-red-500 hover:text-red-700 font-bold ml-4"
            >
              &times;
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-lg font-medium text-gray-600 animate-pulse">Loading your cart...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <div className="text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Unable to load your cart</h2>
            <p className="text-gray-500 mb-6">{error}</p>
            <button
              onClick={fetchCart}
              className="inline-flex items-center px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition shadow-sm cursor-pointer"
            >
              Try Again
            </button>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-500 max-w-md mx-auto mb-8">
              Looks like you haven&apos;t added any hot wheels or toys yet. Start exploring our collection!
            </p>
            <Link
              to="/home"
              className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-sm hover:bg-indigo-700 transition"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Cart Items List */}
            <div className="lg:col-span-8 space-y-4">
              {cartItems.map((item) => {
                const product = item.product;
                if (!product) return null;
                const isItemBusy = actionLoadingId === product._id;
                const itemTotal = (product.price || 0) * item.quantity;
                const isMaxStockReached = item.quantity >= product.stock;

                return (
                  <div
                    key={product._id}
                    className={`bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center gap-5 transition ${
                      isItemBusy ? 'opacity-60 pointer-events-none' : ''
                    }`}
                  >
                    <div className="w-28 h-28 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0 w-full text-center sm:text-left">
                      <Link
                        to={`/products/${product._id}`}
                        className="text-lg font-bold text-gray-900 hover:text-indigo-600 transition truncate block"
                      >
                        {product.name}
                      </Link>
                      <p className="text-sm text-gray-500 capitalize">{product.category}</p>
                      <p className="text-sm font-semibold text-gray-900 mt-1">
                        ₹{product.price.toLocaleString('en-IN')} each
                      </p>
                      <p
                        className={`text-xs mt-1 font-medium ${
                          product.stock > 0 ? 'text-green-600' : 'text-red-500'
                        }`}
                      >
                        {product.stock > 0 ? `${product.stock} units in stock` : 'Out of stock'}
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex flex-col items-center sm:items-end gap-3 w-full sm:w-auto">
                      <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white">
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(product._id, item.quantity, -1, product.stock)}
                          disabled={item.quantity <= 1 || isItemBusy}
                          className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed font-bold transition cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          -
                        </button>
                        <span className="px-4 py-1.5 text-sm font-bold text-gray-900 min-w-10 text-center">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(product._id, item.quantity, 1, product.stock)}
                          disabled={isMaxStockReached || isItemBusy}
                          className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed font-bold transition cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="text-base font-extrabold text-gray-900">
                          ₹{itemTotal.toLocaleString('en-IN')}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemove(product._id)}
                          disabled={isItemBusy}
                          className="text-xs font-semibold text-red-500 hover:text-red-700 hover:underline transition cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-4 bg-white rounded-xl p-6 shadow-sm border border-gray-100 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 pb-4 border-b border-gray-100">
                Order Summary
              </h2>

              <div className="py-4 space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Total Items</span>
                  <span className="font-semibold text-gray-900">{cartItems.length}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Total Units</span>
                  <span className="font-semibold text-gray-900">{totalUnits}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery</span>
                  <span className="font-semibold text-green-600">FREE</span>
                </div>
                <div className="pt-3 border-t border-gray-100 flex justify-between items-center text-base">
                  <span className="font-bold text-gray-900">Subtotal</span>
                  <span className="text-2xl font-black text-indigo-600">
                    ₹{subtotal.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate('/checkout')}
                disabled={cartItems.length === 0}
                className="w-full mt-6 py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-lg shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <span>&rarr;</span>
              </button>

              <p className="text-xs text-gray-400 text-center mt-3">
                Secure checkout powered by Razorpay Test Mode
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Cart;
