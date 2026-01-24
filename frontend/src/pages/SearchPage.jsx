import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { businessAPI } from '../api/api';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
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
    <div className="min-h-screen relative" style={{ backgroundColor: '#111828' }}>
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
                className="w-full pl-12 pr-4 py-3 rounded-lg text-white placeholder-gray-400 focus:outline-none transition-all"
                style={{
                  background: 'rgba(30, 41, 56, 0.6)',
                  backdropFilter: 'blur(12px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(12px) saturate(180%)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                }}
                onFocus={(e) => {
                  e.target.style.border = '1px solid rgba(255, 255, 255, 0.15)';
                  e.target.style.background = 'rgba(30, 41, 56, 0.75)';
                }}
                onBlur={(e) => {
                  e.target.style.border = '1px solid rgba(255, 255, 255, 0.08)';
                  e.target.style.background = 'rgba(30, 41, 56, 0.6)';
                }}
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
                  className="p-6 rounded-lg transition-all"
                  style={{
                    background: 'rgba(30, 41, 56, 0.6)',
                    backdropFilter: 'blur(12px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(12px) saturate(180%)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(30, 41, 56, 0.75)';
                    e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.12)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(30, 41, 56, 0.6)';
                    e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.08)';
                  }}
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
      <Footer />
    </div>
  );
};

