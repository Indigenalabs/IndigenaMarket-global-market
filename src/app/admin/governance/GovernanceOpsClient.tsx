'use client';

import { useEffect, useState } from 'react';
import { fetchGovernanceDashboard, updateComplianceProfileApi, updateDataUseConsentApi, updatePlatformAccountVerificationApi } from '@/app/lib/governanceApi';
import type { GovernanceDashboard, ComplianceProfileRecord, ComplianceStatus, DataUseConsentRecord } from '@/app/lib/complianceGovernance';
import type { PlatformVerificationStatus } from '@/app/lib/platformAccounts';

export default function GovernanceOpsClient() {
  const [data, setData] = useState<GovernanceDashboard>({
    complianceProfiles: [],
    dataUseConsents: [],
    auditEvents: [],
    platformAccounts: [],
    platformAccountVerifications: [],
    elderAuthorities: [],
    revenueSplitRules: [],
    treasuries: [],
    treasuryLedger: [],
    splitDistributions: [],
    championDisbursements: []
  });
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    fetchGovernanceDashboard()
      .then(setData)
      .catch((error) => setFeedback(error instanceof Error ? error.message : 'Unable to load governance controls.'));
  }, []);

  async function updateProfile(current: ComplianceProfileRecord, patch: Partial<ComplianceProfileRecord>) {
    try {
      const record = await updateComplianceProfileApi({
        actorId: current.actorId,
        walletAddress: current.walletAddress,
        kycStatus: (patch.kycStatus || current.kycStatus) as ComplianceStatus,
        amlStatus: (patch.amlStatus || current.amlStatus) as ComplianceStatus,
        payoutEnabled: patch.payoutEnabled ?? current.payoutEnabled,
        bnplEnabled: patch.bnplEnabled ?? current.bnplEnabled,
        taxReportingEnabled: patch.taxReportingEnabled ?? current.taxReportingEnabled,
        notes: patch.notes ?? current.notes
      });
      setData((state) => ({
        ...state,
        complianceProfiles: state.complianceProfiles.map((entry) => (entry.id === current.id ? record : entry))
      }));
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Unable to update compliance profile.');
    }
  }

  async function updateConsent(current: DataUseConsentRecord, status: ComplianceStatus) {
    try {
      const record = await updateDataUseConsentApi({ id: current.id, status, reference: current.reference });
      setData((state) => ({
        ...state,
        dataUseConsents: state.dataUseConsents.map((entry) => (entry.id === current.id ? record : entry))
      }));
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Unable to update consent.');
    }
  }

  async function updatePlatformVerification(accountId: string, field: 'treasuryReviewStatus' | 'representativeReviewStatus' | 'elderEndorsementStatus', status: PlatformVerificationStatus) {
    try {
      const record = await updatePlatformAccountVerificationApi({ accountId, [field]: status });
      setData((state) => ({
        ...state,
        platformAccountVerifications: state.platformAccountVerifications.map((entry) => (
          entry.accountId === accountId ? record.verification : entry
        )),
        platformAccounts: state.platformAccounts.map((entry) => (
          entry.id === accountId ? { ...entry, verificationStatus: record.accountStatus } : entry
        ))
      }));
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Unable to update platform verification.');
    }
  }

  return (
    <section className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[24px] border border-white/10 bg-[#111111] p-5"><p className="text-xs uppercase tracking-[0.16em] text-gray-500">Compliance profiles</p><p className="mt-2 text-2xl font-semibold text-white">{data.complianceProfiles.length}</p></div>
        <div className="rounded-[24px] border border-white/10 bg-[#111111] p-5"><p className="text-xs uppercase tracking-[0.16em] text-gray-500">Pending consents</p><p className="mt-2 text-2xl font-semibold text-white">{data.dataUseConsents.filter((entry) => entry.status === 'pending').length}</p></div>
        <div className="rounded-[24px] border border-white/10 bg-[#111111] p-5"><p className="text-xs uppercase tracking-[0.16em] text-gray-500">Community accounts</p><p className="mt-2 text-2xl font-semibold text-white">{data.platformAccounts.length}</p></div>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-[24px] border border-white/10 bg-[#111111] p-5"><p className="text-xs uppercase tracking-[0.16em] text-gray-500">Treasuries</p><p className="mt-2 text-2xl font-semibold text-white">{data.treasuries.length}</p></div>
        <div className="rounded-[24px] border border-white/10 bg-[#111111] p-5"><p className="text-xs uppercase tracking-[0.16em] text-gray-500">Ledger entries</p><p className="mt-2 text-2xl font-semibold text-white">{data.treasuryLedger.length}</p></div>
        <div className="rounded-[24px] border border-white/10 bg-[#111111] p-5"><p className="text-xs uppercase tracking-[0.16em] text-gray-500">Split distributions</p><p className="mt-2 text-2xl font-semibold text-white">{data.splitDistributions.length}</p></div>
        <div className="rounded-[24px] border border-white/10 bg-[#111111] p-5"><p className="text-xs uppercase tracking-[0.16em] text-gray-500">Champion disbursements</p><p className="mt-2 text-2xl font-semibold text-white">{data.championDisbursements.length}</p></div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr,1.1fr,0.8fr]">
        <div className="rounded-[28px] border border-white/10 bg-[#111111] p-5">
          <h2 className="text-lg font-semibold text-white">Compliance controls</h2>
          <div className="mt-4 space-y-3">
            {data.complianceProfiles.map((entry) => (
              <div key={entry.id} className="rounded-2xl border border-white/10 bg-black/20 p-4 space-y-3">
                <div>
                  <p className="text-sm font-semibold text-white">{entry.actorId}</p>
                  <p className="text-xs text-gray-500">{entry.walletAddress || 'No wallet recorded'}</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <select value={entry.kycStatus} onChange={(e) => void updateProfile(entry, { kycStatus: e.target.value as ComplianceStatus })} className="rounded-xl border border-white/10 bg-[#111111] px-3 py-2 text-sm text-white outline-none">
                    {['pending', 'approved', 'rejected'].map((status) => <option key={status} value={status}>{'KYC ' + status}</option>)}
                  </select>
                  <select value={entry.amlStatus} onChange={(e) => void updateProfile(entry, { amlStatus: e.target.value as ComplianceStatus })} className="rounded-xl border border-white/10 bg-[#111111] px-3 py-2 text-sm text-white outline-none">
                    {['pending', 'approved', 'rejected'].map((status) => <option key={status} value={status}>{'AML ' + status}</option>)}
                  </select>
                </div>
                <div className="grid gap-2 text-xs text-gray-300">
                  <label className="flex items-center gap-2"><input type="checkbox" checked={entry.payoutEnabled} onChange={(e) => void updateProfile(entry, { payoutEnabled: e.target.checked })} />Instant payout enabled</label>
                  <label className="flex items-center gap-2"><input type="checkbox" checked={entry.bnplEnabled} onChange={(e) => void updateProfile(entry, { bnplEnabled: e.target.checked })} />BNPL enabled</label>
                  <label className="flex items-center gap-2"><input type="checkbox" checked={entry.taxReportingEnabled} onChange={(e) => void updateProfile(entry, { taxReportingEnabled: e.target.checked })} />Tax reporting enabled</label>
                </div>
              </div>
            ))}
            {data.complianceProfiles.length === 0 ? <p className="text-sm text-gray-500">Compliance profiles will appear after wallet-authenticated financial-service usage or admin seeding.</p> : null}
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-[#111111] p-5">
          <h2 className="text-lg font-semibold text-white">Data-use consents</h2>
          <div className="mt-4 space-y-3">
            {data.dataUseConsents.map((entry) => (
              <div key={entry.id} className="rounded-2xl border border-white/10 bg-black/20 p-4 space-y-3">
                <div>
                  <p className="text-sm font-semibold text-white">{entry.buyerName}</p>
                  <p className="text-xs text-gray-500">{entry.buyerEmail} | {entry.usagePurpose}</p>
                  <p className="mt-1 text-xs text-gray-500">Scopes: {entry.scopes.join(', ') || 'n/a'}</p>
                </div>
                <select value={entry.status} onChange={(e) => void updateConsent(entry, e.target.value as ComplianceStatus)} className="rounded-xl border border-white/10 bg-[#111111] px-3 py-2 text-sm text-white outline-none">
                  {['pending', 'approved', 'rejected'].map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
              </div>
            ))}
            {data.dataUseConsents.length === 0 ? <p className="text-sm text-gray-500">No data-use consent records yet.</p> : null}
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-[#111111] p-5">
          <h2 className="text-lg font-semibold text-white">Audit trail</h2>
          <div className="mt-4 space-y-3 text-sm text-gray-300">
            {data.auditEvents.map((entry) => (
              <div key={entry.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-white">{entry.action}</p>
                <p className="mt-1 text-xs text-gray-500">{entry.domain} | {entry.actorId} | {new Date(entry.createdAt).toLocaleString()}</p>
              </div>
            ))}
            {data.auditEvents.length === 0 ? <p className="text-sm text-gray-500">No governance audit events yet.</p> : null}
          </div>
        </div>
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.15fr,0.85fr]">
        <div className="rounded-[28px] border border-white/10 bg-[#111111] p-5">
          <h2 className="text-lg font-semibold text-white">Community account verification</h2>
          <div className="mt-4 space-y-3">
            {data.platformAccountVerifications.map((entry) => {
              const account = data.platformAccounts.find((item) => item.id === entry.accountId);
              return (
                <div key={entry.id} className="space-y-3 rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div>
                    <p className="text-sm font-semibold text-white">{account?.displayName || entry.accountId}</p>
                    <p className="text-xs text-gray-500">{account?.accountType || 'account'} | {account?.verificationStatus || 'pending'}</p>
                    <p className="mt-2 text-xs text-gray-400">{entry.authorityProof || 'No authority proof summary yet.'}</p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <select value={entry.representativeReviewStatus} onChange={(e) => void updatePlatformVerification(entry.accountId, 'representativeReviewStatus', e.target.value as PlatformVerificationStatus)} className="rounded-xl border border-white/10 bg-[#111111] px-3 py-2 text-sm text-white outline-none">
                      {['draft', 'pending', 'approved', 'rejected'].map((status) => <option key={status} value={status}>{`Representatives: ${status}`}</option>)}
                    </select>
                    <select value={entry.treasuryReviewStatus} onChange={(e) => void updatePlatformVerification(entry.accountId, 'treasuryReviewStatus', e.target.value as PlatformVerificationStatus)} className="rounded-xl border border-white/10 bg-[#111111] px-3 py-2 text-sm text-white outline-none">
                      {['draft', 'pending', 'approved', 'rejected'].map((status) => <option key={status} value={status}>{`Treasury: ${status}`}</option>)}
                    </select>
                    <select value={entry.elderEndorsementStatus} onChange={(e) => void updatePlatformVerification(entry.accountId, 'elderEndorsementStatus', e.target.value as PlatformVerificationStatus)} className="rounded-xl border border-white/10 bg-[#111111] px-3 py-2 text-sm text-white outline-none">
                      {['draft', 'pending', 'approved', 'rejected'].map((status) => <option key={status} value={status}>{`Elder: ${status}`}</option>)}
                    </select>
                  </div>
                </div>
              );
            })}
            {data.platformAccountVerifications.length === 0 ? <p className="text-sm text-gray-500">No community account verifications yet.</p> : null}
          </div>
        </div>
        <div className="space-y-6">
          <div className="rounded-[28px] border border-white/10 bg-[#111111] p-5">
            <h2 className="text-lg font-semibold text-white">Elder authority register</h2>
            <div className="mt-4 space-y-3">
              {data.elderAuthorities.map((entry) => (
                <div key={entry.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-sm font-semibold text-white">{entry.displayName}</p>
                  <p className="mt-1 text-xs text-gray-500">{entry.nation} | {entry.status}</p>
                  <p className="mt-2 text-xs text-gray-400">{entry.councilSeat || 'No council seat assigned yet.'}</p>
                  <p className="mt-2 text-xs text-[#d4af37]">{entry.authorities.join(', ') || 'No active authorities'}</p>
                </div>
              ))}
              {data.elderAuthorities.length === 0 ? <p className="text-sm text-gray-500">No elder authority records yet.</p> : null}
            </div>
          </div>
          <div className="rounded-[28px] border border-white/10 bg-[#111111] p-5">
            <h2 className="text-lg font-semibold text-white">Revenue split rules</h2>
            <div className="mt-4 space-y-3">
              {data.revenueSplitRules.map((entry) => (
                <div key={entry.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-sm font-semibold text-white">{entry.offeringLabel}</p>
                  <p className="mt-1 text-xs text-gray-500">{entry.pillar} | {entry.ruleType} | {entry.status}</p>
                  <p className="mt-2 text-xs text-[#d4af37]">{entry.beneficiaries.map((beneficiary) => `${beneficiary.label} ${beneficiary.percentage}%`).join(' | ')}</p>
                </div>
              ))}
              {data.revenueSplitRules.length === 0 ? <p className="text-sm text-gray-500">No split rules configured yet.</p> : null}
            </div>
          </div>
        </div>
      </div>
      <div className="grid gap-6 xl:grid-cols-[1fr,1fr]">
        <div className="rounded-[28px] border border-white/10 bg-[#111111] p-5">
          <h2 className="text-lg font-semibold text-white">Community treasuries</h2>
          <div className="mt-4 space-y-3">
            {data.treasuries.map((entry) => (
              <div key={entry.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-sm font-semibold text-white">{entry.label}</p>
                <p className="mt-1 text-xs text-gray-500">{entry.accountSlug}</p>
                <p className="mt-2 text-xs text-[#d4af37]">Restricted ${entry.restrictedBalance.toLocaleString()} | Unrestricted ${entry.unrestrictedBalance.toLocaleString()} | Pending ${entry.pendingDisbursementAmount.toLocaleString()}</p>
              </div>
            ))}
            {data.treasuries.length === 0 ? <p className="text-sm text-gray-500">No community treasuries yet.</p> : null}
          </div>
        </div>
        <div className="rounded-[28px] border border-white/10 bg-[#111111] p-5">
          <h2 className="text-lg font-semibold text-white">Distribution activity</h2>
          <div className="mt-4 space-y-3">
            {data.splitDistributions.map((entry) => (
              <div key={entry.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-sm font-semibold text-white">{entry.sourceId}</p>
                <p className="mt-1 text-xs text-gray-500">{entry.sourceType} | Gross ${entry.grossAmount.toLocaleString()} {entry.currency}</p>
                <p className="mt-2 text-xs text-[#d4af37]">{entry.distributions.map((row) => `${row.label} $${row.amount.toLocaleString()}`).join(' | ')}</p>
              </div>
            ))}
            {data.championDisbursements.map((entry) => (
              <div key={entry.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-sm font-semibold text-white">{entry.note}</p>
                <p className="mt-1 text-xs text-gray-500">{entry.status} | ${entry.amount.toLocaleString()} | {new Date(entry.scheduledFor).toLocaleDateString()}</p>
              </div>
            ))}
            {data.splitDistributions.length === 0 && data.championDisbursements.length === 0 ? <p className="text-sm text-gray-500">No distribution activity yet.</p> : null}
          </div>
        </div>
      </div>
      {feedback ? <p className="text-sm text-[#f3deb1]">{feedback}</p> : null}
    </section>
  );
}
