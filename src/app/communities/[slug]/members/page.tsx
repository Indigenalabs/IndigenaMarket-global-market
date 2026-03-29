import { notFound } from 'next/navigation';
import { getPlatformAccountBySlug } from '@/app/lib/platformAccounts';
import { SurfaceHero, SurfaceListStrip, SurfacePage } from '@/app/components/phase-surfaces/SurfaceSystem';

export default async function CommunityMembersPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getPlatformAccountBySlug(slug);
  if (!data) notFound();
  return (
    <SurfacePage tone="community">
      <SurfaceHero
        tone="community"
        eyebrow="Representatives"
        title={`${data.account.displayName} representatives`}
        description="These are the people allowed to publish, route funds, manage members, and hold institutional responsibility on behalf of the entity."
        image={data.account.banner}
        stats={[
          { label: 'Representatives', value: String(data.members.length) },
          { label: 'Verification', value: data.account.verificationStatus },
          { label: 'Account type', value: data.account.accountType.replace('-', ' ') },
          { label: 'Nation', value: data.account.nation }
        ]}
      />
      <section className="space-y-5">
        {data.members.map((member) => (
          <SurfaceListStrip
            key={member.id}
            eyebrow={member.role}
            title={member.displayName}
            description={`Permissions: ${member.permissions.join(' | ')}`}
            meta={`${member.permissions.length} permissions`}
          />
        ))}
      </section>
    </SurfacePage>
  );
}
