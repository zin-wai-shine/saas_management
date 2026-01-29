import { Link } from 'react-router-dom';
import { Phone, MapPin, Mail, Instagram, Linkedin, Twitter, Facebook, ArrowRight } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="relative z-10 pt-20 pb-10 border-t border-gray-800/50" style={{ backgroundColor: '#111828' }}>
      {/* CTA Section */}
      <div className="max-w-4xl mx-auto text-center mb-20 px-4">
        <div className="w-16 h-16 bg-[#1E2938] rounded-2xl mx-auto mb-6 flex items-center justify-center border border-white/5 shadow-lg shadow-black/20 transform rotate-3">
          <span className="text-2xl">✨</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-light text-white mb-4">
          Ready to Optimize Your SaaS?
        </h2>
        <p className="text-gray-400 mb-8 max-w-lg mx-auto leading-relaxed">
          Join thousands of businesses managing their subscriptions efficiently with Haiso.
        </p>
        <Link to="/register" className="inline-flex items-center px-8 py-3 rounded-xl bg-[#00BBA7]/90 text-white hover:bg-[#00BBA7] transition-all shadow-lg shadow-[#00BBA7]/20 backdrop-blur-sm border border-[#00BBA7]/20 group">
          Get Started Now <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 border-t border-white/5 pt-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          {/* Contact */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-white">Contact</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start text-gray-400 hover:text-white transition-colors group">
                <Phone className="w-5 h-5 mr-3 mt-0.5 text-gray-500 group-hover:text-white transition-colors" />
                <span>+66 99-999-9999</span>
              </li>
              <li className="flex items-start text-gray-400 hover:text-white transition-colors group">
                <MapPin className="w-5 h-5 mr-3 mt-0.5 text-gray-500 shrink-0 group-hover:text-white transition-colors" />
                <span>123 Silom Road, Bang Rak, Bangkok 10500</span>
              </li>
              <li className="flex items-start text-gray-400 hover:text-white transition-colors group">
                <Mail className="w-5 h-5 mr-3 mt-0.5 text-gray-500 group-hover:text-white transition-colors" />
                <span>hello@haiso.com</span>
              </li>
            </ul>
          </div>

          {/* Navigate */}
          <div>
            <h3 className="text-lg font-medium text-white mb-6">Navigate</h3>
            <ul className="space-y-4 text-gray-400 text-sm">
              <li><Link to="/" className="hover:text-white transition-colors hover:pl-1">Home</Link></li>
              <li><Link to="/pricing" className="hover:text-white transition-colors hover:pl-1">Pricing</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors hover:pl-1">About Us</Link></li>
              <li><Link to="/services" className="hover:text-white transition-colors hover:pl-1">Services</Link></li>
            </ul>
          </div>

          {/* Solution */}
          <div>
            <h3 className="text-lg font-medium text-white mb-6">Solution</h3>
            <ul className="space-y-4 text-gray-400 text-sm">
              <li><Link to="#" className="hover:text-white transition-colors hover:pl-1">Dashboard</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors hover:pl-1">Analytics</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors hover:pl-1">Automation</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors hover:pl-1">Security</Link></li>
            </ul>
          </div>

          {/* Discover */}
          <div>
            <h3 className="text-lg font-medium text-white mb-6">Discover</h3>
            <ul className="space-y-4 text-gray-400 text-sm">
              <li><Link to="#" className="hover:text-white transition-colors hover:pl-1">Blog</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors hover:pl-1">Case Studies</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors hover:pl-1">Help Center</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors hover:pl-1">Privacy</Link></li>
            </ul>
          </div>

          {/* Follow Us */}
          <div>
            <h3 className="text-lg font-medium text-white mb-6">Follow Us</h3>
            <div className="space-y-4 text-sm">
              <a href="#" className="flex items-center text-gray-400 hover:text-white transition-colors group">
                <Facebook className="w-5 h-5 mr-3 text-gray-500 group-hover:text-white" /> Facebook
              </a>
              <a href="#" className="flex items-center text-gray-400 hover:text-white transition-colors group">
                <Instagram className="w-5 h-5 mr-3 text-gray-500 group-hover:text-white" /> Instagram
              </a>
              <a href="#" className="flex items-center text-gray-400 hover:text-white transition-colors group">
                <Linkedin className="w-5 h-5 mr-3 text-gray-500 group-hover:text-white" /> LinkedIn
              </a>
              <a href="#" className="flex items-center text-gray-400 hover:text-white transition-colors group">
                <Twitter className="w-5 h-5 mr-3 text-gray-500 group-hover:text-white" /> Twitter
              </a>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} HAISO. All rights reserved.
          </p>
          <div className="flex gap-8 text-xs text-gray-500">
            <Link to="#" className="hover:text-white transition-colors">Privacy & Policy</Link>
            <Link to="#" className="hover:text-white transition-colors">Terms & Condition</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
