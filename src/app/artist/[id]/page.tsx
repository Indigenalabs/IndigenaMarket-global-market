import { redirect } from 'next/navigation';

export default async function ArtistRedirect({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/digital-arts/artist/${encodeURIComponent(id)}`);
}
