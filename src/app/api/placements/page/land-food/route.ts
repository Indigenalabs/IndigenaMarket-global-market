import { NextResponse } from 'next/server';
import { getPlacementFeed } from '@/app/lib/pagePlacementsServer';

export async function GET() {
  const payload = await getPlacementFeed(
    'land-food',
    {
      stickyBanner: 'land-food-land-sticky',
      heroBanner: 'land-food-land-hero',
      featuredProducerSpotlight: 'land-food-land-producer',
      trendingStrip: 'land-food-land-seasonal',
      sponsoredListingCard: 'land-food-land-card',
      projectSpotlight: 'land-food-land-newsletter',
      institutionPartnerStrip: 'land-food-land-takeover'
    },
    {
      stickyBanner: { price: 95, period: 'week' },
      heroBanner: { price: 190, period: 'week' },
      featuredProducerSpotlight: { price: 160, period: 'week' },
      trendingStrip: { price: 120, period: 'week' },
      sponsoredListingCard: { price: 110, period: 'week' },
      projectSpotlight: { price: 220, period: 'send' },
      institutionPartnerStrip: { price: 175, period: 'week' }
    }
  );

  return NextResponse.json(payload);
}
