import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { businessAPI } from '../api/api';
import { Navbar } from '../components/Navbar';
import { BackgroundImage } from '../components/BackgroundImage';
import { FaSearch } from 'react-icons/fa';

export const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const [businesses, setBusinesses] = useState([]);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    businessAPI.search()
      .then((response) => {
        setBusinesses(response.data);
      })
      .catch((err) => {
        console.error('Failed to fetch businesses:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const filteredBusinesses = businesses.filter((business) =>
    business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    business.industry?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen text-white relative">
      <BackgroundImage />
      <Navbar />
      <div className="relative z-10 px-8 py-12">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-white text-center">
            Find Your Business
          </h1>
          <div className="mb-8">
            <div className="relative">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search businesses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded bg-gray-800/50 backdrop-blur-md border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-teal-500/50 focus:bg-gray-800/70 transition-all"
              />
            </div>
          </div>
          {loading ? (
            <div className="text-center text-gray-400">Loading...</div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {filteredBusinesses.map((business) => (
                <div
                  key={business.id}
                  className="bg-gray-800/50 backdrop-blur-md border border-white/10 p-6 rounded hover:bg-gray-800/70 transition-all"
                >
                  <h3 className="text-xl font-bold text-white mb-2">{business.name}</h3>
                  <p className="text-gray-300 mb-2">{business.industry}</p>
                  <p className="text-sm text-gray-400">{business.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

