import { promises as fs } from 'node:fs';
import path from 'node:path';
import { assertRuntimePersistenceAllowed } from '@/app/lib/runtimePersistence';
import type { LaunchpadCadence, LaunchpadQuote, LaunchpadSupportTier } from '@/app/lib/launchpad';
import { calculateLaunchpadQuote } from '@/app/lib/launchpad';
import { getLaunchpadCampaignRecordBySlug } from '@/app/lib/launchpadCampaignStore';
import { ensureCommunityTreasury, recordChampionSponsorshipDisbursement, recordTreasuryContribution } from '@/app/lib/platformTreasury';
import { getPlatformAccountBySlug } from '@/app/lib/platformAccounts';

export interface LaunchpadReceiptRecord {
  id: string;
  campaignId: string;
  campaignSlug: string;
  campaignTitle: string;
  category: string;
  beneficiaryName: string;
  supporterName: string;
  supporterEmail: string;
  cadence: LaunchpadCadence;
  tierId: string;
  tierLabel: string;
  badge: string;
  amount: number;
  note: string;
  visibility: 'public' | 'private';
  quote: LaunchpadQuote;
  totalPaid: number;
  createdAt: string;
  linkedAccountSlug: string;
  sourceReference?: string;
}

interface LaunchpadSupportStore {
  receipts: LaunchpadReceiptRecord[];
}

const RUNTIME_DIR = path.join(process.cwd(), '.runtime');
const FILE = path.join(RUNTIME_DIR, 'launchpad-support.json');

function nowIso() {
  return new Date().toISOString();
}

function id(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function isRecentDuplicate(receipt: LaunchpadReceiptRecord, input: {
  campaignSlug: string;
  supporterEmail: string;
  cadence: LaunchpadCadence;
  amount: number;
}) {
  const ageMs = Date.now() - new Date(receipt.createdAt).getTime();
  return (
    ageMs < 10 * 60 * 1000 &&
    receipt.campaignSlug === input.campaignSlug &&
    receipt.supporterEmail === input.supporterEmail.trim().toLowerCase() &&
    receipt.cadence === input.cadence &&
    receipt.amount === input.amount
  );
}

async function ensureDir() {
  assertRuntimePersistenceAllowed('launchpad support');
  await fs.mkdir(RUNTIME_DIR, { recursive: true });
}

async function readRuntime(): Promise<LaunchpadSupportStore> {
  await ensureDir();
  const raw = await fs.readFile(FILE, 'utf8').catch(() => '');
  if (!raw) {
    const seeded = { receipts: [] } satisfies LaunchpadSupportStore;
    await writeRuntime(seeded);
    return seeded;
  }
  try {
    const parsed = JSON.parse(raw) as Partial<LaunchpadSupportStore>;
    return {
      receipts: Array.isArray(parsed.receipts) ? parsed.receipts as LaunchpadReceiptRecord[] : []
    };
  } catch {
    const seeded = { receipts: [] } satisfies LaunchpadSupportStore;
    await writeRuntime(seeded);
    return seeded;
  }
}

async function writeRuntime(data: LaunchpadSupportStore) {
  await ensureDir();
  await fs.writeFile(FILE, JSON.stringify(data, null, 2), 'utf8');
}

export async function createLaunchpadReceipt(input: {
  campaignSlug: string;
  supporterName: string;
  supporterEmail: string;
  cadence: LaunchpadCadence;
  tier: LaunchpadSupportTier;
  amount: number;
  note?: string;
  visibility?: 'public' | 'private';
  sourceReference?: string;
}) {
  const campaign = await getLaunchpadCampaignRecordBySlug(input.campaignSlug);
  if (!campaign) {
    throw new Error('Launchpad campaign not found.');
  }
  const amount = Number(input.amount || 0);
  if (!Number.isFinite(amount) || amount < 5) {
    throw new Error('Launchpad support amount must be at least $5.');
  }
  if (!input.supporterName.trim() || !input.supporterEmail.trim()) {
    throw new Error('Supporter name and email are required.');
  }
  const store = await readRuntime();
  const existingBySource = input.sourceReference
    ? store.receipts.find((receipt) => receipt.sourceReference && receipt.sourceReference === input.sourceReference)
    : null;
  if (existingBySource) {
    return existingBySource;
  }
  const recentDuplicate = store.receipts.find((receipt) =>
    isRecentDuplicate(receipt, {
      campaignSlug: input.campaignSlug,
      supporterEmail: input.supporterEmail,
      cadence: input.cadence,
      amount
    })
  );
  if (recentDuplicate) {
    return recentDuplicate;
  }
  const quote = calculateLaunchpadQuote(amount);
  const receipt: LaunchpadReceiptRecord = {
    id: id('launchpadrcpt'),
    campaignId: campaign.id,
    campaignSlug: campaign.slug,
    campaignTitle: campaign.title,
    category: campaign.category,
    beneficiaryName: campaign.beneficiaryName,
    supporterName: input.supporterName.trim(),
    supporterEmail: input.supporterEmail.trim().toLowerCase(),
    cadence: input.cadence,
    tierId: input.tier.id,
    tierLabel: input.tier.label,
    badge: input.tier.badge,
    amount,
    note: input.note?.trim() || '',
    visibility: input.visibility || 'public',
    quote,
    totalPaid: quote.total,
    createdAt: nowIso(),
    linkedAccountSlug: campaign.linkedAccountSlug || '',
    sourceReference: input.sourceReference?.trim() || undefined
  };
  store.receipts.unshift(receipt);
  await writeRuntime(store);

  if (campaign.linkedAccountSlug) {
    const account = await getPlatformAccountBySlug(campaign.linkedAccountSlug);
    if (!account) {
      throw new Error('Linked Launchpad account not found.');
    }
    if (campaign.category === 'digital-champion') {
      const scheduleDays = receipt.cadence === 'monthly' ? 0 : 7;
      await recordChampionSponsorshipDisbursement({
        sponsorshipId: receipt.id,
        championId: campaign.id,
        targetAccountId: account.account.id,
        amount: receipt.quote.beneficiaryNet,
        note: `Launchpad ${receipt.cadence} sponsorship for ${campaign.beneficiaryName}`,
        scheduleDays,
        sourceReference: receipt.id
      });
    } else if (['community', 'tribe', 'collective'].includes(account.account.accountType)) {
      const treasury = await ensureCommunityTreasury(campaign.linkedAccountSlug);
      await recordTreasuryContribution({
        accountId: treasury.accountId,
        amount: receipt.quote.beneficiaryNet,
        note: `Launchpad ${receipt.cadence} support: ${campaign.title}`,
        counterparty: receipt.supporterName,
        currency: 'USD',
        sourceReference: receipt.id
      });
    }
  }

  return receipt;
}

export async function getLaunchpadReceiptById(receiptId: string) {
  const store = await readRuntime();
  return store.receipts.find((receipt) => receipt.id === receiptId) || null;
}

export async function listLaunchpadReceiptsByCampaignSlug(campaignSlug: string) {
  const store = await readRuntime();
  return store.receipts.filter((receipt) => receipt.campaignSlug === campaignSlug);
}

