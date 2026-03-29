import { redirect } from 'next/navigation';

export default async function DigitalChampionDetailLegacyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  redirect(`/launchpad/${slug}`);
}
