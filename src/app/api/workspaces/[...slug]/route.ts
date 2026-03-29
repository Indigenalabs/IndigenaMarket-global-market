import { NextResponse } from 'next/server';
import { getWorkspaceRoomBySlug, listWorkspaceRooms } from '@/app/lib/workspaces';

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug = [] } = await params;
  const [a] = slug;
  if (!a) return NextResponse.json({ data: await listWorkspaceRooms() });
  const data = await getWorkspaceRoomBySlug(a);
  if (!data) return NextResponse.json({ message: 'Workspace not found' }, { status: 404 });
  return NextResponse.json({ data });
}
