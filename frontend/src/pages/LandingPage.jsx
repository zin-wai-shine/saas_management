import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';
import { 
  BarChart3, 
  Shield, 
  Cloud, 
  Zap, 
  CreditCard, 
  FileText, 
  Brain, 
  Plug, 
  Bell, 
  Users 
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
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
    <div className="min-h-screen font-sans relative" style={{ backgroundColor: '#111828' }}>
      <Navbar />

      {/* Hero Section */}
      <header className="relative px-8 pt-32 pb-20 md:pt-40 md:pb-32 flex flex-col items-center text-center overflow-hidden z-10" style={{ backgroundColor: '#111828' }}>
        
        <div className="relative z-10 max-w-[95%] mx-auto w-full p-12 md:p-16">
          <h1 
            className="text-4xl md:text-6xl lg:text-3xl leading-tight mb-32 text-gray-300"
            style={{ 
              fontFamily: "'Barlow', sans-serif",
              fontWeight: 300,
              opacity: 0.8,
              letterSpacing: '0.1em',
            }}
          >
            Launch Your Business ...
          </h1>

          {/* Premium Search Bar */}
          <form onSubmit={handleSearchSubmit} className="relative max-w-2xl mx-auto mb-20">
            <div className="relative">
              <input
                ref={mainSearchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search for your business website by name..."
                className="w-full pl-6 pr-14 py-4 rounded-full text-white text-base placeholder-gray-400 focus:outline-none transition-all"
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
                  if (businesses.length > 0) setShowResults(true);
                }}
                onBlur={(e) => {
                  e.target.style.border = '1px solid rgba(255, 255, 255, 0.08)';
                  e.target.style.background = 'rgba(30, 41, 56, 0.6)';
                }}
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 w-12 h-12 rounded-full text-white transition-all flex items-center justify-center"
                style={{
                  background: 'rgba(30, 41, 56, 0.7)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(30, 41, 56, 0.85)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(30, 41, 56, 0.7)';
                }}
              >
                <FaSearch className="text-xl" />
              </button>
            </div>

            {/* Search Results Dropdown */}
            {showResults && businesses.length > 0 && (
              <div 
                className="absolute top-full left-0 right-0 mt-2 max-h-96 overflow-y-auto rounded-xl z-50"
                style={{
                  background: 'rgba(30, 41, 56, 0.85)',
                  backdropFilter: 'blur(12px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(12px) saturate(180%)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                }}
              >
                {loading ? (
                  <div className="p-6 text-center text-gray-400">Searching...</div>
                ) : (
                  businesses.map((business) => (
                    <div
                      key={business.id}
                      onClick={() => handleBusinessClick(business)}
                      className="p-4 transition-colors cursor-pointer border-b border-white/10 last:border-b-0"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(30, 41, 56, 0.6)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
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

          {/* SaaS Services Section */}
          <div className="relative w-full mt-8 mb-6">
            {/* Scrolling Container */}
            <div 
              className="relative overflow-hidden py-4"
            >
              {/* Left Gradient Fade */}
              <div 
                className="absolute left-0 top-0 bottom-0 w-32 z-10 pointer-events-none"
                style={{
                  background: 'linear-gradient(to right, rgba(17, 24, 40, 1), rgba(17, 24, 40, 0))',
                }}
              />

              {/* Right Gradient Fade */}
              <div 
                className="absolute right-0 top-0 bottom-0 w-32 z-10 pointer-events-none"
                style={{
                  background: 'linear-gradient(to left, rgba(17, 24, 40, 1), rgba(17, 24, 40, 0))',
                }}
              />

              {/* Scrolling Content */}
              <div 
                className="flex gap-8"
                style={{
                  animation: 'scroll 40s linear infinite',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.animationPlayState = 'paused';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.animationPlayState = 'running';
                }}
              >
                {/* First Set */}
                {[
                  { icon: BarChart3, label: 'Analytics' },
                  { icon: Shield, label: 'Security' },
                  { icon: Cloud, label: 'Cloud' },
                  { icon: Zap, label: 'Automation' },
                  { icon: CreditCard, label: 'Payments' },
                  { icon: FileText, label: 'Reports' },
                  { icon: Brain, label: 'AI Tools' },
                  { icon: Plug, label: 'Integrations' },
                  { icon: Bell, label: 'Notifications' },
                  { icon: Users, label: 'Team Management' },
                ].map((service, index) => {
                  const Icon = service.icon;
                  return (
                    <div
                      key={`first-${index}`}
                      className="flex flex-col items-center justify-center gap-2 flex-shrink-0"
                      style={{ minWidth: '100px' }}
                    >
                      <div
                        className="flex items-center justify-center"
                      >
                        <Icon className="w-5 h-5 text-white" style={{ opacity: 0.6 }} />
                      </div>
                      <span className="text-xs font-medium whitespace-nowrap" style={{ color: 'rgba(209, 213, 219, 0.6)' }}>
                        {service.label}
                      </span>
                    </div>
                  );
                })}

                {/* Duplicate Set for Seamless Loop */}
                {[
                  { icon: BarChart3, label: 'Analytics' },
                  { icon: Shield, label: 'Security' },
                  { icon: Cloud, label: 'Cloud' },
                  { icon: Zap, label: 'Automation' },
                  { icon: CreditCard, label: 'Payments' },
                  { icon: FileText, label: 'Reports' },
                  { icon: Brain, label: 'AI Tools' },
                  { icon: Plug, label: 'Integrations' },
                  { icon: Bell, label: 'Notifications' },
                  { icon: Users, label: 'Team Management' },
                ].map((service, index) => {
                  const Icon = service.icon;
                  return (
                    <div
                      key={`second-${index}`}
                      className="flex flex-col items-center justify-center gap-2 flex-shrink-0"
                      style={{ minWidth: '100px' }}
                    >
                      <div
                        className="flex items-center justify-center"
                      >
                        <Icon className="w-5 h-5 text-white" style={{ opacity: 0.6 }} />
                      </div>
                      <span className="text-xs font-medium whitespace-nowrap" style={{ color: 'rgba(209, 213, 219, 0.6)' }}>
                        {service.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* CSS Animation */}
            <style>{`
              @keyframes scroll {
                0% {
                  transform: translateX(0);
                }
                100% {
                  transform: translateX(-50%);
                }
              }
            `}</style>
          </div>

          <p 
            className="text-base md:text-lg lg:text-xl text-gray-300 max-w-4xl mx-auto mb-12 leading-relaxed font-light mt-27"
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
      <Footer />
    </div>
  );
};

