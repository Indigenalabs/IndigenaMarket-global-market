import { NextRequest, NextResponse } from 'next/server';
import { requireCreatorProfileOwner } from '@/app/lib/creatorProfileAccess';
import { getCreatorProfileBySlug, updateCreatorProfileShippingSettings, type CreatorShippingSettings } from '@/app/profile/data/profileShowcase';

function asText(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback;
}

function asBool(value: unknown, fallback = false) {
  return typeof value === 'boolean' ? value : fallback;
}

function normalizeShippingSettings(input: unknown, fallback: CreatorShippingSettings): CreatorShippingSettings {
  const record = input && typeof input === 'object' ? (input as Record<string, unknown>) : {};
  const integrations = Array.isArray(record.integrations) ? record.integrations : fallback.integrations;
  return {
    domesticProfile: asText(record.domesticProfile, fallback.domesticProfile),
    internationalProfile: asText(record.internationalProfile, fallback.internationalProfile),
    defaultPackage: asText(record.defaultPackage, fallback.defaultPackage),
    handlingTime: asText(record.handlingTime, fallback.handlingTime),
    integrations: integrations.map((entry, index) => {
      const item = entry && typeof entry === 'object' ? (entry as Record<string, unknown>) : {};
      const seed = fallback.integrations[index] ?? fallback.integrations[0];
      return {
        label: asText(item.label, seed?.label ?? 'Integration'),
        detail: asText(item.detail, seed?.detail ?? ''),
        connected: asBool(item.connected, seed?.connected ?? false)
      };
    })
  };
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ message: 'Invalid shipping settings payload.' }, { status: 400 });

  const slug = asText(body.slug);
  if (!slug) return NextResponse.json({ message: 'Profile slug is required.' }, { status: 400 });

  const fallbackProfile = getCreatorProfileBySlug(slug);
  const nextSettings = normalizeShippingSettings(body.shippingSettings, fallbackProfile.shippingSettings);

  const owner = await requireCreatorProfileOwner(req, slug, {
    guestMessage: 'Connect your wallet to update shipping settings.',
    forbiddenMessage: 'You can only update your own shipping settings.',
    select: 'owner_actor_id'
  });
  if ('error' in owner) return owner.error;

  if (owner.supabase) {
    const { error } = await owner.supabase
      .from('creator_profiles')
      .update({
        shipping_settings: nextSettings,
        updated_at: new Date().toISOString()
      })
      .eq('slug', slug);

    if (error) {
      return NextResponse.json({ message: error.message || 'Unable to update shipping settings.' }, { status: 500 });
    }
  }

  return NextResponse.json({ data: { ok: true, shippingSettings: updateCreatorProfileShippingSettings(slug, nextSettings).shippingSettings } });
}
