import { Navbar } from '../components/Navbar';
import { BackgroundImage } from '../components/BackgroundImage';

export const ContactPage = () => {
  return (
    <div className="min-h-screen text-white relative">
      <BackgroundImage />
      <Navbar />
      <div className="relative z-10 px-8 py-12">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-white text-center">Contact Us</h1>
          <div className="bg-gray-800/50 backdrop-blur-md border border-white/10 p-8 rounded">
            <form className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2">Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 rounded bg-gray-800/50 backdrop-blur-md border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-teal-500/50 focus:bg-gray-800/70 transition-all"
                  placeholder="Your name"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  className="w-full px-4 py-2 rounded bg-gray-800/50 backdrop-blur-md border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-teal-500/50 focus:bg-gray-800/70 transition-all"
                  placeholder="your.email@example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Message</label>
                <textarea
                  rows={6}
                  className="w-full px-4 py-2 rounded bg-gray-800/50 backdrop-blur-md border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-teal-500/50 focus:bg-gray-800/70 transition-all"
                  placeholder="Your message"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full px-4 py-2 rounded bg-teal-500/20 backdrop-blur-md border border-teal-500/30 text-teal-400 font-semibold hover:bg-teal-500/30 transition-all"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

