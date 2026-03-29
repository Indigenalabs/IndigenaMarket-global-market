import { NextRequest, NextResponse } from 'next/server';
import { requirePlatformAdmin } from '@/app/lib/platformAdminAuth';
import { getEnterprisePipelineSettings, updateEnterprisePipelineSettings } from '@/app/lib/enterpriseSettings';

function numberValue(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export async function GET(req: NextRequest) {
  const settings = await getEnterprisePipelineSettings();
  return NextResponse.json({ data: { settings } }, { status: 200 });
}

export async function PATCH(req: NextRequest) {
  const admin = await requirePlatformAdmin(req);
  if (admin.error) return admin.error;
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ message: 'Invalid settings payload.' }, { status: 400 });

  const settings = await updateEnterprisePipelineSettings({
    lead: numberValue(body.lead),
    discovery: numberValue(body.discovery),
    proposal: numberValue(body.proposal),
    negotiation: numberValue(body.negotiation),
    won: numberValue(body.won),
    lost: numberValue(body.lost)
  });

  return NextResponse.json({ data: { settings } }, { status: 200 });
}
