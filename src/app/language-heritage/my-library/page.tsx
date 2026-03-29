'use client';

import { useState } from 'react';
import LanguageHeritageFrame from '../components/LanguageHeritageFrame';
import HeritageCardGrid from '../components/HeritageCardGrid';
import HeritageHeroBanner from '../components/HeritageHeroBanner';
import HeritageAccessGate from '../components/HeritageAccessGate';
import { fetchHeritageCitationBundle, fetchHeritageOfflinePack } from '@/app/lib/languageHeritageApi';

export default function Page() {
  const [feedback, setFeedback] = useState('');

  async function handleOfflinePack() {
    try {
      const bundle = await fetchHeritageOfflinePack();
      setFeedback(`Offline pack ready: ${bundle.fileName}`);
      if (bundle.downloadUrl) window.open(bundle.downloadUrl, '_blank', 'noopener,noreferrer');
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Unable to prepare offline pack.');
    }
  }

  async function handleCitationBundle() {
    try {
      const bundle = await fetchHeritageCitationBundle();
      setFeedback(bundle.citations?.join(' ') || `Citation bundle ready: ${bundle.fileName}`);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Unable to prepare citation bundle.');
    }
  }

  return (
    <LanguageHeritageFrame title="My Language Library" subtitle="Your purchases, saved items, and personal learning progress.">
      <HeritageHeroBanner
        eyebrow="Learner Space"
        title="Your Personal Language Collection"
        description="Track what you purchased, what you saved, and where to resume your learning across recordings, lessons, books, and tools."
        image="https://images.unsplash.com/photo-1512820790803-83ca734da794?w=1400&h=700&fit=crop"
        chips={['Receipts', 'Resume Learning', 'Offline Library']}
        actions={[
          { href: '/language-heritage/marketplace', label: 'Browse More Materials' },
          { href: '/language-heritage/languages', label: 'Explore Communities', tone: 'secondary' }
        ]}
      />
      <HeritageAccessGate
        accessLevel="community"
        fallbackTitle="Archive access required for downloadable library assets"
        fallbackDetail="Offline packs and saved library assets unlock with Community, All-Access, or archive access plans."
      >
        <section className="rounded-xl border border-[#d4af37]/20 bg-[#101010] p-4">
          <div className="flex flex-wrap gap-3">
            <button onClick={handleOfflinePack} className="rounded-full bg-[#d4af37] px-5 py-2 text-sm font-semibold text-black hover:bg-[#f4d370]">
              Download offline pack
            </button>
            <button onClick={handleCitationBundle} className="rounded-full border border-white/10 px-5 py-2 text-sm text-gray-300 hover:border-[#d4af37]/30 hover:text-white">
              Export citation bundle
            </button>
          </div>
          {feedback ? <div className="mt-4 rounded-xl border border-[#d4af37]/20 bg-[#d4af37]/10 px-4 py-3 text-sm text-[#f3deb1]">{feedback}</div> : null}
        </section>
      </HeritageAccessGate>
      <HeritageCardGrid
        title="Library Modules"
        items={[
          { title: 'Recently Accessed', meta: 'Jump back into your latest lessons and recordings', badge: 'Resume', actionLabel: 'Continue' },
          { title: 'My Purchases', meta: 'Receipts, licenses, and payment records', badge: 'Billing', actionLabel: 'Open Receipts' },
          { title: 'Saved Items', meta: 'Wishlist for future study paths', badge: 'Planning', actionLabel: 'View Wishlist' },
          { title: 'Learning Progress', meta: 'Milestones, streaks, and completion goals', badge: 'Progress', actionLabel: 'Track Progress' }
        ]}
      />
      <HeritageCardGrid
        title="Study Momentum"
        columns={3}
        items={[
          { title: 'Current Streak', meta: '23 days active', badge: 'Habit' },
          { title: 'Hours Logged', meta: '48.5 hours this month', badge: 'Time' },
          { title: 'Items Completed', meta: '12 courses and archives finished', badge: 'Completion' }
        ]}
      />
    </LanguageHeritageFrame>
  );
}
