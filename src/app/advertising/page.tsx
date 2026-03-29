'use client';

import { useState } from 'react';
import { createEthicalAdApi } from '@/app/lib/ethicalAdvertisingApi';
import type { EthicalAdvertisingRecord } from '@/app/lib/ethicalAdvertising';

export default function AdvertisingPage() {
  const [feedback, setFeedback] = useState('');

  async function order(adType: EthicalAdvertisingRecord['adType'], placementScope: string) {
    try {
      const record = await createEthicalAdApi({ adType, partnerName: 'Aligned Partner', partnerEmail: 'partner@indigena.market', placementScope, creativeTitle: `${adType} creative`, issueLabel: 'Spring issue' });
      setFeedback(`Ethical ad submitted: ${record.adType} at ${record.priceAmount.toFixed(2)} USD. It will not go live until review approves it.`);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Unable to submit ethical advertising order.');
    }
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] px-6 py-12 text-white">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-[28px] border border-[#d4af37]/20 bg-[#111111] p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-[#d4af37]">Ethical advertising</p>
          <h1 className="mt-2 text-4xl font-semibold">Newsletter, sponsorship, events, sponsored content</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-400">This lane is separate from premium placements. Every order goes through cultural-appropriateness review and explicit labeling.</p>
        </section>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <button onClick={() => void order('newsletter-ad', 'newsletter')} className="rounded-[24px] border border-white/10 bg-[#111111] p-5 text-left"><p className="text-white font-semibold">Newsletter ad</p><p className="mt-2 text-sm text-gray-400">$350 per issue.</p></button>
          <button onClick={() => void order('pillar-sponsorship', 'digital-arts')} className="rounded-[24px] border border-white/10 bg-[#111111] p-5 text-left"><p className="text-white font-semibold">Pillar sponsorship</p><p className="mt-2 text-sm text-gray-400">$2,000 annual sponsorship.</p></button>
          <button onClick={() => void order('event-sponsorship', 'community-events')} className="rounded-[24px] border border-white/10 bg-[#111111] p-5 text-left"><p className="text-white font-semibold">Event sponsorship</p><p className="mt-2 text-sm text-gray-400">$500 event sponsor lane.</p></button>
          <button onClick={() => void order('sponsored-content', 'community-story')} className="rounded-[24px] border border-white/10 bg-[#111111] p-5 text-left"><p className="text-white font-semibold">Sponsored content</p><p className="mt-2 text-sm text-gray-400">$100 per approved story/post.</p></button>
        </div>
        {feedback ? <section className="rounded-[24px] border border-white/10 bg-[#111111] p-6 text-sm text-[#f3deb1]">{feedback}</section> : null}
      </div>
    </main>
  );
}
