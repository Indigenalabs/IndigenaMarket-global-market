import ProfileReviewsClient from '@/app/profile/components/ProfileReviewsClient';
import ProfileWorkspaceShell from '@/app/profile/components/ProfileWorkspaceShell';
import { loadProfileForInitialRender } from '@/app/profile/lib/profileServer';

export default async function ProfileReviewsPage({
  params
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;
  const profile = await loadProfileForInitialRender(name);

  return (
    <ProfileWorkspaceShell>
      <ProfileReviewsClient profile={profile} />
    </ProfileWorkspaceShell>
  );
}
