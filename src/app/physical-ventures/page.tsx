'use client';

import { useState } from 'react';
import { createPhysicalVentureOrderApi } from '@/app/lib/physicalVenturesApi';
import type { PhysicalVentureRecord } from '@/app/lib/physicalVentures';

export default function PhysicalVenturesPage() {
  const [feedback, setFeedback] = useState('');

  async function order(ventureType: PhysicalVentureRecord['ventureType'], title: string) {
    try {
      const record = await createPhysicalVentureOrderApi({ ventureType, title, buyerName: 'Marketplace buyer', buyerEmail: 'buyer@indigena.market', quantity: 1 });
      setFeedback(`Physical venture order created: ${record.title} at ${record.revenueAmount.toFixed(2)} USD with ${(record.markupRate * 100).toFixed(0)}% markup.`);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Unable to create physical venture order.');
    }
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] px-6 py-12 text-white">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-[28px] border border-[#d4af37]/20 bg-[#111111] p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-[#d4af37]">Physical ventures</p>
          <h1 className="mt-2 text-4xl font-semibold">Seeds, foods, conservation fees, dyes, tool rentals</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-400">This phase turns the physical social-enterprise layer into a direct revenue system with tracked venture orders and markup economics.</p>
        </section>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">
          <button onClick={() => void order('native-seeds', 'Heirloom Seed Set')} className="rounded-[24px] border border-white/10 bg-[#111111] p-5 text-left"><p className="text-white font-semibold">Native seeds</p><p className="mt-2 text-sm text-gray-400">8% markup.</p></button>
          <button onClick={() => void order('indigenous-food-products', 'Wild Rice Pantry Box')} className="rounded-[24px] border border-white/10 bg-[#111111] p-5 text-left"><p className="text-white font-semibold">Food products</p><p className="mt-2 text-sm text-gray-400">6% markup.</p></button>
          <button onClick={() => void order('land-conservation-fees', 'Conservation Easement Admin')} className="rounded-[24px] border border-white/10 bg-[#111111] p-5 text-left"><p className="text-white font-semibold">Conservation fees</p><p className="mt-2 text-sm text-gray-400">3% admin fee.</p></button>
          <button onClick={() => void order('material-dyes-supplies', 'Natural Pigment Set')} className="rounded-[24px] border border-white/10 bg-[#111111] p-5 text-left"><p className="text-white font-semibold">Dyes & supplies</p><p className="mt-2 text-sm text-gray-400">5% markup.</p></button>
          <button onClick={() => void order('tool-rental-program', 'Studio Tool Rental')} className="rounded-[24px] border border-white/10 bg-[#111111] p-5 text-left"><p className="text-white font-semibold">Tool rental</p><p className="mt-2 text-sm text-gray-400">15% rental markup.</p></button>
        </div>
        {feedback ? <section className="rounded-[24px] border border-white/10 bg-[#111111] p-6 text-sm text-[#f3deb1]">{feedback}</section> : null}
      </div>
    </main>
  );
}
