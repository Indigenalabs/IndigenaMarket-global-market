import CategoryPageShell from '../CategoryPageShell';
import { getAdvocacyPublicData } from '@/app/lib/advocacyLegalPublicData';

export default async function Page() {
  const { attorneys } = await getAdvocacyPublicData();
  const filtered = attorneys.filter((a) => (a.specialty + ' ' + a.bio).includes('ICIP'));

  return (
    <CategoryPageShell
      title="Intellectual Property (ICIP) Specialists"
      subtitle="Cultural IP protection, licensing, and enforcement."
      eyebrow="Cultural Rights Counsel"
      description="Use this directory for misuse, licensing, protocol protection, and Indigenous Cultural and Intellectual Property matters where public visibility, ownership, and permissions need to be handled carefully."
      bestFor={[
        'Unauthorized use of cultural designs, stories, or recordings',
        'Licensing terms for Indigenous-owned works and assets',
        'Protocol-sensitive protection strategy and enforcement'
      ]}
      guidance={[
        'Choose specialists who understand both legal structure and cultural protocol.',
        'Use the ICIP Registry when you need to document a claim alongside legal support.',
        'If misuse is active, pair attorney outreach with a campaign or alert strategy where appropriate.'
      ]}
      filtered={filtered}
    />
  );
}
