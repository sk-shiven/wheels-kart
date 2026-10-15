import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { ordersApi } from '../services/api';

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await ordersApi.get('/');
      setOrders(res.data.orders || []);
    } catch (err) {
      console.error('Failed to load orders', err);
      setError(err.response?.data?.message || 'Unable to retrieve your orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

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

      <main className="flex-1 max-w-5xl w-full mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">My Orders</h1>
            <p className="text-sm text-gray-500 mt-1">Review your past purchases and track order shipments.</p>
          </div>
          <Link to="/home" className="text-sm font-semibold text-indigo-600 hover:text-indigo-500">
            &larr; Browse Store
          </Link>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600 font-semibold animate-pulse">Loading orders history...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <div className="text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Unable to load orders</h2>
            <p className="text-gray-500 mb-6">{error}</p>
            <button
              onClick={fetchOrders}
              className="px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition cursor-pointer"
            >
              Try Again
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">You have not placed any orders yet</h2>
            <p className="text-gray-500 max-w-md mx-auto mb-8">
              Once you checkout and complete payment, your purchase history and tracking details will appear here.
            </p>
            <Link
              to="/home"
              className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition shadow-sm"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition"
              >
                {/* Header */}
                <div className="bg-gray-50/70 px-6 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-xs uppercase font-bold text-gray-400">Order Placed</p>
                      <p className="text-sm font-semibold text-gray-800">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="hidden sm:block border-l border-gray-200 h-8"></div>
                    <div>
                      <p className="text-xs uppercase font-bold text-gray-400">Total</p>
                      <p className="text-sm font-extrabold text-indigo-600">
                        ₹{order.totalAmount?.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 text-xs font-bold rounded-full border ${
                        statusColors[order.status] || 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {order.status}
                    </span>
                    <button
                      onClick={() => navigate(`/orders/${order._id}`)}
                      className="px-4 py-1.5 bg-white border border-gray-200 text-gray-700 hover:text-indigo-600 hover:border-indigo-300 text-sm font-semibold rounded-lg shadow-2xs transition cursor-pointer"
                    >
                      View Details &rarr;
                    </button>
                  </div>
                </div>

                {/* Body: Items Preview */}
                <div className="p-6">
                  <p className="text-xs font-mono text-gray-400 mb-3">Order #{order._id}</p>
                  <div className="divide-y divide-gray-100">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="py-3 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded bg-gray-100 overflow-hidden shrink-0">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">{item.name}</p>
                            <p className="text-xs text-gray-500">
                              Qty: {item.quantity} &bull; ₹{item.price?.toLocaleString('en-IN')} each
                            </p>
                          </div>
                        </div>
                        <span className="text-sm font-bold text-gray-900">
                          ₹{((item.price || 0) * item.quantity).toLocaleString('en-IN')}
                        </span>
                      </div>
                    ))}
                  </div>

                  {order.shippingAddress && (
                    <div className="mt-4 pt-3 border-t border-gray-50 text-xs text-gray-500">
                      Delivered to: <span className="font-medium text-gray-700">{order.shippingAddress.fullName}</span>, {order.shippingAddress.city} ({order.shippingAddress.pincode})
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Orders;
