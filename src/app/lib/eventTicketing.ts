import { promises as fs } from 'node:fs';
import path from 'node:path';
import { createSupabaseServerClient, isSupabaseServerConfigured } from '@/app/lib/supabase/server';
import { assertRuntimePersistenceAllowed } from '@/app/lib/runtimePersistence';

export interface CommunityEventRecord {
  id: string;
  title: string;
  description: string;
  hostName: string;
  hostAvatar: string;
  createdByActorId: string;
  eventType: 'workshop' | 'exhibition' | 'market' | 'festival' | 'livestream';
  eventMode: 'virtual' | 'in-person';
  location: string;
  startsAt: string;
  endsAt: string | null;
  basePrice: number;
  currency: string;
  capacity: number | null;
  livestreamEnabled: boolean;
  vipAddonPrice: number;
  image: string;
  sponsor: string;
  featured: boolean;
  status: 'draft' | 'published' | 'sold-out' | 'cancelled' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface CommunityEventRegistrationRecord {
  id: string;
  eventId: string;
  attendeeName: string;
  attendeeEmail: string;
  tier: 'general' | 'vip' | 'livestream';
  quantity: number;
  subtotal: number;
  platformFee: number;
  hostPayout: number;
  currency: string;
  status: 'registered' | 'attended' | 'refunded' | 'cancelled';
  createdAt: string;
}

const seedEvents: CommunityEventRecord[] = [
  {
    id: 'event-1',
    title: 'Live Beadwork Workshop',
    description: 'Join master artisan Maria Begay for a live virtual workshop on traditional Navajo beadwork techniques.',
    hostName: 'Maria Begay',
    hostAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    createdByActorId: 'host-maria-begay',
    eventType: 'workshop',
    eventMode: 'virtual',
    location: 'Virtual',
    startsAt: '2026-04-12T14:00:00.000Z',
    endsAt: '2026-04-12T16:00:00.000Z',
    basePrice: 25,
    currency: 'USD',
    capacity: 500,
    livestreamEnabled: true,
    vipAddonPrice: 20,
    image: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=600&h=300&fit=crop',
    sponsor: 'Heritage Arts Foundation',
    featured: true,
    status: 'published',
    createdAt: '2026-03-01T00:00:00.000Z',
    updatedAt: '2026-03-01T00:00:00.000Z'
  },
  {
    id: 'event-2',
    title: 'Indigenous Art Market NYC',
    description: 'Annual gathering of Indigenous artists showcasing traditional and contemporary works.',
    hostName: 'Indigena Collective',
    hostAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    createdByActorId: 'host-indigena-collective',
    eventType: 'market',
    eventMode: 'in-person',
    location: 'New York, NY',
    startsAt: '2026-04-22T10:00:00.000Z',
    endsAt: '2026-04-24T18:00:00.000Z',
    basePrice: 0,
    currency: 'USD',
    capacity: 1200,
    livestreamEnabled: false,
    vipAddonPrice: 45,
    image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=600&h=300&fit=crop',
    sponsor: '',
    featured: true,
    status: 'published',
    createdAt: '2026-03-01T00:00:00.000Z',
    updatedAt: '2026-03-01T00:00:00.000Z'
  },
  {
    id: 'event-3',
    title: 'Digital Art Masterclass',
    description: 'Learn to blend traditional Indigenous art with modern digital techniques.',
    hostName: 'ThunderVoice',
    hostAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    createdByActorId: 'host-thundervoice',
    eventType: 'livestream',
    eventMode: 'virtual',
    location: 'Livestream',
    startsAt: '2026-04-18T19:00:00.000Z',
    endsAt: '2026-04-18T21:00:00.000Z',
    basePrice: 0,
    currency: 'USD',
    capacity: 1000,
    livestreamEnabled: true,
    vipAddonPrice: 15,
    image: 'https://images.unsplash.com/photo-1549887534-1541e9326642?w=600&h=300&fit=crop',
    sponsor: '',
    featured: false,
    status: 'published',
    createdAt: '2026-03-01T00:00:00.000Z',
    updatedAt: '2026-03-01T00:00:00.000Z'
  },
  {
    id: 'coastal-festival',
    title: 'Coastal Nations Festival',
    description: 'Virtual art festival featuring Indigenous artists, live talks, and collection drops from across the coast.',
    hostName: 'Pacific Arts Network',
    hostAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    createdByActorId: 'host-pacific-arts-network',
    eventType: 'festival',
    eventMode: 'virtual',
    location: 'Virtual Festival Stage',
    startsAt: '2026-04-20T08:00:00.000Z',
    endsAt: '2026-04-22T18:00:00.000Z',
    basePrice: 0,
    currency: 'USD',
    capacity: 2500,
    livestreamEnabled: true,
    vipAddonPrice: 35,
    image: 'https://images.unsplash.com/photo-1549887534-1541e9326642?w=600&h=300&fit=crop',
    sponsor: 'Pacific Arts Network',
    featured: true,
    status: 'published',
    createdAt: '2026-03-05T00:00:00.000Z',
    updatedAt: '2026-03-05T00:00:00.000Z'
  }
];

const RUNTIME_DIR = path.join(process.cwd(), '.runtime');
const EVENTS_FILE = path.join(RUNTIME_DIR, 'community-events.json');
const REGISTRATIONS_FILE = path.join(RUNTIME_DIR, 'community-event-registrations.json');

async function ensureRuntimeDir() {
  assertRuntimePersistenceAllowed('event ticketing');
  await fs.mkdir(RUNTIME_DIR, { recursive: true });
}

async function readJson<T>(file: string, fallback: T): Promise<T> {
  await ensureRuntimeDir();
  const raw = await fs.readFile(file, 'utf8').catch(() => '');
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJson(file: string, value: unknown) {
  await ensureRuntimeDir();
  await fs.writeFile(file, JSON.stringify(value, null, 2), 'utf8');
}

function getRegistrationQuote(event: CommunityEventRecord, tier: CommunityEventRegistrationRecord['tier'], quantity: number) {
  const ticketPrice = tier === 'vip' ? event.basePrice + event.vipAddonPrice : tier === 'livestream' ? Math.max(event.basePrice, 10) : event.basePrice;
  const subtotal = ticketPrice * quantity;
  const platformFeeRate = event.eventType === 'livestream' ? 0.15 : event.eventType === 'festival' ? 0.1 : event.eventType === 'workshop' ? 0.1 : 0.08;
  const platformFee = Math.round(subtotal * platformFeeRate * 100) / 100;
  const hostPayout = Math.max(subtotal - platformFee, 0);
  return { subtotal, platformFee, hostPayout };
}

function mapEventRow(row: Record<string, unknown>): CommunityEventRecord {
  return {
    id: String(row.id || ''),
    title: String(row.title || ''),
    description: String(row.description || ''),
    hostName: String(row.host_name || ''),
    hostAvatar: String(row.host_avatar || ''),
    createdByActorId: String(row.created_by_actor_id || ''),
    eventType: String(row.event_type || 'workshop') as CommunityEventRecord['eventType'],
    eventMode: String(row.event_mode || 'virtual') as CommunityEventRecord['eventMode'],
    location: String(row.location || ''),
    startsAt: String(row.starts_at || new Date().toISOString()),
    endsAt: row.ends_at ? String(row.ends_at) : null,
    basePrice: Number(row.base_price || 0),
    currency: String(row.currency || 'USD'),
    capacity: row.capacity === null ? null : Number(row.capacity),
    livestreamEnabled: Boolean(row.livestream_enabled),
    vipAddonPrice: Number(row.vip_addon_price || 0),
    image: String(row.image || ''),
    sponsor: String(row.sponsor || ''),
    featured: Boolean(row.featured),
    status: String(row.status || 'draft') as CommunityEventRecord['status'],
    createdAt: String(row.created_at || new Date().toISOString()),
    updatedAt: String(row.updated_at || row.created_at || new Date().toISOString())
  };
}

function mapRegistrationRow(row: Record<string, unknown>): CommunityEventRegistrationRecord {
  return {
    id: String(row.id),
    eventId: String(row.event_id),
    attendeeName: String(row.attendee_name),
    attendeeEmail: String(row.attendee_email),
    tier: String(row.tier) as CommunityEventRegistrationRecord['tier'],
    quantity: Number(row.quantity || 1),
    subtotal: Number(row.subtotal || 0),
    platformFee: Number(row.platform_fee || 0),
    hostPayout: Number(row.host_payout || 0),
    currency: String(row.currency || 'USD'),
    status: String(row.status || 'registered') as CommunityEventRegistrationRecord['status'],
    createdAt: String(row.created_at || new Date().toISOString())
  };
}

export async function listCommunityEvents(options?: { includeDrafts?: boolean }) {
  const includeDrafts = Boolean(options?.includeDrafts);
  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    let query = supabase.from('community_events').select('*').order('starts_at', { ascending: true });
    if (!includeDrafts) query = query.in('status', ['published', 'sold-out', 'completed']);
    const { data, error } = await query;
    if (!error && data) return data.map((row) => mapEventRow(row as Record<string, unknown>));
  }

  const runtime = await readJson<CommunityEventRecord[]>(EVENTS_FILE, []);
  const merged = new Map(seedEvents.map((entry) => [entry.id, entry]));
  for (const entry of runtime) merged.set(entry.id, entry);
  const events = [...merged.values()];
  if (runtime.length === 0 || events.length !== runtime.length) {
    await writeJson(EVENTS_FILE, events);
  }
  return includeDrafts ? events : events.filter((entry) => ['published', 'sold-out', 'completed'].includes(entry.status));
}

export async function getCommunityEventById(id: string, options?: { includeDrafts?: boolean }) {
  const events = await listCommunityEvents({ includeDrafts: options?.includeDrafts ?? true });
  return events.find((entry) => entry.id === id) || null;
}

export async function createCommunityEvent(input: {
  title: string;
  description: string;
  hostName: string;
  hostAvatar?: string;
  createdByActorId?: string;
  eventType: CommunityEventRecord['eventType'];
  eventMode: CommunityEventRecord['eventMode'];
  location: string;
  startsAt: string;
  endsAt?: string | null;
  basePrice?: number;
  currency?: string;
  capacity?: number | null;
  livestreamEnabled?: boolean;
  vipAddonPrice?: number;
  image?: string;
  sponsor?: string;
  featured?: boolean;
}) {
  const now = new Date().toISOString();
  const record: CommunityEventRecord = {
    id: `event-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: input.title,
    description: input.description,
    hostName: input.hostName,
    hostAvatar: input.hostAvatar || '',
    createdByActorId: input.createdByActorId || '',
    eventType: input.eventType,
    eventMode: input.eventMode,
    location: input.location,
    startsAt: input.startsAt,
    endsAt: input.endsAt || null,
    basePrice: Number(input.basePrice || 0),
    currency: input.currency || 'USD',
    capacity: input.capacity ?? null,
    livestreamEnabled: Boolean(input.livestreamEnabled),
    vipAddonPrice: Number(input.vipAddonPrice || 0),
    image: input.image || '',
    sponsor: input.sponsor || '',
    featured: Boolean(input.featured),
    status: 'draft',
    createdAt: now,
    updatedAt: now
  };

  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    await supabase.from('community_events').insert({
      id: record.id,
      title: record.title,
      description: record.description,
      host_name: record.hostName,
      host_avatar: record.hostAvatar,
      created_by_actor_id: record.createdByActorId,
      event_type: record.eventType,
      event_mode: record.eventMode,
      location: record.location,
      starts_at: record.startsAt,
      ends_at: record.endsAt,
      base_price: record.basePrice,
      currency: record.currency,
      capacity: record.capacity,
      livestream_enabled: record.livestreamEnabled,
      vip_addon_price: record.vipAddonPrice,
      image: record.image,
      sponsor: record.sponsor,
      featured: record.featured,
      status: record.status,
      created_at: record.createdAt,
      updated_at: record.updatedAt
    });
    return record;
  }

  const events = await readJson<CommunityEventRecord[]>(EVENTS_FILE, []);
  const next = events.length === 0 ? [...seedEvents, record] : [...events, record];
  await writeJson(EVENTS_FILE, next);
  return record;
}

export async function updateCommunityEvent(input: {
  id: string;
  status?: CommunityEventRecord['status'];
  featured?: boolean;
  sponsor?: string;
}) {
  const events = await listCommunityEvents({ includeDrafts: true });
  const current = events.find((entry) => entry.id === input.id);
  if (!current) throw new Error('Event not found.');
  const updated: CommunityEventRecord = {
    ...current,
    status: input.status ?? current.status,
    featured: input.featured ?? current.featured,
    sponsor: input.sponsor ?? current.sponsor,
    updatedAt: new Date().toISOString()
  };

  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    const { error } = await supabase
      .from('community_events')
      .update({ status: updated.status, featured: updated.featured, sponsor: updated.sponsor, updated_at: updated.updatedAt })
      .eq('id', input.id);
    if (error) throw new Error(error.message);
    return updated;
  }

  const next = events.map((entry) => (entry.id === input.id ? updated : entry));
  await writeJson(EVENTS_FILE, next);
  return updated;
}

export async function registerForCommunityEvent(input: {
  eventId: string;
  attendeeName: string;
  attendeeEmail: string;
  tier: CommunityEventRegistrationRecord['tier'];
  quantity: number;
}) {
  const event = await getCommunityEventById(input.eventId, { includeDrafts: true });
  if (!event) throw new Error('Event not found.');
  if (event.status !== 'published' && event.status !== 'sold-out') throw new Error('Event is not open for registration.');
  const quote = getRegistrationQuote(event, input.tier, input.quantity);
  const record: CommunityEventRegistrationRecord = {
    id: `evtreg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    eventId: input.eventId,
    attendeeName: input.attendeeName,
    attendeeEmail: input.attendeeEmail,
    tier: input.tier,
    quantity: input.quantity,
    subtotal: quote.subtotal,
    platformFee: quote.platformFee,
    hostPayout: quote.hostPayout,
    currency: event.currency,
    status: 'registered',
    createdAt: new Date().toISOString()
  };

  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    await supabase.from('community_event_registrations').insert({
      id: record.id,
      event_id: record.eventId,
      attendee_name: record.attendeeName,
      attendee_email: record.attendeeEmail,
      tier: record.tier,
      quantity: record.quantity,
      subtotal: record.subtotal,
      platform_fee: record.platformFee,
      host_payout: record.hostPayout,
      currency: record.currency,
      status: record.status,
      created_at: record.createdAt
    });
    return { event, registration: record };
  }

  const registrations = await readJson<CommunityEventRegistrationRecord[]>(REGISTRATIONS_FILE, []);
  registrations.unshift(record);
  await writeJson(REGISTRATIONS_FILE, registrations);
  return { event, registration: record };
}

export async function updateCommunityEventRegistration(input: {
  id: string;
  status: CommunityEventRegistrationRecord['status'];
}) {
  const registrations = await listCommunityEventRegistrations();
  const current = registrations.find((entry) => entry.id === input.id);
  if (!current) throw new Error('Registration not found.');
  const updated: CommunityEventRegistrationRecord = { ...current, status: input.status };

  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    const { error } = await supabase.from('community_event_registrations').update({ status: updated.status }).eq('id', input.id);
    if (error) throw new Error(error.message);
    return updated;
  }

  const next = registrations.map((entry) => (entry.id === input.id ? updated : entry));
  await writeJson(REGISTRATIONS_FILE, next);
  return updated;
}

export async function listCommunityEventRegistrations(eventId?: string) {
  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    let query = supabase.from('community_event_registrations').select('*').order('created_at', { ascending: false });
    if (eventId) query = query.eq('event_id', eventId);
    const { data, error } = await query;
    if (!error && data) return data.map((row) => mapRegistrationRow(row as Record<string, unknown>));
  }
  const registrations = await readJson<CommunityEventRegistrationRecord[]>(REGISTRATIONS_FILE, []);
  return eventId ? registrations.filter((entry) => entry.eventId === eventId) : registrations;
}
