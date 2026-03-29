import CategoryPageShell from '../CategoryPageShell';
import { getAdvocacyPublicData } from '@/app/lib/advocacyLegalPublicData';

export default async function Page() {
  const { attorneys } = await getAdvocacyPublicData();
  const filtered = attorneys.filter((a) => (a.specialty + ' ' + a.bio).includes('Treaty Rights'));

  return (
    <CategoryPageShell
      title="Indigenous Rights Attorneys"
      subtitle="Treaty rights, sovereignty, and jurisdiction specialists."
      eyebrow="Sovereignty Counsel"
      description="These are the attorneys most aligned to treaty interpretation, sovereignty protections, jurisdiction disputes, and rights assertions where Indigenous governance and state systems collide."
      bestFor={[
        'Treaty rights disputes and enforcement questions',
        'Jurisdictional conflicts with state or federal actors',
        'Strategic sovereignty-related legal planning'
      ]}
      guidance={[
        'Look for counsel with direct treaty or jurisdiction case experience.',
        'Use the profile pages to check verification level and fee model.',
        'If budget is tight, compare this page with the pro bono directory as well.'
      ]}
      filtered={filtered}
    />
  );
}
