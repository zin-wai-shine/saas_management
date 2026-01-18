import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import { FaEdit, FaCreditCard } from 'react-icons/fa';

export const OwnerDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-forest-dark text-cyan-glow">
      <Navbar />
      <div className="px-8 py-12">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-teal-light">
            Welcome, {user?.name}!
          </h1>
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Link
              to="/owner/website/edit"
              className="bg-white/10 backdrop-blur-sm p-6 rounded hover:bg-white/20 transition"
            >
              <FaEdit className="text-4xl text-teal-glass mb-4" />
              <h3 className="text-xl font-bold text-teal-light mb-2">Edit Website</h3>
              <p className="text-teal-mist">Customize your website</p>
            </Link>
            <Link
              to="/owner/subscription"
              className="bg-white/10 backdrop-blur-sm p-6 rounded hover:bg-white/20 transition"
            >
              <FaCreditCard className="text-4xl text-teal-glass mb-4" />
              <h3 className="text-xl font-bold text-teal-light mb-2">Subscription</h3>
              <p className="text-teal-mist">Manage your subscription</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

