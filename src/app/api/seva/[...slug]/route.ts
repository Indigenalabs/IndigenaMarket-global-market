import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient, isSupabaseServerConfigured } from '@/app/lib/supabase/server';
import { resolveRequestActorId, resolveRequestWallet } from '@/app/lib/requestIdentity';
import { requirePlatformAdmin } from '@/app/lib/platformAdminAuth';

type R = Record<string, unknown>;

type LocalSevaRequest = {
  id: string;
  requester_actor_id: string;
  requester_wallet: string;
  requester_label: string;
  title: string;
  community: string;
  nation: string;
  category: string;
  target_amount: number | null;
  summary: string;
  impact_plan: string;
  status: string;
  review_notes?: string;
  reviewed_at?: string | null;
  reviewed_by_actor?: string | null;
  published_project_id?: string | null;
  created_at: string;
  updated_at: string;
};

const localRequestStore = new Map<string, LocalSevaRequest>();
const localPublishedProjects = new Map<string, R>();

function fail(message: string, status = 400) {
  return NextResponse.json({ status: false, message }, { status });
}

function normalizeWallet(value: unknown) {
  return String(value || '').trim().toLowerCase();
}

function mapCause(row: R) {
  const goal = Number(row.target_amount || 0);
  const current = Number(row.raised_amount || 0);
  const metadata = (row.metadata && typeof row.metadata === 'object' ? row.metadata : {}) as R;
  const impactMeta = (metadata.impact && typeof metadata.impact === 'object' ? metadata.impact : {}) as R;
  return {
    causeId: String(row.id),
    name: String(row.title || 'Cause'),
    description: String(row.description || metadata.description || ''),
    community: String(row.community || metadata.community || ''),
    nation: String(row.nation || metadata.nation || ''),
    category: String(row.category || 'cultural_education'),
    fundingGoal: goal,
    currentFunding: current,
    progress: goal > 0 ? Math.min(100, Math.round((current / goal) * 100)) : 0,
    status: String(row.status || 'active'),
    imageUrl: String(row.image_url || metadata.image_url || ''),
    verifiedByElder: Boolean(row.elder_verified || metadata.elder_verified),
    impact: {
      landProtected: Number(row.land_protected || impactMeta.landProtected || 0),
      languageLessonsFunded: Number(row.language_lessons || impactMeta.languageLessonsFunded || 0),
      artistsSupported: Number(row.artists_supported || impactMeta.artistsSupported || 0)
    }
  };
}

function mapRequest(row: R) {
  return {
    requestId: String(row.id),
    requesterActorId: String(row.requester_actor_id || ''),
    requesterWallet: String(row.requester_wallet || ''),
    requesterLabel: String(row.requester_label || ''),
    title: String(row.title || ''),
    community: String(row.community || ''),
    nation: String(row.nation || ''),
    category: String(row.category || 'cultural_education'),
    targetAmount: Number(row.target_amount || 0),
    summary: String(row.summary || ''),
    impactPlan: String(row.impact_plan || ''),
    status: String(row.status || 'pending_review'),
    reviewNotes: String(row.review_notes || ''),
    reviewedAt: String(row.reviewed_at || ''),
    reviewedByActor: String(row.reviewed_by_actor || ''),
    publishedProjectId: String(row.published_project_id || ''),
    createdAt: String(row.created_at || ''),
    updatedAt: String(row.updated_at || '')
  };
}

function buildPublishedProject(request: LocalSevaRequest, publishedBy: string, fundId: string) {
  const publishedProjectId = `svp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const category = request.category;
  return {
    id: publishedProjectId,
    organizer_actor_id: 'platform',
    title: request.title,
    category,
    target_amount: request.target_amount || 0,
    raised_amount: 0,
    currency: 'USD',
    status: 'active',
    metadata: {
      description: request.summary,
      community: request.community,
      nation: request.nation,
      image_url: '',
      elder_verified: true,
      impact: {
        landProtected: 0,
        languageLessonsFunded: 0,
        artistsSupported: 0
      },
      governance: {
        fundId,
        publishedBy,
        sourceRequestId: request.id,
        reviewNotes: request.review_notes || '',
        impactPlan: request.impact_plan
      }
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

async function listRequestsForRequester(actorId: string, wallet: string) {
  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    const filters: string[] = [];
    if (actorId && actorId !== 'guest') filters.push(`requester_actor_id.eq.${actorId}`);
    if (wallet) filters.push(`requester_wallet.eq.${wallet}`);
    if (filters.length === 0) return [];
    const { data, error } = await supabase
      .from('seva_project_requests')
      .select('*')
      .or(filters.join(','))
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return (data || []).map((row) => mapRequest(row as unknown as R));
  }

  return Array.from(localRequestStore.values())
    .filter((row) => (actorId && row.requester_actor_id === actorId) || (wallet && row.requester_wallet === wallet))
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .map((row) => mapRequest(row as unknown as R));
}

async function listRequestsForReview() {
  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from('seva_project_requests')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return (data || []).map((row) => mapRequest(row as unknown as R));
  }

  return Array.from(localRequestStore.values())
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .map((row) => mapRequest(row as unknown as R));
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug = [] } = await params;
  const [a, b] = slug;

  if (a === 'causes') {
    if (!isSupabaseServerConfigured()) {
      return NextResponse.json({ status: true, causes: Array.from(localPublishedProjects.values()).map((row) => mapCause(row)) });
    }
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase.from('seva_projects').select('*').order('created_at', { ascending: false });
    if (error) return fail(error.message, 500);
    return NextResponse.json({ status: true, causes: (data || []).map((x) => mapCause(x as unknown as R)) });
  }

  if (a === 'stats') {
    if (!isSupabaseServerConfigured()) return NextResponse.json({ status: true, stats: { seva: {}, causes: {} } });
    const supabase = createSupabaseServerClient();
    const [projects, donations] = await Promise.all([
      supabase.from('seva_projects').select('*'),
      supabase.from('seva_donations').select('*')
    ]);
    const p = projects.data || [];
    const d = donations.data || [];
    const totalFunding = p.reduce((sum: number, row: any) => sum + Number(row.raised_amount || 0), 0);
    return NextResponse.json({
      status: true,
      stats: {
        seva: { totalSEVAEarned: 0, totalSEVADonated: d.reduce((s: number, r: any) => s + Number(r.amount || 0), 0), totalUsers: 0 },
        causes: { totalCauses: p.length, totalFunding, totalLandProtected: 0, totalLanguageLessons: 0 }
      }
    });
  }

  if (a === 'requests' && b === 'mine') {
    const actorId = resolveRequestActorId(req);
    const wallet = resolveRequestWallet(req);
    if ((!actorId || actorId === 'guest') && !wallet) {
      return fail('Authenticated account session required', 401);
    }
    try {
      const requests = await listRequestsForRequester(actorId, wallet);
      return NextResponse.json({ status: true, requests });
    } catch (error) {
      return fail(error instanceof Error ? error.message : 'Unable to load Seva requests', 500);
    }
  }

  if (a === 'requests' && b === 'review') {
    const gate = await requirePlatformAdmin(req, ['admin', 'platform_ops', 'compliance_admin']);
    if (gate.error) return gate.error;
    try {
      const requests = await listRequestsForReview();
      return NextResponse.json({ status: true, requests });
    } catch (error) {
      return fail(error instanceof Error ? error.message : 'Unable to load Seva review queue', 500);
    }
  }

  return fail('Unsupported seva endpoint', 404);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug = [] } = await params;
  const [a] = slug;
  const body = (await req.json().catch(() => ({}))) as R;

  if (a === 'donate') {
    const causeId = String(body.causeId || '').trim();
    const amount = Number(body.amount || 0);
    const walletAddress = normalizeWallet(body.walletAddress || resolveRequestWallet(req));
    if (!causeId || amount <= 0) return fail('causeId and positive amount are required');
    if (!walletAddress) return fail('Authenticated account session required', 401);
    if (isSupabaseServerConfigured()) {
      const supabase = createSupabaseServerClient();
      await supabase.from('seva_donations').insert({
        id: `sdn-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        cause_id: causeId,
        wallet_address: walletAddress,
        amount,
        message: String(body.message || ''),
        created_at: new Date().toISOString()
      });
      const project = await supabase.from('seva_projects').select('*').eq('id', causeId).maybeSingle();
      if (project.data) {
        const raised = Number((project.data as any).raised_amount || 0) + amount;
        await supabase.from('seva_projects').update({ raised_amount: raised, updated_at: new Date().toISOString() }).eq('id', causeId);
      }
    }
    return NextResponse.json({ status: true, message: 'Donation recorded' });
  }

  if (a === 'request-project') {
    const title = String(body.title || '').trim();
    const summary = String(body.summary || '').trim();
    const impactPlan = String(body.impactPlan || '').trim();
    const category = String(body.category || 'cultural_education').trim();
    const targetAmount = Number(body.targetAmount || 0);

    if (!title || !summary || !impactPlan) {
      return fail('title, summary, and impactPlan are required');
    }
    const requesterWallet = normalizeWallet(body.walletAddress || resolveRequestWallet(req));
    if (!requesterWallet) {
      return fail('Authenticated account session required', 401);
    }

    const requestId = `svr-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const now = new Date().toISOString();
    const payload: LocalSevaRequest = {
      id: requestId,
      requester_actor_id: String(resolveRequestActorId(req) || body.requesterLabel || requesterWallet).trim(),
      requester_wallet: requesterWallet,
      requester_label: String(body.requesterLabel || requesterWallet).trim(),
      title,
      community: String(body.community || '').trim(),
      nation: String(body.nation || '').trim(),
      category,
      target_amount: targetAmount > 0 ? targetAmount : null,
      summary,
      impact_plan: impactPlan,
      status: 'pending_review',
      created_at: now,
      updated_at: now,
      review_notes: '',
      reviewed_at: null,
      reviewed_by_actor: null,
      published_project_id: null
    };

    if (isSupabaseServerConfigured()) {
      const supabase = createSupabaseServerClient();
      const { error } = await supabase.from('seva_project_requests').insert(payload);
      if (error) return fail(error.message, 500);
    } else {
      localRequestStore.set(requestId, payload);
    }

    return NextResponse.json({
      status: true,
      requestId,
      message: 'Seva project request submitted for platform review.'
    });
  }

  if (a === 'requests-review') {
    const gate = await requirePlatformAdmin(req, ['admin', 'platform_ops', 'compliance_admin']);
    if (gate.error) return gate.error;

    const requestId = String(body.requestId || '').trim();
    const reviewAction = String(body.reviewAction || '').trim();
    const reviewNotes = String(body.reviewNotes || '').trim();
    const fundId = String(body.fundId || 'innovation').trim();

    if (!requestId || !['approved', 'needs_info', 'rejected'].includes(reviewAction)) {
      return fail('requestId and valid reviewAction are required');
    }

    const reviewer = gate.identity?.actorId || 'platform-admin';
    const reviewedAt = new Date().toISOString();

    if (isSupabaseServerConfigured()) {
      const supabase = createSupabaseServerClient();
      const requestRes = await supabase.from('seva_project_requests').select('*').eq('id', requestId).maybeSingle();
      if (requestRes.error) return fail(requestRes.error.message, 500);
      if (!requestRes.data) return fail('Request not found', 404);

      const request = requestRes.data as unknown as LocalSevaRequest;
      let publishedProjectId: string | null = null;

      if (reviewAction === 'approved') {
        const project = buildPublishedProject(request, reviewer, fundId);
        publishedProjectId = String(project.id);
        const { error: projectError } = await supabase.from('seva_projects').insert(project);
        if (projectError) return fail(projectError.message, 500);
      }

      const { error: updateError } = await supabase
        .from('seva_project_requests')
        .update({
          status: reviewAction,
          review_notes: reviewNotes,
          reviewed_at: reviewedAt,
          reviewed_by_actor: reviewer,
          published_project_id: publishedProjectId,
          updated_at: reviewedAt
        })
        .eq('id', requestId);
      if (updateError) return fail(updateError.message, 500);

      return NextResponse.json({ status: true, requestId, publishedProjectId, message: 'Review saved.' });
    }

    const existing = localRequestStore.get(requestId);
    if (!existing) return fail('Request not found', 404);
    let publishedProjectId: string | null = null;
    if (reviewAction === 'approved') {
      const project = buildPublishedProject(existing, reviewer, fundId);
      publishedProjectId = String(project.id);
      localPublishedProjects.set(publishedProjectId, project);
    }
    localRequestStore.set(requestId, {
      ...existing,
      status: reviewAction,
      review_notes: reviewNotes,
      reviewed_at: reviewedAt,
      reviewed_by_actor: reviewer,
      published_project_id: publishedProjectId,
      updated_at: reviewedAt
    });
    return NextResponse.json({ status: true, requestId, publishedProjectId, message: 'Review saved.' });
  }

  return fail('Unsupported seva endpoint', 404);
}



