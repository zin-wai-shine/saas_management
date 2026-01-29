import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import {
  Globe,
  CreditCard,
  Activity,
  Zap,
  ArrowUpRight,
  Layout,
  ExternalLink,
  Settings
} from 'lucide-react';

export const OwnerDashboard = () => {
  const { user } = useAuth();

  const stats = [
    { label: 'Site Status', value: 'Live', icon: Globe, color: 'text-green-400', bg: 'bg-green-400/10' },
    { label: 'Total Visits', value: '1,284', icon: Activity, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { label: 'Performance', value: '98%', icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  ];

  return (
    <div className="min-h-screen font-sans relative overflow-hidden" style={{ backgroundColor: '#111828' }}>
      {/* Background Orbs */}
      <div
        className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full opacity-20 blur-[120px] pointer-events-none"
        style={{ background: 'radial-gradient(circle, #00BBA7 0%, transparent 70%)' }}
      />
      <div
        className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full opacity-10 blur-[120px] pointer-events-none"
        style={{ background: 'radial-gradient(circle, #3B82F6 0%, transparent 70%)' }}
      />

      <Navbar />

      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-20">
        {/* Header Section */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
            <span className="text-white opacity-80 font-light">Welcome back, </span>
            <span className="bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent">
              {user?.name || 'Partner'}
            </span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl">
            Manage your digital presence, monitor performance, and scale your business from your centralized command center.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="p-6 rounded-2xl border border-white/5 backdrop-blur-xl bg-white/5 flex items-center gap-4 transition-all hover:border-white/10"
            >
              <div className={`p-3 rounded-xl ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Main Actions Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Edit Website Card */}
          <Link
            to="/owner/website/edit"
            className="group relative p-8 rounded-3xl border border-white/10 backdrop-blur-2xl bg-white/[0.03] overflow-hidden transition-all hover:bg-white/[0.06] hover:border-teal-500/30 hover:shadow-2xl hover:shadow-teal-500/10"
          >
            <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
              <ArrowUpRight className="w-6 h-6 text-teal-400" />
            </div>

            <div className="w-14 h-14 rounded-2xl bg-teal-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Layout className="w-7 h-7 text-teal-400" />
            </div>

            <h3 className="text-2xl font-bold text-white mb-3 flex items-center gap-2">
              Edit Website
            </h3>
            <p className="text-gray-400 text-lg leading-relaxed mb-6">
              Customize layout, update content, and manage your site's visual identity with our intuitive builder.
            </p>

            <div className="flex items-center gap-2 text-teal-400 font-semibold group-hover:gap-3 transition-all">
              Open Site Editor <ExternalLink className="w-4 h-4" />
            </div>
          </Link>

          {/* Subscription Card */}
          <Link
            to="/owner/subscription"
            className="group relative p-8 rounded-3xl border border-white/10 backdrop-blur-2xl bg-white/[0.03] overflow-hidden transition-all hover:bg-white/[0.06] hover:border-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/10"
          >
            <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
              <ArrowUpRight className="w-6 h-6 text-blue-400" />
            </div>

            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <CreditCard className="w-7 h-7 text-blue-400" />
            </div>

            <h3 className="text-2xl font-bold text-white mb-3">Subscription</h3>
            <p className="text-gray-400 text-lg leading-relaxed mb-6">
              Manage your billing details, view invoices, or upgrade your plan to unlock premium platform features.
            </p>

            <div className="flex items-center gap-2 text-blue-400 font-semibold group-hover:gap-3 transition-all">
              Billing Settings <Settings className="w-4 h-4" />
            </div>
          </Link>
        </div>
      </main>

      <style>{`
                @keyframes float {
                    0% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                    100% { transform: translateY(0px); }
                }
                .float-animation {
                    animation: float 6s ease-in-out infinite;
                }
            `}</style>
    </div>
  );
};

