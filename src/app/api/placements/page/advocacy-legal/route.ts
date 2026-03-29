import { NextResponse } from 'next/server';
import { getPlacementFeed } from '@/app/lib/pagePlacementsServer';

export async function GET() {
  const payload = await getPlacementFeed(
    'advocacy-legal',
    {
      stickyBanner: 'advocacy-legal-advocacy-sticky',
      heroPlacement: 'advocacy-legal-advocacy-hero',
      resourceFeature: 'advocacy-legal-advocacy-resource',
      attorneySpotlight: 'advocacy-legal-advocacy-attorney',
      trendingActions: 'advocacy-legal-advocacy-trending',
      featuredCounsel: 'advocacy-legal-advocacy-keepers',
      institutionalPartner: 'advocacy-legal-advocacy-institutional'
    },
    {
      stickyBanner: { price: 135, period: 'week' },
      heroPlacement: { price: 260, period: 'week' },
      resourceFeature: { price: 175, period: 'week' },
      attorneySpotlight: { price: 240, period: 'week' },
      trendingActions: { price: 150, period: 'week' },
      featuredCounsel: { price: 185, period: 'week' },
      institutionalPartner: { price: 210, period: 'week' }
    }
  );

  return NextResponse.json(payload);
}
