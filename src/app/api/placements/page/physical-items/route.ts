import { NextResponse } from 'next/server';
import { getPlacementFeed } from '@/app/lib/pagePlacementsServer';

export async function GET() {
  return NextResponse.json(
    await getPlacementFeed(
      'physical-items',
      {
        stickyBanner: 'physical-items-physical-sticky',
        heroPlacement: 'physical-items-physical-hero',
        makerFeature: 'physical-items-physical-maker',
        limitedDrop: 'physical-items-physical-drop',
        categoryShelf: 'physical-items-physical-category',
        newsletterFeature: 'physical-items-physical-newsletter',
        seasonalTakeover: 'physical-items-physical-seasonal'
      },
      {
        'physical-sticky': { price: 85, period: 'week' },
        'physical-hero': { price: 145, period: 'week' },
        'physical-maker': { price: 35, period: 'week' },
        'physical-drop': { price: 120, period: 'week' },
        'physical-category': { price: 95, period: 'week' },
        'physical-newsletter': { price: 190, period: 'send' },
        'physical-seasonal': { price: 210, period: 'week' }
      }
    )
  );
}
