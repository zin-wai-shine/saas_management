import { Link } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';
import { Navbar } from '../components/Navbar';

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-forest-dark text-cyan-glow font-sans">
      <Navbar />

      {/* Hero Section */}
      <header className="relative px-8 py-24 md:py-40 flex flex-col items-center text-center overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="w-full h-full bg-gradient-to-b from-white via-transparent to-white opacity-90"></div>
        </div>

        <div className="relative z-10">
          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6 text-teal-light">
            Launch Your Business <br />{' '}
            <span className="text-teal-glass">In Minutes</span> Not Months
          </h1>
          <p className="text-lg md:text-xl text-teal-mist max-w-2xl mx-auto mb-10 opacity-80">
            The all-in-one platform for local businesses to claim professionally designed
            websites, manage their online presence, and scale effortlessly.
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-4">
            <Link
              to="/search"
              className="px-8 py-4 rounded bg-teal-glass/90 backdrop-blur-sm text-white font-bold text-lg hover:scale-105 transition transform flex items-center justify-center shadow-xl shadow-teal-glass/20"
            >
              <FaSearch className="mr-2" /> Find Your Business
            </Link>
            <Link
              to="/gallery"
              className="px-8 py-4 rounded border-2 border-teal-glass/20 bg-teal-glass/10 backdrop-blur-sm text-teal-glass font-bold text-lg hover:bg-teal-glass hover:text-white transition"
            >
              Browse Demos
            </Link>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="px-8 py-20 bg-forest-shadow">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 text-teal-light">
            Why Choose SaaS Agency?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded">
              <h3 className="text-xl font-bold mb-4 text-teal-glass">Professional Design</h3>
              <p className="text-teal-mist">
                Get a stunning website designed by professionals in minutes, not months.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded">
              <h3 className="text-xl font-bold mb-4 text-teal-glass">Easy Management</h3>
              <p className="text-teal-mist">
                Manage your online presence effortlessly with our intuitive dashboard.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded">
              <h3 className="text-xl font-bold mb-4 text-teal-glass">Scalable Solutions</h3>
              <p className="text-teal-mist">
                Grow your business with plans that scale as you do.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

