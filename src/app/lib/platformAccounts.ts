import { promises as fs } from 'node:fs';
import path from 'node:path';
import { createSupabaseServerClient, isSupabaseServerConfigured } from '@/app/lib/supabase/server';
import { assertRuntimePersistenceAllowed } from '@/app/lib/runtimePersistence';

export type PlatformAccountType = 'artist' | 'community' | 'tribe' | 'collective' | 'digital_champion' | 'elder_council';
export type PlatformVerificationStatus = 'draft' | 'pending' | 'approved' | 'rejected';
export type PlatformMemberRole = 'owner' | 'representative' | 'editor' | 'treasurer' | 'elder' | 'steward';
export type SplitRuleType = 'primary-sale' | 'royalty' | 'donation-admin' | 'sponsorship';

export interface PlatformAccountRecord {
  id: string;
  slug: string;
  displayName: string;
  description: string;
  accountType: PlatformAccountType;
  location: string;
  nation: string;
  storefrontHeadline: string;
  verificationStatus: PlatformVerificationStatus;
  treasuryLabel: string;
  supportUrl: string;
  payoutWallet: string;
  avatar: string;
  banner: string;
  story: string;
  featuredOfferingIds: string[];
  representativeActorIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PlatformAccountMemberRecord {
  id: string;
  accountId: string;
  actorId: string;
  displayName: string;
  role: PlatformMemberRole;
  permissions: string[];
  joinedAt: string;
}

export interface PlatformAccountVerificationRecord {
  id: string;
  accountId: string;
  authorityProof: string;
  communityReferences: string[];
  treasuryReviewStatus: PlatformVerificationStatus;
  representativeReviewStatus: PlatformVerificationStatus;
  elderEndorsementStatus: PlatformVerificationStatus;
  notes: string;
  reviewedBy: string;
  submittedAt: string;
  updatedAt: string;
}

export interface ElderAuthorityRecord {
  id: string;
  actorId: string;
  displayName: string;
  nation: string;
  status: PlatformVerificationStatus;
  authorities: string[];
  councilSeat: string;
  notes: string;
  approvedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface RevenueSplitBeneficiaryRecord {
  id: string;
  splitRuleId: string;
  beneficiaryType: 'actor' | 'account';
  beneficiaryId: string;
  label: string;
  percentage: number;
  payoutTarget: string;
}

export interface RevenueSplitRuleRecord {
  id: string;
  ownerAccountId: string;
  offeringId: string;
  offeringLabel: string;
  pillar: string;
  ruleType: SplitRuleType;
  status: 'draft' | 'active' | 'archived';
  notes: string;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
  beneficiaries: RevenueSplitBeneficiaryRecord[];
}

export interface PlatformAccountDashboard {
  accounts: PlatformAccountRecord[];
  members: PlatformAccountMemberRecord[];
  verifications: PlatformAccountVerificationRecord[];
  elderAuthorities: ElderAuthorityRecord[];
  revenueSplitRules: RevenueSplitRuleRecord[];
}

const RUNTIME_DIR = path.join(process.cwd(), '.runtime');
const FILE = path.join(RUNTIME_DIR, 'platform-accounts.json');
const LEGACY_ASSET_MAP: Record<string, string> = {
  '/artists/artist-1.jpg': '/communities/reps/aiyana-redbird.svg',
  '/hero1.jpg': '/launchpad/artist-tour.svg',
  '/hero2.jpg': '/communities/ngarra-banner.svg',
  '/hero3.jpg': '/communities/riverstone-banner.svg',
  '/logo.svg': '/logo.png'
};

function nowIso() {
  return new Date().toISOString();
}

function id(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function defaultPermissionsForRole(role: PlatformMemberRole) {
  switch (role) {
    case 'owner':
      return ['publish', 'edit_store', 'manage_members', 'manage_splits', 'view_payouts', 'submit_verification'];
    case 'representative':
      return ['publish', 'edit_store', 'manage_members', 'submit_verification'];
    case 'editor':
      return ['publish', 'edit_store'];
    case 'treasurer':
      return ['view_treasury', 'manage_splits', 'view_payouts'];
    case 'elder':
      return ['endorse_sacred_content', 'approve_protocols'];
    case 'steward':
      return ['publish', 'edit_store', 'respond_requests'];
    default:
      return [];
  }
}

function normalizeAssetPath(value: string) {
  return LEGACY_ASSET_MAP[value] || value;
}

function normalizeAccountAssets(account: PlatformAccountRecord): PlatformAccountRecord {
  return {
    ...account,
    avatar: normalizeAssetPath(account.avatar),
    banner: normalizeAssetPath(account.banner)
  };
}

function seedDashboard(): PlatformAccountDashboard {
  const now = nowIso();
  const accounts: PlatformAccountRecord[] = [
    {
      id: 'acct-artist-aiyana',
      slug: 'aiyana-redbird',
      displayName: 'Aiyana Redbird Studio',
      description: 'Cross-pillar creator account for digital collections, workshops, and material kits.',
      accountType: 'artist',
      location: 'Vancouver Island',
      nation: 'Coast Salish',
      storefrontHeadline: 'Original works, teachings, and cultural product drops from one creator studio.',
      verificationStatus: 'approved',
      treasuryLabel: 'Direct creator payouts',
      supportUrl: '/profile/aiyana-redbird',
      payoutWallet: 'xrpl:rAiyanaStudioTreasury',
      avatar: '/communities/reps/aiyana-redbird.svg',
      banner: '/launchpad/artist-tour.svg',
      story: 'This account represents the artist studio itself and can optionally route splits to community partners.',
      featuredOfferingIds: ['art-001', 'course-101', 'mt-101'],
      representativeActorIds: ['actor-aiyana'],
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'acct-community-riverstone',
      slug: 'riverstone-arts-council',
      displayName: 'Riverstone Arts Council',
      description: 'Community-run storefront for cultural goods, workshops, and restoration fundraising.',
      accountType: 'community',
      location: 'Northern Plains',
      nation: 'Riverstone Nation',
      storefrontHeadline: 'Sell on behalf of the community, fund cultural work, and route proceeds to treasury goals.',
      verificationStatus: 'pending',
      treasuryLabel: 'Riverstone community treasury',
      supportUrl: '/communities/riverstone-arts-council/support',
      payoutWallet: 'xrpl:rRiverstoneTreasury',
      avatar: '/communities/riverstone-avatar.svg',
      banner: '/communities/riverstone-banner.svg',
      story: 'Riverstone uses its page for collective sales, language fundraising, and coordinated placements.',
      featuredOfferingIds: ['lf-101', 'tour-001'],
      representativeActorIds: ['actor-riverstone-steward', 'actor-aiyana'],
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'acct-tribe-ngarra',
      slug: 'ngarra-learning-circle',
      displayName: 'Ngarra Learning Circle',
      description: 'Tribal education account for archive access, cultural courses, and intergenerational programs.',
      accountType: 'tribe',
      location: 'Central Desert',
      nation: 'Ngarra',
      storefrontHeadline: 'A tribe-owned page for education, archive stewardship, and guided access to sacred-approved resources.',
      verificationStatus: 'approved',
      treasuryLabel: 'Ngarra cultural education fund',
      supportUrl: '/communities/ngarra-learning-circle/support',
      payoutWallet: 'xrpl:rNgarraEducationFund',
      avatar: '/communities/ngarra-avatar.svg',
      banner: '/communities/ngarra-banner.svg',
      story: 'Ngarra uses split rules to route course and archive income into a restricted education treasury.',
      featuredOfferingIds: ['course-301', 'recording-001'],
      representativeActorIds: ['actor-ngarra-chair', 'actor-elder-lila'],
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'acct-champion-talia',
      slug: 'talia-riverstone-champion',
      displayName: 'Talia Riverstone Champion Desk',
      description: 'Digital Champion account used for regional onboarding support, sponsorship, and reporting.',
      accountType: 'digital_champion',
      location: 'Northern Plains',
      nation: 'Riverstone Nation',
      storefrontHeadline: 'Regional champion program for onboarding, seller support, and treasury literacy.',
      verificationStatus: 'approved',
      treasuryLabel: 'Champion sponsorship operating fund',
      supportUrl: '/digital-champions/talia-riverstone',
      payoutWallet: 'xrpl:rChampionRiverstone',
      avatar: '/communities/reps/talia-riverstone.svg',
      banner: '/launchpad/champion-fund.svg',
      story: 'This program account powers champion sponsorship, travel support, and community onboarding work.',
      featuredOfferingIds: [],
      representativeActorIds: ['actor-riverstone-steward'],
      createdAt: now,
      updatedAt: now
    }
  ];

  const members: PlatformAccountMemberRecord[] = [
    {
      id: 'acctmem-1',
      accountId: 'acct-artist-aiyana',
      actorId: 'actor-aiyana',
      displayName: 'Aiyana Redbird',
      role: 'owner',
      permissions: ['publish', 'edit_store', 'manage_splits', 'view_payouts'],
      joinedAt: now
    },
    {
      id: 'acctmem-2',
      accountId: 'acct-community-riverstone',
      actorId: 'actor-riverstone-steward',
      displayName: 'Talia Riverstone',
      role: 'representative',
      permissions: ['publish', 'edit_store', 'manage_members', 'submit_verification'],
      joinedAt: now
    },
    {
      id: 'acctmem-3',
      accountId: 'acct-community-riverstone',
      actorId: 'actor-aiyana',
      displayName: 'Aiyana Redbird',
      role: 'editor',
      permissions: ['publish', 'edit_store'],
      joinedAt: now
    },
    {
      id: 'acctmem-4',
      accountId: 'acct-tribe-ngarra',
      actorId: 'actor-ngarra-chair',
      displayName: 'Marra Ngarra',
      role: 'treasurer',
      permissions: ['view_treasury', 'manage_splits', 'manage_members'],
      joinedAt: now
    },
    {
      id: 'acctmem-5',
      accountId: 'acct-tribe-ngarra',
      actorId: 'actor-elder-lila',
      displayName: 'Elder Lila',
      role: 'elder',
      permissions: ['endorse_sacred_content', 'approve_protocols'],
      joinedAt: now
    },
    {
      id: 'acctmem-6',
      accountId: 'acct-champion-talia',
      actorId: 'actor-riverstone-steward',
      displayName: 'Talia Riverstone',
      role: 'steward',
      permissions: ['manage_sponsorships', 'log_impact', 'respond_requests'],
      joinedAt: now
    }
  ];

  const verifications: PlatformAccountVerificationRecord[] = [
    {
      id: 'acctver-1',
      accountId: 'acct-community-riverstone',
      authorityProof: 'Council resolution uploaded and treasury custodian letter attached.',
      communityReferences: ['Riverstone Language Board', 'Riverstone Women Weavers Guild'],
      treasuryReviewStatus: 'pending',
      representativeReviewStatus: 'approved',
      elderEndorsementStatus: 'pending',
      notes: 'Waiting on elder endorsement before treasury routing is opened.',
      reviewedBy: 'platform-admin',
      submittedAt: now,
      updatedAt: now
    },
    {
      id: 'acctver-2',
      accountId: 'acct-tribe-ngarra',
      authorityProof: 'Verified by community council and treasury custodian.',
      communityReferences: ['Ngarra School Council', 'Ngarra Archive Circle'],
      treasuryReviewStatus: 'approved',
      representativeReviewStatus: 'approved',
      elderEndorsementStatus: 'approved',
      notes: 'Approved for restricted archive and education flows.',
      reviewedBy: 'governance-admin',
      submittedAt: now,
      updatedAt: now
    }
  ];

  const elderAuthorities: ElderAuthorityRecord[] = [
    {
      id: 'elderauth-1',
      actorId: 'actor-elder-lila',
      displayName: 'Elder Lila',
      nation: 'Ngarra',
      status: 'approved',
      authorities: ['sacred-content-review', 'community-endorsement', 'governance-signer'],
      councilSeat: 'Language and teaching seat',
      notes: 'Can endorse archive access levels and language-heritage releases.',
      approvedBy: 'governance-admin',
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'elderauth-2',
      actorId: 'actor-elder-kiona',
      displayName: 'Elder Kiona',
      nation: 'Riverstone Nation',
      status: 'pending',
      authorities: ['community-endorsement'],
      councilSeat: 'Pending council confirmation',
      notes: 'Submitted for community verification and sponsorship oversight.',
      approvedBy: '',
      createdAt: now,
      updatedAt: now
    }
  ];

  const revenueSplitRules: RevenueSplitRuleRecord[] = [
    {
      id: 'split-1',
      ownerAccountId: 'acct-community-riverstone',
      offeringId: 'art-001',
      offeringLabel: 'Riverstone Heritage Print',
      pillar: 'digital-arts',
      ruleType: 'primary-sale',
      status: 'active',
      notes: 'Primary sale split between artist practice and community treasury.',
      createdBy: 'actor-riverstone-steward',
      updatedBy: 'actor-riverstone-steward',
      createdAt: now,
      updatedAt: now,
      beneficiaries: [
        { id: 'splitbenef-1', splitRuleId: 'split-1', beneficiaryType: 'actor', beneficiaryId: 'actor-aiyana', label: 'Aiyana Redbird', percentage: 70, payoutTarget: 'creator-wallet' },
        { id: 'splitbenef-2', splitRuleId: 'split-1', beneficiaryType: 'account', beneficiaryId: 'acct-community-riverstone', label: 'Riverstone community treasury', percentage: 30, payoutTarget: 'community-treasury' }
      ]
    },
    {
      id: 'split-2',
      ownerAccountId: 'acct-tribe-ngarra',
      offeringId: 'course-301',
      offeringLabel: 'Ngarra Language Foundations',
      pillar: 'courses',
      ruleType: 'royalty',
      status: 'active',
      notes: 'Ongoing royalty supports language archive maintenance.',
      createdBy: 'actor-ngarra-chair',
      updatedBy: 'actor-ngarra-chair',
      createdAt: now,
      updatedAt: now,
      beneficiaries: [
        { id: 'splitbenef-3', splitRuleId: 'split-2', beneficiaryType: 'account', beneficiaryId: 'acct-tribe-ngarra', label: 'Ngarra education fund', percentage: 85, payoutTarget: 'restricted-treasury' },
        { id: 'splitbenef-4', splitRuleId: 'split-2', beneficiaryType: 'actor', beneficiaryId: 'actor-elder-lila', label: 'Elder Lila cultural stewardship honorarium', percentage: 15, payoutTarget: 'elder-wallet' }
      ]
    }
  ];

  return { accounts, members, verifications, elderAuthorities, revenueSplitRules };
}

async function ensureDir() {
  assertRuntimePersistenceAllowed('platform accounts');
  await fs.mkdir(RUNTIME_DIR, { recursive: true });
}

async function readRuntime(): Promise<PlatformAccountDashboard> {
  await ensureDir();
  const raw = await fs.readFile(FILE, 'utf8').catch(() => '');
  if (!raw) {
    const seeded = seedDashboard();
    await writeRuntime(seeded);
    return seeded;
  }
  try {
    const parsed = JSON.parse(raw) as Partial<PlatformAccountDashboard>;
    const dashboard = {
      accounts: Array.isArray(parsed.accounts)
        ? (parsed.accounts as PlatformAccountRecord[]).map(normalizeAccountAssets)
        : [],
      members: Array.isArray(parsed.members) ? parsed.members as PlatformAccountMemberRecord[] : [],
      verifications: Array.isArray(parsed.verifications) ? parsed.verifications as PlatformAccountVerificationRecord[] : [],
      elderAuthorities: Array.isArray(parsed.elderAuthorities) ? parsed.elderAuthorities as ElderAuthorityRecord[] : [],
      revenueSplitRules: Array.isArray(parsed.revenueSplitRules) ? parsed.revenueSplitRules as RevenueSplitRuleRecord[] : []
    } satisfies PlatformAccountDashboard;
    if (!dashboard.accounts.length) {
      const seeded = seedDashboard();
      await writeRuntime(seeded);
      return seeded;
    }
    return dashboard;
  } catch {
    const seeded = seedDashboard();
    await writeRuntime(seeded);
    return seeded;
  }
}

async function writeRuntime(data: PlatformAccountDashboard) {
  await ensureDir();
  await fs.writeFile(FILE, JSON.stringify(data, null, 2), 'utf8');
}

function accountFromRow(row: Record<string, unknown>): PlatformAccountRecord {
  return {
    id: String(row.id || ''),
    slug: String(row.slug || ''),
    displayName: String(row.display_name || ''),
    description: String(row.description || ''),
    accountType: String(row.account_type || 'artist') as PlatformAccountType,
    location: String(row.location || ''),
    nation: String(row.nation || ''),
    storefrontHeadline: String(row.storefront_headline || ''),
    verificationStatus: String(row.verification_status || 'draft') as PlatformVerificationStatus,
    treasuryLabel: String(row.treasury_label || ''),
    supportUrl: String(row.support_url || ''),
    payoutWallet: String(row.payout_wallet || ''),
    avatar: String(row.avatar || ''),
    banner: String(row.banner || ''),
    story: String(row.story || ''),
    featuredOfferingIds: Array.isArray(row.featured_offering_ids) ? row.featured_offering_ids.map(String) : [],
    representativeActorIds: Array.isArray(row.representative_actor_ids) ? row.representative_actor_ids.map(String) : [],
    createdAt: String(row.created_at || ''),
    updatedAt: String(row.updated_at || '')
  };
}

function memberFromRow(row: Record<string, unknown>): PlatformAccountMemberRecord {
  return {
    id: String(row.id || ''),
    accountId: String(row.account_id || ''),
    actorId: String(row.actor_id || ''),
    displayName: String(row.display_name || ''),
    role: String(row.role || 'editor') as PlatformMemberRole,
    permissions: Array.isArray(row.permissions) ? row.permissions.map(String) : [],
    joinedAt: String(row.joined_at || '')
  };
}

function verificationFromRow(row: Record<string, unknown>): PlatformAccountVerificationRecord {
  return {
    id: String(row.id || ''),
    accountId: String(row.account_id || ''),
    authorityProof: String(row.authority_proof || ''),
    communityReferences: Array.isArray(row.community_references) ? row.community_references.map(String) : [],
    treasuryReviewStatus: String(row.treasury_review_status || 'draft') as PlatformVerificationStatus,
    representativeReviewStatus: String(row.representative_review_status || 'draft') as PlatformVerificationStatus,
    elderEndorsementStatus: String(row.elder_endorsement_status || 'draft') as PlatformVerificationStatus,
    notes: String(row.notes || ''),
    reviewedBy: String(row.reviewed_by || ''),
    submittedAt: String(row.submitted_at || ''),
    updatedAt: String(row.updated_at || '')
  };
}

function elderFromRow(row: Record<string, unknown>): ElderAuthorityRecord {
  return {
    id: String(row.id || ''),
    actorId: String(row.actor_id || ''),
    displayName: String(row.display_name || ''),
    nation: String(row.nation || ''),
    status: String(row.status || 'draft') as PlatformVerificationStatus,
    authorities: Array.isArray(row.authorities) ? row.authorities.map(String) : [],
    councilSeat: String(row.council_seat || ''),
    notes: String(row.notes || ''),
    approvedBy: String(row.approved_by || ''),
    createdAt: String(row.created_at || ''),
    updatedAt: String(row.updated_at || '')
  };
}

function splitFromRows(rule: Record<string, unknown>, beneficiaries: Record<string, unknown>[]): RevenueSplitRuleRecord {
  return {
    id: String(rule.id || ''),
    ownerAccountId: String(rule.owner_account_id || ''),
    offeringId: String(rule.offering_id || ''),
    offeringLabel: String(rule.offering_label || ''),
    pillar: String(rule.pillar || ''),
    ruleType: String(rule.rule_type || 'primary-sale') as SplitRuleType,
    status: String(rule.status || 'draft') as RevenueSplitRuleRecord['status'],
    notes: String(rule.notes || ''),
    createdBy: String(rule.created_by || ''),
    updatedBy: String(rule.updated_by || ''),
    createdAt: String(rule.created_at || ''),
    updatedAt: String(rule.updated_at || ''),
    beneficiaries: beneficiaries.map((entry) => ({
      id: String(entry.id || ''),
      splitRuleId: String(entry.split_rule_id || ''),
      beneficiaryType: String(entry.beneficiary_type || 'actor') as RevenueSplitBeneficiaryRecord['beneficiaryType'],
      beneficiaryId: String(entry.beneficiary_id || ''),
      label: String(entry.label || ''),
      percentage: Number(entry.percentage || 0),
      payoutTarget: String(entry.payout_target || '')
    }))
  };
}

export async function listPlatformAccountDashboard(): Promise<PlatformAccountDashboard> {
  if (!isSupabaseServerConfigured()) return readRuntime();
  const supabase = createSupabaseServerClient();
  const [accounts, members, verifications, elderAuthorities, splitRules, splitBeneficiaries] = await Promise.all([
    supabase.from('platform_accounts').select('*').order('display_name'),
    supabase.from('platform_account_members').select('*').order('joined_at', { ascending: false }),
    supabase.from('platform_account_verifications').select('*').order('updated_at', { ascending: false }),
    supabase.from('elder_authorities').select('*').order('updated_at', { ascending: false }),
    supabase.from('revenue_split_rules').select('*').order('updated_at', { ascending: false }),
    supabase.from('revenue_split_beneficiaries').select('*')
  ]);
  const beneficiariesByRule = new Map<string, Record<string, unknown>[]>();
  for (const row of (splitBeneficiaries.data || []) as Record<string, unknown>[]) {
    const ruleId = String(row.split_rule_id || '');
    const list = beneficiariesByRule.get(ruleId) || [];
    list.push(row);
    beneficiariesByRule.set(ruleId, list);
  }
  const dashboard = {
    accounts: ((accounts.data || []) as Record<string, unknown>[]).map(accountFromRow),
    members: ((members.data || []) as Record<string, unknown>[]).map(memberFromRow),
    verifications: ((verifications.data || []) as Record<string, unknown>[]).map(verificationFromRow),
    elderAuthorities: ((elderAuthorities.data || []) as Record<string, unknown>[]).map(elderFromRow),
    revenueSplitRules: ((splitRules.data || []) as Record<string, unknown>[]).map((row) => splitFromRows(row, beneficiariesByRule.get(String(row.id || '')) || []))
  };
  if (!dashboard.accounts.length && !dashboard.revenueSplitRules.length) {
    return readRuntime();
  }
  return dashboard;
}

export async function listPlatformAccounts(filter?: { accountTypes?: PlatformAccountType[]; actorId?: string }) {
  const dashboard = await listPlatformAccountDashboard();
  const allowed = filter?.accountTypes;
  const actorId = String(filter?.actorId || '').trim().toLowerCase();
  const memberAccountIds = actorId
    ? new Set(
        dashboard.members
          .filter((entry) => entry.actorId.trim().toLowerCase() === actorId)
          .map((entry) => entry.accountId)
      )
    : null;

  const visibleAccounts = dashboard.accounts.filter((entry) => {
    if (allowed?.length && !allowed.includes(entry.accountType)) return false;
    if (!actorId) return true;
    return memberAccountIds?.has(entry.id) || entry.representativeActorIds.some((candidate) => candidate.trim().toLowerCase() === actorId);
  });

  return visibleAccounts;
}

export async function getPlatformAccountBySlug(slug: string) {
  const dashboard = await listPlatformAccountDashboard();
  const account = dashboard.accounts.find((entry) => entry.slug === slug) || null;
  if (!account) return null;
  return {
    account,
    members: dashboard.members.filter((entry) => entry.accountId === account.id),
    verification: dashboard.verifications.find((entry) => entry.accountId === account.id) || null,
    splitRules: dashboard.revenueSplitRules.filter((entry) => entry.ownerAccountId === account.id)
  };
}

export async function createPlatformAccount(input: {
  slug: string;
  displayName: string;
  description: string;
  accountType: PlatformAccountType;
  location?: string;
  nation?: string;
  storefrontHeadline?: string;
  supportUrl?: string;
  payoutWallet?: string;
  story?: string;
  actorId: string;
  actorDisplayName: string;
  communityReferences?: string[];
  authorityProof?: string;
}) {
  const now = nowIso();
  const dashboard = await listPlatformAccountDashboard();
  if (dashboard.accounts.some((entry) => entry.slug === input.slug)) {
    throw new Error('That community slug is already in use.');
  }
  const account: PlatformAccountRecord = {
    id: id('acct'),
    slug: input.slug,
    displayName: input.displayName,
    description: input.description,
    accountType: input.accountType,
    location: input.location || '',
    nation: input.nation || '',
    storefrontHeadline: input.storefrontHeadline || '',
    verificationStatus: 'pending',
    treasuryLabel: `${input.displayName} treasury`,
    supportUrl: input.supportUrl || `/communities/${input.slug}/support`,
    payoutWallet: input.payoutWallet || '',
    avatar: '/communities/riverstone-avatar.svg',
    banner: '/communities/nations-hero.svg',
    story: input.story || input.description,
    featuredOfferingIds: [],
    representativeActorIds: [input.actorId],
    createdAt: now,
    updatedAt: now
  };
  const member: PlatformAccountMemberRecord = {
    id: id('acctmem'),
    accountId: account.id,
    actorId: input.actorId,
    displayName: input.actorDisplayName,
    role: 'owner',
    permissions: ['publish', 'edit_store', 'manage_members', 'manage_splits', 'submit_verification'],
    joinedAt: now
  };
  const verification: PlatformAccountVerificationRecord = {
    id: id('acctver'),
    accountId: account.id,
    authorityProof: input.authorityProof || '',
    communityReferences: input.communityReferences || [],
    treasuryReviewStatus: 'pending',
    representativeReviewStatus: 'pending',
    elderEndorsementStatus: 'draft',
    notes: 'Submitted from the community account creation flow.',
    reviewedBy: '',
    submittedAt: now,
    updatedAt: now
  };

  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    await supabase.from('platform_accounts').insert({
      id: account.id,
      slug: account.slug,
      display_name: account.displayName,
      description: account.description,
      account_type: account.accountType,
      location: account.location,
      nation: account.nation,
      storefront_headline: account.storefrontHeadline,
      verification_status: account.verificationStatus,
      treasury_label: account.treasuryLabel,
      support_url: account.supportUrl,
      payout_wallet: account.payoutWallet,
      avatar: account.avatar,
      banner: account.banner,
      story: account.story,
      featured_offering_ids: account.featuredOfferingIds,
      representative_actor_ids: account.representativeActorIds,
      created_at: account.createdAt,
      updated_at: account.updatedAt
    });
    await supabase.from('platform_account_members').insert({
      id: member.id,
      account_id: member.accountId,
      actor_id: member.actorId,
      display_name: member.displayName,
      role: member.role,
      permissions: member.permissions,
      joined_at: member.joinedAt
    });
    await supabase.from('platform_account_verifications').insert({
      id: verification.id,
      account_id: verification.accountId,
      authority_proof: verification.authorityProof,
      community_references: verification.communityReferences,
      treasury_review_status: verification.treasuryReviewStatus,
      representative_review_status: verification.representativeReviewStatus,
      elder_endorsement_status: verification.elderEndorsementStatus,
      notes: verification.notes,
      reviewed_by: null,
      submitted_at: verification.submittedAt,
      updated_at: verification.updatedAt
    });
    return { account, member, verification };
  }

  const runtime = await readRuntime();
  runtime.accounts.unshift(account);
  runtime.members.unshift(member);
  runtime.verifications.unshift(verification);
  await writeRuntime(runtime);
  return { account, member, verification };
}

export async function updatePlatformAccountVerification(input: {
  accountId: string;
  treasuryReviewStatus?: PlatformVerificationStatus;
  representativeReviewStatus?: PlatformVerificationStatus;
  elderEndorsementStatus?: PlatformVerificationStatus;
  notes?: string;
  reviewedBy?: string;
}) {
  const dashboard = await listPlatformAccountDashboard();
  const current = dashboard.verifications.find((entry) => entry.accountId === input.accountId);
  if (!current) throw new Error('Platform account verification record not found.');
  const updated: PlatformAccountVerificationRecord = {
    ...current,
    treasuryReviewStatus: input.treasuryReviewStatus || current.treasuryReviewStatus,
    representativeReviewStatus: input.representativeReviewStatus || current.representativeReviewStatus,
    elderEndorsementStatus: input.elderEndorsementStatus || current.elderEndorsementStatus,
    notes: input.notes ?? current.notes,
    reviewedBy: input.reviewedBy || current.reviewedBy,
    updatedAt: nowIso()
  };
  const nextStatus: PlatformVerificationStatus = [updated.treasuryReviewStatus, updated.representativeReviewStatus, updated.elderEndorsementStatus].every((entry) => entry === 'approved')
    ? 'approved'
    : [updated.treasuryReviewStatus, updated.representativeReviewStatus, updated.elderEndorsementStatus].some((entry) => entry === 'rejected')
      ? 'rejected'
      : 'pending';

  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    await supabase.from('platform_account_verifications').update({
      treasury_review_status: updated.treasuryReviewStatus,
      representative_review_status: updated.representativeReviewStatus,
      elder_endorsement_status: updated.elderEndorsementStatus,
      notes: updated.notes,
      reviewed_by: updated.reviewedBy || null,
      updated_at: updated.updatedAt
    }).eq('account_id', input.accountId);
    await supabase.from('platform_accounts').update({ verification_status: nextStatus, updated_at: updated.updatedAt }).eq('id', input.accountId);
    return { verification: updated, accountStatus: nextStatus };
  }
  const runtime = await readRuntime();
  runtime.verifications = runtime.verifications.map((entry) => entry.accountId === input.accountId ? updated : entry);
  runtime.accounts = runtime.accounts.map((entry) => entry.id === input.accountId ? { ...entry, verificationStatus: nextStatus, updatedAt: updated.updatedAt } : entry);
  await writeRuntime(runtime);
  return { verification: updated, accountStatus: nextStatus };
}

export async function upsertElderAuthority(input: {
  actorId: string;
  displayName: string;
  nation: string;
  status?: PlatformVerificationStatus;
  authorities?: string[];
  councilSeat?: string;
  notes?: string;
  approvedBy?: string;
}) {
  const dashboard = await listPlatformAccountDashboard();
  const current = dashboard.elderAuthorities.find((entry) => entry.actorId === input.actorId);
  const now = nowIso();
  const record: ElderAuthorityRecord = {
    id: current?.id || id('elderauth'),
    actorId: input.actorId,
    displayName: input.displayName,
    nation: input.nation,
    status: input.status || current?.status || 'pending',
    authorities: input.authorities || current?.authorities || [],
    councilSeat: input.councilSeat || current?.councilSeat || '',
    notes: input.notes ?? current?.notes ?? '',
    approvedBy: input.approvedBy || current?.approvedBy || '',
    createdAt: current?.createdAt || now,
    updatedAt: now
  };
  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    await supabase.from('elder_authorities').upsert({
      id: record.id,
      actor_id: record.actorId,
      display_name: record.displayName,
      nation: record.nation,
      status: record.status,
      authorities: record.authorities,
      council_seat: record.councilSeat,
      notes: record.notes,
      approved_by: record.approvedBy || null,
      created_at: record.createdAt,
      updated_at: record.updatedAt
    });
    return record;
  }
  const runtime = await readRuntime();
  const idx = runtime.elderAuthorities.findIndex((entry) => entry.actorId === record.actorId);
  if (idx >= 0) runtime.elderAuthorities[idx] = record; else runtime.elderAuthorities.unshift(record);
  await writeRuntime(runtime);
  return record;
}

export async function upsertRevenueSplitRule(input: {
  id?: string;
  ownerAccountId: string;
  offeringId: string;
  offeringLabel: string;
  pillar: string;
  ruleType: SplitRuleType;
  status?: RevenueSplitRuleRecord['status'];
  notes?: string;
  beneficiaries: Array<{
    beneficiaryType: RevenueSplitBeneficiaryRecord['beneficiaryType'];
    beneficiaryId: string;
    label: string;
    percentage: number;
    payoutTarget: string;
  }>;
  actorId: string;
}) {
  const dashboard = await listPlatformAccountDashboard();
  const current = input.id ? dashboard.revenueSplitRules.find((entry) => entry.id === input.id) : undefined;
  const now = nowIso();
  const ruleId = current?.id || input.id || id('split');
  const record: RevenueSplitRuleRecord = {
    id: ruleId,
    ownerAccountId: input.ownerAccountId,
    offeringId: input.offeringId,
    offeringLabel: input.offeringLabel,
    pillar: input.pillar,
    ruleType: input.ruleType,
    status: input.status || current?.status || 'draft',
    notes: input.notes ?? current?.notes ?? '',
    createdBy: current?.createdBy || input.actorId,
    updatedBy: input.actorId,
    createdAt: current?.createdAt || now,
    updatedAt: now,
    beneficiaries: input.beneficiaries.map((entry, index) => ({
      id: current?.beneficiaries[index]?.id || id('splitbenef'),
      splitRuleId: ruleId,
      beneficiaryType: entry.beneficiaryType,
      beneficiaryId: entry.beneficiaryId,
      label: entry.label,
      percentage: Number(entry.percentage || 0),
      payoutTarget: entry.payoutTarget
    }))
  };
  const total = record.beneficiaries.reduce((sum, entry) => sum + entry.percentage, 0);
  if (Math.round(total) !== 100) {
    throw new Error('Revenue split beneficiaries must total 100%.');
  }

  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    await supabase.from('revenue_split_rules').upsert({
      id: record.id,
      owner_account_id: record.ownerAccountId,
      offering_id: record.offeringId,
      offering_label: record.offeringLabel,
      pillar: record.pillar,
      rule_type: record.ruleType,
      status: record.status,
      notes: record.notes,
      created_by: record.createdBy,
      updated_by: record.updatedBy,
      created_at: record.createdAt,
      updated_at: record.updatedAt
    });
    await supabase.from('revenue_split_beneficiaries').delete().eq('split_rule_id', record.id);
    await supabase.from('revenue_split_beneficiaries').insert(record.beneficiaries.map((entry) => ({
      id: entry.id,
      split_rule_id: entry.splitRuleId,
      beneficiary_type: entry.beneficiaryType,
      beneficiary_id: entry.beneficiaryId,
      label: entry.label,
      percentage: entry.percentage,
      payout_target: entry.payoutTarget
    })));
    return record;
  }
  const runtime = await readRuntime();
  const idx = runtime.revenueSplitRules.findIndex((entry) => entry.id === record.id);
  if (idx >= 0) runtime.revenueSplitRules[idx] = record; else runtime.revenueSplitRules.unshift(record);
  await writeRuntime(runtime);
  return record;
}

export async function upsertPlatformAccountMember(input: {
  accountId: string;
  actorId: string;
  displayName: string;
  role: PlatformMemberRole;
  permissions?: string[];
}) {
  const dashboard = await listPlatformAccountDashboard();
  const current = dashboard.members.find(
    (entry) => entry.accountId === input.accountId && entry.actorId.trim().toLowerCase() === input.actorId.trim().toLowerCase()
  );
  const record: PlatformAccountMemberRecord = {
    id: current?.id || id('acctmem'),
    accountId: input.accountId,
    actorId: input.actorId.trim().toLowerCase(),
    displayName: input.displayName.trim() || current?.displayName || input.actorId.trim().toLowerCase(),
    role: input.role,
    permissions: (input.permissions?.length ? input.permissions : defaultPermissionsForRole(input.role)).map(String),
    joinedAt: current?.joinedAt || nowIso()
  };

  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    await supabase.from('platform_account_members').upsert({
      id: record.id,
      account_id: record.accountId,
      actor_id: record.actorId,
      display_name: record.displayName,
      role: record.role,
      permissions: record.permissions,
      joined_at: record.joinedAt
    });
    return record;
  }

  const runtime = await readRuntime();
  const idx = runtime.members.findIndex((entry) => entry.accountId === record.accountId && entry.actorId === record.actorId);
  if (idx >= 0) runtime.members[idx] = record;
  else runtime.members.unshift(record);
  await writeRuntime(runtime);
  return record;
}

export async function removePlatformAccountMember(input: {
  accountId: string;
  memberId?: string;
  actorId?: string;
}) {
  const dashboard = await listPlatformAccountDashboard();
  const current = dashboard.members.find(
    (entry) =>
      entry.accountId === input.accountId &&
      ((input.memberId && entry.id === input.memberId) ||
        (input.actorId && entry.actorId.trim().toLowerCase() === input.actorId.trim().toLowerCase()))
  );
  if (!current) throw new Error('Platform account member not found.');

  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    await supabase.from('platform_account_members').delete().eq('id', current.id);
    return current;
  }

  const runtime = await readRuntime();
  runtime.members = runtime.members.filter((entry) => entry.id !== current.id);
  await writeRuntime(runtime);
  return current;
}
