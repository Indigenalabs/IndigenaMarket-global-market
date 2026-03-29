import { redirect } from 'next/navigation';

export default async function CollectionRedirect({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/digital-arts/collection/${encodeURIComponent(id)}`);
}
