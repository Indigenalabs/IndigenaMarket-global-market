import crypto from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient, isSupabaseServerConfigured } from '@/app/lib/supabase/server';
import { beginWebhookEvent, completeWebhookEvent } from '@/app/lib/webhookEventStore';

const MATERIALS_WEBHOOK_SECRET =
  process.env.MATERIALS_TOOLS_PAYMENT_WEBHOOK_SECRET ||
  (process.env.NODE_ENV !== 'production' ? 'test-materials-webhook-secret' : '');
const MATERIALS_WEBHOOK_TOLERANCE_SECONDS = Number(
  process.env.MATERIALS_TOOLS_PAYMENT_WEBHOOK_TOLERANCE_SECONDS || '300'
);

function fail(message: string, status = 400) {
  return NextResponse.json({ message }, { status });
}

function parseTimestampMs(timestamp: string) {
  const parsed = Number(timestamp);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return parsed < 1_000_000_000_000 ? parsed * 1000 : parsed;
}

export async function POST(req: NextRequest) {
  if (!MATERIALS_WEBHOOK_SECRET) return fail('Webhook secret not configured', 500);

  const rawBody = await req.text();
  const timestamp = req.headers.get('x-indigena-webhook-timestamp') || '';
  const signature = req.headers.get('x-indigena-webhook-signature') || '';
  const timestampMs = parseTimestampMs(timestamp);
  if (!timestampMs) return fail('Invalid webhook timestamp', 401);
  if (Math.abs(Date.now() - timestampMs) > MATERIALS_WEBHOOK_TOLERANCE_SECONDS * 1000) {
    return fail('Webhook timestamp expired', 401);
  }
  const expected = crypto
    .createHmac('sha256', MATERIALS_WEBHOOK_SECRET)
    .update(`${timestamp}.${rawBody}`)
    .digest('hex');

  const provided = Buffer.from(signature, 'hex');
  const generated = Buffer.from(expected, 'hex');

  if (
    !timestamp ||
    !signature ||
    provided.length !== generated.length ||
    !crypto.timingSafeEqual(provided, generated)
  ) {
    return fail('Invalid webhook signature', 401);
  }

  const body = JSON.parse(rawBody || '{}') as Record<string, unknown>;
  const paymentIntentId = String(body.paymentIntentId || '').trim();
  const eventId = String(body.eventId || '').trim() || `evt-${crypto.randomUUID()}`;
  const status = String(body.status || '').trim();
  if (!paymentIntentId || !status) return fail('paymentIntentId and status are required');

  const eventLog = await beginWebhookEvent({
    provider: 'materials-tools',
    eventId,
    rawBody,
    metadata: { paymentIntentId, status }
  });
  if (eventLog.duplicate) {
    return NextResponse.json({ ok: true, duplicate: true, paymentIntentId, eventId });
  }

  const paymentStatus =
    status === 'failed'
      ? 'failed'
      : status === 'refunded'
        ? 'refunded'
        : status === 'processing'
          ? 'processing'
          : 'settled';

  const fulfillmentStatus =
    paymentStatus === 'settled'
      ? 'packing'
      : paymentStatus === 'failed'
        ? 'awaiting-payment'
        : 'queued';

  try {
    if (isSupabaseServerConfigured()) {
      const supabase = createSupabaseServerClient();
      const { error } = await supabase
        .from('materials_tools_orders')
        .update({
          payment_status: paymentStatus,
          processor_event_id: eventId,
          reconciled_at: new Date().toISOString(),
          fulfillment_status: fulfillmentStatus
        })
        .eq('payment_intent_id', paymentIntentId);
      if (error) {
        await completeWebhookEvent({
          provider: 'materials-tools',
          eventId,
          status: 'failed',
          resultSummary: `Unable to reconcile payment for ${paymentIntentId}`
        });
        return fail('Unable to reconcile payment', 500);
      }
    }

    await completeWebhookEvent({
      provider: 'materials-tools',
      eventId,
      status: 'processed',
      resultSummary: `Materials payment ${paymentStatus} and ${fulfillmentStatus}`,
      metadata: { paymentIntentId, fulfillmentStatus }
    });

    return NextResponse.json({
      ok: true,
      paymentIntentId,
      eventId,
      paymentStatus,
      fulfillmentStatus
    });
  } catch (error) {
    await completeWebhookEvent({
      provider: 'materials-tools',
      eventId,
      status: 'failed',
      resultSummary: error instanceof Error ? error.message : 'Unknown materials webhook failure'
    });
    throw error;
  }
}
