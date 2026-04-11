'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { fetchMaterialsToolsSettingsOverview } from '@/app/lib/materialsToolsApi';
import type { MaterialsToolsActionType, MaterialsToolsSettingsOverview } from '@/app/lib/materialsToolsOps';
import type { MaterialsToolsLaunchAuditResponse } from '@/app/lib/materialsToolsApi';

const ACTION_ORDER: MaterialsToolsActionType[] = [
  'verified-supplier-application',
  'tool-library-application',
  'elder-approval-request',
  'wishlist',
  'listing-proof-document',
  'coop-commit'
];

const ACTION_LABELS: Record<MaterialsToolsActionType, string> = {
  'verified-supplier-application': 'Verified supplier',
  'tool-library-application': 'Tool library access',
  'elder-approval-request': 'Elder approval',
  wishlist: 'Sourcing wishlist',
  'listing-proof-document': 'Listing proof docs',
  'coop-commit': 'Co-op commitments'
};

function auditTone(ready: boolean) {
  return ready
    ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-200'
    : 'border-amber-400/30 bg-amber-500/10 text-amber-200';
}

export default function MaterialsToolsSettingsClient() {
  const [overview, setOverview] = useState<MaterialsToolsSettingsOverview | null>(null);
  const [audit, setAudit] = useState<MaterialsToolsLaunchAuditResponse | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMaterialsToolsSettingsOverview()
      .then((json) => {
        setOverview(json.overview);
        setAudit(json.audit);
      })
      .catch((nextError) => setError(nextError instanceof Error ? nextError.message : 'Unable to load Materials & Tools settings.'));
  }, []);

  const ready = useMemo(() => {
    if (!audit) return false;
    return audit.supabaseConfigured && audit.paymentWebhookConfigured && audit.counts.listings > 0 && audit.counts.suppliers > 0;
  }, [audit]);

  if (error) {
    return <div className="rounded-[28px] border border-rose-400/30 bg-rose-500/10 p-5 text-sm text-rose-200">{error}</div>;
  }

  if (!overview || !audit) {
    return <div className="rounded-[28px] border border-white/10 bg-black/20 p-5 text-sm text-[#d5cab8]">Loading Materials &amp; Tools settings...</div>;
  }

  return (
    <div className="space-y-5">
      <section className="grid gap-4 md:grid-cols-4">
        {[
          ['Pending', String(overview.counts.pending)],
          ['In review', String(overview.counts['in-review'])],
          ['Approved', String(overview.counts.approved)],
          ['Rejected', String(overview.counts.rejected)]
        ].map(([label, value]) => (
          <article key={label} className="rounded-2xl border border-[#9b6b2b]/25 bg-[#100d09] p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-[#bcae99]">{label}</p>
            <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.15fr,0.85fr]">
        <article className="rounded-[28px] border border-[#9b6b2b]/25 bg-[#100d09] p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[#d4af37]">Verification + applications</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Your Materials &amp; Tools access state</h2>
            </div>
            <span className={`rounded-full border px-3 py-1 text-xs ${auditTone(ready)}`}>
              {ready ? 'Operationally ready' : 'Still needs setup'}
            </span>
          </div>
          <div className="mt-5 grid gap-3">
            {ACTION_ORDER.map((actionType) => {
              const item = overview.latestByType[actionType];
              return (
                <article key={actionType} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-base font-semibold text-white">{ACTION_LABELS[actionType]}</p>
                      <p className="mt-1 text-sm text-[#d5cab8]">
                        {item ? item.summaryTitle : 'No request submitted yet.'}
                      </p>
                    </div>
                    <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-[#f2dfbf]">
                      {item ? item.reviewStatus : 'not started'}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-[#9fe5ea]">
                    {item ? item.summaryDetail : 'Open the related flow to start this lane.'}
                  </p>
                  {item?.reviewNote ? <p className="mt-2 text-sm text-[#f4c766]">Ops note: {item.reviewNote}</p> : null}
                </article>
              );
            })}
          </div>
        </article>

        <article className="rounded-[28px] border border-[#1d6b74]/25 bg-[#0d1314] p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-[#8fd7dc]">Launch audit</p>
          <div className="mt-4 space-y-3 text-sm text-[#d7f0f2]">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              Supabase: <span className="text-white">{audit.supabaseConfigured ? 'connected' : 'mock fallback'}</span>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              Proof storage: <span className="text-white">{audit.proofBucketConfigured ? 'configured' : 'local/runtime only'}</span>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              Payment webhook: <span className="text-white">{audit.paymentWebhookConfigured ? 'present' : 'missing'}</span>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              Counts: <span className="text-white">{audit.counts.listings} listings, {audit.counts.suppliers} suppliers, {audit.counts.orders} orders</span>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link href="/materials-tools/verified-supplier-application" className="rounded-full bg-[#d4af37] px-4 py-2 text-sm font-semibold text-black hover:bg-[#f0c96f]">
              Supplier verification
            </Link>
            <Link href="/materials-tools/tool-library-application" className="rounded-full border border-[#1d6b74]/35 px-4 py-2 text-sm text-[#9fe5ea] hover:bg-[#1d6b74]/10">
              Tool access
            </Link>
          </div>
        </article>
      </section>
    </div>
  );
}
