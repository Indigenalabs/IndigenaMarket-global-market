import { NextResponse } from 'next/server';
import { getPlacementFeed } from '@/app/lib/pagePlacementsServer';

export async function GET() {
  const payload = await getPlacementFeed(
    'cultural-tourism',
    {
      stickyBanner: 'cultural-tourism-tourism-sticky',
      heroBanner: 'cultural-tourism-tourism-hero',
      operatorSpotlight: 'cultural-tourism-tourism-operator',
      sponsoredCard: 'cultural-tourism-tourism-sponsored-card',
      regionBoost: 'cultural-tourism-tourism-region',
      newsletterFeature: 'cultural-tourism-tourism-newsletter',
      seasonalTakeover: 'cultural-tourism-tourism-takeover'
    },
    {
      stickyBanner: { price: 120, period: 'week' },
      heroBanner: { price: 300, period: 'week' },
      operatorSpotlight: { price: 250, period: 'week' },
      sponsoredCard: { price: 180, period: 'week' },
      regionBoost: { price: 100, period: 'week' },
      newsletterFeature: { price: 350, period: 'send' },
      seasonalTakeover: { price: 220, period: 'week' }
    }
  );

  return NextResponse.json(payload);
}
