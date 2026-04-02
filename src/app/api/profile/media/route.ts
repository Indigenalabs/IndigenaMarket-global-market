import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient, isSupabaseServerConfigured } from '@/app/lib/supabase/server';
import { requireCreatorProfileOwner } from '@/app/lib/creatorProfileAccess';

export const runtime = 'nodejs';

const PROFILE_MEDIA_BUCKET =
  process.env.SUPABASE_CREATOR_PROFILE_MEDIA_BUCKET || 'creator-profile-media';

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '-').toLowerCase();
}

export async function POST(req: NextRequest) {
  const formData = await req.formData().catch(() => null);
  if (!formData) {
    return NextResponse.json({ message: 'Invalid media upload payload.' }, { status: 400 });
  }

  const slug = String(formData.get('slug') || '').trim();
  const kind = String(formData.get('kind') || '').trim();
  const file = formData.get('file');

  if (!slug || !['avatar', 'cover'].includes(kind)) {
    return NextResponse.json({ message: 'Valid slug and media kind are required.' }, { status: 400 });
  }

  if (!(file instanceof File)) {
    return NextResponse.json({ message: 'Choose an image file to upload.' }, { status: 400 });
  }

  const owner = await requireCreatorProfileOwner(req, slug, {
    guestMessage: 'Sign in to upload profile media.',
    forbiddenMessage: 'You can only upload media for your own profile.',
    select: 'owner_actor_id'
  });
  if ('error' in owner) return owner.error;

  const bytes = Buffer.from(await file.arrayBuffer());
  const contentType = file.type || 'application/octet-stream';

  if (isSupabaseServerConfigured()) {
    try {
      const supabase = createSupabaseServerClient();
      const path = `${slug}/${kind}-${Date.now()}-${sanitizeFileName(file.name || `${kind}.bin`)}`;
      const { error: uploadError } = await supabase.storage.from(PROFILE_MEDIA_BUCKET).upload(path, bytes, {
        contentType,
        upsert: true
      });
      if (!uploadError) {
        const { data } = supabase.storage.from(PROFILE_MEDIA_BUCKET).getPublicUrl(path);
        if (data?.publicUrl) {
          return NextResponse.json({ data: { ok: true, url: data.publicUrl } });
        }
      }
    } catch {
      // Fallback to inline data URL when storage is unavailable in local/demo setups.
    }
  }

  const base64 = bytes.toString('base64');
  const dataUrl = `data:${contentType};base64,${base64}`;
  return NextResponse.json({ data: { ok: true, url: dataUrl } });
}



