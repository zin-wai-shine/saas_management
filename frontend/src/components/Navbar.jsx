import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaRocket } from 'react-icons/fa';

export const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      setScrolled(isScrolled);
    };

    // Check initial scroll position
    handleScroll();

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Reset scroll state when navigating to a new page
  useEffect(() => {
    setScrolled(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className={`flex items-center justify-between px-8 py-5 sticky top-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-[#1E2938]/95 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-black/10' 
        : 'bg-transparent border-b border-transparent'
    }`}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-teal-500/20 backdrop-blur-md border border-teal-500/30 rounded-lg flex items-center justify-center shadow-sm">
          <FaRocket className="text-teal-400 text-xl" />
        </div>
        <Link to="/" className="text-xl font-bold text-white hover:text-teal-400 transition-colors tracking-tight">
          SaaS Agency
        </Link>
      </div>
      <div className="hidden md:flex gap-8 text-sm font-medium">
        <Link 
          to="/" 
          className="text-gray-300 hover:text-teal-400 transition-all duration-200 relative group"
        >
          Home
          <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-teal-400 group-hover:w-full transition-all duration-200"></span>
        </Link>
        <Link 
          to="/gallery" 
          className="text-gray-300 hover:text-teal-400 transition-all duration-200 relative group"
        >
          Demo Sites
          <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-teal-400 group-hover:w-full transition-all duration-200"></span>
        </Link>
        <Link 
          to="/pricing" 
          className="text-gray-300 hover:text-teal-400 transition-all duration-200 relative group"
        >
          Pricing
          <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-teal-400 group-hover:w-full transition-all duration-200"></span>
        </Link>
        <Link 
          to="/contact" 
          className="text-gray-300 hover:text-teal-400 transition-all duration-200 relative group"
        >
          Contact
          <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-teal-400 group-hover:w-full transition-all duration-200"></span>
        </Link>
      </div>
      <div className="flex items-center gap-3">
        {user ? (
          <>
            <Link
              to={isAdmin() ? '/admin/dashboard' : '/owner/dashboard'}
              className="px-5 py-2.5 rounded-lg bg-teal-500/20 backdrop-blur-md border border-teal-500/30 text-teal-400 font-semibold hover:bg-teal-500/30 hover:border-teal-500/50 transition-all text-sm shadow-sm"
            >
              Dashboard
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2.5 text-gray-300 hover:text-white transition-colors text-sm font-medium"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link 
              to="/login" 
              className="px-5 py-2.5 text-gray-300 hover:text-teal-400 transition-colors text-sm font-medium"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="px-5 py-2.5 rounded-lg bg-teal-500/20 backdrop-blur-md border border-teal-500/30 text-teal-400 font-semibold hover:bg-teal-500/30 hover:border-teal-500/50 transition-all text-sm shadow-sm"
            >
              Get Started
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

