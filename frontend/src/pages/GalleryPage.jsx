import { useState, useEffect } from 'react';
import { websiteAPI, BASE_URL } from '../api/api';
import { Navbar } from '../components/Navbar';
import { BackgroundImage } from '../components/BackgroundImage';

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
    <div className="min-h-screen text-white relative">
      <BackgroundImage />
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
              {websites.map((website) => (
                <div
                  key={website.id}
                  className="bg-gray-800/50 backdrop-blur-md border border-white/10 overflow-hidden rounded hover:bg-gray-800/70 transition-all flex flex-col"
                >
                  <div className="h-48 overflow-hidden bg-gray-900 flex items-center justify-center">
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
                      <div className="w-full h-full flex items-center justify-center bg-teal-500/10 text-teal-500/30">
                        <span className="text-4xl font-bold">{website.title.charAt(0)}</span>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-2">{website.title}</h3>
                    <p className="text-gray-300 mb-4">{website.theme_name}</p>
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded text-xs font-medium bg-teal-500/20 backdrop-blur-md border border-teal-500/30 text-teal-400">
                        {website.is_demo ? 'Demo' : 'Live'}
                      </span>
                      {website.url && (
                        <a 
                          href={website.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-teal-400 hover:text-teal-300 text-xs font-bold uppercase tracking-wider transition-colors"
                        >
                          Visit Site →
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

