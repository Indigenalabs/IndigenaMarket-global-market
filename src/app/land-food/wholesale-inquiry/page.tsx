'use client';

import { useMemo, useState } from 'react';
import LandFoodFrame from '../components/LandFoodFrame';

export default function WholesaleInquiryPage() {
  const [org, setOrg] = useState('');
  const [volume, setVolume] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const canSubmit = useMemo(() => org.trim().length > 2 && volume.trim().length > 2 && notes.trim().length > 12, [org, volume, notes]);

  const onSubmit = () => {
    if (!canSubmit) {
      setStatus('error');
      return;
    }
    setStatus('success');
  };

  return (
    <LandFoodFrame title="Bulk / Wholesale Inquiry" subtitle="Institutional and retail bulk purchasing for food and materials.">
      <section className="grid gap-4 lg:grid-cols-[1.2fr,1fr]">
        <article className="rounded-xl border border-[#d4af37]/20 bg-[#10110f] p-5 space-y-3">
          <input value={org} onChange={(e) => setOrg(e.target.value)} className="w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white" placeholder="Organization name" />
          <input value={volume} onChange={(e) => setVolume(e.target.value)} className="w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white" placeholder="Volume requirements" />
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full min-h-28 rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white" placeholder="Describe categories and delivery timelines" />
          <button onClick={onSubmit} className="rounded-full bg-[#d4af37] px-4 py-2 text-sm font-semibold text-black">Submit Wholesale Inquiry</button>
          {status === 'success' ? <p className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">Inquiry received. Procurement team will respond within 2 business days.</p> : null}
          {status === 'error' ? <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">Please complete all fields before submitting.</p> : null}
        </article>
        <article className="rounded-xl border border-[#d4af37]/20 bg-[#10110f] p-5">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[#d4af37]">Wholesale Program</h3>
          <ul className="mt-3 space-y-2 text-sm text-gray-300">
            <li>Direct producer contracts with verification tiers.</li>
            <li>Seasonal allocation windows and reorder forecasts.</li>
            <li>Traceability packet for each shipment lot.</li>
            <li>Optional stewardship contribution line item.</li>
          </ul>
        </article>
      </section>
    </LandFoodFrame>
  );
}
