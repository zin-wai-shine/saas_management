import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';
import { Navbar } from '../components/Navbar';
import { BackgroundImage } from '../components/BackgroundImage';
import { businessAPI } from '../api/api';

export const LandingPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBusinesses = async () => {
      if (searchTerm.length > 0) {
        setLoading(true);
        try {
          const response = await businessAPI.search();
          const filtered = response.data.filter((business) =>
            business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            business.industry?.toLowerCase().includes(searchTerm.toLowerCase())
          );
          setBusinesses(filtered);
          setShowResults(true);
        } catch (err) {
          console.error('Failed to fetch businesses:', err);
        } finally {
          setLoading(false);
        }
      } else {
        setBusinesses([]);
        setShowResults(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchBusinesses();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const handleBusinessClick = (business) => {
    setSearchTerm('');
    setShowResults(false);
    // Navigate to search page with the business name pre-filled
    navigate(`/search?q=${encodeURIComponent(business.name)}`);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  return (
    <div className="min-h-screen font-sans relative">
      <BackgroundImage />
      <Navbar />

      {/* Hero Section */}
      <header className="relative px-8 py-20 md:py-32 flex flex-col items-center text-center overflow-hidden z-10">
        <div className="relative z-10 max-w-6xl mx-auto w-full p-12 md:p-16">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-6 text-gray-800">
            Launch Your Business <br />{' '}
            <span className="text-teal-700">
              In Minutes
            </span>{' '}
            Not Months
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl text-gray-700 max-w-3xl mx-auto mb-12 leading-relaxed font-medium">
            The all-in-one platform for local businesses to claim professionally designed
            websites, manage their online presence, and scale effortlessly.
          </p>

          {/* Premium Search Bar */}
          <form onSubmit={handleSearchSubmit} className="relative max-w-3xl mx-auto mb-8">
            <div className="relative">
              <FaSearch className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => {
                  if (businesses.length > 0) setShowResults(true);
                }}
                placeholder="Search for your business website by name..."
                className="w-full pl-16 pr-32 py-5 rounded-xl bg-gray-800/60 backdrop-blur-xl border-2 border-white/10 text-white text-lg placeholder-gray-500 focus:outline-none focus:border-teal-500/50 focus:bg-gray-800/80 transition-all shadow-2xl"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 px-6 py-3 rounded-lg bg-teal-500/30 backdrop-blur-md border border-teal-500/40 text-teal-400 font-semibold hover:bg-teal-500/40 hover:border-teal-500/60 transition-all text-sm"
              >
                Search
              </button>
            </div>

            {/* Search Results Dropdown */}
            {showResults && businesses.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 max-h-96 overflow-y-auto rounded-xl bg-gray-800/95 backdrop-blur-xl border border-white/10 shadow-2xl z-50">
                {loading ? (
                  <div className="p-6 text-center text-gray-400">Searching...</div>
                ) : (
                  businesses.map((business) => (
                    <div
                      key={business.id}
                      onClick={() => handleBusinessClick(business)}
                      className="p-4 hover:bg-gray-700/50 transition-colors cursor-pointer border-b border-white/5 last:border-b-0"
                    >
                      <h3 className="text-white font-semibold mb-1">{business.name}</h3>
                      {business.industry && (
                        <p className="text-sm text-gray-400">{business.industry}</p>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </form>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <Link
              to="/gallery"
              className="px-8 py-4 rounded-xl bg-gray-800/60 backdrop-blur-md border border-white/10 text-white font-semibold hover:bg-gray-800/80 hover:border-white/20 transition-all text-base shadow-lg"
            >
              Browse Demos
            </Link>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="relative px-8 py-20 bg-gray-900/80 backdrop-blur-sm z-10">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 text-white">
            Why Choose SaaS Agency?
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gray-800/50 backdrop-blur-md border border-white/10 p-6 rounded hover:bg-gray-800/70 transition-all">
              <h3 className="text-xl font-bold mb-3 text-teal-400">Professional Design</h3>
              <p className="text-gray-300">
                Get a stunning website designed by professionals in minutes, not months.
              </p>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-md border border-white/10 p-6 rounded hover:bg-gray-800/70 transition-all">
              <h3 className="text-xl font-bold mb-3 text-teal-400">Easy Management</h3>
              <p className="text-gray-300">
                Manage your online presence effortlessly with our intuitive dashboard.
              </p>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-md border border-white/10 p-6 rounded hover:bg-gray-800/70 transition-all">
              <h3 className="text-xl font-bold mb-3 text-teal-400">Scalable Solutions</h3>
              <p className="text-gray-300">
                Grow your business with plans that scale as you do.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

