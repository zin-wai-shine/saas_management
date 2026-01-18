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
  PanelLeftClose,
  PanelLeftOpen,
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
      {/* Top Header - Full Width Blue Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#2C323E] h-[50px] flex items-center">
        <div className="flex items-center justify-between px-6 py-2.5 w-full h-full">
          <div className="flex items-center gap-3">
            {/* Sidebar Toggle Button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/70 hover:text-white"
              title={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
            >
              {sidebarOpen ? (
                <PanelLeftClose className="w-5 h-5" />
              ) : (
                <PanelLeftOpen className="w-5 h-5" />
              )}
            </button>
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-teal-glass rounded flex items-center justify-center">
                <span className="text-white font-bold text-xs">SA</span>
              </div>
              <span className="text-sm font-semibold text-white">saas.admin</span>
            </div>
            <span className="px-2 py-0.5 bg-purple-600 rounded-full text-xs font-medium text-white">PERSONAL</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Search - Center */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded border border-white/20 w-80">
              <Search className="w-4 h-4 text-white/70" />
              <input
                type="text"
                placeholder="Search"
                className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder-white/60"
              />
            </div>
            <button className="hidden md:flex items-center justify-center w-6 h-6 rounded text-white/70 hover:text-white hover:bg-white/10">
              <span className="text-xs">⌘K</span>
            </button>

            {/* Icons */}
            <button className="p-1.5 rounded text-white/70 hover:text-white hover:bg-white/10 transition-colors">
              <span className="text-sm">?</span>
            </button>
            <button className="p-1.5 rounded text-white/70 hover:text-white hover:bg-white/10 transition-colors">
              <Bell className="w-4 h-4" />
            </button>
            <button className="p-1.5 rounded text-white/70 hover:text-white hover:bg-white/10 transition-colors">
              <span className="text-sm">🎓</span>
            </button>
            <button className="p-1.5 rounded text-white/70 hover:text-white hover:bg-white/10 transition-colors">
              <Settings className="w-4 h-4" />
            </button>
            <button className="p-1.5 rounded text-white/70 hover:text-white hover:bg-white/10 transition-colors">
              <span className="text-sm">⚙</span>
            </button>

            {/* User Avatar */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="p-1 rounded-full hover:bg-white/10 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-teal-glass flex items-center justify-center text-white text-xs font-semibold">
                  {user?.name?.charAt(0) || 'A'}
                </div>
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 top-10 w-48 bg-[#2C323E] rounded border border-[#3B414B] shadow-lg py-1 z-50">
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

      {/* Sidebar - fixed below navbar, stays in place when scrolling */}
      <aside
        className={`group fixed top-[50px] left-0 z-40 transition-all duration-300 ease-in-out ${
          sidebarOpen ? 'w-56' : 'w-16'
        } bg-[#2C323E] border-r border-[#3B414B] shadow-xl h-[calc(100vh-50px)] ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
          <div className="flex flex-col h-full relative">
            {/* Toggle Button - Shows on hover */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="absolute -right-3 top-4 z-50 p-1.5 rounded-lg bg-[#2C323E] border border-[#3B414B] shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-white/70 hover:text-white hover:bg-[#262B33]"
              title={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
            >
              {sidebarOpen ? (
                <PanelLeftClose className="w-4 h-4" />
              ) : (
                <PanelLeftOpen className="w-4 h-4" />
              )}
            </button>
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
      <div className={`transition-all duration-300 ${sidebarOpen ? 'md:ml-56' : 'md:ml-16'}`} style={{ paddingTop: '50px' }}>
        {/* Page Content */}
        <main className="bg-gray-900 min-h-[calc(100vh-50px)]">{children}</main>
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

