import MaterialsToolsFrame from '@/app/materials-tools/components/MaterialsToolsFrame';
import OrdersClient from '@/app/materials-tools/components/OrdersClient';

export default function OrdersPage() {
  return (
    <MaterialsToolsFrame title="My Orders & Purchases" subtitle="Track procurement, tool-library bookings, batch traceability, and reorder-ready studio supplies.">
      <OrdersClient />
    </MaterialsToolsFrame>
  );
}
