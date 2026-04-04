'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchWithTimeout, parseApiError } from '@/app/lib/apiClient';
import type { SellerPermissionRecord, VerificationApplicationRecord } from '@/app/lib/indigenousVerification';

type VerificationStatusResponse = {
  applications: VerificationApplicationRecord[];
  activeApplication: VerificationApplicationRecord | null;
  permissions: SellerPermissionRecord;
};

export default function VerificationStatusClient({ profileSlug = '' }: { profileSlug?: string }) {
  const [data, setData] = useState<VerificationStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const query = profileSlug ? `?profileSlug=${encodeURIComponent(profileSlug)}` : '';
        const res = await fetchWithTimeout(`/api/verification/me${query}`, { cache: 'no-store' });
        if (!res.ok) throw new Error(await parseApiError(res, 'Unable to load verification status'));
        const json = (await res.json()) as { data?: VerificationStatusResponse };
        if (!active) return;
        setData(json.data || null);
      } catch (loadError) {
        if (!active) return;
        setError(loadError instanceof Error ? loadError.message : 'Unable to load verification status.');
      } finally {
        if (active) setLoading(false);
      }
    };

    void load();
    return () => {
      active = false;
    };
  }, [profileSlug]);

  const activeApplication = data?.activeApplication || null;
  const permissions = data?.permissions || null;

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-[#d4af37]/20 bg-[radial-gradient(circle_at_top,_rgba(212,175,55,0.14),_transparent_55%),#0d0d0d] p-6 md:p-8">
        <p className="text-xs uppercase tracking-[0.32em] text-[#d4af37]">Verification status</p>
        <h1 className="mt-3 text-3xl font-semibold text-white md:text-4xl">Track your seller trust status</h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-[#d2c6b4] md:text-base">
          This is the trust gate for selling, community storefront permissions, payout access, and verified fundraising lanes.
        </p>
      </section>

      {loading ? <section className="rounded-[28px] border border-white/10 bg-[#101010] p-6 text-sm text-gray-300">Loading verification status...</section> : null}
      {!loading && error ? <section className="rounded-[28px] border border-rose-500/20 bg-rose-500/10 p-6 text-sm text-rose-200">{error}</section> : null}

      {!loading && !error ? (
        <div className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
          <section className="space-y-6">
            <div className="rounded-[28px] border border-white/10 bg-[#101010] p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-[#c9b899]">Current application</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">{activeApplication ? activeApplication.applicantDisplayName : 'No application submitted yet'}</h2>
                </div>
                <span className="rounded-full border border-[#d4af37]/20 bg-[#d4af37]/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#f4df9b]">{activeApplication?.status || 'unverified'}</span>
              </div>
              {activeApplication ? (
                <>
                  <p className="mt-4 text-sm leading-7 text-gray-300">{activeApplication.statement}</p>
                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <StatusCard label="Verification lane" value={activeApplication.verificationType.replaceAll('_', ' ')} />
                    <StatusCard label="Submitted" value={activeApplication.submittedAt ? new Date(activeApplication.submittedAt).toLocaleString() : 'n/a'} />
                    <StatusCard label="Nation or people" value={activeApplication.nationName || 'Not provided'} />
                    <StatusCard label="Community" value={activeApplication.communityName || activeApplication.communitySlug || 'Not provided'} />
                  </div>
                  <div className="mt-5 rounded-[24px] border border-white/10 bg-black/20 p-5">
                    <p className="text-sm font-semibold text-white">Evidence summary</p>
                    <p className="mt-2 text-sm leading-7 text-gray-300">{activeApplication.evidenceSummary || 'No evidence summary recorded.'}</p>
                    {activeApplication.endorsementSummary ? <><p className="mt-4 text-sm font-semibold text-white">Endorsement summary</p><p className="mt-2 text-sm leading-7 text-gray-300">{activeApplication.endorsementSummary}</p></> : null}
                    {activeApplication.decisionNotes ? <><p className="mt-4 text-sm font-semibold text-white">Decision notes</p><p className="mt-2 text-sm leading-7 text-gray-300">{activeApplication.decisionNotes}</p></> : null}
                  </div>
                </>
              ) : (
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link href={`/verification/apply${profileSlug ? `?profileSlug=${encodeURIComponent(profileSlug)}` : ''}`} className="rounded-full bg-[#d4af37] px-5 py-3 text-sm font-semibold text-black hover:bg-[#efca6b]">Start verification</Link>
                </div>
              )}
            </div>

            <div className="rounded-[28px] border border-white/10 bg-[#101010] p-6">
              <p className="text-xs uppercase tracking-[0.28em] text-[#c9b899]">Application history</p>
              <div className="mt-4 space-y-3">
                {(data?.applications || []).map((application) => (
                  <div key={application.id} className="rounded-[22px] border border-white/10 bg-black/20 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-white">{application.verificationType.replaceAll('_', ' ')}</p>
                        <p className="mt-1 text-xs text-gray-400">{application.createdAt ? new Date(application.createdAt).toLocaleString() : 'n/a'}</p>
                      </div>
                      <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-gray-300">{application.status}</span>
                    </div>
                  </div>
                ))}
                {(data?.applications || []).length === 0 ? <p className="text-sm text-gray-500">No verification history yet.</p> : null}
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <section className="rounded-[28px] border border-white/10 bg-[#101010] p-6">
              <p className="text-xs uppercase tracking-[0.28em] text-[#d4af37]">Seller permissions</p>
              <div className="mt-4 grid gap-3">
                <PermissionRow label="Can sell" value={permissions?.canSell || false} />
                <PermissionRow label="Can receive payouts" value={permissions?.canReceivePayouts || false} />
                <PermissionRow label="Can launch verified campaigns" value={permissions?.canLaunchVerifiedCampaigns || false} />
                <PermissionRow label="Can create community storefronts" value={permissions?.canCreateCommunityStorefronts || false} />
                <PermissionRow label="Can publish sensitive cultural content" value={permissions?.canPublishSensitiveContent || false} />
              </div>
            </section>
            <section className="rounded-[28px] border border-white/10 bg-[#101010] p-6">
              <p className="text-xs uppercase tracking-[0.28em] text-[#c9b899]">Need help?</p>
              <p className="mt-3 text-sm leading-7 text-gray-300">If your application needs more context, use community or elder endorsements and keep your evidence summary specific to your role on the platform.</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link href={`/verification/apply${profileSlug ? `?profileSlug=${encodeURIComponent(profileSlug)}` : ''}`} className="rounded-full border border-white/10 px-4 py-2 text-sm text-gray-300 hover:border-[#d4af37]/30 hover:text-white">Submit another application</Link>
                <Link href="/creator-hub" className="rounded-full border border-white/10 px-4 py-2 text-sm text-gray-300 hover:border-[#d4af37]/30 hover:text-white">Back to Creator Hub</Link>
              </div>
            </section>
          </aside>
        </div>
      ) : null}
    </div>
  );
}

function StatusCard({ label, value }: { label: string; value: string }) {
  return <div className="rounded-[20px] border border-white/10 bg-black/20 p-4"><p className="text-xs uppercase tracking-[0.18em] text-gray-500">{label}</p><p className="mt-2 text-sm font-medium text-white">{value}</p></div>;
}

function PermissionRow({ label, value }: { label: string; value: boolean }) {
  return <div className="flex items-center justify-between rounded-[20px] border border-white/10 bg-black/20 px-4 py-3"><span className="text-sm text-gray-300">{label}</span><span className={`rounded-full px-3 py-1 text-xs font-semibold ${value ? 'bg-emerald-500/15 text-emerald-300' : 'bg-white/10 text-gray-400'}`}>{value ? 'Enabled' : 'Locked'}</span></div>;
}
