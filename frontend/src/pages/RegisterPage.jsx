import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import { BackgroundImage } from '../components/BackgroundImage';

export const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await register(name, email, password, 'owner', businessName);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen text-white relative">
      <BackgroundImage />
      <Navbar />
      <div className="relative z-10 flex items-center justify-center px-4 py-20">
        <div className="bg-gray-800/60 backdrop-blur-md border border-white/10 p-8 rounded-xl max-w-md w-full shadow-2xl">
          <h2 className="text-3xl font-bold mb-6 text-white text-center">Register</h2>
          {error && <div className="bg-red-500/20 backdrop-blur-md border border-red-500/30 text-red-200 p-3 rounded mb-4">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-300 mb-2">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 rounded bg-gray-800/50 backdrop-blur-md border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-teal-500/50 focus:bg-gray-800/70 transition-all"
                placeholder="Your name"
                required
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Business Name</label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full px-4 py-2 rounded bg-gray-800/50 backdrop-blur-md border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-teal-500/50 focus:bg-gray-800/70 transition-all"
                placeholder="Your business name"
                required
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 rounded bg-gray-800/50 backdrop-blur-md border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-teal-500/50 focus:bg-gray-800/70 transition-all"
                placeholder="your.email@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 rounded bg-gray-800/50 backdrop-blur-md border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-teal-500/50 focus:bg-gray-800/70 transition-all"
                placeholder="Min 8 characters"
                required
                minLength={8}
              />
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2 rounded-lg bg-teal-500/20 backdrop-blur-md border border-teal-500/30 text-teal-400 font-semibold hover:bg-teal-500/30 transition-all"
            >
              Register
            </button>
          </form>
          <p className="mt-4 text-center text-gray-300">
            Already have an account?{' '}
            <Link to="/login" className="text-teal-400 hover:text-teal-300 transition-colors">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

