import { useState, useEffect, useRef } from 'react';
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
  const mainSearchInputRef = useRef(null);

  // Listen for navbar search changes
  useEffect(() => {
    const handleNavbarSearchChange = (event) => {
      const value = event.detail.value;
      setSearchTerm(value);
      // Focus the main search input
      if (mainSearchInputRef.current) {
        mainSearchInputRef.current.focus();
      }
    };

    window.addEventListener('navbarSearchChange', handleNavbarSearchChange);
    return () => {
      window.removeEventListener('navbarSearchChange', handleNavbarSearchChange);
    };
  }, []);

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
    <div className="min-h-screen font-sans relative" style={{ backgroundColor: '#F9F9F9' }}>
      <BackgroundImage />
      <Navbar />

      {/* Hero Section */}
      <header className="relative px-8 pt-32 pb-20 md:pt-40 md:pb-32 flex flex-col items-center text-center overflow-hidden z-10" style={{ backgroundColor: '#F9F9F9' }}>
        {/* Cyberpunk Background Layer */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          {/* Base Background */}
          <div className="absolute inset-0" style={{ backgroundColor: '#F9F9F9' }} />
          
          {/* Energy Orbs - Cyan */}
          <div 
            className="absolute bottom-[75%] left-[10%] w-[720px] h-[720px] rounded-full opacity-60"
            style={{
              background: 'radial-gradient(circle, rgba(0,255,255,0.8) 0%, rgba(0,213,190,0.6) 20%, rgba(0,184,163,0.4) 40%, transparent 70%)',
              filter: 'blur(80px)',
              animation: 'cyberOrb1 15s ease-in-out infinite',
              boxShadow: '0 0 200px rgba(0,255,255,0.6), 0 0 400px rgba(0,213,190,0.4), 0 0 600px rgba(0,184,163,0.2)'
            }}
          />
          <div 
            className="absolute bottom-[75%] right-[15%] w-[600px] h-[600px] rounded-full opacity-50"
            style={{
              background: 'radial-gradient(circle, rgba(0,213,190,0.9) 0%, rgba(0,255,255,0.6) 25%, rgba(0,184,163,0.3) 50%, transparent 75%)',
              filter: 'blur(70px)',
              animation: 'cyberOrb2 18s ease-in-out infinite 3s',
              boxShadow: '0 0 180px rgba(0,213,190,0.7), 0 0 360px rgba(0,255,255,0.5), 0 0 540px rgba(0,184,163,0.3)'
            }}
          />
          
          {/* Energy Orbs - Teal Variation 1 */}
          <div 
            className="absolute bottom-[75%] left-[20%] w-[660px] h-[660px] rounded-full opacity-55"
            style={{
              background: 'radial-gradient(circle, rgba(0,213,190,0.8) 0%, rgba(0,184,163,0.6) 20%, rgba(0,166,147,0.4) 40%, transparent 70%)',
              filter: 'blur(75px)',
              animation: 'cyberOrb3 16s ease-in-out infinite 2s',
              boxShadow: '0 0 200px rgba(0,213,190,0.6), 0 0 400px rgba(0,184,163,0.4), 0 0 600px rgba(0,166,147,0.2)'
            }}
          />
          <div 
            className="absolute bottom-[75%] right-[25%] w-[576px] h-[576px] rounded-full opacity-50"
            style={{
              background: 'radial-gradient(circle, rgba(0,184,163,0.9) 0%, rgba(0,213,190,0.6) 25%, rgba(0,166,147,0.3) 50%, transparent 75%)',
              filter: 'blur(65px)',
              animation: 'cyberOrb4 14s ease-in-out infinite 4s',
              boxShadow: '0 0 180px rgba(0,184,163,0.7), 0 0 360px rgba(0,213,190,0.5), 0 0 540px rgba(0,166,147,0.3)'
            }}
          />
          
          {/* Energy Orbs - Teal Variation 2 */}
          <div 
            className="absolute bottom-[75%] right-[10%] w-[624px] h-[624px] rounded-full opacity-45"
            style={{
              background: 'radial-gradient(circle, rgba(0,255,229,0.8) 0%, rgba(0,213,190,0.6) 20%, rgba(0,184,163,0.4) 40%, transparent 70%)',
              filter: 'blur(72px)',
              animation: 'cyberOrb5 17s ease-in-out infinite 1s',
              boxShadow: '0 0 200px rgba(0,255,229,0.6), 0 0 400px rgba(0,213,190,0.4), 0 0 600px rgba(0,184,163,0.2)'
            }}
          />
          <div 
            className="absolute bottom-[150%] left-[30%] w-[696px] h-[696px] rounded-full opacity-40"
            style={{
              background: 'radial-gradient(circle, rgba(0,213,190,0.9) 0%, rgba(0,255,229,0.6) 25%, rgba(0,184,163,0.3) 50%, transparent 75%)',
              filter: 'blur(78px)',
              animation: 'cyberOrb6 19s ease-in-out infinite 5s',
              boxShadow: '0 0 180px rgba(0,213,190,0.7), 0 0 360px rgba(0,255,229,0.5), 0 0 540px rgba(0,184,163,0.3)'
            }}
          />
          
          {/* Energy Orbs - Corner Positions */}
          {/* Left Corner */}
          <div 
            className="absolute bottom-[70%] left-0 w-[500px] h-[500px] rounded-full opacity-50"
            style={{
              background: 'radial-gradient(circle, rgba(0,213,190,0.8) 0%, rgba(0,184,163,0.6) 20%, rgba(0,166,147,0.4) 40%, transparent 70%)',
              filter: 'blur(70px)',
              animation: 'cyberOrb1 15s ease-in-out infinite',
              boxShadow: '0 0 200px rgba(0,213,190,0.6), 0 0 400px rgba(0,184,163,0.4), 0 0 600px rgba(0,166,147,0.2)',
              transform: 'translate(-30%, 0)'
            }}
          />
          
          {/* Right Corner */}
          <div 
            className="absolute bottom-[70%] right-0 w-[500px] h-[500px] rounded-full opacity-50"
            style={{
              background: 'radial-gradient(circle, rgba(0,255,229,0.8) 0%, rgba(0,213,190,0.6) 20%, rgba(0,184,163,0.4) 40%, transparent 70%)',
              filter: 'blur(70px)',
              animation: 'cyberOrb2 18s ease-in-out infinite 3s',
              boxShadow: '0 0 200px rgba(0,255,229,0.6), 0 0 400px rgba(0,213,190,0.4), 0 0 600px rgba(0,184,163,0.2)',
              transform: 'translate(30%, 0)'
            }}
          />
          
          {/* Interlocking Neon Rings - Teal (Bottom Left) */}
          <div 
            className="absolute bottom-[25%] left-[20%] transform -translate-x-1/2 w-[400px] h-[400px] rounded-full border-4 opacity-30"
            style={{
              borderColor: 'rgba(0,255,255,0.6)',
              animation: 'ringRotate1 25s linear infinite',
              boxShadow: '0 0 50px rgba(0,255,255,0.5), 0 0 100px rgba(0,213,190,0.3), inset 0 0 50px rgba(0,255,255,0.2)',
              filter: 'blur(2px) drop-shadow(0 0 25px rgba(0,255,255,0.4))'
            }}
          />
          <div 
            className="absolute bottom-[25%] left-[20%] transform -translate-x-1/2 w-[320px] h-[320px] rounded-full border-3 opacity-25"
            style={{
              borderColor: 'rgba(0,213,190,0.7)',
              animation: 'ringRotate2 30s linear infinite reverse',
              boxShadow: '0 0 40px rgba(0,213,190,0.4), 0 0 80px rgba(0,255,255,0.3), inset 0 0 40px rgba(0,213,190,0.15)',
              filter: 'blur(1.5px) drop-shadow(0 0 20px rgba(0,213,190,0.3))'
            }}
          />
          
          {/* Interlocking Neon Rings - Teal (Bottom Right) */}
          <div 
            className="absolute bottom-[25%] right-[20%] transform translate-x-1/2 w-[350px] h-[350px] rounded-full border-4 opacity-28"
            style={{
              borderColor: 'rgba(0,213,190,0.6)',
              animation: 'ringRotate3 28s linear infinite',
              boxShadow: '0 0 50px rgba(0,213,190,0.5), 0 0 100px rgba(0,184,163,0.3), inset 0 0 50px rgba(0,213,190,0.2)',
              filter: 'blur(2px) drop-shadow(0 0 25px rgba(0,213,190,0.4))'
            }}
          />
          <div 
            className="absolute bottom-[25%] right-[20%] transform translate-x-1/2 w-[280px] h-[280px] rounded-full border-3 opacity-22"
            style={{
              borderColor: 'rgba(0,184,163,0.7)',
              animation: 'ringRotate4 32s linear infinite reverse',
              boxShadow: '0 0 40px rgba(0,184,163,0.4), 0 0 80px rgba(0,213,190,0.3), inset 0 0 40px rgba(0,184,163,0.15)',
              filter: 'blur(1.5px) drop-shadow(0 0 20px rgba(0,184,163,0.3))'
            }}
          />
          
          {/* Chromatic Aberration Layer */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(0,213,190,0.1) 25%, transparent 50%, rgba(0,184,163,0.1) 75%, transparent 100%)',
              filter: 'blur(3px)',
              mixBlendMode: 'screen'
            }}
          />
          
          {/* Refraction Caustics */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-15"
            style={{
              background: `
                repeating-linear-gradient(45deg, transparent, transparent 100px, rgba(0,213,190,0.1) 100px, rgba(0,213,190,0.1) 200px),
                repeating-linear-gradient(-45deg, transparent, transparent 120px, rgba(0,184,163,0.1) 120px, rgba(0,184,163,0.1) 240px),
                repeating-linear-gradient(30deg, transparent, transparent 80px, rgba(0,166,147,0.08) 80px, rgba(0,166,147,0.08) 160px)
              `,
              animation: 'caustics 20s linear infinite',
              mixBlendMode: 'overlay'
            }}
          />
          
          {/* Heavy Glassmorphism Frost Overlay */}
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.3) 100%)',
              backdropFilter: 'blur(40px) saturate(180%)',
              WebkitBackdropFilter: 'blur(40px) saturate(180%)',
              borderBottom: '1px solid rgba(255,255,255,0.3)',
              boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.4), inset 0 -1px 0 0 rgba(255,255,255,0.2)'
            }}
          />
          
          {/* Volumetric Glow Enhancement */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-30"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(0,213,190,0.15) 0%, rgba(0,184,163,0.12) 30%, rgba(0,166,147,0.1) 60%, transparent 100%)',
              filter: 'blur(60px)',
              mixBlendMode: 'screen'
            }}
          />
        </div>
        
        <div className="relative z-10 max-w-[95%] mx-auto w-full p-12 md:p-16">
          <h1 
            className="text-4xl md:text-6xl lg:text-7xl font-black leading-tight mb-32"
            style={{ 
              fontFamily: "'Barlow', sans-serif",
              color: 'rgba(0, 213, 190, 0.45)',
              fontWeight: 900,
              letterSpacing: '-0.02em',
              textShadow: '0 2px 20px rgba(255, 255, 255, 0.5), 0 4px 40px rgba(0, 0, 0, 0.1)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
            }}
          >
            Launch Your Business
          </h1>

          {/* Premium Search Bar */}
          <form onSubmit={handleSearchSubmit} className="relative max-w-2xl mx-auto mb-32">
            <div className="relative">
              <input
                ref={mainSearchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search for your business website by name..."
                className="w-full pl-6 pr-14 py-4 rounded-full text-gray-900 text-base placeholder-gray-400 focus:outline-none transition-all"
                style={{
                  background: 'rgba(255, 255, 255, 0.7)',
                  backdropFilter: 'blur(20px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                  border: '1px solid rgba(255, 255, 255, 0.18)',
                  boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.1)',
                }}
                onFocus={(e) => {
                  e.target.style.border = '1px solid rgba(0, 213, 190, 0.5)';
                  e.target.style.background = 'rgba(255, 255, 255, 0.85)';
                  if (businesses.length > 0) setShowResults(true);
                }}
                onBlur={(e) => {
                  e.target.style.border = '1px solid rgba(255, 255, 255, 0.18)';
                  e.target.style.background = 'rgba(255, 255, 255, 0.7)';
                }}
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 w-12 h-12 rounded-full text-white transition-all flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #00D5BE 0%, #00B8A3 100%)',
                  boxShadow: '0 4px 15px 0 rgba(0, 213, 190, 0.3)',
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, #00B8A3 0%, #00A693 100%)';
                  e.target.style.boxShadow = '0 4px 20px 0 rgba(0, 213, 190, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, #00D5BE 0%, #00B8A3 100%)';
                  e.target.style.boxShadow = '0 4px 15px 0 rgba(0, 213, 190, 0.3)';
                }}
              >
                <FaSearch className="text-xl" />
              </button>
            </div>

            {/* Search Results Dropdown */}
            {showResults && businesses.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 max-h-96 overflow-y-auto rounded-xl bg-white border border-gray-200 shadow-2xl z-50">
                {loading ? (
                  <div className="p-6 text-center text-gray-500">Searching...</div>
                ) : (
                  businesses.map((business) => (
                    <div
                      key={business.id}
                      onClick={() => handleBusinessClick(business)}
                      className="p-4 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-100 last:border-b-0"
                    >
                      <h3 className="text-gray-900 font-semibold mb-1">{business.name}</h3>
                      {business.industry && (
                        <p className="text-sm text-gray-500">{business.industry}</p>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </form>

          <p 
            className="text-base md:text-lg lg:text-xl text-gray-800 max-w-4xl mx-auto mb-12 leading-relaxed font-light mt-32"
            style={{ fontFamily: "'Barlow', sans-serif" }}
          >
            The all-in-one platform for local businesses to claim professionally designed
            websites, manage their online presence, and scale effortlessly.
          </p>
        </div>
        
        {/* Cyberpunk Animations */}
        <style>{`
          @keyframes cyberOrb1 {
            0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.6; }
            25% { transform: translate(80px, -60px) scale(1.2); opacity: 0.8; }
            50% { transform: translate(-50px, 70px) scale(0.9); opacity: 0.5; }
            75% { transform: translate(60px, 40px) scale(1.1); opacity: 0.7; }
          }
          @keyframes cyberOrb2 {
            0%, 100% { transform: translate(0, 0) scale(1) rotate(0deg); opacity: 0.5; }
            33% { transform: translate(-70px, 90px) scale(1.3) rotate(120deg); opacity: 0.7; }
            66% { transform: translate(100px, -50px) scale(0.8) rotate(240deg); opacity: 0.4; }
          }
          @keyframes cyberOrb3 {
            0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.55; }
            30% { transform: translate(-90px, 50px) scale(1.25); opacity: 0.75; }
            60% { transform: translate(70px, -80px) scale(0.85); opacity: 0.45; }
          }
          @keyframes cyberOrb4 {
            0%, 100% { transform: translate(0, 0) scale(1) rotate(0deg); opacity: 0.5; }
            40% { transform: translate(85px, 60px) scale(1.15) rotate(180deg); opacity: 0.7; }
            80% { transform: translate(-60px, -70px) scale(0.9) rotate(360deg); opacity: 0.4; }
          }
          @keyframes cyberOrb5 {
            0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.45; }
            35% { transform: translate(-75px, -90px) scale(1.2); opacity: 0.65; }
            70% { transform: translate(90px, 55px) scale(0.88); opacity: 0.35; }
          }
          @keyframes cyberOrb6 {
            0%, 100% { transform: translate(0, 0) scale(1) rotate(0deg); opacity: 0.4; }
            45% { transform: translate(95px, -65px) scale(1.18) rotate(270deg); opacity: 0.6; }
            90% { transform: translate(-80px, 75px) scale(0.82) rotate(540deg); opacity: 0.3; }
          }
          @keyframes ringRotate1 {
            0% { transform: translate(-50%, -50%) rotate(0deg); }
            100% { transform: translate(-50%, -50%) rotate(360deg); }
          }
          @keyframes ringRotate2 {
            0% { transform: translate(-50%, -50%) rotate(0deg); }
            100% { transform: translate(-50%, -50%) rotate(-360deg); }
          }
          @keyframes ringRotate3 {
            0% { transform: translate(-50%, -50%) rotate(0deg); }
            100% { transform: translate(-50%, -50%) rotate(360deg); }
          }
          @keyframes ringRotate4 {
            0% { transform: translate(-50%, -50%) rotate(0deg); }
            100% { transform: translate(-50%, -50%) rotate(-360deg); }
          }
          @keyframes caustics {
            0% { transform: translateX(0) translateY(0); }
            50% { transform: translateX(100px) translateY(-50px); }
            100% { transform: translateX(0) translateY(0); }
          }
        `}</style>
      </header>
    </div>
  );
};

