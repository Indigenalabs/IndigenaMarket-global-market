'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import AdvocacyFrame from '../components/AdvocacyFrame';
import {
  fetchAdvocacyIcipRegistry,
  readAdvocacyAdminState,
  reviewAdvocacyIcipClaim,
  submitAdvocacyIcipClaim,
  uploadAdvocacyIcipEvidence,
  type AdvocacyIcipClaim
} from '@/app/lib/advocacyLegalClientStore';
import { getStoredWalletAddress } from '@/app/lib/walletStorage';

type EvidenceType = 'document' | 'audio' | 'video' | 'image' | 'hash' | 'link' | 'statement';

type DraftEvidence = {
  label: string;
  evidenceType: EvidenceType;
  fileUrl: string;
  contentHash: string;
  description: string;
  fileName?: string;
  mimeType?: string;
  size?: number;
  previewUrl?: string;
};

const evidenceTemplate = (): DraftEvidence => ({
  label: '',
  evidenceType: 'document',
  fileUrl: '',
  contentHash: '',
  description: ''
});

function inferEvidenceType(file: File): EvidenceType {
  if (file.type.startsWith('image/')) return 'image';
  if (file.type.startsWith('audio/')) return 'audio';
  if (file.type.startsWith('video/')) return 'video';
  if (file.type === 'application/pdf') return 'document';
  return 'document';
}

function formatBytes(value?: number) {
  if (!value) return '';
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${Math.round(value / 1024)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

function PreviewCard({ item }: { item: DraftEvidence }) {
  const isImage = item.mimeType?.startsWith('image/') && item.previewUrl;
  const isPdf = item.mimeType === 'application/pdf';

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#111214]">
      <div className="aspect-[4/3] overflow-hidden bg-[linear-gradient(135deg,rgba(212,175,55,0.18),rgba(10,10,10,0.4))]">
        {isImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.previewUrl} alt={item.label || item.fileName || 'Evidence preview'} className="h-full w-full object-cover" />
        ) : isPdf ? (
          <div className="flex h-full items-center justify-center text-sm text-[#f3e3b0]">PDF Evidence</div>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-gray-400">
            {item.fileName || item.evidenceType}
          </div>
        )}
      </div>
      <div className="space-y-2 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-white">{item.label || item.fileName || 'Uploaded evidence'}</p>
            <p className="mt-1 text-xs text-gray-500">
              {[item.evidenceType, formatBytes(item.size)].filter(Boolean).join(' • ')}
            </p>
          </div>
          {item.fileUrl ? (
            <a href={item.fileUrl} target="_blank" rel="noreferrer" className="rounded-full border border-[#d4af37]/35 px-2.5 py-1 text-[11px] text-[#d4af37] hover:bg-[#d4af37]/10">
              Open
            </a>
          ) : null}
        </div>
        {item.description ? <p className="text-xs leading-6 text-gray-400">{item.description}</p> : null}
      </div>
    </div>
  );
}

export default function ICIPRegistryPortalPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [claims, setClaims] = useState<AdvocacyIcipClaim[]>([]);
  const [reviewQueue, setReviewQueue] = useState<AdvocacyIcipClaim[]>([]);
  const [reviewHistory, setReviewHistory] = useState<AdvocacyIcipClaim[]>([]);
  const [adminSigned, setAdminSigned] = useState(false);
  const [currentActorId, setCurrentActorId] = useState('');
  const [status, setStatus] = useState('');
  const [isDragActive, setIsDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [filters, setFilters] = useState({
    query: '',
    reviewState: 'all',
    ownerState: 'all'
  });
  const [form, setForm] = useState({
    claimTitle: '',
    communityName: '',
    claimantName: '',
    contactEmail: '',
    assetType: 'design' as AdvocacyIcipClaim['assetType'],
    rightsScope: 'ownership' as AdvocacyIcipClaim['rightsScope'],
    protocolVisibility: 'restricted' as AdvocacyIcipClaim['protocolVisibility'],
    protocolSummary: '',
    licensingTerms: '',
    infringementSummary: '',
    evidence: [evidenceTemplate()]
  });

  const loadRegistry = async () => {
    const payload = await fetchAdvocacyIcipRegistry();
    if (payload && typeof payload === 'object') {
      setClaims(Array.isArray((payload as any).claims) ? (payload as any).claims : []);
      setReviewQueue(Array.isArray((payload as any).reviewQueue) ? (payload as any).reviewQueue : []);
      setReviewHistory(Array.isArray((payload as any).reviewHistory) ? (payload as any).reviewHistory : []);
    }
  };

  useEffect(() => {
    setAdminSigned(readAdvocacyAdminState().adminSigned);
    if (typeof window !== 'undefined') {
      const wallet = getStoredWalletAddress();
      const userId = (window.localStorage.getItem('indigena_user_id') || '').trim();
      setCurrentActorId(wallet || userId || '');
    }
    void loadRegistry();
  }, []);

  const submittedCount = useMemo(() => claims.filter((item) => item.status === 'submitted').length, [claims]);
  const approvedCount = useMemo(() => reviewHistory.filter((item) => item.status === 'approved').length, [reviewHistory]);
  const sacredCount = useMemo(
    () => [...claims, ...reviewQueue, ...reviewHistory].filter((item) => item.protocolVisibility === 'sacred').length,
    [claims, reviewQueue, reviewHistory]
  );
  const matchesRegistryFilters = (item: AdvocacyIcipClaim) => {
    const query = filters.query.trim().toLowerCase();
    if (query) {
      const haystack = [
        item.claimTitle,
        item.communityName,
        item.claimantName,
        item.registryNumber,
        item.assignedReviewerName || '',
        item.assignedReviewerId || ''
      ]
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    if (filters.reviewState !== 'all' && item.status !== filters.reviewState) return false;
    if (filters.ownerState === 'assigned' && !item.assignedReviewerName) return false;
    if (filters.ownerState === 'unassigned' && item.assignedReviewerName) return false;
    if (filters.ownerState === 'mine' && (!currentActorId || item.assignedReviewerId !== currentActorId)) return false;
    return true;
  };
  const filteredClaims = useMemo(() => claims.filter(matchesRegistryFilters), [claims, filters, currentActorId]);
  const filteredReviewQueue = useMemo(() => reviewQueue.filter(matchesRegistryFilters), [reviewQueue, filters, currentActorId]);
  const filteredReviewHistory = useMemo(() => reviewHistory.filter(matchesRegistryFilters), [reviewHistory, filters, currentActorId]);

  const updateEvidence = (index: number, key: keyof DraftEvidence, value: string) => {
    setForm((prev) => ({
      ...prev,
      evidence: prev.evidence.map((item, itemIndex) => (itemIndex === index ? { ...item, [key]: value } : item))
    }));
  };

  const addEvidenceRows = (count = 1) => {
    setForm((prev) => ({
      ...prev,
      evidence: [...prev.evidence, ...Array.from({ length: count }, () => evidenceTemplate())]
    }));
  };

  const uploadFiles = async (files: FileList | File[]) => {
    const list = Array.from(files);
    if (!list.length) return;

    addEvidenceRows(list.length);

    for (const file of list) {
      const key = `${file.name}-${file.size}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const previewUrl = file.type.startsWith('image/') ? URL.createObjectURL(file) : '';
      const targetIndex = form.evidence.length + list.indexOf(file);

      setForm((prev) => {
        const next = [...prev.evidence];
        next[targetIndex] = {
          ...next[targetIndex],
          label: file.name.replace(/\.[^.]+$/, ''),
          evidenceType: inferEvidenceType(file),
          description: `Uploading ${file.name}`,
          fileName: file.name,
          mimeType: file.type || 'application/octet-stream',
          size: file.size,
          previewUrl
        };
        return { ...prev, evidence: next };
      });

      try {
        setUploadProgress((prev) => ({ ...prev, [key]: 15 }));
        const tickA = window.setTimeout(() => setUploadProgress((prev) => ({ ...prev, [key]: 48 })), 120);
        const tickB = window.setTimeout(() => setUploadProgress((prev) => ({ ...prev, [key]: 78 })), 260);
        const uploaded = await uploadAdvocacyIcipEvidence(file);
        window.clearTimeout(tickA);
        window.clearTimeout(tickB);
        if (!uploaded) throw new Error('Upload returned no file metadata.');
        setUploadProgress((prev) => ({ ...prev, [key]: 100 }));
        setForm((prev) => {
          const next = [...prev.evidence];
          next[targetIndex] = {
            ...next[targetIndex],
            fileUrl: uploaded.fileUrl,
            description: `Stored ${uploaded.fileName} (${formatBytes(uploaded.size)})`,
            fileName: uploaded.fileName,
            size: uploaded.size,
            mimeType: uploaded.contentType
          };
          return { ...prev, evidence: next };
        });
        setStatus(`Evidence uploaded: ${uploaded.fileName}`);
      } catch (error) {
        setStatus(error instanceof Error ? error.message : 'Evidence upload failed.');
        setForm((prev) => {
          const next = [...prev.evidence];
          next[targetIndex] = {
            ...next[targetIndex],
            description: `Upload failed for ${file.name}`
          };
          return { ...prev, evidence: next };
        });
      }
    }
  };

  const submitClaim = async () => {
    try {
      const result = await submitAdvocacyIcipClaim({
        ...form,
        evidence: form.evidence
          .filter((item) => item.label || item.fileUrl || item.contentHash || item.description)
          .map((item) => ({
            label: item.label,
            evidenceType: item.evidenceType,
            fileUrl: item.fileUrl,
            contentHash: item.contentHash,
            description: item.description
          }))
      });
      setStatus(`ICIP claim ${result.registryNumber} submitted for legal review.`);
      setForm({
        claimTitle: '',
        communityName: '',
        claimantName: '',
        contactEmail: '',
        assetType: 'design',
        rightsScope: 'ownership',
        protocolVisibility: 'restricted',
        protocolSummary: '',
        licensingTerms: '',
        infringementSummary: '',
        evidence: [evidenceTemplate()]
      });
      setUploadProgress({});
      await loadRegistry();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'ICIP claim submission failed.');
    }
  };

  const reviewClaim = async (entryId: string, reviewStatus: 'under_review' | 'approved' | 'rejected') => {
    try {
      await reviewAdvocacyIcipClaim({
        entryId,
        reviewStatus,
        reviewNotes:
          reviewStatus === 'approved'
            ? 'Approved for cultural rights registry publication.'
            : reviewStatus === 'rejected'
              ? 'Rejected pending stronger provenance or community authority.'
              : 'Claim moved into active legal review.'
      });
      setStatus(`ICIP claim ${entryId} moved to ${reviewStatus}.`);
      await loadRegistry();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'ICIP review failed.');
    }
  };

  const uploadedEvidence = form.evidence.filter((item) => item.fileUrl || item.previewUrl || item.fileName);

  return (
    <AdvocacyFrame
      title="ICIP Registry Portal"
      subtitle="Register Indigenous cultural and intellectual property claims with evidence, protocol controls, and review trails."
    >
      <section className="overflow-hidden rounded-[28px] border border-[#d4af37]/25 bg-[radial-gradient(circle_at_top_left,_rgba(212,175,55,0.18),_transparent_38%),linear-gradient(135deg,_rgba(44,16,16,0.98),_rgba(9,9,10,0.98))]">
        <div className="grid gap-6 p-6 lg:grid-cols-[1.1fr_0.9fr] lg:p-8">
          <div className="space-y-5">
            <span className="inline-flex rounded-full border border-[#d4af37]/35 bg-black/25 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-[#f3e3b0]">
              Cultural Rights Protection
            </span>
            <div>
              <h2 className="max-w-2xl text-3xl font-semibold text-white md:text-4xl">
                Turn evidence, protocol, and community authority into a defensible rights record.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-300">
                This registry is for artists, nations, councils, and legal teams documenting ownership, protocol restrictions, misuse reports, and licensing terms before outside exploitation hardens into harm.
              </p>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {[
                ['Open claims', claims.length.toString(), 'Community-submitted rights records in your queue.'],
                ['Awaiting review', reviewQueue.length.toString(), 'Claims that still need legal or Elder review.'],
                ['Protocol-locked', sacredCount.toString(), 'Entries marked restricted or sacred.']
              ].map(([label, value, detail]) => (
                <article key={label} className="rounded-2xl border border-white/10 bg-black/30 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-[#d4af37]">{label}</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
                  <p className="mt-2 text-xs leading-6 text-gray-400">{detail}</p>
                </article>
              ))}
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ['Evidence packs', 'Chain of custody, URLs, hashes, witness statements, and protocol notes in one place.'],
              ['Review controls', 'Legal and admin teams can move claims from submitted to under review, approved, or rejected.'],
              ['Licensing posture', 'Record whether the issue is ownership, misuse, attribution, licensing, or protocol protection.'],
              ['Audit trace', 'Every payment, refund, and cultural-rights decision can now be reviewed together in Pillar 9.']
            ].map(([title, copy]) => (
              <article key={title} className="rounded-2xl border border-[#d4af37]/15 bg-black/35 p-4">
                <p className="text-sm font-semibold text-white">{title}</p>
                <p className="mt-2 text-sm leading-6 text-gray-400">{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-4">
        {[
          ['Claims Submitted', claims.length],
          ['Pending Review', submittedCount + reviewQueue.filter((item) => item.status === 'under_review').length],
          ['Approved Records', approvedCount],
          ['Admin Review', adminSigned ? 'Enabled' : 'Read Only']
        ].map(([label, value]) => (
          <article key={label} className="rounded-2xl border border-[#d4af37]/20 bg-[#101112] p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-gray-500">{label}</p>
            <p className="mt-2 text-2xl font-semibold text-white">{String(value)}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-3 rounded-[28px] border border-[#d4af37]/20 bg-[#101112] p-6 lg:grid-cols-[1.35fr_0.8fr_0.8fr_auto]">
        <input
          value={filters.query}
          onChange={(e) => setFilters((current) => ({ ...current, query: e.target.value }))}
          placeholder="Search title, community, registry number, or reviewer"
          className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white"
        />
        <select
          value={filters.reviewState}
          onChange={(e) => setFilters((current) => ({ ...current, reviewState: e.target.value }))}
          className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white"
        >
          <option value="all">All review states</option>
          <option value="submitted">Submitted</option>
          <option value="under_review">Under review</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <select
          value={filters.ownerState}
          onChange={(e) => setFilters((current) => ({ ...current, ownerState: e.target.value }))}
          className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white"
        >
          <option value="all">All ownership</option>
          <option value="assigned">Assigned only</option>
          <option value="unassigned">Unassigned only</option>
          <option value="mine">Assigned to me</option>
        </select>
        <button
          type="button"
          onClick={() => setFilters({ query: '', reviewState: 'all', ownerState: 'all' })}
          className="rounded-2xl border border-[#d4af37]/35 px-4 py-3 text-sm text-[#d4af37] hover:bg-[#d4af37]/10"
        >
          Reset
        </button>
        <div className="lg:col-span-4 flex flex-wrap gap-2 text-[11px] text-gray-400">
          <span className="rounded-full border border-white/10 px-3 py-1">{filteredClaims.length} visible in your registry</span>
          <span className="rounded-full border border-white/10 px-3 py-1">{filteredReviewQueue.length} visible in queue</span>
          <span className="rounded-full border border-white/10 px-3 py-1">{filteredReviewHistory.length} visible in history</span>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <article className="rounded-[28px] border border-[#d4af37]/20 bg-[#101112] p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[#d4af37]">New Claim Intake</p>
              <h3 className="mt-2 text-2xl font-semibold text-white">Create an ICIP registry entry</h3>
            </div>
            <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs text-gray-300">
              Evidence-first workflow
            </span>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <input value={form.claimTitle} onChange={(e) => setForm((prev) => ({ ...prev, claimTitle: e.target.value }))} placeholder="Claim title" className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white" />
            <input value={form.communityName} onChange={(e) => setForm((prev) => ({ ...prev, communityName: e.target.value }))} placeholder="Community or Nation" className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white" />
            <input value={form.claimantName} onChange={(e) => setForm((prev) => ({ ...prev, claimantName: e.target.value }))} placeholder="Claimant or organization" className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white" />
            <input value={form.contactEmail} onChange={(e) => setForm((prev) => ({ ...prev, contactEmail: e.target.value }))} placeholder="Contact email" className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white" />
            <select value={form.assetType} onChange={(e) => setForm((prev) => ({ ...prev, assetType: e.target.value as AdvocacyIcipClaim['assetType'] }))} className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white">
              {['design', 'symbol', 'story', 'song', 'language', 'ceremony', 'artifact', 'other'].map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <select value={form.rightsScope} onChange={(e) => setForm((prev) => ({ ...prev, rightsScope: e.target.value as AdvocacyIcipClaim['rightsScope'] }))} className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white">
              {['ownership', 'licensing', 'misuse-report', 'attribution', 'protocol-protection'].map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <select value={form.protocolVisibility} onChange={(e) => setForm((prev) => ({ ...prev, protocolVisibility: e.target.value as AdvocacyIcipClaim['protocolVisibility'] }))} className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white">
              {['public', 'restricted', 'sacred'].map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <input value={form.licensingTerms} onChange={(e) => setForm((prev) => ({ ...prev, licensingTerms: e.target.value }))} placeholder="Licensing terms (optional)" className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white" />
          </div>

          <textarea value={form.protocolSummary} onChange={(e) => setForm((prev) => ({ ...prev, protocolSummary: e.target.value }))} placeholder="Protocol summary, origin story, authority chain, or cultural restrictions" className="mt-4 h-28 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white" />
          <textarea value={form.infringementSummary} onChange={(e) => setForm((prev) => ({ ...prev, infringementSummary: e.target.value }))} placeholder="Describe misuse, infringement, or commercial concern (optional)" className="mt-4 h-24 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white" />

          <div className="mt-6 rounded-2xl border border-[#d4af37]/15 bg-black/25 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-white">Supporting evidence</p>
                <p className="mt-1 text-xs text-gray-500">
                  Drag files here or upload several at once. We will keep the storage private and expose them only through protected app routes.
                </p>
              </div>
              <button type="button" onClick={() => fileInputRef.current?.click()} className="rounded-full border border-[#d4af37]/35 px-3 py-1.5 text-xs text-[#d4af37] hover:bg-[#d4af37]/10">
                Upload Multiple Files
              </button>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link href="/advocacy-legal/icip-notices" className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-gray-300 hover:border-[#d4af37]/35 hover:text-[#d4af37]">
                View Public ICIP Notices
              </Link>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => void uploadFiles(e.target.files || [])}
            />

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragActive(true);
              }}
              onDragLeave={() => setIsDragActive(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragActive(false);
                void uploadFiles(e.dataTransfer.files);
              }}
              className={`mt-4 rounded-[24px] border border-dashed p-6 transition-all ${isDragActive ? 'border-[#d4af37] bg-[#d4af37]/10' : 'border-white/10 bg-[#0b0c0d]'}`}
            >
              <div className="mx-auto max-w-xl text-center">
                <p className="text-sm font-semibold text-white">Drop images, PDFs, scans, witness letters, or audio records here</p>
                <p className="mt-2 text-xs leading-6 text-gray-500">
                  Ideal for archive scans, protocol letters, screenshots of infringement, and repository exports.
                </p>
              </div>
            </div>

            {Object.keys(uploadProgress).length ? (
              <div className="mt-4 space-y-3">
                {Object.entries(uploadProgress).map(([key, value]) => (
                  <div key={key} className="rounded-2xl border border-white/10 bg-[#0b0c0d] p-3">
                    <div className="flex items-center justify-between gap-3 text-xs text-gray-400">
                      <span>Upload progress</span>
                      <span>{value}%</span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/5">
                      <div className="h-full rounded-full bg-[#d4af37] transition-all" style={{ width: `${value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            {uploadedEvidence.length ? (
              <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {uploadedEvidence.map((item, index) => (
                  <PreviewCard key={`${item.fileName || item.label || 'evidence'}-${index}`} item={item} />
                ))}
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-white/10 bg-[#0b0c0d] p-4 text-sm text-gray-500">
                No uploaded files yet. Manual links, hashes, and statements still work below.
              </div>
            )}

            <div className="mt-5 space-y-3">
              {form.evidence.map((item, index) => (
                <div key={`evidence-${index}`} className="grid gap-3 rounded-2xl border border-white/10 bg-[#0b0c0d] p-4 md:grid-cols-2">
                  <input value={item.label} onChange={(e) => updateEvidence(index, 'label', e.target.value)} placeholder="Evidence label" className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white" />
                  <select value={item.evidenceType} onChange={(e) => updateEvidence(index, 'evidenceType', e.target.value)} className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white">
                    {['document', 'audio', 'video', 'image', 'hash', 'link', 'statement'].map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                  <input value={item.fileUrl} onChange={(e) => updateEvidence(index, 'fileUrl', e.target.value)} placeholder="File or evidence URL" className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white" />
                  <input value={item.contentHash} onChange={(e) => updateEvidence(index, 'contentHash', e.target.value)} placeholder="Content hash (optional)" className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white" />
                  <textarea value={item.description} onChange={(e) => updateEvidence(index, 'description', e.target.value)} placeholder="Why this evidence matters" className="md:col-span-2 h-20 rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white" />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button type="button" onClick={() => void submitClaim()} className="rounded-full bg-[#d4af37] px-5 py-3 text-sm font-semibold text-black hover:bg-[#f0ca55]">
              Submit ICIP Claim
            </button>
            <span className="text-xs text-gray-500">
              Signed user identity required. Admin signature is only needed for review actions.
            </span>
          </div>
        </article>

        <article className="space-y-4">
          <section className="rounded-[28px] border border-[#d4af37]/20 bg-[#101112] p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#d4af37]">Your Registry Feed</p>
                <h3 className="mt-2 text-xl font-semibold text-white">Recently submitted claims</h3>
              </div>
              <span className={`rounded-full border px-3 py-1 text-xs ${adminSigned ? 'border-emerald-400/35 text-emerald-300' : 'border-white/10 text-gray-400'}`}>
                {adminSigned ? 'Legal review enabled' : 'Community view'}
              </span>
            </div>
            <div className="mt-4 space-y-3">
              {filteredClaims.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-black/25 p-4 text-sm text-gray-400">
                  No ICIP claims match the current filters. Adjust the search or ownership filters to widen the view.
                </div>
              ) : filteredClaims.map((item) => (
                <article key={item.id} className="rounded-2xl border border-white/10 bg-black/25 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-white">{item.claimTitle}</p>
                      <p className="mt-1 text-xs text-gray-400">{item.communityName} • {item.registryNumber}</p>
                    </div>
                    <span className="rounded-full border border-[#d4af37]/25 px-3 py-1 text-xs text-[#d4af37]">{item.status}</span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-gray-300">{item.protocolSummary}</p>
                  <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-gray-400">
                    <span className="rounded-full border border-white/10 px-2 py-1">{item.assetType}</span>
                    <span className="rounded-full border border-white/10 px-2 py-1">{item.rightsScope}</span>
                    <span className="rounded-full border border-white/10 px-2 py-1">{item.protocolVisibility}</span>
                    <span className="rounded-full border border-white/10 px-2 py-1">{item.assignedReviewerName || 'Unassigned'}</span>
                    <span className="rounded-full border border-white/10 px-2 py-1">{item.evidence?.length || 0} evidence items</span>
                  </div>
                  <div className="mt-4">
                    <Link href={`/advocacy-legal/icip-registry/${item.id}`} className="rounded-full border border-[#d4af37]/35 px-3 py-1.5 text-xs text-[#d4af37] hover:bg-[#d4af37]/10">
                      View Claim Record
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-[28px] border border-[#d4af37]/20 bg-[#101112] p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-[#d4af37]">Review Queue</p>
            <p className="mt-2 text-xl font-semibold text-white">Claims waiting for legal or protocol review</p>
            <div className="mt-4 space-y-3">
              {filteredReviewQueue.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-black/25 p-4 text-sm text-gray-400">No queued claims match the current filters.</div>
              ) : filteredReviewQueue.map((item) => (
                <article key={item.id} className="rounded-2xl border border-white/10 bg-black/25 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-white">{item.claimTitle}</p>
                      <p className="mt-1 text-xs text-gray-400">{item.communityName} • {item.claimantName}</p>
                    </div>
                    <span className="rounded-full border border-amber-400/25 px-3 py-1 text-xs text-amber-200">{item.status}</span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-gray-300">{item.protocolSummary}</p>
                  <p className="mt-3 text-xs text-gray-500">
                    {item.assignedReviewerName
                      ? `Assigned reviewer: ${item.assignedReviewerName}${item.assignedReviewerAt ? ` • ${new Date(item.assignedReviewerAt).toLocaleString()}` : ''}`
                      : 'No reviewer ownership recorded yet.'}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link href={`/advocacy-legal/icip-registry/${item.id}`} className="rounded-full border border-white/15 px-3 py-1.5 text-xs text-gray-200 hover:bg-white/5">
                      Open Record
                    </Link>
                    <button disabled={!adminSigned} type="button" onClick={() => void reviewClaim(item.id, 'under_review')} className="rounded-full border border-blue-400/35 px-3 py-1.5 text-xs text-blue-300 hover:bg-blue-500/10 disabled:cursor-not-allowed disabled:opacity-50">
                      Mark Under Review
                    </button>
                    <button disabled={!adminSigned} type="button" onClick={() => void reviewClaim(item.id, 'approved')} className="rounded-full border border-emerald-400/35 px-3 py-1.5 text-xs text-emerald-300 hover:bg-emerald-500/10 disabled:cursor-not-allowed disabled:opacity-50">
                      Approve Claim
                    </button>
                    <button disabled={!adminSigned} type="button" onClick={() => void reviewClaim(item.id, 'rejected')} className="rounded-full border border-red-400/35 px-3 py-1.5 text-xs text-red-300 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50">
                      Reject Claim
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </article>
      </section>

      <section className="rounded-[28px] border border-[#d4af37]/20 bg-[#101112] p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#d4af37]">Reviewed Registry History</p>
            <h3 className="mt-2 text-xl font-semibold text-white">Approved and rejected cultural rights records</h3>
          </div>
          <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-gray-400">{filteredReviewHistory.length} visible</span>
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          {filteredReviewHistory.length === 0 ? (
            <article className="rounded-2xl border border-white/10 bg-black/25 p-4 text-sm text-gray-400 lg:col-span-3">
              No reviewed claims match the current filters.
            </article>
          ) : filteredReviewHistory.map((item) => (
            <article key={item.id} className="rounded-2xl border border-white/10 bg-black/25 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-white">{item.claimTitle}</p>
                <span className={`rounded-full border px-2 py-1 text-[11px] ${item.status === 'approved' ? 'border-emerald-400/35 text-emerald-300' : 'border-red-400/35 text-red-300'}`}>
                  {item.status}
                </span>
              </div>
              <p className="mt-2 text-xs text-gray-400">{item.registryNumber} • {item.reviewedBy || 'legal review'}</p>
              <p className="mt-3 text-sm leading-6 text-gray-300">{item.reviewNotes || item.protocolSummary}</p>
              <div className="mt-4">
                <Link href={`/advocacy-legal/icip-registry/${item.id}`} className="rounded-full border border-[#d4af37]/35 px-3 py-1.5 text-xs text-[#d4af37] hover:bg-[#d4af37]/10">
                  View Claim Record
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {status ? <p className="text-sm text-emerald-300">{status}</p> : null}
    </AdvocacyFrame>
  );
}

