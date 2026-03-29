import MaterialsToolsFrame from '@/app/materials-tools/components/MaterialsToolsFrame';
import OrderReceiptClient from './OrderReceiptClient';

export default async function MaterialsToolsOrderReceiptPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;

  return (
    <MaterialsToolsFrame
      title="Order Receipt"
      subtitle="Payment confirmation, fulfillment progress, and traceability context for this materials lane."
    >
      <OrderReceiptClient orderId={orderId} />
    </MaterialsToolsFrame>
  );
}
