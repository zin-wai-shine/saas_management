import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

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
    <div className="min-h-screen relative" style={{ backgroundColor: '#111828' }}>
      <Navbar />
      <div className="relative z-10 flex items-center justify-center px-4 py-20">
        <div 
          className="p-8 rounded-xl max-w-md w-full"
          style={{
            background: 'rgba(30, 41, 56, 0.6)',
            backdropFilter: 'blur(12px) saturate(180%)',
            WebkitBackdropFilter: 'blur(12px) saturate(180%)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          }}
        >
          <h2 className="text-3xl font-bold mb-6 text-white text-center">Register</h2>
          {error && <div className="bg-red-500/20 border border-red-500/50 text-red-300 p-3 rounded-lg mb-4">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-300 mb-2 font-medium">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#1E2938] transition-all"
                style={{
                  backgroundColor: '#1E2938',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
                onFocus={(e) => {
                  e.target.style.border = '1px solid rgba(30, 41, 56, 0.5)';
                  e.target.style.backgroundColor = '#2A3441';
                }}
                onBlur={(e) => {
                  e.target.style.border = '1px solid rgba(255, 255, 255, 0.1)';
                  e.target.style.backgroundColor = '#1E2938';
                }}
                placeholder="Your name"
                required
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2 font-medium">Business Name</label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full px-4 py-2 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#1E2938] transition-all"
                style={{
                  backgroundColor: '#1E2938',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
                onFocus={(e) => {
                  e.target.style.border = '1px solid rgba(30, 41, 56, 0.5)';
                  e.target.style.backgroundColor = '#2A3441';
                }}
                onBlur={(e) => {
                  e.target.style.border = '1px solid rgba(255, 255, 255, 0.1)';
                  e.target.style.backgroundColor = '#1E2938';
                }}
                placeholder="Your business name"
                required
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2 font-medium">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#1E2938] transition-all"
                style={{
                  backgroundColor: '#1E2938',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
                onFocus={(e) => {
                  e.target.style.border = '1px solid rgba(30, 41, 56, 0.5)';
                  e.target.style.backgroundColor = '#2A3441';
                }}
                onBlur={(e) => {
                  e.target.style.border = '1px solid rgba(255, 255, 255, 0.1)';
                  e.target.style.backgroundColor = '#1E2938';
                }}
                placeholder="your.email@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2 font-medium">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#1E2938] transition-all"
                style={{
                  backgroundColor: '#1E2938',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
                onFocus={(e) => {
                  e.target.style.border = '1px solid rgba(30, 41, 56, 0.5)';
                  e.target.style.backgroundColor = '#2A3441';
                }}
                onBlur={(e) => {
                  e.target.style.border = '1px solid rgba(255, 255, 255, 0.1)';
                  e.target.style.backgroundColor = '#1E2938';
                }}
                placeholder="Min 8 characters"
                required
                minLength={8}
              />
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2 rounded-lg text-white font-semibold transition-all"
              style={{
                background: 'rgba(30, 41, 56, 0.7)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(30, 41, 56, 0.85)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(30, 41, 56, 0.7)';
              }}
            >
              Register
            </button>
          </form>
          <p className="mt-4 text-center text-gray-300">
            Already have an account?{' '}
            <Link to="/login" className="text-[#1E2938] hover:text-[#2A3441] transition-colors">
              Login
            </Link>
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

