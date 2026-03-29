import LanguageHeritageFrame from '../components/LanguageHeritageFrame';
import HeritageCardGrid from '../components/HeritageCardGrid';
import HeritageHeroBanner from '../components/HeritageHeroBanner';

export default function Page() {
  return (
    <LanguageHeritageFrame title="Repatriation Support Hub" subtitle="Guides, expert support, and resources for cultural restitution.">
      <HeritageHeroBanner
        eyebrow="Cultural Return"
        title="Repatriation Workbench"
        description="Coordinate provenance research, legal documentation, consultant support, and return ceremonies through one structured workflow."
        image="https://images.unsplash.com/photo-1448375240586-882707db888b?w=1400&h=700&fit=crop"
        chips={['Museum Records', 'Legal Templates', 'Community Protocol']}
        actions={[
          { href: '/language-heritage/consulting', label: 'Find Repatriation Advisors' },
          { href: '/language-heritage/sacred-request', label: 'Submit Cultural Access Request', tone: 'secondary' }
        ]}
      />
      <HeritageCardGrid
        title="Repatriation Toolkit"
        items={[
          { title: 'How-to Repatriate Guide', meta: 'Step-by-step process from claim to return', badge: 'Guide', actionLabel: 'Open Guide' },
          { title: 'Letter Templates', meta: 'Prebuilt museum and institution request templates', badge: 'Template', actionLabel: 'Use Template' },
          { title: 'Consultant Directory', meta: 'Specialists in provenance and negotiation', badge: 'Experts', actionLabel: 'Browse Experts' },
          { title: 'Submit Repatriation Request', meta: 'Track case progress and decision logs', badge: 'Workflow', actionLabel: 'Start Request' }
        ]}
      />
      <HeritageCardGrid
        title="Active Case Pipeline"
        columns={3}
        items={[
          { title: 'Evidence Gathering', meta: '11 cases in documentation stage', badge: 'Stage 1' },
          { title: 'Institution Dialogue', meta: '7 cases in active negotiation', badge: 'Stage 2' },
          { title: 'Return Preparation', meta: '4 cases approved for return', badge: 'Stage 3' }
        ]}
      />
    </LanguageHeritageFrame>
  );
}

