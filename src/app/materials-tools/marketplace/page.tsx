import MaterialsToolsFrame from '@/app/materials-tools/components/MaterialsToolsFrame';
import MaterialsToolsMarketplace from '@/app/components/marketplace/MaterialsToolsMarketplace';

export default function MaterialsToolsMarketplacePage() {
  return (
    <MaterialsToolsFrame title="Browse All Materials & Tools" subtitle="Search listings, tool libraries, suppliers, and co-op runs across the pillar.">
      <MaterialsToolsMarketplace />
    </MaterialsToolsFrame>
  );
}

