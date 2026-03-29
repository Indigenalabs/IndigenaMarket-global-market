import { NextRequest, NextResponse } from 'next/server';
import { createEthicalAd, listEthicalAds } from '@/app/lib/ethicalAdvertising';

function text(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug = [] } = await params;
  if (slug[0] !== 'dashboard') return NextResponse.json({ message: 'Unsupported ethical advertising endpoint' }, { status: 404 });
  return NextResponse.json({ data: await listEthicalAds() });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug = [] } = await params;
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  if (slug[0] !== 'orders') return NextResponse.json({ message: 'Unsupported ethical advertising endpoint' }, { status: 404 });
  const record = await createEthicalAd({
    adType: text(body.adType) as never,
    partnerName: text(body.partnerName),
    partnerEmail: text(body.partnerEmail),
    placementScope: text(body.placementScope),
    creativeTitle: text(body.creativeTitle),
    issueLabel: text(body.issueLabel)
  });
  return NextResponse.json({ data: { record } }, { status: 201 });
}
