import { NextRequest, NextResponse } from 'next/server';
import { createPhysicalVentureOrder, listPhysicalVentures } from '@/app/lib/physicalVentures';

function text(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function numberValue(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug = [] } = await params;
  if (slug[0] !== 'dashboard') return NextResponse.json({ message: 'Unsupported physical ventures endpoint' }, { status: 404 });
  return NextResponse.json({ data: await listPhysicalVentures() });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug = [] } = await params;
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  if (slug[0] !== 'orders') return NextResponse.json({ message: 'Unsupported physical ventures endpoint' }, { status: 404 });
  const record = await createPhysicalVentureOrder({
    ventureType: text(body.ventureType) as never,
    title: text(body.title),
    buyerName: text(body.buyerName),
    buyerEmail: text(body.buyerEmail),
    quantity: numberValue(body.quantity) || 1
  });
  return NextResponse.json({ data: { record } }, { status: 201 });
}
