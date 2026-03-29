import { NextRequest, NextResponse } from 'next/server';
import { listEnterpriseMilestones, upsertEnterpriseMilestone } from '@/app/lib/enterpriseMilestones';

function text(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ inquiryId: string }> }) {
  const { inquiryId } = await params;
  const milestones = await listEnterpriseMilestones(inquiryId);
  return NextResponse.json({ data: { milestones } });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ inquiryId: string }> }) {
  const { inquiryId } = await params;
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ message: 'Invalid milestone payload.' }, { status: 400 });
  const title = text(body.title);
  if (!title) return NextResponse.json({ message: 'title is required.' }, { status: 400 });

  const milestone = await upsertEnterpriseMilestone({
    id: text(body.id) || undefined,
    inquiryId,
    title,
    owner: text(body.owner),
    dueDate: text(body.dueDate) || null,
    status: (text(body.status) || 'pending') as 'pending' | 'in_progress' | 'done' | 'blocked',
    note: text(body.note)
  });
  return NextResponse.json({ data: { milestone } }, { status: 201 });
}
