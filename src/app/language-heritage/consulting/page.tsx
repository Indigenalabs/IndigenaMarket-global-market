import LanguageHeritageFrame from '../components/LanguageHeritageFrame';
import HeritageCardGrid from '../components/HeritageCardGrid';
import HeritageHeroBanner from '../components/HeritageHeroBanner';

export default function Page() {
  return (
    <LanguageHeritageFrame title="Language & Heritage Consulting Services" subtitle="Hire language experts, repatriation specialists, and policy advisors.">
      <HeritageHeroBanner
        eyebrow="Professional Services"
        title="Advisory Network for Language and Heritage Projects"
        description="Connect with vetted consultants for documentation programs, protocol governance, repatriation strategy, and institutional compliance."
        image="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1400&h=700&fit=crop"
        chips={['Verified Consultants', 'ICIP-Centered', 'Institution Ready']}
        actions={[
          { href: '/language-heritage/marketplace', label: 'Browse Service Listings' },
          { href: '/language-heritage/grants', label: 'View Funding Channels', tone: 'secondary' }
        ]}
      />
      <HeritageCardGrid
        title="Consulting Categories"
        items={[
          { title: 'Language Documentation', meta: 'Field capture plans, metadata schema, oral corpus setup', badge: 'Core', actionLabel: 'Book Consultation' },
          { title: 'Repatriation Consulting', meta: 'Provenance tracing, museum negotiations, return planning', badge: 'Specialist', actionLabel: 'Find Experts' },
          { title: 'ICIP Advisory', meta: 'Rights protocols, consent frameworks, licensing controls', badge: 'Legal', actionLabel: 'Open Advisors' },
          { title: 'Grant Writing Support', meta: 'Funding strategy, grant drafts, reporting templates', badge: 'Funding', actionLabel: 'Start Brief' }
        ]}
      />
      <HeritageCardGrid
        title="High-Demand Engagements"
        columns={3}
        items={[
          { title: '6-Week Documentation Sprint', meta: 'Avg budget: $8,000 - $20,000', badge: 'Popular' },
          { title: 'Institution Protocol Audit', meta: 'Avg budget: $5,000 - $15,000', badge: 'Enterprise' },
          { title: 'Repatriation Prep Package', meta: 'Avg budget: $12,000 - $30,000', badge: 'Mission Critical' }
        ]}
      />
    </LanguageHeritageFrame>
  );
}

