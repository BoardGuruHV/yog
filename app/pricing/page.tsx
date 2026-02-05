'use client';

/**
 * Pricing Page
 * Display subscription tiers and pricing
 */

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Check,
  X,
  Loader2,
  Sparkles,
  Zap,
  Crown,
  ChevronRight,
} from 'lucide-react';

interface PricingTier {
  name: string;
  tier: 'FREE' | 'PREMIUM' | 'PRO';
  price: number;
  interval: string;
  description: string;
  features: { name: string; included: boolean }[];
  popular?: boolean;
  icon: React.ReactNode;
}

const tiers: PricingTier[] = [
  {
    name: 'Free',
    tier: 'FREE',
    price: 0,
    interval: 'forever',
    description: 'Perfect for getting started with yoga practice',
    icon: <Sparkles className="w-6 h-6" />,
    features: [
      { name: '10 AI chats per day', included: true },
      { name: 'Create up to 3 programs', included: true },
      { name: 'Basic practice tracking', included: true },
      { name: 'Streaks & achievements', included: true },
      { name: 'AI program generation', included: false },
      { name: 'Pose detection', included: false },
      { name: 'Full analytics', included: false },
      { name: 'Offline access', included: false },
      { name: 'Priority support', included: false },
    ],
  },
  {
    name: 'Premium',
    tier: 'PREMIUM',
    price: 9.99,
    interval: 'month',
    description: 'For dedicated practitioners who want more',
    icon: <Zap className="w-6 h-6" />,
    popular: true,
    features: [
      { name: '50 AI chats per day', included: true },
      { name: 'Unlimited programs', included: true },
      { name: 'Advanced practice tracking', included: true },
      { name: 'Streaks & achievements', included: true },
      { name: 'AI program generation', included: true },
      { name: 'Pose detection', included: true },
      { name: 'Full analytics', included: true },
      { name: 'Offline access', included: true },
      { name: 'Priority support', included: false },
    ],
  },
  {
    name: 'Pro',
    tier: 'PRO',
    price: 19.99,
    interval: 'month',
    description: 'For serious practitioners and teachers',
    icon: <Crown className="w-6 h-6" />,
    features: [
      { name: 'Unlimited AI chats', included: true },
      { name: 'Unlimited programs', included: true },
      { name: 'Advanced practice tracking', included: true },
      { name: 'Streaks & achievements', included: true },
      { name: 'AI program generation', included: true },
      { name: 'Pose detection', included: true },
      { name: 'Full analytics', included: true },
      { name: 'Offline access', included: true },
      { name: 'Priority support', included: true },
    ],
  },
];

export default function PricingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (tierToSubscribe: 'PREMIUM' | 'PRO') => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/pricing');
      return;
    }

    setLoading(tierToSubscribe);

    try {
      const response = await fetch('/api/subscription/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier: tierToSubscribe }),
      });

      const data = await response.json();

      if (data.success && data.data?.url) {
        window.location.href = data.data.url;
      } else {
        console.error('Checkout error:', data);
        alert(data.error?.message || 'Failed to start checkout');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to start checkout');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-indigo-50 to-white py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Start your yoga journey with our free plan, or unlock advanced features
            with Premium or Pro.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {tiers.map((tier) => (
            <div
              key={tier.tier}
              className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all hover:shadow-xl ${
                tier.popular
                  ? 'border-indigo-500 scale-105'
                  : 'border-gray-100'
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-indigo-500 text-white text-sm font-medium px-4 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="p-8">
                {/* Icon & Name */}
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`p-2 rounded-lg ${
                      tier.tier === 'FREE'
                        ? 'bg-gray-100 text-gray-600'
                        : tier.tier === 'PREMIUM'
                        ? 'bg-indigo-100 text-indigo-600'
                        : 'bg-amber-100 text-amber-600'
                    }`}
                  >
                    {tier.icon}
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">{tier.name}</h2>
                </div>

                {/* Price */}
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">
                    ${tier.price}
                  </span>
                  <span className="text-gray-500">/{tier.interval}</span>
                </div>

                {/* Description */}
                <p className="text-gray-600 mb-6">{tier.description}</p>

                {/* CTA Button */}
                {tier.tier === 'FREE' ? (
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="w-full py-3 px-4 rounded-lg border-2 border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                  >
                    {session ? 'Go to Dashboard' : 'Get Started Free'}
                  </button>
                ) : (
                  <button
                    onClick={() => handleSubscribe(tier.tier as 'PREMIUM' | 'PRO')}
                    disabled={loading !== null}
                    className={`w-full py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                      tier.popular
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                        : 'bg-gray-900 text-white hover:bg-gray-800'
                    } disabled:opacity-50`}
                  >
                    {loading === tier.tier ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        Subscribe Now
                        <ChevronRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                )}

                {/* Features */}
                <div className="mt-8 space-y-4">
                  <p className="font-medium text-gray-900">Features included:</p>
                  {tier.features.map((feature, index) => (
                    <div
                      key={index}
                      className={`flex items-center gap-3 ${
                        feature.included ? 'text-gray-700' : 'text-gray-400'
                      }`}
                    >
                      {feature.included ? (
                        <Check className="w-5 h-5 text-green-500 shrink-0" />
                      ) : (
                        <X className="w-5 h-5 text-gray-300 shrink-0" />
                      )}
                      <span>{feature.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-20 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Questions? We&apos;ve got answers.
          </h2>
          <p className="text-gray-600 mb-8">
            Check out our{' '}
            <a href="/faq" className="text-indigo-600 hover:underline">
              FAQ page
            </a>{' '}
            or contact support.
          </p>
        </div>
      </div>
    </div>
  );
}
