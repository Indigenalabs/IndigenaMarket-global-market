import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient, isSupabaseServerConfigured } from '@/app/lib/supabase/server';
import { resolveRequestActorId, resolveRequestWallet } from '@/app/lib/requestIdentity';
import { calculateTransactionQuote } from '@/app/lib/monetization';
import { resolveRequestPlanIds } from '@/app/lib/monetizationEntitlements';
import { appendFinanceLedgerEntry } from '@/app/lib/financeLedger';
import { canAccessHeritageLevel, resolveHeritageEntitlements } from '@/app/lib/archiveAccess';
import { getActorEntitlements } from '@/app/lib/subscriptionState';
import { listInstitutionalArchiveSeats, upsertInstitutionalArchiveSeat } from '@/app/lib/institutionalArchiveSeats';
import { appendArchiveAccessLog } from '@/app/lib/archiveAccessLogs';

type JsonMap = Record<string, unknown>;

function ok(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

function fail(message: string, status = 400) {
  return NextResponse.json({ message }, { status });
}

function actor(req: NextRequest) {
  return resolveRequestActorId(req);
}

async function heritageEntitlements(req: NextRequest) {
  return getActorEntitlements(actor(req), resolveRequestWallet(req));
}

async function resolveListingPrice(listingId: string, fallbackAmount = 100) {
  if (!isSupabaseServerConfigured()) return { amount: fallbackAmount, currency: 'USD' };
  const supabase = createSupabaseServerClient();
  const { data } = await supabase.from('language_heritage_listings').select('price,currency').eq('id', listingId).maybeSingle();
  return {
    amount: Number((data as JsonMap | null)?.price || fallbackAmount),
    currency: String((data as JsonMap | null)?.currency || 'USD')
  };
}

async function resolveListingSaleContext(listingId: string, fallbackAmount = 100) {
  if (!isSupabaseServerConfigured()) {
    return {
      amount: fallbackAmount,
      currency: 'USD',
      contributorActorId: listingId,
      title: `Heritage listing ${listingId}`
    };
  }
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from('language_heritage_listings')
    .select('price,currency,contributor_actor_id,title')
    .eq('id', listingId)
    .maybeSingle();
  const row = (data as JsonMap | null) || null;
  return {
    amount: Number(row?.price || fallbackAmount),
    currency: String(row?.currency || 'USD'),
    contributorActorId: String(row?.contributor_actor_id || listingId),
    title: String(row?.title || `Heritage listing ${listingId}`)
  };
}

function mapListing(row: JsonMap) {
  return {
    id: String(row.id || ''),
    title: String(row.title || ''),
    categoryId: String(row.kind || 'language-learning-materials'),
    categoryLabel: String(row.kind || 'Language & Heritage'),
    summary: String(row.summary || ''),
    nation: String(row.language_name || row.nation || 'Indigenous Nation'),
    keeperName: String(row.contributor_actor_id || 'Community Keeper'),
    format: String(row.format || 'document'),
    accessLevel: String(row.access_tier || 'public'),
    verifiedSpeaker: Boolean(row.verified_speaker ?? true),
    elderApproved: Boolean(row.elder_verified),
    communityControlled: Boolean(row.community_controlled ?? true),
    price: Number(row.price || 0),
    currency: String(row.currency || 'USD'),
    image: String(row.image || 'https://images.unsplash.com/photo-1491841573634-28140fc7ced7?w=1200&h=700&fit=crop'),
    tags: Array.isArray(row.tags) ? row.tags : [],
    rating: Number(row.rating || 4.8),
    reviews: Number(row.reviews || 0),
    createdAt: String(row.created_at || new Date().toISOString())
  };
}

function mockLanguageHeritageListing(id: string) {
  const mockRows: JsonMap[] = [
    {
      id: 'lh-1',
      title: 'Passamaquoddy Audio Conversation Pack',
      kind: 'audio-video-resources',
      summary: 'Natural dialogues between fluent speakers with slowed-learning tracks and transcripts.',
      language_name: 'Passamaquoddy',
      contributor_actor_id: 'Elder Collective Media Team',
      format: 'audio',
      access_tier: 'community',
      verified_speaker: true,
      elder_verified: true,
      community_controlled: true,
      price: 39,
      currency: 'USD',
      image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=1200&h=700&fit=crop',
      tags: ['audio', 'conversation', 'transcript'],
      rating: 4.9,
      reviews: 128,
      created_at: '2026-02-11T00:00:00.000Z'
    },
    {
      id: 'lh-5',
      title: 'Syllabics Keyboard + Font Bundle',
      kind: 'apps-tools',
      summary: 'Input tools, printable key guides, and type support for community publishing workflows.',
      language_name: 'Cree',
      contributor_actor_id: 'Northern Archive Lab',
      format: 'software',
      access_tier: 'public',
      verified_speaker: true,
      elder_verified: false,
      community_controlled: true,
      price: 24,
      currency: 'USD',
      image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&h=700&fit=crop',
      tags: ['keyboard', 'fonts', 'publishing'],
      rating: 4.7,
      reviews: 52,
      created_at: '2026-01-20T00:00:00.000Z'
    }
  ];
  const match = mockRows.find((row) => String(row.id) === id);
  return match ? mapListing(match) : null;
}

async function listListings(req: NextRequest) {
  if (!isSupabaseServerConfigured()) return ok({ items: [], page: 1, pages: 1, total: 0 });
  const supabase = createSupabaseServerClient();
  const page = Math.max(1, Number(req.nextUrl.searchParams.get('page') || '1'));
  const limit = Math.min(50, Math.max(1, Number(req.nextUrl.searchParams.get('limit') || '20')));
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let q = supabase.from('language_heritage_listings').select('*', { count: 'exact' }).range(from, to).order('created_at', { ascending: false });
  const search = String(req.nextUrl.searchParams.get('q') || '').trim();
  if (search) q = q.ilike('title', `%${search}%`);
  const categoryId = String(req.nextUrl.searchParams.get('categoryId') || '').trim();
  if (categoryId) q = q.eq('kind', categoryId);
  const accessLevel = String(req.nextUrl.searchParams.get('accessLevel') || '').trim();
  if (accessLevel && accessLevel !== 'all') q = q.eq('access_tier', accessLevel);
  const minPrice = req.nextUrl.searchParams.get('minPrice');
  const maxPrice = req.nextUrl.searchParams.get('maxPrice');
  if (minPrice) q = q.gte('price', Number(minPrice));
  if (maxPrice) q = q.lte('price', Number(maxPrice));

  const { data, count, error } = await q;
  if (error) return fail(error.message, 500);
  const items = (data || []).map((row) => mapListing(row as unknown as JsonMap));
  const total = Number(count || items.length);
  return ok({ items, page, pages: Math.max(1, Math.ceil(total / limit)), total });
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug = [] } = await params;
  const [a, b, c] = slug;

  if (a === 'listings') return listListings(req);
  if (a === 'receipts' && b === 'me') {
    if (!isSupabaseServerConfigured()) return ok({ receipts: [] });
    const supabase = createSupabaseServerClient();
    const rows = await supabase.from('language_heritage_receipts').select('*').eq('actor_id', actor(req)).order('created_at', { ascending: false }).limit(100);
    if (rows.error) return fail(rows.error.message, 500);
    return ok({
      receipts: (rows.data || []).map((r) => ({
        receiptId: (r as JsonMap).receipt_id,
        listingId: (r as JsonMap).listing_id,
        amount: Number((r as JsonMap).amount || 0),
        currency: (r as JsonMap).currency || 'USD',
        feeBreakdown: ((r as JsonMap).payment_breakdown as JsonMap | undefined) || null,
        createdAt: (r as JsonMap).created_at
      }))
    });
  }
  if (a === 'access-requests' && b === 'me') {
    if (!isSupabaseServerConfigured()) return ok({ requests: [] });
    const supabase = createSupabaseServerClient();
    const rows = await supabase.from('language_heritage_access_requests').select('*').eq('actor_id', actor(req)).order('created_at', { ascending: false }).limit(100);
    if (rows.error) return fail(rows.error.message, 500);
    return ok({ requests: (rows.data || []).map((r) => ({ requestId: (r as JsonMap).request_id, listingId: (r as JsonMap).listing_id, walletAddress: (r as JsonMap).wallet_address, status: (r as JsonMap).status, note: (r as JsonMap).note, reviewedBy: (r as JsonMap).reviewed_by, reviewedAt: (r as JsonMap).reviewed_at, createdAt: (r as JsonMap).created_at, updatedAt: (r as JsonMap).updated_at })) });
  }
  if (a === 'languages') {
    if (!isSupabaseServerConfigured()) return ok({ items: [] });
    const supabase = createSupabaseServerClient();
    const rows = await supabase.from('language_heritage_listings').select('language_name,kind,price');
    if (rows.error) return fail(rows.error.message, 500);
    const grouped = new Map<string, { total: number; sum: number; categories: Set<string> }>();
    (rows.data || []).forEach((r) => {
      const row = r as JsonMap;
      const name = String(row.language_name || 'Unknown Language');
      const entry = grouped.get(name) || { total: 0, sum: 0, categories: new Set<string>() };
      entry.total += 1;
      entry.sum += Number(row.price || 0);
      entry.categories.add(String(row.kind || 'general'));
      grouped.set(name, entry);
    });
    const items = Array.from(grouped.entries()).map(([name, v]) => ({ languageId: name.toLowerCase().replace(/\s+/g, '-'), name, totalItems: v.total, avgRating: 4.8, categories: Array.from(v.categories) }));
    return ok({ items });
  }
  if (a === 'communities' && b) {
    if (!isSupabaseServerConfigured()) {
      return ok({
        profile: {
          communityId: b,
          nation: b,
          totalItems: 0,
          categoryCounts: {},
          featured: []
        }
      });
    }
    const supabase = createSupabaseServerClient();
    const rows = await supabase.from('language_heritage_listings').select('*').ilike('community', `%${b}%`);
    if (rows.error) return fail(rows.error.message, 500);
    const list = (rows.data || []).map((x) => mapListing(x as unknown as JsonMap));
    const categoryCounts: Record<string, number> = {};
    list.forEach((l) => { categoryCounts[l.categoryId] = (categoryCounts[l.categoryId] || 0) + 1; });
    return ok({ profile: { communityId: b, nation: b, totalItems: list.length, categoryCounts, featured: list.slice(0, 6) } });
  }
  if (a === 'dictionary' && b) {
    return ok({
      entry: {
        entryId: b,
        term: b,
        language: 'Indigenous Language',
        pronunciation: 'N/A',
        partOfSpeech: 'noun',
        definitions: ['Community dictionary entry'],
        examples: ['Example usage'],
        culturalNote: 'Community supplied note.'
      }
    });
  }
  if (a === 'recordings' && b && c === 'download') {
    if (!isSupabaseServerConfigured()) return fail('Archive download unavailable without configured storage.', 503);
    const supabase = createSupabaseServerClient();
    const row = await supabase.from('language_heritage_listings').select('*').eq('id', b).maybeSingle();
    if (row.error) return fail(row.error.message, 500);
    if (!row.data) return fail('Recording not found.', 404);
    const listing = mapListing(row.data as unknown as JsonMap);
    const entitlements = await heritageEntitlements(req);
    if (!canAccessHeritageLevel(listing.accessLevel as never, entitlements)) {
      return fail('Archive download requires an eligible archive access plan.', 403);
    }
    await appendArchiveAccessLog({
      actorId: actor(req),
      walletAddress: resolveRequestWallet(req),
      listingId: listing.id,
      action: 'recording-download',
      accessLevel: listing.accessLevel,
      fileName: `${listing.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.zip`
    });
    return ok({
      download: {
        listingId: listing.id,
        fileName: `${listing.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.zip`,
        downloadUrl: `/language-heritage/recordings/${encodeURIComponent(listing.id)}?download=granted`,
        accessLevel: listing.accessLevel
      }
    });
  }
  if (a === 'recordings' && b && c === 'citation-export') {
    if (!isSupabaseServerConfigured()) return fail('Citation export unavailable without configured storage.', 503);
    const supabase = createSupabaseServerClient();
    const row = await supabase.from('language_heritage_listings').select('*').eq('id', b).maybeSingle();
    if (row.error) return fail(row.error.message, 500);
    if (!row.data) return fail('Recording not found.', 404);
    const listing = mapListing(row.data as unknown as JsonMap);
    const entitlements = resolveHeritageEntitlements(await heritageEntitlements(req));
    if (!entitlements.hasResearcherAccess) {
      return fail('Citation export requires Researcher or Institutional Archive access.', 403);
    }
    const citation = `${listing.keeperName}. "${listing.title}." ${listing.nation}. Accessed ${new Date().toISOString().slice(0, 10)} via Indigena Global Market.`;
    await appendArchiveAccessLog({
      actorId: actor(req),
      walletAddress: resolveRequestWallet(req),
      listingId: listing.id,
      action: 'citation-export',
      accessLevel: listing.accessLevel,
      fileName: `${listing.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-citation.txt`
    });
    return ok({
      citation: {
        listingId: listing.id,
        formats: {
          plain: citation,
          mla: `${listing.keeperName}. "${listing.title}." Indigena Global Market, ${new Date(listing.createdAt).getFullYear()}.`,
          apa: `${listing.keeperName} (${new Date(listing.createdAt).getFullYear()}). ${listing.title}. Indigena Global Market.`
        }
      }
    });
  }
  if (a === 'recordings' && b) {
    if (!isSupabaseServerConfigured()) return ok({ recording: mockLanguageHeritageListing(b) });
    const supabase = createSupabaseServerClient();
    const row = await supabase.from('language_heritage_listings').select('*').eq('id', b).maybeSingle();
    if (row.error) return fail(row.error.message, 500);
    return ok({ recording: row.data ? mapListing(row.data as unknown as JsonMap) : null });
  }
  if (a === 'institutional' && b === 'seats') {
    const entitlements = resolveHeritageEntitlements(await heritageEntitlements(req));
    if (!entitlements.hasInstitutionalAccess) {
      return fail('Institutional archive seats require an Institutional Archive plan.', 403);
    }
    const seats = await listInstitutionalArchiveSeats(actor(req));
    return ok({ seats, seatLimit: entitlements.institutionalSeatLimit });
  }
  if (a === 'library' && b === 'offline-pack') {
    const entitlements = await heritageEntitlements(req);
    if (!canAccessHeritageLevel('community', entitlements)) {
      return fail('Offline library pack requires archive access.', 403);
    }
    await appendArchiveAccessLog({
      actorId: actor(req),
      walletAddress: resolveRequestWallet(req),
      listingId: 'library-offline-pack',
      action: 'offline-pack',
      accessLevel: 'community',
      fileName: 'indigena-language-library-offline-pack.zip'
    });
    return ok({
      bundle: {
        fileName: 'indigena-language-library-offline-pack.zip',
        downloadUrl: '/language-heritage/my-library?offline-pack=ready',
        scope: 'community'
      }
    });
  }
  if (a === 'library' && b === 'citation-bundle') {
    const entitlements = resolveHeritageEntitlements(await heritageEntitlements(req));
    if (!entitlements.hasResearcherAccess) {
      return fail('Citation bundle requires Researcher or Institutional Archive access.', 403);
    }
    await appendArchiveAccessLog({
      actorId: actor(req),
      walletAddress: resolveRequestWallet(req),
      listingId: 'library-citation-bundle',
      action: 'citation-bundle',
      accessLevel: 'researcher',
      fileName: 'indigena-language-library-citations.txt'
    });
    return ok({
      bundle: {
        fileName: 'indigena-language-library-citations.txt',
        citations: [
          'Sample citation bundle generated from your licensed archive assets.',
          'Use researcher or institutional access for full export coverage.'
        ]
      }
    });
  }
  if (a === 'tools' && b) {
    if (!isSupabaseServerConfigured()) return ok({ tool: mockLanguageHeritageListing(b) });
    const supabase = createSupabaseServerClient();
    const row = await supabase.from('language_heritage_listings').select('*').eq('id', b).maybeSingle();
    if (row.error) return fail(row.error.message, 500);
    return ok({ tool: row.data ? mapListing(row.data as unknown as JsonMap) : null });
  }
  if (a === 'contributor-dashboard' && b === 'me') {
    if (!isSupabaseServerConfigured()) return ok({ materialsCount: 0, monthlyRevenue: 0, pendingApprovals: 0, metadataCompletionRate: 0, reviewSlaHours: 0, monthlyReach: 0 });
    const supabase = createSupabaseServerClient();
    const listings = await supabase.from('language_heritage_listings').select('*', { count: 'exact', head: true }).eq('contributor_actor_id', actor(req));
    const receipts = await supabase.from('language_heritage_receipts').select('amount').eq('actor_id', actor(req));
    const monthlyRevenue = (receipts.data || []).reduce((sum, r) => sum + Number((r as JsonMap).amount || 0), 0);
    return ok({ materialsCount: Number(listings.count || 0), monthlyRevenue, pendingApprovals: 0, metadataCompletionRate: 80, reviewSlaHours: 48, monthlyReach: 0 });
  }
  if (a === 'grants') {
    return ok({ opportunities: [
      { id: 'grant-ana', title: 'ANA Language Preservation', sponsor: 'ANA', amountLabel: 'Up to $150,000', deadlineLabel: 'Rolling', type: 'federal', summary: 'Supports language documentation and revitalization.' }
    ] });
  }

  return fail('Unsupported language-heritage endpoint', 404);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug = [] } = await params;
  const [a, b, c] = slug;
  const body = (await req.json().catch(() => ({}))) as JsonMap;

  if (a === 'events') {
    if (isSupabaseServerConfigured()) {
      const supabase = createSupabaseServerClient();
      await supabase.from('language_heritage_events').insert({
        id: `lhevt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        listing_id: body.listingId || null,
        event: String(body.event || 'view'),
        actor_id: actor(req),
        metadata: body.metadata || {},
        created_at: new Date().toISOString()
      });
    }
    return ok({ tracked: true });
  }

  if (a === 'listings' && b && c === 'access-request') {
    const requestId = `req-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const row = {
      requestId,
      listingId: b,
      walletAddress: String(body.walletAddress || actor(req)),
      status: 'pending',
      note: String(body.note || ''),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    if (isSupabaseServerConfigured()) {
      const supabase = createSupabaseServerClient();
      await supabase.from('language_heritage_access_requests').insert({
        request_id: row.requestId,
        listing_id: row.listingId,
        wallet_address: row.walletAddress,
        actor_id: actor(req),
        status: row.status,
        note: row.note,
        created_at: row.createdAt,
        updated_at: row.updatedAt
      });
    }
    return ok({ request: row }, 201);
  }

  if (a === 'listings' && b && c === 'payment-intent') {
    const pricing = await resolveListingPrice(b, Number(body.amount || 100));
    const { creatorPlanId, memberPlanId } = await resolveRequestPlanIds(req, body);
    const quote = calculateTransactionQuote({
      pillar: 'language-heritage',
      subtotal: pricing.amount,
      creatorPlanId,
      memberPlanId
    });
    return ok({
      paymentIntent: {
        intentId: `lhpi-${Date.now()}`,
        clientSecret: `lhcs-${Date.now()}`,
        amount: quote.buyerTotal,
        currency: pricing.currency,
        expiresAt: new Date(Date.now() + 1800000).toISOString()
      },
      feeBreakdown: quote
    });
  }

  if (a === 'listings' && b && c === 'payment-confirm') {
    const receiptId = `lhrcpt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const saleContext = await resolveListingSaleContext(b, Number(body.amount || 100));
    const { creatorPlanId, memberPlanId } = await resolveRequestPlanIds(req, body);
    const quote = calculateTransactionQuote({
      pillar: 'language-heritage',
      subtotal: saleContext.amount,
      creatorPlanId,
      memberPlanId
    });
    if (isSupabaseServerConfigured()) {
      const supabase = createSupabaseServerClient();
      await supabase.from('language_heritage_receipts').insert({
        receipt_id: receiptId,
        listing_id: b,
        actor_id: actor(req),
        amount: quote.buyerTotal,
        currency: saleContext.currency,
        payment_breakdown: {
          subtotal: quote.subtotal,
          buyerServiceFee: quote.buyerServiceFee,
          platformFee: quote.platformFee,
          buyerTotal: quote.buyerTotal,
          creatorNet: quote.creatorNet
        },
        created_at: new Date().toISOString()
      });
    }
    await appendFinanceLedgerEntry({
      id: `fin-ledger-${receiptId}`,
      actorId: saleContext.contributorActorId,
      profileSlug: saleContext.contributorActorId,
      pillar: 'language-heritage',
      type: 'sale',
      status: 'paid',
      item: saleContext.title,
      grossAmount: Number(quote.subtotal),
      platformFeeAmount: Number(quote.platformFee),
      processorFeeAmount: 0,
      escrowFeeAmount: 0,
      refundAmount: 0,
      disputeAmount: 0,
      creatorNetAmount: Number(quote.creatorNet),
      disputeReason: '',
      createdAt: new Date().toISOString()
    });
    return ok({
      receipt: {
        receiptId,
        listingId: b,
        amount: quote.buyerTotal,
        currency: saleContext.currency,
        feeBreakdown: quote,
        createdAt: new Date().toISOString()
      }
    });
  }

  if (a === 'sacred-requests') {
    const id = `sac-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    if (isSupabaseServerConfigured()) {
      const supabase = createSupabaseServerClient();
      await supabase.from('language_heritage_sacred_requests').insert({
        id,
        requester_name: String(body.requesterName || ''),
        affiliation: String(body.affiliation || ''),
        listing_id: String(body.listingId || ''),
        purpose: String(body.purpose || ''),
        justification: String(body.justification || ''),
        acknowledged_protocols: Boolean(body.acknowledgedProtocols),
        actor_id: actor(req),
        status: 'pending',
        created_at: new Date().toISOString()
      });
    }
    return ok({ requestId: id, status: 'pending' }, 201);
  }

  if (a === 'institutional' && b === 'seats') {
    const entitlements = resolveHeritageEntitlements(await heritageEntitlements(req));
    if (!entitlements.hasInstitutionalAccess) {
      return fail('Institutional archive seats require an Institutional Archive plan.', 403);
    }
    const email = String(body.email || '').trim().toLowerCase();
    const role = String(body.role || 'viewer').trim() as 'admin' | 'researcher' | 'viewer';
    if (!email) return fail('email is required.');
    const existingSeats = await listInstitutionalArchiveSeats(actor(req));
    const isExisting = existingSeats.some((seat) => seat.email === email);
    if (!isExisting && existingSeats.length >= entitlements.institutionalSeatLimit) {
      return fail('Institutional seat limit reached.', 409);
    }
    const seat = await upsertInstitutionalArchiveSeat({ actorId: actor(req), email, role });
    return ok({ seat, seatLimit: entitlements.institutionalSeatLimit }, 201);
  }

  return fail('Unsupported language-heritage endpoint', 404);
}
