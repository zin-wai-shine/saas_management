import { Navbar } from '../components/Navbar';

export const ContactPage = () => {
  return (
    <div className="min-h-screen bg-forest-dark text-cyan-glow">
      <Navbar />
      <div className="px-8 py-12">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-teal-light text-center">Contact Us</h1>
          <div className="bg-white/10 backdrop-blur-sm p-8 rounded-lg">
            <form className="space-y-4">
              <div>
                <label className="block text-teal-mist mb-2">Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 bg-white/20 border border-teal-glass/30 rounded text-white placeholder-teal-mist focus:outline-none focus:border-teal-glass"
                  required
                />
              </div>
              <div>
                <label className="block text-teal-mist mb-2">Email</label>
                <input
                  type="email"
                  className="w-full px-4 py-2 bg-white/20 border border-teal-glass/30 rounded text-white placeholder-teal-mist focus:outline-none focus:border-teal-glass"
                  required
                />
              </div>
              <div>
                <label className="block text-teal-mist mb-2">Message</label>
                <textarea
                  rows={6}
                  className="w-full px-4 py-2 bg-white/20 border border-teal-glass/30 rounded text-white placeholder-teal-mist focus:outline-none focus:border-teal-glass"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full px-4 py-2 bg-teal-glass text-white font-bold rounded hover:bg-teal-mist transition"
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

