import CategoryPageShell from '../CategoryPageShell';
import { getAdvocacyPublicData } from '@/app/lib/advocacyLegalPublicData';

export default async function Page() {
  const { attorneys } = await getAdvocacyPublicData();
  const filtered = attorneys.filter((a) => a.proBono);

  return (
    <CategoryPageShell
      title="Pro Bono & Reduced-Fee Directory"
      subtitle="Sliding-scale and pro bono legal support networks."
      eyebrow="Lower-Access Legal Support"
      description="This page is designed for communities, artists, and organizers who need help fast but may not be able to move straight into full-fee legal representation."
      bestFor={[
        'Urgent matters with limited legal budget',
        'Early triage before full paid representation',
        'Organizations needing a first legal foothold quickly'
      ]}
      guidance={[
        'Use the matching application if you are unsure which profile is the best fit.',
        'Review access model and best-fit notes on each attorney card.',
        'Combine this with the emergency fund if cost is blocking a time-sensitive legal step.'
      ]}
      filtered={filtered}
    />
  );
}
