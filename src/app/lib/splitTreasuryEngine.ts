import { listPlatformAccountDashboard } from '@/app/lib/platformAccounts';
import { recordRevenueSplitDistribution, recordTreasuryContribution } from '@/app/lib/platformTreasury';

export interface SplitExecutionPreview {
  splitRuleId: string;
  ownerAccountId: string;
  offeringId: string;
  offeringLabel: string;
  pillar: string;
  ruleType: string;
  sourceType: 'sale' | 'royalty';
  sourceId: string;
  sourceReference: string;
  currency: string;
  grossAmount: number;
  allocations: Array<{
    beneficiaryType: 'actor' | 'account';
    beneficiaryId: string;
    label: string;
    percentage: number;
    amount: number;
    payoutTarget: string;
    treasuryImpact: 'none' | 'restricted' | 'unrestricted';
  }>;
  totalAllocated: number;
  unallocatedAmount: number;
}

export interface SplitExecutionResult {
  preview: SplitExecutionPreview;
  distributionId: string;
  treasuryContributions: Array<{
    accountId: string;
    amount: number;
    restricted: boolean;
  }>;
  actorPayouts: Array<{
    actorId: string;
    amount: number;
    payoutTarget: string;
  }>;
}

function money(value: number) {
  return Number((Number(value || 0)).toFixed(2));
}

function normalizeSourceReference(value: string, fallback: string) {
  const safe = String(value || '').trim();
  return safe || fallback;
}

function treasuryImpactForPayoutTarget(
  beneficiaryType: 'actor' | 'account',
  payoutTarget: string
): 'none' | 'restricted' | 'unrestricted' {
  if (beneficiaryType !== 'account') return 'none';
  return payoutTarget.includes('restricted') ? 'restricted' : 'unrestricted';
}

export async function previewRevenueSplitExecution(input: {
  splitRuleId: string;
  sourceType: 'sale' | 'royalty';
  sourceId: string;
  grossAmount: number;
  currency?: string;
  sourceReference?: string;
}) {
  const dashboard = await listPlatformAccountDashboard();
  const rule = dashboard.revenueSplitRules.find((entry) => entry.id === input.splitRuleId);
  if (!rule) throw new Error('Revenue split rule not found.');
  const grossAmount = money(input.grossAmount);
  if (grossAmount <= 0) throw new Error('Gross amount must be greater than zero.');

  const allocations = rule.beneficiaries.map((entry) => {
    const amount = money((grossAmount * entry.percentage) / 100);
    return {
      beneficiaryType: entry.beneficiaryType,
      beneficiaryId: entry.beneficiaryId,
      label: entry.label,
      percentage: entry.percentage,
      amount,
      payoutTarget: entry.payoutTarget,
      treasuryImpact: treasuryImpactForPayoutTarget(entry.beneficiaryType, entry.payoutTarget)
    };
  });

  const totalAllocated = money(allocations.reduce((sum, entry) => sum + entry.amount, 0));
  return {
    splitRuleId: rule.id,
    ownerAccountId: rule.ownerAccountId,
    offeringId: rule.offeringId,
    offeringLabel: rule.offeringLabel,
    pillar: rule.pillar,
    ruleType: rule.ruleType,
    sourceType: input.sourceType,
    sourceId: input.sourceId,
    sourceReference: normalizeSourceReference(input.sourceReference || '', `${input.sourceType}:${input.sourceId}`),
    currency: (input.currency || 'INDI').trim().toUpperCase(),
    grossAmount,
    allocations,
    totalAllocated,
    unallocatedAmount: money(grossAmount - totalAllocated)
  } satisfies SplitExecutionPreview;
}

export async function executeRevenueSplitExecution(input: {
  splitRuleId: string;
  sourceType: 'sale' | 'royalty';
  sourceId: string;
  grossAmount: number;
  currency?: string;
  sourceReference?: string;
}) {
  const preview = await previewRevenueSplitExecution(input);
  const distribution = await recordRevenueSplitDistribution({
    splitRuleId: preview.splitRuleId,
    sourceType: preview.sourceType,
    sourceId: preview.sourceId,
    grossAmount: preview.grossAmount,
    currency: preview.currency,
    sourceReference: preview.sourceReference
  });

  const treasuryContributions: SplitExecutionResult['treasuryContributions'] = [];
  const actorPayouts: SplitExecutionResult['actorPayouts'] = [];

  for (const allocation of preview.allocations) {
    if (allocation.beneficiaryType === 'account') {
      const restricted = allocation.treasuryImpact === 'restricted';
      await recordTreasuryContribution({
        accountId: allocation.beneficiaryId,
        amount: allocation.amount,
        currency: preview.currency,
        counterparty: `${preview.sourceType}:${preview.sourceId}`,
        note: `${preview.offeringLabel} ${preview.sourceType} allocation`,
        restricted,
        sourceReference: preview.sourceReference
      });
      treasuryContributions.push({
        accountId: allocation.beneficiaryId,
        amount: allocation.amount,
        restricted
      });
    } else {
      actorPayouts.push({
        actorId: allocation.beneficiaryId,
        amount: allocation.amount,
        payoutTarget: allocation.payoutTarget
      });
    }
  }

  return {
    preview,
    distributionId: distribution.id,
    treasuryContributions,
    actorPayouts
  } satisfies SplitExecutionResult;
}
