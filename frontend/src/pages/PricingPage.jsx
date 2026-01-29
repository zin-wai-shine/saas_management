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
      <div className="relative z-10 px-2 sm:px-4 lg:px-6 pt-32 pb-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-light mb-12 text-white text-center">
            Pricing Plans
          </h1>
          {loading ? (
            <div className="text-center text-gray-400">Loading...</div>
          ) : plans.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className="w-full p-5 rounded-xl transition-all duration-300"
                  style={{
                    background: 'rgba(30, 41, 56, 0.6)',
                    backdropFilter: 'blur(12px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(12px) saturate(180%)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(30, 41, 56, 0.8)';
                    e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.15)';
                    e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.2)';
                    e.currentTarget.style.transform = 'translateY(-4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(30, 41, 56, 0.6)';
                    e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.08)';
                    e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-medium text-white mb-2">{plan.name}</h3>
                    <p className="text-xs text-gray-300 mb-4 leading-relaxed">{plan.description}</p>
                    <div className="mb-4">
                      <span className="text-3xl font-light text-white">
                        ฿{plan.price}
                      </span>
                      <span className="text-xs text-gray-400 ml-1">/{plan.billing_cycle}</span>
                    </div>
                  </div>

                  {plan.features && (
                    <ul className="space-y-2 mb-6 min-h-[150px]">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="text-xs text-gray-300 flex items-start">
                          <span className="text-white mr-2 text-[10px] mt-1">•</span>
                          <span className="leading-relaxed flex-1">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  <button
                    className="w-full px-4 py-2 rounded-lg text-white text-xs font-medium transition-all duration-300"
                    style={{
                      background: 'rgba(30, 41, 56, 0.7)',
                      backdropFilter: 'blur(8px)',
                      WebkitBackdropFilter: 'blur(8px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(30, 41, 56, 0.9)';
                      e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.2)';
                      e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(30, 41, 56, 0.7)';
                      e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.1)';
                      e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
                    }}
                  >
                    Get Started
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-400">No plans available</div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

