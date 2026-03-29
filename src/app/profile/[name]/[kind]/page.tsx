import ProfileConnectionsClient from '@/app/profile/components/ProfileConnectionsClient';
import ProfileWorkspaceShell from '@/app/profile/components/ProfileWorkspaceShell';
import { getProfileConnectionsBySlug } from '@/app/profile/data/profileShowcase';

export default async function ProfileConnectionsPage({
  params
}: {
  params: Promise<{ name: string; kind: string }>;
}) {
  const { name, kind } = await params;
  const connectionKind = kind === 'following' ? 'following' : 'followers';
  const initialConnections = getProfileConnectionsBySlug(name, connectionKind);

  return (
    <ProfileWorkspaceShell>
      <ProfileConnectionsClient slug={name} kind={connectionKind} initialConnections={initialConnections} />
    </ProfileWorkspaceShell>
  );
}
