import CategoryPageShell from '../CategoryPageShell';
import { getAdvocacyPublicData } from '@/app/lib/advocacyLegalPublicData';

export default async function Page() {
  const { attorneys } = await getAdvocacyPublicData();
  const filtered = attorneys.filter((a) => (a.specialty + ' ' + a.bio).includes('Rights'));

  return (
    <CategoryPageShell
      title="Human Rights & International Law"
      subtitle="UN/OAS advocacy, rights petitions, and cross-border legal pathways."
      eyebrow="International Forums"
      description="These attorneys are suited to matters that move beyond one domestic court system, including international rights petitions, transnational pressure strategies, and rights documentation for global bodies."
      bestFor={[
        'Cross-border rights matters and international advocacy',
        'UN, OAS, and human rights documentation strategy',
        'Cases needing escalation beyond local pathways'
      ]}
      guidance={[
        'Look for strong documentation and forum experience, not just litigation credentials.',
        'Use this page when your issue needs international pressure or visibility.',
        'Pair with resource pages if the community needs rights education alongside escalation.'
      ]}
      filtered={filtered}
    />
  );
}
