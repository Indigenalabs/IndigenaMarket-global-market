'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { requireWalletAction } from '@/app/lib/requireWalletAction';
import { fetchWithTimeout, parseApiError } from '@/app/lib/apiClient';

const VERIFICATION_TYPE_OPTIONS = [
  {
    id: 'individual_indigenous_seller',
    label: 'Individual Indigenous seller',
    detail: 'For artists, makers, educators, guides, and service providers selling under their own name.'
  },
  {
    id: 'nation_community_seller',
    label: 'Nation or community seller',
    detail: 'For councils, community storefronts, co-ops, and other representative selling entities.'
  },
  {
    id: 'elder_cultural_authority',
    label: 'Elder or cultural authority',
    detail: 'For people approving culturally sensitive material, access requests, or ceremonial permissions.'
  },
  {
    id: 'partner_institution',
    label: 'Partner or institution',
    detail: 'For non-Indigenous organizations operating in a reviewed partner lane without claiming Indigenous seller status.'
  }
] as const;

export default function VerificationApplyClient({ profileSlug = '' }: { profileSlug?: string }) {
  const router = useRouter();
  const [verificationType, setVerificationType] = useState<(typeof VERIFICATION_TYPE_OPTIONS)[number]['id']>('individual_indigenous_seller');
  const [applicantDisplayName, setApplicantDisplayName] = useState('');
  const [nationName, setNationName] = useState('');
  const [communityName, setCommunityName] = useState('');
  const [communitySlug, setCommunitySlug] = useState(profileSlug);
  const [statement, setStatement] = useState('');
  const [evidenceSummary, setEvidenceSummary] = useState('');
  const [endorsementSummary, setEndorsementSummary] = useState('');
  const [endorserName, setEndorserName] = useState('');
  const [endorserRole, setEndorserRole] = useState('');
  const [endorserNote, setEndorserNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState('');

  const selectedType = useMemo(
    () => VERIFICATION_TYPE_OPTIONS.find((option) => option.id === verificationType) || VERIFICATION_TYPE_OPTIONS[0],
    [verificationType]
  );

  async function submit() {
    setSubmitting(true);
    setFeedback('');
    try {
      await requireWalletAction('submit your verification application');
      const res = await fetchWithTimeout('/api/verification/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verificationType,
          applicantDisplayName,
          nationName,
          communityName,
          communitySlug,
          profileSlug,
          statement,
          evidenceSummary,
          endorsementSummary,
          endorsements:
            endorserName && endorserRole
              ? [
                  {
                    endorserName,
                    endorserRole,
                    endorsementType: 'community_attestation',
                    note: endorserNote
                  }
                ]
              : []
        })
      });
      if (!res.ok) throw new Error(await parseApiError(res, 'Unable to submit verification application'));
      const json = (await res.json()) as { data?: { application?: { id?: string } } };
      const applicationId = String(json?.data?.application?.id || '').trim();
      router.push(`/verification/status${applicationId ? `?applicationId=${encodeURIComponent(applicationId)}` : ''}`);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Unable to submit verification application.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-[#d4af37]/20 bg-[radial-gradient(circle_at_top,_rgba(212,175,55,0.14),_transparent_55%),#0d0d0d] p-6 md:p-8">
        <p className="text-xs uppercase tracking-[0.32em] text-[#d4af37]">Seller verification</p>
        <h1 className="mt-3 text-3xl font-semibold text-white md:text-4xl">Apply to become a verified Indigenous seller</h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-[#d2c6b4] md:text-base">
          We use community-aware review instead of a one-document gate. You can submit nation or community details,
          explain your connection, and include endorsements where they make sense.
        </p>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr,0.8fr]">
        <div className="space-y-6 rounded-[32px] border border-white/10 bg-[#101010] p-6 md:p-8">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-[#c9b899]">Verification lane</p>
            <div className="mt-4 grid gap-3">
              {VERIFICATION_TYPE_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setVerificationType(option.id)}
                  className={`rounded-[24px] border p-4 text-left transition ${
                    verificationType === option.id
                      ? 'border-[#d4af37]/35 bg-[#d4af37]/10'
                      : 'border-white/10 bg-black/20 hover:border-[#d4af37]/20'
                  }`}
                >
                  <p className="text-sm font-semibold text-white">{option.label}</p>
                  <p className="mt-2 text-sm leading-6 text-gray-400">{option.detail}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm text-[#d9ccbb]">
              <span>Applicant name</span>
              <input value={applicantDisplayName} onChange={(event) => setApplicantDisplayName(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-white outline-none focus:border-[#d4af37]/35" placeholder="Your name or community representative name" />
            </label>
            <label className="space-y-2 text-sm text-[#d9ccbb]">
              <span>Nation or people</span>
              <input value={nationName} onChange={(event) => setNationName(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-white outline-none focus:border-[#d4af37]/35" placeholder="Optional but recommended" />
            </label>
            <label className="space-y-2 text-sm text-[#d9ccbb]">
              <span>Community name</span>
              <input value={communityName} onChange={(event) => setCommunityName(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-white outline-none focus:border-[#d4af37]/35" placeholder="Community, collective, or council name" />
            </label>
            <label className="space-y-2 text-sm text-[#d9ccbb]">
              <span>Community slug</span>
              <input value={communitySlug} onChange={(event) => setCommunitySlug(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-white outline-none focus:border-[#d4af37]/35" placeholder="riverstone-arts-council" />
            </label>
          </div>

          <label className="block space-y-2 text-sm text-[#d9ccbb]">
            <span>Your statement</span>
            <textarea value={statement} onChange={(event) => setStatement(event.target.value)} rows={6} className="w-full rounded-[24px] border border-white/10 bg-black/25 px-4 py-3 text-white outline-none focus:border-[#d4af37]/35" placeholder="Explain your connection, your work, and why you are applying to sell on Indigena." />
          </label>

          <label className="block space-y-2 text-sm text-[#d9ccbb]">
            <span>Evidence summary</span>
            <textarea value={evidenceSummary} onChange={(event) => setEvidenceSummary(event.target.value)} rows={5} className="w-full rounded-[24px] border border-white/10 bg-black/25 px-4 py-3 text-white outline-none focus:border-[#d4af37]/35" placeholder="List the forms of evidence you can provide: community letter, enrollment document, council endorsement, portfolio history, or similar." />
          </label>

          <label className="block space-y-2 text-sm text-[#d9ccbb]">
            <span>Endorsement summary</span>
            <textarea value={endorsementSummary} onChange={(event) => setEndorsementSummary(event.target.value)} rows={4} className="w-full rounded-[24px] border border-white/10 bg-black/25 px-4 py-3 text-white outline-none focus:border-[#d4af37]/35" placeholder="Optional: summarize any elder, council, or community endorsement that supports your application." />
          </label>

          <div className="rounded-[24px] border border-white/10 bg-black/20 p-5">
            <p className="text-sm font-semibold text-white">Add one endorsement contact now if you have one</p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm text-[#d9ccbb]">
                <span>Endorser name</span>
                <input value={endorserName} onChange={(event) => setEndorserName(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-white outline-none focus:border-[#d4af37]/35" placeholder="Name" />
              </label>
              <label className="space-y-2 text-sm text-[#d9ccbb]">
                <span>Endorser role</span>
                <input value={endorserRole} onChange={(event) => setEndorserRole(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-white outline-none focus:border-[#d4af37]/35" placeholder="Elder, council member, community lead" />
              </label>
            </div>
            <label className="mt-4 block space-y-2 text-sm text-[#d9ccbb]">
              <span>Endorser note</span>
              <textarea value={endorserNote} onChange={(event) => setEndorserNote(event.target.value)} rows={3} className="w-full rounded-[20px] border border-white/10 bg-black/25 px-4 py-3 text-white outline-none focus:border-[#d4af37]/35" placeholder="Optional note summarizing their support." />
            </label>
          </div>

          {feedback ? <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{feedback}</div> : null}

          <div className="flex flex-wrap gap-3">
            <button onClick={() => void submit()} disabled={submitting} className="rounded-full bg-[#d4af37] px-6 py-3 text-sm font-semibold text-black hover:bg-[#f0cc75] disabled:opacity-60">
              {submitting ? 'Submitting...' : 'Submit verification application'}
            </button>
            <button onClick={() => router.push('/verification/status')} type="button" className="rounded-full border border-white/10 px-6 py-3 text-sm text-gray-300 hover:border-[#d4af37]/30 hover:text-white">
              View my status
            </button>
          </div>
        </div>

        <aside className="space-y-6">
          <section className="rounded-[32px] border border-white/10 bg-[#101010] p-6">
            <p className="text-xs uppercase tracking-[0.28em] text-[#d4af37]">Current selection</p>
            <h2 className="mt-3 text-xl font-semibold text-white">{selectedType.label}</h2>
            <p className="mt-3 text-sm leading-7 text-gray-300">{selectedType.detail}</p>
          </section>
          <section className="rounded-[32px] border border-white/10 bg-[#101010] p-6">
            <p className="text-xs uppercase tracking-[0.28em] text-[#c9b899]">How review works</p>
            <div className="mt-4 space-y-4 text-sm leading-7 text-gray-300">
              <p>1. We verify that your account and your selling lane line up with the story and evidence you provide.</p>
              <p>2. Community or elder endorsements strengthen the review, especially for sensitive cultural work.</p>
              <p>3. Approved accounts unlock seller permissions, payout access, and verified campaign rights based on status.</p>
            </div>
          </section>
        </aside>
      </section>
    </div>
  );
}
