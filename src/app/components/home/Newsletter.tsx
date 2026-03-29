'use client';

import { useState } from 'react';
import { Mail, ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubmitted(true);
      setTimeout(() => setIsSubmitted(false), 3000);
      setEmail('');
    }
  };

  return (
    <section className="py-16 px-6 bg-gradient-to-r from-[#8B0000] via-[#DC143C] to-[#8B0000] relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="max-w-4xl mx-auto text-center relative z-10">
        {/* Icon */}
        <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-6">
          <Sparkles size={32} className="text-white" />
        </div>

        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Join the <span className="text-[#f4e4a6]">Circle</span>
        </h2>
        <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
          Be the first to discover new Indigenous artists, exclusive drops, and community stories. 
          Join our circle of supporters preserving culture through art.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
          <div className="flex-1 relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full pl-12 pr-4 py-4 rounded-full bg-white/10 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:border-white focus:bg-white/20 transition-all"
              required
            />
          </div>
          <button
            type="submit"
            className="px-8 py-4 bg-[#d4af37] text-black font-semibold rounded-full hover:bg-[#f4e4a6] transition-all flex items-center justify-center gap-2 group"
          >
            <span>Subscribe</span>
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        {/* Success Message */}
        {isSubmitted && (
          <p className="mt-4 text-[#f4e4a6] font-medium">
            Welcome to the Circle! Check your email for confirmation.
          </p>
        )}

        {/* Trust Badges */}
        <div className="mt-8 flex items-center justify-center gap-6 text-white/60 text-sm">
          <span>No spam, ever</span>
          <span className="w-1 h-1 rounded-full bg-white/40" />
          <span>Unsubscribe anytime</span>
          <span className="w-1 h-1 rounded-full bg-white/40" />
          <span>Join 10,000+ members</span>
        </div>

        {/* Partner Banner */}
        <div className="mt-10 pt-8 border-t border-white/20">
          <p className="text-white/60 text-xs mb-3 uppercase tracking-wider">⭐ Newsletter Partner</p>
          <div className="flex flex-wrap items-center justify-center gap-6">
            <Link href="/insights" className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
              <span className="text-white text-sm">Smithsonian NMAI</span>
            </Link>
            <Link href="/seva/impact-services" className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
              <span className="text-white text-sm">First Nations Development</span>
            </Link>
            <Link href="/advertising" className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
              <span className="text-white text-sm">Native Arts Fund</span>
            </Link>
          </div>
          <p className="text-white/40 text-xs mt-3">Supporting Indigenous artists and cultural preservation</p>
        </div>
      </div>
    </section>
  );
}
