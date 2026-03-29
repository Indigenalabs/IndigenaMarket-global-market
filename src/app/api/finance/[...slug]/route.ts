import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient, isSupabaseServerConfigured } from '@/app/lib/supabase/server';
import { resolveRequestActorId, resolveRequestWallet } from '@/app/lib/requestIdentity';
import { appendFinanceLedgerEntry, listFinanceLedgerEntries } from '@/app/lib/financeLedger';
import { appendFinanceCaseEvent, listFinanceCaseEvents, listFinanceCases, upsertFinanceCase, type FinanceCaseRecord } from '@/app/lib/financeCases';
import { requirePlatformAdmin } from '@/app/lib/platformAdminAuth';
import type { ProfilePillarId } from '@/app/profile/data/profileShowcase';

function fail(message: string, status = 400) {
  return NextResponse.json({ message }, { status });
}

function safeText(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback;
}

function safeNumber(value: unknown, fallback = 0) {
  return typeof value === 'number' ? value : Number(value || fallback) || fallback;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug = [] } = await params;
  const [a, b] = slug;
  const safe = String(b || '').trim().toLowerCase();
  const actorId = resolveRequestActorId(req);

  if (a === 'wallet') {
    if (!safe) return NextResponse.json({ message: 'wallet is required' }, { status: 400 });
    if (!isSupabaseServerConfigured()) {
      return NextResponse.json({ data: { walletAddress: safe, indiBalance: 0, xrpBalance: 0, usdValue: 0 } });
    }
    const supabase = createSupabaseServerClient();
    const { data } = await supabase.from('finance_wallet_snapshots').select('*').eq('wallet_address', safe).maybeSingle();
    return NextResponse.json({ data: { walletAddress: safe, indiBalance: Number((data as any)?.indi_balance || 0), xrpBalance: Number((data as any)?.xrp_balance || 0), usdValue: Number((data as any)?.usd_value || 0) } });
  }

  if (a === 'history') {
    if (!safe) return NextResponse.json({ message: 'wallet is required' }, { status: 400 });
    if (!isSupabaseServerConfigured()) return NextResponse.json({ data: [] });
    const supabase = createSupabaseServerClient();
    const { data } = await supabase.from('finance_transactions').select('*').eq('wallet_address', safe).order('created_at', { ascending: false }).limit(200);
    return NextResponse.json({ data: (data || []).map((r: any) => ({ id: r.id, type: r.type, item: r.item, amount: Number(r.amount || 0), currency: r.currency || 'INDI', status: r.status || 'completed', date: r.created_at })) });
  }

  if (a === 'ledger' && b === 'me') {
    const profileSlug = req.nextUrl.searchParams.get('profileSlug') || '';
    const walletAddress = resolveRequestWallet(req);
    const entries = await listFinanceLedgerEntries(profileSlug, actorId, []);
    return NextResponse.json({ data: entries, actorId, walletAddress });
  }

  if (a === 'cases' && b === 'me') {
    const profileSlug = req.nextUrl.searchParams.get('profileSlug') || '';
    const cases = await listFinanceCases(profileSlug, actorId);
    return NextResponse.json({ data: cases });
  }

  if (a === 'cases' && b) {
    const events = await listFinanceCaseEvents(b);
    return NextResponse.json({ data: events });
  }

  return NextResponse.json({ message: 'Unsupported finance endpoint' }, { status: 404 });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug = [] } = await params;
  const [a] = slug;
  if (a !== 'cases') return fail('Unsupported finance endpoint', 404);

  const actorId = resolveRequestActorId(req);
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return fail('Invalid finance case payload.');

  const now = new Date().toISOString();
  const record: FinanceCaseRecord = {
    id: `fin-case-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    actorId,
    profileSlug: safeText(body.profileSlug),
    pillar: safeText(body.pillar, 'digital-arts') as ProfilePillarId,
    caseType: safeText(body.caseType, 'refund') as FinanceCaseRecord['caseType'],
    status: 'open',
    item: safeText(body.item),
    amount: safeNumber(body.amount),
    reason: safeText(body.reason),
    details: safeText(body.details),
    ledgerEntryId: safeText(body.ledgerEntryId),
    resolutionNotes: '',
    createdAt: now,
    updatedAt: now
  };
  if (!record.profileSlug || !record.item || !record.reason) {
    return fail('profileSlug, item, and reason are required.');
  }

  await upsertFinanceCase(record);
  await appendFinanceCaseEvent({
    id: `fin-case-evt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    caseId: record.id,
    actorId,
    eventType: 'created',
    note: record.details || record.reason,
    createdAt: now
  });
  return NextResponse.json({ success: true, case: record }, { status: 201 });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug = [] } = await params;
  const [a, caseId] = slug;
  if (a !== 'cases' || !caseId) return fail('Unsupported finance endpoint', 404);

  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return fail('Invalid finance case update payload.');

  const actorId = resolveRequestActorId(req);
  const existing = (await listFinanceCases('', actorId)).find((entry) => entry.id === caseId)
    ?? (await listFinanceCases('')).find((entry) => entry.id === caseId);
  if (!existing) return fail('Finance case not found.', 404);

  const requestedStatus = safeText(body.status, existing.status) as FinanceCaseRecord['status'];
  const creatorCanWithdraw = existing.actorId === actorId && requestedStatus === 'withdrawn';
  if (!creatorCanWithdraw) {
    const adminGate = await requirePlatformAdmin(req);
    if (adminGate.error) return adminGate.error;
  }

  const next: FinanceCaseRecord = {
    ...existing,
    status: requestedStatus,
    resolutionNotes: safeText(body.resolutionNotes, existing.resolutionNotes),
    updatedAt: new Date().toISOString()
  };
  await upsertFinanceCase(next);

  const eventType =
    requestedStatus === 'approved'
      ? 'approved'
      : requestedStatus === 'rejected'
        ? 'rejected'
        : requestedStatus === 'resolved'
          ? 'resolved'
          : requestedStatus === 'withdrawn'
            ? 'withdrawn'
            : 'reviewed';

  await appendFinanceCaseEvent({
    id: `fin-case-evt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    caseId,
    actorId,
    eventType,
    note: safeText(body.note, next.resolutionNotes || next.reason),
    createdAt: next.updatedAt
  });

  if (requestedStatus === 'approved' || requestedStatus === 'resolved') {
    await appendFinanceLedgerEntry({
      id: `fin-ledger-case-${caseId}-${requestedStatus}`,
      actorId: existing.actorId,
      profileSlug: existing.profileSlug,
      pillar: existing.pillar,
      type: existing.caseType === 'refund' ? 'refund' : 'dispute',
      status: existing.caseType === 'refund' ? 'refunded' : 'disputed',
      item: existing.item,
      grossAmount: 0,
      platformFeeAmount: 0,
      processorFeeAmount: 0,
      escrowFeeAmount: 0,
      refundAmount: existing.caseType === 'refund' ? existing.amount : 0,
      disputeAmount: existing.caseType === 'dispute' ? existing.amount : 0,
      creatorNetAmount: 0,
      disputeReason: existing.reason,
      createdAt: next.updatedAt
    });
  }

  return NextResponse.json({ success: true, case: next });
}
