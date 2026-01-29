import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';


export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col" style={{ backgroundColor: '#111828' }}>
      <Navbar />
      <div className="relative z-10 flex-grow flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div
          className="p-8 sm:p-10 rounded-2xl w-full max-w-md"
          style={{
            // background removed
            // backdropFilter removed
            // boxShadow removed
          }}
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-light text-white mb-2">Welcome Back</h2>
            <p className="text-gray-400 text-sm">Sign in to continue to your dashboard</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-200 p-4 rounded-lg mb-6 text-sm flex items-center">
              <span className="mr-2">⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-300 mb-2 text-sm font-medium ml-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded text-white placeholder-gray-400 placeholder:text-sm focus:outline-none"
                style={{
                  background: 'rgba(30, 41, 56, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                }}
                onMouseEnter={(e) => {
                  if (document.activeElement !== e.target) {
                    e.target.style.background = 'rgba(30, 41, 56, 0.8)';
                    e.target.style.border = '1px solid rgba(255, 255, 255, 0.2)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (document.activeElement !== e.target) {
                    e.target.style.background = 'rgba(30, 41, 56, 0.6)';
                    e.target.style.border = '1px solid rgba(255, 255, 255, 0.08)';
                  }
                }}
                onFocus={(e) => {
                  e.target.style.background = 'rgba(30, 41, 56, 0.9)';
                  e.target.style.border = '1px solid rgba(255, 255, 255, 0.3)';
                }}
                onBlur={(e) => {
                  e.target.style.background = 'rgba(30, 41, 56, 0.6)';
                  e.target.style.border = '1px solid rgba(255, 255, 255, 0.08)';
                }}
                placeholder="name@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2 text-sm font-medium ml-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded text-white placeholder-gray-400 placeholder:text-sm focus:outline-none"
                style={{
                  background: 'rgba(30, 41, 56, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                }}
                onMouseEnter={(e) => {
                  if (document.activeElement !== e.target) {
                    e.target.style.background = 'rgba(30, 41, 56, 0.8)';
                    e.target.style.border = '1px solid rgba(255, 255, 255, 0.2)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (document.activeElement !== e.target) {
                    e.target.style.background = 'rgba(30, 41, 56, 0.6)';
                    e.target.style.border = '1px solid rgba(255, 255, 255, 0.08)';
                  }
                }}
                onFocus={(e) => {
                  e.target.style.background = 'rgba(30, 41, 56, 0.9)';
                  e.target.style.border = '1px solid rgba(255, 255, 255, 0.3)';
                }}
                onBlur={(e) => {
                  e.target.style.background = 'rgba(30, 41, 56, 0.6)';
                  e.target.style.border = '1px solid rgba(255, 255, 255, 0.08)';
                }}
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full px-6 py-2.5 rounded text-white font-medium tracking-wide mt-4"
              style={{
                background: 'rgba(30, 41, 56, 0.7)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(30, 41, 56, 0.9)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(30, 41, 56, 0.7)';
              }}
            >
              Sign In
            </button>
          </form>

          <p className="mt-8 text-center text-gray-400 text-sm">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-white hover:text-gray-200 font-medium transition-colors border-b border-transparent hover:border-gray-200"
            >
              Register now
            </Link>
          </p>
        </div>
      </div>

    </div>
  );
};

