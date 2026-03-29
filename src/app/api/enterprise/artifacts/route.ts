import { NextRequest, NextResponse } from 'next/server';
import { listEnterpriseArtifacts, upsertEnterpriseArtifact } from '@/app/lib/enterpriseArtifacts';

function text(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function numberValue(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export async function GET(req: NextRequest) {
  const inquiryId = text(req.nextUrl.searchParams.get('inquiryId'));
  const artifacts = await listEnterpriseArtifacts(inquiryId || undefined);
  return NextResponse.json({ data: { artifacts } }, { status: 200 });
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ message: 'Invalid artifact payload.' }, { status: 400 });

  const inquiryId = text(body.inquiryId);
  const kind = text(body.kind) as 'proposal' | 'invoice';
  const title = text(body.title);
  if (!inquiryId || !kind || !title) {
    return NextResponse.json({ message: 'inquiryId, kind, and title are required.' }, { status: 400 });
  }

  const artifact = await upsertEnterpriseArtifact({
    id: text(body.id) || undefined,
    inquiryId,
    kind,
    title,
    amount: numberValue(body.amount),
    currency: text(body.currency) || 'USD',
    status: (text(body.status) as 'draft' | 'sent' | 'approved' | 'paid' | 'void') || 'draft',
    issuedAt: text(body.issuedAt) || null,
    dueDate: text(body.dueDate) || null,
    attachmentUrl: text(body.attachmentUrl),
    attachmentName: text(body.attachmentName),
    storagePath: text(body.storagePath)
  });

  return NextResponse.json({ data: { artifact } }, { status: 200 });
}
