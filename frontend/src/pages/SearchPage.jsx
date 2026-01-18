import { useState, useEffect } from 'react';
import { businessAPI } from '../api/api';
import { Navbar } from '../components/Navbar';
import { FaSearch } from 'react-icons/fa';

export const SearchPage = () => {
  const [businesses, setBusinesses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
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
    <div className="min-h-screen bg-forest-dark text-cyan-glow">
      <Navbar />
      <div className="px-8 py-12">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-teal-light text-center">
            Find Your Business
          </h1>
          <div className="mb-8">
            <div className="relative">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-teal-mist" />
              <input
                type="text"
                placeholder="Search businesses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/20 border border-teal-glass/30 rounded text-white placeholder-teal-mist focus:outline-none focus:border-teal-glass"
              />
            </div>
          </div>
          {loading ? (
            <div className="text-center">Loading...</div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {filteredBusinesses.map((business) => (
                <div
                  key={business.id}
                  className="bg-white/10 backdrop-blur-sm p-6 rounded hover:bg-white/20 transition"
                >
                  <h3 className="text-xl font-bold text-teal-light mb-2">{business.name}</h3>
                  <p className="text-teal-mist mb-2">{business.industry}</p>
                  <p className="text-sm text-teal-mist">{business.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

