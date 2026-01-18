import { useState, useEffect } from 'react';
import { websiteAPI } from '../api/api';
import { Navbar } from '../components/Navbar';

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
    <div className="min-h-screen bg-forest-dark text-cyan-glow">
      <Navbar />
      <div className="px-8 py-12">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-teal-light text-center">
            Demo Gallery
          </h1>
          {loading ? (
            <div className="text-center">Loading...</div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {websites.map((website) => (
                <div
                  key={website.id}
                  className="bg-white/10 backdrop-blur-sm p-6 rounded hover:bg-white/20 transition"
                >
                  <h3 className="text-xl font-bold text-teal-light mb-2">{website.title}</h3>
                  <p className="text-teal-mist mb-4">{website.theme_name}</p>
                  <span className="text-sm text-teal-glass">
                    {website.is_demo ? 'Demo' : 'Live'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

