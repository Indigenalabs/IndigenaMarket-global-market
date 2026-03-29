'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import AdvocacyFrame from '../../components/AdvocacyFrame';
import { addAdvocacyIcipComment, assignAdvocacyIcipReviewer, fetchAdvocacyIcipClaim, readAdvocacyAdminState, updateAdvocacyIcipPublicVisibility, type AdvocacyIcipActivity, type AdvocacyIcipClaim } from '@/app/lib/advocacyLegalClientStore';
import { getStoredWalletAddress } from '@/app/lib/walletStorage';

type ClaimDetail = AdvocacyIcipClaim & {
  evidence?: Array<{
    id: string;
    label: string;
    evidenceType: string;
    fileUrl?: string;
    contentHash?: string;
    description?: string;
    createdAt?: string;
  }>;
  activity?: AdvocacyIcipActivity[];
};

type EvidenceItem = NonNullable<ClaimDetail['evidence']>[number];

function statusTone(status: string) {
  if (status === 'approved') return 'border-emerald-400/35 bg-emerald-500/10 text-emerald-300';
  if (status === 'rejected') return 'border-red-400/35 bg-red-500/10 text-red-300';
  if (status === 'under_review') return 'border-blue-400/35 bg-blue-500/10 text-blue-300';
  return 'border-amber-400/35 bg-amber-500/10 text-amber-200';
}

function inferPreviewKind(item: EvidenceItem) {
  const source = `${item.label} ${item.fileUrl || ''}`.toLowerCase();
  if (item.evidenceType === 'image' || /\.(png|jpe?g|gif|webp|svg)$/i.test(source)) return 'image';
  if (item.evidenceType === 'video' || /\.(mp4|webm|mov|m4v)$/i.test(source)) return 'video';
  if (item.evidenceType === 'audio' || /\.(mp3|wav|ogg|m4a)$/i.test(source)) return 'audio';
  if (item.evidenceType === 'document' || /\.pdf$/i.test(source)) return 'pdf';
  return 'generic';
}

export default function IcipClaimDetailClient({ claimId }: { claimId: string }) {
  const [claim, setClaim] = useState<ClaimDetail | null>(null);
  const [adminSigned, setAdminSigned] = useState(false);
  const [saveState, setSaveState] = useState('');
  const [commentDraft, setCommentDraft] = useState('');
  const [assignmentForm, setAssignmentForm] = useState({
    assignedReviewerId: '',
    assignedReviewerName: ''
  });
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceItem | null>(null);
  const [publicForm, setPublicForm] = useState({
    publicListingState: 'private' as 'private' | 'public_summary',
    publicTitle: '',
    publicSummary: '',
    publicProtocolNotice: ''
  });

  useEffect(() => {
    let active = true;
    setAdminSigned(readAdvocacyAdminState().adminSigned);
    (async () => {
      const data = await fetchAdvocacyIcipClaim(claimId);
      if (active && data && typeof data === 'object') {
        const next = data as ClaimDetail;
        setClaim(next);
        setPublicForm({
          publicListingState: next.publicListingState || 'private',
          publicTitle: next.publicTitle || '',
          publicSummary: next.publicSummary || '',
          publicProtocolNotice: next.publicProtocolNotice || ''
        });
        setAssignmentForm({
          assignedReviewerId: next.assignedReviewerId || '',
          assignedReviewerName: next.assignedReviewerName || ''
        });
      }
    })();
    return () => {
      active = false;
    };
  }, [claimId]);

  const evidenceCount = useMemo(() => claim?.evidence?.length || 0, [claim]);
  const activityItems = useMemo(() => claim?.activity || [], [claim]);
  const evidenceItems = useMemo(() => claim?.evidence || [], [claim]);
  const selectedEvidenceIndex = useMemo(
    () => (selectedEvidence ? evidenceItems.findIndex((item) => item.id === selectedEvidence.id) : -1),
    [evidenceItems, selectedEvidence]
  );
  const hasPrevEvidence = selectedEvidenceIndex > 0;
  const hasNextEvidence = selectedEvidenceIndex >= 0 && selectedEvidenceIndex < evidenceItems.length - 1;
  const canEditVisibility = useMemo(() => {
    if (!claim) return false;
    if (adminSigned) return true;
    if (typeof window === 'undefined') return false;
    const wallet = getStoredWalletAddress();
    const userId = (window.localStorage.getItem('indigena_user_id') || '').trim();
    const currentActor = wallet || userId;
    return Boolean(currentActor && claim.actorId && claim.actorId === currentActor);
  }, [adminSigned, claim]);
  const canPublishSummary = claim?.status === 'approved';

  const goToAdjacentEvidence = (direction: 'prev' | 'next') => {
    if (selectedEvidenceIndex < 0) return;
    const nextIndex = direction === 'prev' ? selectedEvidenceIndex - 1 : selectedEvidenceIndex + 1;
    if (nextIndex < 0 || nextIndex >= evidenceItems.length) return;
    setSelectedEvidence(evidenceItems[nextIndex] || null);
  };

  useEffect(() => {
    if (!selectedEvidence) return;
    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedEvidence(null);
        return;
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        goToAdjacentEvidence('prev');
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        goToAdjacentEvidence('next');
      }
    };
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [selectedEvidence, selectedEvidenceIndex, evidenceItems]);

  const saveReviewerAssignment = async () => {
    if (!claim || !assignmentForm.assignedReviewerName.trim()) return;
    try {
      const result = await assignAdvocacyIcipReviewer({
        entryId: claim.id,
        assignedReviewerId: assignmentForm.assignedReviewerId.trim() || undefined,
        assignedReviewerName: assignmentForm.assignedReviewerName.trim()
      });
      setClaim((current) =>
        current && result
          ? {
              ...current,
              assignedReviewerId: result.assignedReviewerId,
              assignedReviewerName: result.assignedReviewerName,
              assignedReviewerAt: result.assignedReviewerAt,
              updatedAt: result.updatedAt || current.updatedAt,
              activity: [
                {
                  id: `local-assignment-${Date.now()}`,
                  entryId: current.id,
                  activityType: 'assignment_updated',
                  actorId: 'admin',
                  actorLabel: 'Legal Review Team',
                  title: `Reviewer assigned: ${result.assignedReviewerName}`,
                  body: result.assignedReviewerId
                    ? `Claim owner set to ${result.assignedReviewerName} (${result.assignedReviewerId}).`
                    : `Claim owner set to ${result.assignedReviewerName}.`,
                  createdAt: result.assignedReviewerAt || new Date().toISOString()
                },
                ...(current.activity || []).filter((item) => !(item.activityType === 'assignment_updated' && item.title === `Reviewer assigned: ${result.assignedReviewerName}` && item.createdAt === (result.assignedReviewerAt || '')))
              ]
            }
          : current
      );
      setSaveState(`Reviewer assigned to ${result?.assignedReviewerName || assignmentForm.assignedReviewerName.trim()}.`);
    } catch (error) {
      setSaveState(error instanceof Error ? error.message : 'We could not assign a reviewer.');
    }
  };

  const saveVisibility = async () => {
    if (!claim) return;
    try {
      const result = await updateAdvocacyIcipPublicVisibility({
        entryId: claim.id,
        publicListingState: publicForm.publicListingState,
        publicTitle: publicForm.publicTitle,
        publicSummary: publicForm.publicSummary,
        publicProtocolNotice: publicForm.publicProtocolNotice
      });
      setClaim((current) =>
        current
          ? {
              ...current,
              publicListingState: result.publicListingState,
              publicTitle: result.publicTitle,
              publicSummary: result.publicSummary,
              publicProtocolNotice: result.publicProtocolNotice,
              updatedAt: result.updatedAt
            }
          : current
      );
      setPublicForm({
        publicListingState: result.publicListingState,
        publicTitle: result.publicTitle || '',
        publicSummary: result.publicSummary || '',
        publicProtocolNotice: result.publicProtocolNotice || ''
      });
      setSaveState(result.publicListingState === 'public_summary' ? 'Public summary published to ICIP notices.' : 'Claim visibility returned to private.');
    } catch (error) {
      setSaveState(error instanceof Error ? error.message : 'We could not update claim visibility.');
    }
  };

  const submitComment = async () => {
    if (!claim || !commentDraft.trim()) return;
    try {
      const activity = await addAdvocacyIcipComment({
        entryId: claim.id,
        body: commentDraft.trim()
      });
      setClaim((current) =>
        current
          ? {
              ...current,
              activity: [activity, ...(current.activity || [])]
            }
          : current
      );
      setCommentDraft('');
      setSaveState('Protected note added to the claim timeline.');
    } catch (error) {
      setSaveState(error instanceof Error ? error.message : 'We could not add the claim note.');
    }
  };

  if (!claim) {
    return (
      <AdvocacyFrame title="ICIP Claim Record" subtitle="Protected cultural-rights record view.">
        <section className="rounded-2xl border border-[#d4af37]/20 bg-[#101112] p-8 text-center">
          <p className="text-sm text-gray-300">We could not load that ICIP claim with the current signed identity.</p>
          <Link href="/advocacy-legal/icip-registry" className="mt-4 inline-flex rounded-full border border-[#d4af37]/35 px-4 py-2 text-sm text-[#d4af37] hover:bg-[#d4af37]/10">
            Back to Registry
          </Link>
        </section>
      </AdvocacyFrame>
    );
  }

  return (
    <AdvocacyFrame title="ICIP Claim Record" subtitle="Protected claim detail for Indigenous cultural and intellectual property review.">
      <section className="overflow-hidden rounded-[28px] border border-[#d4af37]/20 bg-[linear-gradient(135deg,rgba(35,17,13,0.98),rgba(12,12,13,0.98))]">
        <div className="grid gap-6 p-6 lg:grid-cols-[1.15fr_0.85fr] lg:p-8">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-[#d4af37]/30 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-[#d4af37]">
                {claim.registryNumber}
              </span>
              <span className={`rounded-full border px-3 py-1 text-xs ${statusTone(claim.status)}`}>
                {claim.status}
              </span>
              {adminSigned ? (
                <span className="rounded-full border border-emerald-400/35 px-3 py-1 text-xs text-emerald-300">
                  Admin signed
                </span>
              ) : null}
            </div>
            <h2 className="mt-4 text-3xl font-semibold text-white">{claim.claimTitle}</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-300">{claim.protocolSummary}</p>
            <div className="mt-5 flex flex-wrap gap-2 text-[11px] text-gray-400">
              <span className="rounded-full border border-white/10 px-2 py-1">{claim.assetType}</span>
              <span className="rounded-full border border-white/10 px-2 py-1">{claim.rightsScope}</span>
              <span className="rounded-full border border-white/10 px-2 py-1">{claim.protocolVisibility}</span>
              <span className="rounded-full border border-white/10 px-2 py-1">{evidenceCount} evidence items</span>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ['Community', claim.communityName],
              ['Claimant', claim.claimantName],
              ['Contact', claim.contactEmail],
              ['Created', new Date(claim.createdAt).toLocaleString()],
              ['Reviewed by', claim.reviewedBy || 'Pending review'],
              ['Reviewed at', claim.reviewedAt ? new Date(claim.reviewedAt).toLocaleString() : 'Not reviewed'],
              ['Assigned reviewer', claim.assignedReviewerName || 'Unassigned'],
              ['Assignment time', claim.assignedReviewerAt ? new Date(claim.assignedReviewerAt).toLocaleString() : 'Not assigned']
            ].map(([label, value]) => (
              <article key={label} className="rounded-2xl border border-white/10 bg-black/25 p-4">
                <p className="text-[11px] uppercase tracking-[0.2em] text-gray-500">{label}</p>
                <p className="mt-2 text-sm font-medium text-white">{value}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-[28px] border border-[#d4af37]/20 bg-[#101112] p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[#d4af37]">Evidence Ledger</p>
              <h3 className="mt-2 text-2xl font-semibold text-white">Attached proof and provenance</h3>
            </div>
            <Link href="/advocacy-legal/icip-registry" className="rounded-full border border-[#d4af37]/35 px-4 py-2 text-xs text-[#d4af37] hover:bg-[#d4af37]/10">
              Back to Registry
            </Link>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {claim.evidence?.length ? claim.evidence.map((item) => (
              <article key={item.id} className="rounded-2xl border border-white/10 bg-black/25 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">{item.label}</p>
                    <p className="mt-1 text-xs text-gray-400">{item.evidenceType}</p>
                  </div>
                  {item.fileUrl ? (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedEvidence(item)}
                        className="rounded-full border border-[#d4af37]/35 px-3 py-1 text-xs text-[#d4af37] hover:bg-[#d4af37]/10"
                      >
                        Preview
                      </button>
                      <a href={item.fileUrl} target="_blank" rel="noreferrer" className="rounded-full border border-white/15 px-3 py-1 text-xs text-gray-300 hover:bg-white/5">
                        Open
                      </a>
                    </div>
                  ) : null}
                </div>
                {item.description ? <p className="mt-3 text-sm leading-6 text-gray-300">{item.description}</p> : null}
                {item.contentHash ? (
                  <div className="mt-3 rounded-2xl border border-white/10 bg-[#0d0f10] p-3">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-gray-500">Content hash</p>
                    <p className="mt-2 break-all font-mono text-xs text-gray-300">{item.contentHash}</p>
                  </div>
                ) : null}
                {item.createdAt ? <p className="mt-3 text-[11px] text-gray-500">{new Date(item.createdAt).toLocaleString()}</p> : null}
              </article>
            )) : (
              <article className="rounded-2xl border border-white/10 bg-black/25 p-4 text-sm text-gray-400 md:col-span-2">
                No supporting evidence was attached to this claim.
              </article>
            )}
          </div>
        </article>

        <article className="space-y-4">
          <section className="rounded-[28px] border border-[#d4af37]/20 bg-[#101112] p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#d4af37]">Claim Ownership</p>
                <h3 className="mt-2 text-xl font-semibold text-white">Reviewer assignment</h3>
              </div>
              <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-gray-300">
                {claim.assignedReviewerName || 'Unassigned'}
              </span>
            </div>
            <p className="mt-4 text-sm leading-7 text-gray-300">
              Each protected ICIP claim should have a named legal or protocol owner. That makes review accountability visible without exposing the claim publicly.
            </p>
            <div className="mt-5 grid gap-3">
              <input
                value={assignmentForm.assignedReviewerName}
                onChange={(e) => setAssignmentForm((current) => ({ ...current, assignedReviewerName: e.target.value }))}
                placeholder="Assigned reviewer name"
                disabled={!adminSigned}
                className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white disabled:cursor-not-allowed disabled:opacity-60"
              />
              <input
                value={assignmentForm.assignedReviewerId}
                onChange={(e) => setAssignmentForm((current) => ({ ...current, assignedReviewerId: e.target.value }))}
                placeholder="Reviewer ID or wallet (optional)"
                disabled={!adminSigned}
                className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white disabled:cursor-not-allowed disabled:opacity-60"
              />
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => void saveReviewerAssignment()}
                  disabled={!adminSigned}
                  className="rounded-full bg-[#d4af37] px-5 py-2 text-sm font-semibold text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Assign reviewer
                </button>
                <p className="text-xs text-gray-500">Only signed legal or admin reviewers can change claim ownership.</p>
              </div>
            </div>
          </section>

          <section className="rounded-[28px] border border-[#d4af37]/20 bg-[#101112] p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-[#d4af37]">Review Notes</p>
            <h3 className="mt-2 text-xl font-semibold text-white">Registry decision context</h3>
            <p className="mt-4 text-sm leading-7 text-gray-300">
              {claim.reviewNotes || 'No review note has been recorded yet. This claim is still waiting on legal or protocol review.'}
            </p>
          </section>

          <section className="rounded-[28px] border border-[#d4af37]/20 bg-[#101112] p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-[#d4af37]">Rights Posture</p>
            <div className="mt-4 space-y-3 text-sm text-gray-300">
              <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                <p className="text-[11px] uppercase tracking-[0.2em] text-gray-500">Licensing terms</p>
                <p className="mt-2 leading-6">{claim.licensingTerms || 'No licensing terms were specified.'}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                <p className="text-[11px] uppercase tracking-[0.2em] text-gray-500">Misuse or infringement summary</p>
                <p className="mt-2 leading-6">{claim.infringementSummary || 'No misuse summary was recorded for this claim.'}</p>
              </div>
            </div>
          </section>

          <section className="rounded-[28px] border border-[#d4af37]/20 bg-[#101112] p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-[#d4af37]">Claim Activity</p>
            <div className="mt-2 flex items-center justify-between gap-3">
              <h3 className="text-xl font-semibold text-white">Protected timeline and internal notes</h3>
              <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-gray-300">
                {activityItems.length} events
              </span>
            </div>
            <div className="mt-5 space-y-4">
              <textarea
                value={commentDraft}
                onChange={(e) => setCommentDraft(e.target.value)}
                placeholder="Add a protected internal note for claimant or legal review context"
                className="h-24 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white"
              />
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => void submitComment()}
                  className="rounded-full bg-[#d4af37] px-5 py-2 text-sm font-semibold text-black transition hover:brightness-110"
                >
                  Add protected note
                </button>
                <p className="text-xs text-gray-500">Only visible on the protected claim record.</p>
              </div>
            </div>
            <div className="mt-6 space-y-4">
              {activityItems.length ? activityItems.map((item) => (
                <article key={item.id} className="rounded-2xl border border-white/10 bg-black/25 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-white">{item.title}</p>
                      <p className="mt-1 text-xs text-gray-500">{item.actorLabel} • {new Date(item.createdAt).toLocaleString()}</p>
                    </div>
                    <span className="rounded-full border border-white/10 px-2 py-1 text-[11px] uppercase tracking-[0.18em] text-gray-400">
                      {item.activityType.replace(/_/g, ' ')}
                    </span>
                  </div>
                  {item.body ? <p className="mt-3 text-sm leading-7 text-gray-300">{item.body}</p> : null}
                </article>
              )) : (
                <article className="rounded-2xl border border-white/10 bg-black/25 p-4 text-sm text-gray-400">
                  This claim does not have any activity yet beyond its initial submission.
                </article>
              )}
            </div>
          </section>

          <section className="rounded-[28px] border border-[#d4af37]/20 bg-[#101112] p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#d4af37]">Public Summary Controls</p>
                <h3 className="mt-2 text-xl font-semibold text-white">Optional public ICIP notice</h3>
              </div>
              <span className={`rounded-full border px-3 py-1 text-xs ${claim.publicListingState === 'public_summary' ? 'border-emerald-400/35 bg-emerald-500/10 text-emerald-300' : 'border-white/10 bg-black/25 text-gray-300'}`}>
                {claim.publicListingState === 'public_summary' ? 'Public summary live' : 'Private record'}
              </span>
            </div>
            <p className="mt-4 text-sm leading-7 text-gray-300">
              Claim records stay private by default. Only approved claims can publish a sanitized public summary, and the public notices page never includes contact details, evidence, legal notes, or raw sacred protocol context.
            </p>

            <div className="mt-5 grid gap-4">
              <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                <p className="text-[11px] uppercase tracking-[0.2em] text-gray-500">Publication eligibility</p>
                <p className="mt-2 text-sm text-white">{canPublishSummary ? 'Eligible to publish a sanitized public summary.' : 'This claim must be approved before any public summary can be shown.'}</p>
              </div>
              <select
                value={publicForm.publicListingState}
                onChange={(e) => setPublicForm((current) => ({ ...current, publicListingState: e.target.value as 'private' | 'public_summary' }))}
                disabled={!canEditVisibility}
                className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                <option value="private">Keep private</option>
                <option value="public_summary">Publish sanitized public summary</option>
              </select>
              <input
                value={publicForm.publicTitle}
                onChange={(e) => setPublicForm((current) => ({ ...current, publicTitle: e.target.value }))}
                placeholder="Public-facing claim title"
                disabled={!canEditVisibility}
                className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white disabled:cursor-not-allowed disabled:opacity-60"
              />
              <textarea
                value={publicForm.publicSummary}
                onChange={(e) => setPublicForm((current) => ({ ...current, publicSummary: e.target.value }))}
                placeholder="Sanitized public summary shown in the public ICIP notices feed"
                disabled={!canEditVisibility}
                className="h-28 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white disabled:cursor-not-allowed disabled:opacity-60"
              />
              <textarea
                value={publicForm.publicProtocolNotice}
                onChange={(e) => setPublicForm((current) => ({ ...current, publicProtocolNotice: e.target.value }))}
                placeholder="Optional public protocol notice"
                disabled={!canEditVisibility}
                className="h-24 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white disabled:cursor-not-allowed disabled:opacity-60"
              />
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => void saveVisibility()}
                  disabled={!canEditVisibility}
                  className="rounded-full bg-[#d4af37] px-5 py-2 text-sm font-semibold text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Save visibility
                </button>
                <Link href="/advocacy-legal/icip-notices" className="rounded-full border border-[#d4af37]/35 px-4 py-2 text-xs text-[#d4af37] hover:bg-[#d4af37]/10">
                  View public notices
                </Link>
              </div>
              {saveState ? <p className="text-xs text-[#f3e3b0]">{saveState}</p> : null}
              {!canEditVisibility ? <p className="text-xs text-gray-500">Only the claimant or a signed legal/admin reviewer can update publication settings.</p> : null}
            </div>
          </section>
        </article>
      </section>
      {selectedEvidence ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 py-8 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-[28px] border border-[#d4af37]/25 bg-[#0f1011] shadow-[0_30px_120px_rgba(0,0,0,0.5)]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-6 py-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#d4af37]">Protected Evidence Preview</p>
                <h3 className="mt-2 text-xl font-semibold text-white">{selectedEvidence.label}</h3>
                <p className="mt-1 text-xs text-gray-500">
                  {selectedEvidence.evidenceType} • {selectedEvidenceIndex + 1} of {evidenceItems.length}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => goToAdjacentEvidence('prev')}
                  disabled={!hasPrevEvidence}
                  className="rounded-full border border-white/15 px-4 py-2 text-xs text-gray-300 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => goToAdjacentEvidence('next')}
                  disabled={!hasNextEvidence}
                  className="rounded-full border border-white/15 px-4 py-2 text-xs text-gray-300 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
                {selectedEvidence.fileUrl ? (
                  <a
                    href={selectedEvidence.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full border border-[#d4af37]/35 px-4 py-2 text-xs text-[#d4af37] hover:bg-[#d4af37]/10"
                  >
                    Open in new tab
                  </a>
                ) : null}
                <button
                  type="button"
                  onClick={() => setSelectedEvidence(null)}
                  className="rounded-full border border-white/15 px-4 py-2 text-xs text-gray-300 hover:bg-white/5"
                >
                  Close
                </button>
              </div>
            </div>
            <div className="grid gap-0 lg:grid-cols-[1.35fr_0.65fr]">
              <div className="min-h-[420px] border-b border-white/10 bg-black/30 lg:border-b-0 lg:border-r">
                {selectedEvidence.fileUrl ? (
                  inferPreviewKind(selectedEvidence) === 'image' ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={selectedEvidence.fileUrl}
                      alt={selectedEvidence.label}
                      className="h-full max-h-[72vh] w-full object-contain"
                    />
                  ) : inferPreviewKind(selectedEvidence) === 'pdf' ? (
                    <iframe
                      title={selectedEvidence.label}
                      src={selectedEvidence.fileUrl}
                      className="h-[72vh] w-full bg-white"
                    />
                  ) : inferPreviewKind(selectedEvidence) === 'video' ? (
                    <video controls className="h-[72vh] w-full bg-black">
                      <source src={selectedEvidence.fileUrl} />
                    </video>
                  ) : inferPreviewKind(selectedEvidence) === 'audio' ? (
                    <div className="flex h-[72vh] items-center justify-center">
                      <audio controls className="w-full max-w-xl">
                        <source src={selectedEvidence.fileUrl} />
                      </audio>
                    </div>
                  ) : (
                    <div className="flex h-[72vh] flex-col items-center justify-center gap-4 px-8 text-center">
                      <p className="text-lg font-semibold text-white">Preview not available for this file type</p>
                      <p className="max-w-md text-sm leading-7 text-gray-400">
                        This evidence file can still be opened securely in a separate tab for full inspection.
                      </p>
                    </div>
                  )
                ) : (
                  <div className="flex h-[72vh] items-center justify-center px-8 text-center text-sm text-gray-400">
                    No previewable file was attached to this evidence item.
                  </div>
                )}
              </div>
              <div className="space-y-4 p-6">
                <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-gray-500">Evidence navigator</p>
                  <div className="mt-3 space-y-2">
                    {evidenceItems.map((item, index) => {
                      const active = item.id === selectedEvidence.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setSelectedEvidence(item)}
                          className={`flex w-full items-center justify-between rounded-2xl border px-3 py-2 text-left transition ${
                            active
                              ? 'border-[#d4af37]/40 bg-[#d4af37]/10 text-white'
                              : 'border-white/10 bg-black/20 text-gray-300 hover:bg-white/5'
                          }`}
                        >
                          <span className="truncate pr-3 text-sm">{index + 1}. {item.label}</span>
                          <span className="text-[11px] uppercase tracking-[0.18em] text-gray-500">{item.evidenceType}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-gray-500">Evidence label</p>
                  <p className="mt-2 text-sm text-white">{selectedEvidence.label}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-gray-500">Evidence type</p>
                  <p className="mt-2 text-sm text-white">{selectedEvidence.evidenceType}</p>
                </div>
                {selectedEvidence.description ? (
                  <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-gray-500">Description</p>
                    <p className="mt-2 text-sm leading-7 text-gray-300">{selectedEvidence.description}</p>
                  </div>
                ) : null}
                {selectedEvidence.contentHash ? (
                  <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-gray-500">Content hash</p>
                    <p className="mt-2 break-all font-mono text-xs text-gray-300">{selectedEvidence.contentHash}</p>
                  </div>
                ) : null}
                {selectedEvidence.createdAt ? (
                  <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-gray-500">Added to claim</p>
                    <p className="mt-2 text-sm text-white">{new Date(selectedEvidence.createdAt).toLocaleString()}</p>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </AdvocacyFrame>
  );
}
