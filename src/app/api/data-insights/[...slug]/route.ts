import { NextRequest, NextResponse } from 'next/server';
import { createInsightApiSubscription, createInsightProduct, listInsightProducts } from '@/app/lib/dataInsights';
import { createDataUseConsent, recordGovernanceAuditEvent } from '@/app/lib/complianceGovernance';
import { resolveRequestActorId } from '@/app/lib/requestIdentity';

function text(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug = [] } = await params;
  if (slug[0] !== 'dashboard') return NextResponse.json({ message: 'Unsupported data insights endpoint' }, { status: 404 });
  return NextResponse.json({ data: await listInsightProducts() });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug = [] } = await params;
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const actorId = resolveRequestActorId(req);
  const buyerName = text(body.buyerName);
  const buyerEmail = text(body.buyerEmail);
  const usagePurpose = text(body.usagePurpose);
  const consentAccepted = Boolean(body.consentAccepted);
  if (slug[0] === 'products') {
    if (!buyerName || !buyerEmail || !usagePurpose || !consentAccepted) {
      return NextResponse.json({ message: 'buyerName, buyerEmail, usagePurpose, and consentAccepted are required.' }, { status: 400 });
    }
    const record = await createInsightProduct({
      productType: text(body.productType) as never,
      buyerName,
      buyerEmail,
      region: text(body.region),
      pillar: text(body.pillar),
      contractTerm: text(body.contractTerm)
    });
    const consent = await createDataUseConsent({
      actorId,
      buyerName,
      buyerEmail,
      usagePurpose,
      scopes: Array.isArray(body.scopes) ? body.scopes.map(String) : ['aggregated-market-data'],
      reference: record.id
    });
    await recordGovernanceAuditEvent({ actorId, domain: 'data-insights', action: 'insight-product-requested', targetId: record.id, metadata: { consentId: consent.id, productType: record.productType } });
    return NextResponse.json({ data: { record, consent } }, { status: 201 });
  }
  if (slug[0] === 'api-subscriptions') {
    if (!buyerName || !buyerEmail || !usagePurpose || !consentAccepted) {
      return NextResponse.json({ message: 'buyerName, buyerEmail, usagePurpose, and consentAccepted are required.' }, { status: 400 });
    }
    const record = await createInsightApiSubscription({
      buyerName,
      buyerEmail,
      apiKeyLabel: text(body.apiKeyLabel)
    });
    const consent = await createDataUseConsent({
      actorId,
      buyerName,
      buyerEmail,
      usagePurpose,
      scopes: Array.isArray(body.scopes) ? body.scopes.map(String) : ['api-access'],
      reference: record.id
    });
    await recordGovernanceAuditEvent({ actorId, domain: 'data-insights', action: 'insight-api-subscription-requested', targetId: record.id, metadata: { consentId: consent.id, apiKeyLabel: record.apiKeyLabel } });
    return NextResponse.json({ data: { record, consent } }, { status: 201 });
  }
  return NextResponse.json({ message: 'Unsupported data insights endpoint' }, { status: 404 });
}
