import { NextResponse } from 'next/server';
import { getPlacementFeed } from '@/app/lib/pagePlacementsServer';

export async function GET() {
  const payload = await getPlacementFeed(
    'courses',
    {
      stickyAnnouncement: 'courses-courses-sticky',
      heroPlacement: 'courses-courses-hero',
      promotedCourseCard: 'courses-courses-promoted-card',
      categoryFeaturedCourse: 'courses-courses-category',
      courseSidebarAd: 'courses-courses-sidebar',
      instructorSpotlight: 'courses-courses-spotlight',
      featuredBundlePromotion: 'courses-courses-bundle'
    },
    {
      stickyAnnouncement: { price: 90, period: 'week' },
      heroPlacement: { price: 180, period: 'week' },
      promotedCourseCard: { price: 75, period: 'week' },
      categoryFeaturedCourse: { price: 150, period: 'week' },
      courseSidebarAd: { price: 100, period: 'week' },
      instructorSpotlight: { price: 300, period: 'week' },
      featuredBundlePromotion: { price: 250, period: 'week' }
    }
  );

  return NextResponse.json(payload);
}
