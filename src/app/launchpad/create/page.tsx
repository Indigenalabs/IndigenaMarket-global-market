import LaunchpadCreateClient from '@/app/launchpad/LaunchpadCreateClient';
import ProfileWorkspaceShell from '@/app/profile/components/ProfileWorkspaceShell';

export const metadata = {
  title: 'Create Launchpad Campaign | Indigena Global Market'
};

export default async function LaunchpadCreatePage({
  searchParams
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolved = (await searchParams) || {};
  const context = {
    accountSlug: typeof resolved.accountSlug === 'string' ? resolved.accountSlug : '',
    mode: typeof resolved.mode === 'string' ? resolved.mode : ''
  };

  return (
    <ProfileWorkspaceShell>
      <LaunchpadCreateClient initialContext={context} />
    </ProfileWorkspaceShell>
  );
}
