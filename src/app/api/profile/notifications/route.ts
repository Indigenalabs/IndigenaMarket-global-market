import { NextRequest, NextResponse } from 'next/server';
import { requireCreatorProfileOwner } from '@/app/lib/creatorProfileAccess';
import { getCreatorProfileBySlug, updateCreatorProfileNotifications, type CreatorProfileRecord } from '@/app/profile/data/profileShowcase';

function asText(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback;
}

function asBool(value: unknown, fallback = false) {
  return typeof value === 'boolean' ? value : fallback;
}

function normalizeNotifications(input: unknown, fallback: CreatorProfileRecord['notifications']) {
  if (!Array.isArray(input)) return fallback;
  return input.map((entry, index) => {
    const item = entry && typeof entry === 'object' ? (entry as Record<string, unknown>) : {};
    const seed = fallback[index] ?? fallback[0];
    return {
      label: asText(item.label, seed?.label ?? 'Notification'),
      channel: asText(item.channel, seed?.channel ?? 'In-app'),
      enabled: asBool(item.enabled, seed?.enabled ?? false)
    };
  });
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ message: 'Invalid notification settings payload.' }, { status: 400 });

  const slug = asText(body.slug);
  if (!slug) return NextResponse.json({ message: 'Profile slug is required.' }, { status: 400 });

  const fallbackProfile = getCreatorProfileBySlug(slug);
  const nextNotifications = normalizeNotifications(body.notifications, fallbackProfile.notifications);

  const owner = await requireCreatorProfileOwner(req, slug, {
    guestMessage: 'Connect your wallet to update notification settings.',
    forbiddenMessage: 'You can only update your own notification settings.',
    select: 'owner_actor_id'
  });
  if ('error' in owner) return owner.error;

  if (owner.supabase) {
    const { error } = await owner.supabase
      .from('creator_profiles')
      .update({
        notifications: nextNotifications,
        updated_at: new Date().toISOString()
      })
      .eq('slug', slug);

    if (error) {
      return NextResponse.json({ message: error.message || 'Unable to update notification settings.' }, { status: 500 });
    }
  }

  return NextResponse.json({ data: { ok: true, notifications: updateCreatorProfileNotifications(slug, nextNotifications).notifications } });
}
