import LandFoodFrame from '../components/LandFoodFrame';
import LandFoodMarketplace from '@/app/components/marketplace/LandFoodMarketplace';
import CommunityMarketplaceExplorer from '@/app/components/community/CommunityMarketplaceExplorer';

export default function LandFoodMarketplacePage() {
  return (
    <LandFoodFrame
      title="Land & Food Marketplace"
      subtitle="Regenerative economy discovery and booking surface for products, projects, and stewardship services."
    >
      <CommunityMarketplaceExplorer
        pillar="land-food"
        title="Community-owned land and food offers"
        subtitle="Community producers, harvest packs, and stewardship-linked listings now sit in the same discovery flow as the wider land and food marketplace."
        emptyLabel="No community-owned land and food offers match the current marketplace facets."
      />
      <LandFoodMarketplace />
    </LandFoodFrame>
  );
}
