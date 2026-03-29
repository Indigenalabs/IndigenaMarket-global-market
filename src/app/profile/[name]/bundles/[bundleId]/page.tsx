import ProfileWorkspaceShell from '@/app/profile/components/ProfileWorkspaceShell';
import BundleDetailClient from '@/app/profile/components/BundleDetailClient';
import { getCreatorProfileBySlug, getProfileBundleBySlug } from '@/app/profile/data/profileShowcase';

export default async function ProfileBundlePage({
  params
}: {
  params: Promise<{ name: string; bundleId: string }>;
}) {
  const { name, bundleId } = await params;
  const profile = getCreatorProfileBySlug(name);
  const { bundle } = getProfileBundleBySlug(name, bundleId);

  return (
    <ProfileWorkspaceShell>
      <BundleDetailClient slug={name} bundleId={bundleId} initialProfile={profile} initialBundle={bundle} />
    </ProfileWorkspaceShell>
  );
}
