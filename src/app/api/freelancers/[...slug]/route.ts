import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient, isSupabaseServerConfigured } from '@/app/lib/supabase/server';
import { resolveRequestActorId, resolveRequestWallet } from '@/app/lib/requestIdentity';
import { calculateTransactionQuote } from '@/app/lib/monetization';
import { resolveRequestPlanIds } from '@/app/lib/monetizationEntitlements';
import { appendFinanceLedgerEntry } from '@/app/lib/financeLedger';

type R = Record<string, unknown>;

function fail(message: string, status = 400) {
  return NextResponse.json({ message }, { status });
}

function map(row: R) {
  const start = Number(row.starting_price || row.price || 0);
  return {
    serviceId: String(row.id),
    title: String(row.title || ''),
    description: String(row.description || ''),
    category: String(row.category || ''),
    freelancerAddress: String(row.freelancer_actor_id || ''),
    freelancerName: String(row.freelancer_name || 'Freelancer'),
    freelancerAvatar: String(row.freelancer_avatar || ''),
    freelancerNation: String(row.nation || ''),
    location: String(row.location || ''),
    verificationStatus: row.verified ? 'verified' : 'pending',
    averageRating: Number(row.rating || 4.8),
    reviewCount: Number(row.review_count || 0),
    completedProjects: Number(row.completed_projects || 0),
    responseTime: String(row.response_time || '24h'),
    languages: Array.isArray(row.languages) ? row.languages : [],
    skills: Array.isArray(row.tags) ? row.tags : [],
    pricing: { min: start, max: start, currency: String(row.currency || 'USD'), fixedAmount: start },
    deliveryTime: String(row.turnaround_days || 7) + ' days',
    featured: Boolean(row.featured),
    available: String(row.status || 'active') !== 'paused'
  };
}

function mapEscrowOrder(row: R) {
  const paymentBreakdown = (row.payment_breakdown as R) || (row.paymentBreakdown as R) || {};
  return {
    orderId: String(row.id || row.order_id || ''),
    serviceId: String(row.service_id || row.serviceId || ''),
    serviceTitle: String(row.service_title || row.serviceTitle || ''),
    clientActorId: String(row.client_actor_id || row.clientActorId || ''),
    walletAddress: String(row.wallet_address || row.walletAddress || ''),
    freelancerActorId: String(row.freelancer_actor_id || row.freelancerActorId || ''),
    freelancerName: String(row.freelancer_name || row.freelancerName || ''),
    status: String(row.status || 'in_escrow'),
    escrowStatus: String(row.escrow_status || row.escrowStatus || 'funded'),
    totalAmount: Number(row.total_amount || row.totalAmount || 0),
    amountReleased: Number(row.amount_released || row.amountReleased || 0),
    currency: String(row.currency || 'USD'),
    paymentBreakdown: {
      subtotal: Number(paymentBreakdown.subtotal || 0),
      escrowFee: Number(paymentBreakdown.escrowFee || 0),
      platformFee: Number(paymentBreakdown.platformFee || 0),
      buyerTotal: Number(paymentBreakdown.buyerTotal || 0),
      creatorNet: Number(paymentBreakdown.creatorNet || 0)
    },
    milestones: Array.isArray(row.milestones) ? row.milestones : [],
    createdAt: String(row.created_at || new Date().toISOString())
  };
}

async function list(req: NextRequest) {
  if (!isSupabaseServerConfigured()) return NextResponse.json({ data: { services: [], total: 0, pages: 1, page: 1 } });
  const supabase = createSupabaseServerClient();
  const page = Math.max(1, Number(req.nextUrl.searchParams.get('page') || '1'));
  const limit = Math.min(50, Math.max(1, Number(req.nextUrl.searchParams.get('limit') || '24')));
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  let q = supabase.from('freelancing_services').select('*', { count: 'exact' }).range(from, to).order('created_at', { ascending: false });
  const text = String(req.nextUrl.searchParams.get('q') || '').trim();
  if (text) q = q.ilike('title', `%${text}%`);
  const category = String(req.nextUrl.searchParams.get('category') || '').trim();
  if (category) q = q.eq('category', category);
  const { data, count, error } = await q;
  if (error) return fail(error.message, 500);
  const services = (data || []).map((x) => map(x as unknown as R));
  return NextResponse.json({ data: { services, total: Number(count || services.length), pages: Math.max(1, Math.ceil(Number(count || services.length) / limit)), page } });
}

async function listEscrowOrders(req: NextRequest) {
  if (!isSupabaseServerConfigured()) return NextResponse.json({ orders: [] });
  const supabase = createSupabaseServerClient();
  const actorId = resolveRequestActorId(req);
  const wallet = resolveRequestWallet(req);
  const actorFilter = actorId !== 'guest' ? actorId : wallet;
  if (!actorFilter) return NextResponse.json({ orders: [] });
  const { data, error } = await supabase
    .from('freelance_escrow_orders')
    .select('*')
    .or(`client_actor_id.eq.${actorFilter},wallet_address.eq.${actorFilter}`)
    .order('created_at', { ascending: false });
  if (error) return fail(error.message, 500);
  return NextResponse.json({ orders: (data || []).map((row) => mapEscrowOrder(row as unknown as R)) });
}

async function createEscrowOrder(serviceId: string, req: NextRequest, body: R) {
  const actorId = resolveRequestActorId(req);
  const wallet = resolveRequestWallet(req);

  let service: R | null = null;
  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    const { data } = await supabase.from('freelancing_services').select('*').eq('id', serviceId).maybeSingle();
    service = (data as R | null) || null;
  }

  if (!service) {
    service = {
      id: serviceId,
      title: String(body.serviceTitle || 'Freelance Service'),
      freelancer_actor_id: String(body.freelancerActorId || ''),
      freelancer_name: String(body.freelancerName || 'Freelancer'),
      price: Number(body.amount || 0),
      currency: String(body.currency || 'USD')
    };
  }

  const subtotal = Number(body.amount || service.price || service.starting_price || 0);
  if (!subtotal) return fail('A service amount is required');

  const { creatorPlanId, memberPlanId } = await resolveRequestPlanIds(req, body);
  const quote = calculateTransactionQuote({
    pillar: 'freelancing',
    subtotal,
    escrowProtected: true,
    creatorPlanId,
    memberPlanId
  });

  const order: R = {
    id: `fro-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    service_id: serviceId,
    service_title: String(service.title || body.serviceTitle || 'Freelance Service'),
    client_actor_id: actorId,
    wallet_address: wallet || String(body.clientAddress || '').trim().toLowerCase() || null,
    freelancer_actor_id: String(service.freelancer_actor_id || body.freelancerActorId || ''),
    freelancer_name: String(service.freelancer_name || body.freelancerName || 'Freelancer'),
    status: 'in_escrow',
    escrow_status: 'funded',
    total_amount: quote.buyerTotal,
    amount_released: 0,
    currency: String(service.currency || body.currency || 'USD'),
    project_details: String(body.projectDetails || ''),
    deadline: String(body.deadline || ''),
    payment_breakdown: {
      subtotal: quote.subtotal,
      escrowFee: quote.escrowFee,
      platformFee: quote.platformFee,
      buyerTotal: quote.buyerTotal,
      creatorNet: quote.creatorNet
    },
    milestones: Array.isArray(body.milestones) ? body.milestones : [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    const { error } = await supabase.from('freelance_escrow_orders').insert(order);
    if (error) return fail(error.message, 500);
  }
  if (String(order.freelancer_actor_id || '')) {
    await appendFinanceLedgerEntry({
      id: `fin-ledger-${String(order.id)}`,
      actorId: String(order.freelancer_actor_id || ''),
      profileSlug: String(order.freelancer_actor_id || ''),
      pillar: 'freelancing',
      type: 'sale',
      status: 'pending_payout',
      item: String(order.service_title || ''),
      grossAmount: Number(quote.subtotal),
      platformFeeAmount: Number(quote.platformFee),
      processorFeeAmount: 0,
      escrowFeeAmount: Number(quote.escrowFee),
      refundAmount: 0,
      disputeAmount: 0,
      creatorNetAmount: Number(quote.creatorNet),
      disputeReason: '',
      sourceType: 'service',
      sourceId: String(order.service_id || body.serviceId || order.id),
      metadata: {
        currency: String(order.currency || body.currency || 'INDI'),
        orderId: String(order.id),
        serviceId: String(order.service_id || body.serviceId || ''),
        freelancerActorId: String(order.freelancer_actor_id || '')
      },
      createdAt: String(order.created_at)
    });
  }

  return NextResponse.json({ success: true, order: mapEscrowOrder(order), feeBreakdown: order.payment_breakdown }, { status: 201 });
}

async function releaseEscrowMilestone(orderId: string, body: R) {
  const amount = Number(body.amount || 0);
  const milestoneId = String(body.milestoneId || '').trim();
  if (!amount || !milestoneId) return fail('milestoneId and amount are required');

  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    const { data } = await supabase.from('freelance_escrow_orders').select('*').eq('id', orderId).maybeSingle();
    const existing = (data as R | null) || {};
    const released = Number(existing.amount_released || 0) + amount;
    const milestones = Array.isArray(existing.milestones) ? (existing.milestones as R[]) : [];
    const updatedMilestones = milestones.map((milestone) =>
      String(milestone.id || '') === milestoneId
        ? { ...milestone, status: 'completed', completedAt: new Date().toISOString().slice(0, 10) }
        : milestone
    );
    const { error } = await supabase
      .from('freelance_escrow_orders')
      .update({
        amount_released: released,
        milestones: updatedMilestones,
        status: released >= Number(existing.total_amount || 0) ? 'completed' : 'in_escrow',
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);
    if (error) return fail(error.message, 500);
  }

  return NextResponse.json({ success: true, orderId, milestoneId, amountReleased: amount });
}

async function event(body: R) {
  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    await supabase.from('marketplace_events').insert({
      id: crypto.randomUUID(),
      pillar: 'freelancing',
      entity_type: 'service',
      entity_id: String(body.serviceId || ''),
      event_name: String(body.event || 'view'),
      actor_id: String(body.actorId || ''),
      metadata: body.metadata || {},
      created_at: new Date().toISOString()
    });
  }
  return NextResponse.json({ ok: true });
}

async function report(serviceId: string, body: R, req: NextRequest) {
  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    await supabase.from('freelance_service_reports').insert({
      id: `fsr-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      service_id: serviceId,
      reporter_actor_id: (req.headers.get('x-actor-id') || req.headers.get('x-wallet-address') || '').toLowerCase(),
      reason: String(body.reason || 'policy'),
      details: String(body.details || ''),
      status: 'open',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  }
  return NextResponse.json({ success: true });
}

async function heatmap() {
  if (!isSupabaseServerConfigured()) return NextResponse.json({});
  const supabase = createSupabaseServerClient();
  const { data } = await supabase.from('marketplace_events').select('*').eq('pillar', 'freelancing').limit(5000);
  const h: Record<string, number> = {};
  (data || []).forEach((row: any) => {
    const c = String(row?.metadata?.category || 'all');
    h[c] = (h[c] || 0) + 1;
  });
  return NextResponse.json(h);
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug = [] } = await params;
  const [a, b] = slug;
  if (a === 'marketplace' && b === 'services') return list(req);
  if (a === 'orders' && b === 'me') return listEscrowOrders(req);
  if (a === 'analytics' && b === 'heatmap') return heatmap();
  if (a === 'moderation' && b === 'queue') {
    if (!isSupabaseServerConfigured()) return NextResponse.json({ status: true, data: { reports: [] } });
    const supabase = createSupabaseServerClient();
    const status = String(req.nextUrl.searchParams.get('status') || 'open');
    const { data, error } = await supabase.from('freelance_service_reports').select('*').eq('status', status).order('created_at', { ascending: false }).limit(100);
    if (error) return fail(error.message, 500);
    const reports = (data || []).map((r: any) => ({
      _id: r.id,
      serviceId: r.service_id,
      reporterAddress: r.reporter_actor_id,
      reason: r.reason,
      details: r.details,
      status: r.status,
      createdAt: r.created_at
    }));
    return NextResponse.json({ status: true, data: { reports } });
  }
  return fail('Unsupported freelancers endpoint', 404);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug = [] } = await params;
  const [a, b, c, d, e] = slug;
  const body = (await req.json().catch(() => ({}))) as R;
  if (a === 'analytics' && b === 'event') return event(body);
  if (a === 'marketplace' && b === 'services' && c && d === 'book') return createEscrowOrder(c, req, body);
  if (a === 'orders' && b && c === 'milestones' && d && e === 'release') return releaseEscrowMilestone(b, body);
  if (a === 'marketplace' && b === 'services' && c && ['shortlist', 'share'].includes(d || '')) {
    await event({ event: `service_${d}`, serviceId: c, metadata: body });
    return NextResponse.json({ success: true });
  }
  if (a === 'marketplace' && b === 'services' && c && d === 'report') return report(c, body, req);
  if (a === 'moderation' && b === 'reports' && c && d === 'decision') {
    if (isSupabaseServerConfigured()) {
      const supabase = createSupabaseServerClient();
      const decision = String(body.decision || 'review');
      const status = decision === 'resolve' ? 'resolved' : decision === 'dismiss' ? 'dismissed' : 'under_review';
      await supabase.from('freelance_service_reports').update({ status, updated_at: new Date().toISOString() }).eq('id', c);
    }
    return NextResponse.json({ status: true });
  }
  return fail('Unsupported freelancers endpoint', 404);
}
