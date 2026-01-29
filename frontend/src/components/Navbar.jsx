import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaArrowRight, FaUser, FaSignOutAlt, FaCog, FaSearch } from 'react-icons/fa';

export const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef(null);
  const [searchPlaceholder, setSearchPlaceholder] = useState('');
  const typingIndexRef = useRef(0);
  const isTypingRef = useRef(true);

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

  // Typing animation for search placeholder
  useEffect(() => {
    const fullText = 'Search...';
    let timeoutId;

    const typeText = () => {
      if (isTypingRef.current) {
        if (typingIndexRef.current < fullText.length) {
          setSearchPlaceholder(fullText.slice(0, typingIndexRef.current + 1));
          typingIndexRef.current++;
          timeoutId = setTimeout(typeText, 100);
        } else {
          // Wait before deleting
          timeoutId = setTimeout(() => {
            isTypingRef.current = false;
            typeText();
          }, 2000);
        }
      } else {
        if (typingIndexRef.current > 0) {
          setSearchPlaceholder(fullText.slice(0, typingIndexRef.current - 1));
          typingIndexRef.current--;
          timeoutId = setTimeout(typeText, 50);
        } else {
          // Wait before typing again
          timeoutId = setTimeout(() => {
            isTypingRef.current = true;
            typeText();
          }, 500);
        }
      }
    };

    typeText();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  const handleLogout = () => {
    setShowProfileMenu(false);
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;
  const isAuthPage = ['/login', '/register'].includes(location.pathname);

  return (
    <nav
      className="navbar-top-decorations fixed top-0 left-0 right-0 z-50 px-2 md:px-4 transition-all duration-300"
      style={{
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        WebkitFontSmoothing: 'auto',
      }}
    >
      <div
        className="navbar-widget max-w-[1400px] mx-auto flex items-center justify-between px-3 md:px-6 py-4 rounded-b-[2.5rem] transition-all duration-300 relative"
        style={{
          background: isAuthPage ? 'transparent' : 'rgba(30, 41, 56, 0.7)',
          backdropFilter: isAuthPage ? 'none' : 'blur(12px) saturate(180%)',
          WebkitBackdropFilter: isAuthPage ? 'none' : 'blur(12px) saturate(180%)',
          border: isAuthPage ? '1px solid transparent' : '1px solid rgba(255, 255, 255, 0.08)',
          borderTop: 'none',
          boxShadow: isAuthPage ? 'none' : '0 2px 8px rgba(0, 0, 0, 0.1)',
        }}
      >
        {/* Logo Section */}
        <div className="flex items-center gap-3 relative z-10 h-10">
          <Link
            to="/"
            className="flex items-center transition-colors hover:opacity-80"
            style={{ fontFamily: "'Exo 2', sans-serif" }}
          >
            <span className="text-2xl font-bold tracking-tight text-white">HAIZO</span>
          </Link>
        </div>



        {/* Navigation Links - Center */}
        {!isAuthPage && (
          <div className="hidden md:flex items-center gap-2 relative z-10">
            <Link
              to="/"
              className="relative pl-12 pr-4 py-2.5 rounded-full text-sm transition-all duration-200 outline-none cursor-pointer flex items-center text-white"
              style={{
                minWidth: '140px',
                width: '140px',
                background: 'rgba(30, 41, 56, 0.6)',
                backdropFilter: 'blur(8px) saturate(180%)',
                WebkitBackdropFilter: 'blur(8px) saturate(180%)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(30, 41, 56, 0.75)';
                e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(30, 41, 56, 0.6)';
                e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.08)';
              }}
            >
              <div
                className="absolute left-2 top-1/2 transform -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center"
                style={{
                  background: 'rgba(30, 41, 56, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <FaSearch className="text-white text-sm" />
              </div>
              <span className="text-sm text-gray-300">
                {searchPlaceholder}
                <span className="animate-pulse">|</span>
              </span>
            </Link>
            <Link
              to="/plans"
              className="px-4 py-2.5 rounded-3xl font-medium text-sm transition-colors duration-200 ease-in-out text-gray-300"
              style={{
                color: isActive('/plans') ? '#ffffff' : 'rgb(209, 213, 219)'
              }}
            >
              Plans
            </Link>
          </div>
        )}

        {/* Right Side Actions */}
        {!isAuthPage && (
          <div className="flex items-center gap-3 relative z-10">
            {user ? (
              <>
                <Link
                  to={isAdmin() ? '/admin/dashboard' : '/owner/dashboard'}
                  className="pl-3 pr-2 h-10 rounded-3xl text-white font-semibold transition-all text-sm flex items-center gap-2 group"
                  style={{
                    background: 'rgba(30, 41, 56, 0.7)',
                    backdropFilter: 'blur(8px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(8px) saturate(180%)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(30, 41, 56, 0.85)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(30, 41, 56, 0.7)';
                  }}
                >
                  Dashboard
                  <div className="h-8 w-8 rounded-full bg-white/20 border-t border-b border-white/30 flex items-center justify-center backdrop-blur-sm">
                    <FaArrowRight className="text-[10px] text-white group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Link>
                <div className="relative" ref={profileMenuRef}>
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="w-10 h-10 rounded-full transition-all flex items-center justify-center"
                    style={{
                      background: 'rgba(30, 41, 56, 0.5)',
                      backdropFilter: 'blur(8px)',
                      WebkitBackdropFilter: 'blur(8px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(30, 41, 56, 0.7)';
                      e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(30, 41, 56, 0.5)';
                      e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.1)';
                    }}
                  >
                    <FaUser className="text-white text-lg" />
                  </button>

                  {/* Profile Dropdown Menu */}
                  {showProfileMenu && (
                    <div
                      className="absolute right-0 top-full mt-2 w-40 rounded-3xl z-[60] overflow-hidden"
                      style={{
                        position: 'absolute',
                        background: 'rgba(30, 41, 56, 0.85)',
                        backdropFilter: 'blur(12px) saturate(180%)',
                        WebkitBackdropFilter: 'blur(12px) saturate(180%)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
                      }}
                    >
                      <Link
                        to="/settings"
                        onClick={() => setShowProfileMenu(false)}
                        className="block px-4 py-3 text-gray-300 hover:text-white transition-colors text-sm flex items-center gap-2 border-b border-white/10"
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(30, 41, 56, 0.6)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                        }}
                      >
                        <FaCog className="text-base" />
                        Settings
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-3 text-gray-300 hover:text-white transition-colors text-sm flex items-center gap-2"
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(30, 41, 56, 0.6)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                        }}
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
                  className="px-4 py-2.5 rounded-3xl text-gray-300 transition-all text-sm font-medium"
                  style={{
                    background: 'transparent',
                    border: '1px solid transparent',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(30, 41, 56, 0.5)';
                    e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.08)';
                    e.currentTarget.style.color = '#ffffff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.border = '1px solid transparent';
                    e.currentTarget.style.color = '#d1d5db';
                  }}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2.5 rounded-3xl text-white font-semibold transition-all text-sm flex items-center gap-2 group"
                  style={{
                    background: 'rgba(30, 41, 56, 0.7)',
                    backdropFilter: 'blur(8px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(8px) saturate(180%)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(30, 41, 56, 0.85)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(30, 41, 56, 0.7)';
                  }}
                >
                  Get Quote
                  <div className="w-6 h-6 rounded-full bg-white/20 border border-white/30 flex items-center justify-center backdrop-blur-sm">
                    <FaArrowRight className="text-[10px] text-white group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Link>
              </>
            )}
          </div>
        )}

        {/* Mobile Menu Button */}
        {!isAuthPage && (
          <div className="md:hidden relative z-10">
            <button className="text-gray-300 hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </nav >
  );
};

