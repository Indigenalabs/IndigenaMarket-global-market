import LandFoodFrame from '../components/LandFoodFrame';
import LandFoodMarketplace from '@/app/components/marketplace/LandFoodMarketplace';

export default function LandFoodMarketplacePage() {
  return (
    <LandFoodFrame
      title="Land & Food Marketplace"
      subtitle="Regenerative economy discovery and booking surface for products, projects, and stewardship services."
    >
      <LandFoodMarketplace />
    </LandFoodFrame>
  );
}

