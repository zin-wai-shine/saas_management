import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaRocket } from 'react-icons/fa';

export const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="flex items-center justify-between px-8 py-6 bg-white bg-opacity-80 backdrop-blur-md sticky top-0 z-50 border-b border-emerald-muted">
      <div className="flex items-center space-x-2">
        <FaRocket className="text-teal-glass text-3xl" />
        <Link to="/" className="text-2xl font-bold tracking-wider text-teal-light">
          SaaS Agency
        </Link>
      </div>
      <div className="hidden md:flex space-x-8 text-sm font-medium text-teal-mist">
        <Link to="/" className="hover:text-teal-glass transition">Home</Link>
        <Link to="/gallery" className="hover:text-teal-glass transition">Demo Sites</Link>
        <Link to="/pricing" className="hover:text-teal-glass transition">Pricing</Link>
        <Link to="/contact" className="hover:text-teal-glass transition">Contact</Link>
      </div>
      <div className="flex items-center space-x-4">
        {user ? (
          <>
            <Link
              to={isAdmin() ? '/admin/dashboard' : '/owner/dashboard'}
              className="px-5 py-2 rounded-full bg-teal-glass text-white font-bold hover:bg-teal-mist transition"
            >
              Dashboard
            </Link>
            <button
              onClick={handleLogout}
              className="text-teal-mist hover:text-teal-glass transition"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-teal-mist hover:text-teal-glass transition">
              Login
            </Link>
            <Link
              to="/register"
              className="px-5 py-2 rounded-full bg-teal-glass text-white font-bold hover:bg-teal-mist transition"
            >
              Get Started
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

