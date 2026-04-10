import { notFound } from 'next/navigation';
import WorkspaceDetailClient from '@/app/workspaces/WorkspaceDetailClient';
import { getWorkspaceRoomBySlug } from '@/app/lib/workspaces';

export default async function WorkspaceDetailPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const room = await getWorkspaceRoomBySlug(slug);
  if (!room) notFound();

  return (
    <main className="min-h-screen bg-[#0b0b0b] px-4 py-8 text-white md:px-8">
      <div className="mx-auto max-w-7xl">
        <WorkspaceDetailClient room={room} />
      </div>
    </main>
  );
}
