'use client';

import { useMemo, useState } from 'react';
import LanguageHeritageFrame from '../components/LanguageHeritageFrame';
import HeritageLiveListings from '../components/HeritageLiveListings';
import HeritageHeroBanner from '../components/HeritageHeroBanner';

export default function Page() {
  const [checks, setChecks] = useState({
    identity: false,
    protocol: false,
    purpose: false
  });

  const readiness = useMemo(() => Object.values(checks).filter(Boolean).length, [checks]);

  return (
    <LanguageHeritageFrame title="Sacred & Restricted Materials Portal" subtitle="Protocol-controlled gateway for community and elder-approved content.">
      <HeritageHeroBanner
        eyebrow="Protected Knowledge"
        title="Sacred Materials Under Community Authority"
        description="This portal enforces cultural protocol, identity checks, and Elder-reviewed access before restricted materials are unlocked."
        image="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1400&h=700&fit=crop"
        chips={['Elder Signature', 'Restricted Access', 'Consent Logged']}
        actions={[
          { href: '/language-heritage/sacred-request', label: 'Submit Access Request' },
          { href: '/language-heritage/community-portal', label: 'Go to Community Portal', tone: 'secondary' }
        ]}
        placementId="heritage_newsletter_feature"
      />

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200 md:col-span-2">
          Cultural protocol notice: access requires verified identity, purpose declaration, and explicit consent acknowledgment.
        </div>
        <div className="rounded-xl border border-[#d4af37]/20 bg-[#101010] p-4">
          <p className="text-xs uppercase tracking-wide text-[#d4af37]">Readiness</p>
          <p className="mt-1 text-2xl font-semibold text-white">{readiness}/3</p>
          <p className="text-xs text-gray-400">Complete checks before requesting access.</p>
        </div>
      </section>

      <section className="grid gap-3 rounded-xl border border-[#d4af37]/20 bg-[#101010] p-4 md:grid-cols-3">
        <label className="flex items-center gap-2 rounded-lg border border-[#d4af37]/20 bg-[#0b0b0b] px-3 py-2 text-sm text-gray-200">
          <input
            type="checkbox"
            checked={checks.identity}
            onChange={(e) => setChecks((prev) => ({ ...prev, identity: e.target.checked }))}
            className="h-4 w-4 accent-[#d4af37]"
          />
          I can verify identity / affiliation
        </label>
        <label className="flex items-center gap-2 rounded-lg border border-[#d4af37]/20 bg-[#0b0b0b] px-3 py-2 text-sm text-gray-200">
          <input
            type="checkbox"
            checked={checks.protocol}
            onChange={(e) => setChecks((prev) => ({ ...prev, protocol: e.target.checked }))}
            className="h-4 w-4 accent-[#d4af37]"
          />
          I accept protocol and usage terms
        </label>
        <label className="flex items-center gap-2 rounded-lg border border-[#d4af37]/20 bg-[#0b0b0b] px-3 py-2 text-sm text-gray-200">
          <input
            type="checkbox"
            checked={checks.purpose}
            onChange={(e) => setChecks((prev) => ({ ...prev, purpose: e.target.checked }))}
            className="h-4 w-4 accent-[#d4af37]"
          />
          I can provide a valid purpose statement
        </label>
      </section>

      <HeritageLiveListings title="Restricted Materials" query={{ categoryId: 'sacred-protocol-materials', sort: 'featured' }} />
    </LanguageHeritageFrame>
  );
}
