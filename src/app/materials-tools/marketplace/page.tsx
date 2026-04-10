import MaterialsToolsFrame from '@/app/materials-tools/components/MaterialsToolsFrame';
import MaterialsToolsMarketplace from '@/app/components/marketplace/MaterialsToolsMarketplace';
import CommunityMarketplaceExplorer from '@/app/components/community/CommunityMarketplaceExplorer';

export default function MaterialsToolsMarketplacePage() {
  return (
    <MaterialsToolsFrame title="Browse All Materials & Tools" subtitle="Search listings, tool libraries, suppliers, and co-op runs across the pillar.">
      <CommunityMarketplaceExplorer
        pillar="materials-tools"
        title="Community-owned materials and tool listings"
        subtitle="Community storefront supply-chain listings stay visible in the public materials and tools marketplace, with split-rule routing exposed as a first-class facet."
        emptyLabel="No community-owned materials or tools match the current marketplace facets."
      />
      <MaterialsToolsMarketplace />
    </MaterialsToolsFrame>
  );
}
