import { useState, useEffect } from 'react';
import { planAPI } from '../api/api';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export const PricingPage = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    planAPI.list()
      .then((response) => {
        setPlans(response.data);
      })
      .catch((err) => {
        console.error('Failed to fetch plans:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen relative" style={{ backgroundColor: '#111828' }}>
      <Navbar />
      <div className="relative z-10 px-8 py-12">
        <div className="max-w-7xl mx-auto px-12 py-16">
          <h1 className="text-4xl font-bold mb-8 text-white text-center">
            Pricing Plans
          </h1>
          {loading ? (
            <div className="text-center text-gray-400">Loading...</div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className="p-6 rounded-lg transition-all relative overflow-hidden group"
                  style={{
                    background: 'rgba(30, 41, 56, 0.6)',
                    backdropFilter: 'blur(12px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(12px) saturate(180%)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(30, 41, 56, 0.75)';
                    e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.12)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(30, 41, 56, 0.6)';
                    e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.08)';
                  }}
                >
                  <div className="relative z-10">
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <p className="text-gray-300 mb-4">{plan.description}</p>
                  <div className="text-4xl font-bold text-white mb-4">
                    ฿{plan.price}
                    <span className="text-lg text-gray-400">/{plan.billing_cycle}</span>
                  </div>
                  {plan.features && (
                    <ul className="space-y-2 mb-6">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="text-gray-300">
                          • {feature}
                        </li>
                      ))}
                    </ul>
                  )}
                  <button 
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
                    Get Started
                  </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

