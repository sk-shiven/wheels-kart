import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { wishlistApi } from '../services/api';

const Wishlist = () => {
  const navigate = useNavigate();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchWishlist = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const response = await wishlistApi.get('/');
      setWishlistItems(response.data.wishlist);
    } catch (err) {
      if (err.response && err.response.status === 401) {
        navigate('/login');
      } else {
        setError(true);
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchWishlist();
  }, [fetchWishlist]);

  const handleRemove = async (productId) => {
    try {
      await wishlistApi.delete(`/${productId}`);
      setWishlistItems(prev => prev.filter(item => item._id !== productId));
    } catch (err) {
      console.error('Failed to remove from wishlist', err);
      alert('Unable to remove product from wishlist');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-8">My Wishlist</h1>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-xl text-gray-600 font-semibold animate-pulse">Loading your wishlist...</div>
          </div>
        ) : error ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-xl text-red-600 mb-6">Unable to load wishlist.</p>
            <button
              onClick={fetchWishlist}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Try Again
            </button>
          </div>
        ) : wishlistItems.length === 0 ? (
          <div className="bg-white rounded-lg shadow py-16 px-4 text-center">
            <div className="text-6xl mb-4">❤️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your wishlist is empty</h2>
            <p className="text-gray-500 mb-8">Save products you love and find them here later.</p>
            <button
              onClick={() => navigate('/home')}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div>
            <p className="text-gray-600 mb-6">{wishlistItems.length} products saved</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {wishlistItems.map((product) => (
                <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col">
                  <div className="h-48 overflow-hidden bg-gray-200 cursor-pointer" onClick={() => navigate(`/products/${product._id}`)}>
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="inline-block px-2 py-1 text-xs font-semibold text-indigo-600 bg-indigo-100 rounded-full mb-2">
                        {product.category}
                      </span>
                      <h3 
                        className="text-lg font-bold text-gray-900 mb-1 cursor-pointer hover:text-indigo-600 transition-colors"
                        onClick={() => navigate(`/products/${product._id}`)}
                      >
                        {product.name}
                      </h3>
                    </div>

                    <div className="mt-4">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-xl font-extrabold text-gray-900">${product.price.toFixed(2)}</span>
                        <span className={`text-sm font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {product.stock > 0 ? `${product.stock} units left` : 'Out of stock'}
                        </span>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => navigate(`/products/${product._id}`)}
                          className="w-full bg-indigo-50 text-indigo-700 hover:bg-indigo-100 py-2 px-4 rounded-md font-medium transition-colors"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => handleRemove(product._id)}
                          className="w-full border border-red-300 bg-white text-red-600 hover:bg-red-50 py-2 px-4 rounded-md font-medium transition-colors"
                        >
                          Remove ♥
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
