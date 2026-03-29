import { NextRequest, NextResponse } from 'next/server';
import { createEnterpriseArtifactPayment, listEnterpriseArtifactPayments } from '@/app/lib/enterpriseArtifactPayments';

function text(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function numberValue(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export async function GET(_: NextRequest, context: { params: Promise<{ artifactId: string }> }) {
  const { artifactId } = await context.params;
  const payments = await listEnterpriseArtifactPayments(artifactId);
  return NextResponse.json({ data: { payments } }, { status: 200 });
}

export async function POST(req: NextRequest, context: { params: Promise<{ artifactId: string }> }) {
  const { artifactId } = await context.params;
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ message: 'Invalid payment payload.' }, { status: 400 });

  const payment = await createEnterpriseArtifactPayment({
    artifactId,
    amount: numberValue(body.amount),
    currency: text(body.currency) || 'USD',
    reference: text(body.reference),
    paidAt: text(body.paidAt) || new Date().toISOString(),
    note: text(body.note)
  });
  return NextResponse.json({ data: { payment } }, { status: 200 });
}
