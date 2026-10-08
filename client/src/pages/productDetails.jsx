import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { productsApi, wishlistApi } from '../services/api';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [wishlistState, setWishlistState] = useState('default');

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const response = await productsApi.get(`/${id}`);
        setProduct(response.data.product);
      } catch (err) {
        console.error('Failed to fetch product details', err);
        if (err.response?.status === 400) {
          setError('Invalid product ID format.');
        } else if (err.response?.status === 404) {
          setError('Product not found.');
        } else {
          setError('Something went wrong while loading the product details.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [id]);

  const handleAddToWishlist = async () => {
    if (wishlistState === 'saving' || wishlistState === 'added') return;

    setWishlistState('saving');
    try {
      await wishlistApi.post(`/${id}`);
      setWishlistState('added');
    } catch (err) {
      console.error('Failed to add to wishlist', err);
      if (err.response?.status === 409) {
        setWishlistState('added');
      } else {
        setWishlistState('error');
        alert(err.response?.data?.message || 'Failed to add to wishlist');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center h-screen">
          <div className="text-xl text-gray-600 font-semibold animate-pulse">Loading product...</div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 p-4 rounded-md text-center">
            <h3 className="text-lg font-medium text-red-800">{error || 'Product not found'}</h3>
            <button 
              onClick={() => navigate('/home')}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        
        <button 
          onClick={() => navigate('/home')}
          className="mb-6 inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500"
        >
          &larr; Back to Products
        </button>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="md:flex">
            <div className="md:w-1/2 h-96 md:h-auto">
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="md:w-1/2 p-8 flex flex-col justify-center">
              <span className="inline-block px-3 py-1 text-sm font-semibold text-indigo-600 bg-indigo-100 rounded-full mb-4 self-start">
                {product.category}
              </span>
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-4">
                {product.name}
              </h2>
              <p className="text-xl text-gray-500 mb-6">
                {product.description}
              </p>
              
              <div className="flex items-center justify-between mb-8 pb-8 border-b border-gray-200">
                <span className="text-4xl font-black text-gray-900">${product.price.toFixed(2)}</span>
                <span className={`text-lg font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {product.stock > 0 ? `${product.stock} units available` : 'Out of stock'}
                </span>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  className={`flex-1 py-4 px-8 border border-transparent text-lg font-bold rounded-md text-white shadow-sm transition-colors ${
                    product.stock > 0 
                      ? 'bg-indigo-600 hover:bg-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500' 
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                  disabled={product.stock === 0}
                  onClick={() => alert('Added to cart! (UI Only)')}
                >
                  {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                </button>
                <button
                  onClick={handleAddToWishlist}
                  disabled={wishlistState === 'saving' || wishlistState === 'added'}
                  className="flex-1 py-4 px-8 border border-gray-300 bg-white text-lg font-bold text-gray-700 rounded-md hover:bg-gray-50 transition-colors flex justify-center items-center"
                >
                  {wishlistState === 'saving' ? '⏳ Saving...' :
                   wishlistState === 'added' ? '♥ Added to Wishlist' :
                   '♡ Add to Wishlist'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
