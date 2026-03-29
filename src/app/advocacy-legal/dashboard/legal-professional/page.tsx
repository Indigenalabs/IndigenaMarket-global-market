'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import AdvocacyFrame from '../../components/AdvocacyFrame';
import {
  assignAdvocacyDonationReviewer,
  assignAdvocacyIcipReviewer,
  fetchAdvocacyLegalDashboard,
  fetchAdvocacyPublicData,
  getLegalProfessionalSnapshot,
  reconcileAdvocacyDonation,
  readAdvocacyAdminState,
  reviewAdvocacyRefund,
  reviewAdvocacyCampaign,
  updateAdvocacyCaseWorkflow
} from '@/app/lib/advocacyLegalClientStore';

export default function LegalProfessionalDashboardPage() {
  const [snapshot, setSnapshot] = useState(() => getLegalProfessionalSnapshot());
  const [adminSigned, setAdminSigned] = useState(false);
  const [currentActorId, setCurrentActorId] = useState('');
  const [workloadFilter, setWorkloadFilter] = useState<'all' | 'mine'>('all');
  const [campaigns, setCampaigns] = useState<Array<{ id: string; title: string }>>([]);
  const [caseForm, setCaseForm] = useState({
    caseId: '',
    workflowStatus: 'under_review',
    priority: 'high',
    queueBucket: 'general-intake',
    assignedAttorneyName: '',
    lastNote: ''
  });
  const [opsStatus, setOpsStatus] = useState('');
  const [assignmentDrafts, setAssignmentDrafts] = useState<Record<string, { assignedReviewerId: string; assignedReviewerName: string }>>({});
  const [bulkAssignmentDrafts, setBulkAssignmentDrafts] = useState<Record<'refunds' | 'reconciliation' | 'icip', { assignedReviewerId: string; assignedReviewerName: string }>>({
    refunds: { assignedReviewerId: '', assignedReviewerName: '' },
    reconciliation: { assignedReviewerId: '', assignedReviewerName: '' },
    icip: { assignedReviewerId: '', assignedReviewerName: '' }
  });

  const exportRefundHistory = () => {
    if (!('refundHistory' in snapshot) || !Array.isArray((snapshot as any).refundHistory) || !(snapshot as any).refundHistory.length) {
      setOpsStatus('No refund review history available to export.');
      return;
    }
    const rows = (snapshot as any).refundHistory as Array<any>;
    const header = ['donation_id', 'receipt_id', 'campaign_title', 'donor_name', 'amount', 'currency', 'refund_reason', 'review_status', 'reviewed_by', 'review_notes', 'updated_at'];
    const csv = [
      header.join(','),
      ...rows.map((row) => [
        row.donationId,
        row.receiptId || '',
        row.campaignTitle,
        row.donorName,
        row.amount,
        row.currency,
        row.refundReason || '',
        row.refundReviewStatus,
        row.refundReviewedBy || '',
        row.reviewNotes || '',
        row.updatedAt
      ].map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `advocacy-refund-history-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setOpsStatus('Refund history exported.');
  };

  useEffect(() => {
    let active = true;
    setSnapshot(getLegalProfessionalSnapshot());
    const adminState = readAdvocacyAdminState();
    setAdminSigned(adminState.adminSigned);
    setCurrentActorId(
      adminState.wallet ||
      (typeof window !== 'undefined' ? window.localStorage.getItem('indigena_wallet_address') || '' : '')
    );
    (async () => {
      const [server, publicData] = await Promise.all([
        fetchAdvocacyLegalDashboard(),
        fetchAdvocacyPublicData()
      ]);
      if (active && server && typeof server === 'object') {
        setSnapshot((prev) => ({ ...prev, ...(server as Partial<typeof prev>) }));
      }
      if (active && publicData && typeof publicData === 'object' && Array.isArray((publicData as any).campaigns)) {
        setCampaigns(((publicData as any).campaigns as Array<{ id: string; title: string }>).map((item) => ({ id: item.id, title: item.title })));
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const normalizedActor = currentActorId.trim().toLowerCase();
  const assignedCases = 'assignedCases' in snapshot && Array.isArray(snapshot.assignedCases)
    ? snapshot.assignedCases
    : [];
  const filteredAssignedCases = workloadFilter === 'mine'
    ? assignedCases.filter((row: any) => {
        const assignedId = String(row.assignedAttorneyId || '').trim().toLowerCase();
        const assignedName = String(row.assignedAttorneyName || '').trim().toLowerCase();
        return Boolean(normalizedActor) && (assignedId === normalizedActor || assignedName === normalizedActor);
      })
    : assignedCases;
  const icipReviewQueue = 'icipReviewQueue' in snapshot && Array.isArray((snapshot as any).icipReviewQueue)
    ? (snapshot as any).icipReviewQueue
    : [];
  const filteredIcipReviewQueue = workloadFilter === 'mine'
    ? icipReviewQueue.filter((row: any) => {
        const assignedId = String(row.assignedReviewerId || '').trim().toLowerCase();
        const assignedName = String(row.assignedReviewerName || '').trim().toLowerCase();
        return Boolean(normalizedActor) && (assignedId === normalizedActor || assignedName === normalizedActor);
      })
    : icipReviewQueue;
  const refundRequests = 'refundRequests' in snapshot && Array.isArray(snapshot.refundRequests)
    ? snapshot.refundRequests
    : [];
  const filteredRefundRequests = workloadFilter === 'mine'
    ? refundRequests.filter((row: any) => {
        const assignedId = String(row.assignedReviewerId || '').trim().toLowerCase();
        const assignedName = String(row.assignedReviewerName || '').trim().toLowerCase();
        return Boolean(normalizedActor) && (assignedId === normalizedActor || assignedName === normalizedActor);
      })
    : refundRequests;
  const reconciliationQueue = 'reconciliationQueue' in snapshot && Array.isArray((snapshot as any).reconciliationQueue)
    ? (snapshot as any).reconciliationQueue
    : [];
  const filteredReconciliationQueue = workloadFilter === 'mine'
    ? reconciliationQueue.filter((row: any) => {
        const assignedId = String(row.assignedReviewerId || '').trim().toLowerCase();
        const assignedName = String(row.assignedReviewerName || '').trim().toLowerCase();
        return Boolean(normalizedActor) && (assignedId === normalizedActor || assignedName === normalizedActor);
      })
    : reconciliationQueue;
  const operationalWatchlist = 'operationalWatchlist' in snapshot && snapshot.operationalWatchlist
    ? (snapshot as any).operationalWatchlist
    : { failedPayments: 0, pendingRefunds: 0, underReviewClaims: 0, recentCriticalEvents: 0 };
  const recentOperationalEvents = 'recentOperationalEvents' in snapshot && Array.isArray((snapshot as any).recentOperationalEvents)
    ? (snapshot as any).recentOperationalEvents
    : [];
  const recentWebhookEvents = 'recentWebhookEvents' in snapshot && Array.isArray((snapshot as any).recentWebhookEvents)
    ? (snapshot as any).recentWebhookEvents
    : [];

  const saveCaseWorkflow = async () => {
    try {
      await updateAdvocacyCaseWorkflow({
        caseId: caseForm.caseId,
        workflowStatus: caseForm.workflowStatus,
        priority: caseForm.priority,
        queueBucket: caseForm.queueBucket,
        assignedAttorneyName: caseForm.assignedAttorneyName,
        lastNote: caseForm.lastNote
      });
      setOpsStatus(`Workflow updated for ${caseForm.caseId}.`);
    } catch (error) {
      setOpsStatus(error instanceof Error ? error.message : 'Workflow update failed.');
    }
  };

  const approveCampaign = async (campaignId: string) => {
    try {
      await reviewAdvocacyCampaign({
        campaignId,
        reviewStatus: 'approved',
        visibilityState: 'published',
        reviewNotes: 'Approved from legal professional dashboard'
      });
      setOpsStatus(`Campaign ${campaignId} approved.`);
    } catch (error) {
      setOpsStatus(error instanceof Error ? error.message : 'Campaign review failed.');
    }
  };

  const handleRefundReview = async (donationId: string, receiptId: string | undefined, refundReviewStatus: 'approved' | 'rejected') => {
    try {
      await reviewAdvocacyRefund({
        donationId,
        receiptId,
        refundReviewStatus,
        reviewNotes: refundReviewStatus === 'approved' ? 'Approved from legal professional dashboard' : 'Refund request rejected after legal review'
      });
      const server = await fetchAdvocacyLegalDashboard();
      if (server && typeof server === 'object') {
        setSnapshot((prev) => ({ ...prev, ...(server as Partial<typeof prev>) }));
      }
      setOpsStatus(`Refund ${refundReviewStatus} for ${donationId}.`);
    } catch (error) {
      setOpsStatus(error instanceof Error ? error.message : 'Refund review failed.');
    }
  };

  const handleDonationReconcile = async (donationId: string, paymentState: 'processing' | 'succeeded' | 'failed') => {
    try {
      await reconcileAdvocacyDonation({
        donationId,
        paymentState,
        processorEventId: `manual-${paymentState}-${Date.now()}`,
        processorFailureReason: paymentState === 'failed' ? 'Marked failed during admin reconciliation review' : undefined
      });
      const server = await fetchAdvocacyLegalDashboard();
      if (server && typeof server === 'object') {
        setSnapshot((prev) => ({ ...prev, ...(server as Partial<typeof prev>) }));
      }
      setOpsStatus(`Donation ${donationId} reconciled as ${paymentState}.`);
    } catch (error) {
      setOpsStatus(error instanceof Error ? error.message : 'Donation reconciliation failed.');
    }
  };

  const handleIcipAssignment = async (entryId: string) => {
    const draft = assignmentDrafts[entryId];
    if (!draft?.assignedReviewerName?.trim()) {
      setOpsStatus('Reviewer name is required before assignment.');
      return;
    }
    try {
      await assignAdvocacyIcipReviewer({
        entryId,
        assignedReviewerId: draft.assignedReviewerId.trim() || undefined,
        assignedReviewerName: draft.assignedReviewerName.trim()
      });
      const server = await fetchAdvocacyLegalDashboard();
      if (server && typeof server === 'object') {
        setSnapshot((prev) => ({ ...prev, ...(server as Partial<typeof prev>) }));
      }
      setOpsStatus(`Claim ${entryId} assigned to ${draft.assignedReviewerName.trim()}.`);
    } catch (error) {
      setOpsStatus(error instanceof Error ? error.message : 'Reviewer assignment failed.');
    }
  };

  const handleDonationAssignment = async (donationId: string) => {
    const draft = assignmentDrafts[donationId];
    if (!draft?.assignedReviewerName?.trim()) {
      setOpsStatus('Reviewer name is required before assignment.');
      return;
    }
    try {
      await assignAdvocacyDonationReviewer({
        donationId,
        assignedReviewerId: draft.assignedReviewerId.trim() || undefined,
        assignedReviewerName: draft.assignedReviewerName.trim()
      });
      const server = await fetchAdvocacyLegalDashboard();
      if (server && typeof server === 'object') {
        setSnapshot((prev) => ({ ...prev, ...(server as Partial<typeof prev>) }));
      }
      setOpsStatus(`Donation workflow ${donationId} assigned to ${draft.assignedReviewerName.trim()}.`);
    } catch (error) {
      setOpsStatus(error instanceof Error ? error.message : 'Donation workflow assignment failed.');
    }
  };

  const handleBulkDonationAssignment = async (queueKey: 'refunds' | 'reconciliation', items: Array<{ donationId: string }>) => {
    const draft = bulkAssignmentDrafts[queueKey];
    if (!draft.assignedReviewerName.trim()) {
      setOpsStatus('Reviewer name is required before bulk assignment.');
      return;
    }
    if (!items.length) {
      setOpsStatus('No visible donation workflows to assign in this queue.');
      return;
    }
    try {
      await Promise.all(items.map((item) => assignAdvocacyDonationReviewer({
        donationId: item.donationId,
        assignedReviewerId: draft.assignedReviewerId.trim() || undefined,
        assignedReviewerName: draft.assignedReviewerName.trim()
      })));
      const server = await fetchAdvocacyLegalDashboard();
      if (server && typeof server === 'object') {
        setSnapshot((prev) => ({ ...prev, ...(server as Partial<typeof prev>) }));
      }
      setOpsStatus(`${items.length} donation workflows assigned to ${draft.assignedReviewerName.trim()}.`);
    } catch (error) {
      setOpsStatus(error instanceof Error ? error.message : 'Bulk donation assignment failed.');
    }
  };

  const handleBulkIcipAssignment = async (items: Array<{ id: string }>) => {
    const draft = bulkAssignmentDrafts.icip;
    if (!draft.assignedReviewerName.trim()) {
      setOpsStatus('Reviewer name is required before bulk assignment.');
      return;
    }
    if (!items.length) {
      setOpsStatus('No visible ICIP claims to assign in this queue.');
      return;
    }
    try {
      await Promise.all(items.map((item) => assignAdvocacyIcipReviewer({
        entryId: item.id,
        assignedReviewerId: draft.assignedReviewerId.trim() || undefined,
        assignedReviewerName: draft.assignedReviewerName.trim()
      })));
      const server = await fetchAdvocacyLegalDashboard();
      if (server && typeof server === 'object') {
        setSnapshot((prev) => ({ ...prev, ...(server as Partial<typeof prev>) }));
      }
      setOpsStatus(`${items.length} ICIP claims assigned to ${draft.assignedReviewerName.trim()}.`);
    } catch (error) {
      setOpsStatus(error instanceof Error ? error.message : 'Bulk ICIP assignment failed.');
    }
  };

  return (
    <AdvocacyFrame title="Legal Professional Dashboard" subtitle="Manage case intake, client requests, and pro bono capacity.">
      <section className="grid gap-4 md:grid-cols-3">
        {[
          ['Open Matters', snapshot.openMatters.toString()],
          ['Pending Consult Requests', snapshot.pendingConsultRequests.toString()],
          ['Pro Bono Queue', snapshot.proBonoQueue.toString()]
        ].map(([k, v]) => (
          <article key={k} className="rounded-xl border border-[#d4af37]/20 bg-[#101112] p-4"><p className="text-xs text-gray-400">{k}</p><p className="mt-1 text-xl font-semibold text-white">{v}</p></article>
        ))}
      </section>
      <section className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
        <article className="rounded-[24px] border border-[#d4af37]/20 bg-[linear-gradient(135deg,rgba(19,16,12,0.98),rgba(10,10,11,0.96))] p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-[#d4af37]">Launch Watchlist</p>
          <h3 className="mt-2 text-xl font-semibold text-white">What needs attention right now</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              ['Failed Payments', operationalWatchlist.failedPayments],
              ['Pending Refunds', operationalWatchlist.pendingRefunds],
              ['Claims Under Review', operationalWatchlist.underReviewClaims],
              ['Critical Signals', operationalWatchlist.recentCriticalEvents]
            ].map(([label, value]) => (
              <div key={String(label)} className="rounded-2xl border border-white/10 bg-black/25 p-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-gray-500">{String(label)}</p>
                <p className="mt-2 text-2xl font-semibold text-white">{String(value)}</p>
              </div>
            ))}
          </div>
        </article>
        <article className="rounded-[24px] border border-[#d4af37]/20 bg-[#101112] p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[#d4af37]">Telemetry</p>
              <h3 className="mt-2 text-xl font-semibold text-white">Recent webhook and ops signals</h3>
            </div>
            <Link href="/advocacy-legal/dashboard/audit-center" className="rounded-full border border-[#d4af37]/30 px-3 py-1 text-xs text-[#d4af37] hover:bg-[#d4af37]/10">
              Open Audit Center
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {recentOperationalEvents.slice(0, 3).map((item: any) => (
              <div key={`${item.id || item.createdAt}-${item.eventType}`} className="rounded-2xl border border-white/10 bg-black/25 p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-white">{item.message || item.eventType}</p>
                  <span className={`rounded-full border px-2 py-1 text-[11px] ${item.severity === 'critical' ? 'border-red-400/30 text-red-300' : item.severity === 'warning' ? 'border-amber-400/30 text-amber-300' : 'border-emerald-400/30 text-emerald-300'}`}>{item.severity || 'info'}</span>
                </div>
                <p className="mt-2 text-xs text-gray-500">{new Date(item.createdAt || Date.now()).toLocaleString()}</p>
              </div>
            ))}
            {recentWebhookEvents.slice(0, 2).map((item: any) => (
              <div key={`${item.id || item.createdAt}-${item.processorEventId || item.paymentIntentId}`} className="rounded-2xl border border-white/10 bg-black/25 p-3">
                <p className="text-sm font-semibold text-white">Webhook: {item.paymentState}</p>
                <p className="mt-1 text-xs text-gray-400">Intent {item.paymentIntentId || 'n/a'} • {item.processingOutcome || 'recorded'}</p>
              </div>
            ))}
            {recentOperationalEvents.length === 0 && recentWebhookEvents.length === 0 ? (
              <p className="text-sm text-gray-500">No recent launch signals recorded yet.</p>
            ) : null}
          </div>
        </article>
      </section>
      <section className="rounded-xl border border-[#d4af37]/20 bg-[#101112] p-5">
        <p className="text-sm text-gray-300">Recent consultation queue</p>
        <div className="mt-3 space-y-2">
          {snapshot.recentConsultations.length === 0 ? <p className="text-sm text-gray-500">No pending consultation requests.</p> : snapshot.recentConsultations.map((row) => (
            <article key={row.id} className="rounded-lg border border-white/10 bg-black/25 p-3">
              <p className="text-sm text-white">{row.attorneyName} • {row.type === 'consultation' ? 'Consultation' : 'Pro Bono Review'}</p>
              <p className="text-xs text-gray-400">{row.contactEmail}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="rounded-xl border border-[#d4af37]/20 bg-[#101112] p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-gray-300">Reviewer workload filter</p>
            <p className="mt-1 text-xs text-gray-500">Focus the dashboard on all legal operations or only the matters currently assigned to your reviewer identity.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs text-gray-500">
              Actor: <span className="text-gray-300">{currentActorId || 'Not detected'}</span>
            </span>
            <select
              value={workloadFilter}
              onChange={(e) => setWorkloadFilter(e.target.value as 'all' | 'mine')}
              className="rounded-full border border-white/15 bg-black/30 px-3 py-2 text-sm text-white"
            >
              <option value="all">All active work</option>
              <option value="mine">Assigned to me</option>
            </select>
          </div>
        </div>
      </section>
      {'assignedCases' in snapshot && Array.isArray(snapshot.assignedCases) ? (
        <section className="rounded-xl border border-[#d4af37]/20 bg-[#101112] p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-gray-300">Assigned case workflow</p>
            <span className="rounded-full border border-[#d4af37]/25 px-3 py-1 text-xs text-[#d4af37]">
              {filteredAssignedCases.length} shown
            </span>
          </div>
          <div className="mt-3 space-y-2">
            {filteredAssignedCases.length === 0 ? <p className="text-sm text-gray-500">{workloadFilter === 'mine' ? 'No case workflows are assigned to your current reviewer identity.' : 'No assigned case workflows yet.'}</p> : filteredAssignedCases.map((row: any) => (
              <article key={row.caseId} className="rounded-lg border border-white/10 bg-black/25 p-3">
                <p className="text-sm text-white">{row.caseId}</p>
                <p className="text-xs text-gray-400">{row.workflowStatus} / {row.priority} / {row.queueBucket}</p>
                {row.assignedAttorneyName ? <p className="mt-1 text-[11px] text-gray-500">Assigned to {row.assignedAttorneyName}</p> : null}
              </article>
            ))}
          </div>
        </section>
      ) : null}
      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-xl border border-[#d4af37]/20 bg-[#101112] p-5 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-gray-300">Case workflow desk</p>
            <span className={`rounded-full border px-2 py-1 text-[11px] ${adminSigned ? 'border-emerald-500/40 text-emerald-300' : 'border-red-500/40 text-red-300'}`}>
              {adminSigned ? 'Admin signed' : 'Read only'}
            </span>
          </div>
          <input value={caseForm.caseId} onChange={(e) => setCaseForm((prev) => ({ ...prev, caseId: e.target.value }))} placeholder="Case ID" className="w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white" />
          <div className="grid gap-3 md:grid-cols-2">
            <input value={caseForm.assignedAttorneyName} onChange={(e) => setCaseForm((prev) => ({ ...prev, assignedAttorneyName: e.target.value }))} placeholder="Assigned attorney name" className="rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white" />
            <input value={caseForm.queueBucket} onChange={(e) => setCaseForm((prev) => ({ ...prev, queueBucket: e.target.value }))} placeholder="Queue bucket" className="rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white" />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <select value={caseForm.workflowStatus} onChange={(e) => setCaseForm((prev) => ({ ...prev, workflowStatus: e.target.value }))} className="rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white">
              <option value="submitted">Submitted</option>
              <option value="under_review">Under Review</option>
              <option value="assigned">Assigned</option>
              <option value="resolved">Resolved</option>
            </select>
            <select value={caseForm.priority} onChange={(e) => setCaseForm((prev) => ({ ...prev, priority: e.target.value }))} className="rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          <textarea value={caseForm.lastNote} onChange={(e) => setCaseForm((prev) => ({ ...prev, lastNote: e.target.value }))} placeholder="Workflow note" className="h-24 w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white" />
          <button disabled={!adminSigned} onClick={() => void saveCaseWorkflow()} className="rounded-lg bg-[#d4af37] px-4 py-2 text-sm font-semibold text-black hover:bg-[#f4d370] disabled:cursor-not-allowed disabled:opacity-50">
            Save Workflow
          </button>
        </article>
        <article className="rounded-xl border border-[#d4af37]/20 bg-[#101112] p-5 space-y-3">
          <p className="text-sm text-gray-300">Campaign review desk</p>
          <div className="space-y-2">
            {campaigns.length === 0 ? <p className="text-sm text-gray-500">No campaigns loaded.</p> : campaigns.slice(0, 5).map((campaign) => (
              <div key={campaign.id} className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-black/25 px-3 py-2">
                <div>
                  <p className="text-sm text-white">{campaign.title}</p>
                  <p className="text-[11px] text-gray-500">{campaign.id}</p>
                </div>
                <button disabled={!adminSigned} onClick={() => void approveCampaign(campaign.id)} className="rounded-full border border-[#d4af37]/35 px-3 py-1 text-xs text-[#d4af37] hover:bg-[#d4af37]/10 disabled:cursor-not-allowed disabled:opacity-50">
                  Approve
                </button>
              </div>
            ))}
          </div>
          {opsStatus ? <p className="text-sm text-emerald-300">{opsStatus}</p> : null}
        </article>
      </section>
      {'refundRequests' in snapshot && Array.isArray(snapshot.refundRequests) ? (
        <section className="rounded-xl border border-[#d4af37]/20 bg-[#101112] p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-gray-300">Refund review queue</p>
              <p className="mt-1 text-xs text-gray-500">Donation refunds now require admin/legal approval before supporter totals change.</p>
            </div>
            <span className="rounded-full border border-[#d4af37]/25 px-3 py-1 text-xs text-[#d4af37]">
              {filteredRefundRequests.length} pending
            </span>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-[1fr_0.8fr_auto]">
            <input
              value={bulkAssignmentDrafts.refunds.assignedReviewerName}
              onChange={(e) => setBulkAssignmentDrafts((current) => ({
                ...current,
                refunds: { ...current.refunds, assignedReviewerName: e.target.value }
              }))}
              placeholder="Bulk reviewer name"
              className="rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white"
            />
            <input
              value={bulkAssignmentDrafts.refunds.assignedReviewerId}
              onChange={(e) => setBulkAssignmentDrafts((current) => ({
                ...current,
                refunds: { ...current.refunds, assignedReviewerId: e.target.value }
              }))}
              placeholder="Bulk reviewer ID"
              className="rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white"
            />
            <button
              disabled={!adminSigned}
              onClick={() => void handleBulkDonationAssignment('refunds', filteredRefundRequests)}
              className="rounded-full border border-[#d4af37]/35 px-4 py-2 text-xs text-[#d4af37] hover:bg-[#d4af37]/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Assign Visible
            </button>
          </div>
          <div className="mt-4 space-y-3">
            {filteredRefundRequests.length === 0 ? (
              <p className="text-sm text-gray-500">{workloadFilter === 'mine' ? 'No refund reviews are assigned to your current reviewer identity.' : 'No refund reviews waiting.'}</p>
            ) : filteredRefundRequests.map((request: any) => (
              <article key={request.donationId} className="rounded-2xl border border-white/10 bg-black/25 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">{request.campaignTitle}</p>
                    <p className="mt-1 text-xs text-gray-400">{request.donorName} • {request.currency} ${Number(request.amount || 0).toLocaleString()}</p>
                    {request.refundReason ? <p className="mt-2 text-sm text-gray-300">{request.refundReason}</p> : null}
                    <p className="mt-2 text-[11px] text-gray-500">Owner: {request.assignedReviewerName || 'Unassigned'}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      disabled={!adminSigned}
                      onClick={() => void handleRefundReview(request.donationId, request.receiptId, 'approved')}
                      className="rounded-full border border-red-400/35 px-3 py-1 text-xs text-red-300 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Approve Refund
                    </button>
                    <button
                      disabled={!adminSigned}
                      onClick={() => void handleRefundReview(request.donationId, request.receiptId, 'rejected')}
                      className="rounded-full border border-[#d4af37]/35 px-3 py-1 text-xs text-[#d4af37] hover:bg-[#d4af37]/10 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </div>
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-[1fr_0.8fr_auto]">
                  <input
                    value={assignmentDrafts[request.donationId]?.assignedReviewerName ?? request.assignedReviewerName ?? ''}
                    onChange={(e) => setAssignmentDrafts((current) => ({
                      ...current,
                      [request.donationId]: {
                        assignedReviewerId: current[request.donationId]?.assignedReviewerId ?? request.assignedReviewerId ?? '',
                        assignedReviewerName: e.target.value
                      }
                    }))}
                    placeholder="Assign reviewer name"
                    className="rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white"
                  />
                  <input
                    value={assignmentDrafts[request.donationId]?.assignedReviewerId ?? request.assignedReviewerId ?? ''}
                    onChange={(e) => setAssignmentDrafts((current) => ({
                      ...current,
                      [request.donationId]: {
                        assignedReviewerId: e.target.value,
                        assignedReviewerName: current[request.donationId]?.assignedReviewerName ?? request.assignedReviewerName ?? ''
                      }
                    }))}
                    placeholder="Reviewer ID"
                    className="rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white"
                  />
                  <button
                    disabled={!adminSigned}
                    onClick={() => void handleDonationAssignment(request.donationId)}
                    className="rounded-full border border-[#d4af37]/35 px-4 py-2 text-xs text-[#d4af37] hover:bg-[#d4af37]/10 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Assign
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}
      {'refundHistory' in snapshot && Array.isArray((snapshot as any).refundHistory) ? (
        <section className="rounded-xl border border-[#d4af37]/20 bg-[#101112] p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm text-gray-300">Refund review history</p>
              <p className="mt-1 text-xs text-gray-500">Recent approved and rejected refund decisions for audit and reconciliation.</p>
            </div>
            <button
              type="button"
              onClick={exportRefundHistory}
              className="rounded-full border border-[#d4af37]/35 px-4 py-2 text-xs text-[#d4af37] hover:bg-[#d4af37]/10"
            >
              Export CSV
            </button>
          </div>
          <div className="mt-4 space-y-3">
            {(snapshot as any).refundHistory.length === 0 ? (
              <p className="text-sm text-gray-500">No reviewed refund decisions yet.</p>
            ) : (snapshot as any).refundHistory.map((item: any) => (
              <article key={`${item.donationId}-${item.updatedAt}`} className="rounded-2xl border border-white/10 bg-black/25 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">{item.campaignTitle}</p>
                    <p className="mt-1 text-xs text-gray-400">{item.donorName} • {item.currency} ${Number(item.amount || 0).toLocaleString()}</p>
                    {item.refundReason ? <p className="mt-2 text-sm text-gray-300">{item.refundReason}</p> : null}
                    {item.reviewNotes ? <p className="mt-2 text-xs text-gray-500">Review note: {item.reviewNotes}</p> : null}
                  </div>
                  <div className="text-right">
                    <span className={`rounded-full border px-3 py-1 text-xs ${
                      item.refundReviewStatus === 'approved'
                        ? 'border-red-400/35 bg-red-500/10 text-red-300'
                        : 'border-[#d4af37]/35 bg-[#d4af37]/10 text-[#d4af37]'
                    }`}>
                      {item.refundReviewStatus}
                    </span>
                    <p className="mt-2 text-[11px] text-gray-500">{item.refundReviewedBy || 'admin'} • {new Date(item.updatedAt).toLocaleString()}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}
      {'reconciliationQueue' in snapshot && Array.isArray((snapshot as any).reconciliationQueue) ? (
        <section className="rounded-xl border border-[#d4af37]/20 bg-[#101112] p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm text-gray-300">Payment reconciliation queue</p>
              <p className="mt-1 text-xs text-gray-500">Webhook-ready payment states waiting for legal/admin confirmation.</p>
            </div>
            <span className="rounded-full border border-[#d4af37]/25 px-3 py-1 text-xs text-[#d4af37]">
              {filteredReconciliationQueue.length} open
            </span>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-[1fr_0.8fr_auto]">
            <input
              value={bulkAssignmentDrafts.reconciliation.assignedReviewerName}
              onChange={(e) => setBulkAssignmentDrafts((current) => ({
                ...current,
                reconciliation: { ...current.reconciliation, assignedReviewerName: e.target.value }
              }))}
              placeholder="Bulk reviewer name"
              className="rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white"
            />
            <input
              value={bulkAssignmentDrafts.reconciliation.assignedReviewerId}
              onChange={(e) => setBulkAssignmentDrafts((current) => ({
                ...current,
                reconciliation: { ...current.reconciliation, assignedReviewerId: e.target.value }
              }))}
              placeholder="Bulk reviewer ID"
              className="rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white"
            />
            <button
              disabled={!adminSigned}
              onClick={() => void handleBulkDonationAssignment('reconciliation', filteredReconciliationQueue)}
              className="rounded-full border border-[#d4af37]/35 px-4 py-2 text-xs text-[#d4af37] hover:bg-[#d4af37]/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Assign Visible
            </button>
          </div>
          <div className="mt-4 space-y-3">
            {filteredReconciliationQueue.length === 0 ? (
              <p className="text-sm text-gray-500">{workloadFilter === 'mine' ? 'No reconciliation items are assigned to your current reviewer identity.' : 'No reconciliation items waiting.'}</p>
            ) : filteredReconciliationQueue.map((item: any) => (
              <article key={item.donationId} className="rounded-2xl border border-white/10 bg-black/25 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">{item.campaignTitle}</p>
                    <p className="mt-1 text-xs text-gray-400">{item.donorName} • {item.currency} ${Number(item.amount || 0).toLocaleString()}</p>
                    <p className="mt-2 text-xs text-gray-500">Intent {item.paymentIntentId || 'n/a'} • {item.paymentState}</p>
                    {item.processorFailureReason ? <p className="mt-2 text-sm text-red-300">{item.processorFailureReason}</p> : null}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      disabled={!adminSigned}
                      onClick={() => void handleDonationReconcile(item.donationId, 'processing')}
                      className="rounded-full border border-blue-400/35 px-3 py-1 text-xs text-blue-300 hover:bg-blue-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Mark Processing
                    </button>
                    <button
                      disabled={!adminSigned}
                      onClick={() => void handleDonationReconcile(item.donationId, 'succeeded')}
                      className="rounded-full border border-emerald-400/35 px-3 py-1 text-xs text-emerald-300 hover:bg-emerald-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Mark Settled
                    </button>
                    <button
                      disabled={!adminSigned}
                      onClick={() => void handleDonationReconcile(item.donationId, 'failed')}
                      className="rounded-full border border-red-400/35 px-3 py-1 text-xs text-red-300 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Mark Failed
                    </button>
                  </div>
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-[1fr_0.8fr_auto]">
                  <input
                    value={assignmentDrafts[item.donationId]?.assignedReviewerName ?? item.assignedReviewerName ?? ''}
                    onChange={(e) => setAssignmentDrafts((current) => ({
                      ...current,
                      [item.donationId]: {
                        assignedReviewerId: current[item.donationId]?.assignedReviewerId ?? item.assignedReviewerId ?? '',
                        assignedReviewerName: e.target.value
                      }
                    }))}
                    placeholder="Assign reviewer name"
                    className="rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white"
                  />
                  <input
                    value={assignmentDrafts[item.donationId]?.assignedReviewerId ?? item.assignedReviewerId ?? ''}
                    onChange={(e) => setAssignmentDrafts((current) => ({
                      ...current,
                      [item.donationId]: {
                        assignedReviewerId: e.target.value,
                        assignedReviewerName: current[item.donationId]?.assignedReviewerName ?? item.assignedReviewerName ?? ''
                      }
                    }))}
                    placeholder="Reviewer ID"
                    className="rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white"
                  />
                  <button
                    disabled={!adminSigned}
                    onClick={() => void handleDonationAssignment(item.donationId)}
                    className="rounded-full border border-[#d4af37]/35 px-4 py-2 text-xs text-[#d4af37] hover:bg-[#d4af37]/10 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Assign
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}
      {'icipReviewQueue' in snapshot && Array.isArray((snapshot as any).icipReviewQueue) ? (
        <section className="rounded-xl border border-[#d4af37]/20 bg-[#101112] p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm text-gray-300">ICIP registry review queue</p>
              <p className="mt-1 text-xs text-gray-500">Cultural rights claims waiting for protocol or legal decision.</p>
            </div>
            <Link href="/advocacy-legal/icip-registry" className="rounded-full border border-[#d4af37]/35 px-4 py-2 text-xs text-[#d4af37] hover:bg-[#d4af37]/10">
              Open Registry
            </Link>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-[1fr_0.8fr_auto]">
            <input
              value={bulkAssignmentDrafts.icip.assignedReviewerName}
              onChange={(e) => setBulkAssignmentDrafts((current) => ({
                ...current,
                icip: { ...current.icip, assignedReviewerName: e.target.value }
              }))}
              placeholder="Bulk reviewer name"
              className="rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white"
            />
            <input
              value={bulkAssignmentDrafts.icip.assignedReviewerId}
              onChange={(e) => setBulkAssignmentDrafts((current) => ({
                ...current,
                icip: { ...current.icip, assignedReviewerId: e.target.value }
              }))}
              placeholder="Bulk reviewer ID"
              className="rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white"
            />
            <button
              disabled={!adminSigned}
              onClick={() => void handleBulkIcipAssignment(filteredIcipReviewQueue)}
              className="rounded-full border border-[#d4af37]/35 px-4 py-2 text-xs text-[#d4af37] hover:bg-[#d4af37]/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Assign Visible
            </button>
          </div>
          <div className="mt-4 space-y-3">
            {filteredIcipReviewQueue.length === 0 ? (
              <p className="text-sm text-gray-500">{workloadFilter === 'mine' ? 'No ICIP claims are assigned to your current reviewer identity.' : 'No ICIP claims are waiting.'}</p>
            ) : filteredIcipReviewQueue.map((item: any) => (
              <article key={item.id} className="rounded-2xl border border-white/10 bg-black/25 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">{item.claimTitle}</p>
                    <p className="mt-1 text-xs text-gray-400">{item.communityName} • {item.registryNumber}</p>
                  </div>
                  <span className="rounded-full border border-amber-400/35 px-3 py-1 text-xs text-amber-200">{item.status}</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-gray-400">
                  <span className="rounded-full border border-white/10 px-2 py-1">{item.protocolVisibility}</span>
                  <span className="rounded-full border border-white/10 px-2 py-1">{item.rightsScope}</span>
                  <span className="rounded-full border border-white/10 px-2 py-1">{item.assignedReviewerName || 'Unassigned'}</span>
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-[1fr_0.8fr_auto]">
                  <input
                    value={assignmentDrafts[item.id]?.assignedReviewerName ?? item.assignedReviewerName ?? ''}
                    onChange={(e) => setAssignmentDrafts((current) => ({
                      ...current,
                      [item.id]: {
                        assignedReviewerId: current[item.id]?.assignedReviewerId ?? item.assignedReviewerId ?? '',
                        assignedReviewerName: e.target.value
                      }
                    }))}
                    placeholder="Assign reviewer name"
                    className="rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white"
                  />
                  <input
                    value={assignmentDrafts[item.id]?.assignedReviewerId ?? item.assignedReviewerId ?? ''}
                    onChange={(e) => setAssignmentDrafts((current) => ({
                      ...current,
                      [item.id]: {
                        assignedReviewerId: e.target.value,
                        assignedReviewerName: current[item.id]?.assignedReviewerName ?? item.assignedReviewerName ?? ''
                      }
                    }))}
                    placeholder="Reviewer ID"
                    className="rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white"
                  />
                  <button
                    disabled={!adminSigned}
                    onClick={() => void handleIcipAssignment(item.id)}
                    className="rounded-full border border-[#d4af37]/35 px-4 py-2 text-xs text-[#d4af37] hover:bg-[#d4af37]/10 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Assign
                  </button>
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-[11px] text-gray-500">
                    {item.assignedReviewerAt ? `Assigned ${new Date(item.assignedReviewerAt).toLocaleString()}` : 'No reviewer ownership recorded yet.'}
                  </p>
                  <Link href={`/advocacy-legal/icip-registry/${item.id}`} className="rounded-full border border-white/10 px-3 py-1 text-[11px] text-gray-300 hover:bg-white/5">
                    Open Claim
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}
      <section className="flex justify-end">
        <Link href="/advocacy-legal/dashboard/audit-center" className="rounded-full border border-[#d4af37]/35 px-4 py-2 text-sm text-[#d4af37] hover:bg-[#d4af37]/10">
          Open Audit Center
        </Link>
      </section>
    </AdvocacyFrame>
  );
}




