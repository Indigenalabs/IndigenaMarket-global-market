'use client';

import { useMemo, useState } from 'react';
import LandFoodFrame from '../components/LandFoodFrame';

export default function SeedSwapPage() {
  const [offering, setOffering] = useState('');
  const [seeking, setSeeking] = useState('');
  const [region, setRegion] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const canSubmit = useMemo(() => offering.trim().length > 2 && seeking.trim().length > 2 && region.trim().length > 2, [offering, seeking, region]);

  const onCreate = () => {
    if (!canSubmit) {
      setStatus('error');
      return;
    }
    setStatus('success');
  };

  return (
    <LandFoodFrame title="Seed & Plant Swap / Barter Exchange" subtitle="Community-to-community exchange for seeds, starts, and stewardship materials.">
      <section className="grid gap-4 lg:grid-cols-[1.2fr,1fr]">
        <article className="rounded-xl border border-[#d4af37]/20 bg-[#10110f] p-5 space-y-3">
          <input value={offering} onChange={(e) => setOffering(e.target.value)} className="w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white" placeholder="What are you offering?" />
          <input value={seeking} onChange={(e) => setSeeking(e.target.value)} className="w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white" placeholder="What are you seeking?" />
          <input value={region} onChange={(e) => setRegion(e.target.value)} className="w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white" placeholder="Region / shipping corridor" />
          <button onClick={onCreate} className="rounded-full bg-[#d4af37] px-4 py-2 text-sm font-semibold text-black">Create Swap Listing</button>
          {status === 'success' ? <p className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">Swap listing published to verified barter board.</p> : null}
          {status === 'error' ? <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">Please fill all fields to create a swap listing.</p> : null}
        </article>
        <article className="rounded-xl border border-[#d4af37]/20 bg-[#10110f] p-5">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[#d4af37]">Barter Principles</h3>
          <ul className="mt-3 space-y-2 text-sm text-gray-300">
            <li>Exchange heirloom lines without replacing local keepers.</li>
            <li>Attach growing context and lineage notes.</li>
            <li>Respect community restrictions on sensitive varieties.</li>
            <li>Prefer reciprocal value over monetary pricing.</li>
          </ul>
        </article>
      </section>
    </LandFoodFrame>
  );
}
