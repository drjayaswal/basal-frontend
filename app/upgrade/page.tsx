"use client"

import { AnimatedButton } from '@/components/ui/animated-button';
import { CheckIcon, CurrencyCircleDollarIcon } from '@phosphor-icons/react';
import { toast } from 'sonner';

const UpgradePage = () => {
  const plans = [
    {
      name: "Starter",
      price: "Free",
      description: "Perfect for testing the waters",
      features: ["1 Analysis Credits", "Basic Export", "No Downloades"],
      current: true,
      buttonText: "Current Plan",
    },
    {
      name: "Pro",
      price: "₹999",
      period: "/month",
      description: "For power users needing deep insights",
      features: ["Unlimited Credits", "Priority Processing", "Advanced CSV Exports", "Lifetime History", "API Access"],
      current: false,
      featured: true,
      buttonText: "Upgrade to Pro",
    }
  ];

  return (
    <div className="text-white">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2">
        {plans.map((plan) => (
          <div 
            key={plan.name}
            className={`relative bg-black border p-10 pt-15 px-12 -ml-2.5 -mr-8 mb-13 transition-all duration-300 ${
              plan.featured 
              ? 'border-indigo-500/50 shadow-[0_0_40px_-15px_rgba(99,102,241,0.3)]' 
              : 'border-white/10'
            }`}
          >
            <div className="mb-8">
              <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black">{plan.price}</span>
                {plan.period && <span className="text-white/40">{plan.period}</span>}
              </div>
              <p className="text-white/50 text-sm mt-4">{plan.description}</p>
            </div>

            <div className="space-y-4 mb-8">
              {plan.features.map((feature) => (
                <div key={feature} className="flex items-center gap-3">
                  <div className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${plan.featured ? 'bg-indigo-500/20' : 'bg-white/5'}`}>
                    <CheckIcon className={`w-3 h-3 ${plan.featured ? 'text-indigo-400' : 'text-white/40'}`} />
                  </div>
                  <span className="text-sm text-white/70">{feature}</span>
                </div>
              ))}
            </div>

            <AnimatedButton
              label={plan.buttonText}
              onClick={() => toast.loading("Redirecting to Payment")} 
              Icon={CurrencyCircleDollarIcon}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default UpgradePage;