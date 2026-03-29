import CreatorHubDashboardClient from '@/app/profile/components/CreatorHubDashboardClient';
import ProfileWorkspaceShell from '@/app/profile/components/ProfileWorkspaceShell';
import { loadProfileForInitialRender } from '@/app/profile/lib/profileServer';

export default async function CreatorHubPage() {
  const profile = await loadProfileForInitialRender('aiyana-redbird');

  return (
    <ProfileWorkspaceShell>
      <CreatorHubDashboardClient profile={profile} slug={profile.slug} />
    </ProfileWorkspaceShell>
  );
}
