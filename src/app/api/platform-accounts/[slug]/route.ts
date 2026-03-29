import { NextResponse } from 'next/server';
import { getPlatformAccountBySlug } from '@/app/lib/platformAccounts';

export async function GET(_req: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const data = await getPlatformAccountBySlug(slug);
  if (!data) return NextResponse.json({ message: 'Platform account not found' }, { status: 404 });
  return NextResponse.json({ data });
}
