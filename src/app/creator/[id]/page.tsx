import { redirect } from 'next/navigation';

export default async function CreatorRedirectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/artist/${encodeURIComponent(id)}`);
}
