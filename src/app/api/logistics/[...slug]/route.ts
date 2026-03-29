import { NextRequest, NextResponse } from 'next/server';
import { createFulfillmentOrder, createInsuranceClaim, createInventorySubscription, createShippingQuote, issueNfcTag, listLogisticsData } from '@/app/lib/logisticsOps';

function text(value: unknown) { return typeof value === 'string' ? value.trim() : ''; }
function numberValue(value: unknown) { const parsed = Number(value); return Number.isFinite(parsed) ? parsed : 0; }

export async function GET(_: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug = [] } = await params;
  if (slug[0] !== 'dashboard') return NextResponse.json({ message: 'Unsupported logistics endpoint' }, { status: 404 });
  const data = await listLogisticsData();
  return NextResponse.json({ data });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug = [] } = await params;
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;

  if (slug[0] === 'quotes') {
    const quote = await createShippingQuote({ origin: text(body.origin), destination: text(body.destination), weightKg: numberValue(body.weightKg), insured: Boolean(body.insured), currency: text(body.currency) || 'USD' });
    return NextResponse.json({ data: { quote } }, { status: 201 });
  }
  if (slug[0] === 'claims') {
    const claim = await createInsuranceClaim({ orderId: text(body.orderId), actorId: text(body.actorId), claimantName: text(body.claimantName), amount: numberValue(body.amount), reason: text(body.reason), evidenceUrl: text(body.evidenceUrl) });
    return NextResponse.json({ data: { claim } }, { status: 201 });
  }
  if (slug[0] === 'nfc') {
    const tag = await issueNfcTag({ actorId: text(body.actorId), listingId: text(body.listingId), encodedUrl: text(body.encodedUrl) });
    return NextResponse.json({ data: { tag } }, { status: 201 });
  }
  if (slug[0] === 'fulfillment') {
    const fulfillment = await createFulfillmentOrder({ actorId: text(body.actorId), orderId: text(body.orderId), warehouse: text(body.warehouse), storageFee: numberValue(body.storageFee), handlingFee: numberValue(body.handlingFee) });
    return NextResponse.json({ data: { fulfillment } }, { status: 201 });
  }
  if (slug[0] === 'inventory') {
    const subscription = await createInventorySubscription({ actorId: text(body.actorId), catalogSize: numberValue(body.catalogSize) });
    return NextResponse.json({ data: { subscription } }, { status: 201 });
  }

  return NextResponse.json({ message: 'Unsupported logistics endpoint' }, { status: 404 });
}
