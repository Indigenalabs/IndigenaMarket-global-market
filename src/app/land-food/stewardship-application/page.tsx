'use client';

import { useMemo, useState } from 'react';
import LandFoodFrame from '../components/LandFoodFrame';

export default function LandStewardshipApplicationPage() {
  const [organization, setOrganization] = useState('');
  const [location, setLocation] = useState('');
  const [outcomes, setOutcomes] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const canSubmit = useMemo(() => organization.trim().length > 2 && location.trim().length > 2 && outcomes.trim().length > 15, [organization, location, outcomes]);

  const onSubmit = () => {
    if (!canSubmit) {
      setStatus('error');
      return;
    }
    setStatus('success');
  };

  return (
    <LandFoodFrame title="Land Stewardship Application" subtitle="Apply to list conservation projects and stewardship services.">
      <section className="grid gap-4 lg:grid-cols-[1.2fr,1fr]">
        <article className="rounded-xl border border-[#d4af37]/20 bg-[#10110f] p-5 space-y-3">
          <input value={organization} onChange={(e) => setOrganization(e.target.value)} className="w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white" placeholder="Community / Organization" />
          <input value={location} onChange={(e) => setLocation(e.target.value)} className="w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white" placeholder="Project location" />
          <textarea value={outcomes} onChange={(e) => setOutcomes(e.target.value)} className="w-full min-h-28 rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white" placeholder="Describe stewardship methods and expected ecological outcomes" />
          <button onClick={onSubmit} className="rounded-full bg-[#d4af37] px-4 py-2 text-sm font-semibold text-black">Submit Application</button>
          {status === 'success' ? <p className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">Application received. Stewardship review queue opened.</p> : null}
          {status === 'error' ? <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">Please complete all fields before submitting.</p> : null}
        </article>
        <article className="rounded-xl border border-[#d4af37]/20 bg-[#10110f] p-5">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[#d4af37]">Assessment Criteria</h3>
          <ul className="mt-3 space-y-2 text-sm text-gray-300">
            <li>Community governance and consent model.</li>
            <li>Carbon + biodiversity evidence pathways.</li>
            <li>Monitoring cadence and reporting readiness.</li>
            <li>Stewardship team operational capacity.</li>
          </ul>
        </article>
      </section>
    </LandFoodFrame>
  );
}
