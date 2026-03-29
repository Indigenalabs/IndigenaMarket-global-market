import { NextRequest, NextResponse } from 'next/server';
import { listEnterpriseSignatures, upsertEnterpriseSignature } from '@/app/lib/enterpriseSignatures';

function text(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

export async function GET(_: NextRequest, context: { params: Promise<{ inquiryId: string }> }) {
  const { inquiryId } = await context.params;
  const signatures = await listEnterpriseSignatures(inquiryId);
  return NextResponse.json({ data: { signatures } }, { status: 200 });
}

export async function POST(req: NextRequest, context: { params: Promise<{ inquiryId: string }> }) {
  const { inquiryId } = await context.params;
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ message: 'Invalid signature payload.' }, { status: 400 });

  const signerName = text(body.signerName);
  const signerEmail = text(body.signerEmail);
  const signerRole = text(body.signerRole);
  if (!signerName || !signerEmail || !signerRole) {
    return NextResponse.json({ message: 'signerName, signerEmail, and signerRole are required.' }, { status: 400 });
  }

  const signature = await upsertEnterpriseSignature({
    id: text(body.id) || undefined,
    inquiryId,
    signerName,
    signerEmail,
    signerRole,
    status: (text(body.status) as 'pending' | 'sent' | 'signed' | 'declined') || 'pending',
    requestedAt: text(body.requestedAt) || undefined,
    signedAt: text(body.signedAt) || null,
    note: text(body.note)
  });
  return NextResponse.json({ data: { signature } }, { status: 200 });
}
