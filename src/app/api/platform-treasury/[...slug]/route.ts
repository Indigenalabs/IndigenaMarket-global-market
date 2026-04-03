import { NextResponse } from 'next/server';
import { getTreasuryByCommunitySlug, listTreasuryDashboard, recordRevenueSplitDistribution } from '@/app/lib/platformTreasury';
import { executeRevenueSplitExecution, previewRevenueSplitExecution } from '@/app/lib/splitTreasuryEngine';

function text(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function amount(value: unknown) {
  const parsed = typeof value === 'number' ? value : Number(value || 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug = [] } = await params;
  const [a, b] = slug;
  if (!a) return NextResponse.json({ data: await listTreasuryDashboard() });
  if (a === 'split-preview' && b) {
    const url = new URL(_req.url);
    const data = await previewRevenueSplitExecution({
      splitRuleId: b,
      sourceType: (text(url.searchParams.get('sourceType')) || 'sale') as 'sale' | 'royalty',
      sourceId: text(url.searchParams.get('sourceId')) || `preview-${Date.now()}`,
      grossAmount: amount(url.searchParams.get('grossAmount')),
      currency: text(url.searchParams.get('currency')) || 'INDI',
      sourceReference: text(url.searchParams.get('sourceReference'))
    });
    return NextResponse.json({ data });
  }
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
  if (a === 'split-execution') {
    const data = await executeRevenueSplitExecution({
      splitRuleId: text(body.splitRuleId),
      sourceType: (text(body.sourceType) || 'sale') as 'sale' | 'royalty',
      sourceId: text(body.sourceId) || `execution-${Date.now()}`,
      grossAmount: amount(body.grossAmount),
      currency: text(body.currency) || 'INDI',
      sourceReference: text(body.sourceReference)
    });
    return NextResponse.json({ data }, { status: 201 });
  }
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
