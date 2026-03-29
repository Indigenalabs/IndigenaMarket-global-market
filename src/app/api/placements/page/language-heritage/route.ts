import { NextResponse } from 'next/server';
import { getPlacementFeed } from '@/app/lib/pagePlacementsServer';

export async function GET() {
  const payload = await getPlacementFeed(
    'language-heritage',
    {
      stickyBanner: 'language-heritage-language-sticky',
      heroPlacement: 'language-heritage-language-hero',
      collectionSpotlight: 'language-heritage-language-collection',
      keepersSpotlight: 'language-heritage-language-keepers',
      sponsoredCard: 'language-heritage-language-sponsored-card',
      liveSessionsRail: 'language-heritage-language-live-rail',
      territoryMapTakeover: 'language-heritage-language-map'
    },
    {
      stickyBanner: { price: 130, period: 'week' },
      heroPlacement: { price: 220, period: 'week' },
      collectionSpotlight: { price: 140, period: 'week' },
      keepersSpotlight: { price: 220, period: 'week' },
      sponsoredCard: { price: 150, period: 'week' },
      liveSessionsRail: { price: 180, period: 'week' },
      territoryMapTakeover: { price: 240, period: 'week' }
    }
  );

  return NextResponse.json(payload);
}
