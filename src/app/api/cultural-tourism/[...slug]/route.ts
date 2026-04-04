import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient, isSupabaseServerConfigured } from '@/app/lib/supabase/server';
import { resolveRequestActorId } from '@/app/lib/requestIdentity';
import { calculateTransactionQuote } from '@/app/lib/monetization';
import { resolveRequestPlanIds } from '@/app/lib/monetizationEntitlements';
import { enforceCreatorListingCapacityForActor } from '@/app/lib/creatorListingAccess';
import { appendFinanceLedgerEntry } from '@/app/lib/financeLedger';
import {
  logoutWalletAuthSession,
  refreshWalletAuthSession,
  requestWalletAuthChallenge,
  verifyWalletAuthChallenge
} from '@/app/lib/walletAuthService';

type JsonMap = Record<string, unknown>;

const FALLBACK_EXPERIENCES: JsonMap[] = [
  {
    id: 'tour-001',
    title: 'Yolngu Sunrise Cultural Walk',
    kind: 'guided-tours',
    nation: 'Yolngu',
    community: 'Gove Peninsula Collective',
    region: 'Arnhem Land, AU',
    summary: 'Dawn walk through coastal country with seasonal knowledge and visitor protocols.',
    image: 'https://images.unsplash.com/photo-1472396961693-142e6e269027?w=1200&h=800&fit=crop',
    priceFrom: 120,
    currency: 'USD',
    durationLabel: 'Half Day',
    groupSize: 'Up to 12',
    maxCapacity: 12,
    rating: 4.9,
    reviews: 184,
    verificationTier: 'Gold',
    elderApproved: true,
    sacredContent: false,
    virtual: false,
    availableNextDate: '2026-03-15',
    protocols: [{ id: 'p-photo', label: 'No photography at marked sites', required: true }],
    tags: ['land-based', 'storytelling', 'sunrise'],
    featured: true,
    createdAt: new Date().toISOString()
  }
];

let fallbackModerationQueue: JsonMap[] = [
  {
    id: 'mod-001',
    listingId: 'tour-001',
    listingTitle: 'Yolngu Sunrise Cultural Walk',
    issueType: 'protocol',
    reason: 'Traveler flagged missing protocol signage in confirmation notes.',
    status: 'open',
    priority: 'p1',
    queue: 'legal_protocol',
    slaDueAt: '2026-03-25T00:00:00.000Z',
    escalationLevel: 1,
    createdAt: '2026-03-20T04:00:00.000Z'
  },
  {
    id: 'mod-002',
    listingId: 'tour-001',
    listingTitle: 'Yolngu Sunrise Cultural Walk',
    issueType: 'content',
    reason: 'Listing media requires updated elder-approved review notes.',
    status: 'under_review',
    priority: 'p2',
    queue: 'trust_safety',
    slaDueAt: '2026-03-27T00:00:00.000Z',
    escalationLevel: 0,
    createdAt: '2026-03-18T02:30:00.000Z'
  }
];

const fallbackExperienceSessions: Record<string, JsonMap[]> = {
  'tour-001': [
    {
      sessionId: 'sunrise-walk',
      label: 'Sunrise Walk',
      startTime: '06:30',
      endTime: '09:30',
      capacity: 12,
      active: true,
      virtual: false
    },
    {
      sessionId: 'story-circle',
      label: 'Story Circle',
      startTime: '10:00',
      endTime: '12:00',
      capacity: 8,
      active: true,
      virtual: false
    }
  ]
};

function json(data: unknown, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

function bad(message: string, status = 400) {
  return NextResponse.json({ success: false, message }, { status });
}

function actorId(req: NextRequest) {
  return resolveRequestActorId(req);
}

function mapExperience(row: JsonMap) {
  const media = Array.isArray(row.media) ? row.media : [];
  const firstMedia =
    typeof media[0] === 'string'
      ? media[0]
      : media[0] && typeof media[0] === 'object'
        ? String((media[0] as JsonMap).url || (media[0] as JsonMap).src || '')
        : '';
  return {
    id: String(row.id),
    title: String(row.title || ''),
    kind: String(row.kind || 'guided-tours'),
    nation: String(row.nation || ''),
    community: String(row.community || ''),
    region: String(row.region || ''),
    summary: String(row.summary || ''),
    image: String(row.media_url || row.image || firstMedia || ''),
    priceFrom: Number(row.price_from || row.priceFrom || 0),
    currency: String(row.currency || 'USD'),
    durationLabel: String(row.duration_label || row.durationLabel || 'Half Day'),
    groupSize: String(row.group_size || row.groupSize || 'Up to 10'),
    maxCapacity: Number(row.max_capacity || row.maxCapacity || 10),
    rating: Number(row.rating || 4.8),
    reviews: Number(row.reviews_count || row.reviews || 0),
    verificationTier: String(row.verification_tier || row.verificationTier || 'Bronze'),
    elderApproved: Boolean(row.elder_approved ?? row.elderApproved),
    sacredContent: Boolean(row.sacred_content ?? row.sacredContent),
    virtual: Boolean(row.virtual),
    availableNextDate: String(row.available_next_date || row.availableNextDate || new Date().toISOString().slice(0, 10)),
    blackoutDates: Array.isArray(row.blackout_dates) ? row.blackout_dates : (Array.isArray(row.blackoutDates) ? row.blackoutDates : []),
    protocols: Array.isArray(row.protocols) ? row.protocols : [],
    sessions: Array.isArray(row.sessions) ? row.sessions : [],
    consentChecklist: Array.isArray(row.consent_checklist) ? row.consent_checklist : (Array.isArray(row.consentChecklist) ? row.consentChecklist : []),
    mediaRestrictions: (row.media_restrictions as JsonMap | undefined) || (row.mediaRestrictions as JsonMap | undefined) || { photoAllowed: true, audioAllowed: true, videoAllowed: false },
    tags: Array.isArray(row.tags) ? row.tags : [],
    featured: Boolean(row.featured),
    createdAt: String(row.created_at || row.createdAt || new Date().toISOString())
  };
}

async function getModerationQueue(status: string) {
  const normalized = status.trim().toLowerCase();
  const rows = normalized && normalized !== 'all'
    ? fallbackModerationQueue.filter((item) => String(item.status || '').toLowerCase() === normalized)
    : fallbackModerationQueue;
  return json(rows);
}

async function exportModerationAudit(format: string) {
  const normalized = format.trim().toLowerCase();
  if (normalized === 'csv') {
    const header = 'id,listingId,listingTitle,issueType,status,priority,queue,createdAt';
    const body = fallbackModerationQueue.map((item) => [
      item.id,
      item.listingId,
      item.listingTitle,
      item.issueType,
      item.status,
      item.priority,
      item.queue,
      item.createdAt
    ].map((value) => `"${String(value || '').replace(/"/g, '""')}"`).join(','));
    return json([header, ...body].join('\n'));
  }
  return json(fallbackModerationQueue);
}

async function updateModerationDecision(id: string, decision: 'resolve' | 'dismiss' | 'review') {
  const target = fallbackModerationQueue.find((item) => String(item.id) === id);
  if (!target) return bad('Moderation item not found', 404);
  target.status = decision === 'resolve' ? 'resolved' : decision === 'dismiss' ? 'dismissed' : 'under_review';
  target.updatedAt = new Date().toISOString();
  return json({ id, status: target.status });
}

async function getExperienceSessions(experienceId: string) {
  if (!isSupabaseServerConfigured()) {
    return json(fallbackExperienceSessions[experienceId] || [{ sessionId: 'default', label: 'Default Session', capacity: 12, active: true, virtual: false }]);
  }
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.from('tourism_experiences').select('sessions').eq('id', experienceId).maybeSingle();
  if (error) return bad(error.message, 500);
  const sessions = Array.isArray((data as JsonMap | null)?.sessions) ? (data as JsonMap).sessions : [];
  return json(sessions);
}

async function upsertExperienceSessions(experienceId: string, req: NextRequest) {
  const body = (await req.json().catch(() => null)) as JsonMap | null;
  if (!body) return bad('Invalid sessions payload');
  const sessions = Array.isArray(body.sessions) ? body.sessions : [];
  const normalized = sessions
    .filter((item): item is JsonMap => Boolean(item) && typeof item === 'object')
    .map((item, index) => ({
      sessionId: String(item.sessionId || `session-${index + 1}`),
      label: String(item.label || `Session ${index + 1}`),
      startTime: item.startTime ? String(item.startTime) : '',
      endTime: item.endTime ? String(item.endTime) : '',
      capacity: Math.max(1, Number(item.capacity || 1)),
      active: Boolean(item.active ?? true),
      virtual: Boolean(item.virtual)
    }));

  if (!isSupabaseServerConfigured()) {
    fallbackExperienceSessions[experienceId] = normalized;
    return json({ experienceId, sessions: normalized });
  }

  const supabase = createSupabaseServerClient();
  const { error } = await supabase
    .from('tourism_experiences')
    .update({
      sessions: normalized,
      updated_at: new Date().toISOString()
    })
    .eq('id', experienceId);
  if (error) return bad(error.message, 500);
  return json({ experienceId, sessions: normalized });
}

function mapBooking(row: JsonMap) {
  const paymentBreakdown = (row.payment_breakdown as JsonMap) || (row.paymentBreakdown as JsonMap) || {};
  return {
    bookingId: String(row.booking_id || row.bookingId),
    experienceId: String(row.experience_id || row.experienceId),
    experienceTitle: String(row.experience_title || row.experienceTitle || ''),
    date: String(row.date || ''),
    sessionId: row.session_id || row.sessionId || undefined,
    sessionLabel: row.session_label || row.sessionLabel || undefined,
    guests: Number(row.guests || 1),
    baseFare: Number(row.base_fare || row.baseFare || 0),
    serviceFee: Number(row.service_fee || row.serviceFee || 0),
    taxAmount: Number(row.tax_amount || row.taxAmount || 0),
    totalAmount: Number(row.total_amount || row.totalAmount || 0),
    fareBreakdown: {
      baseFare: Number(row.base_fare || row.baseFare || 0),
      serviceFee: Number(row.service_fee || row.serviceFee || 0),
      platformFee: Number(paymentBreakdown.platformFee || 0),
      creatorNet: Number(paymentBreakdown.creatorNet || 0),
      taxAmount: Number(row.tax_amount || row.taxAmount || 0),
      totalAmount: Number(row.total_amount || row.totalAmount || 0)
    },
    currency: String(row.currency || 'USD'),
    status: String(row.status || 'confirmed'),
    paymentStatus: row.payment_status || row.paymentStatus || 'captured',
    paymentIntentId: row.payment_intent_id || row.paymentIntentId || undefined,
    paymentProvider: row.payment_provider || row.paymentProvider || undefined,
    paymentReference: row.payment_reference || row.paymentReference || undefined,
    receiptId: row.receipt_id || row.receiptId || undefined,
    paymentDueAt: row.payment_due_at || row.paymentDueAt || null,
    protocolSnapshot: Array.isArray(row.protocol_snapshot) ? row.protocol_snapshot : (Array.isArray(row.protocolSnapshot) ? row.protocolSnapshot : []),
    mediaRestrictions: (row.media_restrictions as JsonMap) || row.mediaRestrictions || { photoAllowed: true, audioAllowed: true, videoAllowed: false },
    ticketId: row.ticket_id || row.ticketId || undefined,
    cancellationReason: row.cancellation_reason || row.cancellationReason || undefined,
    rescheduledFromDate: row.rescheduled_from_date || row.rescheduledFromDate || undefined,
    createdAt: String(row.created_at || row.createdAt || new Date().toISOString())
  };
}

async function getExperiences(req: NextRequest) {
  if (!isSupabaseServerConfigured()) {
    return json({ items: FALLBACK_EXPERIENCES, total: FALLBACK_EXPERIENCES.length, page: 1, pages: 1 });
  }
  const supabase = createSupabaseServerClient();
  const url = req.nextUrl;
  const page = Math.max(1, Number(url.searchParams.get('page') || '1'));
  const limit = Math.min(50, Math.max(1, Number(url.searchParams.get('limit') || '12')));
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase.from('tourism_experiences').select('*', { count: 'exact' }).order('created_at', { ascending: false }).range(from, to);

  const q = (url.searchParams.get('q') || '').trim();
  if (q) query = query.ilike('title', `%${q}%`);
  const kind = (url.searchParams.get('kind') || '').trim();
  if (kind) query = query.eq('kind', kind);
  const region = (url.searchParams.get('region') || '').trim();
  if (region) query = query.ilike('region', `%${region}%`);
  const virtualOnly = url.searchParams.get('virtualOnly') === 'true';
  if (virtualOnly) query = query.eq('virtual', true);

  const { data, count, error } = await query;
  if (error) return bad(error.message, 500);
  const items = (data || []).map((row) => mapExperience(row as unknown as JsonMap));
  const total = Number(count || items.length);
  const pages = Math.max(1, Math.ceil(total / limit));
  return json({ items, total, page, pages });
}

async function getExperienceById(id: string) {
  if (!isSupabaseServerConfigured()) {
    const hit = FALLBACK_EXPERIENCES.find((x) => x.id === id);
    if (!hit) return bad('Requested tourism resource was not found.', 404);
    return json(hit);
  }
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.from('tourism_experiences').select('*').eq('id', id).maybeSingle();
  if (error) return bad(error.message, 500);
  if (!data) return bad('Requested tourism resource was not found.', 404);
  return json(mapExperience(data as unknown as JsonMap));
}

async function listBookings(req: NextRequest) {
  if (!isSupabaseServerConfigured()) return json([]);
  const supabase = createSupabaseServerClient();
  const actor = actorId(req);
  const { data, error } = await supabase.from('tourism_bookings').select('*').eq('traveler_actor_id', actor).order('created_at', { ascending: false }).limit(50);
  if (error) return bad(error.message, 500);
  return json((data || []).map((x) => mapBooking(x as unknown as JsonMap)));
}

async function createBooking(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as JsonMap | null;
  if (!body) return bad('Invalid booking payload');
  const experienceId = String(body.experienceId || '').trim();
  const date = String(body.date || '').trim();
  const guests = Math.max(1, Number(body.guests || 1));
  const travelerName = String(body.travelerName || '').trim();
  const travelerEmail = String(body.travelerEmail || '').trim();
  if (!experienceId || !date || !travelerName || !travelerEmail) return bad('Missing required booking fields');

  const bookingId = `bk-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  let experienceTitle = 'Experience';
  let baseFare = 100 * guests;
  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    const ex = await supabase.from('tourism_experiences').select('*').eq('id', experienceId).maybeSingle();
    if (ex.data) {
      experienceTitle = String((ex.data as JsonMap).title || experienceTitle);
      baseFare = Number((ex.data as JsonMap).price_from || 100) * guests;
    }
  }

    const { creatorPlanId, memberPlanId } = await resolveRequestPlanIds(req, body);
  const quote = calculateTransactionQuote({
    pillar: 'cultural-tourism',
    subtotal: baseFare,
    creatorPlanId,
    memberPlanId
  });
  const serviceFee = Number(quote.buyerServiceFee.toFixed(2));
  const taxAmount = Number((baseFare * 0.03).toFixed(2));
  const totalAmount = Number((quote.buyerTotal + taxAmount).toFixed(2));

  const row: JsonMap = {
    booking_id: bookingId,
    experience_id: experienceId,
    experience_title: experienceTitle,
    traveler_actor_id: actorId(req),
    traveler_name: travelerName,
    traveler_email: travelerEmail,
    date,
    session_id: body.sessionId || null,
    session_label: body.sessionLabel || null,
    guests,
    base_fare: baseFare,
    service_fee: serviceFee,
    tax_amount: taxAmount,
    total_amount: totalAmount,
    payment_breakdown: {
      subtotal: quote.subtotal,
      buyerServiceFee: quote.buyerServiceFee,
      platformFee: quote.platformFee,
      buyerTotal: quote.buyerTotal,
      creatorNet: quote.creatorNet
    },
    currency: 'USD',
    status: 'confirmed',
    payment_status: 'requires_payment',
    protocol_snapshot: Array.isArray(body.protocolAcknowledgements) ? body.protocolAcknowledgements : [],
    media_restrictions: { photoAllowed: true, audioAllowed: true, videoAllowed: false },
    ticket_id: `tkt-${bookingId}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    const ins = await supabase.from('tourism_bookings').insert(row).select('*').single();
    if (ins.error) return bad(ins.error.message, 500);
    return json(mapBooking(ins.data as unknown as JsonMap), 201);
  }

  return json(mapBooking(row), 201);
}

async function cancelBooking(bookingId: string, req: NextRequest) {
  if (!isSupabaseServerConfigured()) return json({ bookingId, status: 'cancelled' });
  const supabase = createSupabaseServerClient();
  const reasonBody = (await req.json().catch(() => ({}))) as JsonMap;
  const updates: JsonMap = {
    status: 'cancelled',
    cancellation_reason: String(reasonBody.reason || 'Cancelled by traveler'),
    updated_at: new Date().toISOString()
  };
  const { data, error } = await supabase.from('tourism_bookings').update(updates).eq('booking_id', bookingId).select('*').maybeSingle();
  if (error) return bad(error.message, 500);
  if (!data) return bad('Booking not found', 404);
  return json(mapBooking(data as unknown as JsonMap));
}

async function rescheduleBooking(bookingId: string, req: NextRequest) {
  const payload = (await req.json().catch(() => null)) as JsonMap | null;
  if (!payload) return bad('Invalid reschedule payload');
  const date = String(payload.date || '').trim();
  if (!date) return bad('Reschedule date is required');

  if (!isSupabaseServerConfigured()) return json({ bookingId, date });
  const supabase = createSupabaseServerClient();
  const { data: existing } = await supabase.from('tourism_bookings').select('*').eq('booking_id', bookingId).maybeSingle();
  if (!existing) return bad('Booking not found', 404);
  const { data, error } = await supabase
    .from('tourism_bookings')
    .update({
      date,
      session_id: payload.sessionId || (existing as JsonMap).session_id || null,
      session_label: payload.sessionLabel || (existing as JsonMap).session_label || null,
      rescheduled_from_date: String((existing as JsonMap).date || ''),
      updated_at: new Date().toISOString()
    })
    .eq('booking_id', bookingId)
    .select('*')
    .maybeSingle();
  if (error) return bad(error.message, 500);
  if (!data) return bad('Booking not found', 404);
  return json(mapBooking(data as unknown as JsonMap));
}

async function postBookingReview(bookingId: string, req: NextRequest) {
  const payload = (await req.json().catch(() => null)) as JsonMap | null;
  if (!payload) return bad('Invalid review payload');
  const rating = Math.max(1, Math.min(5, Number(payload.rating || 5)));
  const comment = String(payload.comment || '').trim();
  if (!comment) return bad('Review comment is required');

  const review = {
    reviewId: `rev-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    bookingId,
    experienceId: String(payload.experienceId || ''),
    rating,
    comment,
    createdAt: new Date().toISOString()
  };

  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    const ins = await supabase.from('tourism_reviews').insert({
      review_id: review.reviewId,
      booking_id: bookingId,
      experience_id: review.experienceId,
      reviewer_actor_id: actorId(req),
      rating,
      comment,
      created_at: review.createdAt
    });
    if (ins.error) return bad(ins.error.message, 500);
  }

  return json(review, 201);
}

async function getExperienceReviews(experienceId: string) {
  if (!isSupabaseServerConfigured()) return json([]);
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.from('tourism_reviews').select('*').eq('experience_id', experienceId).order('created_at', { ascending: false }).limit(100);
  if (error) return bad(error.message, 500);
  return json((data || []).map((row) => ({
    reviewId: String((row as JsonMap).review_id || ''),
    bookingId: String((row as JsonMap).booking_id || ''),
    experienceId: String((row as JsonMap).experience_id || ''),
    rating: Number((row as JsonMap).rating || 0),
    comment: String((row as JsonMap).comment || ''),
    createdAt: String((row as JsonMap).created_at || '')
  })));
}

async function getOperator(wallet: string) {
  if (!isSupabaseServerConfigured()) {
    return json({ wallet, operatorName: 'Community Operator', nation: 'Indigenous Nation', verificationTier: 'Bronze', activeListings: 0, monthlyBookings: 0, payoutPending: 0 });
  }
  const supabase = createSupabaseServerClient();
  const op = await supabase.from('tourism_operators').select('*').eq('wallet', wallet).maybeSingle();
  const listings = await supabase.from('tourism_experiences').select('*', { count: 'exact', head: true }).eq('operator_actor_id', wallet);
  const bookings = await supabase.from('tourism_bookings').select('*', { count: 'exact', head: true }).eq('traveler_actor_id', wallet);
  return json({
    wallet,
    operatorName: String((op.data as JsonMap | null)?.operator_name || 'Community Operator'),
    nation: String((op.data as JsonMap | null)?.nation || 'Indigenous Nation'),
    verificationTier: String((op.data as JsonMap | null)?.verification_tier || 'Bronze'),
    activeListings: Number(listings.count || 0),
    monthlyBookings: Number(bookings.count || 0),
    payoutPending: 0
  });
}

async function getOperatorListings(wallet: string, req: NextRequest) {
  const limit = Math.min(100, Math.max(1, Number(req.nextUrl.searchParams.get('limit') || '50')));
  if (!isSupabaseServerConfigured()) return json(FALLBACK_EXPERIENCES.slice(0, limit));
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.from('tourism_experiences').select('*').eq('operator_actor_id', wallet).order('created_at', { ascending: false }).limit(limit);
  if (error) return bad(error.message, 500);
  return json((data || []).map((row) => mapExperience(row as unknown as JsonMap)));
}

async function getOperatorBookings(wallet: string, req: NextRequest) {
  const limit = Math.min(100, Math.max(1, Number(req.nextUrl.searchParams.get('limit') || '50')));
  if (!isSupabaseServerConfigured()) return json([]);
  const supabase = createSupabaseServerClient();
  const listingIdsRes = await supabase.from('tourism_experiences').select('id').eq('operator_actor_id', wallet);
  const ids = (listingIdsRes.data || []).map((r) => String((r as JsonMap).id));
  if (!ids.length) return json([]);
  const { data, error } = await supabase.from('tourism_bookings').select('*').in('experience_id', ids).order('created_at', { ascending: false }).limit(limit);
  if (error) return bad(error.message, 500);
  return json((data || []).map((row) => mapBooking(row as unknown as JsonMap)));
}

async function createExperience(req: NextRequest) {
  const payload = (await req.json().catch(() => null)) as JsonMap | null;
  if (!payload) return bad('Invalid experience payload');
  await enforceCreatorListingCapacityForActor({
    actorId: actorId(req),
    currentCount: isSupabaseServerConfigured()
      ? Number((await createSupabaseServerClient().from('tourism_experiences').select('*', { count: 'exact', head: true }).eq('operator_actor_id', actorId(req))).count || 0)
      : 0
  });
  const id = `tour-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const mediaItems = Array.isArray(payload.images)
    ? payload.images
        .map((item) => {
          if (typeof item === 'string') return { url: item, kind: 'image' };
          if (item && typeof item === 'object') {
            const entry = item as JsonMap;
            const url = String(entry.url || '');
            return url ? { url, kind: String(entry.kind || 'image') } : null;
          }
          return null;
        })
        .filter(Boolean)
    : [];
  const firstImage = typeof payload.image === 'string' && payload.image
    ? String(payload.image)
    : String((mediaItems[0] as JsonMap | undefined)?.url || '');
  const row: JsonMap = {
    id,
    operator_actor_id: actorId(req),
    title: String(payload.title || 'Untitled Experience'),
    kind: String(payload.kind || 'guided-tours'),
    nation: String(payload.nation || ''),
    community: String(payload.community || ''),
    region: String(payload.region || ''),
    summary: String(payload.summary || ''),
    media_url: firstImage,
    media: mediaItems,
    price_from: Number(payload.priceFrom || payload.price || 0),
    currency: 'USD',
    duration_label: String(payload.durationLabel || 'Half Day'),
    group_size: String(payload.groupSize || 'Up to 10'),
    max_capacity: Number(payload.maxCapacity || 10),
    rating: 5,
    reviews_count: 0,
    verification_tier: String(payload.verificationTier || 'Bronze'),
    elder_approved: Boolean(payload.elderApproved),
    sacred_content: Boolean(payload.sacredContent),
    virtual: Boolean(payload.virtual),
    available_next_date: String(payload.availableNextDate || new Date().toISOString().slice(0, 10)),
    protocols: Array.isArray(payload.protocols) ? payload.protocols : [],
    tags: Array.isArray(payload.tags) ? payload.tags : [],
    featured: Boolean(payload.featured),
    status: 'published',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  if (!isSupabaseServerConfigured()) return json(mapExperience(row), 201);
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.from('tourism_experiences').insert(row).select('*').single();
  if (error) return bad(error.message, 500);
  return json(mapExperience(data as unknown as JsonMap), 201);
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug = [] } = await params;
  const [a, b, c, d] = slug;

  if (a === 'readyz') {
    return json({ dbReady: isSupabaseServerConfigured(), paymentProvider: 'mock', placementTypesLoaded: 7, placementCoverage: [] });
  }

  if (a === 'experiences' && !b) return getExperiences(req);
  if (a === 'experiences' && b === 'cursor') {
    const page = await getExperiences(req);
    const data = await page.json();
    const items = (data?.data?.items || []) as unknown[];
    return json({ items, nextCursor: null, hasMore: false });
  }
  if (a === 'experiences' && b && c === 'reviews') return getExperienceReviews(b);
  if (a === 'experiences' && b && c === 'availability') {
    const date = req.nextUrl.searchParams.get('date') || new Date().toISOString().slice(0, 10);
    const guests = Math.max(1, Number(req.nextUrl.searchParams.get('guests') || '1'));
    const baseFare = 100 * guests;
    const quote = calculateTransactionQuote({ pillar: 'cultural-tourism', subtotal: baseFare });
    const taxAmount = Number((baseFare * 0.03).toFixed(2));
    return json({
      date,
      sessionId: 'default',
      sessionLabel: 'default',
      capacity: 12,
      bookedGuests: 0,
      remaining: 12,
      soldOut: false,
      requestedGuests: guests,
      canBook: guests <= 12,
      nextAvailableDate: date,
      fareBreakdown: {
        baseFare,
        serviceFee: quote.buyerServiceFee,
        platformFee: quote.platformFee,
        creatorNet: quote.creatorNet,
        taxAmount,
        totalAmount: Number((quote.buyerTotal + taxAmount).toFixed(2))
      }
    });
  }
  if (a === 'experiences' && b && c === 'calendar') {
    const start = req.nextUrl.searchParams.get('start') || new Date().toISOString().slice(0, 10);
    const days = Math.max(1, Math.min(90, Number(req.nextUrl.searchParams.get('days') || '30')));
    const calendar = Array.from({ length: days }).map((_, i) => {
      const date = new Date(start);
      date.setDate(date.getDate() + i);
      return { date: date.toISOString().slice(0, 10), capacity: 12, bookedGuests: 0, remaining: 12, soldOut: false };
    });
    return json({ experienceId: b, start, days, calendar });
  }
  if (a === 'experiences' && b && c === 'sessions') return getExperienceSessions(b);
  if (a === 'experiences' && b) return getExperienceById(b);

  if (a === 'bookings' && b === 'me') return listBookings(req);
  if (a === 'bookings' && b && c === 'ticket') {
    return json({ ticketId: `tkt-${b}`, bookingId: b, experienceId: '', experienceTitle: '', date: '', guests: 1, protocolSnapshot: [], restrictions: { photoAllowed: true, audioAllowed: true, videoAllowed: false } });
  }

  if (a === 'territories') {
    if (!isSupabaseServerConfigured()) return json([]);
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase.from('tourism_territories').select('*').order('territory_name');
    if (error) return bad(error.message, 500);
    return json((data || []).map((row) => ({ id: (row as JsonMap).id, territoryName: (row as JsonMap).territory_name, nation: (row as JsonMap).nation, region: (row as JsonMap).region, experiences: 0, protocolsRequired: Boolean((row as JsonMap).protocols_required) })));
  }

  if (a === 'analytics' && b === 'heatmap') {
    if (!isSupabaseServerConfigured()) return json({});
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase.from('tourism_events').select('*').order('created_at', { ascending: false }).limit(500);
    if (error) return bad(error.message, 500);
    const map: Record<string, number> = {};
    (data || []).forEach((row) => {
      const key = String((row as JsonMap).kind || 'all');
      map[key] = (map[key] || 0) + 1;
    });
    return json(map);
  }

  if (a === 'ops' && b === 'dashboard') {
    return json({ totalBookings: 0, confirmedBookings: 0, pendingBookings: 0, paymentFailures: 0, openModeration: 0, commsQueued: 0, conversion: 0, alerts: [] });
  }
  if (a === 'analytics' && b === 'funnel') return json({ searches: 0, views: 0, starts: 0, completed: 0, viewRate: 0, startRate: 0, completionRate: 0 });
  if (a === 'ops' && b === 'synthetic-check') return json([{ id: 'tourism-api', ok: true, detail: 'healthy' }]);
  if (a === 'moderation' && !b) return getModerationQueue(req.nextUrl.searchParams.get('status') || 'all');
  if (a === 'moderation' && b === 'export') return exportModerationAudit(req.nextUrl.searchParams.get('format') || 'json');

  if (a === 'operators' && b && !c) return getOperator(b);
  if (a === 'operators' && b && c === 'listings') return getOperatorListings(b, req);
  if (a === 'operators' && b && c === 'bookings') return getOperatorBookings(b, req);

  return bad('Unsupported tourism endpoint', 404);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug = [] } = await params;
  const [a, b, c] = slug;

  if (a === 'auth' && b === 'challenge') {
    const body = (await req.json().catch(() => ({}))) as JsonMap;
    const wallet = String(body.wallet || '').trim().toLowerCase();
    if (!wallet) return bad('wallet is required');
    return json(await requestWalletAuthChallenge(wallet));
  }
  if (a === 'auth' && b === 'verify') {
    const body = (await req.json().catch(() => ({}))) as JsonMap;
    const wallet = String(body.wallet || '').trim().toLowerCase();
    const challengeId = String(body.challengeId || '').trim();
    const signature = String(body.signature || '').trim();
    if (!wallet || !challengeId || !signature) return bad('wallet, challengeId, and signature are required');
    try {
      return json(await verifyWalletAuthChallenge({ walletAddress: wallet, challengeId, signature }));
    } catch (error) {
      return bad(error instanceof Error ? error.message : 'Wallet verification failed', 401);
    }
  }
  if (a === 'auth' && b === 'refresh') {
    const body = (await req.json().catch(() => ({}))) as JsonMap;
    const refreshToken = String(body.refreshToken || '').trim();
    if (!refreshToken) return bad('refreshToken is required');
    try {
      return json(await refreshWalletAuthSession(refreshToken));
    } catch (error) {
      return bad(error instanceof Error ? error.message : 'Wallet refresh failed', 401);
    }
  }
  if (a === 'auth' && b === 'logout') {
    const body = (await req.json().catch(() => ({}))) as JsonMap;
    const refreshToken = String(body.refreshToken || '').trim();
    const auth = req.headers.get('authorization') || '';
    const accessToken = auth.startsWith('Bearer ') ? auth.slice(7).trim() : '';
    return json(await logoutWalletAuthSession({ refreshToken, accessToken }));
  }

  if (a === 'experiences' && !b) return createExperience(req);
  if (a === 'experiences' && b && c === 'sessions') return upsertExperienceSessions(b, req);

  if (a === 'bookings' && !b) return createBooking(req);
  if (a === 'bookings' && b && c === 'cancel') return cancelBooking(b, req);
  if (a === 'bookings' && b && c === 'reschedule') return rescheduleBooking(b, req);
  if (a === 'bookings' && b && c === 'reviews') return postBookingReview(b, req);
  if (a === 'bookings' && b && c === 'payment-intent') {
    if (!isSupabaseServerConfigured()) return json({ paymentIntentId: `pi_${Date.now()}`, paymentStatus: 'requires_confirmation' });
    const supabase = createSupabaseServerClient();
    const { data } = await supabase.from('tourism_bookings').select('*').eq('booking_id', b).maybeSingle();
    const booking = (data as JsonMap | null) || {};
    return json({
      paymentIntentId: `pi_${Date.now()}`,
      paymentStatus: 'requires_confirmation',
      amount: Number(booking.total_amount || 0),
      currency: String(booking.currency || 'USD'),
      feeBreakdown: ((booking.payment_breakdown as JsonMap | undefined) || null)
    });
  }
  if (a === 'bookings' && b && c === 'payment-confirm') {
    const body = (await req.json().catch(() => ({}))) as JsonMap;
    if (isSupabaseServerConfigured()) {
      const supabase = createSupabaseServerClient();
      const { data } = await supabase.from('tourism_bookings').select('*').eq('booking_id', b).maybeSingle();
      const booking = (data as JsonMap | null) || {};
      await supabase
        .from('tourism_bookings')
        .update({
          payment_status: 'captured',
          receipt_id: `rcpt-${b}`,
          payment_reference: String(body.paymentReference || `pay-${Date.now()}`),
          updated_at: new Date().toISOString()
        })
        .eq('booking_id', b);
      if (String(booking.operator_actor_id || '')) {
        const paymentBreakdown = ((booking.payment_breakdown as JsonMap | undefined) || {}) as JsonMap;
        await appendFinanceLedgerEntry({
          id: `fin-ledger-rcpt-${b}`,
          actorId: String(booking.operator_actor_id || ''),
          profileSlug: String(booking.operator_actor_id || ''),
          pillar: 'cultural-tourism',
          type: 'sale',
          status: 'paid',
          item: String(booking.experience_title || booking.experience_id || b),
          grossAmount: Number(paymentBreakdown.subtotal || booking.total_amount || 0),
          platformFeeAmount: Number(paymentBreakdown.platformFee || 0),
          processorFeeAmount: 0,
          escrowFeeAmount: 0,
          refundAmount: 0,
          disputeAmount: 0,
          creatorNetAmount: Number(paymentBreakdown.creatorNet || booking.total_amount || 0),
          disputeReason: '',
          sourceType: 'experience',
          sourceId: String(booking.experience_id || b),
          metadata: {
            currency: String(booking.currency || 'USD'),
            bookingId: b,
            experienceId: String(booking.experience_id || b),
            receiptId: `rcpt-${b}`
          },
          createdAt: new Date().toISOString()
        });
      }
      return json({
        bookingId: b,
        paymentStatus: 'captured',
        receiptId: `rcpt-${b}`,
        amount: Number(booking.total_amount || 0),
        feeBreakdown: ((booking.payment_breakdown as JsonMap | undefined) || null)
      });
    }
    return json({ bookingId: b, paymentStatus: 'captured', receiptId: `rcpt-${b}` });
  }

  if (a === 'analytics' && b === 'event') {
    const payload = (await req.json().catch(() => ({}))) as JsonMap;
    if (isSupabaseServerConfigured()) {
      const supabase = createSupabaseServerClient();
      await supabase.from('tourism_events').insert({
        id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        event: String(payload.event || 'tourism_view'),
        experience_id: payload.experienceId || null,
        kind: payload.kind || null,
        actor_id: actorId(req),
        metadata: payload.metadata || {},
        created_at: new Date().toISOString()
      });
    }
    return json({ tracked: true });
  }

  if (a === 'moderation' && b && c === 'decision') {
    const body = (await req.json().catch(() => ({}))) as JsonMap;
    const decision = String(body.decision || 'review') as 'resolve' | 'dismiss' | 'review';
    return updateModerationDecision(b, decision);
  }

  return bad('Unsupported tourism endpoint', 404);
}
