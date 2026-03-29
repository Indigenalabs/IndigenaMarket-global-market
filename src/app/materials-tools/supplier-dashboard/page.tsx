import MaterialsToolsFrame from '@/app/materials-tools/components/MaterialsToolsFrame';
import SupplierDashboardClient from '@/app/materials-tools/components/SupplierDashboardClient';

export default function SupplierDashboardPage() {
  return (
    <MaterialsToolsFrame title="Supplier Inventory Dashboard" subtitle="Manage listing readiness, low-stock lots, inbound orders, and co-op demand entering your sourcing lane.">
      <SupplierDashboardClient />
    </MaterialsToolsFrame>
  );
}
