import { promises as fs } from 'node:fs';
import path from 'node:path';
import { assertRuntimePersistenceAllowed } from '@/app/lib/runtimePersistence';
import {
  launchpadCategoryMeta,
  seedLaunchpadCampaigns,
  type LaunchpadCampaign,
  type LaunchpadCampaignStatus,
  type LaunchpadCategory,
  type LaunchpadSupportTier
} from '@/app/lib/launchpad';

interface LaunchpadCampaignStore {
  campaigns: LaunchpadCampaign[];
}

const RUNTIME_DIR = path.join(process.cwd(), '.runtime');
const FILE = path.join(RUNTIME_DIR, 'launchpad-campaigns.json');

function nowId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function toSlug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

async function ensureDir() {
  assertRuntimePersistenceAllowed('launchpad campaigns');
  await fs.mkdir(RUNTIME_DIR, { recursive: true });
}

async function readRuntime(): Promise<LaunchpadCampaignStore> {
  await ensureDir();
  const raw = await fs.readFile(FILE, 'utf8').catch(() => '');
  if (!raw) {
    const seeded: LaunchpadCampaignStore = { campaigns: [] };
    await writeRuntime(seeded);
    return seeded;
  }
  try {
    const parsed = JSON.parse(raw) as Partial<LaunchpadCampaignStore>;
    return {
      campaigns: Array.isArray(parsed.campaigns) ? (parsed.campaigns as LaunchpadCampaign[]) : []
    };
  } catch {
    const seeded: LaunchpadCampaignStore = { campaigns: [] };
    await writeRuntime(seeded);
    return seeded;
  }
}

async function writeRuntime(store: LaunchpadCampaignStore) {
  await ensureDir();
  await fs.writeFile(FILE, JSON.stringify(store, null, 2), 'utf8');
}

export async function listLaunchpadCampaignRecords() {
  const store = await readRuntime();
  return [...store.campaigns, ...seedLaunchpadCampaigns];
}

export async function listPublicLaunchpadCampaignRecords() {
  const campaigns = await listLaunchpadCampaignRecords();
  return campaigns.filter((campaign) => (campaign.status ?? 'published') === 'published');
}

export async function listLaunchpadCampaignsForAccount(accountSlug: string) {
  const campaigns = await listLaunchpadCampaignRecords();
  return campaigns.filter((campaign) => campaign.linkedAccountSlug === accountSlug);
}

export async function getLaunchpadCampaignRecordBySlug(slug: string) {
  const campaigns = await listLaunchpadCampaignRecords();
  return campaigns.find((campaign) => campaign.slug === slug) || null;
}

export async function updateLaunchpadCampaignStatus(slug: string, status: LaunchpadCampaignStatus) {
  const store = await readRuntime();
  const index = store.campaigns.findIndex((campaign) => campaign.slug === slug);
  if (index === -1) {
    throw new Error('Only creator-made Launchpad campaigns can be updated from Creator Hub.');
  }

  const current = store.campaigns[index];
  const updated: LaunchpadCampaign = {
    ...current,
    status,
    updatedAt: new Date().toISOString()
  };
  store.campaigns[index] = updated;
  await writeRuntime(store);
  return updated;
}

export async function createLaunchpadCampaign(input: {
  title: string;
  beneficiaryName: string;
  beneficiaryRole: string;
  location: string;
  category: LaunchpadCategory;
  status: LaunchpadCampaignStatus;
  goalAmount: number;
  summary: string;
  story: string;
  urgencyLabel: string;
  tags: string[];
  useOfFunds: string[];
  impactPoints: string[];
  image?: string;
  beneficiaryImage?: string;
  linkedAccountSlug?: string;
  linkedEntityHref?: string;
  supportTiers?: {
    oneTime: LaunchpadSupportTier[];
    monthly: LaunchpadSupportTier[];
  };
  milestonePlan: Array<{ label: string; amount: number; detail: string }>;
  campaignUpdates: Array<{ title: string; detail: string; postedLabel: string }>;
}) {
  const store = await readRuntime();
  const baseSlug = toSlug(`${input.beneficiaryName}-${input.title}`);
  const existing = new Set([...store.campaigns, ...seedLaunchpadCampaigns].map((campaign) => campaign.slug));
  let slug = baseSlug || nowId('campaign');
  let counter = 2;
  while (existing.has(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }

  const categoryMeta = launchpadCategoryMeta[input.category];
  const supportTiers = input.supportTiers ?? {
    oneTime: [
      { id: 'one-time-1', label: 'Starter', amount: 25, badge: categoryMeta.label, description: 'One-time backing for the campaign.', cadence: 'one-time' as const },
      { id: 'one-time-2', label: 'Builder', amount: 75, badge: categoryMeta.label, description: 'A stronger one-time push toward the goal.', cadence: 'one-time' as const },
      { id: 'one-time-3', label: 'Patron', amount: 180, badge: categoryMeta.label, description: 'High-trust one-time backing for momentum.', cadence: 'one-time' as const },
      { id: 'one-time-4', label: 'Cornerstone', amount: 400, badge: categoryMeta.label, description: 'Foundational backing for the campaign.', cadence: 'one-time' as const }
    ],
    monthly: [
      { id: 'monthly-1', label: 'Seed', amount: 12, badge: categoryMeta.label, description: 'Monthly backing to keep the campaign alive.', cadence: 'monthly' as const },
      { id: 'monthly-2', label: 'Circle', amount: 35, badge: categoryMeta.label, description: 'Steady recurring support for core needs.', cadence: 'monthly' as const },
      { id: 'monthly-3', label: 'Steward', amount: 85, badge: categoryMeta.label, description: 'Monthly support with real leverage.', cadence: 'monthly' as const },
      { id: 'monthly-4', label: 'Anchor', amount: 180, badge: categoryMeta.label, description: 'A major recurring commitment.', cadence: 'monthly' as const }
    ]
  };
  const createdAt = new Date().toISOString();

  const campaign: LaunchpadCampaign = {
    id: nowId('launch'),
    slug,
    status: input.status,
    category: input.category,
    title: input.title,
    subtitle: `${categoryMeta.label} campaign`,
    beneficiaryName: input.beneficiaryName,
    beneficiaryRole: input.beneficiaryRole,
    beneficiaryImage: input.beneficiaryImage || categoryMeta.image,
    location: input.location,
    image: input.image || categoryMeta.image,
    gallery: [input.image || categoryMeta.image, input.beneficiaryImage || categoryMeta.image, categoryMeta.image],
    goalAmount: input.goalAmount,
    raisedAmount: 0,
    sponsorCount: 0,
    urgencyLabel: input.urgencyLabel,
    summary: input.summary,
    story: input.story,
    useOfFunds: input.useOfFunds,
    impactPoints: input.impactPoints,
    tags: input.tags,
    linkedAccountSlug: input.linkedAccountSlug,
    linkedEntityHref: input.linkedEntityHref,
    closesInLabel: '30 days left',
    recentBackers: [],
    milestonePlan: input.milestonePlan,
    campaignUpdates: input.campaignUpdates,
    supportTiers,
    createdAt,
    updatedAt: createdAt
  };

  store.campaigns.unshift(campaign);
  await writeRuntime(store);
  return campaign;
}
