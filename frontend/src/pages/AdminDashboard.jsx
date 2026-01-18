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
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
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
    },
    {
      title: 'Revenue',
      value: '฿45,678',
      change: '+8.2%',
      trend: 'up',
      icon: DollarSign,
      color: 'bg-green-500',
    },
    {
      title: 'Active Subscriptions',
      value: '892',
      change: '+5.1%',
      trend: 'up',
      icon: ShoppingCart,
      color: 'bg-purple-500',
    },
    {
      title: 'Growth Rate',
      value: '24.3%',
      change: '+2.4%',
      trend: 'up',
      icon: Activity,
      color: 'bg-orange-500',
    },
  ];

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

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const getStatusBadge = (status) => {
    const styles = {
      completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    };

    const icons = {
      completed: CheckCircle2,
      pending: Clock,
      cancelled: XCircle,
    };

    const Icon = icons[status] || Clock;

    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || styles.pending}`}
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
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#2C323E] h-[50px] flex items-center">
        <div className="flex items-center justify-between px-6 py-2.5 w-full h-full">
          <div className="flex items-center gap-3">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-teal-glass rounded flex items-center justify-center">
                <span className="text-white font-bold text-xs">SA</span>
              </div>
              <span className="text-sm font-semibold text-white">saas.admin</span>
            </div>
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
              className="absolute -right-3 top-4 z-50 p-1.5 rounded bg-[#2C323E] border border-[#3B414B] shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-white/70 hover:text-white hover:bg-[#262B33]"
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
        {/* Dashboard Content */}
        <main className="p-6 bg-gray-900">
          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {metrics.map((metric) => {
              const Icon = metric.icon;
              return (
                <div
                  key={metric.title}
                  className="bg-gray-800 border border-gray-700 rounded p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2 rounded ${metric.color} bg-opacity-10`}>
                      <Icon className={`w-5 h-5 ${metric.color.replace('bg-', 'text-')}`} />
                    </div>
                    {metric.trend === 'up' ? (
                      <TrendingUp className="w-4 h-4 text-green-500" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                  <h3 className="text-xs font-medium text-gray-400 mb-1">{metric.title}</h3>
                  <p className="text-xl font-semibold text-white mb-1">{metric.value}</p>
                  <p className={`text-xs ${metric.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                    {metric.change} from last month
                  </p>
                </div>
              );
            })}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            {/* Revenue Chart */}
            <div className="bg-gray-800 border border-gray-700 rounded p-4">
              <h3 className="text-sm font-semibold text-white mb-4">Revenue Overview</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#14b8a6"
                    strokeWidth={2}
                    dot={{ fill: '#14b8a6', r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Category Performance */}
            <div className="bg-gray-800 border border-gray-700 rounded p-4">
              <h3 className="text-sm font-semibold text-white mb-4">Category Performance</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="category" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="value" fill="#14b8a6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Activity Table */}
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
                          <div className="w-7 h-7 rounded-full bg-teal-glass flex items-center justify-center text-white text-xs font-semibold">
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
