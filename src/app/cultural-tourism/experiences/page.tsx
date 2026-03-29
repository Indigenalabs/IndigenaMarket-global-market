'use client';

import CulturalTourismMarketplace from '@/app/components/marketplace/CulturalTourismMarketplace';
import CulturalTourismFrame from '../components/CulturalTourismFrame';

export default function CulturalTourismViewAllExperiencesPage() {
  return (
    <CulturalTourismFrame
      title="All Tourism Experiences"
      subtitle="Every host, destination, workshop, and booking lane in one view."
      showPremiumHero={false}
      showStickyBanner={false}
    >
      <CulturalTourismMarketplace viewAllOnly />
    </CulturalTourismFrame>
  );
}
