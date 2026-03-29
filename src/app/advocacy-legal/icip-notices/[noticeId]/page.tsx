import IcipNoticeDetailClient from './IcipNoticeDetailClient';

export default async function AdvocacyIcipNoticeDetailPage({
  params
}: {
  params: Promise<{ noticeId: string }>;
}) {
  const { noticeId } = await params;
  return <IcipNoticeDetailClient noticeId={noticeId} />;
}
