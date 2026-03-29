import { NextRequest, NextResponse } from 'next/server';
import { requireCreatorProfileOwner } from '@/app/lib/creatorProfileAccess';
import { createCreatorProfileSupportRequest } from '@/app/profile/data/profileShowcase';

function asText(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback;
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ message: 'Invalid support payload.' }, { status: 400 });

  const slug = asText(body.slug);
  const title = asText(body.title);
  const detail = asText(body.detail);
  const channel = asText(body.channel) as 'chat' | 'callback' | 'tutorial' | 'compliance';

  if (!slug || !title || !detail || !['chat', 'callback', 'tutorial', 'compliance'].includes(channel)) {
    return NextResponse.json({ message: 'Valid support details are required.' }, { status: 400 });
  }

  const owner = await requireCreatorProfileOwner(req, slug, {
    guestMessage: 'Connect your wallet to contact support.',
    forbiddenMessage: 'You can only create support requests for your own studio.',
    select: 'owner_actor_id, support_requests'
  });
  if ('error' in owner) return owner.error;

  if (owner.supabase && owner.profileRow) {
    const request = {
      id: `support-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title,
      detail,
      channel,
      status: 'queued',
      created_at_label: 'Just now'
    };
    const { error } = await owner.supabase.from('creator_profile_support_requests').insert({
      ...request,
      profile_slug: slug,
      updated_at: new Date().toISOString()
    });

    if (error) {
      return NextResponse.json({ message: error.message || 'Unable to create support request.' }, { status: 500 });
    }
  }

  const { profile, request } = createCreatorProfileSupportRequest(slug, { title, detail, channel });
  return NextResponse.json({ data: { ok: true, profile, request } });
}
