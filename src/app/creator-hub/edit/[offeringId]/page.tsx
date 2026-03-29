import CreatorHubOfferingEditorClient from '@/app/profile/components/CreatorHubOfferingEditorClient';
import ProfileWorkspaceShell from '@/app/profile/components/ProfileWorkspaceShell';
import { loadProfileForInitialRender } from '@/app/profile/lib/profileServer';

export default async function CreatorHubOfferingEditPage({
  params
}: {
  params: Promise<{ offeringId: string }>;
}) {
  const { offeringId } = await params;
  const profile = await loadProfileForInitialRender('aiyana-redbird');
  const offering = profile.offerings.find((entry) => entry.id === offeringId) ?? null;

  return (
    <ProfileWorkspaceShell>
      {offering ? (
        <CreatorHubOfferingEditorClient profile={profile} offering={offering} />
      ) : (
        <section className="rounded-[28px] border border-white/10 bg-[#101010] p-8">
          <p className="text-xs uppercase tracking-[0.24em] text-[#d4af37]">Creator Hub</p>
          <h1 className="mt-3 text-3xl font-semibold text-white">Listing not found</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-300">
            That offering is not available in the current creator profile load. Return to Creator Hub and pick another listing.
          </p>
          <a
            href="/creator-hub"
            className="mt-6 inline-flex rounded-full bg-[#d4af37] px-5 py-2 text-sm font-semibold text-black hover:bg-[#f4d370]"
          >
            Back to Creator Hub
          </a>
        </section>
      )}
    </ProfileWorkspaceShell>
  );
}
