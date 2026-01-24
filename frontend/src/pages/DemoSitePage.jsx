import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { websiteAPI, BASE_URL } from '../api/api';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export const DemoSitePage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [website, setWebsite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slug) {
      setError('Invalid demo site URL');
      setLoading(false);
      return;
    }

    // Fetch all demos and find the one matching the slug
    websiteAPI.demos()
      .then((response) => {
        if (!response || !response.data || !Array.isArray(response.data)) {
          setError('Invalid response from server');
          setLoading(false);
          return;
        }

        // Try multiple matching strategies
        const found = response.data.find(
          (site) => {
            if (!site) return false;
            const titleSlug = (site.title || '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
            const slugLower = slug.toLowerCase();
            return titleSlug === slugLower ||
                   site.id?.toString() === slug ||
                   (site.title || '').toLowerCase() === slugLower.replace(/-/g, ' ');
          }
        );
        
        if (found) {
          setWebsite(found);
        } else {
          console.log('Available sites:', response.data.map(s => ({ id: s.id, title: s.title })));
          setError(`Demo site "${slug}" not found`);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch demo:', err);
        setError('Failed to load demo site. Please try again.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen relative" style={{ backgroundColor: '#111828' }}>
        <Navbar />
        <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-200px)]">
          <div className="text-center">
            <div className="text-gray-500 mb-2">Loading demo site...</div>
            <div className="text-sm text-gray-400">Slug: {slug}</div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !website) {
    return (
      <div className="min-h-screen relative" style={{ backgroundColor: '#111828' }}>
        <Navbar />
        <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-200px)] px-4">
          <div className="text-center max-w-md">
            <h1 className="text-2xl font-bold text-white mb-4">Demo Site Not Found</h1>
            <p className="text-gray-300 mb-2">{error || 'The requested demo site could not be found.'}</p>
            {slug && (
              <p className="text-sm text-gray-400 mb-6">Looking for: {slug}</p>
            )}
            <button
              onClick={() => navigate('/gallery')}
              className="px-6 py-2 rounded-lg text-white font-semibold transition-all"
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
              Back to Gallery
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative" style={{ backgroundColor: '#111828' }}>
      <Navbar />
      <div className="relative z-10 px-8 py-12">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate('/gallery')}
            className="mb-6 text-gray-300 hover:text-white transition-colors flex items-center gap-2"
          >
            ← Back to Gallery
          </button>
          
          <div 
            className="rounded-lg overflow-hidden"
            style={{
              background: 'rgba(30, 41, 56, 0.6)',
              backdropFilter: 'blur(12px) saturate(180%)',
              WebkitBackdropFilter: 'blur(12px) saturate(180%)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div className="aspect-video bg-gray-100 flex items-center justify-center overflow-hidden">
              {website.image_url ? (
                <img 
                  src={website.image_url.startsWith('http') ? website.image_url : `${BASE_URL}${website.image_url}`} 
                  alt={website.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/1200x675?text=Demo+Preview';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center" style={{
                  background: 'rgba(30, 41, 56, 0.3)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                }}>
                  <span className="text-6xl font-bold text-gray-400">{website.title.charAt(0)}</span>
                </div>
              )}
            </div>
            
            <div className="p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">{website.title || 'Untitled Demo'}</h1>
                  {website.theme_name && (
                    <p className="text-gray-300 text-lg">{website.theme_name}</p>
                  )}
                </div>
                <span className="px-3 py-1 rounded-full text-sm font-medium text-white" style={{
                  background: 'rgba(30, 41, 56, 0.5)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}>
                  {website.is_demo ? 'Demo' : 'Live'}
                </span>
              </div>
              
              {website.url ? (
                <a 
                  href={website.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-white font-semibold transition-all"
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
                  Visit Live Site →
                </a>
              ) : (
                <div className="text-gray-500 text-sm">No URL available for this demo</div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

