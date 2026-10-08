import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post('/logout');
      navigate('/login');
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  return (
    <nav className="bg-white shadow-md px-6 py-4 flex justify-between items-center sticky top-0 z-50">
      <Link to="/home" className="text-2xl font-bold text-blue-600">ShopKart</Link>
      <div className="flex items-center gap-4">
        <Link to="/home" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Products</Link>
        <Link to="/wishlist" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Wishlist</Link>
        <button 
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded transition-colors"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
