import PublicProfileClient from '@/app/profile/components/PublicProfileClient';
import ProfileWorkspaceShell from '@/app/profile/components/ProfileWorkspaceShell';
import { loadProfileForInitialRender } from '@/app/profile/lib/profileServer';

export default async function ProfilePage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const profile = await loadProfileForInitialRender(name);

  return (
    <ProfileWorkspaceShell>
      <PublicProfileClient profile={profile} slug={name} />
    </ProfileWorkspaceShell>
  );
}
