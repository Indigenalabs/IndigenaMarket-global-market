import { NextRequest, NextResponse } from 'next/server';
import { requirePlatformAdmin } from '@/app/lib/platformAdminAuth';
import { listCustomWorkRequests, updateCustomWorkRequest } from '@/app/lib/customWork';

export async function GET(req: NextRequest) {
  const auth = await requirePlatformAdmin(req);
  if (auth.error) return auth.error;
  const requests = await listCustomWorkRequests();
  return NextResponse.json({ requests });
}

export async function PATCH(req: NextRequest) {
  const auth = await requirePlatformAdmin(req);
  if (auth.error) return auth.error;
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const id = String(body.id || '').trim();
  if (!id) return NextResponse.json({ message: 'id is required' }, { status: 400 });

  const request = await updateCustomWorkRequest({
    id,
    status: body.status ? (String(body.status).trim() as never) : undefined,
    matchedCreators: Array.isArray(body.matchedCreators) ? body.matchedCreators.map((entry) => String(entry)) : undefined,
    assignedCreator: typeof body.assignedCreator === 'string' ? body.assignedCreator.trim() : undefined,
    cancellationReason: typeof body.cancellationReason === 'string' ? body.cancellationReason.trim() : undefined,
    milestones: Array.isArray(body.milestones) ? (body.milestones as never) : undefined
  });

  return NextResponse.json({ request });
}
