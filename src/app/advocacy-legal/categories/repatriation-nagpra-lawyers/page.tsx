import CategoryPageShell from '../CategoryPageShell';
import { getAdvocacyPublicData } from '@/app/lib/advocacyLegalPublicData';

export default async function Page() {
  const { attorneys } = await getAdvocacyPublicData();
  const filtered = attorneys.filter((a) => (a.specialty + ' ' + a.bio).includes('Repatriation'));

  return (
    <CategoryPageShell
      title="Repatriation & NAGPRA Lawyers"
      subtitle="Legal support for returns, protocol governance, and museum negotiation."
      eyebrow="Return & Custody Counsel"
      description="Use this directory when cultural belongings, archives, remains, or protected materials need return pathways, legal negotiation, or governance structure around proper care and access."
      bestFor={[
        'NAGPRA and museum return matters',
        'Protocol governance around repatriated materials',
        'Negotiation with institutions holding Indigenous collections'
      ]}
      guidance={[
        'Choose profiles with direct experience in returns, institutions, and protocol issues.',
        'Pair with the repatriation resource hub when your team also needs templates and guidance.',
        'Use this category early, before negotiations harden into avoidable conflict.'
      ]}
      filtered={filtered}
    />
  );
}
