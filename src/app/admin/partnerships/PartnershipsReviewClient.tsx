'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Briefcase, Calendar, CheckCircle2, Eye, FileText, Handshake, Settings2, ShieldCheck, XCircle } from 'lucide-react';
import {
  fetchEnterpriseContractAccessLogs,
  fetchEnterpriseContractAccessUrl,
  fetchEnterpriseArtifacts,
  fetchEnterpriseArtifactPayments,
  fetchEnterpriseInquiries,
  fetchEnterpriseMilestones,
  fetchEnterprisePipelineSettings,
  fetchEnterpriseSignatures,
  getEnterpriseArtifactPaymentSummary,
  getEnterpriseArtifactPdfUrl,
  getEnterpriseSignaturePacketPdfUrl,
  getEnterpriseMonthlyForecastExportUrl,
  saveEnterpriseArtifact,
  saveEnterpriseArtifactPayment,
  saveEnterpriseMilestone,
  saveEnterpriseSignature,
  updateEnterpriseInquiryRecord,
  uploadEnterpriseContract,
  type EnterpriseContractAccessLogRecord,
  type EnterpriseArtifactRecord,
  type EnterpriseArtifactPaymentRecord,
  type EnterpriseInquiryEventRecord,
  type EnterpriseInquiryRecord,
  type EnterpriseSignatureRecord
} from '@/app/lib/enterpriseApi';
import { calculateEnterpriseForecast } from '@/app/lib/enterpriseForecast';
import { DEFAULT_ENTERPRISE_STAGE_WEIGHTS, type EnterpriseStageWeightMap } from '@/app/lib/enterpriseForecastConfig';
import { ENTERPRISE_OWNER_OPTIONS } from '@/app/lib/enterpriseTeam';

const STAGE_FILTERS: Array<{ id: 'all' | EnterpriseInquiryRecord['contractStage']; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'proposal', label: 'Proposal' },
  { id: 'negotiation', label: 'Negotiation' },
  { id: 'won', label: 'Won' },
  { id: 'lost', label: 'Lost' }
];

const STAGE_ORDER: EnterpriseInquiryRecord['contractStage'][] = ['lead', 'discovery', 'proposal', 'negotiation', 'won', 'lost'];

export default function PartnershipsReviewClient() {
  const [inquiries, setInquiries] = useState<EnterpriseInquiryRecord[]>([]);
  const [events, setEvents] = useState<EnterpriseInquiryEventRecord[]>([]);
  const [contractLogs, setContractLogs] = useState<EnterpriseContractAccessLogRecord[]>([]);
  const [milestones, setMilestones] = useState<Record<string, Awaited<ReturnType<typeof fetchEnterpriseMilestones>>>>({});
  const [artifacts, setArtifacts] = useState<Record<string, EnterpriseArtifactRecord[]>>({});
  const [artifactPayments, setArtifactPayments] = useState<Record<string, EnterpriseArtifactPaymentRecord[]>>({});
  const [signatures, setSignatures] = useState<Record<string, EnterpriseSignatureRecord[]>>({});
  const [selectedId, setSelectedId] = useState('');
  const [stageFilter, setStageFilter] = useState<(typeof STAGE_FILTERS)[number]['id']>('all');
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingContract, setIsUploadingContract] = useState(false);
  const [stageWeights, setStageWeights] = useState<EnterpriseStageWeightMap>(DEFAULT_ENTERPRISE_STAGE_WEIGHTS);
  const [draft, setDraft] = useState({
    status: 'new' as EnterpriseInquiryRecord['status'],
    contractStage: 'lead' as EnterpriseInquiryRecord['contractStage'],
    contractLifecycleState: 'draft' as EnterpriseInquiryRecord['contractLifecycleState'],
    estimatedValue: '',
    pipelineOwner: '',
    pipelineOwnerRole: '' as EnterpriseInquiryRecord['pipelineOwnerRole'],
    nextStep: '',
    expectedCloseDate: '',
    contractStoragePath: '',
    contractAttachmentUrl: '',
    contractAttachmentName: ''
  });

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetchEnterpriseInquiries(),
      fetchEnterprisePipelineSettings(),
      fetchEnterpriseContractAccessLogs({ limit: 24 })
    ])
      .then(([enterpriseData, settings, logs]) => {
        if (cancelled) return;
        setInquiries(enterpriseData.inquiries);
        setEvents(enterpriseData.events);
        setStageWeights(settings.stageWeights || DEFAULT_ENTERPRISE_STAGE_WEIGHTS);
        setContractLogs(logs);
        if (enterpriseData.inquiries[0]) setSelectedId(enterpriseData.inquiries[0].id);
      })
      .catch((error) => setFeedback(error instanceof Error ? error.message : 'Unable to load partnerships admin data.'));
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredInquiries = useMemo(
    () => inquiries.filter((entry) => stageFilter === 'all' || entry.contractStage === stageFilter),
    [inquiries, stageFilter]
  );

  const stageValueRollups = useMemo(
    () => ({
      proposal: filteredInquiries.filter((entry) => entry.contractStage === 'proposal').reduce((total, entry) => total + Number(entry.estimatedValue || 0), 0),
      negotiation: filteredInquiries.filter((entry) => entry.contractStage === 'negotiation').reduce((total, entry) => total + Number(entry.estimatedValue || 0), 0),
      won: filteredInquiries.filter((entry) => entry.contractStage === 'won').reduce((total, entry) => total + Number(entry.estimatedValue || 0), 0)
    }),
    [filteredInquiries]
  );
  const weightedForecast = useMemo(
    () => calculateEnterpriseForecast(filteredInquiries, stageWeights),
    [filteredInquiries, stageWeights]
  );

  const selectedInquiry = filteredInquiries.find((entry) => entry.id === selectedId) ?? filteredInquiries[0] ?? null;
  const selectedInquiryLogs = useMemo(
    () =>
      selectedInquiry
        ? contractLogs.filter((entry) => entry.contractStoragePath === (draft.contractStoragePath || selectedInquiry.contractStoragePath))
        : [],
    [contractLogs, draft.contractStoragePath, selectedInquiry]
  );

  useEffect(() => {
    if (!selectedInquiry) return;
    Promise.all([fetchEnterpriseMilestones(selectedInquiry.id), fetchEnterpriseArtifacts(selectedInquiry.id), fetchEnterpriseSignatures(selectedInquiry.id)])
      .then(([milestoneRecords, artifactRecords, signatureRecords]) => {
        setMilestones((current) => ({ ...current, [selectedInquiry.id]: milestoneRecords }));
        setArtifacts((current) => ({ ...current, [selectedInquiry.id]: artifactRecords }));
        setSignatures((current) => ({ ...current, [selectedInquiry.id]: signatureRecords }));
        void Promise.all(
          artifactRecords.map(async (artifact) => {
            const payments = await fetchEnterpriseArtifactPayments(artifact.id);
            setArtifactPayments((current) => ({ ...current, [artifact.id]: payments }));
          })
        );
      })
      .catch(() => undefined);
    setDraft({
      status: selectedInquiry.status,
      contractStage: selectedInquiry.contractStage,
      contractLifecycleState: selectedInquiry.contractLifecycleState,
      estimatedValue: selectedInquiry.estimatedValue ? String(selectedInquiry.estimatedValue) : '',
      pipelineOwner: selectedInquiry.pipelineOwner || '',
      pipelineOwnerRole: selectedInquiry.pipelineOwnerRole || '',
      nextStep: selectedInquiry.nextStep || '',
      expectedCloseDate: selectedInquiry.expectedCloseDate ? selectedInquiry.expectedCloseDate.slice(0, 10) : '',
      contractStoragePath: selectedInquiry.contractStoragePath || '',
      contractAttachmentUrl: selectedInquiry.contractAttachmentUrl || '',
      contractAttachmentName: selectedInquiry.contractAttachmentName || ''
    });
  }, [selectedInquiry]);

  async function reloadLogs(path?: string) {
    const logs = await fetchEnterpriseContractAccessLogs({
      limit: path ? 50 : 24,
      contractStoragePath: path
    });
    setContractLogs(logs);
  }

  async function handleSave(overrides?: Partial<typeof draft>) {
    if (!selectedInquiry) return;
    const next = { ...draft, ...overrides };
    try {
      setIsSubmitting(true);
      setFeedback('');
      const updated = await updateEnterpriseInquiryRecord({
        id: selectedInquiry.id,
        actorId: 'platform-admin',
        status: next.status,
        contractStage: next.contractStage,
        contractLifecycleState: next.contractLifecycleState,
        estimatedValue: Number(next.estimatedValue || 0),
        pipelineOwner: next.pipelineOwner,
        pipelineOwnerRole: next.pipelineOwnerRole,
        nextStep: next.nextStep,
        expectedCloseDate: next.expectedCloseDate || null,
        contractStoragePath: next.contractStoragePath,
        contractAttachmentUrl: next.contractAttachmentUrl,
        contractAttachmentName: next.contractAttachmentName
      });
      setInquiries((current) => current.map((entry) => (entry.id === updated.id ? updated : entry)));
      setFeedback(`Updated ${updated.organization || updated.name}.`);
      if (updated.contractStoragePath) await reloadLogs(updated.contractStoragePath);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Unable to update partnership inquiry.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleMilestoneSave(input: { id?: string; title: string; owner?: string; dueDate?: string | null; status?: 'pending' | 'in_progress' | 'done' | 'blocked'; note?: string }) {
    if (!selectedInquiry) return;
    try {
      setFeedback('');
      const milestone = await saveEnterpriseMilestone(selectedInquiry.id, input);
      setMilestones((current) => {
        const currentList = current[selectedInquiry.id] || [];
        const nextList = [...currentList.filter((entry) => entry.id !== milestone.id), milestone];
        return { ...current, [selectedInquiry.id]: nextList.sort((a, b) => a.createdAt.localeCompare(b.createdAt)) };
      });
      setFeedback(`Saved milestone "${milestone.title}".`);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Unable to save milestone.');
    }
  }

  async function handleArtifactSave(input: {
    id?: string;
    kind: EnterpriseArtifactRecord['kind'];
    title: string;
    amount?: number;
    currency?: string;
    status?: EnterpriseArtifactRecord['status'];
    issuedAt?: string | null;
    dueDate?: string | null;
    attachmentUrl?: string;
    attachmentName?: string;
    storagePath?: string;
  }) {
    if (!selectedInquiry) return;
    try {
      setFeedback('');
      const artifact = await saveEnterpriseArtifact({
        inquiryId: selectedInquiry.id,
        ...input
      });
      setArtifacts((current) => {
        const currentList = current[selectedInquiry.id] || [];
        const nextList = [...currentList.filter((entry) => entry.id !== artifact.id), artifact];
        return { ...current, [selectedInquiry.id]: nextList.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)) };
      });
      setFeedback(`Saved ${artifact.kind} "${artifact.title}".`);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Unable to save enterprise artifact.');
    }
  }

  async function handleSignatureSave(input: {
    id?: string;
    signerName: string;
    signerEmail: string;
    signerRole: string;
    status?: EnterpriseSignatureRecord['status'];
    requestedAt?: string;
    signedAt?: string | null;
    note?: string;
  }) {
    if (!selectedInquiry) return;
    try {
      setFeedback('');
      const signature = await saveEnterpriseSignature(selectedInquiry.id, input);
      setSignatures((current) => {
        const currentList = current[selectedInquiry.id] || [];
        const nextList = [...currentList.filter((entry) => entry.id !== signature.id), signature];
        return { ...current, [selectedInquiry.id]: nextList.sort((a, b) => b.requestedAt.localeCompare(a.requestedAt)) };
      });
      setFeedback(`Saved signature request for ${signature.signerName}.`);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Unable to save signature request.');
    }
  }

  async function handleArtifactPaymentSave(artifactId: string, amount: number) {
    if (!amount) return;
    try {
      setFeedback('');
      const payment = await saveEnterpriseArtifactPayment(artifactId, {
        amount,
        currency: 'USD',
        paidAt: new Date().toISOString(),
        reference: `manual-${Date.now()}`,
        note: 'Admin reconciliation entry'
      });
      setArtifactPayments((current) => {
        const currentList = current[artifactId] || [];
        return { ...current, [artifactId]: [payment, ...currentList] };
      });
      setFeedback('Invoice payment reconciled.');
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Unable to reconcile invoice payment.');
    }
  }

  async function handleContractUpload(file: File | null) {
    if (!file) return;
    try {
      setIsUploadingContract(true);
      setFeedback('');
      const uploaded = await uploadEnterpriseContract(file);
      setDraft((current) => ({
        ...current,
        contractStoragePath: uploaded.storagePath || '',
        contractAttachmentUrl: uploaded.url || '',
        contractAttachmentName: uploaded.fileName
      }));
      setFeedback(`Uploaded ${uploaded.fileName}. Save the review update to attach it to the deal.`);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Unable to upload contract.');
    } finally {
      setIsUploadingContract(false);
    }
  }

  async function openDraftContract() {
    try {
      const url = draft.contractStoragePath
        ? await fetchEnterpriseContractAccessUrl(draft.contractStoragePath)
        : draft.contractAttachmentUrl;
      if (url) {
        window.open(url, '_blank', 'noopener,noreferrer');
        if (draft.contractStoragePath) await reloadLogs(draft.contractStoragePath);
      }
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Unable to open contract.');
    }
  }

  const selectedEvents = useMemo(
    () => (selectedInquiry ? events.filter((entry) => entry.inquiryId === selectedInquiry.id).slice(0, 8) : []),
    [events, selectedInquiry]
  );
  const selectedMilestones = selectedInquiry ? milestones[selectedInquiry.id] || [] : [];
  const selectedArtifacts = selectedInquiry ? artifacts[selectedInquiry.id] || [] : [];
  const selectedSignatures = selectedInquiry ? signatures[selectedInquiry.id] || [] : [];
  const monthlyForecast = useMemo(() => {
    const byMonth = new Map<string, { weighted: number; raw: number; count: number }>();
    for (const entry of filteredInquiries) {
      if (!entry.expectedCloseDate) continue;
      const month = entry.expectedCloseDate.slice(0, 7);
      const raw = Number(entry.estimatedValue || 0);
      const weighted = raw * (stageWeights[entry.contractStage] ?? 0);
      const current = byMonth.get(month) || { weighted: 0, raw: 0, count: 0 };
      current.weighted += weighted;
      current.raw += raw;
      current.count += 1;
      byMonth.set(month, current);
    }
    return Array.from(byMonth.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, totals]) => ({ month, ...totals }));
  }, [filteredInquiries, stageWeights]);
  const calendarItems = useMemo(() => {
    const inquiryEntries = filteredInquiries
      .filter((entry) => entry.expectedCloseDate)
      .map((entry) => ({
        id: `close-${entry.id}`,
        date: entry.expectedCloseDate as string,
        title: `${entry.organization || entry.name} close target`,
        detail: `${entry.contractStage} · $${Math.round(Number(entry.estimatedValue || 0)).toLocaleString()}`
      }));
    const milestoneEntries = Object.values(milestones)
      .flat()
      .filter((entry) => entry.dueDate)
      .map((entry) => ({
        id: `milestone-${entry.id}`,
        date: entry.dueDate as string,
        title: entry.title,
        detail: `${entry.status} milestone`
      }));
    return [...inquiryEntries, ...milestoneEntries].sort((a, b) => a.date.localeCompare(b.date)).slice(0, 12);
  }, [filteredInquiries, milestones]);

  return (
    <div className="grid gap-6 xl:grid-cols-[0.72fr,1.28fr]">
      <section className="space-y-6">
        <div className="rounded-[28px] border border-[#d4af37]/20 bg-[#111111] p-5">
          <div className="flex items-center gap-3">
            <Handshake className="text-[#d4af37]" />
            <div>
              <h1 className="text-xl font-semibold text-white">Partnerships Review</h1>
              <p className="text-sm text-gray-400">Review enterprise and sponsorship deals by contract stage.</p>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {STAGE_FILTERS.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setStageFilter(filter.id)}
                className={`rounded-full px-3 py-2 text-sm ${
                  stageFilter === filter.id
                    ? 'bg-[#d4af37] text-black'
                    : 'border border-white/10 bg-black/20 text-gray-300 hover:border-[#d4af37]/25 hover:text-white'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <MetricCard label="Proposal value" value={`$${Math.round(stageValueRollups.proposal).toLocaleString()}`} />
            <MetricCard label="Negotiation value" value={`$${Math.round(stageValueRollups.negotiation).toLocaleString()}`} />
            <MetricCard label="Weighted forecast" value={`$${Math.round(weightedForecast).toLocaleString()}`} />
          </div>
          <div className="mt-5 space-y-3">
            {filteredInquiries.map((inquiry) => (
              <button
                key={inquiry.id}
                onClick={() => setSelectedId(inquiry.id)}
                className={`w-full rounded-[22px] border p-4 text-left ${
                  selectedInquiry?.id === inquiry.id
                    ? 'border-[#d4af37]/35 bg-[#d4af37]/10'
                    : 'border-white/10 bg-black/20 hover:border-[#d4af37]/25'
                }`}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium text-white">{inquiry.organization || inquiry.name}</p>
                  <span className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] text-gray-300">{inquiry.channel}</span>
                  <span className="rounded-full border border-[#d4af37]/25 px-2.5 py-1 text-[11px] text-[#f3deb1]">{inquiry.contractStage}</span>
                </div>
                <p className="mt-2 text-xs text-gray-400">{inquiry.scope || 'No scope provided'}</p>
                <p className="mt-2 text-xs text-gray-500">{inquiry.expectedCloseDate ? `Close ${inquiry.expectedCloseDate.slice(0, 10)}` : 'No expected close date'}</p>
              </button>
            ))}
            {filteredInquiries.length === 0 && <p className="text-sm text-gray-400">No inquiries in this stage filter.</p>}
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-[#111111] p-5">
          <div className="flex items-center gap-3">
            <Settings2 className="text-[#d4af37]" />
            <div>
              <h2 className="text-lg font-semibold text-white">Pipeline Settings</h2>
              <p className="text-sm text-gray-400">Forecast weights are managed in the dedicated admin settings view.</p>
            </div>
          </div>
          <Link
            href="/admin/partnerships/settings"
            className="mt-5 inline-flex rounded-full bg-[#d4af37] px-4 py-2 text-sm font-semibold text-black"
          >
            Open pipeline settings
          </Link>
          <a
            href={getEnterpriseMonthlyForecastExportUrl('csv')}
            className="mt-3 inline-flex rounded-full border border-white/10 px-4 py-2 text-sm text-gray-200"
          >
            Export monthly forecast CSV
          </a>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-[#111111] p-5">
          <div className="flex items-center gap-3">
            <ShieldCheck className="text-[#d4af37]" />
            <div>
              <h2 className="text-lg font-semibold text-white">Contract Access Audit</h2>
              <p className="text-sm text-gray-400">Signed contract opens are logged here for audit review.</p>
            </div>
          </div>
          <div className="mt-5 space-y-3">
            {(selectedInquiryLogs.length > 0 ? selectedInquiryLogs : contractLogs).map((entry) => (
              <div key={entry.id} className="rounded-[20px] border border-white/10 bg-black/20 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-[#d4af37]/25 px-2.5 py-1 text-[11px] text-[#f3deb1]">
                    {entry.actorId || 'guest'}
                  </span>
                  <span className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] text-gray-300">
                    {new Date(entry.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="mt-2 break-all text-xs text-gray-400">{entry.contractStoragePath}</p>
                <p className="mt-2 text-xs text-gray-500">{entry.ipAddress} | {entry.userAgent || 'No user agent'}</p>
              </div>
            ))}
            {contractLogs.length === 0 ? <p className="text-sm text-gray-400">No contract access events recorded yet.</p> : null}
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-[#111111] p-5">
          <div className="flex items-center gap-3">
            <Calendar className="text-[#d4af37]" />
            <div>
              <h2 className="text-lg font-semibold text-white">Monthly Forecast</h2>
              <p className="text-sm text-gray-400">Weighted revenue grouped by expected close month.</p>
            </div>
          </div>
          <div className="mt-5 space-y-3">
            {monthlyForecast.map((entry) => (
              <div key={entry.month} className="rounded-[20px] border border-white/10 bg-black/20 p-4">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-medium text-white">{entry.month}</p>
                  <p className="text-sm font-semibold text-[#d4af37]">${Math.round(entry.weighted).toLocaleString()}</p>
                </div>
                <p className="mt-2 text-xs text-gray-500">{entry.count} deal{entry.count === 1 ? '' : 's'} · raw ${Math.round(entry.raw).toLocaleString()}</p>
              </div>
            ))}
            {monthlyForecast.length === 0 ? <p className="text-sm text-gray-400">No expected close dates yet.</p> : null}
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-[#111111] p-5">
          <div className="flex items-center gap-3">
            <Calendar className="text-[#d4af37]" />
            <div>
              <h2 className="text-lg font-semibold text-white">Partnership Calendar</h2>
              <p className="text-sm text-gray-400">Upcoming close targets and milestone due dates.</p>
            </div>
          </div>
          <div className="mt-5 space-y-3">
            {calendarItems.map((entry) => (
              <div key={entry.id} className="rounded-[20px] border border-white/10 bg-black/20 p-4">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-medium text-white">{entry.title}</p>
                  <p className="text-xs text-[#f3deb1]">{entry.date}</p>
                </div>
                <p className="mt-2 text-xs text-gray-500">{entry.detail}</p>
              </div>
            ))}
            {calendarItems.length === 0 ? <p className="text-sm text-gray-400">No due dates or close dates yet.</p> : null}
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-[#111111] p-5">
        {selectedInquiry ? (
          <>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-white">{selectedInquiry.organization || selectedInquiry.name}</h2>
                <p className="mt-1 text-sm text-gray-400">{selectedInquiry.name} · {selectedInquiry.email}</p>
              </div>
              <span className="rounded-full border border-[#d4af37]/25 bg-[#d4af37]/10 px-3 py-1 text-xs text-[#f3deb1]">
                {selectedInquiry.channel}
              </span>
            </div>

            <div className="mt-5 rounded-[22px] border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-gray-500">Deal brief</p>
              <p className="mt-3 text-sm text-gray-300">{selectedInquiry.scope || 'No scope provided.'}</p>
              <p className="mt-3 text-sm leading-7 text-gray-300">{selectedInquiry.detail}</p>
              <div className="mt-4 flex flex-wrap gap-2 text-[11px] text-gray-300">
                <span className="rounded-full border border-white/10 px-2.5 py-1">Budget: {selectedInquiry.budget || 'Pending'}</span>
                <span className="rounded-full border border-white/10 px-2.5 py-1">Status: {selectedInquiry.status}</span>
                <span className="rounded-full border border-white/10 px-2.5 py-1">Stage: {selectedInquiry.contractStage}</span>
              </div>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <FieldSelect label="Stage" value={draft.contractStage} onChange={(value) => setDraft((current) => ({ ...current, contractStage: value as EnterpriseInquiryRecord['contractStage'] }))} options={STAGE_ORDER.map((stage) => ({ value: stage, label: stage[0].toUpperCase() + stage.slice(1) }))} />
              <FieldSelect label="Status" value={draft.status} onChange={(value) => setDraft((current) => ({ ...current, status: value as EnterpriseInquiryRecord['status'] }))} options={[{ value: 'new', label: 'New' }, { value: 'reviewing', label: 'Reviewing' }, { value: 'qualified', label: 'Qualified' }, { value: 'closed', label: 'Closed' }]} />
              <FieldSelect label="Contract lifecycle" value={draft.contractLifecycleState} onChange={(value) => setDraft((current) => ({ ...current, contractLifecycleState: value as EnterpriseInquiryRecord['contractLifecycleState'] }))} options={[{ value: 'draft', label: 'Draft' }, { value: 'sent', label: 'Sent' }, { value: 'signed', label: 'Signed' }, { value: 'active', label: 'Active' }, { value: 'completed', label: 'Completed' }, { value: 'terminated', label: 'Terminated' }]} />
              <FieldInput label="Est. value" value={draft.estimatedValue} onChange={(value) => setDraft((current) => ({ ...current, estimatedValue: value }))} />
              <FieldInput label="Owner" value={draft.pipelineOwner} onChange={(value) => setDraft((current) => ({ ...current, pipelineOwner: value }))} />
              <FieldSelect label="Owner role" value={draft.pipelineOwnerRole} onChange={(value) => setDraft((current) => ({ ...current, pipelineOwnerRole: value as EnterpriseInquiryRecord['pipelineOwnerRole'] }))} options={[{ value: '', label: 'Unassigned' }, ...ENTERPRISE_OWNER_OPTIONS.map((entry) => ({ value: entry.id, label: entry.label }))]} />
              <FieldInput label="Next step" value={draft.nextStep} onChange={(value) => setDraft((current) => ({ ...current, nextStep: value }))} className="md:col-span-2" />
              <FieldInput label="Expected close" type="date" value={draft.expectedCloseDate} onChange={(value) => setDraft((current) => ({ ...current, expectedCloseDate: value }))} />
              <FieldInput label="Contract label" value={draft.contractAttachmentName} onChange={(value) => setDraft((current) => ({ ...current, contractAttachmentName: value }))} />
            </div>

            <div className="mt-3">
              <FieldInput label="Contract URL" value={draft.contractAttachmentUrl} onChange={(value) => setDraft((current) => ({ ...current, contractAttachmentUrl: value }))} />
            </div>
            <div className="mt-3">
              <label className="grid gap-2 text-sm text-gray-300">
                Upload contract
                <input type="file" onChange={(event) => void handleContractUpload(event.target.files?.[0] ?? null)} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-[#d4af37]/35" />
              </label>
              {isUploadingContract ? <p className="mt-2 text-xs text-[#f3deb1]">Uploading contract...</p> : null}
            </div>

            {(draft.expectedCloseDate || draft.contractAttachmentUrl || draft.contractStoragePath) ? (
              <div className="mt-4 flex flex-wrap gap-2 text-[11px] text-gray-300">
                {draft.expectedCloseDate ? <span className="rounded-full border border-white/10 px-2.5 py-1">Close: {draft.expectedCloseDate}</span> : null}
                {(draft.contractAttachmentUrl || draft.contractStoragePath) ? (
                  <button onClick={() => void openDraftContract()} className="rounded-full border border-[#d4af37]/25 px-2.5 py-1 text-[#f3deb1]">
                    <FileText className="mr-1 inline-block h-3 w-3" />
                    {draft.contractAttachmentName || 'Open contract'}
                  </button>
                ) : null}
                {selectedInquiryLogs.length ? (
                  <span className="rounded-full border border-white/10 px-2.5 py-1">
                    <Eye className="mr-1 inline-block h-3 w-3" />
                    {selectedInquiryLogs.length} audited open{selectedInquiryLogs.length === 1 ? '' : 's'}
                  </span>
                ) : null}
              </div>
            ) : null}

            <div className="mt-5 flex flex-wrap gap-3">
              <button onClick={() => void handleSave()} disabled={isSubmitting} className="rounded-full bg-[#d4af37] px-4 py-2 text-sm font-semibold text-black disabled:opacity-60">
                <Briefcase className="mr-2 inline-block h-4 w-4" />
                {isSubmitting ? 'Saving...' : 'Save review update'}
              </button>
              <button onClick={() => void handleSave({ contractStage: 'proposal', status: 'qualified' })} disabled={isSubmitting} className="rounded-full border border-white/10 px-4 py-2 text-sm text-gray-200 disabled:opacity-60">
                <Handshake className="mr-2 inline-block h-4 w-4" />
                Move to proposal
              </button>
              <button onClick={() => void handleSave({ contractStage: 'won', status: 'closed' })} disabled={isSubmitting} className="rounded-full border border-emerald-500/35 px-4 py-2 text-sm text-emerald-300 disabled:opacity-60">
                <CheckCircle2 className="mr-2 inline-block h-4 w-4" />
                Mark won
              </button>
              <button onClick={() => void handleSave({ contractStage: 'lost', status: 'closed' })} disabled={isSubmitting} className="rounded-full border border-red-500/35 px-4 py-2 text-sm text-red-300 disabled:opacity-60">
                <XCircle className="mr-2 inline-block h-4 w-4" />
                Mark lost
              </button>
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-[1fr,0.95fr]">
              <div className="rounded-[22px] border border-white/10 bg-black/20 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">Deal milestones</p>
                    <p className="mt-1 text-xs text-gray-500">Execution tasks for the current deal.</p>
                  </div>
                  <button
                    onClick={() => void handleMilestoneSave({ title: 'New milestone', status: 'pending' })}
                    className="rounded-full border border-[#d4af37]/25 px-3 py-1 text-xs text-[#f3deb1]"
                  >
                    Add milestone
                  </button>
                </div>
                <div className="mt-4 space-y-3">
                  {selectedMilestones.map((milestone) => (
                    <div key={milestone.id} className="rounded-[18px] border border-white/10 bg-[#111111] p-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <input
                          defaultValue={milestone.title}
                          onBlur={(event) =>
                            void handleMilestoneSave({
                              id: milestone.id,
                              title: event.target.value,
                              owner: milestone.owner,
                              dueDate: milestone.dueDate,
                              status: milestone.status,
                              note: milestone.note
                            })
                          }
                          className="min-w-[14rem] flex-1 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none"
                        />
                        <select
                          value={milestone.status}
                          onChange={(event) =>
                            void handleMilestoneSave({
                              id: milestone.id,
                              title: milestone.title,
                              owner: milestone.owner,
                              dueDate: milestone.dueDate,
                              status: event.target.value as typeof milestone.status,
                              note: milestone.note
                            })
                          }
                          className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs text-white outline-none"
                        >
                          <option value="pending">Pending</option>
                          <option value="in_progress">In progress</option>
                          <option value="done">Done</option>
                          <option value="blocked">Blocked</option>
                        </select>
                      </div>
                      <div className="mt-3 grid gap-2 md:grid-cols-2">
                        <input
                          defaultValue={milestone.owner}
                          placeholder="Owner"
                          onBlur={(event) =>
                            void handleMilestoneSave({
                              id: milestone.id,
                              title: milestone.title,
                              owner: event.target.value,
                              dueDate: milestone.dueDate,
                              status: milestone.status,
                              note: milestone.note
                            })
                          }
                          className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none"
                        />
                        <input
                          type="date"
                          defaultValue={milestone.dueDate ? milestone.dueDate.slice(0, 10) : ''}
                          onBlur={(event) =>
                            void handleMilestoneSave({
                              id: milestone.id,
                              title: milestone.title,
                              owner: milestone.owner,
                              dueDate: event.target.value || null,
                              status: milestone.status,
                              note: milestone.note
                            })
                          }
                          className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none"
                        />
                      </div>
                    </div>
                  ))}
                  {selectedMilestones.length === 0 ? <p className="text-sm text-gray-500">No milestones yet.</p> : null}
                </div>
              </div>

              <div className="rounded-[22px] border border-white/10 bg-black/20 p-4">
                <p className="text-sm font-semibold text-white">Deal history</p>
                <p className="mt-1 text-xs text-gray-500">Latest pipeline and contract actions.</p>
                <div className="mt-4 space-y-3">
                  {selectedEvents.map((entry) => (
                    <div key={entry.id} className="rounded-[18px] border border-white/10 bg-[#111111] p-3 text-sm text-gray-300">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-[#d4af37]/25 px-2.5 py-1 text-[11px] text-[#f3deb1]">{entry.eventType}</span>
                        <span className="text-xs text-gray-500">{new Date(entry.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="mt-2 text-sm text-white">{entry.note}</p>
                      <p className="mt-1 text-xs text-gray-500">{entry.actorId}</p>
                    </div>
                  ))}
                  {selectedEvents.length === 0 ? <p className="text-sm text-gray-500">No deal history yet.</p> : null}
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-[22px] border border-white/10 bg-black/20 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-white">Proposal and invoice records</p>
                  <p className="mt-1 text-xs text-gray-500">Artifacts tied directly to this enterprise deal.</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => void handleArtifactSave({ kind: 'proposal', title: 'New proposal', status: 'draft', currency: 'USD' })} className="rounded-full border border-[#d4af37]/25 px-3 py-1 text-xs text-[#f3deb1]">Add proposal</button>
                  <button onClick={() => void handleArtifactSave({ kind: 'invoice', title: 'New invoice', status: 'draft', currency: 'USD' })} className="rounded-full border border-[#d4af37]/25 px-3 py-1 text-xs text-[#f3deb1]">Add invoice</button>
                </div>
              </div>
              <div className="mt-4 space-y-3">
                {selectedArtifacts.map((artifact) => (
                  <div key={artifact.id} className="rounded-[18px] border border-white/10 bg-[#111111] p-3">
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                      <FieldInput label="Title" value={artifact.title} onChange={(value) => setArtifacts((current) => ({ ...current, [selectedInquiry.id]: (current[selectedInquiry.id] || []).map((entry) => entry.id === artifact.id ? { ...entry, title: value } : entry) }))} />
                      <FieldInput label="Amount" value={String(artifact.amount || '')} onChange={(value) => setArtifacts((current) => ({ ...current, [selectedInquiry.id]: (current[selectedInquiry.id] || []).map((entry) => entry.id === artifact.id ? { ...entry, amount: Number(value || 0) } : entry) }))} />
                      <FieldInput label="Currency" value={artifact.currency} onChange={(value) => setArtifacts((current) => ({ ...current, [selectedInquiry.id]: (current[selectedInquiry.id] || []).map((entry) => entry.id === artifact.id ? { ...entry, currency: value } : entry) }))} />
                      <FieldSelect label="Status" value={artifact.status} onChange={(value) => setArtifacts((current) => ({ ...current, [selectedInquiry.id]: (current[selectedInquiry.id] || []).map((entry) => entry.id === artifact.id ? { ...entry, status: value as EnterpriseArtifactRecord['status'] } : entry) }))} options={[{ value: 'draft', label: 'Draft' }, { value: 'sent', label: 'Sent' }, { value: 'approved', label: 'Approved' }, { value: 'paid', label: 'Paid' }, { value: 'void', label: 'Void' }]} />
                      <FieldInput label="Issued at" type="date" value={artifact.issuedAt ? artifact.issuedAt.slice(0, 10) : ''} onChange={(value) => setArtifacts((current) => ({ ...current, [selectedInquiry.id]: (current[selectedInquiry.id] || []).map((entry) => entry.id === artifact.id ? { ...entry, issuedAt: value || null } : entry) }))} />
                      <FieldInput label="Due date" type="date" value={artifact.dueDate ? artifact.dueDate.slice(0, 10) : ''} onChange={(value) => setArtifacts((current) => ({ ...current, [selectedInquiry.id]: (current[selectedInquiry.id] || []).map((entry) => entry.id === artifact.id ? { ...entry, dueDate: value || null } : entry) }))} />
                      <FieldInput label="Attachment label" value={artifact.attachmentName} onChange={(value) => setArtifacts((current) => ({ ...current, [selectedInquiry.id]: (current[selectedInquiry.id] || []).map((entry) => entry.id === artifact.id ? { ...entry, attachmentName: value } : entry) }))} />
                      <FieldInput label="Attachment URL" value={artifact.attachmentUrl} onChange={(value) => setArtifacts((current) => ({ ...current, [selectedInquiry.id]: (current[selectedInquiry.id] || []).map((entry) => entry.id === artifact.id ? { ...entry, attachmentUrl: value } : entry) }))} />
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button onClick={() => void handleArtifactSave(artifact)} className="rounded-full bg-[#d4af37] px-3 py-1.5 text-xs font-semibold text-black">Save {artifact.kind}</button>
                      <a
                        href={getEnterpriseArtifactPdfUrl(artifact.id)}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full border border-[#d4af37]/25 px-3 py-1.5 text-xs text-[#f3deb1]"
                      >
                        Download {artifact.kind} PDF
                      </a>
                      {artifact.storagePath || artifact.attachmentUrl ? (
                        <button
                          onClick={async () => {
                            const url = artifact.storagePath ? await fetchEnterpriseContractAccessUrl(artifact.storagePath) : artifact.attachmentUrl;
                            if (url) window.open(url, '_blank', 'noopener,noreferrer');
                          }}
                          className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-gray-300"
                        >
                          Open attachment
                        </button>
                      ) : null}
                    </div>
                  </div>
                ))}
                {selectedArtifacts.length === 0 ? <p className="text-sm text-gray-500">No proposal or invoice records yet.</p> : null}
              </div>
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-[1fr,1fr]">
              <div className="rounded-[22px] border border-white/10 bg-black/20 p-4">
                <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-white">Approval and signature workflow</p>
                  <p className="mt-1 text-xs text-gray-500">Request, track, and complete contract signatures.</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => void handleSignatureSave({ signerName: 'New signer', signerEmail: '', signerRole: 'approver', status: 'pending' })}
                    className="rounded-full border border-[#d4af37]/25 px-3 py-1 text-xs text-[#f3deb1]"
                  >
                    Add signer
                  </button>
                  <a
                    href={selectedInquiry ? getEnterpriseSignaturePacketPdfUrl(selectedInquiry.id) : '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full border border-white/10 px-3 py-1 text-xs text-gray-300"
                  >
                    Export packet PDF
                  </a>
                </div>
                </div>
                <div className="mt-4 space-y-3">
                  {selectedSignatures.map((signature) => (
                    <div key={signature.id} className="rounded-[18px] border border-white/10 bg-[#111111] p-3">
                      <div className="grid gap-3 md:grid-cols-2">
                        <FieldInput label="Signer" value={signature.signerName} onChange={(value) => setSignatures((current) => ({ ...current, [selectedInquiry.id]: (current[selectedInquiry.id] || []).map((entry) => entry.id === signature.id ? { ...entry, signerName: value } : entry) }))} />
                        <FieldInput label="Email" value={signature.signerEmail} onChange={(value) => setSignatures((current) => ({ ...current, [selectedInquiry.id]: (current[selectedInquiry.id] || []).map((entry) => entry.id === signature.id ? { ...entry, signerEmail: value } : entry) }))} />
                        <FieldInput label="Role" value={signature.signerRole} onChange={(value) => setSignatures((current) => ({ ...current, [selectedInquiry.id]: (current[selectedInquiry.id] || []).map((entry) => entry.id === signature.id ? { ...entry, signerRole: value } : entry) }))} />
                        <FieldSelect label="Status" value={signature.status} onChange={(value) => setSignatures((current) => ({ ...current, [selectedInquiry.id]: (current[selectedInquiry.id] || []).map((entry) => entry.id === signature.id ? { ...entry, status: value as EnterpriseSignatureRecord['status'] } : entry) }))} options={[{ value: 'pending', label: 'Pending' }, { value: 'sent', label: 'Sent' }, { value: 'signed', label: 'Signed' }, { value: 'declined', label: 'Declined' }]} />
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button onClick={() => void handleSignatureSave(signature)} className="rounded-full bg-[#d4af37] px-3 py-1.5 text-xs font-semibold text-black">Save signer</button>
                        {signature.signedAt ? <span className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-gray-300">Signed {signature.signedAt.slice(0, 10)}</span> : null}
                      </div>
                    </div>
                  ))}
                  {selectedSignatures.length === 0 ? <p className="text-sm text-gray-500">No signature requests yet.</p> : null}
                </div>
              </div>

              <div className="rounded-[22px] border border-white/10 bg-black/20 p-4">
                <p className="text-sm font-semibold text-white">Invoice reconciliation</p>
                <p className="mt-1 text-xs text-gray-500">Track invoice payment state against recorded payments.</p>
                <div className="mt-4 space-y-3">
                  {selectedArtifacts.filter((artifact) => artifact.kind === 'invoice').map((artifact) => {
                    const payments = artifactPayments[artifact.id] || [];
                    const summary = getEnterpriseArtifactPaymentSummary(artifact, payments);
                    return (
                      <div key={artifact.id} className="rounded-[18px] border border-white/10 bg-[#111111] p-3">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="text-sm font-medium text-white">{artifact.title}</p>
                            <p className="mt-1 text-xs text-gray-500">Status: {summary.status} · Paid ${Math.round(summary.paid).toLocaleString()} / Due ${Math.round(summary.due).toLocaleString()}</p>
                          </div>
                          <button
                            onClick={() => void handleArtifactPaymentSave(artifact.id, summary.due || artifact.amount)}
                            className="rounded-full border border-[#d4af37]/25 px-3 py-1 text-xs text-[#f3deb1]"
                          >
                            Reconcile payment
                          </button>
                        </div>
                        <div className="mt-3 space-y-2">
                          {payments.map((payment) => (
                            <div key={payment.id} className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs text-gray-300">
                              {payment.paidAt.slice(0, 10)} · ${Math.round(payment.amount).toLocaleString()} · {payment.reference || 'manual'}
                            </div>
                          ))}
                          {payments.length === 0 ? <p className="text-xs text-gray-500">No payments reconciled yet.</p> : null}
                        </div>
                      </div>
                    );
                  })}
                  {selectedArtifacts.filter((artifact) => artifact.kind === 'invoice').length === 0 ? <p className="text-sm text-gray-500">No invoice records available for reconciliation.</p> : null}
                </div>
              </div>
            </div>
          </>
        ) : (
          <p className="text-sm text-gray-400">Select a partnership inquiry from the queue.</p>
        )}
        {feedback ? <p className="mt-4 text-sm text-[#f3deb1]">{feedback}</p> : null}
      </section>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[20px] border border-white/10 bg-black/20 p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-gray-500">{label}</p>
      <p className="mt-2 text-xl font-semibold text-white">{value}</p>
    </div>
  );
}

function FieldInput({
  label,
  value,
  onChange,
  type = 'text',
  className = ''
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  className?: string;
}) {
  return (
    <label className={`grid gap-2 text-sm text-gray-300 ${className}`.trim()}>
      {label}
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-[#d4af37]/35"
      />
    </label>
  );
}

function FieldSelect({
  label,
  value,
  onChange,
  options
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="grid gap-2 text-sm text-gray-300">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-[#d4af37]/35"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
