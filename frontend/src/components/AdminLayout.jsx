import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Globe,
  CreditCard,
  Settings,
  LogOut,
  Menu,
  X,
  Search,
  Bell,
  ChevronDown,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const currentPath = location.pathname;

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: Users, label: 'Users', path: '/admin/users' },
    { icon: Globe, label: 'Websites', path: '/admin/websites' },
    { icon: CreditCard, label: 'Plans', path: '/admin/plans' },
    { icon: ShoppingCart, label: 'Subscriptions', path: '/admin/subscriptions' },
    { icon: Settings, label: 'Settings', path: '/admin/settings' },
  ].map((item) => ({
    ...item,
    active:
      currentPath === item.path || (item.path !== '/admin/dashboard' && currentPath.startsWith(item.path)),
  }));

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <div className="min-h-screen dark bg-gray-900">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen transition-all duration-200 ${
          sidebarOpen ? 'w-56' : 'w-16'
        } bg-[#2C323E] border-r border-[#3B414B] ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Navigation */}
          <nav className="flex-1 px-2 py-2 overflow-y-auto pt-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded text-sm transition-colors ${
                    item.active
                      ? 'bg-[#262B33] text-white'
                      : 'text-gray-300 hover:bg-[#262B33] hover:text-white'
                  } ${!sidebarOpen && 'justify-center'}`}
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
      <div className={`transition-all duration-200 ${sidebarOpen ? 'md:ml-56' : 'md:ml-16'}`}>
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-[#2C323E] border-b border-[#3B414B]">
          <div className="flex items-center justify-between px-6 py-3">
            <div className="flex items-center gap-4">
              {/* Logo */}
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-teal-glass rounded flex items-center justify-center">
                  <span className="text-white font-bold text-xs">SA</span>
                </div>
                <span className="text-sm font-semibold text-white">SaaS Admin</span>
              </div>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded hover:bg-[#262B33] text-gray-400 hover:text-white transition-colors"
              >
                {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded hover:bg-[#262B33] text-gray-400 hover:text-white md:hidden"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-[#262B33] rounded border border-[#3B414B] w-64">
                <Search className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search"
                  className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder-gray-500"
                />
              </div>

              {/* Notifications */}
              <button className="p-2 rounded hover:bg-[#262B33] text-gray-400 hover:text-white transition-colors">
                <Bell className="w-5 h-5" />
              </button>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1 rounded hover:bg-[#262B33] transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-teal-glass flex items-center justify-center text-white text-xs font-semibold">
                    {user?.name?.charAt(0) || 'A'}
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-[#2C323E] rounded border border-[#3B414B] shadow-lg py-1">
                    <div className="px-4 py-2 border-b border-[#3B414B]">
                      <p className="text-sm font-medium text-white">{user?.name || 'Admin'}</p>
                      <p className="text-xs text-gray-400">{user?.email || 'admin@saas.com'}</p>
                    </div>
                    <button
                      onClick={logout}
                      className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-[#262B33] flex items-center gap-2"
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

        {/* Page Content */}
        <main className="bg-gray-900">{children}</main>
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

