import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { notificationAPI } from '../api/api';
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

export const AdminLayout = ({ children }) => {
  const { user, logout, hasPermission, hasAllPermissionsForSection } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const location = useLocation();
  const currentPath = location.pathname;

  // Define menu items with their required permissions
  const allMenuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard', permission: 'dashboard_view', section: 'dashboard' },
    { icon: Users, label: 'Users', path: '/admin/users', permission: 'users_view', section: 'users' },
    { icon: Globe, label: 'Websites', path: '/admin/websites', permission: 'websites_view', section: 'websites' },
    { icon: CreditCard, label: 'Plans', path: '/admin/plans', permission: 'plans_view', section: 'plans' },
    { icon: ShoppingCart, label: 'Subscriptions', path: '/admin/subscriptions', permission: 'subscriptions_view', section: 'subscriptions' },
    { icon: MessageSquare, label: 'Notifications', path: '/admin/notifications', permission: null, section: null }, // No permission check - accessible to all admins
    { icon: MessageCircle, label: 'Messages', path: '/admin/messages', permission: null, section: null }, // No permission check - accessible to all admins
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
    // Fetch unread count
    const fetchUnreadCount = async () => {
      try {
        const response = await notificationAPI.unreadCount();
        setUnreadCount(response.data?.count || 0);
      } catch (error) {
        console.error('Failed to fetch unread count:', error);
      }
    };

    fetchUnreadCount();
    // Refresh every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen dark" style={{ backgroundColor: '#111828' }}>
      {/* Top Header - Full Width Blue Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#1E2938] h-[60px] flex items-center">
        <div className="flex items-center justify-between px-6 py-2.5 w-full h-full">
          <div className="flex items-center gap-3">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-teal-500/20 backdrop-blur-md border border-teal-500/30 rounded flex items-center justify-center">
                <span className="text-teal-400 font-bold text-sm">SA</span>
              </div>
              <span className="text-sm font-semibold text-white">saas.admin</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* User Interface Link */}
            <Link
              to="/"
              className="p-1.5 rounded text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              title="Go to User Interface"
            >
              <Home className="w-4 h-4" />
            </Link>

            {/* Notification Icon */}
            <button className="p-1.5 rounded text-white/70 hover:text-white hover:bg-white/10 transition-colors">
              <Bell className="w-4 h-4" />
            </button>

            {/* User Avatar */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="p-1 rounded-full hover:bg-white/10 transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-teal-500/10 backdrop-blur-md border border-teal-500/20 flex items-center justify-center text-teal-300 text-sm font-semibold">
                  {user?.name?.charAt(0) || 'A'}
                </div>
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 top-10 w-48 bg-[#1E2938] rounded border border-[#3B414B] shadow-lg py-1 z-50">
                <div className="px-4 py-2 border-b border-[#3B414B]">
                  <p className="text-sm font-medium text-white">{user?.name || 'Admin'}</p>
                  <p className="text-xs text-gray-400">{user?.email || 'admin@saas.com'}</p>
                </div>
                <button
                  onClick={logout}
                  className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/10 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar - fixed below navbar, stays in place when scrolling */}
      <aside
        className={`group fixed top-[60px] left-0 z-40 transition-all duration-300 ease-in-out ${
          sidebarOpen ? 'w-56' : 'w-16'
        } bg-[#1E2938] h-[calc(100vh-60px)] ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
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
                    className={`flex items-center gap-3 py-2.5 rounded text-sm transition-colors ${
                      sidebarOpen ? 'px-3' : 'px-2'
                    } ${
                      item.active
                        ? 'bg-white/10 text-white'
                        : 'text-gray-300 hover:bg-white/5 hover:text-white'
                    } ${!sidebarOpen ? 'justify-center mx-auto w-10' : 'w-full'}`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    {sidebarOpen && <span className="font-medium">{item.label}</span>}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'md:ml-56' : 'md:ml-16'}`} style={{ paddingTop: '60px' }}>
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

