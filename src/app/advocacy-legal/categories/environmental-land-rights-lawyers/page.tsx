import CategoryPageShell from '../CategoryPageShell';
import { getAdvocacyPublicData } from '@/app/lib/advocacyLegalPublicData';

export default async function Page() {
  const { attorneys } = await getAdvocacyPublicData();
  const filtered = attorneys.filter((a) => (a.specialty + ' ' + a.bio).includes('Environmental'));

  return (
    <CategoryPageShell
      title="Environmental & Land Rights Lawyers"
      subtitle="Defend sacred sites, waters, and biodiversity from extraction."
      eyebrow="Land Defense Counsel"
      description="This category is for fast-moving land, water, extraction, and sacred site matters where environmental law and Indigenous rights strategy need to work together under pressure."
      bestFor={[
        'Sacred site protection and land access disputes',
        'Mining, extraction, and environmental response matters',
        'Waters, biodiversity, and habitat-related legal defense'
      ]}
      guidance={[
        'Prioritize lawyers with injunction, environmental review, or land defense experience.',
        'Use campaign pages when a legal defense also needs public funding and visibility.',
        'Rapid alerts are useful when hearings or comment periods are time-sensitive.'
      ]}
      filtered={filtered}
    />
  );
}
