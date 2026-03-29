'use client';

import { useEffect, useState } from 'react';
import LanguageHeritageFrame from '../components/LanguageHeritageFrame';
import HeritageCardGrid from '../components/HeritageCardGrid';
import HeritageHeroBanner from '../components/HeritageHeroBanner';
import { fetchContributorDashboard, type HeritageContributorDashboard } from '@/app/lib/languageHeritageApi';

const fallback: HeritageContributorDashboard = {
  materialsCount: 0,
  monthlyRevenue: 0,
  pendingApprovals: 0,
  metadataCompletionRate: 0,
  reviewSlaHours: 0,
  monthlyReach: 0
};

export default function Page() {
  const [dashboard, setDashboard] = useState<HeritageContributorDashboard>(fallback);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchContributorDashboard();
        if (!mounted) return;
        setDashboard(data);
      } catch (e) {
        if (!mounted) return;
        setError((e as Error).message || 'Failed to load contributor dashboard');
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
    <LanguageHeritageFrame title="Contributor & Elder Dashboard" subtitle="Upload, manage, and track language and heritage materials.">
      <HeritageHeroBanner
        eyebrow="Creator Operations"
        title="Manage Your Living Archive"
        description="Track submissions, review protocol requests, monitor earnings, and publish new materials while keeping community controls in place."
        image="https://images.unsplash.com/photo-1456324504439-367cee3b3c32?w=1400&h=700&fit=crop"
        chips={['Elder Verified', 'Revenue Tracking', 'Access Control']}
        actions={[
          { href: '/language-heritage/marketplace', label: 'Open Listings' },
          { href: '/language-heritage/sacred-request', label: 'Review Requests', tone: 'secondary' }
        ]}
      />

      {loading ? <p className="text-sm text-gray-400">Loading dashboard...</p> : null}
      {!loading && error ? <p className="text-sm text-red-300">{error}</p> : null}

      <section className="grid gap-3 md:grid-cols-4">
        {[
          { label: 'Materials', value: dashboard.materialsCount.toLocaleString() },
          { label: 'Monthly Revenue', value: `$${dashboard.monthlyRevenue.toLocaleString()}` },
          { label: 'Pending Approvals', value: dashboard.pendingApprovals.toString() },
          { label: 'Monthly Reach', value: dashboard.monthlyReach.toLocaleString() }
        ].map((item) => (
          <article key={item.label} className="rounded-xl border border-[#d4af37]/20 bg-[#101010] p-4">
            <p className="text-xs uppercase tracking-wide text-gray-400">{item.label}</p>
            <p className="mt-1 text-xl font-semibold text-white">{item.value}</p>
          </article>
        ))}
      </section>

      <HeritageCardGrid
        title="Dashboard Modules"
        items={[
          { title: 'My Materials', meta: 'Publish status, access tiers, and collection coverage', badge: 'Catalog', actionLabel: 'Manage Library' },
          { title: 'Earnings Snapshot', meta: 'Sales, licenses, and monthly payout estimates', badge: 'Revenue', actionLabel: 'View Payouts' },
          { title: 'Pending Signature Requests', meta: 'Sacred approvals awaiting Elder decision', badge: 'Approvals', actionLabel: 'Open Queue' },
          { title: 'Upload New Material', meta: 'Batch upload, metadata templates, protocol flags', badge: 'Create', actionLabel: 'Start Upload' }
        ]}
      />
      <HeritageCardGrid
        title="Health Signals"
        columns={3}
        items={[
          { title: 'Completion Rate', meta: `${dashboard.metadataCompletionRate}% metadata completeness`, badge: 'Quality' },
          { title: 'Review SLA', meta: `Avg approval time: ${dashboard.reviewSlaHours} hours`, badge: 'Ops' },
          { title: 'Community Reach', meta: `${dashboard.monthlyReach.toLocaleString()} active learners this month`, badge: 'Impact' }
        ]}
      />
    </LanguageHeritageFrame>
  );
}
