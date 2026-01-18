import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';

export const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await register(name, email, password, 'owner');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-forest-dark text-cyan-glow">
      <Navbar />
      <div className="flex items-center justify-center px-4 py-20">
        <div className="bg-white/10 backdrop-blur-sm p-8 rounded-lg max-w-md w-full">
          <h2 className="text-3xl font-bold mb-6 text-teal-light text-center">Register</h2>
          {error && <div className="bg-red-500/20 text-red-200 p-3 rounded mb-4">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-teal-mist mb-2">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 bg-white/20 border border-teal-glass/30 rounded text-white placeholder-teal-mist focus:outline-none focus:border-teal-glass"
                required
              />
            </div>
            <div>
              <label className="block text-teal-mist mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 bg-white/20 border border-teal-glass/30 rounded text-white placeholder-teal-mist focus:outline-none focus:border-teal-glass"
                required
              />
            </div>
            <div>
              <label className="block text-teal-mist mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-white/20 border border-teal-glass/30 rounded text-white placeholder-teal-mist focus:outline-none focus:border-teal-glass"
                required
                minLength={8}
              />
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2 bg-teal-glass text-white font-bold rounded hover:bg-teal-mist transition"
            >
              Register
            </button>
          </form>
          <p className="mt-4 text-center text-teal-mist">
            Already have an account?{' '}
            <Link to="/login" className="text-teal-glass hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

