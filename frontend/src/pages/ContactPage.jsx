import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export const ContactPage = () => {
  return (
    <div className="min-h-screen relative" style={{ backgroundColor: '#111828' }}>
      <Navbar />
      <div className="relative z-10 px-8 py-12">
        <div className="max-w-2xl mx-auto px-12 py-16">
          <h1 className="text-4xl font-bold mb-8 text-white text-center">Contact Us</h1>
          <div 
            className="p-8 rounded-lg relative overflow-hidden group"
            style={{
              background: 'rgba(30, 41, 56, 0.6)',
              backdropFilter: 'blur(12px) saturate(180%)',
              WebkitBackdropFilter: 'blur(12px) saturate(180%)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div className="relative z-10">
            <form className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2 font-medium">Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 rounded-lg text-white placeholder-gray-400 focus:outline-none transition-all"
                  style={{
                    background: 'rgba(30, 41, 56, 0.5)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                  }}
                  onFocus={(e) => {
                    e.target.style.border = '1px solid rgba(255, 255, 255, 0.15)';
                    e.target.style.background = 'rgba(30, 41, 56, 0.7)';
                  }}
                  onBlur={(e) => {
                    e.target.style.border = '1px solid rgba(255, 255, 255, 0.08)';
                    e.target.style.background = 'rgba(30, 41, 56, 0.5)';
                  }}
                  placeholder="Your name"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2 font-medium">Email</label>
                <input
                  type="email"
                  className="w-full px-4 py-2 rounded-lg text-white placeholder-gray-400 focus:outline-none transition-all"
                  style={{
                    background: 'rgba(30, 41, 56, 0.5)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                  }}
                  onFocus={(e) => {
                    e.target.style.border = '1px solid rgba(255, 255, 255, 0.15)';
                    e.target.style.background = 'rgba(30, 41, 56, 0.7)';
                  }}
                  onBlur={(e) => {
                    e.target.style.border = '1px solid rgba(255, 255, 255, 0.08)';
                    e.target.style.background = 'rgba(30, 41, 56, 0.5)';
                  }}
                  placeholder="your.email@example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2 font-medium">Message</label>
                <textarea
                  rows={6}
                  className="w-full px-4 py-2 rounded-lg text-white placeholder-gray-400 focus:outline-none transition-all"
                  style={{
                    background: 'rgba(30, 41, 56, 0.5)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                  }}
                  onFocus={(e) => {
                    e.target.style.border = '1px solid rgba(255, 255, 255, 0.15)';
                    e.target.style.background = 'rgba(30, 41, 56, 0.7)';
                  }}
                  onBlur={(e) => {
                    e.target.style.border = '1px solid rgba(255, 255, 255, 0.08)';
                    e.target.style.background = 'rgba(30, 41, 56, 0.5)';
                  }}
                  placeholder="Your message"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full px-4 py-2 rounded-lg text-white font-semibold transition-all"
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
                Send Message
              </button>
            </form>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

