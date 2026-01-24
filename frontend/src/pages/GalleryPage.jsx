import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { websiteAPI, BASE_URL } from '../api/api';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export const GalleryPage = () => {
  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    websiteAPI.demos()
      .then((response) => {
        setWebsites(response.data);
      })
      .catch((err) => {
        console.error('Failed to fetch demos:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen relative" style={{ backgroundColor: '#111828' }}>
      <Navbar />
      <div className="relative z-10 px-8 py-12">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-white text-center">
            Demo Gallery
          </h1>
          {loading ? (
            <div className="text-center text-gray-400">Loading...</div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {websites.map((website) => {
                const slug = (website.title || '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
                return (
                <Link
                  key={website.id}
                  to={`/gallery/${slug}`}
                  className="overflow-hidden rounded-lg transition-all flex flex-col cursor-pointer"
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
                  <div className="h-48 overflow-hidden bg-gray-100 flex items-center justify-center">
                    {website.image_url ? (
                      <img 
                        src={website.image_url.startsWith('http') ? website.image_url : `${BASE_URL}${website.image_url}`} 
                        alt={website.title}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/400x225?text=Demo+Preview';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center" style={{
                        background: 'rgba(30, 41, 56, 0.3)',
                        backdropFilter: 'blur(8px)',
                        WebkitBackdropFilter: 'blur(8px)',
                      }}>
                        <span className="text-4xl font-bold text-gray-400">{website.title.charAt(0)}</span>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-2">{website.title}</h3>
                    <p className="text-gray-300 mb-4">{website.theme_name}</p>
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded text-xs font-medium text-white" style={{
                        background: 'rgba(30, 41, 56, 0.5)',
                        backdropFilter: 'blur(8px)',
                        WebkitBackdropFilter: 'blur(8px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                      }}>
                        {website.is_demo ? 'Demo' : 'Live'}
                      </span>
                      {website.url && (
                        <a 
                          href={website.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-gray-300 hover:text-white text-xs font-bold uppercase tracking-wider transition-colors"
                        >
                          Visit Site →
                        </a>
                      )}
                    </div>
                  </div>
                </Link>
              )})}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

