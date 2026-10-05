import { useEffect, useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api, { productsApi } from '../services/api';

const Home = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [redirectToLogin, setRedirectToLogin] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  // Auth guard — redirect to /login if not authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await api.get('/getMe');
        setUser(response.data.user);
        setAuthLoading(false);
      } catch (err) {
        console.error('Not authenticated', err);
        setRedirectToLogin(true);
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    if (!authLoading) {
      fetchProducts();
    }
  }, [category, authLoading]);

  const fetchProducts = async (searchQuery = search) => {
    setLoading(true);
    setError(null);
    try {
      let url = '/?';
      if (searchQuery) url += `search=${searchQuery}&`;
      if (category !== 'All') url += `category=${category}&`;

      const response = await productsApi.get(url);
      setProducts(response.data.products);
    } catch (err) {
      console.error('Failed to fetch products', err);
      setError('Something went wrong while loading products.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  if (redirectToLogin) {
    return <Navigate to="/login" replace />;
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600 font-semibold animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Discover Toys & Cars</h1>

          <form onSubmit={handleSearchSubmit} className="flex flex-1 max-w-lg w-full gap-2">
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md px-4 py-2 border"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block sm:text-sm border-gray-300 rounded-md px-4 py-2 border bg-white"
            >
              <option value="All">All Categories</option>
              <option value="Cars">Cars</option>
              <option value="Toys">Toys</option>
            </select>
            <button type="submit" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
              Search
            </button>
          </form>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-xl text-gray-600 font-semibold animate-pulse">Loading products...</div>
          </div>
        ) : error ? (
          <div className="bg-red-50 p-4 rounded-md">
            <div className="text-red-700">{error}</div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <h3 className="mt-2 text-sm font-medium text-gray-900">No products found.</h3>
            <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter to find what you're looking for.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col">
                <div className="h-48 overflow-hidden bg-gray-200">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="inline-block px-2 py-1 text-xs font-semibold text-indigo-600 bg-indigo-100 rounded-full mb-2">
                      {product.category}
                    </span>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{product.name}</h3>
                    <p className="text-gray-500 text-sm line-clamp-2 mb-3">{product.description}</p>
                  </div>

                  <div className="mt-auto">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-xl font-extrabold text-gray-900">${product.price.toFixed(2)}</span>
                      <span className={`text-sm font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                      </span>
                    </div>
                    <button
                      onClick={() => navigate(`/products/${product._id}`)}
                      className="w-full bg-indigo-50 text-indigo-700 hover:bg-indigo-100 py-2 px-4 rounded-md font-medium transition-colors"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
