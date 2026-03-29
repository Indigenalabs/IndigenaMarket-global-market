import HeritageAccessGate from '../components/HeritageAccessGate';
import LanguageHeritageFrame from '../components/LanguageHeritageFrame';
import HeritageCardGrid from '../components/HeritageCardGrid';
import HeritageHeroBanner from '../components/HeritageHeroBanner';

export default function Page() {
  return (
    <LanguageHeritageFrame title="Community Member Portal" subtitle="Community-restricted materials and member notices.">
      <HeritageHeroBanner
        eyebrow="Verified Access"
        title="Community-Only Knowledge Space"
        description="Access restricted recordings, notices, seasonal teachings, and language resources reserved for verified members and approved learners."
        image="https://images.unsplash.com/photo-1526150172432-4cf3f2c4f0d1?w=1400&h=700&fit=crop"
        chips={['Identity Verified', 'Protocol Aware', 'Elder Moderated']}
        actions={[
          { href: '/language-heritage/sacred-request', label: 'Request Restricted Access' },
          { href: '/language-heritage/sacred', label: 'Open Sacred Portal', tone: 'secondary' }
        ]}
      />
      <HeritageAccessGate
        accessLevel="community"
        fallbackTitle="Community membership required"
        fallbackDetail="This workspace is reserved for verified members and approved learners. Unlock archive access or request reviewed entry first."
      >
        <HeritageCardGrid
          title="Member Workspace"
          items={[
            { title: 'Community-only Collections', meta: 'Audio, story, and seasonal archives', badge: 'Collections', actionLabel: 'Browse' },
            { title: 'Member Announcements', meta: 'Language events, camps, and meetings', badge: 'Updates', actionLabel: 'Read Updates' },
            { title: 'Restricted Downloads', meta: 'Approved resources for verified members', badge: 'Access', actionLabel: 'Manage Access' },
            { title: 'Request Elder Signature', meta: 'Submit item approvals and protocol checks', badge: 'Workflow', actionLabel: 'Open Queue' }
          ]}
        />
        <HeritageCardGrid
          title="Upcoming Community Activities"
          columns={3}
          items={[
            { title: 'Youth Immersion Circle', meta: 'Saturday • 2:00 PM • Virtual', badge: 'Event' },
            { title: 'Elder Story Session', meta: 'Monday • 7:30 PM • Community Hall', badge: 'Session' },
            { title: 'Language Committee Review', meta: 'Wednesday • 5:00 PM • Members', badge: 'Governance' }
          ]}
        />
      </HeritageAccessGate>
    </LanguageHeritageFrame>
  );
}
