import { NextRequest, NextResponse } from 'next/server';
import { requireCreatorProfileOwner } from '@/app/lib/creatorProfileAccess';
import { updateCreatorProfileVerificationWorkflow } from '@/app/profile/data/profileShowcase';

function asText(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback;
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ message: 'Invalid verification payload.' }, { status: 400 });

  const slug = asText(body.slug);
  const workflowId = asText(body.workflowId);
  const action = asText(body.action);
  if (!slug || !workflowId || !['submit', 'request-info', 'approve'].includes(action)) {
    return NextResponse.json({ message: 'Valid slug, workflow id, and action are required.' }, { status: 400 });
  }

  const owner = await requireCreatorProfileOwner(req, slug, {
    guestMessage: 'Sign in to manage verification.',
    forbiddenMessage: 'You can only manage your own verification workflow.',
    select: 'owner_actor_id, verification_workflow'
  });
  if ('error' in owner) return owner.error;

  const nextStatus =
    action === 'approve' ? 'approved' : action === 'request-info' ? 'needs-info' : 'submitted';
  const nextActionLabel =
    nextStatus === 'approved'
      ? 'Approved'
      : nextStatus === 'submitted'
        ? 'In review'
        : nextStatus === 'needs-info'
          ? 'Upload files'
          : 'Submit now';

  if (owner.supabase && owner.profileRow) {
    const { error } = await owner.supabase
      .from('creator_profile_verification_items')
      .update({
        status: nextStatus,
        action_label: nextActionLabel,
        updated_at: new Date().toISOString()
      })
      .eq('profile_slug', slug)
      .eq('id', workflowId);

    if (error) {
      return NextResponse.json({ message: error.message || 'Unable to update verification workflow.' }, { status: 500 });
    }
  }

  const profile = updateCreatorProfileVerificationWorkflow(slug, workflowId, nextStatus);
  return NextResponse.json({ data: { ok: true, profile } });
}



