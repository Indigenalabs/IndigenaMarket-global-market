import { NextResponse } from 'next/server';
import { getPlacementFeed } from '@/app/lib/pagePlacementsServer';

export async function GET() {
  return NextResponse.json(
    await getPlacementFeed(
      'freelancing',
      {
        stickyBanner: 'freelancing-freelance-sticky',
        heroPlacement: 'freelancing-freelance-hero',
        searchBoost: 'freelancing-freelance-search-boost',
        promotedServiceCard: 'freelancing-freelance-card',
        servicesSpotlight: 'freelancing-freelance-spotlight',
        newsletterFeature: 'freelancing-freelance-newsletter',
        leadGenTakeover: 'freelancing-freelance-takeover'
      },
      {
        'freelance-sticky': { price: 75, period: 'week' },
        'freelance-hero': { price: 250, period: 'week' },
        'freelance-search-boost': { price: 85, period: 'week' },
        'freelance-card': { price: 95, period: 'week' },
        'freelance-spotlight': { price: 140, period: 'week' },
        'freelance-newsletter': { price: 180, period: 'send' },
        'freelance-takeover': { price: 220, period: 'week' }
      }
    )
  );
}
