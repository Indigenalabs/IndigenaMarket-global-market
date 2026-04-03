import { promises as fs } from 'node:fs';
import path from 'node:path';
import { createSupabaseServerClient, isSupabaseServerConfigured } from '@/app/lib/supabase/server';
import { assertRuntimePersistenceAllowed } from '@/app/lib/runtimePersistence';
import { getPlatformAccountBySlug, listPlatformAccountDashboard } from '@/app/lib/platformAccounts';

export interface CommunityTreasuryRecord {
  id: string;
  accountId: string;
  accountSlug: string;
  label: string;
  restrictedBalance: number;
  unrestrictedBalance: number;
  pendingDisbursementAmount: number;
  nextDisbursementDate: string;
  reportingNote: string;
}

export interface TreasuryLedgerEntryRecord {
  id: string;
  accountId: string;
  type: 'sale-split' | 'royalty' | 'sponsorship' | 'disbursement';
  amount: number;
  currency: string;
  counterparty: string;
  note: string;
  status: 'scheduled' | 'posted';
  createdAt: string;
  sourceReference?: string;
}

export interface SplitDistributionRecord {
  id: string;
  splitRuleId: string;
  sourceType: 'sale' | 'royalty';
  sourceId: string;
  grossAmount: number;
  currency: string;
  distributions: Array<{
    beneficiaryType: 'actor' | 'account';
    beneficiaryId: string;
    label: string;
    amount: number;
    payoutTarget: string;
  }>;
  createdAt: string;
  sourceReference?: string;
}

export interface ChampionSponsorshipDisbursementRecord {
  id: string;
  sponsorshipId: string;
  championId: string;
  targetAccountId: string;
  amount: number;
  status: 'scheduled' | 'paid';
  scheduledFor: string;
  paidOutAt: string;
  note: string;
  sourceReference?: string;
}

export interface TreasuryDashboard {
  treasuries: CommunityTreasuryRecord[];
  ledger: TreasuryLedgerEntryRecord[];
  splitDistributions: SplitDistributionRecord[];
  championDisbursements: ChampionSponsorshipDisbursementRecord[];
}

const RUNTIME_DIR = path.join(process.cwd(), '.runtime');
const FILE = path.join(RUNTIME_DIR, 'platform-treasury.json');

function nowIso() {
  return new Date().toISOString();
}

function id(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function inDays(days: number) {
  return new Date(Date.now() + days * 86400000).toISOString();
}

function seedTreasury(): TreasuryDashboard {
  const now = nowIso();
  return {
    treasuries: [
      {
        id: 'treasury-1',
        accountId: 'acct-community-riverstone',
        accountSlug: 'riverstone-arts-council',
        label: 'Riverstone community treasury',
        restrictedBalance: 4800,
        unrestrictedBalance: 12350,
        pendingDisbursementAmount: 2400,
        nextDisbursementDate: inDays(14),
        reportingNote: 'Supports weaving hall operations and youth market stipends.'
      },
      {
        id: 'treasury-2',
        accountId: 'acct-tribe-ngarra',
        accountSlug: 'ngarra-learning-circle',
        label: 'Ngarra education fund',
        restrictedBalance: 16200,
        unrestrictedBalance: 3100,
        pendingDisbursementAmount: 1900,
        nextDisbursementDate: inDays(21),
        reportingNote: 'Restricted language education and archive facilitation fund.'
      },
      {
        id: 'treasury-3',
        accountId: 'acct-champion-talia',
        accountSlug: 'talia-riverstone-champion',
        label: 'Champion sponsorship operating fund',
        restrictedBalance: 0,
        unrestrictedBalance: 4200,
        pendingDisbursementAmount: 1200,
        nextDisbursementDate: inDays(30),
        reportingNote: 'Supports travel, onboarding calls, and community technical support.'
      }
    ],
    ledger: [
      { id: 'ledger-1', accountId: 'acct-community-riverstone', type: 'sale-split', amount: 840, currency: 'USD', counterparty: 'Riverstone Heritage Print sale', note: 'Community share from digital-arts listing', status: 'posted', createdAt: now },
      { id: 'ledger-2', accountId: 'acct-tribe-ngarra', type: 'royalty', amount: 255, currency: 'USD', counterparty: 'Ngarra Language Foundations', note: 'Education royalty distribution', status: 'posted', createdAt: now },
      { id: 'ledger-3', accountId: 'acct-champion-talia', type: 'sponsorship', amount: 1200, currency: 'USD', counterparty: 'North River Co-op', note: 'Monthly champion sponsorship', status: 'posted', createdAt: now }
    ],
    splitDistributions: [
      {
        id: 'dist-1',
        splitRuleId: 'split-1',
        sourceType: 'sale',
        sourceId: 'sale-art-001-1',
        grossAmount: 2800,
        currency: 'USD',
        distributions: [
          { beneficiaryType: 'actor', beneficiaryId: 'actor-aiyana', label: 'Aiyana Redbird', amount: 1960, payoutTarget: 'creator-wallet' },
          { beneficiaryType: 'account', beneficiaryId: 'acct-community-riverstone', label: 'Riverstone community treasury', amount: 840, payoutTarget: 'community-treasury' }
        ],
        createdAt: now
      },
      {
        id: 'dist-2',
        splitRuleId: 'split-2',
        sourceType: 'royalty',
        sourceId: 'royalty-course-301-1',
        grossAmount: 300,
        currency: 'USD',
        distributions: [
          { beneficiaryType: 'account', beneficiaryId: 'acct-tribe-ngarra', label: 'Ngarra education fund', amount: 255, payoutTarget: 'restricted-treasury' },
          { beneficiaryType: 'actor', beneficiaryId: 'actor-elder-lila', label: 'Elder Lila cultural stewardship honorarium', amount: 45, payoutTarget: 'elder-wallet' }
        ],
        createdAt: now
      }
    ],
    championDisbursements: [
      {
        id: 'champdisb-1',
        sponsorshipId: 'champspon-1',
        championId: 'champ-1',
        targetAccountId: 'acct-champion-talia',
        amount: 1200,
        status: 'paid',
        scheduledFor: now,
        paidOutAt: now,
        note: 'Monthly operating support payout.'
      }
    ]
  };
}

async function ensureDir() {
  assertRuntimePersistenceAllowed('platform treasury');
  await fs.mkdir(RUNTIME_DIR, { recursive: true });
}

async function readRuntime(): Promise<TreasuryDashboard> {
  await ensureDir();
  const raw = await fs.readFile(FILE, 'utf8').catch(() => '');
  if (!raw) {
    const seeded = seedTreasury();
    await writeRuntime(seeded);
    return seeded;
  }
  try {
    const parsed = JSON.parse(raw) as Partial<TreasuryDashboard>;
    return {
      treasuries: Array.isArray(parsed.treasuries) ? parsed.treasuries as CommunityTreasuryRecord[] : [],
      ledger: Array.isArray(parsed.ledger) ? parsed.ledger as TreasuryLedgerEntryRecord[] : [],
      splitDistributions: Array.isArray(parsed.splitDistributions) ? parsed.splitDistributions as SplitDistributionRecord[] : [],
      championDisbursements: Array.isArray(parsed.championDisbursements) ? parsed.championDisbursements as ChampionSponsorshipDisbursementRecord[] : []
    };
  } catch {
    const seeded = seedTreasury();
    await writeRuntime(seeded);
    return seeded;
  }
}

async function writeRuntime(data: TreasuryDashboard) {
  await ensureDir();
  await fs.writeFile(FILE, JSON.stringify(data, null, 2), 'utf8');
}

export async function listTreasuryDashboard(): Promise<TreasuryDashboard> {
  if (!isSupabaseServerConfigured()) return readRuntime();
  const supabase = createSupabaseServerClient();
  const [treasuries, ledger, splitDistributions, championDisbursements] = await Promise.all([
    supabase.from('community_treasuries').select('*').order('label'),
    supabase.from('treasury_ledger_entries').select('*').order('created_at', { ascending: false }),
    supabase.from('split_distributions').select('*').order('created_at', { ascending: false }),
    supabase.from('champion_sponsorship_disbursements').select('*').order('scheduled_for', { ascending: false })
  ]);
  const dashboard = {
    treasuries: ((treasuries.data || []) as any[]).map((row) => ({ id: String(row.id || ''), accountId: String(row.account_id || ''), accountSlug: String(row.account_slug || ''), label: String(row.label || ''), restrictedBalance: Number(row.restricted_balance || 0), unrestrictedBalance: Number(row.unrestricted_balance || 0), pendingDisbursementAmount: Number(row.pending_disbursement_amount || 0), nextDisbursementDate: String(row.next_disbursement_date || ''), reportingNote: String(row.reporting_note || '') })),
    ledger: ((ledger.data || []) as any[]).map((row) => ({ id: String(row.id || ''), accountId: String(row.account_id || ''), type: String(row.type || 'sale-split') as TreasuryLedgerEntryRecord['type'], amount: Number(row.amount || 0), currency: String(row.currency || 'USD'), counterparty: String(row.counterparty || ''), note: String(row.note || ''), status: String(row.status || 'posted') as TreasuryLedgerEntryRecord['status'], createdAt: String(row.created_at || '') })),
    splitDistributions: ((splitDistributions.data || []) as any[]).map((row) => ({ id: String(row.id || ''), splitRuleId: String(row.split_rule_id || ''), sourceType: String(row.source_type || 'sale') as SplitDistributionRecord['sourceType'], sourceId: String(row.source_id || ''), grossAmount: Number(row.gross_amount || 0), currency: String(row.currency || 'USD'), distributions: Array.isArray(row.distributions) ? row.distributions : [], createdAt: String(row.created_at || '') })),
    championDisbursements: ((championDisbursements.data || []) as any[]).map((row) => ({ id: String(row.id || ''), sponsorshipId: String(row.sponsorship_id || ''), championId: String(row.champion_id || ''), targetAccountId: String(row.target_account_id || ''), amount: Number(row.amount || 0), status: String(row.status || 'scheduled') as ChampionSponsorshipDisbursementRecord['status'], scheduledFor: String(row.scheduled_for || ''), paidOutAt: String(row.paid_out_at || ''), note: String(row.note || '') }))
  };
  if (!dashboard.treasuries.length && !dashboard.splitDistributions.length && !dashboard.ledger.length) {
    return readRuntime();
  }
  return dashboard;
}

export async function getTreasuryByCommunitySlug(slug: string) {
  const dashboard = await listTreasuryDashboard();
  const treasury = dashboard.treasuries.find((entry) => entry.accountSlug === slug) || null;
  if (!treasury) return null;
  return {
    treasury,
    ledger: dashboard.ledger.filter((entry) => entry.accountId === treasury.accountId),
    splitDistributions: dashboard.splitDistributions.filter((entry) => entry.distributions.some((row) => row.beneficiaryId === treasury.accountId)),
    championDisbursements: dashboard.championDisbursements.filter((entry) => entry.targetAccountId === treasury.accountId)
  };
}

export async function recordRevenueSplitDistribution(input: {
  splitRuleId: string;
  sourceType: 'sale' | 'royalty';
  sourceId: string;
  grossAmount: number;
  currency?: string;
  sourceReference?: string;
}) {
  const platform = await listPlatformAccountDashboard();
  const rule = platform.revenueSplitRules.find((entry) => entry.id === input.splitRuleId);
  if (!rule) throw new Error('Revenue split rule not found.');
  const currentDashboard = await listTreasuryDashboard();
  const existing = currentDashboard.splitDistributions.find(
    (entry) =>
      entry.splitRuleId === input.splitRuleId &&
      entry.sourceType === input.sourceType &&
      entry.sourceId === input.sourceId
  );
  if (existing) return existing;
  const distribution: SplitDistributionRecord = {
    id: id('dist'),
    splitRuleId: rule.id,
    sourceType: input.sourceType,
    sourceId: input.sourceId,
    grossAmount: input.grossAmount,
    currency: input.currency || 'USD',
    distributions: rule.beneficiaries.map((entry) => ({
      beneficiaryType: entry.beneficiaryType,
      beneficiaryId: entry.beneficiaryId,
      label: entry.label,
      amount: Number(((input.grossAmount * entry.percentage) / 100).toFixed(2)),
      payoutTarget: entry.payoutTarget
    })),
    createdAt: nowIso(),
    sourceReference: input.sourceReference?.trim() || undefined
  };

  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    await supabase.from('split_distributions').insert({
      id: distribution.id,
      split_rule_id: distribution.splitRuleId,
      source_type: distribution.sourceType,
      source_id: distribution.sourceId,
      gross_amount: distribution.grossAmount,
      currency: distribution.currency,
      distributions: distribution.distributions,
      created_at: distribution.createdAt
    });
    return distribution;
  }
  const runtime = await readRuntime();
  runtime.splitDistributions.unshift(distribution);
  for (const row of distribution.distributions) {
    if (row.beneficiaryType === 'account') {
      runtime.ledger.unshift({
        id: id('ledger'),
        accountId: row.beneficiaryId,
        type: distribution.sourceType === 'royalty' ? 'royalty' : 'sale-split',
        amount: row.amount,
        currency: distribution.currency,
        counterparty: distribution.sourceId,
        note: `${rule.offeringLabel} ${distribution.sourceType} distribution`,
        status: 'posted',
        createdAt: distribution.createdAt
      });
      runtime.treasuries = runtime.treasuries.map((entry) => entry.accountId === row.beneficiaryId ? { ...entry, unrestrictedBalance: entry.unrestrictedBalance + row.amount } : entry);
    }
  }
  await writeRuntime(runtime);
  return distribution;
}

export async function recordChampionSponsorshipDisbursement(input: {
  sponsorshipId: string;
  championId: string;
  targetAccountId: string;
  amount: number;
  note: string;
  scheduleDays?: number;
  sourceReference?: string;
}) {
  const currentDashboard = await listTreasuryDashboard();
  const existing = currentDashboard.championDisbursements.find((entry) => entry.sponsorshipId === input.sponsorshipId);
  if (existing) return existing;
  const scheduledFor = inDays(input.scheduleDays ?? 14);
  const record: ChampionSponsorshipDisbursementRecord = {
    id: id('champdisb'),
    sponsorshipId: input.sponsorshipId,
    championId: input.championId,
    targetAccountId: input.targetAccountId,
    amount: input.amount,
    status: 'scheduled',
    scheduledFor,
    paidOutAt: '',
    note: input.note,
    sourceReference: input.sourceReference?.trim() || undefined
  };
  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    await supabase.from('champion_sponsorship_disbursements').insert({
      id: record.id,
      sponsorship_id: record.sponsorshipId,
      champion_id: record.championId,
      target_account_id: record.targetAccountId,
      amount: record.amount,
      status: record.status,
      scheduled_for: record.scheduledFor,
      paid_out_at: null,
      note: record.note
    });
    return record;
  }
  const runtime = await readRuntime();
  runtime.championDisbursements.unshift(record);
  runtime.ledger.unshift({
    id: id('ledger'),
    accountId: input.targetAccountId,
    type: 'sponsorship',
    amount: input.amount,
    currency: 'USD',
    counterparty: input.sponsorshipId,
    note: input.note,
    status: 'scheduled',
    createdAt: nowIso(),
    sourceReference: input.sourceReference?.trim() || undefined
  });
  runtime.treasuries = runtime.treasuries.map((entry) => entry.accountId === input.targetAccountId ? { ...entry, pendingDisbursementAmount: entry.pendingDisbursementAmount + input.amount } : entry);
  await writeRuntime(runtime);
  return record;
}

export async function recordTreasuryContribution(input: {
  accountId: string;
  amount: number;
  currency?: string;
  counterparty: string;
  note: string;
  restricted?: boolean;
  sourceReference?: string;
}) {
  const currentDashboard = await listTreasuryDashboard();
  const existing = input.sourceReference
    ? currentDashboard.ledger.find(
        (entry) => entry.accountId === input.accountId && entry.sourceReference === input.sourceReference
      )
    : null;
  if (existing) return existing;
  const entry: TreasuryLedgerEntryRecord = {
    id: id('ledger'),
    accountId: input.accountId,
    type: 'sponsorship',
    amount: Number(input.amount || 0),
    currency: input.currency || 'USD',
    counterparty: input.counterparty,
    note: input.note,
    status: 'posted',
    createdAt: nowIso(),
    sourceReference: input.sourceReference?.trim() || undefined
  };

  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    await supabase.from('treasury_ledger_entries').insert({
      id: entry.id,
      account_id: entry.accountId,
      type: entry.type,
      amount: entry.amount,
      currency: entry.currency,
      counterparty: entry.counterparty,
      note: entry.note,
      status: entry.status,
      created_at: entry.createdAt
    });
    return entry;
  }

  const runtime = await readRuntime();
  runtime.ledger.unshift(entry);
  runtime.treasuries = runtime.treasuries.map((treasury) =>
    treasury.accountId === input.accountId
      ? {
          ...treasury,
          restrictedBalance: input.restricted ? treasury.restrictedBalance + entry.amount : treasury.restrictedBalance,
          unrestrictedBalance: input.restricted ? treasury.unrestrictedBalance : treasury.unrestrictedBalance + entry.amount
        }
      : treasury
  );
  await writeRuntime(runtime);
  return entry;
}

export async function ensureCommunityTreasury(slug: string) {
  const existing = await getTreasuryByCommunitySlug(slug);
  if (existing) return existing.treasury;
  const account = await getPlatformAccountBySlug(slug);
  if (!account) throw new Error('Platform account not found for treasury creation.');
  const record: CommunityTreasuryRecord = {
    id: id('treasury'),
    accountId: account.account.id,
    accountSlug: account.account.slug,
    label: account.account.treasuryLabel || `${account.account.displayName} treasury`,
    restrictedBalance: 0,
    unrestrictedBalance: 0,
    pendingDisbursementAmount: 0,
    nextDisbursementDate: inDays(30),
    reportingNote: 'Treasury created from platform account.'
  };
  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    await supabase.from('community_treasuries').insert({
      id: record.id,
      account_id: record.accountId,
      account_slug: record.accountSlug,
      label: record.label,
      restricted_balance: record.restrictedBalance,
      unrestricted_balance: record.unrestrictedBalance,
      pending_disbursement_amount: record.pendingDisbursementAmount,
      next_disbursement_date: record.nextDisbursementDate,
      reporting_note: record.reportingNote
    });
    return record;
  }
  const runtime = await readRuntime();
  runtime.treasuries.unshift(record);
  await writeRuntime(runtime);
  return record;
}
