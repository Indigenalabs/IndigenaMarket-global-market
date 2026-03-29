import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAudit, getSupabaseIcipEvidence, getSupabaseIcipRegistry, getSupabaseSnapshot, insertSupabaseAction, insertSupabaseOperationalEvent, isSupabaseConfigured, updateSupabaseDonationState, updateSupabaseIcipVisibility } from './_supabase';
import { loadStore, newId, persistStore, pushAudit, pushOperationalEvent, snapshot, store } from './_store';
import { requireAdvocacyOpsRole } from '@/app/lib/advocacyOpsAuth';
import { requireVerifiedAdvocacyActionIdentity } from '@/app/lib/advocacyActionAuth';
import { enforceSharedRateLimit } from '@/app/lib/sharedRateLimit';

type ActionType =
  | 'case-intake'
  | 'pro-bono-request'
  | 'alert-subscription'
  | 'donation-intent'
  | 'donation-confirmation'
  | 'donation'
  | 'donation-receipt'
  | 'donation-refund'
  | 'donation-cancel'
  | 'icip-registry-entry'
  | 'icip-claim-comment'
  | 'icip-public-visibility'
  | 'consultation-request'
  | 'policy-action';

type AuthIdentity = NonNullable<Awaited<ReturnType<typeof requireVerifiedAdvocacyActionIdentity>>['identity']>;
const WINDOW_MS = 60_000;
const MAX_WRITES_PER_WINDOW = 60;

function bad(message: string, status = 400) {
  return NextResponse.json({ success: false, message }, { status });
}

async function requireIdentity(req: NextRequest) {
  const resolved = await requireVerifiedAdvocacyActionIdentity(req, {});
  return resolved.identity;
}

function isAdminSigned(req: NextRequest) {
  return req.headers.get('x-admin-signed') === 'true';
}

function rateLimitKey(req: NextRequest, identity: AuthIdentity) {
  const forwarded = req.headers.get('x-forwarded-for') || '';
  const realIp = req.headers.get('x-real-ip') || '';
  const ip = forwarded.split(',')[0]?.trim() || realIp.trim() || 'unknown';
  return `${identity.actorId}:${ip}`;
}

async function enforceRateLimit(req: NextRequest, identity: AuthIdentity, scope = 'pillar9:actions:write') {
  const result = await enforceSharedRateLimit({
    scope,
    bucketKey: rateLimitKey(req, identity),
    limit: MAX_WRITES_PER_WINDOW,
    windowMs: WINDOW_MS
  });
  if (!result.allowed) {
    return NextResponse.json(
      { success: false, message: 'Rate limit exceeded. Please retry shortly.' },
      {
        status: 429,
        headers: {
          'Retry-After': Math.max(Math.ceil((new Date(result.resetAt).getTime() - Date.now()) / 1000), 1).toString()
        }
      }
    );
  }
  return null;
}

function countsTowardSupporterTotals(status: string | undefined) {
  return status === 'succeeded' || status === 'refund_requested';
}

function toDbPayload(action: ActionType, row: Record<string, unknown>) {
  if (action === 'case-intake') {
    return {
      id: row.id,
      community_name: row.communityName,
      contact_email: row.contactEmail,
      issue_summary: row.issueSummary,
      jurisdiction: row.jurisdiction,
      urgency: row.urgency,
      created_at: row.createdAt,
      actor_id: row.actorId
    };
  }
  if (action === 'pro-bono-request') {
    return {
      id: row.id,
      case_name: row.caseName,
      jurisdiction: row.jurisdiction,
      details: row.details,
      urgency: row.urgency,
      created_at: row.createdAt,
      actor_id: row.actorId
    };
  }
  if (action === 'alert-subscription') {
    return {
      id: row.id,
      email: row.email,
      mobile: row.mobile,
      topics: row.topics,
      channels: row.channels,
      created_at: row.createdAt,
      actor_id: row.actorId
    };
  }
  if (action === 'donation') {
    return {
      id: row.id,
      campaign_id: row.campaignId,
      campaign_title: row.campaignTitle,
      amount: row.amount,
      donor_name: row.donorName,
      payment_intent_id: row.paymentIntentId,
      payment_state: row.paymentState,
      processor_event_id: row.processorEventId,
      processor_failure_reason: row.processorFailureReason,
      reconciled_at: row.reconciledAt,
      receipt_id: row.receiptId,
      currency: row.currency,
      status: row.status,
      refund_reason: row.refundReason,
      refund_requested_at: row.refundRequestedAt,
      refund_reviewed_at: row.refundReviewedAt,
      refund_reviewed_by: row.refundReviewedBy,
      refund_review_notes: row.refundReviewNotes,
      assigned_reviewer_id: row.assignedReviewerId,
      assigned_reviewer_name: row.assignedReviewerName,
      assigned_reviewer_at: row.assignedReviewerAt,
      updated_at: row.updatedAt,
      created_at: row.createdAt,
      actor_id: row.actorId
    };
  }
  if (action === 'donation-receipt') {
    return {
      id: row.id,
      donation_id: row.donationId,
      payment_intent_id: row.paymentIntentId,
      campaign_id: row.campaignId,
      campaign_title: row.campaignTitle,
      amount: row.amount,
      donor_name: row.donorName,
      currency: row.currency,
      payment_status: row.paymentStatus,
      receipt_url: row.receiptUrl,
      refund_review_status: row.refundReviewStatus,
      updated_at: row.updatedAt,
      created_at: row.createdAt,
      actor_id: row.actorId
    };
  }
  if (action === 'consultation-request') {
    return {
      id: row.id,
      attorney_id: row.attorneyId,
      attorney_name: row.attorneyName,
      type: row.type,
      case_summary: row.caseSummary,
      contact_email: row.contactEmail,
      created_at: row.createdAt,
      actor_id: row.actorId
    };
  }
  if (action === 'icip-registry-entry') {
    return {
      id: row.id,
      registry_number: row.registryNumber,
      claim_title: row.claimTitle,
      community_name: row.communityName,
      claimant_name: row.claimantName,
      contact_email: row.contactEmail,
      asset_type: row.assetType,
      rights_scope: row.rightsScope,
      protocol_visibility: row.protocolVisibility,
      protocol_summary: row.protocolSummary,
      licensing_terms: row.licensingTerms,
      infringement_summary: row.infringementSummary,
      status: row.status,
      public_listing_state: row.publicListingState,
      public_title: row.publicTitle,
      public_summary: row.publicSummary,
      public_protocol_notice: row.publicProtocolNotice,
      review_notes: row.reviewNotes,
      reviewed_at: row.reviewedAt,
      reviewed_by: row.reviewedBy,
      created_at: row.createdAt,
      updated_at: row.updatedAt,
      actor_id: row.actorId
    };
  }
  return {
    id: row.id,
    bill_id: row.billId,
    title: row.title,
    action_type: row.actionType,
    actor_name: row.actorName,
    created_at: row.createdAt,
    actor_id: row.actorId
  };
}

async function appendAudit(identity: AuthIdentity, event: string, metadata: Record<string, unknown>) {
  if (isSupabaseConfigured()) {
    await insertSupabaseAction('audit', {
      id: newId('audit'),
      event,
      actor_id: identity.actorId,
      timestamp: new Date().toISOString(),
      metadata
    });
    return;
  }
  pushAudit(event, identity.actorId, metadata);
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
  if (isSupabaseConfigured()) {
    await insertSupabaseOperationalEvent({
      id: newId('ops'),
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

export async function GET(req: NextRequest) {
  await loadStore();
  const kind = req.nextUrl.searchParams.get('kind') || 'snapshot';
  const identity = await requireIdentity(req);

  if (kind === 'snapshot') {
    if (!identity) {
      return NextResponse.json({
        success: true,
        data: null
      });
    }
    if (isSupabaseConfigured()) {
      const data = await getSupabaseSnapshot(identity.actorId);
      if (data) return NextResponse.json({ success: true, data });
    }
    const local = snapshot();
    return NextResponse.json({
      success: true,
      data: {
        totalContributed: store.donations.filter((row) => row.actorId === identity.actorId && countsTowardSupporterTotals(row.status)).reduce((sum, row) => sum + row.amount, 0),
        campaignsSupported: new Set(store.donations.filter((row) => row.actorId === identity.actorId && countsTowardSupporterTotals(row.status)).map((row) => row.campaignId)).size,
        actionAlertsCompleted: local.recentActions.filter((row) => row.actorId === identity.actorId).length,
        activeAlertSubscriptions: store.alertSubscriptions.filter((row) => row.actorId === identity.actorId).length,
        consultationRequests: store.consultations.filter((row) => row.actorId === identity.actorId).length,
        caseIntakes: store.caseIntakes.filter((row) => row.actorId === identity.actorId).length,
        proBonoRequests: store.proBonoRequests.filter((row) => row.actorId === identity.actorId).length,
        recentDonations: store.donations.filter((row) => row.actorId === identity.actorId && row.status !== 'requires_confirmation').slice(0, 6),
        recentDonationReceipts: store.donationReceipts.filter((row) => row.actorId === identity.actorId).slice(0, 6),
        recentActions: store.policyActions.filter((row) => row.actorId === identity.actorId).slice(0, 6),
        recentCaseIntakes: store.caseIntakes.filter((row) => row.actorId === identity.actorId).slice(0, 6).map((row) => ({ id: row.id, communityName: row.communityName, urgency: row.urgency, createdAt: row.createdAt })),
        recentConsultations: store.consultations.filter((row) => row.actorId === identity.actorId).slice(0, 6).map((row) => ({ id: row.id, attorneyId: row.attorneyId, attorneyName: row.attorneyName, type: row.type, createdAt: row.createdAt }))
      }
    });
  }

  if (kind === 'audit') {
    if (!identity) return bad('Missing signed identity (wallet or JWT)', 401);
    if (!isAdminSigned(req)) return bad('Admin signature required', 403);
    if (isSupabaseConfigured()) {
      const data = await getSupabaseAudit(100);
      return NextResponse.json({ success: true, data });
    }
    return NextResponse.json({ success: true, data: store.auditTrail.slice(0, 100) });
  }

  if (kind === 'icip') {
    if (!identity) return bad('Missing signed identity (wallet or JWT)', 401);
    if (isSupabaseConfigured()) {
      const entries = await getSupabaseIcipRegistry({ actorId: identity.actorId, limit: 24 });
      const withEvidence = await Promise.all(entries.map(async (entry) => ({
        ...entry,
        evidence: await getSupabaseIcipEvidence(entry.id)
      })));
      return NextResponse.json({ success: true, data: withEvidence });
    }
    return NextResponse.json({
      success: true,
      data: store.icipRegistryEntries
        .filter((row) => row.actorId === identity.actorId)
        .slice(0, 24)
        .map((entry) => ({
          ...entry,
          evidence: store.icipEvidence.filter((item) => item.entryId === entry.id)
        }))
    });
  }

  return bad('Unsupported query kind', 400);
}

export async function POST(req: NextRequest) {
  await loadStore();

  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return bad('Invalid JSON payload');

  const resolvedIdentity = await requireVerifiedAdvocacyActionIdentity(req, body);
  if (resolvedIdentity.error || !resolvedIdentity.identity) return resolvedIdentity.error || bad('Authenticated Supabase user required for this action', 401);
  const identity = resolvedIdentity.identity;

  const limited = await enforceRateLimit(req, identity);
  if (limited) {
    await appendOperationalEvent({
      eventType: 'supporter_write_rate_limited',
      severity: 'warning',
      source: 'advocacy-actions',
      actorId: identity.actorId,
      message: 'Supporter write request was rate limited',
      metadata: { path: req.nextUrl.pathname }
    });
    return limited;
  }

  const action = String(body.action || '') as ActionType;
  const now = new Date().toISOString();

  if (action === 'case-intake') {
    const communityName = String(body.communityName || '').trim();
    const contactEmail = String(body.contactEmail || '').trim();
    const issueSummary = String(body.issueSummary || '').trim();
    const jurisdiction = String(body.jurisdiction || '').trim();
    const urgency = String(body.urgency || 'high') as 'low' | 'medium' | 'high' | 'critical';
    if (!communityName || !contactEmail || !issueSummary) return bad('communityName, contactEmail, and issueSummary are required');

    const row = {
      id: newId('case'),
      communityName,
      contactEmail,
      issueSummary,
      jurisdiction: jurisdiction || undefined,
      urgency,
      createdAt: now,
      actorId: identity.actorId
    };

    if (isSupabaseConfigured()) {
      await insertSupabaseAction(action, toDbPayload(action, row));
      await appendAudit(identity, 'case-intake.submitted', { caseId: row.id, urgency: row.urgency, jurisdiction: row.jurisdiction || null, authMethod: identity.method });
      await appendOperationalEvent({
        eventType: 'case_intake_submitted',
        source: 'advocacy-actions',
        actorId: identity.actorId,
        entityType: 'case_intake',
        entityId: row.id,
        message: 'Legal help intake submitted',
        metadata: { urgency: row.urgency, jurisdiction: row.jurisdiction || null }
      });
      return NextResponse.json({ success: true, data: row });
    }

    store.caseIntakes = [row, ...store.caseIntakes].slice(0, 1000);
    pushAudit('case-intake.submitted', identity.actorId, { caseId: row.id, urgency: row.urgency, jurisdiction: row.jurisdiction || null, authMethod: identity.method });
    await appendOperationalEvent({
      eventType: 'case_intake_submitted',
      source: 'advocacy-actions',
      actorId: identity.actorId,
      entityType: 'case_intake',
      entityId: row.id,
      message: 'Legal help intake submitted',
      metadata: { urgency: row.urgency, jurisdiction: row.jurisdiction || null }
    });
    await persistStore();
    return NextResponse.json({ success: true, data: row });
  }

  if (action === 'pro-bono-request') {
    const caseName = String(body.caseName || '').trim();
    const jurisdiction = String(body.jurisdiction || '').trim();
    const details = String(body.details || '').trim();
    const urgency = String(body.urgency || 'high') as 'low' | 'medium' | 'high' | 'critical';
    if (!caseName || !jurisdiction || !details) return bad('caseName, jurisdiction, and details are required');

    const row = { id: newId('probono'), caseName, jurisdiction, details, urgency, createdAt: now, actorId: identity.actorId };

    if (isSupabaseConfigured()) {
      await insertSupabaseAction(action, toDbPayload(action, row));
      await appendAudit(identity, 'pro-bono-request.submitted', { requestId: row.id, urgency: row.urgency, jurisdiction: row.jurisdiction, authMethod: identity.method });
      return NextResponse.json({ success: true, data: row });
    }

    store.proBonoRequests = [row, ...store.proBonoRequests].slice(0, 1000);
    pushAudit('pro-bono-request.submitted', identity.actorId, { requestId: row.id, urgency: row.urgency, jurisdiction: row.jurisdiction, authMethod: identity.method });
    await persistStore();
    return NextResponse.json({ success: true, data: row });
  }

  if (action === 'alert-subscription') {
    const email = String(body.email || '').trim();
    const mobile = String(body.mobile || '').trim();
    const topics = Array.isArray(body.topics) ? body.topics.map((x) => String(x)).filter(Boolean) : [];
    const channels = Array.isArray(body.channels)
      ? body.channels.map((x) => String(x)).filter((x) => x === 'email' || x === 'sms')
      : ['email'];
    if (!email || topics.length === 0) return bad('email and at least one topic are required');

    const row = { id: newId('alert'), email, mobile: mobile || undefined, topics, channels: channels as Array<'email' | 'sms'>, createdAt: now, actorId: identity.actorId };

    if (isSupabaseConfigured()) {
      await insertSupabaseAction(action, toDbPayload(action, row));
      await appendAudit(identity, 'rapid-alert.subscribed', { subscriptionId: row.id, topics: row.topics, channels: row.channels, authMethod: identity.method });
      return NextResponse.json({ success: true, data: row });
    }

    store.alertSubscriptions = [row, ...store.alertSubscriptions.filter((x) => x.email !== row.email)].slice(0, 1000);
    pushAudit('rapid-alert.subscribed', identity.actorId, { subscriptionId: row.id, topics: row.topics, channels: row.channels, authMethod: identity.method });
    await persistStore();
    return NextResponse.json({ success: true, data: row });
  }

  if (action === 'icip-registry-entry') {
    const claimTitle = String(body.claimTitle || '').trim();
    const communityName = String(body.communityName || '').trim();
    const claimantName = String(body.claimantName || '').trim();
    const contactEmail = String(body.contactEmail || '').trim();
    const assetType = String(body.assetType || 'other').trim();
    const rightsScope = String(body.rightsScope || 'ownership').trim();
    const protocolVisibility = String(body.protocolVisibility || 'restricted').trim();
    const protocolSummary = String(body.protocolSummary || '').trim();
    const licensingTerms = String(body.licensingTerms || '').trim();
    const infringementSummary = String(body.infringementSummary || '').trim();
    const evidence = Array.isArray(body.evidence) ? body.evidence : [];
    if (!claimTitle || !communityName || !claimantName || !contactEmail || !protocolSummary) {
      return bad('claimTitle, communityName, claimantName, contactEmail, and protocolSummary are required');
    }

    const entryId = newId('icip');
    const row = {
      id: entryId,
      registryNumber: `ICIP-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      claimTitle,
      communityName,
      claimantName,
      contactEmail,
      assetType: assetType as typeof store.icipRegistryEntries[number]['assetType'],
      rightsScope: rightsScope as typeof store.icipRegistryEntries[number]['rightsScope'],
      protocolVisibility: protocolVisibility as typeof store.icipRegistryEntries[number]['protocolVisibility'],
      protocolSummary,
      licensingTerms: licensingTerms || undefined,
      infringementSummary: infringementSummary || undefined,
      status: 'submitted' as const,
      publicListingState: 'private' as const,
      publicTitle: undefined,
      publicSummary: undefined,
      publicProtocolNotice: undefined,
      createdAt: now,
      updatedAt: now,
      actorId: identity.actorId
    };

    const evidenceRows = evidence
      .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === 'object'))
      .map((item) => ({
        id: newId('evidence'),
        entryId,
        label: String(item.label || 'Supporting Evidence').trim() || 'Supporting Evidence',
        evidenceType: String(item.evidenceType || 'document').trim() as typeof store.icipEvidence[number]['evidenceType'],
        fileUrl: String(item.fileUrl || '').trim() || undefined,
        contentHash: String(item.contentHash || '').trim() || undefined,
        description: String(item.description || '').trim() || undefined,
        createdAt: now,
        actorId: identity.actorId
      }));

    if (isSupabaseConfigured()) {
      await insertSupabaseAction('icip-registry-entry', toDbPayload('icip-registry-entry', row));
      for (const evidenceRow of evidenceRows) {
        await insertSupabaseAction('icip-registry-evidence', {
          id: evidenceRow.id,
          entry_id: evidenceRow.entryId,
          label: evidenceRow.label,
          evidence_type: evidenceRow.evidenceType,
          file_url: evidenceRow.fileUrl,
          content_hash: evidenceRow.contentHash,
          description: evidenceRow.description,
          created_at: evidenceRow.createdAt,
          actor_id: evidenceRow.actorId
        });
      }
      await insertSupabaseAction('icip-registry-activity', {
        id: newId('icip-activity'),
        entry_id: entryId,
        activity_type: 'claim_submitted',
        actor_id: identity.actorId,
        actor_label: row.claimantName,
        title: 'Claim submitted',
        body: 'Protected ICIP claim entered the registry and is awaiting review.',
        created_at: now
      });
      await appendAudit(identity, 'icip.claim-submitted', {
        entryId,
        registryNumber: row.registryNumber,
        communityName: row.communityName,
        assetType: row.assetType,
        rightsScope: row.rightsScope,
        evidenceCount: evidenceRows.length
      });
      return NextResponse.json({ success: true, data: { ...row, evidence: evidenceRows } });
    }

    store.icipRegistryEntries = [row, ...store.icipRegistryEntries].slice(0, 2000);
    store.icipEvidence = [...evidenceRows, ...store.icipEvidence].slice(0, 5000);
    store.icipActivity = [
      {
        id: newId('icip-activity'),
        entryId,
        activityType: 'claim_submitted' as const,
        actorId: identity.actorId,
        actorLabel: row.claimantName,
        title: 'Claim submitted',
        body: 'Protected ICIP claim entered the registry and is awaiting review.',
        createdAt: now
      },
      ...store.icipActivity
    ].slice(0, 5000);
    pushAudit('icip.claim-submitted', identity.actorId, {
      entryId,
      registryNumber: row.registryNumber,
      communityName: row.communityName,
      assetType: row.assetType,
      rightsScope: row.rightsScope,
      evidenceCount: evidenceRows.length
    });
    await persistStore();
    return NextResponse.json({ success: true, data: { ...row, evidence: evidenceRows } });
  }

  if (action === 'icip-claim-comment') {
    const entryId = String(body.entryId || '').trim();
    const bodyText = String(body.body || '').trim();
    if (!entryId) return bad('entryId is required');
    if (!bodyText) return bad('body is required');

    let actingAsAdmin = false;
    if (isAdminSigned(req)) {
      const elevated = await requireAdvocacyOpsRole(req, ['admin', 'legal_ops', 'legal_admin']);
      if (!elevated.error) actingAsAdmin = true;
    }

    if (isSupabaseConfigured()) {
      let claim = (await getSupabaseIcipRegistry({ actorId: identity.actorId, limit: 100 })).find((row) => row.id === entryId) || null;
      if (!claim && actingAsAdmin) {
        const statuses = ['submitted', 'under_review', 'approved', 'rejected'] as const;
        for (const status of statuses) {
          const found = (await getSupabaseIcipRegistry({ status, limit: 100 })).find((row) => row.id === entryId);
          if (found) {
            claim = found;
            break;
          }
        }
      }
      if (!claim) return bad('ICIP claim not found', 404);
      const actorLabel = actingAsAdmin ? 'Legal Review Team' : (claim.claimantName || 'Claimant');
      const row = {
        id: newId('icip-activity'),
        entry_id: entryId,
        activity_type: 'comment',
        actor_id: identity.actorId,
        actor_label: actorLabel,
        title: actingAsAdmin ? 'Protected reviewer note' : 'Claimant note',
        body: bodyText,
        created_at: now
      };
      await insertSupabaseAction('icip-registry-activity', row);
      await appendAudit(identity, 'icip.comment-added', { entryId, actingAsAdmin });
      return NextResponse.json({
        success: true,
        data: {
          id: row.id,
          entryId,
          activityType: 'comment',
          actorId: identity.actorId,
          actorLabel,
          title: row.title,
          body: bodyText,
          createdAt: now
        }
      });
    }

    const existing = store.icipRegistryEntries.find((row) => row.id === entryId);
    if (!existing) return bad('ICIP claim not found', 404);
    if (existing.actorId !== identity.actorId && !actingAsAdmin) return bad('ICIP claim not found', 404);

    const actorLabel = actingAsAdmin ? 'Legal Review Team' : existing.claimantName;
    const row = {
      id: newId('icip-activity'),
      entryId,
      activityType: 'comment' as const,
      actorId: identity.actorId,
      actorLabel,
      title: actingAsAdmin ? 'Protected reviewer note' : 'Claimant note',
      body: bodyText,
      createdAt: now
    };
    store.icipActivity = [row, ...store.icipActivity].slice(0, 5000);
    pushAudit('icip.comment-added', identity.actorId, { entryId, actingAsAdmin });
    await persistStore();
    return NextResponse.json({ success: true, data: row });
  }

  if (action === 'icip-public-visibility') {
    const entryId = String(body.entryId || '').trim();
    const requestedState = String(body.publicListingState || 'private').trim() as 'private' | 'public_summary';
    const publicTitle = String(body.publicTitle || '').trim();
    const publicSummary = String(body.publicSummary || '').trim();
    const publicProtocolNotice = String(body.publicProtocolNotice || '').trim();
    if (!entryId) return bad('entryId is required');
    if (!['private', 'public_summary'].includes(requestedState)) return bad('publicListingState is invalid');

    let actingAsAdmin = false;
    if (isAdminSigned(req)) {
      const elevated = await requireAdvocacyOpsRole(req, ['admin', 'legal_ops', 'legal_admin']);
      if (!elevated.error) actingAsAdmin = true;
    }

    if (isSupabaseConfigured()) {
      let claim = (await getSupabaseIcipRegistry({ actorId: identity.actorId, limit: 100 })).find((row) => row.id === entryId) || null;
      if (!claim && actingAsAdmin) {
        const statuses = ['submitted', 'under_review', 'approved', 'rejected'] as const;
        for (const status of statuses) {
          const found = (await getSupabaseIcipRegistry({ status, limit: 100 })).find((row) => row.id === entryId);
          if (found) {
            claim = found;
            break;
          }
        }
      }
      if (!claim) return bad('ICIP claim not found', 404);

      const appliedState =
        claim.status === 'approved' && requestedState === 'public_summary' && publicSummary
          ? 'public_summary'
          : 'private';
      const appliedTitle = appliedState === 'public_summary' ? publicTitle || claim.claimTitle : '';
      const appliedSummary = appliedState === 'public_summary' ? publicSummary : '';
      const appliedNotice = appliedState === 'public_summary' ? publicProtocolNotice : '';

      const updated = await updateSupabaseIcipVisibility({
        entryId,
        actorId: actingAsAdmin ? undefined : identity.actorId,
        publicListingState: appliedState,
        publicTitle: appliedTitle,
        publicSummary: appliedSummary,
        publicProtocolNotice: appliedNotice
      });

      await appendAudit(identity, 'icip.public-summary-updated', {
        entryId,
        requestedState,
        appliedState,
        actingAsAdmin,
        hasSummary: Boolean(publicSummary)
      });
      await insertSupabaseAction('icip-registry-activity', {
        id: newId('icip-activity'),
        entry_id: entryId,
        activity_type: 'public_visibility_updated',
        actor_id: identity.actorId,
        actor_label: actingAsAdmin ? 'Legal Review Team' : (claim.claimantName || 'Claimant'),
        title: appliedState === 'public_summary' ? 'Public summary published' : 'Claim returned to private',
        body: appliedState === 'public_summary' ? 'A sanitized public ICIP notice is now visible.' : 'The public summary has been removed and the claim is private again.',
        created_at: now
      });

      return NextResponse.json({
        success: true,
        data: {
          id: entryId,
          publicListingState: appliedState,
          publicTitle: appliedTitle,
          publicSummary: appliedSummary,
          publicProtocolNotice: appliedNotice,
          updatedAt: String(updated?.updated_at || now)
        }
      });
    }

    const existing = store.icipRegistryEntries.find((row) => row.id === entryId);
    if (!existing) return bad('ICIP claim not found', 404);
    if (existing.actorId !== identity.actorId && !actingAsAdmin) return bad('ICIP claim not found', 404);

    const appliedState =
      existing.status === 'approved' && requestedState === 'public_summary' && publicSummary
        ? 'public_summary'
        : 'private';
    const appliedTitle = appliedState === 'public_summary' ? publicTitle || existing.claimTitle : undefined;
    const appliedSummary = appliedState === 'public_summary' ? publicSummary : undefined;
    const appliedNotice = appliedState === 'public_summary' ? publicProtocolNotice : undefined;

    store.icipRegistryEntries = store.icipRegistryEntries.map((row) =>
      row.id === entryId
        ? {
            ...row,
            publicListingState: appliedState,
            publicTitle: appliedTitle,
            publicSummary: appliedSummary,
            publicProtocolNotice: appliedNotice,
            updatedAt: now
          }
        : row
    );
    pushAudit('icip.public-summary-updated', identity.actorId, {
      entryId,
      requestedState,
      appliedState,
      actingAsAdmin,
      hasSummary: Boolean(publicSummary)
    });
    store.icipActivity = [
      {
        id: newId('icip-activity'),
        entryId,
        activityType: 'public_visibility_updated' as const,
        actorId: identity.actorId,
        actorLabel: actingAsAdmin ? 'Legal Review Team' : existing.claimantName,
        title: appliedState === 'public_summary' ? 'Public summary published' : 'Claim returned to private',
        body: appliedState === 'public_summary' ? 'A sanitized public ICIP notice is now visible.' : 'The public summary has been removed and the claim is private again.',
        createdAt: now
      },
      ...store.icipActivity
    ].slice(0, 5000);
    await persistStore();
    return NextResponse.json({
      success: true,
      data: {
        id: entryId,
        publicListingState: appliedState,
        publicTitle: appliedTitle || '',
        publicSummary: appliedSummary || '',
        publicProtocolNotice: appliedNotice || '',
        updatedAt: now
      }
    });
  }

  if (action === 'donation-intent') {
    const campaignId = String(body.campaignId || '').trim();
    const campaignTitle = String(body.campaignTitle || '').trim();
    const donorName = String(body.donorName || '').trim() || 'Supporter';
    const amount = Number(body.amount || 0);
    const currency = String(body.currency || 'USD').trim().toUpperCase() || 'USD';
    if (!campaignId || !campaignTitle || !Number.isFinite(amount) || amount <= 0) return bad('campaignId, campaignTitle and positive amount are required');

    const row = {
      id: newId('donation'),
      campaignId,
      campaignTitle,
      amount,
      donorName,
      paymentIntentId: newId('intent'),
      paymentState: 'intent_created' as const,
      currency,
      status: 'requires_confirmation' as const,
      updatedAt: now,
      createdAt: now,
      actorId: identity.actorId
    };

    if (isSupabaseConfigured()) {
      await insertSupabaseAction('donation', toDbPayload('donation', row));
      await appendAudit(identity, 'campaign.donation-intent', {
        donationId: row.id,
        paymentIntentId: row.paymentIntentId,
        campaignId: row.campaignId,
        amount: row.amount,
        currency,
        authMethod: identity.method
      });
      await appendOperationalEvent({
        eventType: 'donation_intent_created',
        source: 'advocacy-actions',
        actorId: identity.actorId,
        entityType: 'donation',
        entityId: row.id,
        message: 'Donation intent created',
        metadata: { campaignId: row.campaignId, amount: row.amount, currency }
      });
      return NextResponse.json({ success: true, data: row });
    }

    store.donations = [row, ...store.donations.filter((item) => item.id !== row.id)].slice(0, 2000);
    pushAudit('campaign.donation-intent', identity.actorId, {
      donationId: row.id,
      paymentIntentId: row.paymentIntentId,
      campaignId: row.campaignId,
      amount: row.amount,
      currency,
      authMethod: identity.method
    });
    await appendOperationalEvent({
      eventType: 'donation_intent_created',
      source: 'advocacy-actions',
      actorId: identity.actorId,
      entityType: 'donation',
      entityId: row.id,
      message: 'Donation intent created',
      metadata: { campaignId: row.campaignId, amount: row.amount, currency }
    });
    await persistStore();
    return NextResponse.json({ success: true, data: row });
  }

  if (action === 'donation-confirmation' || action === 'donation') {
    const campaignId = String(body.campaignId || '').trim();
    const campaignTitle = String(body.campaignTitle || '').trim();
    const donorName = String(body.donorName || '').trim() || 'Supporter';
    const amount = Number(body.amount || 0);
    const currency = String(body.currency || 'USD').trim().toUpperCase() || 'USD';
    const paymentIntentId = String(body.paymentIntentId || newId('intent')).trim();
    if (!campaignId || !campaignTitle || !Number.isFinite(amount) || amount <= 0) return bad('campaignId, campaignTitle and positive amount are required');

    const existingIntent = isSupabaseConfigured() ? null : store.donations.find((item) => item.actorId === identity.actorId && item.paymentIntentId === paymentIntentId && item.status === 'requires_confirmation');
    const row = {
      id: existingIntent?.id || newId('donation'),
      campaignId,
      campaignTitle,
      amount,
      donorName,
      paymentIntentId,
      paymentState: 'succeeded' as const,
      receiptId: newId('receipt'),
      currency,
      status: 'succeeded' as const,
      updatedAt: now,
      createdAt: now,
      actorId: identity.actorId
    };
    const receipt = {
      id: row.receiptId,
      donationId: row.id,
      paymentIntentId,
      campaignId,
      campaignTitle,
      amount,
      donorName,
      currency,
      paymentStatus: 'succeeded' as const,
      receiptUrl: `/advocacy-legal/dashboard/my-advocacy/receipt/${row.receiptId}`,
      refundReviewStatus: 'none' as const,
      updatedAt: now,
      createdAt: now,
      actorId: identity.actorId
    };

    if (isSupabaseConfigured()) {
      await insertSupabaseAction('donation', toDbPayload('donation', row));
      await insertSupabaseAction('donation-receipt', toDbPayload('donation-receipt', receipt));
      await appendAudit(identity, 'campaign.donation-confirmed', {
        donationId: row.id,
        receiptId: receipt.id,
        paymentIntentId,
        campaignId: row.campaignId,
        amount: row.amount,
        currency,
        authMethod: identity.method
      });
      await appendOperationalEvent({
        eventType: 'donation_confirmed',
        source: 'advocacy-actions',
        actorId: identity.actorId,
        entityType: 'donation',
        entityId: row.id,
        status: 'succeeded',
        message: 'Donation confirmed and receipt issued',
        metadata: { campaignId: row.campaignId, amount: row.amount, currency, receiptId: receipt.id }
      });
      return NextResponse.json({ success: true, data: { ...row, receipt } });
    }

    store.donations = [row, ...store.donations.filter((item) => item.id !== row.id && item.paymentIntentId !== paymentIntentId)].slice(0, 2000);
    store.donationReceipts = [receipt, ...store.donationReceipts.filter((item) => item.id !== receipt.id)].slice(0, 2000);
    pushAudit('campaign.donation-confirmed', identity.actorId, {
      donationId: row.id,
      receiptId: receipt.id,
      paymentIntentId,
      campaignId: row.campaignId,
      amount: row.amount,
      currency,
      authMethod: identity.method
    });
    await appendOperationalEvent({
      eventType: 'donation_confirmed',
      source: 'advocacy-actions',
      actorId: identity.actorId,
      entityType: 'donation',
      entityId: row.id,
      status: 'succeeded',
      message: 'Donation confirmed and receipt issued',
      metadata: { campaignId: row.campaignId, amount: row.amount, currency, receiptId: receipt.id }
    });
    await persistStore();
    return NextResponse.json({ success: true, data: { ...row, receipt } });
  }

  if (action === 'consultation-request') {
    const attorneyId = String(body.attorneyId || '').trim();
    const attorneyName = String(body.attorneyName || '').trim();
    const type = String(body.type || 'consultation') as 'consultation' | 'pro-bono-review';
    const caseSummary = String(body.caseSummary || '').trim();
    const contactEmail = String(body.contactEmail || '').trim();
    if (!attorneyId || !attorneyName || !caseSummary || !contactEmail) return bad('attorneyId, attorneyName, caseSummary, and contactEmail are required');

    const row = { id: newId('consult'), attorneyId, attorneyName, type, caseSummary, contactEmail, createdAt: now, actorId: identity.actorId };

    if (isSupabaseConfigured()) {
      await insertSupabaseAction(action, toDbPayload(action, row));
      await appendAudit(identity, 'consultation.requested', { requestId: row.id, attorneyId: row.attorneyId, type: row.type, authMethod: identity.method });
      return NextResponse.json({ success: true, data: row });
    }

    store.consultations = [row, ...store.consultations].slice(0, 1000);
    pushAudit('consultation.requested', identity.actorId, { requestId: row.id, attorneyId: row.attorneyId, type: row.type, authMethod: identity.method });
    await persistStore();
    return NextResponse.json({ success: true, data: row });
  }

  if (action === 'policy-action') {
    const billId = String(body.billId || '').trim();
    const title = String(body.title || '').trim();
    const actionType = String(body.actionType || '').trim() as 'letter' | 'petition' | 'hearing-rsvp';
    const actorName = String(body.actorName || '').trim() || 'Community Member';
    if (!billId || !title || !actionType) return bad('billId, title and actionType are required');

    const row = { id: newId('policy'), billId, title, actionType, actorName, createdAt: now, actorId: identity.actorId };

    if (isSupabaseConfigured()) {
      await insertSupabaseAction(action, toDbPayload(action, row));
      await appendAudit(identity, 'policy.action', { actionId: row.id, billId: row.billId, actionType: row.actionType, authMethod: identity.method });
      return NextResponse.json({ success: true, data: row });
    }

    store.policyActions = [row, ...store.policyActions].slice(0, 2000);
    pushAudit('policy.action', identity.actorId, { actionId: row.id, billId: row.billId, actionType: row.actionType, authMethod: identity.method });
    await persistStore();
    return NextResponse.json({ success: true, data: row });
  }

  if (action === 'donation-refund' || action === 'donation-cancel') {
    const donationId = String(body.donationId || '').trim();
    const receiptId = String(body.receiptId || '').trim() || undefined;
    const refundReason = String(body.refundReason || '').trim() || undefined;
    if (!donationId) return bad('donationId is required');
    const nextStatus = action === 'donation-refund' ? 'refund_requested' as const : 'cancelled' as const;
    const updatedAt = now;

    if (isSupabaseConfigured()) {
      const updated = await updateSupabaseDonationState({
        donationId,
        receiptId,
        actorId: identity.actorId,
        status: nextStatus,
        refundReason,
        refundReviewStatus: nextStatus === 'refund_requested' ? 'pending' : 'none'
      });
      await appendAudit(identity, action === 'donation-refund' ? 'campaign.refund-requested' : `campaign.${nextStatus}`, {
        donationId,
        receiptId: receiptId || null,
        refundReason: refundReason || null,
        authMethod: identity.method
      });
      await appendOperationalEvent({
        eventType: action === 'donation-refund' ? 'donation_refund_requested' : 'donation_cancelled',
        severity: action === 'donation-refund' ? 'warning' : 'info',
        source: 'advocacy-actions',
        actorId: identity.actorId,
        entityType: 'donation',
        entityId: donationId,
        status: nextStatus,
        message: action === 'donation-refund' ? 'Donation refund requested' : 'Donation cancelled before settlement',
        metadata: { receiptId: receiptId || null, refundReason: refundReason || null }
      });
      return NextResponse.json({ success: true, data: updated ? {
        id: String(updated.id || donationId),
        status: String(updated.status || nextStatus),
        updatedAt: String(updated.updated_at || updatedAt)
      } : { id: donationId, status: nextStatus, updatedAt } });
    }

    store.donations = store.donations.map((row) => row.id === donationId && row.actorId === identity.actorId ? {
      ...row,
      status: nextStatus,
      refundReason,
      refundRequestedAt: nextStatus === 'refund_requested' ? updatedAt : row.refundRequestedAt,
      updatedAt
    } : row);
    if (receiptId) {
      store.donationReceipts = store.donationReceipts.map((row) => row.id === receiptId && row.actorId === identity.actorId ? {
        ...row,
        paymentStatus: nextStatus === 'cancelled' ? 'cancelled' : row.paymentStatus,
        refundReviewStatus: nextStatus === 'refund_requested' ? 'pending' : row.refundReviewStatus,
        updatedAt
      } : row);
    }
    pushAudit(action === 'donation-refund' ? 'campaign.refund-requested' : `campaign.${nextStatus}`, identity.actorId, {
      donationId,
      receiptId: receiptId || null,
      refundReason: refundReason || null,
      authMethod: identity.method
    });
    await appendOperationalEvent({
      eventType: action === 'donation-refund' ? 'donation_refund_requested' : 'donation_cancelled',
      severity: action === 'donation-refund' ? 'warning' : 'info',
      source: 'advocacy-actions',
      actorId: identity.actorId,
      entityType: 'donation',
      entityId: donationId,
      status: nextStatus,
      message: action === 'donation-refund' ? 'Donation refund requested' : 'Donation cancelled before settlement',
      metadata: { receiptId: receiptId || null, refundReason: refundReason || null }
    });
    await persistStore();
    return NextResponse.json({ success: true, data: { id: donationId, status: nextStatus, updatedAt } });
  }

  return bad('Unsupported action type', 400);
}
