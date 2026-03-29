import { notFound } from 'next/navigation';
import { getPlatformAccountBySlug } from '@/app/lib/platformAccounts';
import { getCommunityEntityPresentation } from '@/app/lib/communityEntityPresentation';
import NationStorefrontClient from '@/app/communities/[slug]/NationStorefrontClient';
import ProfileWorkspaceShell from '@/app/profile/components/ProfileWorkspaceShell';

export default async function CommunityStorePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getPlatformAccountBySlug(slug);
  if (!data) notFound();

  return (
    <ProfileWorkspaceShell>
        <NationStorefrontClient
          account={data.account}
          members={data.members}
          splitRules={data.splitRules}
          presentation={getCommunityEntityPresentation(data.account, data.members, data.splitRules)}
          initialTab="shop"
        />
    </ProfileWorkspaceShell>
  );
}
