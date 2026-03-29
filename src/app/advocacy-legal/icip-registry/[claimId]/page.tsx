import IcipClaimDetailClient from './IcipClaimDetailClient';

export default async function AdvocacyIcipClaimDetailPage({
  params
}: {
  params: Promise<{ claimId: string }>;
}) {
  const { claimId } = await params;
  return <IcipClaimDetailClient claimId={claimId} />;
}
