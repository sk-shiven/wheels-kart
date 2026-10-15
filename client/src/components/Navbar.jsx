import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const navigate = useNavigate();
  const { totalUnits, clearCartState } = useCart();

  const handleLogout = async () => {
    try {
      await api.post('/logout');
      clearCartState();
      navigate('/login');
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  return (
    <nav className="bg-white shadow-md px-6 py-4 flex justify-between items-center sticky top-0 z-50">
      <Link to="/home" className="text-2xl font-bold text-blue-600 tracking-tight flex items-center gap-2">
        <span>🏎️</span>
        <span>ShopKart</span>
      </Link>
      <div className="flex items-center gap-5">
        <Link to="/home" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
          Products
        </Link>
        <Link to="/wishlist" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
          Wishlist
        </Link>
        <Link to="/cart" className="text-gray-700 hover:text-blue-600 font-medium transition-colors flex items-center gap-1.5">
          <span>Cart</span>
          <span className="inline-flex items-center justify-center bg-indigo-600 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-5">
            {totalUnits}
          </span>
        </Link>
        <Link to="/orders" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
          Orders
        </Link>
        <button 
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white font-medium py-1.5 px-3.5 rounded text-sm transition-colors cursor-pointer"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
