import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { notificationAPI, messageAPI } from '../api/api';
import { AdminNavbar } from './AdminNavbar';
import {
  LayoutDashboard,
  Users,
  Globe,
  CreditCard,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  ChevronDown,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  Home,
  MessageSquare,
  MessageCircle,
} from 'lucide-react';
import mainLogo from '../assets/main_logo.png';

export const AdminLayout = ({ children }) => {
  const { user, logout, hasPermission, hasAllPermissionsForSection } = useAuth();
  const { lastMessage } = useSocket();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0); // Notifications
  const [unreadMsgCount, setUnreadMsgCount] = useState(0); // Messages
  const location = useLocation();
  const currentPath = location.pathname;

  // Define menu items with their required permissions
  const allMenuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard', permission: 'dashboard_view', section: 'dashboard' },
    { icon: Users, label: 'Users', path: '/admin/users', permission: 'users_view', section: 'users' },
    { icon: Globe, label: 'Websites', path: '/admin/websites', permission: 'websites_view', section: 'websites' },
    { icon: CreditCard, label: 'Plans', path: '/admin/plans', permission: 'plans_view', section: 'plans' },
    { icon: ShoppingCart, label: 'Subscriptions', path: '/admin/subscriptions', permission: 'subscriptions_view', section: 'subscriptions' },
    { icon: MessageSquare, label: 'Notifications', path: '/admin/notifications', permission: null, section: null, badge: unreadCount }, // No permission check - accessible to all admins
    { icon: MessageCircle, label: 'Messages', path: '/admin/messages', permission: null, section: null, badge: unreadMsgCount }, // No permission check - accessible to all admins
    { icon: Settings, label: 'Settings', path: '/admin/settings', permission: 'settings_view', section: 'settings' },
  ];

  // Filter menu items based on permissions
  // Hide menu item if user doesn't have the required view permission
  const menuItems = allMenuItems
    .filter((item) => {
      // If permission is null, show to all admins (like Notifications)
      if (item.permission === null) {
        return true;
      }
      // If user doesn't have the view permission for this section, hide the menu item
      return hasPermission(item.permission);
    })
    .map((item) => ({
      ...item,
      active:
        currentPath === item.path || (item.path !== '/admin/dashboard' && currentPath.startsWith(item.path)),
    }));

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  useEffect(() => {
    // Fetch unread counts
    const fetchCounts = async () => {
      try {
        const [notifRes, msgRes] = await Promise.all([
          notificationAPI.unreadCount(),
          messageAPI.unreadCount()
        ]);
        setUnreadCount(notifRes.data?.count || 0);
        setUnreadMsgCount(msgRes.data?.total_unread || msgRes.data?.count || 0);
      } catch (error) {
        console.error('Failed to fetch unread counts:', error);
      }
    };

    fetchCounts();
    // Refresh every 30 seconds or when a new message arrives
    const interval = setInterval(fetchCounts, 30000);
    return () => clearInterval(interval);
  }, [lastMessage]);

  return (
    <div className="min-h-screen dark" style={{ backgroundColor: '#111828' }}>
      <AdminNavbar />

      {/* Sidebar - fixed below navbar, stays in place when scrolling */}
      <aside
        className={`group fixed top-[56px] left-0 z-40 transition-all duration-300 ease-in-out ${sidebarOpen ? 'w-56' : 'w-16'
          } bg-[#1E2938] h-[calc(100vh-56px)] ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
      >
        <div className="flex flex-col h-full relative">
          {/* Toggle Button - Shows on hover */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              setSidebarOpen(!sidebarOpen);
            }}
            className="absolute -right-6 top-3 z-50 p-1.5 rounded bg-[#1E2938] border border-[#3B414B] shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-white/70 hover:text-white hover:bg-white/10"
            title={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          >
            {sidebarOpen ? (
              <PanelLeftClose className="w-4 h-4" />
            ) : (
              <PanelLeftOpen className="w-4 h-4" />
            )}
          </button>
          {/* Navigation */}
          <nav className={`flex-1 py-2 overflow-y-auto pt-2 ${sidebarOpen ? 'px-2' : 'px-1'}`}>
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  to={item.path}
                  onClick={(e) => {
                    // Close mobile menu when clicking a link, but don't change sidebar state
                    // Prevent sidebar from opening when clicking menu items
                    e.stopPropagation();
                    setMobileMenuOpen(false);
                    // Don't change sidebarOpen state - keep it as is
                  }}
                  className={`relative flex items-center gap-3 py-2.5 rounded text-sm transition-colors ${sidebarOpen ? 'px-3' : 'px-2'
                    } ${item.active
                      ? 'bg-white/10 text-white'
                      : 'text-gray-300 hover:bg-white/5 hover:text-white'
                    } ${!sidebarOpen ? 'justify-center mx-auto w-10' : 'w-full'}`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {sidebarOpen && <span className="font-medium flex-1">{item.label}</span>}

                  {item.badge > 0 && (
                    <span className={`flex items-center justify-center min-w-[1.25rem] h-5 px-1 rounded-full text-[10px] font-black border transition-all duration-300 ${item.active
                      ? 'bg-white/20 border-white/30 text-white backdrop-blur-md shadow-[0_0_10px_rgba(255,255,255,0.2)]'
                      : 'bg-teal-500/15 border-teal-500/20 text-teal-400 backdrop-blur-md'
                      } ${!sidebarOpen ? 'absolute top-1 -right-1' : ''}`}>
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Sidebar Footer Logo */}
          <div className={`mt-auto pb-8 flex-shrink-0 flex justify-center items-center transition-all duration-300 ${sidebarOpen ? 'px-4 opacity-100' : 'px-2 opacity-60'}`}>
            <img
              src={mainLogo}
              alt="HAISO"
              className={`${sidebarOpen ? 'h-16' : 'h-12'} w-auto object-contain transition-all duration-300`}
            />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'md:ml-56' : 'md:ml-16'}`} style={{ paddingTop: '56px' }}>
        {/* Page Content */}
        <main className="min-h-[calc(100vh-60px)]" style={{ backgroundColor: '#111828' }}>{children}</main>
      </div>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        ></div>
      )}
    </div>
  );
};

