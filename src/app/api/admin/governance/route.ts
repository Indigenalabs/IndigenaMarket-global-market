import { NextRequest, NextResponse } from 'next/server';
import { listGovernanceDashboard, recordGovernanceAuditEvent, updateDataUseConsent, upsertComplianceProfile } from '@/app/lib/complianceGovernance';
import { listPlatformAccountDashboard, updatePlatformAccountVerification, upsertElderAuthority, upsertRevenueSplitRule } from '@/app/lib/platformAccounts';
import { listTreasuryDashboard } from '@/app/lib/platformTreasury';
import { requirePlatformAdmin } from '@/app/lib/platformAdminAuth';

function text(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

export async function GET(req: NextRequest) {
  const auth = await requirePlatformAdmin(req, ['admin', 'platform_ops', 'governance_admin', 'compliance_admin', 'data_governance']);
  if (auth.error) return auth.error;
  const [governance, platform, treasury] = await Promise.all([listGovernanceDashboard(), listPlatformAccountDashboard(), listTreasuryDashboard()]);
  return NextResponse.json({
    data: {
      ...governance,
      platformAccounts: platform.accounts,
      platformAccountVerifications: platform.verifications,
      elderAuthorities: platform.elderAuthorities,
      revenueSplitRules: platform.revenueSplitRules,
      treasuries: treasury.treasuries,
      treasuryLedger: treasury.ledger,
      splitDistributions: treasury.splitDistributions,
      championDisbursements: treasury.championDisbursements
    }
  });
}

export async function PATCH(req: NextRequest) {
  const auth = await requirePlatformAdmin(req, ['admin', 'platform_ops', 'governance_admin', 'compliance_admin', 'data_governance']);
  if (auth.error) return auth.error;
  const reviewer = auth.identity?.actorId || 'platform-admin';
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const entity = text(body.entity);
  if (entity === 'compliance-profile') {
    const record = await upsertComplianceProfile({
      actorId: text(body.actorId),
      walletAddress: text(body.walletAddress),
      kycStatus: text(body.kycStatus) as any,
      amlStatus: text(body.amlStatus) as any,
      payoutEnabled: body.payoutEnabled === undefined ? undefined : Boolean(body.payoutEnabled),
      bnplEnabled: body.bnplEnabled === undefined ? undefined : Boolean(body.bnplEnabled),
      taxReportingEnabled: body.taxReportingEnabled === undefined ? undefined : Boolean(body.taxReportingEnabled),
      reviewedBy: reviewer,
      notes: text(body.notes)
    });
    await recordGovernanceAuditEvent({ actorId: reviewer, domain: 'governance', action: 'compliance-profile-updated', targetId: record.id, metadata: { targetActorId: record.actorId } });
    return NextResponse.json({ record });
  }
  if (entity === 'data-use-consent') {
    const record = await updateDataUseConsent({
      id: text(body.id),
      status: text(body.status) as any,
      reviewedBy: reviewer,
      reference: text(body.reference)
    });
    await recordGovernanceAuditEvent({ actorId: reviewer, domain: 'governance', action: 'data-use-consent-reviewed', targetId: record.id, metadata: { status: record.status, reference: record.reference } });
    return NextResponse.json({ record });
  }
  if (entity === 'platform-account-verification') {
    const record = await updatePlatformAccountVerification({
      accountId: text(body.accountId),
      treasuryReviewStatus: text(body.treasuryReviewStatus) as any,
      representativeReviewStatus: text(body.representativeReviewStatus) as any,
      elderEndorsementStatus: text(body.elderEndorsementStatus) as any,
      notes: text(body.notes),
      reviewedBy: reviewer
    });
    await recordGovernanceAuditEvent({ actorId: reviewer, domain: 'governance', action: 'platform-account-verification-reviewed', targetId: text(body.accountId), metadata: { status: record.accountStatus } });
    return NextResponse.json({ record });
  }
  if (entity === 'elder-authority') {
    const record = await upsertElderAuthority({
      actorId: text(body.actorId),
      displayName: text(body.displayName),
      nation: text(body.nation),
      status: text(body.status) as any,
      authorities: Array.isArray(body.authorities) ? body.authorities.map((entry) => text(entry)).filter(Boolean) : [],
      councilSeat: text(body.councilSeat),
      notes: text(body.notes),
      approvedBy: reviewer
    });
    await recordGovernanceAuditEvent({ actorId: reviewer, domain: 'governance', action: 'elder-authority-upserted', targetId: record.id, metadata: { actorId: record.actorId, status: record.status } });
    return NextResponse.json({ record });
  }
  if (entity === 'revenue-split-rule') {
    const record = await upsertRevenueSplitRule({
      id: text(body.id) || undefined,
      ownerAccountId: text(body.ownerAccountId),
      offeringId: text(body.offeringId),
      offeringLabel: text(body.offeringLabel),
      pillar: text(body.pillar),
      ruleType: text(body.ruleType) as any,
      status: text(body.status) as any,
      notes: text(body.notes),
      beneficiaries: Array.isArray(body.beneficiaries)
        ? body.beneficiaries.map((entry) => {
            const row = (entry || {}) as Record<string, unknown>;
            return {
              beneficiaryType: text(row.beneficiaryType) as 'actor' | 'account',
              beneficiaryId: text(row.beneficiaryId),
              label: text(row.label),
              percentage: Number(row.percentage || 0),
              payoutTarget: text(row.payoutTarget)
            };
          })
        : [],
      actorId: reviewer
    });
    await recordGovernanceAuditEvent({ actorId: reviewer, domain: 'governance', action: 'revenue-split-rule-upserted', targetId: record.id, metadata: { ownerAccountId: record.ownerAccountId, ruleType: record.ruleType } });
    return NextResponse.json({ record });
  }
  return NextResponse.json({ message: 'Unsupported governance entity' }, { status: 400 });
}
