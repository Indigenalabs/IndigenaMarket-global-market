import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import {
  getAdvocacyAttorneyById,
  getAdvocacyCampaignById,
  getAdvocacyPublicData,
  getAdvocacyResourceById,
  getAdvocacyVictoryById
} from '@/app/lib/advocacyLegalPublicData';
import { createSupabaseServerClient, isSupabaseServerConfigured } from '@/app/lib/supabase/server';
import { requireAdvocacyOpsRole } from '@/app/lib/advocacyOpsAuth';
import { requireVerifiedAdvocacyActionIdentity } from '@/app/lib/advocacyActionAuth';
import { enforceSharedRateLimit } from '@/app/lib/sharedRateLimit';
import { getPillarRevenuePolicy, TEN_PILLAR_REVENUE_POLICY } from '@/app/lib/pillarRevenuePolicy';
import { loadStore, persistStore, pushAudit, pushOperationalEvent, pushPaymentWebhookEvent, store } from '@/app/api/advocacy-legal/actions/_store';
import { findSupabaseDonationByProcessorEvent, getSupabaseAudit, getSupabaseIcipActivity, getSupabaseIcipEvidence, getSupabaseIcipRegistry, getSupabaseOperationalEvents, getSupabasePaymentWebhookEvents, getSupabasePublicIcipNoticeById, getSupabasePublicIcipNotices, insertSupabaseAction, insertSupabaseOperationalEvent, insertSupabasePaymentWebhookEvent, reconcileSupabaseDonationByIntent } from '@/app/api/advocacy-legal/actions/_supabase';

function fail(message: string, status = 400) {
  return NextResponse.json({ message }, { status });
}

async function requireActor(req: NextRequest) {
  const resolved = await requireVerifiedAdvocacyActionIdentity(req, {});
  return resolved.identity?.actorId || '';
}

function timingSafeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

const LOCAL_UPLOAD_ROOT = path.join(process.cwd(), '.data', 'advocacy-evidence');

function advocacyEvidenceBucket() {
  return process.env.SUPABASE_ADVOCACY_EVIDENCE_BUCKET?.trim() || 'advocacy-evidence';
}

function safeSegment(value: string) {
  return value.replace(/[^a-zA-Z0-9._-]+/g, '-');
}

async function appendOperationalEvent(event: {
  eventType: string;
  severity?: 'info' | 'warning' | 'critical';
  source: string;
  actorId?: string;
  entityType?: string;
  entityId?: string;
  status?: string;
  message: string;
  metadata?: Record<string, unknown>;
}) {
  const createdAt = new Date().toISOString();
  if (isSupabaseServerConfigured()) {
    await insertSupabaseOperationalEvent({
      id: crypto.randomUUID(),
      event_type: event.eventType,
      severity: event.severity || 'info',
      source: event.source,
      actor_id: event.actorId || null,
      entity_type: event.entityType || null,
      entity_id: event.entityId || null,
      status: event.status || 'recorded',
      message: event.message,
      metadata: event.metadata || {},
      created_at: createdAt
    });
    return;
  }
  pushOperationalEvent({
    eventType: event.eventType,
    severity: event.severity || 'info',
    source: event.source,
    actorId: event.actorId,
    entityType: event.entityType,
    entityId: event.entityId,
    status: event.status || 'recorded',
    message: event.message,
    metadata: event.metadata || {}
  });
}

async function appendWebhookEvent(event: {
  processorEventId?: string;
  paymentIntentId: string;
  paymentState: string;
  verificationStatus: string;
  processingOutcome: string;
  errorMessage?: string;
  payload: Record<string, unknown>;
}) {
  const createdAt = new Date().toISOString();
  if (isSupabaseServerConfigured()) {
    await insertSupabasePaymentWebhookEvent({
      id: crypto.randomUUID(),
      processor_event_id: event.processorEventId || null,
      payment_intent_id: event.paymentIntentId,
      payment_state: event.paymentState,
      verification_status: event.verificationStatus,
      processing_outcome: event.processingOutcome,
      error_message: event.errorMessage || null,
      payload: event.payload,
      created_at: createdAt
    });
    return;
  }
  pushPaymentWebhookEvent({
    processorEventId: event.processorEventId,
    paymentIntentId: event.paymentIntentId,
    paymentState: event.paymentState,
    verificationStatus: event.verificationStatus,
    processingOutcome: event.processingOutcome,
    errorMessage: event.errorMessage,
    payload: event.payload
  });
}

function verifyWebhookSignature(req: NextRequest, rawBody: string) {
  const secret = process.env.ADVOCACY_PAYMENT_WEBHOOK_SECRET?.trim();
  if (!secret) {
    return { ok: false, response: fail('Payment webhook secret is not configured', 503) };
  }

  const timestamp = req.headers.get('x-indigena-webhook-timestamp') || '';
  const signature = req.headers.get('x-indigena-webhook-signature') || '';
  if (!timestamp || !signature) {
    return { ok: false, response: fail('Missing webhook signature headers', 401) };
  }

  const timestampMs = Number(timestamp);
  if (!Number.isFinite(timestampMs)) {
    return { ok: false, response: fail('Invalid webhook timestamp', 401) };
  }
  const ageMs = Math.abs(Date.now() - timestampMs);
  if (ageMs > 5 * 60 * 1000) {
    return { ok: false, response: fail('Webhook timestamp expired', 401) };
  }

  const digest = crypto.createHmac('sha256', secret).update(`${timestamp}.${rawBody}`).digest('hex');
  if (!timingSafeEqual(digest, signature)) {
    return { ok: false, response: fail('Invalid webhook signature', 401) };
  }

  return { ok: true as const };
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  await loadStore();
  const { slug = [] } = await params;
  const [scope, type, id] = slug;

  if (scope === 'policy' && type === 'fees') {
    return NextResponse.json({
      success: true,
      data: {
        pillar: getPillarRevenuePolicy('advocacy-legal'),
        platform: TEN_PILLAR_REVENUE_POLICY
      }
    });
  }

  if (scope === 'uploads' && type === 'icip-evidence') {
    const signedActor = await requireActor(req);
    if (!signedActor) return fail('Missing signed identity (wallet or JWT)', 401);
    const filePath = String(req.nextUrl.searchParams.get('path') || '').trim();
    if (!filePath) return fail('path is required');

    const ownPath = filePath.startsWith(`${safeSegment(signedActor)}/`);
    if (!ownPath) {
      const elevated = await requireAdvocacyOpsRole(req, ['admin', 'legal_ops', 'legal_admin']);
      if (elevated.error) return elevated.error;
    }

    if (!isSupabaseServerConfigured()) {
      const absolute = path.join(LOCAL_UPLOAD_ROOT, filePath);
      if (!absolute.startsWith(LOCAL_UPLOAD_ROOT)) return fail('Invalid upload path', 400);
      const file = await readFile(absolute).catch(() => null);
      if (!file) return fail('Evidence file not found', 404);
      return new NextResponse(file, {
        headers: {
          'Content-Type': 'application/octet-stream',
          'Content-Disposition': `inline; filename="${path.basename(filePath)}"`
        }
      });
    }

    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase.storage.from(advocacyEvidenceBucket()).download(filePath);
    if (error || !data) return fail(error?.message || 'Evidence file not found', 404);
    return new NextResponse(data as Blob, {
      headers: {
        'Content-Type': data.type || 'application/octet-stream',
        'Content-Disposition': `inline; filename="${path.basename(filePath)}"`
      }
    });
  }

  if (scope === 'ops') {
    const signedActor = await requireActor(req);
    const allowsUnsignedRead = type === 'clinic-slots' || (type === 'icip-registry' && Boolean(id));
    if (!signedActor && !allowsUnsignedRead) return fail('Missing signed identity (wallet or JWT)', 401);

    if (type === 'receipt' && id) {
      if (!isSupabaseServerConfigured()) {
        const receipt = store.donationReceipts.find((row) => row.id === id) || null;
        const donation = receipt ? store.donations.find((row) => row.id === receipt.donationId) || null : null;
        if (!receipt) return fail('Receipt not found', 404);
        return NextResponse.json({ success: true, data: { receipt, donation } });
      }

      const supabase = createSupabaseServerClient();
      const receiptRow = await supabase.from('adv_donation_receipts').select('*').eq('id', id).maybeSingle();
      if (receiptRow.error) return fail(receiptRow.error.message, 500);
      if (!receiptRow.data) return fail('Receipt not found', 404);

      const receipt = {
        id: String((receiptRow.data as Record<string, unknown>).id || ''),
        donationId: String((receiptRow.data as Record<string, unknown>).donation_id || ''),
        paymentIntentId: String((receiptRow.data as Record<string, unknown>).payment_intent_id || ''),
        campaignId: String((receiptRow.data as Record<string, unknown>).campaign_id || ''),
        campaignTitle: String((receiptRow.data as Record<string, unknown>).campaign_title || ''),
        amount: Number((receiptRow.data as Record<string, unknown>).amount || 0),
        donorName: String((receiptRow.data as Record<string, unknown>).donor_name || ''),
        currency: String((receiptRow.data as Record<string, unknown>).currency || 'USD'),
        paymentStatus: String((receiptRow.data as Record<string, unknown>).payment_status || 'succeeded'),
        receiptUrl: String((receiptRow.data as Record<string, unknown>).receipt_url || ''),
        refundReviewStatus: String((receiptRow.data as Record<string, unknown>).refund_review_status || 'none'),
        updatedAt: String((receiptRow.data as Record<string, unknown>).updated_at || ''),
        createdAt: String((receiptRow.data as Record<string, unknown>).created_at || '')
      };

      const donationRow = receipt.donationId
        ? await supabase.from('adv_donations').select('*').eq('id', receipt.donationId).maybeSingle()
        : { data: null, error: null };
      if (donationRow.error) return fail(donationRow.error.message, 500);

      const donation = donationRow.data
        ? {
            id: String((donationRow.data as Record<string, unknown>).id || ''),
            campaignId: String((donationRow.data as Record<string, unknown>).campaign_id || ''),
            campaignTitle: String((donationRow.data as Record<string, unknown>).campaign_title || ''),
            amount: Number((donationRow.data as Record<string, unknown>).amount || 0),
            donorName: String((donationRow.data as Record<string, unknown>).donor_name || ''),
            paymentIntentId: String((donationRow.data as Record<string, unknown>).payment_intent_id || ''),
            paymentState: String((donationRow.data as Record<string, unknown>).payment_state || ''),
            receiptId: String((donationRow.data as Record<string, unknown>).receipt_id || ''),
            currency: String((donationRow.data as Record<string, unknown>).currency || 'USD'),
            status: String((donationRow.data as Record<string, unknown>).status || 'succeeded'),
            refundReason: String((donationRow.data as Record<string, unknown>).refund_reason || ''),
            refundRequestedAt: String((donationRow.data as Record<string, unknown>).refund_requested_at || ''),
            refundReviewedAt: String((donationRow.data as Record<string, unknown>).refund_reviewed_at || ''),
            refundReviewedBy: String((donationRow.data as Record<string, unknown>).refund_reviewed_by || ''),
            refundReviewNotes: String((donationRow.data as Record<string, unknown>).refund_review_notes || ''),
            assignedReviewerId: String((donationRow.data as Record<string, unknown>).assigned_reviewer_id || ''),
            assignedReviewerName: String((donationRow.data as Record<string, unknown>).assigned_reviewer_name || ''),
            assignedReviewerAt: String((donationRow.data as Record<string, unknown>).assigned_reviewer_at || ''),
            updatedAt: String((donationRow.data as Record<string, unknown>).updated_at || ''),
            createdAt: String((donationRow.data as Record<string, unknown>).created_at || '')
          }
        : null;

      return NextResponse.json({ success: true, data: { receipt, donation } });
    }

    if (type === 'clinic-slots') {
      if (!isSupabaseServerConfigured()) {
        return NextResponse.json({
          success: true,
          items: [
            { id: 'clinic-1', attorneyName: 'Mika Redsky', startsAt: '2026-03-18T09:00:00Z', endsAt: '2026-03-18T10:00:00Z', timezone: 'UTC', locationLabel: 'Virtual Clinic', bookingStatus: 'open', capacity: 6, bookedCount: 2, bookingUrl: '/advocacy-legal/legal-clinic-calendar' },
            { id: 'clinic-2', attorneyName: 'Tere Moana', startsAt: '2026-03-19T14:00:00Z', endsAt: '2026-03-19T15:00:00Z', timezone: 'UTC', locationLabel: 'Land Defense Session', bookingStatus: 'open', capacity: 4, bookedCount: 1, bookingUrl: '/advocacy-legal/legal-clinic-calendar' }
          ]
        });
      }
      const supabase = createSupabaseServerClient();
      const { data, error } = await supabase
        .from('adv_legal_clinic_slots')
        .select('*')
        .or('status.eq.active,status.eq.published')
        .eq('booking_status', 'open')
        .order('featured', { ascending: false })
        .order('starts_at', { ascending: true })
        .limit(24);
      if (error) return fail(error.message, 500);
      return NextResponse.json({
        success: true,
        items: (data || []).map((row: Record<string, unknown>) => ({
          id: String(row.id || ''),
          attorneyName: String(row.attorney_name || ''),
          startsAt: String(row.starts_at || ''),
          endsAt: String(row.ends_at || ''),
          timezone: String(row.timezone || 'UTC'),
          locationLabel: String(row.location_label || 'Virtual Clinic'),
          bookingStatus: String(row.booking_status || 'open'),
          capacity: Number(row.capacity || 1),
          bookedCount: Number(row.booked_count || 0),
          bookingUrl: String(row.booking_url || '/advocacy-legal/legal-clinic-calendar')
        }))
      });
    }

    if (!isSupabaseServerConfigured()) {
      if (type === 'community-dashboard') {
        return NextResponse.json({
          success: true,
          data: {
            openCases: 0,
            alertMembers: 0,
            activeCampaignRequests: 0,
            latestCases: []
          }
        });
      }
      if (type === 'legal-dashboard') {
        const elevated = await requireAdvocacyOpsRole(req, ['admin', 'legal_ops', 'legal_admin']);
        if (elevated.error) return elevated.error;
        return NextResponse.json({
          success: true,
          data: {
            openMatters: store.caseIntakes.length + store.consultations.length,
            pendingConsultRequests: store.consultations.length,
            proBonoQueue: store.proBonoRequests.length,
            operationalWatchlist: {
              failedPayments: store.donations.filter((row) => row.paymentState === 'failed').length,
              pendingRefunds: store.donations.filter((row) => row.status === 'refund_requested').length,
              underReviewClaims: store.icipRegistryEntries.filter((row) => row.status === 'under_review').length,
              recentCriticalEvents: store.operationalEvents.filter((row) => row.severity === 'critical').length
            },
            recentOperationalEvents: store.operationalEvents.slice(0, 6),
            recentWebhookEvents: store.paymentWebhookEvents.slice(0, 6),
            recentConsultations: store.consultations.slice(0, 8).map((row) => ({
              id: row.id,
              attorneyName: row.attorneyName,
              type: row.type,
              contactEmail: row.contactEmail,
              createdAt: row.createdAt
            })),
            assignedCases: [],
            refundRequests: store.donations.filter((row) => row.status === 'refund_requested').slice(0, 12).map((row) => ({
              donationId: row.id,
              receiptId: row.receiptId || '',
              donorName: row.donorName,
              campaignTitle: row.campaignTitle,
              amount: row.amount,
              currency: row.currency || 'USD',
              refundReason: row.refundReason || '',
              assignedReviewerId: row.assignedReviewerId || '',
              assignedReviewerName: row.assignedReviewerName || '',
              assignedReviewerAt: row.assignedReviewerAt || '',
              updatedAt: row.updatedAt || row.createdAt
            })),
            refundHistory: store.donations.filter((row) => Boolean(row.refundReviewedAt)).slice(0, 24).map((row) => ({
              donationId: row.id,
              receiptId: row.receiptId || '',
              donorName: row.donorName,
              campaignTitle: row.campaignTitle,
              amount: row.amount,
              currency: row.currency || 'USD',
              refundReason: row.refundReason || '',
              refundReviewStatus: row.status === 'refunded' ? 'approved' : 'rejected',
              refundReviewedBy: row.refundReviewedBy || '',
              reviewNotes: row.refundReviewNotes || '',
              assignedReviewerId: row.assignedReviewerId || '',
              assignedReviewerName: row.assignedReviewerName || '',
              assignedReviewerAt: row.assignedReviewerAt || '',
              updatedAt: row.refundReviewedAt || row.updatedAt || row.createdAt
            })),
            reconciliationQueue: store.donations.filter((row) => row.paymentState && !['succeeded', 'refunded', 'cancelled'].includes(row.paymentState)).slice(0, 24).map((row) => ({
              donationId: row.id,
              campaignTitle: row.campaignTitle,
              donorName: row.donorName,
              amount: row.amount,
              currency: row.currency || 'USD',
              paymentIntentId: row.paymentIntentId || '',
              paymentState: row.paymentState || 'intent_created',
              processorFailureReason: row.processorFailureReason || '',
              assignedReviewerId: row.assignedReviewerId || '',
              assignedReviewerName: row.assignedReviewerName || '',
              assignedReviewerAt: row.assignedReviewerAt || '',
              updatedAt: row.updatedAt || row.createdAt
            })),
            icipReviewQueue: store.icipRegistryEntries
              .filter((row) => ['submitted', 'under_review'].includes(row.status))
              .slice(0, 12)
              .map((row) => ({
                ...row,
                assignedReviewerId: row.assignedReviewerId || '',
                assignedReviewerName: row.assignedReviewerName || '',
                assignedReviewerAt: row.assignedReviewerAt || ''
              }))
          }
        });
      }
    }

    if (type === 'community-dashboard') {
      const supabase = createSupabaseServerClient();
      const [alerts, proBono, cases, workflows] = await Promise.all([
        supabase.from('adv_alert_subscriptions').select('*', { count: 'exact', head: true }).eq('actor_id', signedActor),
        supabase.from('adv_pro_bono_requests').select('*', { count: 'exact', head: true }).eq('actor_id', signedActor),
        supabase.from('adv_case_intakes').select('*').eq('actor_id', signedActor).order('created_at', { ascending: false }).limit(8),
        supabase.from('adv_case_workflows').select('*').order('updated_at', { ascending: false }).limit(40)
      ]);
      if (alerts.error) return fail(alerts.error.message, 500);
      if (proBono.error) return fail(proBono.error.message, 500);
      if (cases.error) return fail(cases.error.message, 500);
      if (workflows.error) return fail(workflows.error.message, 500);

      const workflowMap = new Map((workflows.data || []).map((row: Record<string, unknown>) => [String(row.case_id || ''), row]));
      const latestCases = (cases.data || []).map((row: Record<string, unknown>) => {
        const workflow = workflowMap.get(String(row.id || '')) as Record<string, unknown> | undefined;
        return {
          id: String(row.id || ''),
          communityName: String(row.community_name || ''),
          urgency: String(row.urgency || 'high'),
          contactEmail: String(row.contact_email || ''),
          workflowStatus: String(workflow?.workflow_status || 'submitted'),
          assignedAttorneyName: String(workflow?.assigned_attorney_name || ''),
          createdAt: String(row.created_at || '')
        };
      });

      return NextResponse.json({
        success: true,
        data: {
          openCases: latestCases.length,
          alertMembers: Number(alerts.count || 0),
          activeCampaignRequests: Number(proBono.count || 0),
          latestCases
        }
      });
    }

    if (type === 'legal-dashboard') {
      const elevated = await requireAdvocacyOpsRole(req, ['admin', 'legal_ops', 'legal_admin']);
      if (elevated.error) return elevated.error;
      const supabase = createSupabaseServerClient();
      const [consults, proBono, workflows, refundRequests, refundHistory, reconciliationQueue, icipSubmitted, icipUnderReview, operationalEvents, webhookEvents] = await Promise.all([
        supabase.from('adv_consultation_requests').select('*').order('created_at', { ascending: false }).limit(8),
        supabase.from('adv_pro_bono_requests').select('*', { count: 'exact', head: true }),
        supabase.from('adv_case_workflows').select('*').or(`assigned_attorney_id.eq.${signedActor},assigned_attorney_name.ilike.%${signedActor}%`).order('updated_at', { ascending: false }).limit(12),
        supabase.from('adv_donations').select('*').eq('status', 'refund_requested').order('updated_at', { ascending: false }).limit(12),
        supabase.from('adv_donations').select('*').not('refund_reviewed_at', 'is', null).order('refund_reviewed_at', { ascending: false }).limit(24),
        supabase.from('adv_donations').select('*').in('payment_state', ['intent_created', 'processing', 'failed']).order('updated_at', { ascending: false }).limit(24),
        supabase.from('adv_icip_registry_entries').select('*').eq('status', 'submitted').order('updated_at', { ascending: false }).limit(12),
        supabase.from('adv_icip_registry_entries').select('*').eq('status', 'under_review').order('updated_at', { ascending: false }).limit(12),
        getSupabaseOperationalEvents(6),
        getSupabasePaymentWebhookEvents(6)
      ]);
      if (consults.error) return fail(consults.error.message, 500);
      if (proBono.error) return fail(proBono.error.message, 500);
      if (workflows.error) return fail(workflows.error.message, 500);
      if (refundRequests.error) return fail(refundRequests.error.message, 500);
      if (refundHistory.error) return fail(refundHistory.error.message, 500);
      if (reconciliationQueue.error) return fail(reconciliationQueue.error.message, 500);
      if (icipSubmitted.error) return fail(icipSubmitted.error.message, 500);
      if (icipUnderReview.error) return fail(icipUnderReview.error.message, 500);

      const assignedCases = (workflows.data || []).map((row: Record<string, unknown>) => ({
        caseId: String(row.case_id || ''),
        workflowStatus: String(row.workflow_status || 'submitted'),
        priority: String(row.priority || 'high'),
        queueBucket: String(row.queue_bucket || 'general-intake'),
        assignedAttorneyId: String(row.assigned_attorney_id || ''),
        assignedAttorneyName: String(row.assigned_attorney_name || ''),
        nextReviewAt: String(row.next_review_at || ''),
        updatedAt: String(row.updated_at || '')
      }));

      return NextResponse.json({
        success: true,
        data: {
          openMatters: assignedCases.length + (consults.data || []).length,
          pendingConsultRequests: (consults.data || []).length,
          proBonoQueue: Number(proBono.count || 0),
          operationalWatchlist: {
            failedPayments: (reconciliationQueue.data || []).filter((row: Record<string, unknown>) => String(row.payment_state || '') === 'failed').length,
            pendingRefunds: (refundRequests.data || []).length,
            underReviewClaims: (icipUnderReview.data || []).length,
            recentCriticalEvents: operationalEvents.filter((item) => item.severity === 'critical').length
          },
          recentOperationalEvents: operationalEvents,
          recentWebhookEvents: webhookEvents,
          recentConsultations: (consults.data || []).map((row: Record<string, unknown>) => ({
            id: String(row.id || ''),
            attorneyName: String(row.attorney_name || ''),
            type: String(row.type || 'consultation'),
            contactEmail: String(row.contact_email || ''),
            createdAt: String(row.created_at || '')
          })),
          refundRequests: (refundRequests.data || []).map((row: Record<string, unknown>) => ({
            donationId: String(row.id || ''),
            receiptId: String(row.receipt_id || ''),
            donorName: String(row.donor_name || 'Supporter'),
            campaignTitle: String(row.campaign_title || ''),
            amount: Number(row.amount || 0),
            currency: String(row.currency || 'USD'),
            refundReason: String(row.refund_reason || ''),
            assignedReviewerId: String(row.assigned_reviewer_id || ''),
            assignedReviewerName: String(row.assigned_reviewer_name || ''),
            assignedReviewerAt: String(row.assigned_reviewer_at || ''),
            updatedAt: String(row.updated_at || row.created_at || '')
          })),
          refundHistory: (refundHistory.data || []).map((row: Record<string, unknown>) => ({
            donationId: String(row.id || ''),
            receiptId: String(row.receipt_id || ''),
            donorName: String(row.donor_name || 'Supporter'),
            campaignTitle: String(row.campaign_title || ''),
            amount: Number(row.amount || 0),
            currency: String(row.currency || 'USD'),
            refundReason: String(row.refund_reason || ''),
            refundReviewStatus: String(row.status || '') === 'refunded' ? 'approved' : 'rejected',
            refundReviewedBy: String(row.refund_reviewed_by || ''),
            reviewNotes: String(row.refund_review_notes || ''),
            assignedReviewerId: String(row.assigned_reviewer_id || ''),
            assignedReviewerName: String(row.assigned_reviewer_name || ''),
            assignedReviewerAt: String(row.assigned_reviewer_at || ''),
            updatedAt: String(row.refund_reviewed_at || row.updated_at || row.created_at || '')
          })),
          reconciliationQueue: (reconciliationQueue.data || []).map((row: Record<string, unknown>) => ({
            donationId: String(row.id || ''),
            campaignTitle: String(row.campaign_title || ''),
            donorName: String(row.donor_name || 'Supporter'),
            amount: Number(row.amount || 0),
            currency: String(row.currency || 'USD'),
            paymentIntentId: String(row.payment_intent_id || ''),
            paymentState: String(row.payment_state || 'intent_created'),
            processorFailureReason: String(row.processor_failure_reason || ''),
            assignedReviewerId: String(row.assigned_reviewer_id || ''),
            assignedReviewerName: String(row.assigned_reviewer_name || ''),
            assignedReviewerAt: String(row.assigned_reviewer_at || ''),
            updatedAt: String(row.updated_at || row.created_at || '')
          })),
          icipReviewQueue: [...(icipSubmitted.data || []), ...(icipUnderReview.data || [])].map((row: Record<string, unknown>) => ({
            id: String(row.id || ''),
            registryNumber: String(row.registry_number || ''),
            claimTitle: String(row.claim_title || ''),
            communityName: String(row.community_name || ''),
            claimantName: String(row.claimant_name || ''),
            protocolVisibility: String(row.protocol_visibility || 'restricted'),
            rightsScope: String(row.rights_scope || 'ownership'),
            status: String(row.status || 'submitted'),
            assignedReviewerId: String(row.assigned_reviewer_id || ''),
            assignedReviewerName: String(row.assigned_reviewer_name || ''),
            assignedReviewerAt: String(row.assigned_reviewer_at || ''),
            updatedAt: String(row.updated_at || row.created_at || '')
          })),
          assignedCases
        }
      });
    }

    if (type === 'icip-registry') {
      const elevated = await requireAdvocacyOpsRole(req, ['admin', 'legal_ops', 'legal_admin']);
      const canReviewRegistry = !elevated.error;
      if (id) {
        if (!isSupabaseServerConfigured()) {
          const entry = store.icipRegistryEntries.find((row) => row.id === id);
          if (!entry) return NextResponse.json({ success: true, data: null });
          const ownsClaim = entry.actorId === signedActor;
          if (!ownsClaim) {
            const elevated = await requireAdvocacyOpsRole(req, ['admin', 'legal_ops', 'legal_admin']);
            if (elevated.error) return NextResponse.json({ success: true, data: null });
          }
          return NextResponse.json({
            success: true,
            data: {
              ...entry,
              evidence: store.icipEvidence.filter((item) => item.entryId === entry.id),
              activity: store.icipActivity.filter((item) => item.entryId === entry.id).sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
            }
          });
        }

        const allActorClaims = await getSupabaseIcipRegistry({ actorId: signedActor, limit: 100 });
        let entry = allActorClaims.find((row) => row.id === id) || null;
        if (!entry) {
          const elevated = await requireAdvocacyOpsRole(req, ['admin', 'legal_ops', 'legal_admin']);
          if (elevated.error) return NextResponse.json({ success: true, data: null });
          const approved = await getSupabaseIcipRegistry({ status: 'approved', limit: 100 });
          const rejected = await getSupabaseIcipRegistry({ status: 'rejected', limit: 100 });
          const submitted = await getSupabaseIcipRegistry({ status: 'submitted', limit: 100 });
          const underReview = await getSupabaseIcipRegistry({ status: 'under_review', limit: 100 });
          entry = [...approved, ...rejected, ...submitted, ...underReview].find((row) => row.id === id) || null;
        }
        if (!entry) return NextResponse.json({ success: true, data: null });
        return NextResponse.json({
          success: true,
          data: {
            ...entry,
            evidence: await getSupabaseIcipEvidence(entry.id),
            activity: await getSupabaseIcipActivity(entry.id)
          }
        });
      }

      if (!isSupabaseServerConfigured()) {
        const actorClaims = store.icipRegistryEntries
          .filter((row) => row.actorId === signedActor)
          .slice(0, 24)
          .map((entry) => ({
            ...entry,
            evidence: store.icipEvidence.filter((item) => item.entryId === entry.id)
          }));
        const reviewQueue = store.icipRegistryEntries
          .filter((row) => ['submitted', 'under_review'].includes(row.status))
          .slice(0, 24)
          .map((entry) => ({
            ...entry,
            evidence: store.icipEvidence.filter((item) => item.entryId === entry.id)
          }));
        const reviewHistory = store.icipRegistryEntries
          .filter((row) => ['approved', 'rejected'].includes(row.status))
          .slice(0, 24)
          .map((entry) => ({
            ...entry,
            evidence: store.icipEvidence.filter((item) => item.entryId === entry.id)
          }));
        return NextResponse.json({
          success: true,
          data: {
            claims: actorClaims,
            reviewQueue: canReviewRegistry ? reviewQueue : [],
            reviewHistory: canReviewRegistry ? reviewHistory : []
          }
        });
      }

      const claims = await getSupabaseIcipRegistry({ actorId: signedActor, limit: 24 });
      const reviewQueue = await getSupabaseIcipRegistry({ status: 'submitted', limit: 24 });
      const underReview = await getSupabaseIcipRegistry({ status: 'under_review', limit: 24 });
      const approved = await getSupabaseIcipRegistry({ status: 'approved', limit: 12 });
      const rejected = await getSupabaseIcipRegistry({ status: 'rejected', limit: 12 });
      const withEvidence = async (entries: Array<Record<string, unknown>>) =>
        Promise.all(entries.map(async (entry) => ({ ...entry, evidence: await getSupabaseIcipEvidence(String(entry.id || '')) })));

      return NextResponse.json({
        success: true,
        data: {
          claims: await withEvidence(claims as Array<Record<string, unknown>>),
          reviewQueue: canReviewRegistry ? await withEvidence([...reviewQueue, ...underReview] as Array<Record<string, unknown>>) : [],
          reviewHistory: canReviewRegistry ? await withEvidence([...approved, ...rejected] as Array<Record<string, unknown>>) : []
        }
      });
    }

    if (type === 'audit-center') {
      const elevated = await requireAdvocacyOpsRole(req, ['admin', 'legal_ops', 'legal_admin']);
      if (elevated.error) return elevated.error;
      if (!isSupabaseServerConfigured()) {
        return NextResponse.json({
          success: true,
          data: {
            refundHistory: store.donations.filter((row) => Boolean(row.refundReviewedAt)).slice(0, 24),
            reconciliationHistory: store.donations.filter((row) => Boolean(row.processorEventId)).slice(0, 24),
            icipReviewHistory: store.icipRegistryEntries.filter((row) => ['approved', 'rejected'].includes(row.status)).slice(0, 24),
            auditTrail: store.auditTrail.slice(0, 40),
            operationalEvents: store.operationalEvents.slice(0, 20),
            webhookEvents: store.paymentWebhookEvents.slice(0, 20),
            launchMetrics: {
              failedPayments: store.donations.filter((row) => row.paymentState === 'failed').length,
              pendingRefunds: store.donations.filter((row) => row.status === 'refund_requested').length,
              activeIcipReviews: store.icipRegistryEntries.filter((row) => ['submitted', 'under_review'].includes(row.status)).length,
              rateLimitedWrites: store.operationalEvents.filter((row) => row.eventType.includes('rate_limited')).length
            }
          }
        });
      }

      const [auditTrail, refundHistory, reconciliationHistory, approvedClaims, rejectedClaims, submittedClaims, underReviewClaims, operationalEvents, webhookEvents, pendingRefunds] = await Promise.all([
        getSupabaseAudit(40),
        createSupabaseServerClient().from('adv_donations').select('*').not('refund_reviewed_at', 'is', null).order('refund_reviewed_at', { ascending: false }).limit(24),
        createSupabaseServerClient().from('adv_donations').select('*').not('processor_event_id', 'is', null).order('updated_at', { ascending: false }).limit(24),
        getSupabaseIcipRegistry({ status: 'approved', limit: 12 }),
        getSupabaseIcipRegistry({ status: 'rejected', limit: 12 }),
        getSupabaseIcipRegistry({ status: 'submitted', limit: 24 }),
        getSupabaseIcipRegistry({ status: 'under_review', limit: 24 }),
        getSupabaseOperationalEvents(20),
        getSupabasePaymentWebhookEvents(20),
        createSupabaseServerClient().from('adv_donations').select('*', { count: 'exact', head: true }).eq('status', 'refund_requested')
      ]);

      if ('error' in refundHistory && refundHistory.error) return fail(refundHistory.error.message, 500);
      if ('error' in reconciliationHistory && reconciliationHistory.error) return fail(reconciliationHistory.error.message, 500);

      return NextResponse.json({
        success: true,
        data: {
          refundHistory: (refundHistory.data || []).map((row: Record<string, unknown>) => ({
            donationId: String(row.id || ''),
            campaignTitle: String(row.campaign_title || ''),
            donorName: String(row.donor_name || ''),
            amount: Number(row.amount || 0),
            currency: String(row.currency || 'USD'),
            refundReason: String(row.refund_reason || ''),
            refundReviewedBy: String(row.refund_reviewed_by || ''),
            refundReviewNotes: String(row.refund_review_notes || ''),
            assignedReviewerId: String(row.assigned_reviewer_id || ''),
            assignedReviewerName: String(row.assigned_reviewer_name || ''),
            assignedReviewerAt: String(row.assigned_reviewer_at || ''),
            refundReviewedAt: String(row.refund_reviewed_at || row.updated_at || '')
          })),
          reconciliationHistory: (reconciliationHistory.data || []).map((row: Record<string, unknown>) => ({
            donationId: String(row.id || ''),
            paymentIntentId: String(row.payment_intent_id || ''),
            processorEventId: String(row.processor_event_id || ''),
            campaignTitle: String(row.campaign_title || ''),
            paymentState: String(row.payment_state || ''),
            processorFailureReason: String(row.processor_failure_reason || ''),
            assignedReviewerId: String(row.assigned_reviewer_id || ''),
            assignedReviewerName: String(row.assigned_reviewer_name || ''),
            assignedReviewerAt: String(row.assigned_reviewer_at || ''),
            updatedAt: String(row.updated_at || '')
          })),
          icipReviewHistory: [...approvedClaims, ...rejectedClaims],
          auditTrail,
          operationalEvents,
          webhookEvents,
          launchMetrics: {
            failedPayments: (reconciliationHistory.data || []).filter((row: Record<string, unknown>) => String(row.payment_state || '') === 'failed').length,
            pendingRefunds: Number(pendingRefunds.count || 0),
            activeIcipReviews: submittedClaims.length + underReviewClaims.length,
            rateLimitedWrites: operationalEvents.filter((row) => String(row.eventType || '').includes('rate_limited')).length
          }
        }
      });
    }

    return fail('Unsupported advocacy ops endpoint', 404);
  }

  if (scope !== 'public') return fail('Unsupported advocacy endpoint', 404);

  const data = await getAdvocacyPublicData();
  const q = String(req.nextUrl.searchParams.get('q') || '').trim().toLowerCase();
  const categorySlug = String(req.nextUrl.searchParams.get('categorySlug') || '').trim().toLowerCase();
  const featuredOnly = req.nextUrl.searchParams.get('featured') === '1';

  if (type === 'overview') {
    return NextResponse.json({ success: true, data });
  }

  if (type === 'icip-notices' && !id) {
    if (!isSupabaseServerConfigured()) {
      const items = store.icipRegistryEntries
        .filter((item) => item.status === 'approved' && item.publicListingState === 'public_summary' && item.publicSummary)
        .map((item) => ({
          id: item.id,
          registryNumber: item.registryNumber,
          claimTitle: item.publicTitle || item.claimTitle,
          communityName: item.communityName,
          assetType: item.assetType,
          rightsScope: item.rightsScope,
          protocolVisibility: item.protocolVisibility,
          publicSummary: item.publicSummary || '',
          publicProtocolNotice: item.publicProtocolNotice || '',
          updatedAt: item.updatedAt
        }))
        .sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime());
      return NextResponse.json({ success: true, items });
    }

    const items = await getSupabasePublicIcipNotices(24);
    return NextResponse.json({ success: true, items });
  }

  if (type === 'icip-notices' && id) {
    if (!isSupabaseServerConfigured()) {
      const item = store.icipRegistryEntries.find(
        (entry) => entry.id === id && entry.status === 'approved' && entry.publicListingState === 'public_summary' && entry.publicSummary
      );
      if (!item) return fail('Public ICIP notice not found', 404);
      return NextResponse.json({
        success: true,
        item: {
          id: item.id,
          registryNumber: item.registryNumber,
          claimTitle: item.publicTitle || item.claimTitle,
          communityName: item.communityName,
          assetType: item.assetType,
          rightsScope: item.rightsScope,
          protocolVisibility: item.protocolVisibility,
          publicSummary: item.publicSummary || '',
          publicProtocolNotice: item.publicProtocolNotice || '',
          updatedAt: item.updatedAt
        }
      });
    }

    const item = await getSupabasePublicIcipNoticeById(id);
    if (!item) return fail('Public ICIP notice not found', 404);
    return NextResponse.json({ success: true, item });
  }

  if (type === 'attorneys' && !id) {
    const items = data.attorneys.filter((item) => {
      if (featuredOnly && !['elder-council', 'verified'].includes(item.verified)) return false;
      if (categorySlug && !`${item.specialty} ${item.bio}`.toLowerCase().includes(categorySlug.replace(/-/g, ' '))) return false;
      if (q && !`${item.name} ${item.specialty} ${item.nation} ${item.region}`.toLowerCase().includes(q)) return false;
      return true;
    });
    return NextResponse.json({ success: true, items });
  }

  if (type === 'campaigns' && !id) {
    const items = data.campaigns.filter((item) => {
      if (featuredOnly && !item.urgent) return false;
      if (categorySlug && !`${item.type} ${item.title} ${item.summary}`.toLowerCase().includes(categorySlug.replace(/-/g, ' '))) return false;
      if (q && !`${item.title} ${item.summary} ${item.region}`.toLowerCase().includes(q)) return false;
      return true;
    });
    return NextResponse.json({ success: true, items });
  }

  if (type === 'resources' && !id) {
    const items = data.resources.filter((item) => {
      if (categorySlug && !`${item.kind} ${item.title} ${item.summary}`.toLowerCase().includes(categorySlug.replace(/-/g, ' '))) return false;
      if (q && !`${item.title} ${item.summary} ${item.kind}`.toLowerCase().includes(q)) return false;
      return true;
    });
    return NextResponse.json({ success: true, items });
  }

  if (type === 'victories' && !id) {
    return NextResponse.json({ success: true, items: data.victories });
  }

  if (type === 'attorneys' && id) {
    return NextResponse.json({ success: true, item: await getAdvocacyAttorneyById(id) });
  }

  if (type === 'campaigns' && id) {
    return NextResponse.json({ success: true, item: await getAdvocacyCampaignById(id) });
  }

  if (type === 'resources' && id) {
    return NextResponse.json({ success: true, item: await getAdvocacyResourceById(id) });
  }

  if (type === 'victories' && id) {
    return NextResponse.json({ success: true, item: await getAdvocacyVictoryById(id) });
  }

  return fail('Unsupported advocacy endpoint', 404);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  await loadStore();
  const { slug = [] } = await params;
  const [scope, type] = slug;

  if (scope === 'uploads' && type === 'icip-evidence') {
    const signedActor = await requireActor(req);
    if (!signedActor) return fail('Missing signed identity (wallet or JWT)', 401);
    const rateResult = await enforceSharedRateLimit({
      scope: 'pillar9:uploads:icip-evidence',
      bucketKey: `${signedActor}:${req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'}`,
      limit: 20,
      windowMs: 60_000
    });
    if (!rateResult.allowed) {
      await appendOperationalEvent({
        eventType: 'evidence_upload_rate_limited',
        severity: 'warning',
        source: 'advocacy-uploads',
        actorId: signedActor,
        message: 'ICIP evidence upload was rate limited',
        metadata: { resetAt: rateResult.resetAt }
      });
      return fail('Upload rate limit exceeded. Please retry shortly.', 429);
    }
    const form = await req.formData().catch(() => null);
    if (!form) return fail('Invalid form data');
    const file = form.get('file');
    if (!(file instanceof File)) return fail('file is required');
    if (!file.size) return fail('Uploaded file is empty');
    if (file.size > 25 * 1024 * 1024) return fail('Evidence uploads are limited to 25MB', 413);

    const actorKey = safeSegment(signedActor);
    const name = safeSegment(file.name || 'evidence.bin');
    const storagePath = `${actorKey}/${Date.now()}-${name}`;
    const bytes = Buffer.from(await file.arrayBuffer());

    if (!isSupabaseServerConfigured()) {
      const dir = path.join(LOCAL_UPLOAD_ROOT, actorKey);
      await mkdir(dir, { recursive: true });
      const absolute = path.join(LOCAL_UPLOAD_ROOT, storagePath);
      await writeFile(absolute, bytes);
      await appendOperationalEvent({
        eventType: 'evidence_uploaded',
        source: 'advocacy-uploads',
        actorId: signedActor,
        entityType: 'icip_evidence',
        entityId: storagePath,
        message: 'ICIP evidence file uploaded',
        metadata: { fileName: file.name, size: file.size, contentType: file.type || 'application/octet-stream' }
      });
      return NextResponse.json({
        success: true,
        data: {
          fileName: file.name,
          filePath: storagePath,
          fileUrl: `/api/advocacy-legal/uploads/icip-evidence?path=${encodeURIComponent(storagePath)}`,
          contentType: file.type || 'application/octet-stream',
          size: file.size
        }
      });
    }

    const supabase = createSupabaseServerClient();
    const { error } = await supabase.storage.from(advocacyEvidenceBucket()).upload(storagePath, bytes, {
      contentType: file.type || 'application/octet-stream',
      upsert: false
    });
    if (error) return fail(error.message, 500);
    await appendOperationalEvent({
      eventType: 'evidence_uploaded',
      source: 'advocacy-uploads',
      actorId: signedActor,
      entityType: 'icip_evidence',
      entityId: storagePath,
      message: 'ICIP evidence file uploaded',
      metadata: { fileName: file.name, size: file.size, contentType: file.type || 'application/octet-stream' }
    });
    return NextResponse.json({
      success: true,
      data: {
        fileName: file.name,
        filePath: storagePath,
        fileUrl: `/api/advocacy-legal/uploads/icip-evidence?path=${encodeURIComponent(storagePath)}`,
        contentType: file.type || 'application/octet-stream',
        size: file.size
      }
    });
  }

  if (scope === 'webhooks' && type === 'payment') {
    const rawBody = await req.text();
    const verification = verifyWebhookSignature(req, rawBody);
    if (!verification.ok) return verification.response;

    const body = (JSON.parse(rawBody || '{}')) as Record<string, unknown>;
    const paymentIntentId = String(body.paymentIntentId || '').trim();
    const paymentState = String(body.paymentState || '').trim();
    const processorEventId = String(body.processorEventId || '').trim() || undefined;
    const processorFailureReason = String(body.processorFailureReason || '').trim() || undefined;
    if (!paymentIntentId) return fail('paymentIntentId is required');
    if (!['processing', 'succeeded', 'failed', 'refunded', 'cancelled'].includes(paymentState)) {
      return fail('paymentState is invalid');
    }
    const updatedAt = new Date().toISOString();

    if (processorEventId) {
      if (!isSupabaseServerConfigured()) {
        const duplicate = store.donations.find((row) => row.processorEventId === processorEventId);
        if (duplicate) {
          await appendWebhookEvent({
            processorEventId,
            paymentIntentId,
            paymentState,
            verificationStatus: 'verified',
            processingOutcome: 'duplicate_ignored',
            payload: body
          });
          return NextResponse.json({
            success: true,
            duplicate: true,
            data: {
              donationId: duplicate.id,
              paymentIntentId,
              paymentState: duplicate.paymentState || paymentState,
              updatedAt: duplicate.updatedAt || duplicate.createdAt
            }
          });
        }
      } else {
        const duplicate = await findSupabaseDonationByProcessorEvent(processorEventId);
        if (duplicate) {
          await appendWebhookEvent({
            processorEventId,
            paymentIntentId,
            paymentState,
            verificationStatus: 'verified',
            processingOutcome: 'duplicate_ignored',
            payload: body
          });
          return NextResponse.json({
            success: true,
            duplicate: true,
            data: {
              donationId: String(duplicate.id || ''),
              paymentIntentId,
              paymentState: String(duplicate.payment_state || paymentState),
              updatedAt: String(duplicate.updated_at || duplicate.created_at || updatedAt)
            }
          });
        }
      }
    }

    if (!isSupabaseServerConfigured()) {
      const donation = store.donations.find((row) => row.paymentIntentId === paymentIntentId);
      if (!donation) {
        await appendWebhookEvent({
          processorEventId,
          paymentIntentId,
          paymentState,
          verificationStatus: 'verified',
          processingOutcome: 'donation_not_found',
          errorMessage: 'Donation not found for payment intent',
          payload: body
        });
        await appendOperationalEvent({
          eventType: 'payment_webhook_unmatched',
          severity: 'critical',
          source: 'advocacy-webhook',
          entityType: 'payment_intent',
          entityId: paymentIntentId,
          message: 'Payment webhook received for unknown donation intent',
          metadata: { processorEventId: processorEventId || null, paymentState }
        });
        return fail('Donation not found for payment intent', 404);
      }
      donation.paymentState = paymentState as typeof donation.paymentState;
      donation.processorEventId = processorEventId;
      donation.processorFailureReason = processorFailureReason;
      donation.reconciledAt = updatedAt;
      donation.updatedAt = updatedAt;
      if (paymentState === 'failed') donation.status = 'cancelled';
      if (paymentState === 'refunded') donation.status = 'refunded';
      if (paymentState === 'cancelled') donation.status = 'cancelled';
      if (donation.receiptId) {
        const receipt = store.donationReceipts.find((row) => row.id === donation.receiptId);
        if (receipt) {
          receipt.paymentStatus =
            paymentState === 'refunded'
              ? 'refunded'
              : paymentState === 'failed' || paymentState === 'cancelled'
                ? 'cancelled'
                : 'succeeded';
          receipt.updatedAt = updatedAt;
        }
      }
      pushAudit('campaign.payment-webhook-reconciled', 'webhook:payment', {
        paymentIntentId,
        paymentState,
        processorEventId: processorEventId || null
      });
      await appendWebhookEvent({
        processorEventId,
        paymentIntentId,
        paymentState,
        verificationStatus: 'verified',
        processingOutcome: 'reconciled',
        payload: body
      });
      await appendOperationalEvent({
        eventType: 'payment_webhook_reconciled',
        source: 'advocacy-webhook',
        entityType: 'donation',
        entityId: donation.id,
        status: paymentState,
        message: 'Payment webhook reconciled donation state',
        metadata: { processorEventId: processorEventId || null, paymentIntentId }
      });
      await persistStore();
      return NextResponse.json({
        success: true,
        data: {
          donationId: donation.id,
          paymentIntentId,
          paymentState,
          updatedAt
        }
      });
    }

    const updated = await reconcileSupabaseDonationByIntent({
      paymentIntentId,
      paymentState: paymentState as 'processing' | 'succeeded' | 'failed' | 'refunded' | 'cancelled',
      processorEventId,
      processorFailureReason
    });
    await appendWebhookEvent({
      processorEventId,
      paymentIntentId,
      paymentState,
      verificationStatus: 'verified',
      processingOutcome: updated ? 'reconciled' : 'donation_not_found',
      errorMessage: updated ? undefined : 'Donation not found for payment intent',
      payload: body
    });
    if (updated) {
      await appendOperationalEvent({
        eventType: 'payment_webhook_reconciled',
        source: 'advocacy-webhook',
        entityType: 'donation',
        entityId: String(updated.id || ''),
        status: paymentState,
        message: 'Payment webhook reconciled donation state',
        metadata: { processorEventId: processorEventId || null, paymentIntentId }
      });
    }
    if (!updated) return fail('Donation not found for payment intent', 404);
    return NextResponse.json({
      success: true,
      data: {
        donationId: String(updated.id || ''),
        paymentIntentId,
        paymentState,
        updatedAt: String(updated.updated_at || updatedAt)
      }
    });
  }

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;

  if (scope !== 'ops') return fail('Unsupported advocacy endpoint', 404);
  const admin = await requireAdvocacyOpsRole(req, ['admin', 'legal_ops', 'legal_admin']);
  if (admin.error) return admin.error;

  if (type === 'case-workflow') {
    const caseId = String(body.caseId || '').trim();
    if (!caseId) return fail('caseId is required');
    const payload = {
      case_id: caseId,
      workflow_status: String(body.workflowStatus || 'submitted'),
      priority: String(body.priority || 'high'),
      queue_bucket: String(body.queueBucket || 'general-intake'),
      assigned_attorney_id: String(body.assignedAttorneyId || ''),
      assigned_attorney_name: String(body.assignedAttorneyName || ''),
      next_review_at: body.nextReviewAt ? String(body.nextReviewAt) : null,
      last_note: String(body.lastNote || ''),
      updated_at: new Date().toISOString()
    };
    if (!isSupabaseServerConfigured()) return NextResponse.json({ success: true, data: payload });
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase.from('adv_case_workflows').upsert(payload, { onConflict: 'case_id' }).select('*').single();
    if (error) return fail(error.message, 500);
    return NextResponse.json({ success: true, data });
  }

  if (type === 'campaign-review') {
    const campaignId = String(body.campaignId || '').trim();
    if (!campaignId) return fail('campaignId is required');
    const reviewStatus = String(body.reviewStatus || 'pending');
    const visibilityState = String(body.visibilityState || 'draft');
    const payload = {
      campaign_id: campaignId,
      review_status: reviewStatus,
      visibility_state: visibilityState,
      review_notes: String(body.reviewNotes || ''),
      approved_by: admin.identity?.actorId || '',
      approved_at: reviewStatus === 'approved' ? new Date().toISOString() : null,
      updated_at: new Date().toISOString()
    };
    if (!isSupabaseServerConfigured()) return NextResponse.json({ success: true, data: payload });
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase.from('adv_campaign_reviews').upsert(payload, { onConflict: 'campaign_id' }).select('*').single();
    if (error) return fail(error.message, 500);

    await supabase
      .from('advocacy_campaigns')
      .update({ status: visibilityState === 'published' ? 'published' : 'active', updated_at: new Date().toISOString() })
      .eq('id', campaignId);

    return NextResponse.json({ success: true, data });
  }

  if (type === 'refund-review') {
    const donationId = String(body.donationId || '').trim();
    const receiptId = String(body.receiptId || '').trim() || undefined;
    const refundReviewStatus = String(body.refundReviewStatus || '').trim();
    if (!donationId) return fail('donationId is required');
    if (!['approved', 'rejected'].includes(refundReviewStatus)) return fail('refundReviewStatus must be approved or rejected');
    const updatedAt = new Date().toISOString();

    if (!isSupabaseServerConfigured()) {
      const donation = store.donations.find((row) => row.id === donationId && row.status === 'refund_requested');
      if (!donation) return fail('Refund request not found', 404);
      donation.status = refundReviewStatus === 'approved' ? 'refunded' : 'succeeded';
      donation.refundReviewedAt = updatedAt;
      donation.refundReviewedBy = admin.identity?.actorId || '';
      donation.refundReviewNotes = String(body.reviewNotes || '');
      donation.updatedAt = updatedAt;
      if (receiptId) {
        const receipt = store.donationReceipts.find((row) => row.id === receiptId);
        if (receipt) {
          receipt.paymentStatus = refundReviewStatus === 'approved' ? 'refunded' : 'succeeded';
          receipt.refundReviewStatus = refundReviewStatus as 'approved' | 'rejected';
          receipt.updatedAt = updatedAt;
        }
      }
      pushAudit(`campaign.refund-${refundReviewStatus}`, admin.identity?.actorId || 'admin', {
        donationId,
        receiptId: receiptId || null,
        reviewNotes: String(body.reviewNotes || '')
      });
      await persistStore();
      return NextResponse.json({
        success: true,
        data: {
          donationId,
          receiptId: receiptId || null,
          refundReviewStatus,
          reviewNotes: String(body.reviewNotes || ''),
          updatedAt
        }
      });
    }

    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from('adv_donations')
      .update({
        status: refundReviewStatus === 'approved' ? 'refunded' : 'succeeded',
        refund_reviewed_at: updatedAt,
        refund_reviewed_by: admin.identity?.actorId || '',
        refund_review_notes: String(body.reviewNotes || ''),
        updated_at: updatedAt
      })
      .eq('id', donationId)
      .eq('status', 'refund_requested')
      .select('*')
      .single();
    if (error) return fail(error.message, 500);

    if (receiptId) {
      const { error: receiptError } = await supabase
        .from('adv_donation_receipts')
        .update({
          payment_status: refundReviewStatus === 'approved' ? 'refunded' : 'succeeded',
          refund_review_status: refundReviewStatus,
          updated_at: updatedAt
        })
        .eq('id', receiptId);
      if (receiptError) return fail(receiptError.message, 500);
    }

    return NextResponse.json({
      success: true,
      data: {
        donationId: String(data.id || donationId),
        receiptId: receiptId || null,
        refundReviewStatus,
        reviewNotes: String(body.reviewNotes || ''),
        updatedAt
      }
    });
  }

  if (type === 'donation-reconcile') {
    const donationId = String(body.donationId || '').trim();
    const paymentState = String(body.paymentState || '').trim();
    if (!donationId) return fail('donationId is required');
    if (!['processing', 'succeeded', 'failed', 'refunded', 'cancelled'].includes(paymentState)) return fail('paymentState is invalid');
    const updatedAt = new Date().toISOString();

    if (!isSupabaseServerConfigured()) {
      const donation = store.donations.find((row) => row.id === donationId);
      if (!donation) return fail('Donation not found', 404);
      donation.paymentState = paymentState as typeof donation.paymentState;
      donation.processorEventId = String(body.processorEventId || '') || donation.processorEventId;
      donation.processorFailureReason = String(body.processorFailureReason || '') || '';
      donation.reconciledAt = updatedAt;
      donation.updatedAt = updatedAt;
      if (paymentState === 'failed') {
        donation.status = 'cancelled';
      }
      pushAudit('campaign.donation-reconciled', admin.identity?.actorId || 'admin', {
        donationId,
        paymentState,
        processorEventId: String(body.processorEventId || '') || null,
        processorFailureReason: String(body.processorFailureReason || '') || null
      });
      await persistStore();
      return NextResponse.json({ success: true, data: { donationId, paymentState, updatedAt } });
    }

    const supabase = createSupabaseServerClient();
    const updatePayload: Record<string, unknown> = {
      payment_state: paymentState,
      processor_event_id: String(body.processorEventId || '') || null,
      processor_failure_reason: String(body.processorFailureReason || '') || null,
      reconciled_at: updatedAt,
      updated_at: updatedAt
    };
    if (paymentState === 'failed') updatePayload.status = 'cancelled';
    const { data, error } = await supabase
      .from('adv_donations')
      .update(updatePayload)
      .eq('id', donationId)
      .select('*')
      .single();
    if (error) return fail(error.message, 500);
    return NextResponse.json({
      success: true,
      data: {
        donationId: String(data.id || donationId),
        paymentState: String(data.payment_state || paymentState),
        updatedAt
      }
    });
  }

  if (type === 'donation-assignment') {
    const donationId = String(body.donationId || '').trim();
    const assignedReviewerName = String(body.assignedReviewerName || '').trim();
    const assignedReviewerId = String(body.assignedReviewerId || '').trim();
    if (!donationId) return fail('donationId is required');
    if (!assignedReviewerName) return fail('assignedReviewerName is required');
    const updatedAt = new Date().toISOString();

    if (!isSupabaseServerConfigured()) {
      const donation = store.donations.find((row) => row.id === donationId);
      if (!donation) return fail('Donation not found', 404);
      donation.assignedReviewerId = assignedReviewerId || undefined;
      donation.assignedReviewerName = assignedReviewerName;
      donation.assignedReviewerAt = updatedAt;
      donation.updatedAt = updatedAt;
      pushAudit('campaign.donation-assignment-updated', admin.identity?.actorId || 'admin', {
        donationId,
        assignedReviewerId: assignedReviewerId || null,
        assignedReviewerName
      });
      await persistStore();
      return NextResponse.json({
        success: true,
        data: {
          donationId,
          assignedReviewerId: donation.assignedReviewerId || '',
          assignedReviewerName: donation.assignedReviewerName || '',
          assignedReviewerAt: donation.assignedReviewerAt || '',
          updatedAt
        }
      });
    }

    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from('adv_donations')
      .update({
        assigned_reviewer_id: assignedReviewerId || null,
        assigned_reviewer_name: assignedReviewerName,
        assigned_reviewer_at: updatedAt,
        updated_at: updatedAt
      })
      .eq('id', donationId)
      .select('*')
      .single();
    if (error) return fail(error.message, 500);
    return NextResponse.json({
      success: true,
      data: {
        donationId: String(data.id || donationId),
        assignedReviewerId: String(data.assigned_reviewer_id || ''),
        assignedReviewerName: String(data.assigned_reviewer_name || ''),
        assignedReviewerAt: String(data.assigned_reviewer_at || updatedAt),
        updatedAt: String(data.updated_at || updatedAt)
      }
    });
  }

  if (type === 'icip-review') {
    const entryId = String(body.entryId || '').trim();
    const reviewStatus = String(body.reviewStatus || '').trim();
    const reviewNotes = String(body.reviewNotes || '').trim();
    if (!entryId) return fail('entryId is required');
    if (!['under_review', 'approved', 'rejected'].includes(reviewStatus)) return fail('reviewStatus is invalid');
    const updatedAt = new Date().toISOString();

    if (!isSupabaseServerConfigured()) {
      const entry = store.icipRegistryEntries.find((row) => row.id === entryId);
      if (!entry) return fail('ICIP claim not found', 404);
      entry.status = reviewStatus as typeof entry.status;
      entry.reviewNotes = reviewNotes;
      entry.reviewedAt = updatedAt;
      entry.reviewedBy = admin.identity?.actorId || 'admin';
      entry.updatedAt = updatedAt;
      pushAudit(`icip.claim-${reviewStatus}`, admin.identity?.actorId || 'admin', {
        entryId,
        registryNumber: entry.registryNumber,
        reviewNotes: reviewNotes || null
      });
      store.icipActivity = [
        {
          id: `icip-activity-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          entryId,
          activityType: 'review_status_changed' as const,
          actorId: admin.identity?.actorId || 'admin',
          actorLabel: 'Legal Review Team',
          title: `Claim moved to ${reviewStatus.replace(/_/g, ' ')}`,
          body: reviewNotes || 'Protected review status updated.',
          createdAt: updatedAt
        },
        ...store.icipActivity
      ].slice(0, 5000);
      await persistStore();
      return NextResponse.json({ success: true, data: entry });
    }

    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from('adv_icip_registry_entries')
      .update({
        status: reviewStatus,
        review_notes: reviewNotes,
        reviewed_at: updatedAt,
        reviewed_by: admin.identity?.actorId || '',
        updated_at: updatedAt
      })
      .eq('id', entryId)
      .select('*')
      .single();
    if (error) return fail(error.message, 500);
    await insertSupabaseAction('icip-registry-activity', {
      id: `icip-activity-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      entry_id: entryId,
      activity_type: 'review_status_changed',
      actor_id: admin.identity?.actorId || 'admin',
      actor_label: 'Legal Review Team',
      title: `Claim moved to ${reviewStatus.replace(/_/g, ' ')}`,
      body: reviewNotes || 'Protected review status updated.',
      created_at: updatedAt
    });
    return NextResponse.json({ success: true, data });
  }

  if (type === 'icip-assignment') {
    const entryId = String(body.entryId || '').trim();
    const assignedReviewerName = String(body.assignedReviewerName || '').trim();
    const assignedReviewerId = String(body.assignedReviewerId || '').trim();
    if (!entryId) return fail('entryId is required');
    if (!assignedReviewerName) return fail('assignedReviewerName is required');
    const updatedAt = new Date().toISOString();

    if (!isSupabaseServerConfigured()) {
      const entry = store.icipRegistryEntries.find((row) => row.id === entryId);
      if (!entry) return fail('ICIP claim not found', 404);
      entry.assignedReviewerId = assignedReviewerId || undefined;
      entry.assignedReviewerName = assignedReviewerName;
      entry.assignedReviewerAt = updatedAt;
      entry.updatedAt = updatedAt;
      pushAudit('icip.assignment-updated', admin.identity?.actorId || 'admin', {
        entryId,
        registryNumber: entry.registryNumber,
        assignedReviewerId: assignedReviewerId || null,
        assignedReviewerName
      });
      store.icipActivity = [
        {
          id: `icip-activity-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          entryId,
          activityType: 'assignment_updated' as const,
          actorId: admin.identity?.actorId || 'admin',
          actorLabel: 'Legal Review Team',
          title: `Reviewer assigned: ${assignedReviewerName}`,
          body: assignedReviewerId ? `Claim owner set to ${assignedReviewerName} (${assignedReviewerId}).` : `Claim owner set to ${assignedReviewerName}.`,
          createdAt: updatedAt
        },
        ...store.icipActivity
      ].slice(0, 5000);
      await persistStore();
      return NextResponse.json({
        success: true,
        data: {
          id: entry.id,
          assignedReviewerId: entry.assignedReviewerId || '',
          assignedReviewerName: entry.assignedReviewerName || '',
          assignedReviewerAt: entry.assignedReviewerAt || '',
          updatedAt
        }
      });
    }

    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from('adv_icip_registry_entries')
      .update({
        assigned_reviewer_id: assignedReviewerId || null,
        assigned_reviewer_name: assignedReviewerName,
        assigned_reviewer_at: updatedAt,
        updated_at: updatedAt
      })
      .eq('id', entryId)
      .select('*')
      .single();
    if (error) return fail(error.message, 500);
    await insertSupabaseAction('icip-registry-activity', {
      id: `icip-activity-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      entry_id: entryId,
      activity_type: 'assignment_updated',
      actor_id: admin.identity?.actorId || 'admin',
      actor_label: 'Legal Review Team',
      title: `Reviewer assigned: ${assignedReviewerName}`,
      body: assignedReviewerId ? `Claim owner set to ${assignedReviewerName} (${assignedReviewerId}).` : `Claim owner set to ${assignedReviewerName}.`,
      created_at: updatedAt
    });
    return NextResponse.json({
      success: true,
      data: {
        id: String(data.id || entryId),
        assignedReviewerId: String(data.assigned_reviewer_id || ''),
        assignedReviewerName: String(data.assigned_reviewer_name || ''),
        assignedReviewerAt: String(data.assigned_reviewer_at || updatedAt),
        updatedAt: String(data.updated_at || updatedAt)
      }
    });
  }

  if (type === 'clinic-slots') {
    const attorneyName = String(body.attorneyName || '').trim();
    const startsAt = String(body.startsAt || '').trim();
    const endsAt = String(body.endsAt || '').trim();
    if (!attorneyName || !startsAt || !endsAt) return fail('attorneyName, startsAt, and endsAt are required');
    const payload = {
      id: String(body.id || `clinic-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`),
      attorney_id: String(body.attorneyId || ''),
      attorney_name: attorneyName,
      starts_at: startsAt,
      ends_at: endsAt,
      timezone: String(body.timezone || 'UTC'),
      location_label: String(body.locationLabel || 'Virtual Clinic'),
      booking_status: String(body.bookingStatus || 'open'),
      capacity: Number(body.capacity || 1),
      booked_count: 0,
      booking_url: String(body.bookingUrl || '/advocacy-legal/legal-clinic-calendar'),
      featured: Boolean(body.featured),
      status: 'active',
      updated_at: new Date().toISOString()
    };
    if (!isSupabaseServerConfigured()) return NextResponse.json({ success: true, data: payload });
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase.from('adv_legal_clinic_slots').upsert(payload, { onConflict: 'id' }).select('*').single();
    if (error) return fail(error.message, 500);
    return NextResponse.json({ success: true, data });
  }

  return fail('Unsupported advocacy ops endpoint', 404);
}
