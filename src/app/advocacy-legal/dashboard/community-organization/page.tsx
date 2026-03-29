'use client';

import { useEffect, useState } from 'react';
import AdvocacyFrame from '../../components/AdvocacyFrame';
import { fetchAdvocacyCommunityDashboard, getCommunityDashboardSnapshot } from '@/app/lib/advocacyLegalClientStore';

export default function CommunityOrganizationDashboardPage() {
  const [snapshot, setSnapshot] = useState(() => getCommunityDashboardSnapshot());

  useEffect(() => {
    let active = true;
    setSnapshot(getCommunityDashboardSnapshot());
    (async () => {
      const server = await fetchAdvocacyCommunityDashboard();
      if (active && server && typeof server === 'object') {
        setSnapshot((prev) => ({ ...prev, ...(server as Partial<typeof prev>) }));
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <AdvocacyFrame title="Community Organization Dashboard" subtitle="Coordinate legal matters, campaigns, and member alerts.">
      <section className="grid gap-4 md:grid-cols-3">
        {[
          ['Open Cases', snapshot.openCases.toString()],
          ['Members Enrolled for Alerts', snapshot.alertMembers.toString()],
          ['Pro Bono Match Requests', snapshot.activeCampaignRequests.toString()]
        ].map(([k, v]) => (
          <article key={k} className="rounded-xl border border-[#d4af37]/20 bg-[#101112] p-4"><p className="text-xs text-gray-400">{k}</p><p className="mt-1 text-xl font-semibold text-white">{v}</p></article>
        ))}
      </section>
      <section className="rounded-xl border border-[#d4af37]/20 bg-[#101112] p-5">
        <p className="text-sm text-gray-300">Latest intake requests</p>
        <div className="mt-3 space-y-2">
          {snapshot.latestCases.length === 0 ? <p className="text-sm text-gray-500">No recent case intake submissions.</p> : snapshot.latestCases.map((row) => (
            <article key={row.id} className="rounded-lg border border-white/10 bg-black/25 p-3">
              <p className="text-sm text-white">{row.communityName}</p>
              <p className="text-xs text-gray-400">{row.urgency.toUpperCase()} urgency • {row.contactEmail}</p>
              {'workflowStatus' in row && row.workflowStatus ? (
                <p className="mt-1 text-[11px] text-[#d4af37]">
                  {String(row.workflowStatus).replace(/-/g, ' ')}
                  {'assignedAttorneyName' in row && row.assignedAttorneyName ? ` • ${String(row.assignedAttorneyName)}` : ''}
                </p>
              ) : null}
            </article>
          ))}
        </div>
      </section>
    </AdvocacyFrame>
  );
}
