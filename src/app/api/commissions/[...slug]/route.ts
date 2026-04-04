import { NextRequest, NextResponse } from 'next/server';
import { createCustomWorkRequest, listCustomWorkRequests } from '@/app/lib/customWork';
import { resolveRequestActorId } from '@/app/lib/requestIdentity';

function text(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function numberValue(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export async function GET(_: NextRequest, context: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await context.params;
  if (slug[0] !== 'requests') return NextResponse.json({ message: 'Not found.' }, { status: 404 });
  const requests = await listCustomWorkRequests();
  return NextResponse.json({ data: { requests } }, { status: 200 });
}

export async function POST(req: NextRequest, context: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await context.params;
  if (slug[0] !== 'requests') return NextResponse.json({ message: 'Not found.' }, { status: 404 });
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ message: 'Invalid request payload.' }, { status: 400 });
  const actorId = resolveRequestActorId(req);
  if (actorId === 'guest') {
    return NextResponse.json({ message: 'Sign in is required to submit commission requests.' }, { status: 401 });
  }

  const request = await createCustomWorkRequest({
    channel: (text(body.channel) as 'digital-arts' | 'physical-items' | 'freelancing') || 'digital-arts',
    buyerName: text(body.buyerName),
    buyerEmail: text(body.buyerEmail),
    requestedFor: text(body.requestedFor),
    title: text(body.title),
    description: text(body.description),
    budget: numberValue(body.budget),
    currency: text(body.currency) || 'USD',
    deadline: text(body.deadline) || null,
    referenceUrl: text(body.referenceUrl),
    specialInstructions: text(body.specialInstructions),
    matchedCreators: Array.isArray(body.matchedCreators) ? body.matchedCreators.map((entry) => String(entry)) : []
  });
  return NextResponse.json({ data: { request } }, { status: 201 });
}



