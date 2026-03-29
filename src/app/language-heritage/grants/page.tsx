'use client';

import { useEffect, useState } from 'react';
import LanguageHeritageFrame from '../components/LanguageHeritageFrame';
import HeritageCardGrid from '../components/HeritageCardGrid';
import HeritageHeroBanner from '../components/HeritageHeroBanner';
import { fetchGrantOpportunities, type HeritageGrantOpportunity } from '@/app/lib/languageHeritageApi';

export default function Page() {
  const [opportunities, setOpportunities] = useState<HeritageGrantOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchGrantOpportunities();
        if (!mounted) return;
        setOpportunities(data);
      } catch (e) {
        if (!mounted) return;
        setError((e as Error).message || 'Failed to load grants');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void load();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <LanguageHeritageFrame title="Grant & Funding Opportunities" subtitle="Funding directories and grant support for language initiatives.">
      <HeritageHeroBanner
        eyebrow="Funding Engine"
        title="Active Grants for Language Revitalization"
        description="Find open funding calls, match by program type, and prepare applications with advisory support aligned to community protocol."
        image="https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1400&h=700&fit=crop"
        chips={['Rolling Calls', 'Deadline Alerts', 'Grant Support']}
        actions={[
          { href: '/language-heritage/consulting', label: 'Hire Grant Writers' },
          { href: '/language-heritage/contributor-dashboard', label: 'Open Project Dashboard', tone: 'secondary' }
        ]}
      />

      {loading ? <p className="text-sm text-gray-400">Loading opportunities...</p> : null}
      {!loading && error ? <p className="text-sm text-red-300">{error}</p> : null}

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {opportunities.map((grant) => (
          <article key={grant.id} className="rounded-xl border border-[#d4af37]/20 bg-[#101010] p-4">
            <p className="text-xs uppercase tracking-wide text-[#d4af37]">{grant.type}</p>
            <h3 className="mt-1 text-base font-semibold text-white">{grant.title}</h3>
            <p className="text-xs text-gray-400">{grant.sponsor}</p>
            <p className="mt-2 text-sm text-gray-300">{grant.summary}</p>
            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="text-[#d4af37]">{grant.amountLabel}</span>
              <span className="text-gray-400">{grant.deadlineLabel}</span>
            </div>
          </article>
        ))}
      </section>

      <HeritageCardGrid
        title="Application Pipeline"
        columns={3}
        items={[
          { title: 'Draft Stage', meta: '21 community applications in preparation', badge: 'Pipeline' },
          { title: 'Under Review', meta: '9 submissions awaiting decisions', badge: 'Review' },
          { title: 'Funded Projects', meta: '14 approved language initiatives', badge: 'Success' }
        ]}
      />
    </LanguageHeritageFrame>
  );
}
