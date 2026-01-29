import { Link } from 'react-router-dom';
import { Phone, MapPin, Mail, Instagram, Linkedin, Twitter, Facebook } from 'lucide-react';
import { BackgroundEffects } from './BackgroundEffects';
import mainLogo from '../assets/main_logo.png';

export const Footer = () => {
  return (
    <footer className="relative z-10 pt-20 pb-16 border-t border-gray-800/50 overflow-hidden" style={{ backgroundColor: '#111828' }}>
      <BackgroundEffects />

      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8">

          {/* Left Column: Logo & Contact */}
          <div className="lg:col-span-4 space-y-8">
            <div className="flex items-center gap-3">
              <img src={mainLogo} alt="HAISO" className="h-10 w-auto" />
              <div className="flex flex-col">
                <span className="text-2xl font-black tracking-tighter text-white leading-none">HAISO</span>
                <span className="text-[10px] font-bold text-[#00BBA7] tracking-[0.2em] leading-none mt-1">SaaS SOLUTIONS</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start text-gray-400 text-sm group">
                <MapPin className="w-4 h-4 mr-3 mt-0.5 text-[#00BBA7] group-hover:text-white transition-colors shrink-0" />
                <span className="leading-relaxed">123 Silom Road, Bang Rak, Bangkok 10500</span>
              </div>
              <div className="flex items-center text-gray-400 text-sm group">
                <Mail className="w-4 h-4 mr-3 text-[#00BBA7] group-hover:text-white transition-colors shrink-0" />
                <span>hello@haiso.com</span>
              </div>
              <div className="flex items-center text-gray-400 text-sm group">
                <Phone className="w-4 h-4 mr-3 text-[#00BBA7] group-hover:text-white transition-colors shrink-0" />
                <span>+66 99-999-9999</span>
              </div>
            </div>

            {/* Social Icons - Circular like the image */}
            <div className="flex items-center gap-4 pt-4">
              {[
                { icon: Twitter, href: '#' },
                { icon: Linkedin, href: '#' },
                { icon: Instagram, href: '#' },
                { icon: Facebook, href: '#' }
              ].map((social, idx) => (
                <a
                  key={idx}
                  href={social.href}
                  className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-gray-400 hover:text-[#00BBA7] hover:border-[#00BBA7] transition-all hover:bg-[#00BBA7]/5"
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Right Columns: categorized Links */}
          <div className="lg:col-span-8">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">

              {/* Product */}
              <div>
                <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-wider">Product</h3>
                <ul className="space-y-4 text-gray-400 text-sm">
                  <li><Link to="/gallery" className="hover:text-white transition-colors">Demos</Link></li>
                  <li><Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                  <li><Link to="#" className="hover:text-white transition-colors">Features</Link></li>
                  <li><Link to="#" className="hover:text-white transition-colors">Analytics</Link></li>
                  <li><Link to="#" className="hover:text-white transition-colors">Security</Link></li>
                </ul>
              </div>

              {/* Company */}
              <div>
                <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-wider">Company</h3>
                <ul className="space-y-4 text-gray-400 text-sm">
                  <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
                  <li><Link to="#" className="hover:text-white transition-colors">Careers</Link></li>
                  <li><Link to="#" className="hover:text-white transition-colors">Blog</Link></li>
                  <li><Link to="#" className="hover:text-white transition-colors">Testimonials</Link></li>
                  <li><Link to="#" className="hover:text-white transition-colors">Press</Link></li>
                </ul>
              </div>

              {/* Support */}
              <div>
                <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-wider">Support</h3>
                <ul className="space-y-4 text-gray-400 text-sm">
                  <li><Link to="#" className="hover:text-white transition-colors">Contact Us</Link></li>
                  <li><Link to="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                  <li><Link to="#" className="hover:text-white transition-colors">Terms of Service</Link></li>
                  <li><Link to="#" className="hover:text-white transition-colors">Help Center</Link></li>
                  <li><Link to="#" className="hover:text-white transition-colors">Status</Link></li>
                </ul>
              </div>

            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] text-gray-500 uppercase tracking-widest">
            © {new Date().getFullYear()} HAISO. All rights reserved. Built for local businesses.
          </p>
          <div className="flex gap-8 text-[10px] text-gray-500 uppercase tracking-widest">
            <Link to="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="#" className="hover:text-white transition-colors">Terms of Condition</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
