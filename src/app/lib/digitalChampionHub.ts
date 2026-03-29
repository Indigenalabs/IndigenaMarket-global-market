import { promises as fs } from 'node:fs';
import path from 'node:path';
import { createSupabaseServerClient, isSupabaseServerConfigured } from '@/app/lib/supabase/server';
import { assertRuntimePersistenceAllowed } from '@/app/lib/runtimePersistence';

export interface DigitalChampionProfileRecord {
  id: string;
  slug: string;
  displayName: string;
  region: string;
  communities: string[];
  languages: string[];
  specialties: string[];
  bio: string;
  status: 'active' | 'training' | 'needs-sponsor';
  sponsorshipGoalAmount: number;
  currentSponsoredAmount: number;
  impactSummary: string;
  avatar: string;
  heroImage: string;
  linkedAccountId: string;
}

export interface DigitalChampionSponsorshipRecord {
  id: string;
  championId: string;
  sponsorName: string;
  sponsorEmail: string;
  sponsorshipType: 'one-time' | 'monthly';
  targetType: 'champion' | 'community-program';
  targetAccountId: string;
  amount: number;
  note: string;
  status: 'pending' | 'scheduled' | 'active';
  createdAt: string;
}

export interface DigitalChampionRequestRecord {
  id: string;
  requesterName: string;
  requesterEmail: string;
  communityName: string;
  region: string;
  supportNeeded: string;
  preferredLanguage: string;
  urgency: 'low' | 'medium' | 'high';
  status: 'open' | 'reviewing' | 'assigned';
  assignedChampionId: string;
  createdAt: string;
}

export interface DigitalChampionApplicationRecord {
  id: string;
  applicantName: string;
  email: string;
  region: string;
  communityAffiliation: string;
  languages: string[];
  skills: string[];
  story: string;
  status: 'submitted' | 'reviewing' | 'approved';
  createdAt: string;
}

export interface DigitalChampionImpactLogRecord {
  id: string;
  championId: string;
  metricLabel: string;
  metricValue: string;
  detail: string;
  createdAt: string;
}

export interface DigitalChampionDashboard {
  champions: DigitalChampionProfileRecord[];
  sponsorships: DigitalChampionSponsorshipRecord[];
  requests: DigitalChampionRequestRecord[];
  applications: DigitalChampionApplicationRecord[];
  impactLogs: DigitalChampionImpactLogRecord[];
}

const RUNTIME_DIR = path.join(process.cwd(), '.runtime');
const FILE = path.join(RUNTIME_DIR, 'digital-champions.json');

function nowIso() {
  return new Date().toISOString();
}

function id(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function seedDashboard(): DigitalChampionDashboard {
  const now = nowIso();
  return {
    champions: [
      {
        id: 'champ-1',
        slug: 'talia-riverstone',
        displayName: 'Talia Riverstone',
        region: 'Northern Plains',
        communities: ['Riverstone Nation', 'Cedar Valley youth collective'],
        languages: ['English', 'Riverstone'],
        specialties: ['Seller onboarding', 'Device setup', 'Treasury literacy'],
        bio: 'Talia helps communities launch storefronts, train representatives, and use payout tools without losing cultural control.',
        status: 'active',
        sponsorshipGoalAmount: 7500,
        currentSponsoredAmount: 4200,
        impactSummary: 'Supported 37 artists, 4 community pages, and 2 language archive onboarding drives.',
        avatar: '/communities/reps/talia-riverstone.svg',
        heroImage: '/launchpad/champion-fund.svg',
        linkedAccountId: 'acct-community-riverstone'
      },
      {
        id: 'champ-2',
        slug: 'marra-ngarra',
        displayName: 'Marra Ngarra',
        region: 'Central Desert',
        communities: ['Ngarra Learning Circle'],
        languages: ['English', 'Ngarra'],
        specialties: ['Archive onboarding', 'Course setup', 'Story capture'],
        bio: 'Marra coordinates digital education rollouts, uploads community stories, and trains local stewards on archive permissions.',
        status: 'needs-sponsor',
        sponsorshipGoalAmount: 9800,
        currentSponsoredAmount: 2500,
        impactSummary: 'Helped launch 18 story uploads and two school-focused account operations pilots.',
        avatar: '/communities/reps/marra-ngarra.svg',
        heroImage: '/communities/ngarra-banner.svg',
        linkedAccountId: 'acct-tribe-ngarra'
      }
    ],
    sponsorships: [
      {
        id: 'champspon-1',
        championId: 'champ-1',
        sponsorName: 'North River Co-op',
        sponsorEmail: 'funds@northriver.example',
        sponsorshipType: 'monthly',
        targetType: 'champion',
        targetAccountId: 'acct-community-riverstone',
        amount: 1200,
        note: 'Funds monthly regional travel and onboarding office hours.',
        status: 'active',
        createdAt: now
      },
      {
        id: 'champspon-2',
        championId: 'champ-2',
        sponsorName: 'Education Futures Grant',
        sponsorEmail: 'grant@futures.example',
        sponsorshipType: 'one-time',
        targetType: 'community-program',
        targetAccountId: 'acct-tribe-ngarra',
        amount: 2500,
        note: 'Supports school archive orientation and media kits.',
        status: 'scheduled',
        createdAt: now
      }
    ],
    requests: [
      {
        id: 'champreq-1',
        requesterName: 'Leah Morningstar',
        requesterEmail: 'leah@example.com',
        communityName: 'Riverstone Youth Arts House',
        region: 'Northern Plains',
        supportNeeded: 'Need help setting up a community page, roles, and first three listings.',
        preferredLanguage: 'English',
        urgency: 'high',
        status: 'assigned',
        assignedChampionId: 'champ-1',
        createdAt: now
      },
      {
        id: 'champreq-2',
        requesterName: 'Jora Ngarra',
        requesterEmail: 'jora@example.com',
        communityName: 'Ngarra School Council',
        region: 'Central Desert',
        supportNeeded: 'Need archive onboarding and story upload training for three teachers.',
        preferredLanguage: 'Ngarra',
        urgency: 'medium',
        status: 'open',
        assignedChampionId: '',
        createdAt: now
      }
    ],
    applications: [
      {
        id: 'champapp-1',
        applicantName: 'Mika Three Rivers',
        email: 'mika@example.com',
        region: 'Coastal Northwest',
        communityAffiliation: 'Three Rivers Makers Circle',
        languages: ['English', 'Hulquminum'],
        skills: ['Creator Hub onboarding', 'mobile training', 'story capture'],
        story: 'I help elders and youth upload stories, set up sales pages, and keep the training patient and local.',
        status: 'reviewing',
        createdAt: now
      }
    ],
    impactLogs: [
      {
        id: 'champimpact-1',
        championId: 'champ-1',
        metricLabel: 'Artist onboarding',
        metricValue: '37 creators',
        detail: 'Completed wallet, payouts, and first-listing setup.',
        createdAt: now
      },
      {
        id: 'champimpact-2',
        championId: 'champ-2',
        metricLabel: 'Story uploads',
        metricValue: '18 story kits',
        detail: 'Helped schools and language circles capture community story packages.',
        createdAt: now
      }
    ]
  };
}

async function ensureDir() {
  assertRuntimePersistenceAllowed('digital champion hub');
  await fs.mkdir(RUNTIME_DIR, { recursive: true });
}

async function readRuntime(): Promise<DigitalChampionDashboard> {
  await ensureDir();
  const raw = await fs.readFile(FILE, 'utf8').catch(() => '');
  if (!raw) {
    const seeded = seedDashboard();
    await writeRuntime(seeded);
    return seeded;
  }
  try {
    const parsed = JSON.parse(raw) as Partial<DigitalChampionDashboard>;
    return {
      champions: Array.isArray(parsed.champions) ? (parsed.champions as DigitalChampionProfileRecord[]) : [],
      sponsorships: Array.isArray(parsed.sponsorships) ? (parsed.sponsorships as DigitalChampionSponsorshipRecord[]) : [],
      requests: Array.isArray(parsed.requests) ? (parsed.requests as DigitalChampionRequestRecord[]) : [],
      applications: Array.isArray(parsed.applications) ? (parsed.applications as DigitalChampionApplicationRecord[]) : [],
      impactLogs: Array.isArray(parsed.impactLogs) ? (parsed.impactLogs as DigitalChampionImpactLogRecord[]) : []
    };
  } catch {
    const seeded = seedDashboard();
    await writeRuntime(seeded);
    return seeded;
  }
}

async function writeRuntime(data: DigitalChampionDashboard) {
  await ensureDir();
  await fs.writeFile(FILE, JSON.stringify(data, null, 2), 'utf8');
}

export async function listDigitalChampionDashboard(): Promise<DigitalChampionDashboard> {
  if (!isSupabaseServerConfigured()) return readRuntime();
  const supabase = createSupabaseServerClient();
  const [champions, sponsorships, requests, applications, impactLogs] = await Promise.all([
    supabase.from('digital_champion_profiles').select('*').order('display_name'),
    supabase.from('digital_champion_sponsorships').select('*').order('created_at', { ascending: false }),
    supabase.from('digital_champion_requests').select('*').order('created_at', { ascending: false }),
    supabase.from('digital_champion_applications').select('*').order('created_at', { ascending: false }),
    supabase.from('digital_champion_impact_logs').select('*').order('created_at', { ascending: false })
  ]);
  return {
    champions: ((champions.data || []) as any[]).map((row) => ({
      id: String(row.id || ''),
      slug: String(row.slug || ''),
      displayName: String(row.display_name || ''),
      region: String(row.region || ''),
      communities: Array.isArray(row.communities) ? row.communities.map(String) : [],
      languages: Array.isArray(row.languages) ? row.languages.map(String) : [],
      specialties: Array.isArray(row.specialties) ? row.specialties.map(String) : [],
      bio: String(row.bio || ''),
      status: String(row.status || 'active') as DigitalChampionProfileRecord['status'],
      sponsorshipGoalAmount: Number(row.sponsorship_goal_amount || 0),
      currentSponsoredAmount: Number(row.current_sponsored_amount || 0),
      impactSummary: String(row.impact_summary || ''),
      avatar: String(row.avatar || ''),
      heroImage: String(row.hero_image || ''),
      linkedAccountId: String(row.linked_account_id || '')
    })),
    sponsorships: ((sponsorships.data || []) as any[]).map((row) => ({
      id: String(row.id || ''),
      championId: String(row.champion_id || ''),
      sponsorName: String(row.sponsor_name || ''),
      sponsorEmail: String(row.sponsor_email || ''),
      sponsorshipType: String(row.sponsorship_type || 'one-time') as DigitalChampionSponsorshipRecord['sponsorshipType'],
      targetType: String(row.target_type || 'champion') as DigitalChampionSponsorshipRecord['targetType'],
      targetAccountId: String(row.target_account_id || ''),
      amount: Number(row.amount || 0),
      note: String(row.note || ''),
      status: String(row.status || 'pending') as DigitalChampionSponsorshipRecord['status'],
      createdAt: String(row.created_at || '')
    })),
    requests: ((requests.data || []) as any[]).map((row) => ({
      id: String(row.id || ''),
      requesterName: String(row.requester_name || ''),
      requesterEmail: String(row.requester_email || ''),
      communityName: String(row.community_name || ''),
      region: String(row.region || ''),
      supportNeeded: String(row.support_needed || ''),
      preferredLanguage: String(row.preferred_language || ''),
      urgency: String(row.urgency || 'low') as DigitalChampionRequestRecord['urgency'],
      status: String(row.status || 'open') as DigitalChampionRequestRecord['status'],
      assignedChampionId: String(row.assigned_champion_id || ''),
      createdAt: String(row.created_at || '')
    })),
    applications: ((applications.data || []) as any[]).map((row) => ({
      id: String(row.id || ''),
      applicantName: String(row.applicant_name || ''),
      email: String(row.email || ''),
      region: String(row.region || ''),
      communityAffiliation: String(row.community_affiliation || ''),
      languages: Array.isArray(row.languages) ? row.languages.map(String) : [],
      skills: Array.isArray(row.skills) ? row.skills.map(String) : [],
      story: String(row.story || ''),
      status: String(row.status || 'submitted') as DigitalChampionApplicationRecord['status'],
      createdAt: String(row.created_at || '')
    })),
    impactLogs: ((impactLogs.data || []) as any[]).map((row) => ({
      id: String(row.id || ''),
      championId: String(row.champion_id || ''),
      metricLabel: String(row.metric_label || ''),
      metricValue: String(row.metric_value || ''),
      detail: String(row.detail || ''),
      createdAt: String(row.created_at || '')
    }))
  };
}

export async function listDigitalChampions() {
  return (await listDigitalChampionDashboard()).champions;
}

export async function getDigitalChampionBySlug(slug: string) {
  const dashboard = await listDigitalChampionDashboard();
  const champion = dashboard.champions.find((entry) => entry.slug === slug) || null;
  if (!champion) return null;
  return {
    champion,
    sponsorships: dashboard.sponsorships.filter((entry) => entry.championId === champion.id),
    impactLogs: dashboard.impactLogs.filter((entry) => entry.championId === champion.id),
    requests: dashboard.requests.filter((entry) => entry.assignedChampionId === champion.id)
  };
}

export async function createDigitalChampionApplication(input: {
  applicantName: string;
  email: string;
  region: string;
  communityAffiliation: string;
  languages: string[];
  skills: string[];
  story: string;
}) {
  const record: DigitalChampionApplicationRecord = {
    id: id('champapp'),
    applicantName: input.applicantName,
    email: input.email,
    region: input.region,
    communityAffiliation: input.communityAffiliation,
    languages: input.languages,
    skills: input.skills,
    story: input.story,
    status: 'submitted',
    createdAt: nowIso()
  };
  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    await supabase.from('digital_champion_applications').insert({
      id: record.id,
      applicant_name: record.applicantName,
      email: record.email,
      region: record.region,
      community_affiliation: record.communityAffiliation,
      languages: record.languages,
      skills: record.skills,
      story: record.story,
      status: record.status,
      created_at: record.createdAt
    });
    return record;
  }
  const runtime = await readRuntime();
  runtime.applications.unshift(record);
  await writeRuntime(runtime);
  return record;
}

export async function createDigitalChampionRequest(input: {
  requesterName: string;
  requesterEmail: string;
  communityName: string;
  region: string;
  supportNeeded: string;
  preferredLanguage: string;
  urgency: 'low' | 'medium' | 'high';
}) {
  const record: DigitalChampionRequestRecord = {
    id: id('champreq'),
    requesterName: input.requesterName,
    requesterEmail: input.requesterEmail,
    communityName: input.communityName,
    region: input.region,
    supportNeeded: input.supportNeeded,
    preferredLanguage: input.preferredLanguage,
    urgency: input.urgency,
    status: 'open',
    assignedChampionId: '',
    createdAt: nowIso()
  };
  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    await supabase.from('digital_champion_requests').insert({
      id: record.id,
      requester_name: record.requesterName,
      requester_email: record.requesterEmail,
      community_name: record.communityName,
      region: record.region,
      support_needed: record.supportNeeded,
      preferred_language: record.preferredLanguage,
      urgency: record.urgency,
      status: record.status,
      assigned_champion_id: null,
      created_at: record.createdAt
    });
    return record;
  }
  const runtime = await readRuntime();
  runtime.requests.unshift(record);
  await writeRuntime(runtime);
  return record;
}

export async function createDigitalChampionSponsorship(input: {
  championId: string;
  sponsorName: string;
  sponsorEmail: string;
  sponsorshipType: 'one-time' | 'monthly';
  targetType: 'champion' | 'community-program';
  targetAccountId: string;
  amount: number;
  note: string;
}) {
  const record: DigitalChampionSponsorshipRecord = {
    id: id('champspon'),
    championId: input.championId,
    sponsorName: input.sponsorName,
    sponsorEmail: input.sponsorEmail,
    sponsorshipType: input.sponsorshipType,
    targetType: input.targetType,
    targetAccountId: input.targetAccountId,
    amount: input.amount,
    note: input.note,
    status: input.sponsorshipType === 'monthly' ? 'active' : 'scheduled',
    createdAt: nowIso()
  };
  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    await supabase.from('digital_champion_sponsorships').insert({
      id: record.id,
      champion_id: record.championId,
      sponsor_name: record.sponsorName,
      sponsor_email: record.sponsorEmail,
      sponsorship_type: record.sponsorshipType,
      target_type: record.targetType,
      target_account_id: record.targetAccountId,
      amount: record.amount,
      note: record.note,
      status: record.status,
      created_at: record.createdAt
    });
    return record;
  }
  const runtime = await readRuntime();
  runtime.sponsorships.unshift(record);
  runtime.champions = runtime.champions.map((entry) =>
    entry.id === record.championId
      ? { ...entry, currentSponsoredAmount: entry.currentSponsoredAmount + record.amount }
      : entry
  );
  await writeRuntime(runtime);
  return record;
}
