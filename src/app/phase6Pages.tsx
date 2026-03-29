import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getDigitalChampionBySlug, listDigitalChampionDashboard, listDigitalChampions } from '@/app/lib/digitalChampionHub';
import { DigitalChampionApplyClient, DigitalChampionRequestClient, DigitalChampionSponsorClient } from '@/app/digital-champions/DigitalChampionForms';
import { getTreasuryByCommunitySlug } from '@/app/lib/platformTreasury';
import { getPlatformAccountBySlug } from '@/app/lib/platformAccounts';
import { getStoryBySlug, listStories, listStoriesByCommunitySlug } from '@/app/lib/storyPlatform';
import { getWorkspaceRoomBySlug, listWorkspaceRooms } from '@/app/lib/workspaces';
import MentorshipHub from '@/app/components/community/MentorshipHub';
import {
  SurfaceEditorialCard,
  SurfaceHero,
  SurfaceListStrip,
  SurfaceMetricRibbon,
  SurfacePage,
  SurfaceSectionHeading,
  surfacePrimaryActionClass,
  surfaceSecondaryActionClass
} from '@/app/components/phase-surfaces/SurfaceSystem';

export const metadata = { title: 'Phase 6 Surfaces | Indigena Global Market' };

export async function DigitalChampionsPage() {
  const champions = await listDigitalChampions();
  return (
    <SurfacePage tone="program">
      <SurfaceHero
        tone="program"
        eyebrow="Digital Champion Hub"
        title="Field operators, regional launch support, and sponsor-backed community onboarding."
        description="Digital Champions are not a social tab. They are an operational network that helps communities launch pages, assign representatives, publish stories, and become financially functional in-region."
        image={champions[0]?.heroImage}
        actions={[
          { href: '/digital-champions/apply', label: 'Apply to the network', variant: 'secondary' },
          { href: '/digital-champions/requests', label: 'Request regional help', variant: 'secondary' },
          { href: '/digital-champions/sponsor', label: 'Sponsor a champion' }
        ]}
        stats={[
          { label: 'Active network', value: String(champions.length), note: 'regional operators' },
          { label: 'Current support', value: `$${champions.reduce((sum, item) => sum + item.currentSponsoredAmount, 0).toLocaleString()}`, note: 'funded now' },
          { label: 'Communities covered', value: String(champions.reduce((sum, item) => sum + item.communities.length, 0)), note: 'served regions' },
          { label: 'Mission', value: 'Launch', note: 'pages, roles, treasury literacy' }
        ]}
        aside={
          <div className="rounded-[28px] border border-white/10 bg-black/24 p-5 backdrop-blur-sm">
            <p className="text-[11px] uppercase tracking-[0.24em] text-white/48">Program structure</p>
            <p className="mt-3 text-lg font-semibold text-white">Coverage follows communities, not generic marketing territories.</p>
            <p className="mt-3 text-sm leading-7 text-white/68">Sponsors fund people, travel, devices, and onboarding capacity. Requests route to the queue. Treasury disbursement happens later through the entity system.</p>
          </div>
        }
      />

      <SurfaceSectionHeading
        eyebrow="Regional network"
        title="Profiles that look operational, not ornamental."
        description="Each profile shows field region, funding position, and the communities the champion is already helping."
      />
      <section className="space-y-6">
        {champions.map((champion) => (
          <SurfaceEditorialCard
            key={champion.id}
            tone="program"
            eyebrow={champion.status.replace('-', ' ')}
            image={champion.heroImage}
            title={champion.displayName}
            description={champion.bio}
            meta={`${champion.region} | ${champion.communities.join(' | ')}`}
            actions={
              <div className="flex flex-wrap gap-3">
                <Link href={`/digital-champions/${champion.slug}`} className={surfacePrimaryActionClass}>View profile</Link>
                <Link href="/communities" className={surfaceSecondaryActionClass}>Community pages</Link>
              </div>
            }
          />
        ))}
      </section>
    </SurfacePage>
  );
}

export async function DigitalChampionDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getDigitalChampionBySlug(slug);
  if (!data) notFound();
  return (
    <SurfacePage tone="program">
      <SurfaceHero
        tone="program"
        eyebrow="Digital Champion profile"
        title={data.champion.displayName}
        description={data.champion.bio}
        image={data.champion.heroImage}
        actions={[
          { href: '/digital-champions/sponsor', label: 'Sponsor this champion' },
          { href: '/digital-champions/requests', label: 'View support queue', variant: 'secondary' }
        ]}
        stats={[
          { label: 'Region', value: data.champion.region },
          { label: 'Goal', value: `$${data.champion.sponsorshipGoalAmount.toLocaleString()}` },
          { label: 'Funded', value: `$${data.champion.currentSponsoredAmount.toLocaleString()}` },
          { label: 'Coverage', value: String(data.champion.communities.length), note: 'communities' }
        ]}
      />

      <section className="grid gap-6 lg:grid-cols-[0.95fr,1.05fr]">
        <div className="space-y-4">
          <SurfaceSectionHeading eyebrow="Impact log" title="Work already done in the field." />
          {data.impactLogs.map((entry) => (
            <SurfaceListStrip
              key={entry.id}
              eyebrow={entry.metricLabel}
              title={entry.metricValue}
              description={entry.detail}
            />
          ))}
        </div>
        <div className="space-y-4">
          <SurfaceSectionHeading eyebrow="Assigned requests" title="Communities currently routed here." />
          {data.requests.map((entry) => (
            <SurfaceListStrip
              key={entry.id}
              eyebrow={`${entry.region} | ${entry.urgency} urgency`}
              title={entry.communityName}
              description={entry.supportNeeded}
              meta={`Status | ${entry.status}`}
            />
          ))}
        </div>
      </section>
    </SurfacePage>
  );
}

export function DigitalChampionApplyPage() {
  return (
    <SurfacePage tone="program">
      <SurfaceHero
        tone="program"
        eyebrow="Digital Champion network"
        title="Apply to become the local operator communities actually trust."
        description="The role is field support, not platform cheerleading. Champions help with pages, sellers, archive setup, treasury literacy, and story publishing."
        image="/hero3.jpg"
        stats={[
          { label: 'Role type', value: 'Field lead' },
          { label: 'Support lane', value: 'Onboarding' },
          { label: 'Program basis', value: 'Regional' },
          { label: 'Review path', value: 'Governance' }
        ]}
      />
      <DigitalChampionApplyClient />
    </SurfacePage>
  );
}

export async function DigitalChampionSponsorPage() {
  const champions = await listDigitalChampions();
  const options = champions.map((entry) => ({ id: entry.id, name: entry.displayName, targetAccountId: entry.linkedAccountId, communities: entry.communities }));
  return (
    <SurfacePage tone="program">
      <SurfaceHero
        tone="program"
        eyebrow="Program sponsorship"
        title="Fund the people who unlock real launches, not just visibility."
        description="Sponsorship moves into champion treasury and disbursement routing. This is operational funding for onboarding capacity, travel, devices, and field support."
        image="/hero2.jpg"
        stats={[
          { label: 'Targets', value: String(options.length), note: 'active profiles' },
          { label: 'Funding mode', value: 'One-time or monthly' },
          { label: 'Route', value: 'Treasury-linked' },
          { label: 'Outcome', value: 'Regional lift' }
        ]}
      />
      <DigitalChampionSponsorClient options={options} />
    </SurfacePage>
  );
}

export async function DigitalChampionRequestsPage() {
  const dashboard = await listDigitalChampionDashboard();
  return (
    <SurfacePage tone="program">
      <SurfaceHero
        tone="program"
        eyebrow="Support queue"
        title="Ask for field help without getting buried in the social layer."
        description="Communities can request page setup, seller onboarding, archive permissions, story publishing help, and treasury support directly from the network."
        image="/hero1.jpg"
        stats={[
          { label: 'Open requests', value: String(dashboard.requests.filter((entry) => entry.status === 'open').length) },
          { label: 'Assigned', value: String(dashboard.requests.filter((entry) => entry.status === 'assigned').length) },
          { label: 'Applications', value: String(dashboard.applications.length) },
          { label: 'Active sponsors', value: String(dashboard.sponsorships.length) }
        ]}
      />
      <section className="grid gap-6 lg:grid-cols-[0.92fr,1.08fr]">
        <DigitalChampionRequestClient />
        <div className="space-y-4">
          <SurfaceSectionHeading eyebrow="Queue" title="Live requests" />
          {dashboard.requests.map((entry) => (
            <SurfaceListStrip
              key={entry.id}
              eyebrow={`${entry.region} | ${entry.urgency}`}
              title={entry.communityName}
              description={entry.supportNeeded}
              meta={`Status | ${entry.status}`}
            />
          ))}
        </div>
      </section>
    </SurfacePage>
  );
}

export async function StoriesPage() {
  const stories = await listStories();
  const featured = stories[0];
  return (
    <SurfacePage tone="story">
      <SurfaceHero
        tone="story"
        eyebrow="Storytelling platform"
        title="Long-form creator and community publishing with its own editorial space."
        description="Stories are not social posts and they are not community-entity metadata. This is the publishing layer for articles, photo essays, audio stories, and video stories."
        image={featured?.coverImage}
        actions={[
          featured ? { href: `/stories/${featured.slug}`, label: 'Read the featured story' } : { href: '/stories', label: 'Browse stories' },
          { href: '/community/stories', label: 'Community social feed', variant: 'secondary' }
        ]}
        stats={[
          { label: 'Published', value: String(stories.length), note: 'current stories' },
          { label: 'Formats', value: '4', note: 'article, photo, audio, video' },
          { label: 'Entity archives', value: String(new Set(stories.map((story) => story.communitySlug).filter(Boolean)).size) },
          { label: 'Perspective', value: 'Creator + community' }
        ]}
      />

      <SurfaceSectionHeading
        eyebrow="Featured pieces"
        title="Editorial surfaces with real hierarchy."
        description="Each piece can still point back to a community archive when it belongs to a sovereign entity page."
      />
      <section className="space-y-6">
        {stories.map((story) => (
          <SurfaceEditorialCard
            key={story.id}
            tone="story"
            eyebrow={story.format.replace('-', ' ')}
            image={story.coverImage}
            title={story.title}
            description={story.excerpt}
            meta={`${story.author.name} | ${story.author.roleLabel}`}
            actions={
              <div className="flex flex-wrap gap-3">
                <Link href={`/stories/${story.slug}`} className={surfacePrimaryActionClass}>Read story</Link>
                {story.communitySlug ? <Link href={`/communities/${story.communitySlug}/stories`} className={surfaceSecondaryActionClass}>Community archive</Link> : null}
              </div>
            }
          />
        ))}
      </section>
    </SurfacePage>
  );
}

export async function StoryDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const story = await getStoryBySlug(slug);
  if (!story) notFound();
  return (
    <SurfacePage tone="story">
      <SurfaceHero
        tone="story"
        eyebrow={story.format.replace('-', ' ')}
        title={story.title}
        description={story.excerpt}
        image={story.coverImage}
        actions={[
          { href: '/stories', label: 'Back to stories', variant: 'secondary' },
          ...(story.communitySlug ? [{ href: `/communities/${story.communitySlug}/stories`, label: 'Community archive' as const }] : [])
        ]}
        stats={[
          { label: 'Author', value: story.author.name },
          { label: 'Role', value: story.author.roleLabel },
          { label: 'Pillar', value: story.pillar },
          { label: 'Published', value: new Date(story.publishedAt).toLocaleDateString() }
        ]}
      />
      <article className="mx-auto max-w-4xl">
        <div className="rounded-[34px] border border-white/10 bg-black/18 px-6 py-8 text-lg leading-9 text-white/82 shadow-[0_20px_70px_rgba(0,0,0,0.28)] backdrop-blur-sm md:px-8 md:py-10">
          {story.body}
        </div>
      </article>
    </SurfacePage>
  );
}

export async function WorkspacesPage() {
  const rooms = await listWorkspaceRooms();
  return (
    <SurfacePage tone="community">
      <SurfaceHero
        tone="community"
        eyebrow="Collaborative workspaces"
        title="Shared project rooms for launches, archive sprints, event planning, and production work."
        description="This is where creators, communities, and support teams coordinate together. It should feel like a working surface, not another directory of cards."
        image="/hero2.jpg"
        stats={[
          { label: 'Rooms', value: String(rooms.length) },
          { label: 'Linked communities', value: String(new Set(rooms.map((room) => room.communitySlug)).size) },
          { label: 'Mode', value: 'Collaborative' },
          { label: 'Scope', value: 'Files, threads, tasks' }
        ]}
      />
      <section className="space-y-5">
        {rooms.map((room) => (
          <SurfaceListStrip
            key={room.id}
            eyebrow={room.status}
            title={room.title}
            description={room.summary}
            meta={room.focus}
            actions={
              <div className="flex flex-wrap gap-3">
                <Link href={`/workspaces/${room.slug}`} className={surfacePrimaryActionClass}>Open workspace</Link>
                <Link href={`/communities/${room.communitySlug}`} className={surfaceSecondaryActionClass}>Community page</Link>
              </div>
            }
          />
        ))}
      </section>
    </SurfacePage>
  );
}

export async function WorkspaceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const room = await getWorkspaceRoomBySlug(slug);
  if (!room) notFound();
  const metrics = [
    { label: 'Members', value: String(room.members.length) },
    { label: 'Threads', value: String(room.threadCount) },
    { label: 'Files', value: String(room.fileCount) },
    { label: 'Focus', value: room.focus }
  ];
  return (
    <SurfacePage tone="community">
      <SurfaceHero
        tone="community"
        eyebrow="Workspace room"
        title={room.title}
        description={room.summary}
        image="/hero3.jpg"
        actions={[{ href: '/workspaces', label: 'Back to workspaces', variant: 'secondary' }, { href: `/communities/${room.communitySlug}`, label: 'Community page' }]}
        stats={metrics}
      />
      <SurfaceSectionHeading eyebrow="Members" title="People carrying the work." />
      <section className="grid gap-4 md:grid-cols-2">
        {room.members.map((member: (typeof room.members)[number]) => (
          <SurfaceListStrip key={member.actorId} eyebrow={member.role} title={member.label} description="Current room participant." />
        ))}
      </section>
    </SurfacePage>
  );
}

export async function CommunityForumsPage() {
  const discussions = [
    { id: 'forum-1', title: 'Community launch checklist exchange', replies: 24, views: 318, hot: true },
    { id: 'forum-2', title: 'How to structure artist + community royalty splits', replies: 18, views: 204, hot: true },
    { id: 'forum-3', title: 'Best practices for community representatives and approvals', replies: 9, views: 127, hot: false },
    { id: 'forum-4', title: 'Digital Champion field notes and training tips', replies: 14, views: 191, hot: false }
  ];
  return (
    <SurfacePage tone="social">
      <SurfaceHero
        tone="social"
        eyebrow="Community Hub"
        title="Forums and discussion circles for the social layer."
        description="This remains distinct from sovereign community seller pages under /communities. Here the emphasis is exchange, discussion, and peer coordination."
        image="/hero1.jpg"
        stats={[
          { label: 'Threads', value: String(discussions.length) },
          { label: 'Hot topics', value: String(discussions.filter((item) => item.hot).length) },
          { label: 'Mode', value: 'Social' },
          { label: 'Boundary', value: 'Not a seller page' }
        ]}
      />
      <section className="space-y-5">
        {discussions.map((item) => (
          <SurfaceListStrip
            key={item.id}
            eyebrow={item.hot ? 'Hot discussion' : 'Open discussion'}
            title={item.title}
            description="Discussion flow, moderation, and replies live here in the social layer."
            meta={`${item.replies} replies | ${item.views} views`}
          />
        ))}
      </section>
    </SurfacePage>
  );
}

export function CommunityMentorshipPage() {
  return (
    <SurfacePage tone="social">
      <SurfaceHero
        tone="social"
        eyebrow="Community Hub"
        title="Mentorship belongs to the social and learning layer, not the sovereign storefront layer."
        description="Communities can participate, but the mentoring system should remain a relationship network, not a tribe page module."
        image="/hero2.jpg"
        stats={[
          { label: 'Focus', value: 'Pairing' },
          { label: 'Layer', value: 'Social' },
          { label: 'Participants', value: 'Elders + creators' },
          { label: 'Outcome', value: 'Growth' }
        ]}
      />
      <MentorshipHub />
    </SurfacePage>
  );
}

export async function CommunityStoriesPage() {
  const stories = await listStories();
  return (
    <SurfacePage tone="social">
      <SurfaceHero
        tone="social"
        eyebrow="Community Hub"
        title="The social story feed stays separate from community-owned archives."
        description="This is the conversational and discoverable layer. Entity-owned archives still live under each /communities/[slug]/stories route."
        image="/hero3.jpg"
        stats={[
          { label: 'Stories', value: String(stories.length) },
          { label: 'Feed type', value: 'Social' },
          { label: 'Archive link', value: 'Connected' },
          { label: 'Entity split', value: 'Preserved' }
        ]}
      />
      <section className="space-y-6">
        {stories.map((story) => (
          <SurfaceEditorialCard
            key={story.id}
            tone="social"
            eyebrow={story.author.roleLabel}
            image={story.coverImage}
            title={story.title}
            description={story.excerpt}
            meta={story.author.name}
            actions={
              <div className="flex flex-wrap gap-3">
                <Link href={`/stories/${story.slug}`} className={surfacePrimaryActionClass}>Read</Link>
                {story.communitySlug ? <Link href={`/communities/${story.communitySlug}/stories`} className={surfaceSecondaryActionClass}>Community archive</Link> : null}
              </div>
            }
          />
        ))}
      </section>
    </SurfacePage>
  );
}

export async function CommunityStoriesArchivePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const account = await getPlatformAccountBySlug(slug);
  if (!account) notFound();
  const stories = await listStoriesByCommunitySlug(slug);
  return (
    <SurfacePage tone="community">
      <SurfaceHero
        tone="community"
        eyebrow="Community archive"
        title={`${account.account.displayName} story archive`}
        description="These stories are published under the sovereign entity itself. They are not general Community Hub feed items."
        image={account.account.banner}
        actions={[
          { href: `/communities/${slug}`, label: 'Community page', variant: 'secondary' },
          { href: '/stories', label: 'All stories' }
        ]}
        stats={[
          { label: 'Archive stories', value: String(stories.length) },
          { label: 'Account type', value: account.account.accountType.replace('-', ' ') },
          { label: 'Treasury label', value: account.account.treasuryLabel },
          { label: 'Nation', value: account.account.nation }
        ]}
      />
      <section className="space-y-6">
        {stories.map((story) => (
          <SurfaceEditorialCard
            key={story.id}
            tone="community"
            eyebrow={story.format.replace('-', ' ')}
            image={story.coverImage}
            title={story.title}
            description={story.excerpt}
            meta={story.author.name}
            actions={<Link href={`/stories/${story.slug}`} className={surfacePrimaryActionClass}>Read story</Link>}
          />
        ))}
        {stories.length === 0 ? <SurfaceListStrip title="No archive stories yet" description="This community has not published into its archive yet." /> : null}
      </section>
    </SurfacePage>
  );
}

export async function CommunityStorePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const account = await getPlatformAccountBySlug(slug);
  if (!account) notFound();
  return (
    <SurfacePage tone="community">
      <SurfaceHero
        tone="community"
        eyebrow="Community storefront"
        title={`${account.account.displayName} store`}
        description="This storefront belongs to the community entity itself. Sales here can route through treasury and split rules rather than defaulting to an individual creator only."
        image={account.account.banner}
        actions={[
          { href: `/communities/${slug}`, label: 'Community page', variant: 'secondary' },
          { href: `/communities/${slug}/treasury`, label: 'Treasury' }
        ]}
        stats={[
          { label: 'Featured', value: String(account.account.featuredOfferingIds.length), note: 'offerings' },
          { label: 'Split rules', value: String(account.splitRules.length) },
          { label: 'Verification', value: account.account.verificationStatus },
          { label: 'Treasury', value: account.account.treasuryLabel }
        ]}
      />
      <section className="space-y-5">
        {account.account.featuredOfferingIds.map((itemId) => (
          <SurfaceListStrip
            key={itemId}
            eyebrow="Featured offering"
            title={itemId}
            description="Mapped offering references are already routed for later richer merchandising, split policies, and treasury-aware storefront presentation."
          />
        ))}
        {account.account.featuredOfferingIds.length === 0 ? <SurfaceListStrip title="No featured offerings yet" description="This community storefront has not configured featured offerings." /> : null}
      </section>
    </SurfacePage>
  );
}

export async function CommunityTreasuryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getTreasuryByCommunitySlug(slug);
  if (!data) notFound();
  return (
    <SurfacePage tone="treasury">
      <SurfaceHero
        tone="treasury"
        eyebrow="Treasury"
        title={data.treasury.label}
        description="Treasury routing, split distributions, and champion disbursements now sit under the community entity rather than hiding inside generic finance pages."
        image="/hero2.jpg"
        actions={[
          { href: `/communities/${slug}`, label: 'Community page', variant: 'secondary' },
          { href: `/communities/${slug}/support`, label: 'Support this treasury' }
        ]}
        stats={[
          { label: 'Restricted', value: `$${data.treasury.restrictedBalance.toLocaleString()}` },
          { label: 'Unrestricted', value: `$${data.treasury.unrestrictedBalance.toLocaleString()}` },
          { label: 'Pending', value: `$${data.treasury.pendingDisbursementAmount.toLocaleString()}` },
          { label: 'Next disbursement', value: new Date(data.treasury.nextDisbursementDate).toLocaleDateString() }
        ]}
      />
      <section className="grid gap-6 lg:grid-cols-[1fr,1fr]">
        <div className="space-y-4">
          <SurfaceSectionHeading eyebrow="Ledger" title="Money movement" description={data.treasury.reportingNote} />
          {data.ledger.map((entry) => (
            <SurfaceListStrip key={entry.id} eyebrow={`${entry.type} | ${entry.status}`} title={`$${entry.amount.toLocaleString()} ${entry.currency}`} description={entry.note} meta={entry.counterparty} />
          ))}
        </div>
        <div className="space-y-4">
          <SurfaceSectionHeading eyebrow="Distribution flow" title="Splits and disbursements" />
          {data.splitDistributions.map((entry) => (
            <SurfaceListStrip key={entry.id} eyebrow={`${entry.sourceType} | Gross $${entry.grossAmount.toLocaleString()} ${entry.currency}`} title={entry.sourceId} description={entry.distributions.map((row) => `${row.label} $${row.amount.toLocaleString()}`).join(' | ')} />
          ))}
          {data.championDisbursements.map((entry) => (
            <SurfaceListStrip key={entry.id} eyebrow={`Champion disbursement | ${entry.status}`} title={`$${entry.amount.toLocaleString()}`} description={entry.note} meta={new Date(entry.scheduledFor).toLocaleDateString()} />
          ))}
          {data.championDisbursements.length === 0 ? <SurfaceListStrip title="No champion disbursements yet" description="No champion disbursements are currently routed into this treasury." /> : null}
        </div>
      </section>
    </SurfacePage>
  );
}
