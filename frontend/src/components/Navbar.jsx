import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaRocket, FaArrowRight, FaUser, FaSignOutAlt, FaCog, FaSearch } from 'react-icons/fa';

export const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef(null);

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

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    setShowProfileMenu(false);
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar-top-decorations fixed top-0 left-0 right-0 z-50 px-2 md:px-4 transition-all duration-300">
      <div 
        className="navbar-widget max-w-7xl mx-auto flex items-center justify-between px-3 md:px-6 py-4 rounded-b-[2.5rem] transition-all duration-300 relative"
        style={{
          background: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        }}
      >
        {/* Logo Section */}
      <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 bg-[#00D5BE]/10 border border-[#00D5BE]/20 rounded-xl flex items-center justify-center">
            <FaRocket className="text-[#00D5BE] text-xl" />
        </div>
          <Link 
            to="/" 
            className="text-2xl font-bold text-gray-900 hover:text-[#00D5BE] transition-colors tracking-tight"
            style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
          >
          HAISO
        </Link>
      </div>

        {/* Navigation Links - Center */}
        <div className="hidden md:flex items-center gap-2 relative z-10">
        <Link 
          to="/"
          onClick={() => {
            // Focus main search input when clicked
            setTimeout(() => {
              const mainSearchInput = document.querySelector('input[placeholder*="Search for your business"]');
              if (mainSearchInput) {
                mainSearchInput.focus();
              }
            }, 100);
          }}
          className="relative pl-10 pr-4 py-2.5 rounded-full text-sm transition-all duration-200 outline-none cursor-pointer flex items-center bg-[#00D5BE]/10 text-gray-700 hover:bg-[#00D5BE]/20 hover:text-gray-900"
          style={{
            minWidth: '140px',
            width: '140px',
          }}
        >
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
          <span className="text-sm">Search...</span>
        </Link>
        <Link 
          to="/gallery" 
            className={`
              px-4 py-2.5 rounded-3xl font-medium text-sm transition-all duration-200
              ${isActive('/gallery') 
                ? 'bg-[#00D5BE] text-white shadow-lg shadow-[#00D5BE]/40 hover:bg-[#00B8A3] hover:shadow-xl hover:shadow-[#00D5BE]/50' 
                : 'text-gray-700 hover:text-[#00D5BE] hover:bg-[#00D5BE]/10 hover:backdrop-blur-sm'
              }
            `}
        >
          Demo Sites
        </Link>
        <Link 
          to="/pricing" 
            className={`
              px-4 py-2.5 rounded-3xl font-medium text-sm transition-all duration-200
              ${isActive('/pricing') 
                ? 'bg-[#00D5BE] text-white shadow-lg shadow-[#00D5BE]/40 hover:bg-[#00B8A3] hover:shadow-xl hover:shadow-[#00D5BE]/50' 
                : 'text-gray-700 hover:text-[#00D5BE] hover:bg-[#00D5BE]/10 hover:backdrop-blur-sm'
              }
            `}
        >
          Pricing
        </Link>
        <Link 
          to="/contact" 
            className={`
              px-4 py-2.5 rounded-3xl font-medium text-sm transition-all duration-200
              ${isActive('/contact') 
                ? 'bg-[#00D5BE] text-white shadow-lg shadow-[#00D5BE]/40 hover:bg-[#00B8A3] hover:shadow-xl hover:shadow-[#00D5BE]/50' 
                : 'text-gray-700 hover:text-[#00D5BE] hover:bg-[#00D5BE]/10 hover:backdrop-blur-sm'
              }
            `}
        >
          Contact
        </Link>
      </div>

        {/* Right Side Actions */}
      <div className="flex items-center gap-3 relative z-10">
        {user ? (
          <>
            <Link
              to={isAdmin() ? '/admin/dashboard' : '/owner/dashboard'}
                className="px-5 py-2.5 rounded-3xl bg-[#00D5BE] text-white font-semibold hover:bg-[#00B8A3] transition-all text-sm shadow-lg shadow-[#00D5BE]/40 hover:shadow-xl hover:shadow-[#00D5BE]/50 flex items-center gap-2 group"
            >
              Dashboard
                <div className="w-6 h-6 rounded-full bg-white/20 border border-white/30 flex items-center justify-center backdrop-blur-sm">
                  <FaArrowRight className="text-[10px] text-white group-hover:translate-x-0.5 transition-transform" />
                </div>
            </Link>
            <div className="relative" ref={profileMenuRef}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="w-10 h-10 rounded-full bg-[#00D5BE]/10 border border-[#00D5BE]/20 hover:bg-[#00D5BE]/20 hover:border-[#00D5BE]/30 transition-all flex items-center justify-center"
              >
                <FaUser className="text-[#00D5BE] text-lg" />
              </button>
              
              {/* Profile Dropdown Menu */}
              {showProfileMenu && (
                <div 
                  className="absolute right-0 top-full mt-2 w-40 rounded-3xl z-[60] overflow-hidden"
                  style={{ 
                    position: 'absolute',
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.1)'
                  }}
                >
                  <Link
                    to="/settings"
                    onClick={() => setShowProfileMenu(false)}
                    className="block px-4 py-3 text-gray-700 hover:bg-[#00D5BE]/10 hover:text-[#00D5BE] transition-colors text-sm flex items-center gap-2 border-b border-gray-100"
                  >
                    <FaCog className="text-base" />
                    Settings
            </Link>
            <button
              onClick={handleLogout}
                    className="w-full text-left px-4 py-3 text-gray-700 hover:bg-[#00D5BE]/10 hover:text-[#00D5BE] transition-colors text-sm flex items-center gap-2"
            >
                    <FaSignOutAlt className="text-base" />
              Logout
            </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <Link 
              to="/login" 
                className="px-4 py-2.5 rounded-3xl text-gray-700 hover:text-[#00D5BE] hover:bg-[#00D5BE]/10 hover:backdrop-blur-sm transition-all text-sm font-medium"
            >
              Login
            </Link>
            <Link
              to="/register"
                className="px-5 py-2.5 rounded-3xl bg-[#00D5BE] text-white font-semibold hover:bg-[#00B8A3] transition-all text-sm shadow-lg shadow-[#00D5BE]/40 hover:shadow-xl hover:shadow-[#00D5BE]/50 flex items-center gap-2 group"
            >
                Get Quote
                <div className="w-6 h-6 rounded-full bg-white/20 border border-white/30 flex items-center justify-center backdrop-blur-sm">
                  <FaArrowRight className="text-[10px] text-white group-hover:translate-x-0.5 transition-transform" />
                </div>
            </Link>
          </>
        )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden relative z-10">
          <button className="text-gray-700 hover:text-[#00D5BE] transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
};

