import { NextResponse } from 'next/server';
import { getCommunityTreasuryRollups } from '@/app/lib/communityMarketplace';

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const analytics = await getCommunityTreasuryRollups(slug);
  if (!analytics) {
    return NextResponse.json({ message: 'Community storefront analytics not found.' }, { status: 404 });
  }
  return NextResponse.json({ data: analytics });
}
