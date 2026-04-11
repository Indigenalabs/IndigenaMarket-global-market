import WorkspaceHubClient from '@/app/workspaces/WorkspaceHubClient';
import { listWorkspaceRooms } from '@/app/lib/workspaces';

export const metadata = {
  title: 'Team Workspaces | Indigena Global Market'
};

export default async function WorkspacesPage() {
  const rooms = await listWorkspaceRooms();

  return (
    <main className="min-h-screen bg-[#0b0b0b] px-4 py-8 text-white md:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-[32px] border border-[#d4af37]/20 bg-[linear-gradient(180deg,rgba(20,20,20,0.96),rgba(10,10,10,0.94))] p-6">
          <p className="text-xs uppercase tracking-[0.24em] text-[#d4af37]">Phase 9</p>
          <h1 className="mt-3 text-3xl font-semibold text-white md:text-4xl">Shared team workspaces</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-300">
            Premium collaboration rooms for community storefront launches, archive review, and multi-seat seller operations.
          </p>
        </section>
        <WorkspaceHubClient rooms={rooms} />
      </div>
    </main>
  );
}
