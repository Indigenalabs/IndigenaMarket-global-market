import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient, isSupabaseServerConfigured } from '@/app/lib/supabase/server';

function asText(value: unknown, fallback = '') {
  return typeof value === 'string' ? value.trim() : fallback;
}

function asObject(value: unknown) {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

const ALLOWED_EVENTS = new Set([
  'storefront_view',
  'offer_open',
  'bundle_view',
  'reviews_view',
  'message_open'
]);

const ALLOWED_PAGES = new Set(['profile', 'bundle', 'reviews']);

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ ok: true });

  const profileSlug = asText(body.profileSlug);
  const eventName = asText(body.eventName);
  const offeringId = asText(body.offeringId);
  const bundleId = asText(body.bundleId);
  const pageKind = asText(body.pageKind, 'profile');
  const metadata = asObject(body.metadata);

  if (!profileSlug || !ALLOWED_EVENTS.has(eventName) || !ALLOWED_PAGES.has(pageKind)) {
    return NextResponse.json({ ok: true });
  }

  if (!isSupabaseServerConfigured()) return NextResponse.json({ ok: true });

  const supabase = createSupabaseServerClient();
  await supabase.from('creator_profile_analytics_events').insert({
    id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    profile_slug: profileSlug,
    offering_id: offeringId || null,
    bundle_id: bundleId || null,
    event_name: eventName,
    page_kind: pageKind,
    metadata
  });

  return NextResponse.json({ ok: true });
}
