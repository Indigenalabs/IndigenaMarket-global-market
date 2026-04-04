import CreatorHubDashboardClient from '@/app/profile/components/CreatorHubDashboardClient';
import ProfileWorkspaceShell from '@/app/profile/components/ProfileWorkspaceShell';
import { loadProfileForInitialRender } from '@/app/profile/lib/profileServer';
import { ensureCurrentAccountIdentityFromSession } from '@/app/lib/accountAuthService';

export default async function CreatorHubPage() {
  const account = await ensureCurrentAccountIdentityFromSession().catch(() => null);
  const profile = await loadProfileForInitialRender(account?.creatorProfileSlug || 'aiyana-redbird');

  return (
    <ProfileWorkspaceShell>
      <CreatorHubDashboardClient profile={profile} slug={profile.slug} />
    </ProfileWorkspaceShell>
  );
}
