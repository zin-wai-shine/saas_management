import { useState, useEffect } from 'react';
import { planAPI } from '../api/api';
import { Navbar } from '../components/Navbar';

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
    <div className="min-h-screen bg-forest-dark text-cyan-glow">
      <Navbar />
      <div className="px-8 py-12">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-teal-light text-center">
            Pricing Plans
          </h1>
          {loading ? (
            <div className="text-center">Loading...</div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className="bg-white/10 backdrop-blur-sm p-6 rounded hover:bg-white/20 transition"
                >
                  <h3 className="text-2xl font-bold text-teal-light mb-2">{plan.name}</h3>
                  <p className="text-teal-mist mb-4">{plan.description}</p>
                  <div className="text-4xl font-bold text-teal-glass mb-4">
                    ฿{plan.price}
                    <span className="text-lg text-teal-mist">/{plan.billing_cycle}</span>
                  </div>
                  {plan.features && (
                    <ul className="space-y-2 mb-6">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="text-teal-mist">
                          • {feature}
                        </li>
                      ))}
                    </ul>
                  )}
                  <button className="w-full px-4 py-2 bg-teal-glass text-white font-bold rounded hover:bg-teal-mist transition">
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

