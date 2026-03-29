import { NextResponse } from 'next/server';
import { getPlacementFeed } from '@/app/lib/pagePlacementsServer';

export async function GET() {
  return NextResponse.json(
    await getPlacementFeed(
      'materials-tools',
      {
        stickyBanner: 'materials-tools-materials-sticky',
        heroPlacement: 'materials-tools-materials-hero',
        sponsoredSupplyListing: 'materials-tools-materials-sponsored',
        supplierSpotlight: 'materials-tools-materials-supplier',
        toolLibraryHighlight: 'materials-tools-materials-rental',
        coopOrderBoost: 'materials-tools-materials-coop',
        newsletterFeature: 'materials-tools-materials-newsletter'
      },
      {
        'materials-sticky': { price: 110, period: 'week' },
        'materials-hero': { price: 180, period: 'week' },
        'materials-sponsored': { price: 95, period: 'week' },
        'materials-supplier': { price: 145, period: 'week' },
        'materials-rental': { price: 120, period: 'week' },
        'materials-coop': { price: 130, period: 'week' },
        'materials-newsletter': { price: 185, period: 'send' }
      }
    )
  );
}
