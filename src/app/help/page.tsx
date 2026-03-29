'use client';

import { useEffect, useState } from 'react';
import { 
  Search,
  BookOpen,
  MessageCircle,
  Mail,
  Phone,
  ChevronDown,
  ChevronRight,
  FileText,
  PlayCircle,
  Shield,
  CreditCard,
  User,
  HelpCircle
} from 'lucide-react';
import Link from 'next/link';

const faqCategories = [
  {
    id: 'getting-started',
    name: 'Getting Started',
    icon: BookOpen,
    faqs: [
      {
        q: 'How do I enroll in a course?',
        a: 'Browse our course catalog, select a course that interests you, and click the "Enroll" button. You can pay with INDI tokens or start a free trial for eligible courses.'
      },
      {
        q: 'What are the system requirements?',
        a: 'Our platform works on any modern web browser (Chrome, Firefox, Safari, Edge). For the best experience, we recommend a stable internet connection of at least 5 Mbps.'
      },
      {
        q: 'Can I access courses on mobile?',
        a: 'Yes! Our platform is fully responsive and works on all devices. You can also download content for offline viewing on our mobile app.'
      },
    ]
  },
  {
    id: 'payments',
    name: 'Payments & Billing',
    icon: CreditCard,
    faqs: [
      {
        q: 'What payment methods do you accept?',
        a: 'We accept INDI tokens (our native cryptocurrency), XRP, and major credit cards. All transactions are secured on the XRPL blockchain.'
      },
      {
        q: 'How do I get a refund?',
        a: 'We offer a 30-day money-back guarantee for all courses. If you\'re not satisfied, contact our support team for a full refund.'
      },
      {
        q: 'What is the membership subscription?',
        a: 'Our membership gives you unlimited access to all courses for a monthly or yearly fee. You can cancel anytime.'
      },
    ]
  },
  {
    id: 'certificates',
    name: 'Certificates & Credentials',
    icon: Shield,
    faqs: [
      {
        q: 'Are certificates verified on the blockchain?',
        a: 'Yes! All completion certificates are minted as NFTs on the XRPL blockchain, making them verifiable and tamper-proof.'
      },
      {
        q: 'How do I share my certificate?',
        a: 'You can share your certificate via a unique link, download it as a PDF, or add it to your LinkedIn profile directly from your certificate page.'
      },
    ]
  },
  {
    id: 'instructors',
    name: 'For Instructors',
    icon: User,
    faqs: [
      {
        q: 'How do I become an instructor?',
        a: 'Apply through our instructor portal. We review applications based on expertise, teaching ability, and alignment with our mission.'
      },
      {
        q: 'How much can I earn?',
        a: 'Instructors keep 70% of course revenue. Top instructors earn thousands of INDI tokens monthly.'
      },
    ]
  },
];

const quickLinks = [
  { name: 'Video Tutorials', icon: PlayCircle, href: '#' },
  { name: 'Documentation', icon: FileText, href: '#' },
  { name: 'Community Forum', icon: MessageCircle, href: '/courses/forum' },
];

export default function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategory, setExpandedCategory] = useState<string | null>('getting-started');
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const section = (params.get('section') || '').trim();
    if (!section) return;
    const target = document.getElementById(section);
    if (!target) return;
    requestAnimationFrame(() => {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, []);

  const filteredCategories = faqCategories.map(cat => ({
    ...cat,
    faqs: cat.faqs.filter(faq => 
      faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(cat => cat.faqs.length > 0);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#d4af37]/20 via-[#0a0a0a] to-[#DC143C]/10 py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-16 h-16 bg-[#d4af37]/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <HelpCircle size={32} className="text-[#d4af37]" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Help Center</h1>
          <p className="text-gray-400 max-w-xl mx-auto mb-8">
            Find answers to common questions or contact our support team
          </p>
          <div className="relative max-w-xl mx-auto">
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search for help..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#141414] border border-[#d4af37]/20 rounded-xl pl-12 pr-4 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#d4af37]"
            />
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-[#141414] rounded-xl border border-[#d4af37]/20 p-5 mb-6">
              <h3 className="text-white font-medium mb-4">Quick Links</h3>
              <div className="space-y-2">
                {quickLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#0a0a0a] transition-colors"
                  >
                    <link.icon size={18} className="text-[#d4af37]" />
                    <span className="text-gray-300">{link.name}</span>
                  </Link>
                ))}
              </div>
            </div>

            <div id="contact" className="bg-[#141414] rounded-xl border border-[#d4af37]/20 p-5 scroll-mt-24">
              <h3 className="text-white font-medium mb-4">Contact Us</h3>
              <div className="space-y-3">
                <a href="mailto:support@indigena.com" className="flex items-center gap-3 text-gray-400 hover:text-[#d4af37] transition-colors">
                  <Mail size={18} />
                  <span>support@indigena.com</span>
                </a>
                <a href="tel:+1-800-INDIGENA" className="flex items-center gap-3 text-gray-400 hover:text-[#d4af37] transition-colors">
                  <Phone size={18} />
                  <span>1-800-INDIGENA</span>
                </a>
              </div>
              <p className="text-gray-500 text-sm mt-4">
                Available 24/7 for urgent issues
              </p>
            </div>
          </div>

          {/* FAQ Content */}
          <div className="lg:col-span-2">
            <div className="space-y-4 mb-6">
              <section id="terms" className="bg-[#141414] rounded-xl border border-[#d4af37]/20 p-5 scroll-mt-24">
                <h2 className="text-white font-medium mb-2">Terms</h2>
                <p className="text-sm text-gray-400">
                  Marketplace purchases, bookings, subscriptions, and creator payouts are governed by platform transaction,
                  refund, and dispute rules shown at checkout and inside Creator Hub.
                </p>
              </section>
              <section id="privacy" className="bg-[#141414] rounded-xl border border-[#d4af37]/20 p-5 scroll-mt-24">
                <h2 className="text-white font-medium mb-2">Privacy</h2>
                <p className="text-sm text-gray-400">
                  Wallet identity, profile activity, purchase records, and protected archive access are handled under platform
                  privacy and governance controls. Sensitive cultural materials remain subject to community protocol rules.
                </p>
              </section>
            </div>
            {searchQuery && filteredCategories.length === 0 ? (
              <div className="text-center py-12">
                <HelpCircle size={48} className="text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No results found for &quot;{searchQuery}&quot;</p>
                <p className="text-gray-500 text-sm mt-2">Try different keywords or contact support</p>
              </div>
            ) : (
              <div className="space-y-4">
                {(searchQuery ? filteredCategories : faqCategories).map((category) => (
                  <div
                    key={category.id}
                    className="bg-[#141414] rounded-xl border border-[#d4af37]/20 overflow-hidden"
                  >
                    <button
                      onClick={() => setExpandedCategory(
                        expandedCategory === category.id ? null : category.id
                      )}
                      className="w-full flex items-center justify-between p-5 hover:bg-[#0a0a0a] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#d4af37]/20 rounded-lg flex items-center justify-center">
                          <category.icon size={20} className="text-[#d4af37]" />
                        </div>
                        <span className="text-white font-medium">{category.name}</span>
                      </div>
                      <ChevronDown
                        size={20}
                        className={`text-gray-400 transition-transform ${
                          expandedCategory === category.id ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {expandedCategory === category.id && (
                      <div className="border-t border-[#d4af37]/10">
                        {category.faqs.map((faq, index) => (
                          <div
                            key={index}
                            className="border-b border-[#d4af37]/10 last:border-0"
                          >
                            <button
                              onClick={() => setExpandedFaq(
                                expandedFaq === `${category.id}-${index}` ? null : `${category.id}-${index}`
                              )}
                              className="w-full flex items-center justify-between p-4 text-left hover:bg-[#0a0a0a] transition-colors"
                            >
                              <span className="text-gray-300">{faq.q}</span>
                              <ChevronRight
                                size={16}
                                className={`text-gray-500 transition-transform ${
                                  expandedFaq === `${category.id}-${index}` ? 'rotate-90' : ''
                                }`}
                              />
                            </button>
                            {expandedFaq === `${category.id}-${index}` && (
                              <div className="px-4 pb-4">
                                <p className="text-gray-400 text-sm pl-4 border-l-2 border-[#d4af37]/30">
                                  {faq.a}
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
