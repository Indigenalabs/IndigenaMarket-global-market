import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient, isSupabaseServerConfigured } from '@/app/lib/supabase/server';
import { resolveRequestActorId } from '@/app/lib/requestIdentity';
import { findCreatorProfileSlugForActor } from '@/app/lib/accountAuthService';
import { getProfileMessageThreadsBySlug } from '@/app/profile/data/profileShowcase';

function asText(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback;
}

function timeLabel(isoValue: string) {
  if (!isoValue) return 'Now';
  const date = new Date(isoValue);
  if (Number.isNaN(date.getTime())) return isoValue;
  return date.toLocaleDateString('en-AU', { month: 'short', day: 'numeric' });
}

export async function GET(req: NextRequest) {
  const actorId = resolveRequestActorId(req);
  const explicitSlug = (new URL(req.url).searchParams.get('slug') || '').trim();
  const slug = explicitSlug || (await findCreatorProfileSlugForActor(actorId).catch(() => null)) || '';

  if (!slug) {
    return NextResponse.json({ data: { slug: '', threads: [] } });
  }

  if (!isSupabaseServerConfigured()) {
    return NextResponse.json({ data: { slug, threads: getProfileMessageThreadsBySlug(slug) } });
  }

  const supabase = createSupabaseServerClient();
  const { data: profile, error: profileError } = await supabase
    .from('creator_profiles')
    .select('owner_actor_id')
    .eq('slug', slug)
    .single();

  if (profileError || !profile) {
    return NextResponse.json({ message: 'Profile not found.' }, { status: 404 });
  }

  if (actorId === 'guest' || actorId !== String(profile.owner_actor_id)) {
    return NextResponse.json({ data: { slug, threads: getProfileMessageThreadsBySlug(slug) } });
  }

  const { data: rows, error } = await supabase
    .from('creator_profile_messages')
    .select('*')
    .eq('profile_slug', slug)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ message: error.message }, { status: 500 });

  const threadMap = new Map<string, {
    counterpartActorId: string;
    counterpartSlug: string;
    counterpartLabel: string;
    counterpartAvatar: string;
    pillar: string;
    unreadCount: number;
    latestSubject: string;
    latestPreview: string;
    latestAt: string;
    messages: Array<{
      id: string;
      subject: string;
      body: string;
      pillar: string;
      unread: boolean;
      createdAt: string;
      fromActorId: string;
      fromLabel: string;
      toActorId: string;
      direction: 'inbound' | 'outbound';
    }>;
  }>();

  const ownerActorId = String(profile.owner_actor_id);
  for (const row of rows ?? []) {
    const senderId = asText(row.sender_actor_id);
    const recipientId = asText(row.recipient_actor_id);
    const counterpartActorId = senderId === ownerActorId ? recipientId : senderId;
    if (!counterpartActorId) continue;
    const direction = senderId === ownerActorId ? 'outbound' : 'inbound';
    const existing = threadMap.get(counterpartActorId);
    const message = {
      id: asText(row.id),
      subject: asText(row.subject),
      body: asText(row.body),
      pillar: asText(row.pillar, 'digital-arts'),
      unread: Boolean(row.unread),
      createdAt: asText(row.created_at),
      fromActorId: senderId,
      fromLabel: asText(row.sender_label, `@${senderId}`),
      toActorId: recipientId,
      direction
    } as const;

    if (!existing) {
      threadMap.set(counterpartActorId, {
        counterpartActorId,
        counterpartSlug: counterpartActorId,
        counterpartLabel: direction === 'inbound' ? asText(row.sender_label, `@${senderId}`) : `@${counterpartActorId}`,
        counterpartAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop',
        pillar: message.pillar,
        unreadCount: direction === 'inbound' && message.unread ? 1 : 0,
        latestSubject: message.subject,
        latestPreview: message.body,
        latestAt: timeLabel(message.createdAt),
        messages: [message]
      });
      continue;
    }

    existing.messages.push(message);
    if (direction === 'inbound' && message.unread) existing.unreadCount += 1;
  }

  return NextResponse.json({
    data: {
      slug,
      threads: Array.from(threadMap.values()).map((thread) => ({
        ...thread,
        messages: [...thread.messages].sort((left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime())
      }))
    }
  });
}

export async function POST(req: NextRequest) {
  const actorId = resolveRequestActorId(req);
  if (!actorId || actorId === 'guest') {
    return NextResponse.json({ message: 'Sign in required to send a message.' }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as {
    profileSlug?: string;
    subject?: string;
    body?: string;
    pillar?: string;
    recipientActorId?: string;
  };

  const profileSlug = String(body.profileSlug || '').trim();
  const subject = String(body.subject || '').trim();
  const messageBody = String(body.body || '').trim();
  const pillar = String(body.pillar || 'digital-arts').trim();
  const explicitRecipientActorId = String(body.recipientActorId || '').trim();

  if (!profileSlug || !subject || !messageBody) {
    return NextResponse.json({ message: 'profileSlug, subject, and body are required.' }, { status: 400 });
  }

  if (!isSupabaseServerConfigured()) {
    return NextResponse.json({
      data: {
        ok: true,
        messageId: `mock-${Date.now()}`
      }
    });
  }

  const supabase = createSupabaseServerClient();
  const { data: profile, error: profileError } = await supabase
    .from('creator_profiles')
    .select('owner_actor_id, username')
    .eq('slug', profileSlug)
    .single();

  if (profileError || !profile) {
    return NextResponse.json({ message: 'Profile not found.' }, { status: 404 });
  }

  const recipientActorId = explicitRecipientActorId || String(profile.owner_actor_id);
  const senderLabel = actorId === String(profile.owner_actor_id)
    ? String(profile.username || actorId)
    : actorId.startsWith('@') ? actorId : `@${actorId}`;
  const { data, error } = await supabase
    .from('creator_profile_messages')
    .insert({
      profile_slug: profileSlug,
      recipient_actor_id: recipientActorId,
      sender_actor_id: actorId,
      sender_label: senderLabel,
      subject,
      body: messageBody,
      pillar,
      unread: true
    })
    .select('id')
    .single();

  if (error) return NextResponse.json({ message: error.message }, { status: 500 });

  return NextResponse.json({
    data: {
      ok: true,
      messageId: String(data?.id || '')
    }
  });
}
