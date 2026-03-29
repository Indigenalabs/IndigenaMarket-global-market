import { createSupabaseServerClient, isSupabaseServerConfigured } from '@/app/lib/supabase/server';
import {
  attorneys as fallbackAttorneys,
  campaigns as fallbackCampaigns,
  legalStats as fallbackStats,
  resources as fallbackResources,
  victories as fallbackVictories,
  type Attorney,
  type Campaign,
  type Resource,
  type Victory
} from '@/app/advocacy-legal/data/pillar9Data';

type DbRow = Record<string, unknown>;

export type AdvocacyPublicData = {
  attorneys: Attorney[];
  campaigns: Campaign[];
  resources: Resource[];
  victories: Victory[];
  stats: {
    activeProfessionals: number;
    liveCampaigns: number;
    resources: number;
    emergencyFundUsd: number;
  };
};

function safeString(value: unknown, fallback = '') {
  return typeof value === 'string' && value.trim() ? value : fallback;
}

function safeNumber(value: unknown, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function safeBoolean(value: unknown, fallback = false) {
  return typeof value === 'boolean' ? value : fallback;
}

function metadata(row: DbRow) {
  const value = row.metadata;
  return value && typeof value === 'object' ? (value as DbRow) : {};
}

function mapAttorney(row: DbRow): Attorney {
  const meta = metadata(row);
  return {
    id: safeString(row.id, crypto.randomUUID()),
    name: safeString(meta.name, safeString(row.title, 'Indigenous Rights Attorney')),
    nation: safeString(meta.nation, 'Indigenous Nation'),
    specialty: safeString(meta.specialty, safeString(row.category, 'Indigenous Rights')),
    region: safeString(meta.region, 'Global'),
    rateLabel: safeString(meta.rateLabel, '$0/hr'),
    proBono: safeBoolean(meta.proBono, false),
    verified: (safeString(meta.verified, 'verified') as Attorney['verified']),
    image: safeString(meta.image, 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&h=800&fit=crop'),
    bio: safeString(meta.bio, 'Legal advocate profile.')
  };
}

function mapCampaign(row: DbRow): Campaign {
  const meta = metadata(row);
  return {
    id: safeString(row.id, crypto.randomUUID()),
    title: safeString(row.title, 'Legal Defense Campaign'),
    type: (safeString(meta.type, 'legal-defense') as Campaign['type']),
    region: safeString(meta.region, 'Global'),
    raised: safeNumber(meta.raised, 0),
    target: safeNumber(meta.target, 1),
    supporters: safeNumber(meta.supporters, 0),
    urgent: safeBoolean(meta.urgent, false),
    image: safeString(meta.image, 'https://images.unsplash.com/photo-1460411794035-42aac080490a?w=1400&h=900&fit=crop'),
    summary: safeString(meta.summary, 'Campaign summary.')
  };
}

function mapResource(row: DbRow): Resource {
  const meta = metadata(row);
  return {
    id: safeString(row.id, crypto.randomUUID()),
    title: safeString(row.title, 'Legal Resource'),
    kind: (safeString(meta.kind, 'guide') as Resource['kind']),
    audience: safeString(meta.audience, 'Community Members'),
    language: safeString(meta.language, 'English'),
    image: safeString(meta.image, 'https://images.unsplash.com/photo-1453945619913-79ec89a82c51?w=1200&h=800&fit=crop'),
    summary: safeString(meta.summary, 'Rights resource summary.')
  };
}

function mapVictory(row: DbRow): Victory {
  const meta = metadata(row);
  return {
    id: safeString(row.id, crypto.randomUUID()),
    title: safeString(row.title, 'Legal Victory'),
    impact: safeString(meta.impact, 'Community impact achieved'),
    year: safeString(meta.year, new Date().getFullYear().toString()),
    image: safeString(meta.image, 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=1200&h=800&fit=crop'),
    summary: safeString(meta.summary, 'Victory summary.')
  };
}

function fallbackData(): AdvocacyPublicData {
  return {
    attorneys: fallbackAttorneys,
    campaigns: fallbackCampaigns,
    resources: fallbackResources,
    victories: fallbackVictories,
    stats: fallbackStats
  };
}

async function loadEntities(entityType: string) {
  if (!isSupabaseServerConfigured()) return [];
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('advocacy_entities')
    .select('*')
    .eq('entity_type', entityType)
    .eq('status', 'active')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as DbRow[];
}

async function loadRows(table: string) {
  if (!isSupabaseServerConfigured()) return [];
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .or('status.eq.active,status.eq.published')
    .order('featured', { ascending: false })
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as DbRow[];
}

function mapAttorneyRow(row: DbRow): Attorney {
  return {
    id: safeString(row.id, crypto.randomUUID()),
    name: safeString(row.name, 'Indigenous Rights Attorney'),
    nation: safeString(row.nation, 'Indigenous Nation'),
    specialty: safeString(row.specialty, 'Indigenous Rights'),
    region: safeString(row.region, 'Global'),
    rateLabel: safeString(row.rate_label, '$0/hr'),
    proBono: safeBoolean(row.pro_bono, false),
    verified: (safeString(row.verification_level, 'verified') as Attorney['verified']),
    image: safeString(row.image, 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&h=800&fit=crop'),
    bio: safeString(row.bio, 'Legal advocate profile.')
  };
}

function mapCampaignRow(row: DbRow): Campaign {
  return {
    id: safeString(row.id, crypto.randomUUID()),
    title: safeString(row.title, 'Legal Defense Campaign'),
    type: (safeString(row.campaign_type, 'legal-defense') as Campaign['type']),
    region: safeString(row.region, 'Global'),
    raised: safeNumber(row.raised_amount, 0),
    target: safeNumber(row.target_amount, 1),
    supporters: safeNumber(row.supporters_count, 0),
    urgent: safeBoolean(row.urgent, false),
    image: safeString(row.image, 'https://images.unsplash.com/photo-1460411794035-42aac080490a?w=1400&h=900&fit=crop'),
    summary: safeString(row.summary, 'Campaign summary.')
  };
}

function mapResourceRow(row: DbRow): Resource {
  return {
    id: safeString(row.id, crypto.randomUUID()),
    title: safeString(row.title, 'Legal Resource'),
    kind: (safeString(row.resource_kind, 'guide') as Resource['kind']),
    audience: safeString(row.audience, 'Community Members'),
    language: safeString(row.language, 'English'),
    image: safeString(row.image, 'https://images.unsplash.com/photo-1453945619913-79ec89a82c51?w=1200&h=800&fit=crop'),
    summary: safeString(row.summary, 'Rights resource summary.')
  };
}

function mapVictoryRow(row: DbRow): Victory {
  return {
    id: safeString(row.id, crypto.randomUUID()),
    title: safeString(row.title, 'Legal Victory'),
    impact: safeString(row.impact, 'Community impact achieved'),
    year: safeString(row.year, new Date().getFullYear().toString()),
    image: safeString(row.image, 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=1200&h=800&fit=crop'),
    summary: safeString(row.summary, 'Victory summary.')
  };
}

export async function getAdvocacyPublicData(): Promise<AdvocacyPublicData> {
  if (!isSupabaseServerConfigured()) return fallbackData();

  try {
    const [dedicatedAttorneys, dedicatedCampaigns, dedicatedResources, dedicatedVictories] = await Promise.all([
      loadRows('advocacy_attorneys'),
      loadRows('advocacy_campaigns'),
      loadRows('advocacy_resources'),
      loadRows('advocacy_victories')
    ]);

    const hasDedicated = dedicatedAttorneys.length || dedicatedCampaigns.length || dedicatedResources.length || dedicatedVictories.length;
    const [entityAttorneys, entityCampaigns, entityResources, entityVictories] = hasDedicated
      ? [[], [], [], []]
      : await Promise.all([
          loadEntities('attorney'),
          loadEntities('campaign'),
          loadEntities('resource'),
          loadEntities('victory')
        ]);

    const attorneys = (hasDedicated ? dedicatedAttorneys.map(mapAttorneyRow) : entityAttorneys.map(mapAttorney));
    const campaigns = (hasDedicated ? dedicatedCampaigns.map(mapCampaignRow) : entityCampaigns.map(mapCampaign));
    const resources = (hasDedicated ? dedicatedResources.map(mapResourceRow) : entityResources.map(mapResource));
    const victories = (hasDedicated ? dedicatedVictories.map(mapVictoryRow) : entityVictories.map(mapVictory));

    if (!attorneys.length && !campaigns.length && !resources.length && !victories.length) {
      return fallbackData();
    }

    return {
      attorneys: attorneys.length ? attorneys : fallbackAttorneys,
      campaigns: campaigns.length ? campaigns : fallbackCampaigns,
      resources: resources.length ? resources : fallbackResources,
      victories: victories.length ? victories : fallbackVictories,
      stats: {
        activeProfessionals: attorneys.length || fallbackStats.activeProfessionals,
        liveCampaigns: campaigns.length || fallbackStats.liveCampaigns,
        resources: resources.length || fallbackStats.resources,
        emergencyFundUsd: campaigns.reduce((sum, row) => sum + row.raised, 0) || fallbackStats.emergencyFundUsd
      }
    };
  } catch {
    return fallbackData();
  }
}

export async function getAdvocacyAttorneyById(id: string) {
  const data = await getAdvocacyPublicData();
  return data.attorneys.find((item) => item.id === id) ?? null;
}

export async function getAdvocacyCampaignById(id: string) {
  const data = await getAdvocacyPublicData();
  return data.campaigns.find((item) => item.id === id) ?? null;
}

export async function getAdvocacyResourceById(id: string) {
  const data = await getAdvocacyPublicData();
  return data.resources.find((item) => item.id === id) ?? null;
}

export async function getAdvocacyVictoryById(id: string) {
  const data = await getAdvocacyPublicData();
  return data.victories.find((item) => item.id === id) ?? null;
}
