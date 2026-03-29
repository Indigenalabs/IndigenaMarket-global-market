import ProfileWorkspaceShell from '@/app/profile/components/ProfileWorkspaceShell';
import QuickCreateClient from '@/app/profile/components/QuickCreateClient';

export default async function CreatorQuickCreatePage({
  params,
  searchParams
}: {
  params: Promise<{ pillar: string }>;
  searchParams: Promise<{ simple?: string }>;
}) {
  const { pillar } = await params;
  const { simple } = await searchParams;
  const simpleMode = simple === '1';

  const content = <QuickCreateClient pillar={pillar} simpleMode={simpleMode} />;

  if (simpleMode) {
    return (
      <div className="min-h-screen bg-[#050505] px-4 py-8 text-white sm:px-6">
        <div className="mx-auto max-w-3xl">{content}</div>
      </div>
    );
  }

  return (
    <ProfileWorkspaceShell>
      {content}
    </ProfileWorkspaceShell>
  );
}
