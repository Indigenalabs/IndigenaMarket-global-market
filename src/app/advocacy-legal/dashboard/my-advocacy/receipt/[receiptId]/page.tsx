import ReceiptDetailClient from './ReceiptDetailClient';

export default async function AdvocacyReceiptDetailPage({
  params
}: {
  params: Promise<{ receiptId: string }>;
}) {
  const { receiptId } = await params;
  return <ReceiptDetailClient receiptId={receiptId} />;
}
