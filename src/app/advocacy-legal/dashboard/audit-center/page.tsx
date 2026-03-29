'use client';

import { useEffect, useMemo, useState } from 'react';
import AdvocacyFrame from '../../components/AdvocacyFrame';
import { fetchAdvocacyAuditCenter, readAdvocacyAdminState } from '@/app/lib/advocacyLegalClientStore';

export default function AdvocacyAuditCenterPage() {
  const [adminSigned, setAdminSigned] = useState(false);
  const [status, setStatus] = useState('');
  const [payload, setPayload] = useState<{
    refundHistory: any[];
    reconciliationHistory: any[];
    icipReviewHistory: any[];
    auditTrail: any[];
    operationalEvents: any[];
    webhookEvents: any[];
    launchMetrics: Record<string, number>;
  }>({
    refundHistory: [],
    reconciliationHistory: [],
    icipReviewHistory: [],
    auditTrail: [],
    operationalEvents: [],
    webhookEvents: [],
    launchMetrics: {}
  });

  useEffect(() => {
    let active = true;
    setAdminSigned(readAdvocacyAdminState().adminSigned);
    (async () => {
      const data = await fetchAdvocacyAuditCenter();
      if (active && data && typeof data === 'object') {
        setPayload({
          refundHistory: Array.isArray((data as any).refundHistory) ? (data as any).refundHistory : [],
          reconciliationHistory: Array.isArray((data as any).reconciliationHistory) ? (data as any).reconciliationHistory : [],
          icipReviewHistory: Array.isArray((data as any).icipReviewHistory) ? (data as any).icipReviewHistory : [],
          auditTrail: Array.isArray((data as any).auditTrail) ? (data as any).auditTrail : [],
          operationalEvents: Array.isArray((data as any).operationalEvents) ? (data as any).operationalEvents : [],
          webhookEvents: Array.isArray((data as any).webhookEvents) ? (data as any).webhookEvents : [],
          launchMetrics: (data as any).launchMetrics && typeof (data as any).launchMetrics === 'object' ? (data as any).launchMetrics : {}
        });
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const totals = useMemo(() => ({
    refunds: payload.refundHistory.length,
    reconciliations: payload.reconciliationHistory.length,
    icipReviews: payload.icipReviewHistory.length,
    auditEvents: payload.auditTrail.length,
    operationalEvents: payload.operationalEvents.length,
    webhookEvents: payload.webhookEvents.length
  }), [payload]);

  const exportAudit = () => {
    const rows = payload.auditTrail.map((item) => ({
      event: item.event || '',
      actor: item.actorId || '',
      timestamp: item.timestamp || '',
      metadata: JSON.stringify(item.metadata || {})
    }));
    const header = ['event', 'actor', 'timestamp', 'metadata'];
    const csv = [
      header.join(','),
      ...rows.map((row) => header.map((key) => `"${String((row as any)[key] || '').replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `advocacy-audit-center-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setStatus('Audit trail exported.');
  };

  return (
    <AdvocacyFrame title="Audit Center" subtitle="Unified review surface for refunds, payment reconciliation, ICIP decisions, and legal operations history.">
      <section className="rounded-[28px] border border-[#d4af37]/20 bg-[linear-gradient(135deg,rgba(28,18,11,0.98),rgba(9,9,10,0.98))] p-6 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#d4af37]">Protection Economy Oversight</p>
            <h2 className="mt-2 text-3xl font-semibold text-white">One place to audit money movement, rights claims, and legal review decisions.</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-300">
              This center is for legal and admin teams tracing how donations were reconciled, how refund disputes were resolved, and how ICIP claims moved through review. It is intentionally operational, not promotional.
            </p>
          </div>
          <div className={`rounded-full border px-4 py-2 text-sm ${adminSigned ? 'border-emerald-400/35 text-emerald-300' : 'border-red-400/35 text-red-300'}`}>
            {adminSigned ? 'Admin signed session' : 'Read only session'}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        {[
          ['Refund Decisions', totals.refunds],
          ['Payment Events', totals.reconciliations],
          ['ICIP Reviews', totals.icipReviews],
          ['Audit Events', totals.auditEvents],
          ['Ops Signals', totals.operationalEvents],
          ['Webhook Receipts', totals.webhookEvents]
        ].map(([label, value]) => (
          <article key={label} className="rounded-2xl border border-[#d4af37]/20 bg-[#101112] p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-gray-500">{label}</p>
            <p className="mt-2 text-2xl font-semibold text-white">{String(value)}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-4">
        {[
          ['Failed Payments', payload.launchMetrics.failedPayments || 0],
          ['Pending Refunds', payload.launchMetrics.pendingRefunds || 0],
          ['Active ICIP Reviews', payload.launchMetrics.activeIcipReviews || 0],
          ['Rate Limited Writes', payload.launchMetrics.rateLimitedWrites || 0]
        ].map(([label, value]) => (
          <article key={String(label)} className="rounded-2xl border border-white/10 bg-black/25 p-5">
            <p className="text-[11px] uppercase tracking-[0.18em] text-gray-500">{String(label)}</p>
            <p className="mt-2 text-2xl font-semibold text-white">{String(value)}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <article className="rounded-[28px] border border-[#d4af37]/20 bg-[#101112] p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[#d4af37]">Refund Reviews</p>
              <h3 className="mt-2 text-xl font-semibold text-white">Completed refund decisions</h3>
            </div>
          </div>
          <div className="mt-4 space-y-3">
            {payload.refundHistory.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-black/25 p-4 text-sm text-gray-400">No reviewed refunds yet.</div>
            ) : payload.refundHistory.map((item) => (
              <article key={`${item.donationId}-${item.refundReviewedAt || item.updatedAt}`} className="rounded-2xl border border-white/10 bg-black/25 p-4">
                <p className="text-sm font-semibold text-white">{item.campaignTitle}</p>
                <p className="mt-1 text-xs text-gray-400">{item.donorName} • {item.currency} ${Number(item.amount || 0).toLocaleString()}</p>
                <p className="mt-3 text-sm text-gray-300">{item.refundReason || 'No refund reason captured.'}</p>
                <p className="mt-3 text-[11px] text-gray-500">Owner: {item.assignedReviewerName || 'Unassigned'}</p>
                <p className="mt-3 text-[11px] text-gray-500">{item.refundReviewedBy || 'admin'} • {new Date(item.refundReviewedAt || item.updatedAt || Date.now()).toLocaleString()}</p>
              </article>
            ))}
          </div>
        </article>

        <article className="rounded-[28px] border border-[#d4af37]/20 bg-[#101112] p-6">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#d4af37]">Payment Reconciliation</p>
            <h3 className="mt-2 text-xl font-semibold text-white">Webhook and manual payment history</h3>
          </div>
          <div className="mt-4 space-y-3">
            {payload.reconciliationHistory.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-black/25 p-4 text-sm text-gray-400">No reconciled payment events yet.</div>
            ) : payload.reconciliationHistory.map((item) => (
              <article key={`${item.donationId}-${item.processorEventId || item.updatedAt}`} className="rounded-2xl border border-white/10 bg-black/25 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-white">{item.campaignTitle}</p>
                  <span className="rounded-full border border-[#d4af37]/20 px-2 py-1 text-[11px] text-[#d4af37]">{item.paymentState}</span>
                </div>
                <p className="mt-2 text-xs text-gray-400">Intent {item.paymentIntentId || 'n/a'}</p>
                <p className="mt-1 text-xs text-gray-500">Processor event {item.processorEventId || 'manual'}</p>
                <p className="mt-3 text-[11px] text-gray-500">Owner: {item.assignedReviewerName || 'Unassigned'}</p>
                {item.processorFailureReason ? <p className="mt-3 text-sm text-red-300">{item.processorFailureReason}</p> : null}
              </article>
            ))}
          </div>
        </article>

        <article className="rounded-[28px] border border-[#d4af37]/20 bg-[#101112] p-6">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#d4af37]">ICIP Reviews</p>
            <h3 className="mt-2 text-xl font-semibold text-white">Registry approvals and rejections</h3>
          </div>
          <div className="mt-4 space-y-3">
            {payload.icipReviewHistory.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-black/25 p-4 text-sm text-gray-400">No ICIP review decisions yet.</div>
            ) : payload.icipReviewHistory.map((item) => (
              <article key={`${item.id}-${item.updatedAt || item.reviewedAt}`} className="rounded-2xl border border-white/10 bg-black/25 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-white">{item.claimTitle}</p>
                  <span className={`rounded-full border px-2 py-1 text-[11px] ${item.status === 'approved' ? 'border-emerald-400/35 text-emerald-300' : 'border-red-400/35 text-red-300'}`}>
                    {item.status}
                  </span>
                </div>
                <p className="mt-2 text-xs text-gray-400">{item.registryNumber} • {item.communityName}</p>
                <p className="mt-3 text-[11px] text-gray-500">Owner: {item.assignedReviewerName || 'Unassigned'}</p>
                <p className="mt-3 text-sm text-gray-300">{item.reviewNotes || item.protocolSummary}</p>
              </article>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <article className="rounded-[28px] border border-[#d4af37]/20 bg-[#101112] p-6">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#d4af37]">Operational Signals</p>
            <h3 className="mt-2 text-xl font-semibold text-white">Recent launch events</h3>
          </div>
          <div className="mt-4 space-y-3">
            {payload.operationalEvents.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-black/25 p-4 text-sm text-gray-400">No operational events captured yet.</div>
            ) : payload.operationalEvents.map((item) => (
              <article key={`${item.id || item.createdAt}-${item.eventType}`} className="rounded-2xl border border-white/10 bg-black/25 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-white">{item.message || item.eventType}</p>
                  <span className={`rounded-full border px-2 py-1 text-[11px] ${item.severity === 'critical' ? 'border-red-400/35 text-red-300' : item.severity === 'warning' ? 'border-amber-400/35 text-amber-300' : 'border-emerald-400/35 text-emerald-300'}`}>{item.severity || 'info'}</span>
                </div>
                <p className="mt-2 text-xs text-gray-500">{new Date(item.createdAt || Date.now()).toLocaleString()}</p>
              </article>
            ))}
          </div>
        </article>

        <article className="rounded-[28px] border border-[#d4af37]/20 bg-[#101112] p-6">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#d4af37]">Webhook Receipts</p>
            <h3 className="mt-2 text-xl font-semibold text-white">Recent processor callbacks</h3>
          </div>
          <div className="mt-4 space-y-3">
            {payload.webhookEvents.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-black/25 p-4 text-sm text-gray-400">No webhook receipts recorded yet.</div>
            ) : payload.webhookEvents.map((item) => (
              <article key={`${item.id || item.createdAt}-${item.processorEventId || item.paymentIntentId}`} className="rounded-2xl border border-white/10 bg-black/25 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-white">{item.paymentState}</p>
                  <span className="rounded-full border border-[#d4af37]/30 px-2 py-1 text-[11px] text-[#d4af37]">{item.processingOutcome || 'recorded'}</span>
                </div>
                <p className="mt-2 text-xs text-gray-400">Intent {item.paymentIntentId || 'n/a'} • Event {item.processorEventId || 'manual'}</p>
                {item.errorMessage ? <p className="mt-3 text-sm text-red-300">{item.errorMessage}</p> : null}
              </article>
            ))}
          </div>
        </article>
      </section>

      <section className="rounded-[28px] border border-[#d4af37]/20 bg-[#101112] p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#d4af37]">Audit Trail</p>
            <h3 className="mt-2 text-xl font-semibold text-white">System events across Pillar 9</h3>
          </div>
          <button type="button" onClick={exportAudit} className="rounded-full border border-[#d4af37]/35 px-4 py-2 text-xs text-[#d4af37] hover:bg-[#d4af37]/10">
            Export Audit CSV
          </button>
        </div>
        <div className="mt-4 overflow-hidden rounded-2xl border border-white/10">
          <div className="grid grid-cols-[1.1fr_0.8fr_0.8fr_1.6fr] gap-3 bg-black/40 px-4 py-3 text-[11px] uppercase tracking-[0.2em] text-gray-500">
            <span>Event</span>
            <span>Actor</span>
            <span>Time</span>
            <span>Metadata</span>
          </div>
          <div className="divide-y divide-white/5">
            {payload.auditTrail.length === 0 ? (
              <div className="px-4 py-5 text-sm text-gray-400">No audit events available yet.</div>
            ) : payload.auditTrail.map((item) => (
              <div key={`${item.id || item.timestamp}-${item.event}`} className="grid grid-cols-[1.1fr_0.8fr_0.8fr_1.6fr] gap-3 px-4 py-3 text-sm">
                <span className="text-white">{item.event}</span>
                <span className="text-gray-400">{item.actorId || 'system'}</span>
                <span className="text-gray-500">{new Date(item.timestamp || Date.now()).toLocaleString()}</span>
                <span className="truncate text-gray-400">{JSON.stringify(item.metadata || {})}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {status ? <p className="text-sm text-emerald-300">{status}</p> : null}
    </AdvocacyFrame>
  );
}
