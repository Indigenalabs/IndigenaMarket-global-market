import { NextResponse } from 'next/server';
import { getTreasuryByCommunitySlug, listTreasuryDashboard, recordRevenueSplitDistribution } from '@/app/lib/platformTreasury';

function text(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug = [] } = await params;
  const [a, b] = slug;
  if (!a) return NextResponse.json({ data: await listTreasuryDashboard() });
  if (a === 'community' && b) {
    const data = await getTreasuryByCommunitySlug(b);
    if (!data) return NextResponse.json({ message: 'Treasury not found' }, { status: 404 });
    return NextResponse.json({ data });
  }
  return NextResponse.json({ message: 'Unsupported treasury endpoint' }, { status: 404 });
}

export async function POST(req: Request, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug = [] } = await params;
  const [a] = slug;
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  if (a === 'split-distribution') {
    const data = await recordRevenueSplitDistribution({
      splitRuleId: text(body.splitRuleId),
      sourceType: (text(body.sourceType) || 'sale') as any,
      sourceId: text(body.sourceId),
      grossAmount: Number(body.grossAmount || 0),
      currency: text(body.currency) || 'USD'
    });
    return NextResponse.json({ data }, { status: 201 });
  }
  return NextResponse.json({ message: 'Unsupported treasury endpoint' }, { status: 400 });
}
