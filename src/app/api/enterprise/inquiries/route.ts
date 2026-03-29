import { NextRequest, NextResponse } from 'next/server';
import { createEnterpriseInquiry, listEnterpriseInquiries, listEnterpriseInquiryEvents, updateEnterpriseInquiry } from '@/app/lib/enterpriseInquiries';
import type { EnterpriseOwnerRole } from '@/app/lib/enterpriseTeam';

function text(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function numberValue(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export async function GET(req: NextRequest) {
  const contractStage = text(req.nextUrl.searchParams.get('contractStage'));
  const status = text(req.nextUrl.searchParams.get('status'));
  const inquiries = await listEnterpriseInquiries({
    contractStage: (contractStage || undefined) as 'lead' | 'discovery' | 'proposal' | 'negotiation' | 'won' | 'lost' | undefined,
    status: (status || undefined) as 'new' | 'reviewing' | 'qualified' | 'closed' | undefined
  });
  const events = await listEnterpriseInquiryEvents(undefined, 250);
  return NextResponse.json({ data: { inquiries, events } }, { status: 200 });
}

export async function HEAD() {
  return new NextResponse(null, { status: 204 });
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ message: 'Invalid inquiry payload.' }, { status: 400 });

  const channel = text(body.channel) as 'licensing' | 'institutional-access' | 'consulting' | 'sponsorship';
  const name = text(body.name);
  const email = text(body.email);
  const organization = text(body.organization);
  const scope = text(body.scope);
  const budget = text(body.budget);
  const detail = text(body.detail);
  if (!channel || !name || !email || !detail) {
    return NextResponse.json({ message: 'channel, name, email, and detail are required.' }, { status: 400 });
  }

  const inquiry = await createEnterpriseInquiry({
    channel,
    name,
    email,
    organization,
    scope,
    budget,
    detail,
    estimatedValue: numberValue(body.estimatedValue),
    pipelineOwner: text(body.pipelineOwner),
    pipelineOwnerRole: text(body.pipelineOwnerRole) as EnterpriseOwnerRole | '',
    nextStep: text(body.nextStep),
    expectedCloseDate: text(body.expectedCloseDate) || null,
    contractStoragePath: text(body.contractStoragePath),
    contractAttachmentUrl: text(body.contractAttachmentUrl),
    contractAttachmentName: text(body.contractAttachmentName)
  });
  return NextResponse.json({ data: { inquiry } }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ message: 'Invalid inquiry payload.' }, { status: 400 });

  const id = text(body.id);
  if (!id) return NextResponse.json({ message: 'id is required.' }, { status: 400 });

  const inquiry = await updateEnterpriseInquiry(id, {
    status: text(body.status) as 'new' | 'reviewing' | 'qualified' | 'closed' | undefined,
    contractStage: text(body.contractStage) as 'lead' | 'discovery' | 'proposal' | 'negotiation' | 'won' | 'lost' | undefined,
    contractLifecycleState: text(body.contractLifecycleState) as 'draft' | 'sent' | 'signed' | 'active' | 'completed' | 'terminated' | undefined,
    estimatedValue: body.estimatedValue === undefined ? undefined : numberValue(body.estimatedValue),
    pipelineOwner: body.pipelineOwner === undefined ? undefined : text(body.pipelineOwner),
    pipelineOwnerRole: body.pipelineOwnerRole === undefined ? undefined : (text(body.pipelineOwnerRole) as EnterpriseOwnerRole | ''),
    nextStep: body.nextStep === undefined ? undefined : text(body.nextStep),
    expectedCloseDate: body.expectedCloseDate === undefined ? undefined : text(body.expectedCloseDate) || null,
    contractStoragePath: body.contractStoragePath === undefined ? undefined : text(body.contractStoragePath),
    contractAttachmentUrl: body.contractAttachmentUrl === undefined ? undefined : text(body.contractAttachmentUrl),
    contractAttachmentName: body.contractAttachmentName === undefined ? undefined : text(body.contractAttachmentName)
  }, text(body.actorId) || 'platform-admin');
  if (!inquiry) return NextResponse.json({ message: 'Inquiry not found.' }, { status: 404 });
  return NextResponse.json({ data: { inquiry } }, { status: 200 });
}
