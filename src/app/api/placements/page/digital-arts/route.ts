import { NextResponse } from 'next/server';
import { getPlacementFeed } from '@/app/lib/pagePlacementsServer';

export async function GET() {
  const payload = await getPlacementFeed(
    'digital-arts',
    {
      stickyBanner: 'digital-arts-digital-sticky',
      heroPlacement: 'digital-arts-digital-hero',
      sponsoredCard: 'digital-arts-digital-card',
      artistSpotlight: 'digital-arts-digital-artist',
      trendingCollections: 'digital-arts-digital-trending',
      collectorNewsletter: 'digital-arts-digital-newsletter',
      limitedDropTakeover: 'digital-arts-digital-takeover'
    },
    {
      stickyBanner: { price: 110, period: 'week' },
      heroPlacement: { price: 200, period: 'week' },
      sponsoredCard: { price: 180, period: 'week' },
      artistSpotlight: { price: 160, period: 'week' },
      trendingCollections: { price: 145, period: 'week' },
      collectorNewsletter: { price: 300, period: 'send' },
      limitedDropTakeover: { price: 260, period: 'week' }
    }
  );

  return NextResponse.json(payload);
}
