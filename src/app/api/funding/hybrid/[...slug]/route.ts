import { NextRequest, NextResponse } from 'next/server';
import {
  getHybridFundingReceiptById,
  listHybridFundingReceipts,
  summarizeHybridFunding
} from '@/app/lib/phase8HybridFunding';

function bad(message: string, status = 400) {
  return NextResponse.json({ message }, { status });
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug = [] } = await params;
  const [a, b] = slug;
  const url = new URL(req.url);

  if (a === 'overview') {
    const source = url.searchParams.get('source') || undefined;
    const summary = await summarizeHybridFunding({
      source: source === 'launchpad' || source === 'seva' ? source : undefined
    });
    return NextResponse.json({ data: summary });
  }

  if (a === 'account') {
    const accountSlug = (url.searchParams.get('accountSlug') || '').trim();
    if (!accountSlug) return bad('accountSlug is required');
    const [summary, receipts] = await Promise.all([
      summarizeHybridFunding({ linkedAccountSlug: accountSlug }),
      listHybridFundingReceipts({ linkedAccountSlug: accountSlug })
    ]);
    return NextResponse.json({ data: { summary, receipts } });
  }

  if (a === 'launchpad' && b) {
    const [summary, receipts] = await Promise.all([
      summarizeHybridFunding({ source: 'launchpad', campaignSlug: b }),
      listHybridFundingReceipts({ source: 'launchpad', campaignSlug: b })
    ]);
    return NextResponse.json({ data: { summary, receipts } });
  }

  if (a === 'seva-project' && b) {
    const [summary, receipts] = await Promise.all([
      summarizeHybridFunding({ source: 'seva', sevaProjectId: b }),
      listHybridFundingReceipts({ source: 'seva', sevaProjectId: b })
    ]);
    return NextResponse.json({ data: { summary, receipts } });
  }

  if (a === 'receipt' && b) {
    const receipt = await getHybridFundingReceiptById(b);
    if (!receipt) return bad('Receipt not found', 404);
    return NextResponse.json({ data: receipt });
  }

  return bad('Unsupported hybrid funding endpoint', 404);
}
