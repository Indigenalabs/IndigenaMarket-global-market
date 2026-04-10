'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  clearAdminSession,
  clearAdminSessionLocalState,
  establishAdminSession,
  fetchFinancialServicesDashboard,
  getFinancialServicesReportUrl,
  isAdminSessionError,
  updateFinancialServiceRecord
} from '@/app/lib/financialServicesApi';
import {
  buildFinancialAuditHistory,
  buildFinancialReconciliationReport,
  buildPayoutAuditHistory,
  buildPayoutReconciliationReport,
  buildRoyaltyAuditHistory,
  buildRoyaltyReconciliationReport,
  filterFinancialAuditHistory,
  filterFinancialReconciliation
} from '@/app/lib/financialServicesPresentation';
import type { FinancialOrderReconciliation, FinancialServicesDashboard } from '@/app/lib/financialServices';

type FinancialEntity = 'payout' | 'indi-withdrawal' | 'royalty' | 'marketplace-order' | 'settlement-case' | 'bnpl' | 'tax-report';
type ReportPreset = {
  id: string;
  name: string;
  filters: {
    pillar: string;
    startDate: string;
    endDate: string;
  };
};

const REPORT_PRESET_STORAGE_KEY = 'indigena_financial_report_presets';

function normalizeDate(value: string) {
  const text = String(value || '').trim();
  return text ? text.slice(0, 10) : '';
}

function withinDateRange(value: string, startDate: string, endDate: string) {
  const occurredAt = normalizeDate(value);
  const normalizedStart = normalizeDate(startDate);
  const normalizedEnd = normalizeDate(endDate);
  if (normalizedStart && occurredAt && occurredAt < normalizedStart) return false;
  if (normalizedEnd && occurredAt && occurredAt > normalizedEnd) return false;
  return true;
}

function escapeCsv(value: string | number | undefined) {
  return `"${String(value ?? '').replace(/"/g, '""')}"`;
}

function triggerDownload(filename: string, content: string, contentType: string) {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export default function FinancialServicesOpsClient() {
  const [data, setData] = useState<FinancialServicesDashboard>({
    payouts: [],
    bnplApplications: [],
    taxReports: [],
    indiWithdrawals: [],
    royalties: [],
    marketplaceOrders: [],
    orderReconciliation: []
  });
  const [feedback, setFeedback] = useState('');
  const [adminSessionExpired, setAdminSessionExpired] = useState(false);
  const [sessionBusy, setSessionBusy] = useState(false);
  const [search, setSearch] = useState('');
  const [queueFilter, setQueueFilter] = useState<'all' | 'payouts' | 'withdrawals' | 'royalties' | 'settlements'>('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [pillarFilter, setPillarFilter] = useState('all');
  const [reportPillarFilter, setReportPillarFilter] = useState('all');
  const [reportStartDate, setReportStartDate] = useState('');
  const [reportEndDate, setReportEndDate] = useState('');
  const [reportPresetName, setReportPresetName] = useState('');
  const [reportPresets, setReportPresets] = useState<ReportPreset[]>([]);
  const [selectedReportPresetId, setSelectedReportPresetId] = useState('');
  const [payoutStartDate, setPayoutStartDate] = useState('');
  const [payoutEndDate, setPayoutEndDate] = useState('');
  const [payoutReportQueueFilter, setPayoutReportQueueFilter] = useState<'all' | 'instant-payouts' | 'indi-withdrawals'>('all');
  const [payoutReportStatusFilter, setPayoutReportStatusFilter] = useState('all');
  const [payoutReportStartDate, setPayoutReportStartDate] = useState('');
  const [payoutReportEndDate, setPayoutReportEndDate] = useState('');
  const [royaltyReportPillarFilter, setRoyaltyReportPillarFilter] = useState('all');
  const [royaltyReportStatusFilter, setRoyaltyReportStatusFilter] = useState('all');
  const [royaltyReportStartDate, setRoyaltyReportStartDate] = useState('');
  const [royaltyReportEndDate, setRoyaltyReportEndDate] = useState('');
  const [royaltyStartDate, setRoyaltyStartDate] = useState('');
  const [royaltyEndDate, setRoyaltyEndDate] = useState('');

  useEffect(() => {
    fetchFinancialServicesDashboard()
      .then((next) => {
        setData(next);
        setAdminSessionExpired(false);
      })
      .catch((error) => {
        setFeedback(error instanceof Error ? error.message : 'Unable to load financial services.');
        if (isAdminSessionError(error)) setAdminSessionExpired(true);
      });
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(REPORT_PRESET_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return;
      setReportPresets(
        parsed
          .filter((entry) => entry && typeof entry === 'object')
          .map((entry) => ({
            id: String(entry.id || ''),
            name: String(entry.name || 'Untitled preset'),
            filters: {
              pillar: String(entry.filters?.pillar || 'all'),
              startDate: String(entry.filters?.startDate || ''),
              endDate: String(entry.filters?.endDate || '')
            }
          }))
          .filter((entry) => entry.id && entry.name)
      );
    } catch {
      // Ignore malformed local presets and let the user save new ones.
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(REPORT_PRESET_STORAGE_KEY, JSON.stringify(reportPresets));
  }, [reportPresets]);

  const summary = useMemo(
    () => ({
      payoutUsage: data.payouts.length,
      withdrawalOps: data.indiWithdrawals.length,
      royaltyQueue: data.royalties.filter((entry) => entry.status !== 'settled').length,
      settlementQueue: data.orderReconciliation.filter((entry) => entry.orderStatus !== 'settled').length,
      escrowVolume: data.bnplApplications.reduce((sum, entry) => sum + entry.amount, 0),
      taxReportPurchases: data.taxReports.length
    }),
    [data]
  );

  const normalizedSearch = search.trim().toLowerCase();
  const availablePillars = useMemo(
    () =>
      Array.from(new Set([...data.royalties.map((entry) => entry.pillar), ...data.orderReconciliation.map((entry) => entry.pillar)])).sort(),
    [data]
  );

  function matchesSearch(values: Array<string | number | undefined>) {
    if (!normalizedSearch) return true;
    return values.some((value) => String(value || '').toLowerCase().includes(normalizedSearch));
  }

  const filteredPayouts = useMemo(
    () =>
      data.payouts.filter((entry) => {
        if (statusFilter !== 'all' && entry.status !== statusFilter) return false;
        if (!withinDateRange(entry.createdAt, payoutStartDate, payoutEndDate)) return false;
        return matchesSearch([entry.walletAddress, entry.actorId, entry.amount, entry.netAmount]);
      }),
    [data.payouts, normalizedSearch, payoutEndDate, payoutStartDate, statusFilter]
  );

  const filteredWithdrawals = useMemo(
    () =>
      data.indiWithdrawals.filter((entry) => {
        if (statusFilter !== 'all' && entry.status !== statusFilter) return false;
        return matchesSearch([entry.destinationLabel, entry.destinationType, entry.actorId, entry.referenceId, entry.amount]);
      }),
    [data.indiWithdrawals, normalizedSearch, statusFilter]
  );

  const filteredRoyalties = useMemo(
    () =>
      data.royalties.filter((entry) => {
        if (statusFilter !== 'all' && entry.status !== statusFilter) return false;
        if (pillarFilter !== 'all' && entry.pillar !== pillarFilter) return false;
        if (!withinDateRange(entry.createdAt, royaltyStartDate, royaltyEndDate)) return false;
        return matchesSearch([
          entry.item,
          entry.actorId,
          entry.sourceId,
          entry.sourceType,
          String(entry.metadata?.orderId || ''),
          String(entry.metadata?.receiptId || ''),
          String(entry.metadata?.bookingId || '')
        ]);
      }),
    [data.royalties, normalizedSearch, pillarFilter, royaltyEndDate, royaltyStartDate, statusFilter]
  );

  const filteredSettlements = useMemo(
    () =>
      data.orderReconciliation.filter((entry) => {
        if (statusFilter !== 'all' && entry.orderStatus !== statusFilter) return false;
        if (pillarFilter !== 'all' && entry.pillar !== pillarFilter) return false;
        return matchesSearch([entry.title, entry.sourceReference, entry.sourceType, entry.sourceLabel, entry.sellerActorId, entry.creatorActorId, entry.pillar]);
      }),
    [data.orderReconciliation, normalizedSearch, pillarFilter, statusFilter]
  );
  const reportFilters = useMemo(
    () => ({
      pillar: reportPillarFilter,
      startDate: reportStartDate,
      endDate: reportEndDate
    }),
    [reportEndDate, reportPillarFilter, reportStartDate]
  );
  const reconciliationReport = useMemo(
    () => buildFinancialReconciliationReport(filterFinancialReconciliation(data.orderReconciliation, reportFilters)),
    [data.orderReconciliation, reportFilters]
  );
  const auditHistory = useMemo(
    () => filterFinancialAuditHistory(buildFinancialAuditHistory(data), reportFilters),
    [data, reportFilters]
  );

  const reportJsonUrl = useMemo(() => getFinancialServicesReportUrl('json', reportFilters), [reportFilters]);
  const reportCsvUrl = useMemo(() => getFinancialServicesReportUrl('csv', reportFilters), [reportFilters]);
  const payoutReportFilters = useMemo(
    () => ({
      view: 'payouts' as const,
      queue: payoutReportQueueFilter,
      status: payoutReportStatusFilter,
      startDate: payoutReportStartDate,
      endDate: payoutReportEndDate
    }),
    [payoutReportEndDate, payoutReportQueueFilter, payoutReportStartDate, payoutReportStatusFilter]
  );
  const payoutReportRows = useMemo(() => buildPayoutReconciliationReport(data, payoutReportFilters), [data, payoutReportFilters]);
  const payoutAuditRows = useMemo(() => buildPayoutAuditHistory(data, payoutReportFilters), [data, payoutReportFilters]);
  const payoutReportJsonUrl = useMemo(() => getFinancialServicesReportUrl('json', payoutReportFilters), [payoutReportFilters]);
  const payoutReportCsvUrl = useMemo(() => getFinancialServicesReportUrl('csv', payoutReportFilters), [payoutReportFilters]);
  const royaltyReportFilters = useMemo(
    () => ({
      view: 'royalties' as const,
      pillar: royaltyReportPillarFilter,
      status: royaltyReportStatusFilter,
      startDate: royaltyReportStartDate,
      endDate: royaltyReportEndDate
    }),
    [royaltyReportEndDate, royaltyReportPillarFilter, royaltyReportStartDate, royaltyReportStatusFilter]
  );
  const royaltyReportRows = useMemo(() => buildRoyaltyReconciliationReport(data, royaltyReportFilters), [data, royaltyReportFilters]);
  const royaltyAuditRows = useMemo(() => buildRoyaltyAuditHistory(data, royaltyReportFilters), [data, royaltyReportFilters]);
  const royaltyReportJsonUrl = useMemo(() => getFinancialServicesReportUrl('json', royaltyReportFilters), [royaltyReportFilters]);
  const royaltyReportCsvUrl = useMemo(() => getFinancialServicesReportUrl('csv', royaltyReportFilters), [royaltyReportFilters]);

  async function update(entity: FinancialEntity, id: string, status: string) {
    let json;
    try {
      json = await updateFinancialServiceRecord({ entity, id, status });
      setAdminSessionExpired(false);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Unable to update financial service record.');
      if (isAdminSessionError(error)) {
        setAdminSessionExpired(true);
      }
      return;
    }
    if (entity === 'payout') {
      setData((current) => ({ ...current, payouts: current.payouts.map((entry) => (entry.id === id ? json.payout : entry)) }));
      return;
    }
    if (entity === 'indi-withdrawal') {
      setData((current) => ({ ...current, indiWithdrawals: current.indiWithdrawals.map((entry) => (entry.id === id ? json.withdrawal : entry)) }));
      return;
    }
    if (entity === 'royalty') {
      setData((current) => ({ ...current, royalties: current.royalties.map((entry) => (entry.id === id ? json.royalty : entry)) }));
      return;
    }
    if (entity === 'marketplace-order' || entity === 'settlement-case') {
      setData((current) => {
        const nextMarketplaceOrders = current.marketplaceOrders.map((entry) => (json.order && entry.id === id ? json.order : entry));
        const nextRoyalties = current.royalties.map((entry) => {
          const updated = Array.isArray(json.ledgerEntries) ? json.ledgerEntries.find((candidate: { id: string }) => candidate.id === entry.id) : null;
          return updated || entry;
        });
        return {
          ...current,
          marketplaceOrders: nextMarketplaceOrders,
          royalties: nextRoyalties,
          orderReconciliation: current.orderReconciliation.map((entry) =>
            entry.settlementId === id ? reconcileRow(entry, json.order, json.settlementCase, json.ledgerEntries || []) : entry
          )
        };
      });
      return;
    }
    if (entity === 'bnpl') {
      setData((current) => ({ ...current, bnplApplications: current.bnplApplications.map((entry) => (entry.id === id ? json.application : entry)) }));
      return;
    }
    if (entity === 'tax-report') {
      setData((current) => ({ ...current, taxReports: current.taxReports.map((entry) => (entry.id === id ? json.report : entry)) }));
    }
  }

  async function recoverAdminSession() {
    setSessionBusy(true);
    setFeedback('');
    try {
      await establishAdminSession();
      const next = await fetchFinancialServicesDashboard();
      setData(next);
      setAdminSessionExpired(false);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Unable to establish admin session.');
    } finally {
      setSessionBusy(false);
    }
  }

  async function signOutAdminSession() {
    setSessionBusy(true);
    setFeedback('');
    try {
      await clearAdminSession();
      clearAdminSessionLocalState();
      window.location.reload();
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Unable to clear admin session.');
      setSessionBusy(false);
    }
  }

  function saveCurrentReportPreset() {
    const name = reportPresetName.trim();
    if (!name) {
      setFeedback('Give the report preset a short name before saving it.');
      return;
    }
    const nextPreset: ReportPreset = {
      id: `${Date.now()}`,
      name,
      filters: {
        pillar: reportPillarFilter,
        startDate: reportStartDate,
        endDate: reportEndDate
      }
    };
    setReportPresets((current) => [nextPreset, ...current.filter((entry) => entry.name.toLowerCase() !== name.toLowerCase())]);
    setSelectedReportPresetId(nextPreset.id);
    setReportPresetName('');
    setFeedback(`Saved report preset "${name}".`);
  }

  function applySelectedReportPreset() {
    const preset = reportPresets.find((entry) => entry.id === selectedReportPresetId);
    if (!preset) {
      setFeedback('Choose a saved report preset to apply.');
      return;
    }
    setReportPillarFilter(preset.filters.pillar || 'all');
    setReportStartDate(preset.filters.startDate || '');
    setReportEndDate(preset.filters.endDate || '');
    setFeedback(`Applied report preset "${preset.name}".`);
  }

  function deleteSelectedReportPreset() {
    const preset = reportPresets.find((entry) => entry.id === selectedReportPresetId);
    if (!preset) {
      setFeedback('Choose a saved report preset to delete.');
      return;
    }
    setReportPresets((current) => current.filter((entry) => entry.id !== selectedReportPresetId));
    setSelectedReportPresetId('');
    setFeedback(`Deleted report preset "${preset.name}".`);
  }

  function resetReportFilters() {
    setReportPillarFilter('all');
    setReportStartDate('');
    setReportEndDate('');
    setFeedback('Cleared report filters.');
  }

  function exportPayouts(format: 'csv' | 'json') {
    if (filteredPayouts.length === 0) {
      setFeedback('No payout rows match the current payout filters.');
      return;
    }
    if (format === 'json') {
      triggerDownload(
        'financial-payouts-export.json',
        JSON.stringify(
          {
            generatedAt: new Date().toISOString(),
            filters: {
              status: statusFilter,
              search,
              startDate: payoutStartDate,
              endDate: payoutEndDate
            },
            rows: filteredPayouts
          },
          null,
          2
        ),
        'application/json; charset=utf-8'
      );
      setFeedback(`Exported ${filteredPayouts.length} payout rows as JSON.`);
      return;
    }
    const csv = [
      'id,actor_id,profile_slug,destination_label,destination_type,destination_status,destination_last4,risk_level,review_reason,reserve_hold_amount,status,gross_amount,fee_amount,net_amount,created_at,updated_at',
      ...filteredPayouts.map((entry) =>
        [
          entry.id,
          entry.actorId,
          entry.profileSlug,
          entry.destinationLabel,
          entry.destinationType,
          entry.destinationStatus,
          entry.destinationLast4,
          entry.riskLevel,
          entry.reviewReason,
          entry.reserveHoldAmount,
          entry.status,
          entry.amount,
          entry.feeAmount,
          entry.netAmount,
          entry.createdAt,
          entry.updatedAt
        ].map(escapeCsv).join(',')
      )
    ].join('\n');
    triggerDownload('financial-payouts-export.csv', csv, 'text/csv; charset=utf-8');
    setFeedback(`Exported ${filteredPayouts.length} payout rows as CSV.`);
  }

  function exportRoyalties(format: 'csv' | 'json') {
    if (filteredRoyalties.length === 0) {
      setFeedback('No royalty rows match the current royalty filters.');
      return;
    }
    if (format === 'json') {
      triggerDownload(
        'financial-royalties-export.json',
        JSON.stringify(
          {
            generatedAt: new Date().toISOString(),
            filters: {
              status: statusFilter,
              pillar: pillarFilter,
              search,
              startDate: royaltyStartDate,
              endDate: royaltyEndDate
            },
            rows: filteredRoyalties
          },
          null,
          2
        ),
        'application/json; charset=utf-8'
      );
      setFeedback(`Exported ${filteredRoyalties.length} royalty rows as JSON.`);
      return;
    }
    const csv = [
      'id,pillar,type,status,item,actor_id,source_type,source_id,gross_amount,platform_fee_amount,creator_net_amount,created_at',
      ...filteredRoyalties.map((entry) =>
        [
          entry.id,
          entry.pillar,
          entry.type,
          entry.status,
          entry.item,
          entry.actorId,
          entry.sourceType,
          entry.sourceId,
          entry.grossAmount,
          entry.platformFeeAmount,
          entry.creatorNetAmount,
          entry.createdAt
        ]
          .map(escapeCsv)
          .join(',')
      )
    ].join('\n');
    triggerDownload('financial-royalties-export.csv', csv, 'text/csv; charset=utf-8');
    setFeedback(`Exported ${filteredRoyalties.length} royalty rows as CSV.`);
  }

  function reconcileRow(
    current: FinancialOrderReconciliation,
    order: FinancialServicesDashboard['marketplaceOrders'][number] | undefined,
    settlementCase: FinancialOrderReconciliation | undefined,
    ledgerEntries: FinancialServicesDashboard['royalties']
  ) {
    return {
      ...current,
      orderStatus: settlementCase?.orderStatus || order?.status || current.orderStatus,
      saleLedgerStatuses: ledgerEntries.filter((entry) => entry.type === 'sale').map((entry) => entry.status),
      royaltyLedgerStatuses: ledgerEntries.filter((entry) => entry.type === 'royalty').map((entry) => entry.status)
    } satisfies FinancialOrderReconciliation;
  }

  return (
    <section className="space-y-6">
      {adminSessionExpired ? (
        <div className="rounded-[28px] border border-[#d4af37]/20 bg-[#111111] p-5">
          <h2 className="text-lg font-semibold text-white">Admin session expired</h2>
          <p className="mt-2 text-sm text-gray-300">
            This finance surface still has your local admin identity, but the protected admin cookie session expired. Re-establish it to keep reconciling payouts and exports, or sign out fully.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => void recoverAdminSession()}
              disabled={sessionBusy}
              className="rounded-xl bg-[#d4af37] px-4 py-2 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-60"
            >
              {sessionBusy ? 'Re-establishing...' : 'Re-establish admin session'}
            </button>
            <button
              type="button"
              onClick={() => void signOutAdminSession()}
              disabled={sessionBusy}
              className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white transition hover:border-red-400/40 hover:text-[#f3deb1] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Sign out admin
            </button>
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-6">
        <div className="rounded-[24px] border border-white/10 bg-[#111111] p-5"><p className="text-xs uppercase tracking-[0.16em] text-gray-500">Instant payout usage</p><p className="mt-2 text-2xl font-semibold text-white">{summary.payoutUsage}</p></div>
        <div className="rounded-[24px] border border-white/10 bg-[#111111] p-5"><p className="text-xs uppercase tracking-[0.16em] text-gray-500">INDI withdrawal ops</p><p className="mt-2 text-2xl font-semibold text-white">{summary.withdrawalOps}</p></div>
        <div className="rounded-[24px] border border-white/10 bg-[#111111] p-5"><p className="text-xs uppercase tracking-[0.16em] text-gray-500">Royalty queue</p><p className="mt-2 text-2xl font-semibold text-white">{summary.royaltyQueue}</p></div>
        <div className="rounded-[24px] border border-white/10 bg-[#111111] p-5"><p className="text-xs uppercase tracking-[0.16em] text-gray-500">Settlement queue</p><p className="mt-2 text-2xl font-semibold text-white">{summary.settlementQueue}</p></div>
        <div className="rounded-[24px] border border-white/10 bg-[#111111] p-5"><p className="text-xs uppercase tracking-[0.16em] text-gray-500">BNPL / escrow volume</p><p className="mt-2 text-2xl font-semibold text-white">${summary.escrowVolume.toFixed(2)}</p></div>
        <div className="rounded-[24px] border border-white/10 bg-[#111111] p-5"><p className="text-xs uppercase tracking-[0.16em] text-gray-500">Tax report purchases</p><p className="mt-2 text-2xl font-semibold text-white">{summary.taxReportPurchases}</p></div>
      </div>

      <div className="rounded-[28px] border border-white/10 bg-[#111111] p-5">
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex min-w-[220px] flex-1 flex-col gap-2 text-sm text-gray-300">
            <span className="text-xs uppercase tracking-[0.16em] text-gray-500">Search queues</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by title, actor, receipt, booking, or order"
              className="rounded-xl border border-white/10 bg-[#0b0b0b] px-3 py-2 text-sm text-white outline-none placeholder:text-gray-600"
            />
          </label>
          <label className="flex min-w-[170px] flex-col gap-2 text-sm text-gray-300">
            <span className="text-xs uppercase tracking-[0.16em] text-gray-500">Queue</span>
            <select value={queueFilter} onChange={(event) => setQueueFilter(event.target.value as typeof queueFilter)} className="rounded-xl border border-white/10 bg-[#0b0b0b] px-3 py-2 text-sm text-white outline-none">
              <option value="all">All queues</option>
              <option value="payouts">Instant payouts</option>
              <option value="withdrawals">INDI withdrawals</option>
              <option value="royalties">Royalty ledger</option>
              <option value="settlements">Settlement cases</option>
            </select>
          </label>
          <label className="flex min-w-[170px] flex-col gap-2 text-sm text-gray-300">
            <span className="text-xs uppercase tracking-[0.16em] text-gray-500">Status</span>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-xl border border-white/10 bg-[#0b0b0b] px-3 py-2 text-sm text-white outline-none">
              <option value="all">All statuses</option>
              <option value="requested">Requested</option>
              <option value="queued">Queued</option>
              <option value="processing">Processing</option>
              <option value="reviewing">Reviewing</option>
              <option value="paid">Paid</option>
              <option value="pending_payout">Pending payout</option>
              <option value="pending_settlement">Pending settlement</option>
              <option value="settled">Settled</option>
              <option value="captured">Captured</option>
              <option value="failed">Failed</option>
              <option value="cancelled">Cancelled</option>
              <option value="refunded">Refunded</option>
              <option value="disputed">Disputed</option>
            </select>
          </label>
          <label className="flex min-w-[170px] flex-col gap-2 text-sm text-gray-300">
            <span className="text-xs uppercase tracking-[0.16em] text-gray-500">Pillar</span>
            <select value={pillarFilter} onChange={(event) => setPillarFilter(event.target.value)} className="rounded-xl border border-white/10 bg-[#0b0b0b] px-3 py-2 text-sm text-white outline-none">
              <option value="all">All pillars</option>
              {availablePillars.map((pillar) => (
                <option key={pillar} value={pillar}>
                  {pillar}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="rounded-[28px] border border-white/10 bg-[#111111] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-white">Reconciliation reports</h2>
            <p className="mt-1 text-sm text-gray-400">Export the current finance picture or review the last 200 audit snapshots generated from payouts, withdrawals, royalties, and settlement cases.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href={reportJsonUrl}
              className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white transition hover:border-[#d4af37]/40 hover:text-[#f3deb1]"
            >
              Open JSON
            </a>
            <a
              href={reportCsvUrl}
              className="rounded-xl border border-[#d4af37]/30 px-4 py-2 text-sm text-[#f3deb1] transition hover:bg-[#d4af37]/10"
            >
              Export CSV
            </a>
          </div>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <label className="flex flex-col gap-2 text-sm text-gray-300">
            <span className="text-xs uppercase tracking-[0.16em] text-gray-500">Report pillar</span>
            <select value={reportPillarFilter} onChange={(event) => setReportPillarFilter(event.target.value)} className="rounded-xl border border-white/10 bg-[#0b0b0b] px-3 py-2 text-sm text-white outline-none">
              <option value="all">All pillars</option>
              {availablePillars.map((pillar) => (
                <option key={pillar} value={pillar}>
                  {pillar}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-2 text-sm text-gray-300">
            <span className="text-xs uppercase tracking-[0.16em] text-gray-500">From date</span>
            <input
              type="date"
              value={reportStartDate}
              onChange={(event) => setReportStartDate(event.target.value)}
              className="rounded-xl border border-white/10 bg-[#0b0b0b] px-3 py-2 text-sm text-white outline-none"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-gray-300">
            <span className="text-xs uppercase tracking-[0.16em] text-gray-500">To date</span>
            <input
              type="date"
              value={reportEndDate}
              onChange={(event) => setReportEndDate(event.target.value)}
              className="rounded-xl border border-white/10 bg-[#0b0b0b] px-3 py-2 text-sm text-white outline-none"
            />
          </label>
        </div>
        <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
          <div className="flex flex-wrap items-end gap-3">
            <label className="flex min-w-[220px] flex-1 flex-col gap-2 text-sm text-gray-300">
              <span className="text-xs uppercase tracking-[0.16em] text-gray-500">Preset name</span>
              <input
                value={reportPresetName}
                onChange={(event) => setReportPresetName(event.target.value)}
                placeholder="Weekly materials review"
                className="rounded-xl border border-white/10 bg-[#0b0b0b] px-3 py-2 text-sm text-white outline-none placeholder:text-gray-600"
              />
            </label>
            <button
              type="button"
              onClick={saveCurrentReportPreset}
              className="rounded-xl border border-[#d4af37]/30 px-4 py-2 text-sm text-[#f3deb1] transition hover:bg-[#d4af37]/10"
            >
              Save current preset
            </button>
            <button
              type="button"
              onClick={resetReportFilters}
              className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white transition hover:border-[#d4af37]/40 hover:text-[#f3deb1]"
            >
              Clear filters
            </button>
          </div>
          <div className="mt-4 flex flex-wrap items-end gap-3">
            <label className="flex min-w-[220px] flex-1 flex-col gap-2 text-sm text-gray-300">
              <span className="text-xs uppercase tracking-[0.16em] text-gray-500">Saved presets</span>
              <select
                value={selectedReportPresetId}
                onChange={(event) => setSelectedReportPresetId(event.target.value)}
                className="rounded-xl border border-white/10 bg-[#0b0b0b] px-3 py-2 text-sm text-white outline-none"
              >
                <option value="">Choose a preset</option>
                {reportPresets.map((preset) => (
                  <option key={preset.id} value={preset.id}>
                    {preset.name}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              onClick={applySelectedReportPreset}
              className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white transition hover:border-[#d4af37]/40 hover:text-[#f3deb1]"
            >
              Apply preset
            </button>
            <button
              type="button"
              onClick={deleteSelectedReportPreset}
              className="rounded-xl border border-red-500/20 px-4 py-2 text-sm text-white transition hover:border-red-400/40 hover:text-[#f3deb1]"
            >
              Delete preset
            </button>
          </div>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {reconciliationReport.map((row) => (
            <div key={row.pillar} className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-gray-500">{row.pillar}</p>
              <p className="mt-2 text-lg font-semibold text-white">{row.caseCount} cases</p>
              <p className="mt-2 text-sm text-gray-300">Gross {row.grossAmount.toFixed(2)}</p>
              <p className="mt-1 text-xs text-gray-500">Pending {row.pendingCount} • Settled {row.settledCount} • Disputed {row.disputedCount}</p>
            </div>
          ))}
          {reconciliationReport.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 bg-black/10 p-4 text-sm text-gray-400">
              No reconciliation report rows match the current filters.
            </div>
          ) : null}
        </div>
        <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-gray-300">Audit history</h3>
            <p className="text-xs text-gray-500">{auditHistory.length} entries</p>
          </div>
          <div className="mt-3 space-y-2">
            {auditHistory.slice(0, 12).map((entry) => (
              <div key={entry.id} className="rounded-xl border border-white/10 bg-[#0b0b0b] px-3 py-3 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-white">{entry.title}</p>
                    <p className="mt-1 text-xs text-gray-500">{entry.entity} • {entry.pillar} • {entry.sourceReference}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-white">{entry.amount.toFixed(2)} {entry.currency}</p>
                    <p className="mt-1 text-xs text-gray-500">{entry.status}</p>
                  </div>
                </div>
                <p className="mt-2 text-xs text-gray-400">{entry.note} • {entry.actorId} • {entry.occurredAt}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-[28px] border border-white/10 bg-[#111111] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-white">Payout reconciliation</h2>
            <p className="mt-1 text-sm text-gray-400">Review instant payout and withdrawal queue movement, then export payout-specific report and audit history slices.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href={payoutReportJsonUrl}
              className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white transition hover:border-[#d4af37]/40 hover:text-[#f3deb1]"
            >
              Open payout JSON
            </a>
            <a
              href={payoutReportCsvUrl}
              className="rounded-xl border border-[#d4af37]/30 px-4 py-2 text-sm text-[#f3deb1] transition hover:bg-[#d4af37]/10"
            >
              Export payout CSV
            </a>
          </div>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <label className="flex flex-col gap-2 text-sm text-gray-300">
            <span className="text-xs uppercase tracking-[0.16em] text-gray-500">Payout queue</span>
            <select
              value={payoutReportQueueFilter}
              onChange={(event) => setPayoutReportQueueFilter(event.target.value as typeof payoutReportQueueFilter)}
              className="rounded-xl border border-white/10 bg-[#0b0b0b] px-3 py-2 text-sm text-white outline-none"
            >
              <option value="all">All payout queues</option>
              <option value="instant-payouts">Instant payouts</option>
              <option value="indi-withdrawals">INDI withdrawals</option>
            </select>
          </label>
          <label className="flex flex-col gap-2 text-sm text-gray-300">
            <span className="text-xs uppercase tracking-[0.16em] text-gray-500">Payout status</span>
            <select
              value={payoutReportStatusFilter}
              onChange={(event) => setPayoutReportStatusFilter(event.target.value)}
              className="rounded-xl border border-white/10 bg-[#0b0b0b] px-3 py-2 text-sm text-white outline-none"
            >
              <option value="all">All statuses</option>
              <option value="requested">Requested</option>
              <option value="queued">Queued</option>
              <option value="reviewing">Reviewing</option>
              <option value="processing">Processing</option>
              <option value="paid">Paid</option>
              <option value="failed">Failed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </label>
          <label className="flex flex-col gap-2 text-sm text-gray-300">
            <span className="text-xs uppercase tracking-[0.16em] text-gray-500">From date</span>
            <input
              type="date"
              value={payoutReportStartDate}
              onChange={(event) => setPayoutReportStartDate(event.target.value)}
              className="rounded-xl border border-white/10 bg-[#0b0b0b] px-3 py-2 text-sm text-white outline-none"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-gray-300">
            <span className="text-xs uppercase tracking-[0.16em] text-gray-500">To date</span>
            <input
              type="date"
              value={payoutReportEndDate}
              onChange={(event) => setPayoutReportEndDate(event.target.value)}
              className="rounded-xl border border-white/10 bg-[#0b0b0b] px-3 py-2 text-sm text-white outline-none"
            />
          </label>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {payoutReportRows.map((row) => (
            <div key={`${row.queue}-${row.status}`} className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-gray-500">{row.queue}</p>
              <p className="mt-2 text-lg font-semibold text-white">{row.requestCount} {row.status}</p>
              <p className="mt-2 text-sm text-gray-300">Gross {row.grossAmount.toFixed(2)}</p>
              <p className="mt-1 text-xs text-gray-500">Fees {row.feeAmount.toFixed(2)} • Net {row.netAmount.toFixed(2)}</p>
            </div>
          ))}
          {payoutReportRows.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 bg-black/10 p-4 text-sm text-gray-400">
              No payout report rows match the current payout filters.
            </div>
          ) : null}
        </div>
        <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-gray-300">Payout audit history</h3>
            <p className="text-xs text-gray-500">{payoutAuditRows.length} entries</p>
          </div>
          <div className="mt-3 space-y-2">
            {payoutAuditRows.slice(0, 10).map((entry) => (
              <div key={entry.id} className="rounded-xl border border-white/10 bg-[#0b0b0b] px-3 py-3 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-white">{entry.destination}</p>
                    <p className="mt-1 text-xs text-gray-500">{entry.queue} • {entry.sourceReference} • {entry.actorId}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-white">{entry.netAmount.toFixed(2)} {entry.currency}</p>
                    <p className="mt-1 text-xs text-gray-500">{entry.status}</p>
                  </div>
                </div>
                <p className="mt-2 text-xs text-gray-400">{entry.note} • gross {entry.amount.toFixed(2)} • fee {entry.feeAmount.toFixed(2)} • {entry.occurredAt}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-[28px] border border-white/10 bg-[#111111] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-white">Royalty reconciliation</h2>
            <p className="mt-1 text-sm text-gray-400">Review royalty and sale-ledger movement by pillar, then export royalty-specific report and audit history slices.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href={royaltyReportJsonUrl}
              className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white transition hover:border-[#d4af37]/40 hover:text-[#f3deb1]"
            >
              Open royalty JSON
            </a>
            <a
              href={royaltyReportCsvUrl}
              className="rounded-xl border border-[#d4af37]/30 px-4 py-2 text-sm text-[#f3deb1] transition hover:bg-[#d4af37]/10"
            >
              Export royalty CSV
            </a>
          </div>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <label className="flex flex-col gap-2 text-sm text-gray-300">
            <span className="text-xs uppercase tracking-[0.16em] text-gray-500">Royalty pillar</span>
            <select
              value={royaltyReportPillarFilter}
              onChange={(event) => setRoyaltyReportPillarFilter(event.target.value)}
              className="rounded-xl border border-white/10 bg-[#0b0b0b] px-3 py-2 text-sm text-white outline-none"
            >
              <option value="all">All pillars</option>
              {availablePillars.map((pillar) => (
                <option key={`royalty-report-${pillar}`} value={pillar}>
                  {pillar}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-2 text-sm text-gray-300">
            <span className="text-xs uppercase tracking-[0.16em] text-gray-500">Royalty status</span>
            <select
              value={royaltyReportStatusFilter}
              onChange={(event) => setRoyaltyReportStatusFilter(event.target.value)}
              className="rounded-xl border border-white/10 bg-[#0b0b0b] px-3 py-2 text-sm text-white outline-none"
            >
              <option value="all">All statuses</option>
              <option value="paid">Paid</option>
              <option value="pending_payout">Pending payout</option>
              <option value="settled">Settled</option>
              <option value="disputed">Disputed</option>
              <option value="refunded">Refunded</option>
            </select>
          </label>
          <label className="flex flex-col gap-2 text-sm text-gray-300">
            <span className="text-xs uppercase tracking-[0.16em] text-gray-500">From date</span>
            <input
              type="date"
              value={royaltyReportStartDate}
              onChange={(event) => setRoyaltyReportStartDate(event.target.value)}
              className="rounded-xl border border-white/10 bg-[#0b0b0b] px-3 py-2 text-sm text-white outline-none"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-gray-300">
            <span className="text-xs uppercase tracking-[0.16em] text-gray-500">To date</span>
            <input
              type="date"
              value={royaltyReportEndDate}
              onChange={(event) => setRoyaltyReportEndDate(event.target.value)}
              className="rounded-xl border border-white/10 bg-[#0b0b0b] px-3 py-2 text-sm text-white outline-none"
            />
          </label>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {royaltyReportRows.map((row) => (
            <div key={`${row.pillar}-${row.status}`} className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-gray-500">{row.pillar}</p>
              <p className="mt-2 text-lg font-semibold text-white">{row.entryCount} {row.status}</p>
              <p className="mt-2 text-sm text-gray-300">Gross {row.grossAmount.toFixed(2)}</p>
              <p className="mt-1 text-xs text-gray-500">Fees {row.platformFeeAmount.toFixed(2)} • Net {row.creatorNetAmount.toFixed(2)}</p>
            </div>
          ))}
          {royaltyReportRows.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 bg-black/10 p-4 text-sm text-gray-400">
              No royalty report rows match the current royalty filters.
            </div>
          ) : null}
        </div>
        <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-gray-300">Royalty audit history</h3>
            <p className="text-xs text-gray-500">{royaltyAuditRows.length} entries</p>
          </div>
          <div className="mt-3 space-y-2">
            {royaltyAuditRows.slice(0, 10).map((entry) => (
              <div key={entry.id} className="rounded-xl border border-white/10 bg-[#0b0b0b] px-3 py-3 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-white">{entry.item}</p>
                    <p className="mt-1 text-xs text-gray-500">{entry.pillar} • {entry.type} • {entry.sourceReference}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-white">{entry.creatorNetAmount.toFixed(2)} {entry.currency}</p>
                    <p className="mt-1 text-xs text-gray-500">{entry.status}</p>
                  </div>
                </div>
                <p className="mt-2 text-xs text-gray-400">{entry.note} • gross {entry.grossAmount.toFixed(2)} • fee {entry.platformFeeAmount.toFixed(2)} • {entry.actorId} • {entry.occurredAt}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {(queueFilter === 'all' || queueFilter === 'payouts') ? <div className="rounded-[28px] border border-white/10 bg-[#111111] p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-white">Instant payouts</h2>
              <p className="mt-1 text-sm text-gray-400">{filteredPayouts.length} rows match the payout filters.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => exportPayouts('json')}
                className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white transition hover:border-[#d4af37]/40 hover:text-[#f3deb1]"
              >
                Export JSON
              </button>
              <button
                type="button"
                onClick={() => exportPayouts('csv')}
                className="rounded-xl border border-[#d4af37]/30 px-4 py-2 text-sm text-[#f3deb1] transition hover:bg-[#d4af37]/10"
              >
                Export CSV
              </button>
            </div>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm text-gray-300">
              <span className="text-xs uppercase tracking-[0.16em] text-gray-500">Payout from date</span>
              <input
                type="date"
                value={payoutStartDate}
                onChange={(event) => setPayoutStartDate(event.target.value)}
                className="rounded-xl border border-white/10 bg-[#0b0b0b] px-3 py-2 text-sm text-white outline-none"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-gray-300">
              <span className="text-xs uppercase tracking-[0.16em] text-gray-500">Payout to date</span>
              <input
                type="date"
                value={payoutEndDate}
                onChange={(event) => setPayoutEndDate(event.target.value)}
                className="rounded-xl border border-white/10 bg-[#0b0b0b] px-3 py-2 text-sm text-white outline-none"
              />
            </label>
          </div>
          <div className="mt-4 space-y-3">
            {filteredPayouts.map((entry) => (
              <div key={entry.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-sm font-semibold text-white">{entry.destinationLabel || entry.walletAddress}</p>
                <p className="mt-1 text-xs text-gray-500">
                  ${entry.amount.toFixed(2)} gross - fee ${entry.feeAmount.toFixed(2)} - net ${entry.netAmount.toFixed(2)}
                  {entry.reserveHoldAmount > 0 ? ` - reserve ${entry.reserveHoldAmount.toFixed(2)}` : ''}
                </p>
                <div className="mt-3 grid gap-3 text-xs text-gray-400 md:grid-cols-2">
                  <div className="rounded-xl border border-white/10 bg-[#0b0b0b] p-3">
                    <p className="uppercase tracking-[0.16em] text-gray-500">Destination</p>
                    <p className="mt-2 text-sm text-white">
                      {entry.destinationType.replace('_', ' ')}
                      {entry.destinationLast4 ? ` • •••• ${entry.destinationLast4}` : ''}
                    </p>
                    <p className="mt-1 text-[11px] text-gray-500">{entry.destinationStatus}</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-[#0b0b0b] p-3">
                    <p className="uppercase tracking-[0.16em] text-gray-500">Risk and review</p>
                    <p className="mt-2 text-sm text-white">{entry.riskLevel}</p>
                    <p className="mt-1 text-[11px] text-gray-500">{entry.reviewReason || 'No extra review reason recorded'}</p>
                  </div>
                </div>
                <select value={entry.status} onChange={(e) => void update('payout', entry.id, e.target.value)} className="mt-3 rounded-xl border border-white/10 bg-[#111111] px-3 py-2 text-sm text-white outline-none">
                  {['requested', 'queued', 'reviewing', 'processing', 'paid', 'failed', 'cancelled'].map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
              </div>
            ))}
            {filteredPayouts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-black/10 p-4 text-sm text-gray-400">
                No payout rows match the current filters.
              </div>
            ) : null}
          </div>
        </div> : null}

        {(queueFilter === 'all' || queueFilter === 'withdrawals') ? <div className="rounded-[28px] border border-white/10 bg-[#111111] p-5">
          <h2 className="text-lg font-semibold text-white">INDI withdrawals</h2>
          <div className="mt-4 space-y-3">
            {filteredWithdrawals.map((entry) => (
              <div key={entry.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-sm font-semibold text-white">{entry.destinationLabel || entry.destinationType}</p>
                <p className="mt-1 text-xs text-gray-500">{entry.actorId} - {entry.amount.toFixed(2)} INDI - net {entry.netAmount.toFixed(2)} - {entry.destinationType}</p>
                <select value={entry.status} onChange={(e) => void update('indi-withdrawal', entry.id, e.target.value)} className="mt-3 rounded-xl border border-white/10 bg-[#111111] px-3 py-2 text-sm text-white outline-none">
                  {['requested', 'queued', 'reviewing', 'processing', 'paid', 'failed', 'cancelled'].map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
              </div>
            ))}
          </div>
        </div> : null}

        {(queueFilter === 'all' || queueFilter === 'royalties') ? <div className="rounded-[28px] border border-white/10 bg-[#111111] p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-white">Royalty ledger</h2>
              <p className="mt-1 text-sm text-gray-400">{filteredRoyalties.length} rows match the royalty filters.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => exportRoyalties('json')}
                className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white transition hover:border-[#d4af37]/40 hover:text-[#f3deb1]"
              >
                Export JSON
              </button>
              <button
                type="button"
                onClick={() => exportRoyalties('csv')}
                className="rounded-xl border border-[#d4af37]/30 px-4 py-2 text-sm text-[#f3deb1] transition hover:bg-[#d4af37]/10"
              >
                Export CSV
              </button>
            </div>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm text-gray-300">
              <span className="text-xs uppercase tracking-[0.16em] text-gray-500">Royalty from date</span>
              <input
                type="date"
                value={royaltyStartDate}
                onChange={(event) => setRoyaltyStartDate(event.target.value)}
                className="rounded-xl border border-white/10 bg-[#0b0b0b] px-3 py-2 text-sm text-white outline-none"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-gray-300">
              <span className="text-xs uppercase tracking-[0.16em] text-gray-500">Royalty to date</span>
              <input
                type="date"
                value={royaltyEndDate}
                onChange={(event) => setRoyaltyEndDate(event.target.value)}
                className="rounded-xl border border-white/10 bg-[#0b0b0b] px-3 py-2 text-sm text-white outline-none"
              />
            </label>
          </div>
          <div className="mt-4 space-y-3">
            {filteredRoyalties.map((entry) => (
              <div key={entry.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-sm font-semibold text-white">{entry.item}</p>
                <p className="mt-1 text-xs text-gray-500">{entry.pillar} - gross {entry.grossAmount.toFixed(2)} - net {entry.creatorNetAmount.toFixed(2)}</p>
                <select value={entry.status} onChange={(e) => void update('royalty', entry.id, e.target.value)} className="mt-3 rounded-xl border border-white/10 bg-[#111111] px-3 py-2 text-sm text-white outline-none">
                  {['paid', 'pending_payout', 'settled'].map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
              </div>
            ))}
            {filteredRoyalties.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-black/10 p-4 text-sm text-gray-400">
                No royalty rows match the current filters.
              </div>
            ) : null}
          </div>
        </div> : null}

        <div className="rounded-[28px] border border-white/10 bg-[#111111] p-5">
          <h2 className="text-lg font-semibold text-white">BNPL partner lane</h2>
          <div className="mt-4 space-y-3">
            {data.bnplApplications.map((entry) => (
              <div key={entry.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-sm font-semibold text-white">{entry.orderId}</p>
                <p className="mt-1 text-xs text-gray-500">{entry.partner} - ${entry.amount.toFixed(2)} - fee ${entry.feeAmount.toFixed(2)}</p>
                <select value={entry.status} onChange={(e) => void update('bnpl', entry.id, e.target.value)} className="mt-3 rounded-xl border border-white/10 bg-[#111111] px-3 py-2 text-sm text-white outline-none">
                  {['submitted', 'approved', 'declined'].map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-[#111111] p-5">
          <h2 className="text-lg font-semibold text-white">Tax reporting</h2>
          <div className="mt-4 space-y-3">
            {data.taxReports.map((entry) => (
              <div key={entry.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-sm font-semibold text-white">{entry.taxYear} report</p>
                <p className="mt-1 text-xs text-gray-500">{entry.actorId} - fee ${entry.feeAmount.toFixed(2)}</p>
                <select value={entry.status} onChange={(e) => void update('tax-report', entry.id, e.target.value)} className="mt-3 rounded-xl border border-white/10 bg-[#111111] px-3 py-2 text-sm text-white outline-none">
                  {['purchased', 'generated'].map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-[28px] border border-white/10 bg-[#111111] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-white">Marketplace settlement reconciliation</h2>
            <p className="mt-1 text-sm text-gray-400">Track orders, receipts, bookings, royalties, and payout readiness across the selling pillars.</p>
          </div>
          <p className="text-xs uppercase tracking-[0.16em] text-gray-500">{filteredSettlements.length} matching cases</p>
        </div>
        <div className="mt-4 grid gap-3">
          {(queueFilter === 'all' || queueFilter === 'settlements') ? filteredSettlements.map((entry) => (
            <div key={`${entry.settlementEntity}-${entry.settlementId}`} className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-white">{entry.title}</p>
                  <p className="mt-1 text-xs text-gray-500">{entry.sourceLabel} {entry.sourceReference} - {entry.amountPaid.toFixed(2)} {entry.currency}</p>
                  <p className="mt-1 text-xs text-gray-500">seller {entry.sellerActorId || 'n/a'} - creator {entry.creatorActorId || 'n/a'}</p>
                </div>
                <select value={entry.orderStatus} onChange={(e) => void update(entry.settlementEntity, entry.settlementId, e.target.value)} className="rounded-xl border border-white/10 bg-[#111111] px-3 py-2 text-sm text-white outline-none">
                  {['captured', 'pending_settlement', 'settled', 'refunded', 'disputed'].map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
              </div>
              <div className="mt-3 grid gap-3 text-xs text-gray-400 md:grid-cols-5">
                <div className="rounded-xl border border-white/10 bg-[#0b0b0b] p-3">
                  <p className="uppercase tracking-[0.16em] text-gray-500">Pillar</p>
                  <p className="mt-2 text-sm text-white">{entry.pillar}</p>
                  <p className="mt-1 text-[11px] text-gray-500">{entry.settlementEntity === 'marketplace-order' ? entry.orderKind : entry.sourceLabel}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-[#0b0b0b] p-3">
                  <p className="uppercase tracking-[0.16em] text-gray-500">Royalty</p>
                  <p className="mt-2 text-sm text-white">{entry.royaltyAmount.toFixed(2)} {entry.currency}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-[#0b0b0b] p-3">
                  <p className="uppercase tracking-[0.16em] text-gray-500">Platform fee</p>
                  <p className="mt-2 text-sm text-white">{entry.platformFeeAmount.toFixed(2)} {entry.currency}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-[#0b0b0b] p-3">
                  <p className="uppercase tracking-[0.16em] text-gray-500">Sale ledger</p>
                  <p className="mt-2 text-sm text-white">{entry.saleLedgerStatuses.join(', ') || 'none'}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-[#0b0b0b] p-3">
                  <p className="uppercase tracking-[0.16em] text-gray-500">Royalty / withdrawals</p>
                  <p className="mt-2 text-sm text-white">{entry.royaltyLedgerStatuses.join(', ') || 'none'}</p>
                  <p className="mt-1 text-[11px] text-gray-500">{entry.withdrawalStatuses.join(', ') || 'no linked withdrawals'}</p>
                  <p className="mt-1 text-[11px] text-gray-500">{entry.linkedLedgerEntryIds.length} linked ledger rows</p>
                </div>
              </div>
            </div>
          )) : []}
          {(queueFilter === 'all' || queueFilter === 'settlements') && filteredSettlements.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 bg-black/10 p-6 text-sm text-gray-400">
              No settlement cases match the current filters.
            </div>
          ) : null}
        </div>
      </div>

      {feedback ? <p className="text-sm text-[#f3deb1]">{feedback}</p> : null}
    </section>
  );
}
