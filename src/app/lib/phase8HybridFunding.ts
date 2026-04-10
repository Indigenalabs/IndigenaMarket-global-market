import { promises as fs } from 'node:fs';
import path from 'node:path';
import { assertRuntimePersistenceAllowed } from '@/app/lib/runtimePersistence';

export type HybridFundingSource = 'launchpad' | 'seva';
export type HybridFundingLane =
  | 'direct-beneficiary'
  | 'community-treasury'
  | 'champion-operations'
  | 'rapid-response'
  | 'land-back'
  | 'innovation';

export interface HybridFundingReceiptRecord {
  id: string;
  source: HybridFundingSource;
  lane: HybridFundingLane;
  laneLabel: string;
  nativeReceiptId: string;
  amountGross: number;
  platformFee: number;
  processorFee: number;
  serviceFee: number;
  beneficiaryNet: number;
  currency: 'USD';
  createdAt: string;
  supporterName: string;
  supporterEmail: string;
  beneficiaryLabel: string;
  linkedAccountSlug: string;
  campaignSlug?: string;
  campaignTitle?: string;
  sevaProjectId?: string;
  sevaProjectTitle?: string;
  sacredFundId?: string;
  visibility?: 'public' | 'private';
  cadence?: 'one-time' | 'monthly';
  note?: string;
  sourceReference?: string;
  metadata?: Record<string, unknown>;
}

export interface HybridFundingBreakdown {
  key: string;
  label: string;
  count: number;
  grossAmount: number;
  netAmount: number;
}

export interface HybridFundingSummary {
  totalReceipts: number;
  totalGrossAmount: number;
  totalPlatformFees: number;
  totalProcessorFees: number;
  totalServiceFees: number;
  totalNetAmount: number;
  launchpadGrossAmount: number;
  sevaGrossAmount: number;
  bySource: HybridFundingBreakdown[];
  byLane: HybridFundingBreakdown[];
  recentReceipts: HybridFundingReceiptRecord[];
}

interface HybridFundingStore {
  receipts: HybridFundingReceiptRecord[];
}

const RUNTIME_DIR = path.join(process.cwd(), '.runtime');
const FILE = path.join(RUNTIME_DIR, 'phase8-hybrid-funding.json');

function id(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function roundCurrency(value: number) {
  return Math.round(value * 100) / 100;
}

function nowIso() {
  return new Date().toISOString();
}

function emptyStore(): HybridFundingStore {
  return { receipts: [] };
}

async function ensureDir() {
  assertRuntimePersistenceAllowed('phase 8 hybrid funding');
  await fs.mkdir(RUNTIME_DIR, { recursive: true });
}

async function readRuntime(): Promise<HybridFundingStore> {
  await ensureDir();
  const raw = await fs.readFile(FILE, 'utf8').catch(() => '');
  if (!raw) {
    const seeded = emptyStore();
    await writeRuntime(seeded);
    return seeded;
  }
  try {
    const parsed = JSON.parse(raw) as Partial<HybridFundingStore>;
    return {
      receipts: Array.isArray(parsed.receipts) ? (parsed.receipts as HybridFundingReceiptRecord[]) : []
    };
  } catch {
    const seeded = emptyStore();
    await writeRuntime(seeded);
    return seeded;
  }
}

async function writeRuntime(store: HybridFundingStore) {
  await ensureDir();
  await fs.writeFile(FILE, JSON.stringify(store, null, 2), 'utf8');
}

export function getHybridFundingLaneLabel(lane: HybridFundingLane) {
  switch (lane) {
    case 'community-treasury':
      return 'Community treasury';
    case 'champion-operations':
      return 'Champion operations';
    case 'rapid-response':
      return 'Rapid Response Fund';
    case 'land-back':
      return 'Land Back Fund';
    case 'innovation':
      return 'Innovation Fund';
    default:
      return 'Direct beneficiary';
  }
}

export function calculateSevaFundingQuote(amount: number) {
  const gross = roundCurrency(Number(amount || 0));
  const processorFee = roundCurrency(gross * 0.029 + 0.3);
  const serviceFee = roundCurrency(gross * 0.06);
  const beneficiaryNet = roundCurrency(Math.max(gross - processorFee - serviceFee, 0));
  return {
    gross,
    processorFee,
    serviceFee,
    beneficiaryNet
  };
}

export async function createHybridFundingReceipt(
  input: Omit<HybridFundingReceiptRecord, 'id' | 'createdAt' | 'laneLabel' | 'currency'> & {
    currency?: 'USD';
  }
) {
  const store = await readRuntime();
  const existing = store.receipts.find(
    (entry) =>
      entry.source === input.source &&
      entry.nativeReceiptId === input.nativeReceiptId
  );
  if (existing) return existing;

  const receipt: HybridFundingReceiptRecord = {
    ...input,
    id: id('hfund'),
    createdAt: nowIso(),
    laneLabel: getHybridFundingLaneLabel(input.lane),
    amountGross: roundCurrency(input.amountGross),
    platformFee: roundCurrency(input.platformFee),
    processorFee: roundCurrency(input.processorFee),
    serviceFee: roundCurrency(input.serviceFee),
    beneficiaryNet: roundCurrency(input.beneficiaryNet),
    currency: input.currency || 'USD'
  };
  store.receipts.unshift(receipt);
  await writeRuntime(store);
  return receipt;
}

export async function getHybridFundingReceiptById(receiptId: string) {
  const store = await readRuntime();
  return store.receipts.find((entry) => entry.id === receiptId) || null;
}

export async function getHybridFundingReceiptByNativeReceipt(source: HybridFundingSource, nativeReceiptId: string) {
  const store = await readRuntime();
  return (
    store.receipts.find(
      (entry) => entry.source === source && entry.nativeReceiptId === nativeReceiptId
    ) || null
  );
}

export async function listHybridFundingReceipts(filters?: {
  source?: HybridFundingSource;
  linkedAccountSlug?: string;
  campaignSlug?: string;
  sevaProjectId?: string;
  sacredFundId?: string;
  lane?: HybridFundingLane;
}) {
  const store = await readRuntime();
  let rows = [...store.receipts];
  if (filters?.source) rows = rows.filter((entry) => entry.source === filters.source);
  if (filters?.linkedAccountSlug) rows = rows.filter((entry) => entry.linkedAccountSlug === filters.linkedAccountSlug);
  if (filters?.campaignSlug) rows = rows.filter((entry) => entry.campaignSlug === filters.campaignSlug);
  if (filters?.sevaProjectId) rows = rows.filter((entry) => entry.sevaProjectId === filters.sevaProjectId);
  if (filters?.sacredFundId) rows = rows.filter((entry) => entry.sacredFundId === filters.sacredFundId);
  if (filters?.lane) rows = rows.filter((entry) => entry.lane === filters.lane);
  return rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

function summarize(rows: HybridFundingReceiptRecord[]): HybridFundingSummary {
  const buildBreakdown = (
    keys: string[],
    getValue: (row: HybridFundingReceiptRecord) => string,
    getLabel: (key: string) => string
  ) =>
    keys.map((key) => {
      const scoped = rows.filter((row) => getValue(row) === key);
      return {
        key,
        label: getLabel(key),
        count: scoped.length,
        grossAmount: roundCurrency(scoped.reduce((sum, row) => sum + row.amountGross, 0)),
        netAmount: roundCurrency(scoped.reduce((sum, row) => sum + row.beneficiaryNet, 0))
      } satisfies HybridFundingBreakdown;
    });

  return {
    totalReceipts: rows.length,
    totalGrossAmount: roundCurrency(rows.reduce((sum, row) => sum + row.amountGross, 0)),
    totalPlatformFees: roundCurrency(rows.reduce((sum, row) => sum + row.platformFee, 0)),
    totalProcessorFees: roundCurrency(rows.reduce((sum, row) => sum + row.processorFee, 0)),
    totalServiceFees: roundCurrency(rows.reduce((sum, row) => sum + row.serviceFee, 0)),
    totalNetAmount: roundCurrency(rows.reduce((sum, row) => sum + row.beneficiaryNet, 0)),
    launchpadGrossAmount: roundCurrency(
      rows.filter((row) => row.source === 'launchpad').reduce((sum, row) => sum + row.amountGross, 0)
    ),
    sevaGrossAmount: roundCurrency(
      rows.filter((row) => row.source === 'seva').reduce((sum, row) => sum + row.amountGross, 0)
    ),
    bySource: buildBreakdown(['launchpad', 'seva'], (row) => row.source, (key) => key === 'launchpad' ? 'Launchpad' : 'Seva'),
    byLane: buildBreakdown(
      ['direct-beneficiary', 'community-treasury', 'champion-operations', 'rapid-response', 'land-back', 'innovation'],
      (row) => row.lane,
      (key) => getHybridFundingLaneLabel(key as HybridFundingLane)
    ),
    recentReceipts: rows.slice(0, 8)
  };
}

export async function summarizeHybridFunding(filters?: {
  source?: HybridFundingSource;
  linkedAccountSlug?: string;
  campaignSlug?: string;
  sevaProjectId?: string;
  sacredFundId?: string;
}) {
  const rows = await listHybridFundingReceipts(filters);
  return summarize(rows);
}
