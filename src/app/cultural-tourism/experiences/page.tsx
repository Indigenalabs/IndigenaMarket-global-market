'use client';

import CulturalTourismMarketplace from '@/app/components/marketplace/CulturalTourismMarketplace';
import CommunityMarketplaceExplorer from '@/app/components/community/CommunityMarketplaceExplorer';
import CulturalTourismFrame from '../components/CulturalTourismFrame';

export default function CulturalTourismViewAllExperiencesPage() {
  return (
    <CulturalTourismFrame
      title="All Tourism Experiences"
      subtitle="Every host, destination, workshop, and booking lane in one view."
      showPremiumHero={false}
      showStickyBanner={false}
    >
      <CommunityMarketplaceExplorer
        pillar="cultural-tourism"
        title="Community-owned tourism offers"
        subtitle="Community-run tours, workshops, and destination offers stay visible in the public tourism discovery flow, with split-rule routing available as a booking facet."
        emptyLabel="No community-owned tourism offers match the current marketplace facets."
      />
      <CulturalTourismMarketplace viewAllOnly />
    </CulturalTourismFrame>
  );
}
