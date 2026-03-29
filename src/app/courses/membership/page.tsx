'use client';

import { useState } from 'react';
import { 
  Check,
  Crown,
  BookOpen,
  Users,
  Star,
  Award,
  Zap,
  ArrowRight,
  HelpCircle
} from 'lucide-react';

const plans = [
  {
    id: 'monthly',
    name: 'Monthly',
    price: 49,
    period: 'month',
    description: 'Perfect for trying out our platform',
    features: [
      'Access to all courses',
      'Download for offline viewing',
      'Certificate of completion',
      'Community forum access',
      'Cancel anytime',
    ],
    notIncluded: [
      'Live session priority',
      '1-on-1 instructor time',
    ],
    popular: false,
  },
  {
    id: 'yearly',
    name: 'Yearly',
    price: 399,
    period: 'year',
    description: 'Best value for serious learners',
    features: [
      'Everything in Monthly',
      '32% savings vs monthly',
      'Priority live session access',
      'Exclusive member events',
      'Early access to new courses',
      'Download all course materials',
    ],
    notIncluded: [
      '1-on-1 instructor time',
    ],
    popular: true,
  },
  {
    id: 'lifetime',
    name: 'Lifetime',
    price: 1499,
    period: 'one-time',
    description: 'One payment, forever access',
    features: [
      'Everything in Yearly',
      'Lifetime access to all courses',
      '2 hours 1-on-1 instructor time',
      'Personal learning advisor',
      'Exclusive mentorship program',
      'First access to beta features',
    ],
    notIncluded: [],
    popular: false,
  },
];

const stats = [
  { label: 'Active Courses', value: '200+', icon: BookOpen },
  { label: 'Expert Instructors', value: '50+', icon: Users },
  { label: 'Student Ratings', value: '4.8/5', icon: Star },
  { label: 'Certificates Issued', value: '10K+', icon: Award },
];

export default function MembershipPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-[#d4af37]/20 via-[#0a0a0a] to-[#DC143C]/10 py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#d4af37]/20 rounded-full mb-6">
            <Crown size={18} className="text-[#d4af37]" />
            <span className="text-[#d4af37] text-sm font-medium">Premium Membership</span>
          </div>
          <h1 className="text-5xl font-bold text-white mb-6">
            Unlock Unlimited <span className="text-[#d4af37]">Learning</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
            Get unlimited access to all courses, live sessions, and exclusive content 
            from indigenous knowledge keepers worldwide.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-[#141414]/50 backdrop-blur rounded-xl p-4 border border-[#d4af37]/20">
                <stat.icon size={24} className="text-[#d4af37] mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-gray-400 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <main className="max-w-6xl mx-auto p-6 -mt-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-[#141414] rounded-2xl border ${
                plan.popular 
                  ? 'border-[#d4af37] scale-105 shadow-xl shadow-[#d4af37]/10' 
                  : 'border-[#d4af37]/20'
              } p-6 flex flex-col`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-[#d4af37] to-[#b8941f] text-black text-sm font-medium rounded-full">
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-gray-400 text-sm">{plan.description}</p>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-bold text-white">{plan.price}</span>
                <span className="text-gray-400"> INDI</span>
                <span className="text-gray-500 text-sm">/{plan.period}</span>
              </div>

              <div className="flex-1 space-y-3 mb-6">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Check size={18} className="text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300 text-sm">{feature}</span>
                  </div>
                ))}
                {plan.notIncluded.map((feature, i) => (
                  <div key={i} className="flex items-start gap-3 opacity-50">
                    <div className="w-4 h-4 rounded-full border border-gray-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-500 text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              <button
                className={`w-full py-3 rounded-lg font-medium transition-all ${
                  plan.popular
                    ? 'bg-gradient-to-r from-[#d4af37] to-[#b8941f] text-black hover:shadow-lg hover:shadow-[#d4af37]/30'
                    : 'bg-[#0a0a0a] border border-[#d4af37]/30 text-[#d4af37] hover:bg-[#d4af37]/10'
                }`}
              >
                Get Started
              </button>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-white text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              {
                q: 'Can I cancel my subscription anytime?',
                a: 'Yes, you can cancel your subscription at any time. You\'ll continue to have access until the end of your billing period.'
              },
              {
                q: 'What happens to my certificates if I cancel?',
                a: 'All certificates you\'ve earned remain yours forever, even if you cancel your subscription.'
              },
              {
                q: 'Is there a student discount?',
                a: 'Yes! We offer 50% off for verified students. Contact our support team with your student ID.'
              },
              {
                q: 'Can I switch between plans?',
                a: 'Absolutely! You can upgrade or downgrade your plan at any time. Prorated charges will apply.'
              },
            ].map((faq, i) => (
              <div key={i} className="bg-[#141414] rounded-xl border border-[#d4af37]/20 p-5">
                <h3 className="text-white font-medium mb-2">{faq.q}</h3>
                <p className="text-gray-400 text-sm">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Guarantee */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-[#141414] rounded-full border border-[#d4af37]/20">
            <Zap size={20} className="text-[#d4af37]" />
            <span className="text-gray-300">30-day money-back guarantee • No questions asked</span>
          </div>
        </div>
      </main>
    </div>
  );
}
