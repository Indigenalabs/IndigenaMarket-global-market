'use client';

import { useState } from 'react';
import HeritageAccessGate from '../components/HeritageAccessGate';
import LanguageHeritageFrame from '../components/LanguageHeritageFrame';
import HeritageLiveListings from '../components/HeritageLiveListings';
import HeritageHeroBanner from '../components/HeritageHeroBanner';

const tabs = [
  { id: 'archive', label: 'Archive Services', categoryId: 'archive-preservation-services' },
  { id: 'oral', label: 'Oral Histories', categoryId: 'oral-history-storytelling' },
  { id: 'sites', label: 'Heritage Sites', categoryId: 'heritage-sites-land-knowledge' }
] as const;

export default function Page() {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]['id']>('archive');
  const tab = tabs.find((entry) => entry.id === activeTab) || tabs[0];

  return (
    <LanguageHeritageFrame title="Digital Archive" subtitle="Advanced archive discovery across audio, video, text, and photos.">
      <HeritageHeroBanner
        eyebrow="Archive Index"
        title="Searchable Heritage Collections at Scale"
        description="Browse preservation services and oral-history collections with metadata-friendly organization for long-term stewardship."
        image="https://images.unsplash.com/photo-1511025311599-8c0f9f6f7a3f?w=1400&h=700&fit=crop"
        chips={['Metadata Templates', 'Long-Term Storage', 'Cross-Format Discovery']}
        placementId="heritage_institution_partner"
      />

      <section className="grid gap-3 rounded-xl border border-[#d4af37]/20 bg-[#101010] p-4 md:grid-cols-3">
        {tabs.map((entry) => (
          <button
            key={entry.id}
            type="button"
            onClick={() => setActiveTab(entry.id)}
            className={`rounded-lg border px-3 py-2 text-sm ${
              activeTab === entry.id
                ? 'border-[#d4af37]/50 bg-[#d4af37]/12 text-[#d4af37]'
                : 'border-[#d4af37]/20 bg-[#0b0b0b] text-gray-300 hover:border-[#d4af37]/35'
            }`}
          >
            {entry.label}
          </button>
        ))}
      </section>

      <HeritageAccessGate
        accessLevel="community"
        fallbackTitle="Archive index requires archive access"
        fallbackDetail="Browse the archive surface first, then unlock the live archive index with Community, All-Access, or an archive plan."
      >
        <HeritageLiveListings title={`Active View: ${tab.label}`} query={{ categoryId: tab.categoryId, sort: 'newest' }} />
      </HeritageAccessGate>

      <section className="grid gap-3 md:grid-cols-3">
        <div className="rounded-xl border border-[#d4af37]/20 bg-[#101010] p-4">
          <p className="text-xs uppercase tracking-wide text-[#d4af37]">Ingest Queue</p>
          <p className="mt-1 text-xl font-semibold text-white">184</p>
          <p className="text-xs text-gray-400">Assets waiting metadata completion</p>
        </div>
        <div className="rounded-xl border border-[#d4af37]/20 bg-[#101010] p-4">
          <p className="text-xs uppercase tracking-wide text-[#d4af37]">Recent Uploads</p>
          <p className="mt-1 text-xl font-semibold text-white">39</p>
          <p className="text-xs text-gray-400">Added in the last 7 days</p>
        </div>
        <div className="rounded-xl border border-[#d4af37]/20 bg-[#101010] p-4">
          <p className="text-xs uppercase tracking-wide text-[#d4af37]">Verified Collections</p>
          <p className="mt-1 text-xl font-semibold text-white">72%</p>
          <p className="text-xs text-gray-400">With protocol + rights tags complete</p>
        </div>
      </section>
    </LanguageHeritageFrame>
  );
}
