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
  TrendingUp,
  TrendingDown,
  User,
  ShoppingCart,
  DollarSign,
  Activity,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  Home,
  MessageSquare,
  MessageCircle,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// Mock data
const revenueData = [
  { month: 'Jan', revenue: 4500 },
  { month: 'Feb', revenue: 5200 },
  { month: 'Mar', revenue: 4800 },
  { month: 'Apr', revenue: 6100 },
  { month: 'May', revenue: 5500 },
  { month: 'Jun', revenue: 6700 },
  { month: 'Jul', revenue: 7200 },
  { month: 'Aug', revenue: 6800 },
  { month: 'Sep', revenue: 7500 },
  { month: 'Oct', revenue: 8200 },
  { month: 'Nov', revenue: 7900 },
  { month: 'Dec', revenue: 9100 },
];

const categoryData = [
  { category: 'Consulting', value: 45 },
  { category: 'Marketing', value: 30 },
  { category: 'Technology', value: 25 },
];

const pieColors = ['#14b8a6', '#5eead4', '#99f6e4'];

const recentActivity = [
  { id: 1, user: 'John Doe', action: 'Created business', date: '2026-01-18', status: 'completed' },
  { id: 2, user: 'Jane Smith', action: 'Updated website', date: '2026-01-18', status: 'completed' },
  { id: 3, user: 'Bob Johnson', action: 'Subscribed to plan', date: '2026-01-17', status: 'completed' },
  { id: 4, user: 'Alice Brown', action: 'Registered account', date: '2026-01-17', status: 'pending' },
  { id: 5, user: 'Charlie Wilson', action: 'Updated subscription', date: '2026-01-16', status: 'completed' },
  { id: 6, user: 'Diana Prince', action: 'Created website', date: '2026-01-16', status: 'completed' },
  { id: 7, user: 'Eve Adams', action: 'Cancelled subscription', date: '2026-01-15', status: 'cancelled' },
  { id: 8, user: 'Frank Miller', action: 'Updated business', date: '2026-01-15', status: 'completed' },
];

export const AdminDashboard = ({ children }) => {
  const { user, logout, hasPermission } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const location = useLocation();
  const currentPath = location.pathname;

  // Mock metrics
  const metrics = [
    {
      title: 'Total Users',
      value: '1,234',
      change: '+12.5%',
      trend: 'up',
      icon: Users,
      color: 'bg-blue-500',
      permission: 'dashboard_users_metric',
    },
    {
      title: 'Revenue',
      value: '฿45,678',
      change: '+8.2%',
      trend: 'up',
      icon: DollarSign,
      color: 'bg-green-500',
      permission: 'dashboard_revenue_metric',
    },
    {
      title: 'Active Subscriptions',
      value: '892',
      change: '+5.1%',
      trend: 'up',
      icon: ShoppingCart,
      color: 'bg-purple-500',
      permission: 'dashboard_subscriptions_metric',
    },
    {
      title: 'Growth Rate',
      value: '24.3%',
      change: '+2.4%',
      trend: 'up',
      icon: Activity,
      color: 'bg-orange-500',
      permission: 'dashboard_growth_metric',
    },
  ];

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

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const getStatusBadge = (status) => {
    const styles = {
      completed: 'bg-green-900/20 backdrop-blur-md border border-green-700/30 text-green-400',
      pending: 'bg-yellow-900/20 backdrop-blur-md border border-yellow-700/30 text-yellow-400',
      cancelled: 'bg-red-900/20 backdrop-blur-md border border-red-700/30 text-red-400',
    };

    const icons = {
      completed: CheckCircle2,
      pending: Clock,
      cancelled: XCircle,
    };

    const Icon = icons[status] || Clock;

    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-medium ${styles[status] || styles.pending}`}
      >
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="min-h-screen dark bg-gray-900">
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
            <button
              onClick={() => navigate('/admin/notifications')}
              className="relative p-1.5 rounded text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
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
        {/* Dashboard Content */}
        <main className="p-6 bg-gray-900">
          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 w-full">
            {metrics
              .filter((metric) => {
                // Show metrics based on specific permissions
                return !metric.permission || hasPermission(metric.permission);
              })
              .map((metric) => {
              const Icon = metric.icon;
              const isRevenue = metric.title === 'Revenue';
              // Glass design color variants for icons
              const glassColors = {
                'bg-blue-500': 'bg-blue-500/20 border-blue-500/30 text-blue-400',
                'bg-green-500': 'bg-green-500/20 border-green-500/30 text-green-400',
                'bg-purple-500': 'bg-purple-500/20 border-purple-500/30 text-purple-400',
                'bg-orange-500': 'bg-orange-500/20 border-orange-500/30 text-orange-400',
              };
              const glassClass = glassColors[metric.color] || 'bg-gray-500/20 border-gray-500/30 text-gray-400';
              
              return (
                <div
                  key={metric.title}
                  className="bg-gray-800 border border-gray-700 rounded p-3 w-full"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className={`w-10 h-10 flex items-center justify-center rounded border backdrop-blur-md ${glassClass}`}>
                      {isRevenue ? (
                        <span className="text-lg font-semibold">฿</span>
                      ) : (
                        <Icon className="w-5 h-5" />
                      )}
                    </div>
                    {metric.trend === 'up' ? (
                      <TrendingUp className="w-4 h-4 text-green-500 flex-shrink-0" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-500 flex-shrink-0" />
                    )}
                  </div>
                  <h3 className="text-xs font-medium text-gray-400 mb-1.5">{metric.title}</h3>
                  <p className="text-xl font-semibold text-white mb-1.5">{metric.value}</p>
                  <p className={`text-xs ${metric.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                    {metric.change} from last month
                  </p>
                </div>
              );
            })}
          </div>

          {/* Charts Section */}
          {(hasPermission('dashboard_revenue_chart') || hasPermission('dashboard_category_chart')) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            {/* Revenue Chart */}
              {hasPermission('dashboard_revenue_chart') && (
            <div className="bg-gray-800 border border-gray-700 rounded p-4">
                  <h3 className="text-xs font-semibold text-white mb-4">Revenue Overview</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="month" 
                    stroke="#9ca3af" 
                    tick={{ fontSize: 12, fill: '#9ca3af' }}
                  />
                  <YAxis 
                    stroke="#9ca3af" 
                    tick={{ fontSize: 12, fill: '#9ca3af' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(31, 41, 55, 0.95)',
                      backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '4px',
                      fontSize: '12px',
                      color: '#e5e7eb',
                    }}
                    itemStyle={{ color: '#e5e7eb' }}
                    labelStyle={{ color: '#9ca3af' }}
                    cursor={{ stroke: 'rgba(20, 184, 166, 0.4)', strokeWidth: 1, strokeDasharray: '5 5' }}
                  />
                  <Legend 
                    wrapperStyle={{ fontSize: '12px', color: '#9ca3af' }}
                    iconType="circle"
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="rgba(20, 184, 166, 0.7)"
                    strokeWidth={2.5}
                    dot={{ fill: 'rgba(20, 184, 166, 0.8)', r: 4, strokeWidth: 0 }}
                    activeDot={{ r: 5, fill: 'rgba(94, 234, 212, 0.7)', stroke: 'rgba(20, 184, 166, 0.6)', strokeWidth: 1.5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
              )}

            {/* Category Performance */}
              {hasPermission('dashboard_category_chart') && (
            <div className="bg-gray-800 border border-gray-700 rounded p-4">
                  <h3 className="text-xs font-semibold text-white mb-4">Category Performance</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="category" 
                    stroke="#9ca3af" 
                    tick={{ fontSize: 12, fill: '#9ca3af' }}
                  />
                  <YAxis 
                    stroke="#9ca3af" 
                    tick={{ fontSize: 12, fill: '#9ca3af' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(31, 41, 55, 0.95)',
                      backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '4px',
                      fontSize: '12px',
                      color: '#e5e7eb',
                    }}
                    itemStyle={{ color: '#e5e7eb' }}
                    labelStyle={{ color: '#9ca3af' }}
                    cursor={{ fill: 'rgba(20, 184, 166, 0.15)' }}
                  />
                  <Legend 
                    wrapperStyle={{ fontSize: '12px', color: '#9ca3af' }}
                    iconType="square"
                  />
                  <Bar 
                    dataKey="value" 
                    fill="rgba(20, 184, 166, 0.6)" 
                    radius={[4, 4, 0, 0]}
                    cursor="pointer"
                    activeBar={{ fill: 'rgba(94, 234, 212, 0.7)', stroke: 'rgba(20, 184, 166, 0.5)', strokeWidth: 1 }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
              )}
          </div>
          )}

          {/* Recent Activity Table */}
          {hasPermission('dashboard_activity_table') && (
          <div className="bg-gray-800 border border-gray-700 rounded overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
              <h3 className="text-sm font-semibold text-white">Recent Activity</h3>
              <button className="text-xs text-teal-glass hover:text-teal-400">View All</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-900 border-b border-gray-700">
                    <th
                      className="text-left py-2.5 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                      onClick={() => handleSort('user')}
                    >
                      User
                    </th>
                    <th
                      className="text-left py-2.5 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                      onClick={() => handleSort('action')}
                    >
                      Action
                    </th>
                    <th
                      className="text-left py-2.5 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                      onClick={() => handleSort('date')}
                    >
                      Date
                    </th>
                    <th className="text-left py-2.5 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {recentActivity.map((activity) => (
                    <tr
                      key={activity.id}
                      className="bg-gray-800 hover:bg-gray-750 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-teal-500/10 backdrop-blur-md border border-teal-500/20 flex items-center justify-center text-teal-300 text-xs font-semibold">
                            {activity.user.charAt(0)}
                          </div>
                          <span className="text-sm text-gray-300">{activity.user}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-300">{activity.action}</td>
                      <td className="py-3 px-4 text-sm text-gray-400">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(activity.date)}
                        </div>
                      </td>
                      <td className="py-3 px-4">{getStatusBadge(activity.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 border-t border-gray-700 flex items-center justify-between bg-gray-900">
              <p className="text-xs text-gray-400">Showing 8 of 24 activities</p>
              <div className="flex gap-2">
                <button className="px-2.5 py-1 text-xs border border-gray-600 rounded hover:bg-gray-700 text-gray-300">
                  Previous
                </button>
                <button className="px-2.5 py-1 text-xs bg-teal-glass text-white rounded hover:bg-teal-600">
                  Next
                </button>
              </div>
            </div>
          </div>
          )}
        </main>
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
