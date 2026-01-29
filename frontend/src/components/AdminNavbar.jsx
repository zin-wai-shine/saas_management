import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { notificationAPI } from '../api/api';
import { FaUser, FaSignOutAlt, FaCog, FaHome, FaBell } from 'react-icons/fa';
import { Wifi, WifiOff } from 'lucide-react';

export const AdminNavbar = () => {
    const { user, logout, isAdmin } = useAuth();
    const { wsStatus } = useSocket();
    const navigate = useNavigate();
    const location = useLocation();
    const [scrolled, setScrolled] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const profileMenuRef = useRef(null);
    const [unreadCount, setUnreadCount] = useState(0);

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

    // Fetch notifications count
    useEffect(() => {
        const fetchUnreadCount = async () => {
            try {
                const response = await notificationAPI.unreadCount();
                setUnreadCount(response.data?.count || 0);
            } catch (error) {
                console.error('Failed to fetch unread count:', error);
            }
        };

        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleLogout = () => {
        setShowProfileMenu(false);
        logout();
        navigate('/');
    };

    return (
        <nav
            className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
            style={{
                fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                WebkitFontSmoothing: 'auto',
            }}
        >
            <div
                className="w-full flex items-center justify-between px-4 md:px-6 py-2 transition-all duration-300 relative"
                style={{
                    background: '#1E2938',
                    backdropFilter: 'blur(12px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(12px) saturate(180%)',
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
                        <span className="text-xs font-normal opacity-50 ml-2 text-white font-sans">ADMIN</span>
                    </Link>
                </div>

                {/* Right Side Actions */}
                <div className="flex items-center gap-4 relative z-10">
                    <Link
                        to="/"
                        className="p-1.5 rounded-full text-gray-300 hover:text-white hover:bg-white/5 transition-all outline-none"
                        title="Go to Home"
                    >
                        <FaHome className="text-lg" />
                    </Link>

                    <Link
                        to="/admin/notifications"
                        className="p-1.5 rounded-full text-gray-300 hover:text-white hover:bg-white/5 transition-all outline-none relative"
                        title="Notifications"
                    >
                        <FaBell className="text-lg" />
                        {unreadCount > 0 && (
                            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-[#1E2938] rounded-full animate-pulse" />
                        )}
                    </Link>

                    {/* Connection Status */}
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all ${wsStatus === 'connected'
                        ? 'bg-green-500/10 border-green-500/30 text-green-400'
                        : wsStatus === 'connecting'
                            ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
                            : 'bg-red-500/10 border-red-500/30 text-red-400'
                        }`}
                        title={`Real-time Status: ${wsStatus}`}
                    >
                        {wsStatus === 'connected' ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                    </div>

                    {user && (
                        <div className="relative" ref={profileMenuRef}>
                            <button
                                onClick={() => setShowProfileMenu(!showProfileMenu)}
                                className="w-10 h-10 rounded-full transition-all flex items-center justify-center border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10"
                            >
                                <FaUser className="text-white text-lg" />
                            </button>

                            {/* Profile Dropdown Menu */}
                            {showProfileMenu && (
                                <div
                                    className="absolute right-0 top-full mt-2 w-48 rounded-xl z-[60] overflow-hidden"
                                    style={{
                                        background: 'rgba(30, 41, 56, 0.95)',
                                        backdropFilter: 'blur(16px)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
                                    }}
                                >
                                    <div className="px-4 py-3 border-b border-white/10">
                                        <p className="text-xs text-gray-400">Signed in as</p>
                                        <p className="text-sm font-medium text-white truncate">{user.email}</p>
                                    </div>
                                    <Link
                                        to="/admin/settings"
                                        onClick={() => setShowProfileMenu(false)}
                                        className="block px-4 py-2.5 text-gray-300 hover:text-white hover:bg-white/5 transition-colors text-sm flex items-center gap-2"
                                    >
                                        <FaCog className="text-base" />
                                        Settings
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left px-4 py-2.5 text-gray-300 hover:text-white hover:bg-white/5 transition-colors text-sm flex items-center gap-2"
                                    >
                                        <FaSignOutAlt className="text-base" />
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </nav >
    );
};
