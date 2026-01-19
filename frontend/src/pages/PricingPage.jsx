import { useState, useEffect } from 'react';
import { planAPI } from '../api/api';
import { Navbar } from '../components/Navbar';
import { BackgroundImage } from '../components/BackgroundImage';

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
    <div className="min-h-screen text-white relative">
      <BackgroundImage />
      <Navbar />
      <div className="relative z-10 px-8 py-12">
        <div className="max-w-7xl mx-auto">
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
                  className="bg-gray-800/50 backdrop-blur-md border border-white/10 p-6 rounded hover:bg-gray-800/70 transition-all"
                >
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <p className="text-gray-300 mb-4">{plan.description}</p>
                  <div className="text-4xl font-bold text-teal-400 mb-4">
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
                  <button className="w-full px-4 py-2 rounded bg-teal-500/20 backdrop-blur-md border border-teal-500/30 text-teal-400 font-semibold hover:bg-teal-500/30 transition-all">
                    Get Started
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

