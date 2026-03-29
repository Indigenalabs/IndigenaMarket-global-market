import { NextRequest, NextResponse } from 'next/server';
import { createSevaCorporateMatch, createSevaDonorTool, createSevaImpactReport, createSevaProjectAdmin, listSevaImpactServices } from '@/app/lib/sevaImpactServices';

function text(value: unknown) { return typeof value === 'string' ? value.trim() : ''; }
function numberValue(value: unknown) { const parsed = Number(value); return Number.isFinite(parsed) ? parsed : 0; }

export async function GET(_: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug = [] } = await params;
  if (slug[0] !== 'dashboard') return NextResponse.json({ message: 'Unsupported Seva impact endpoint' }, { status: 404 });
  const data = await listSevaImpactServices();
  return NextResponse.json({ data });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug = [] } = await params;
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  if (slug[0] === 'project-admin') {
    const record = await createSevaProjectAdmin({ requestId: text(body.requestId), projectId: text(body.projectId), fundsManaged: numberValue(body.fundsManaged), donorCount: numberValue(body.donorCount) });
    return NextResponse.json({ data: { record } }, { status: 201 });
  }
  if (slug[0] === 'corporate-matches') {
    const record = await createSevaCorporateMatch({ companyName: text(body.companyName), projectId: text(body.projectId), committedAmount: numberValue(body.committedAmount), matchedAmount: numberValue(body.matchedAmount) });
    return NextResponse.json({ data: { record } }, { status: 201 });
  }
  if (slug[0] === 'reports') {
    const record = await createSevaImpactReport({ clientName: text(body.clientName), projectId: text(body.projectId), contractAmount: numberValue(body.contractAmount) });
    return NextResponse.json({ data: { record } }, { status: 201 });
  }
  if (slug[0] === 'donor-tools') {
    const record = await createSevaDonorTool({ actorId: text(body.actorId), projectId: text(body.projectId), toolType: (text(body.toolType) as never) || 'impact-digest' });
    return NextResponse.json({ data: { record } }, { status: 201 });
  }
  return NextResponse.json({ message: 'Unsupported Seva impact endpoint' }, { status: 404 });
}
