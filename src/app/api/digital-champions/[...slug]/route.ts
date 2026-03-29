import { NextResponse } from 'next/server';
import {
  createDigitalChampionApplication,
  createDigitalChampionRequest,
  createDigitalChampionSponsorship,
  getDigitalChampionBySlug,
  listDigitalChampionDashboard,
  listDigitalChampions
} from '@/app/lib/digitalChampionHub';
import { recordChampionSponsorshipDisbursement } from '@/app/lib/platformTreasury';

function text(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function list(value: unknown) {
  return Array.isArray(value) ? value.map((entry) => text(entry)).filter(Boolean) : [];
}

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug = [] } = await params;
  const [a, b] = slug;
  if (!a) return NextResponse.json({ data: await listDigitalChampions() });
  if (a === 'dashboard') return NextResponse.json({ data: await listDigitalChampionDashboard() });
  if (a === 'profile' && b) {
    const data = await getDigitalChampionBySlug(b);
    if (!data) return NextResponse.json({ message: 'Digital Champion not found' }, { status: 404 });
    return NextResponse.json({ data });
  }
  return NextResponse.json({ message: 'Unsupported Digital Champion endpoint' }, { status: 404 });
}

export async function POST(req: Request, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug = [] } = await params;
  const [a] = slug;
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  if (a === 'apply') {
    const record = await createDigitalChampionApplication({
      applicantName: text(body.applicantName),
      email: text(body.email),
      region: text(body.region),
      communityAffiliation: text(body.communityAffiliation),
      languages: list(body.languages),
      skills: list(body.skills),
      story: text(body.story)
    });
    return NextResponse.json({ data: record }, { status: 201 });
  }
  if (a === 'request-help') {
    const record = await createDigitalChampionRequest({
      requesterName: text(body.requesterName),
      requesterEmail: text(body.requesterEmail),
      communityName: text(body.communityName),
      region: text(body.region),
      supportNeeded: text(body.supportNeeded),
      preferredLanguage: text(body.preferredLanguage),
      urgency: (text(body.urgency) || 'medium') as any
    });
    return NextResponse.json({ data: record }, { status: 201 });
  }
  if (a === 'sponsor') {
    const record = await createDigitalChampionSponsorship({
      championId: text(body.championId),
      sponsorName: text(body.sponsorName),
      sponsorEmail: text(body.sponsorEmail),
      sponsorshipType: (text(body.sponsorshipType) || 'one-time') as any,
      targetType: (text(body.targetType) || 'champion') as any,
      targetAccountId: text(body.targetAccountId),
      amount: Number(body.amount || 0),
      note: text(body.note)
    });
    await recordChampionSponsorshipDisbursement({
      sponsorshipId: record.id,
      championId: record.championId,
      targetAccountId: record.targetAccountId,
      amount: record.amount,
      note: record.note || `Digital Champion sponsorship from ${record.sponsorName}`,
      scheduleDays: record.sponsorshipType === 'monthly' ? 30 : 14
    });
    return NextResponse.json({ data: record }, { status: 201 });
  }
  return NextResponse.json({ message: 'Unsupported Digital Champion endpoint' }, { status: 400 });
}
