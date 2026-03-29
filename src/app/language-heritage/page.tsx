'use client';

import Link from 'next/link';
import LanguageHeritageFrame from './components/LanguageHeritageFrame';
import HeritageCardGrid from './components/HeritageCardGrid';
import HeritageHeroBanner from './components/HeritageHeroBanner';
import HeritageLiveListings from './components/HeritageLiveListings';
import AnimatedCounter from './components/AnimatedCounter';

export default function LanguageHeritageHomePage() {
  const keepers = [
    {
      name: 'Elder Maria Begay',
      nation: 'Dine',
      role: 'Story & Protocol Keeper',
      image: 'https://images.unsplash.com/photo-1546961329-78bef0414d7c?w=900&h=900&fit=crop'
    },
    {
      name: 'James Yazzie',
      nation: 'Navajo Nation',
      role: 'Language Documentation Lead',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=900&h=900&fit=crop'
    },
    {
      name: 'Aroha Rangi',
      nation: 'Maori',
      role: 'Immersion Program Mentor',
      image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=900&h=900&fit=crop'
    }
  ];

  const rankings = [
    {
      rank: 1,
      title: 'Passamaquoddy Audio Conversation Pack',
      nation: 'Passamaquoddy',
      score: 98,
      metric: 'Highest conversion this week',
      image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=1200&h=700&fit=crop'
    },
    {
      rank: 2,
      title: 'Te Reo Whanau Immersion Retreat',
      nation: 'Maori',
      score: 94,
      metric: 'Most wishlist adds',
      image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&h=700&fit=crop'
    },
    {
      rank: 3,
      title: 'Syllabics Keyboard + Font Bundle',
      nation: 'Cree',
      score: 91,
      metric: 'Top software engagement',
      image: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=1200&h=700&fit=crop'
    }
  ];

  const trendingNow = [
    {
      title: 'Lakota Story Circle Live',
      type: 'Live Session',
      image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&h=700&fit=crop',
      stat: '+220 watching'
    },
    {
      title: 'Navajo Family Phrase Set',
      type: 'Learning Pack',
      image: 'https://images.unsplash.com/photo-1491841573634-28140fc7ced7?w=1200&h=700&fit=crop',
      stat: '+420 saves'
    },
    {
      title: 'Yolngu Song Archive Drop',
      type: 'Audio Archive',
      image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=1200&h=700&fit=crop',
      stat: '+160 purchases'
    },
    {
      title: 'Inuit Winter Lexicon',
      type: 'Dictionary',
      image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=1200&h=700&fit=crop',
      stat: '+95 reviews'
    },
    {
      title: 'Noongar Place Names Atlas',
      type: 'Heritage Map',
      image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&h=700&fit=crop',
      stat: '+70 institutions'
    }
  ];

  return (
    <LanguageHeritageFrame
      title="Language & Heritage"
      subtitle="Keepers of the world's oldest stories. Document, learn, preserve, and protect."
    >
      <HeritageHeroBanner
        eyebrow="Pillar 7"
        title="Keepers of the World's Oldest Stories"
        description="Support language preservation across communities with protocol-aware access, archive discovery, and practical learning tools."
        image="https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=1400&h=700&fit=crop"
        chips={['500+ Communities', 'Elder-Guided Protocols', 'Living Archives']}
        actions={[
          { href: '/language-heritage/marketplace', label: 'Explore Archive' },
          { href: '/language-heritage/learning-materials', label: 'Learn a Language', tone: 'secondary' }
        ]}
        placementId="heritage_featured_banner"
      />

      <section className="rounded-2xl border border-[#d4af37]/20 bg-[#101010] p-4 md:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-[#d4af37]">Buyer shortcuts</p>
            <h3 className="mt-1 text-xl font-semibold text-white">Go straight to learning packs, archive drops, tools, or live programs</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              ['/language-heritage/marketplace', 'Marketplace'],
              ['/language-heritage/learning-materials', 'Learning'],
              ['/language-heritage/archive', 'Archive'],
              ['/language-heritage/apps-tools', 'Apps & tools'],
              ['/language-heritage/consulting', 'Services'],
            ].map(([href, label]) => (
              <Link key={href} href={href} className="rounded-full border border-[#d4af37]/30 bg-black/30 px-4 py-2 text-sm text-[#d4af37] transition-colors hover:bg-[#d4af37]/10">
                {label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <HeritageLiveListings title="Start Here" query={{ sort: 'featured' }} />

      <section className="grid gap-4 md:grid-cols-4">
        {[
          { label: 'Languages', value: 247, suffix: '+' },
          { label: 'Archive Items', value: 1200000, compact: true },
          { label: 'Active Learners', value: 18000, compact: true, suffix: '+' },
          { label: 'Contributors', value: 15000, compact: true, suffix: '+' }
        ].map((metric, idx) => (
          <div key={metric.label} className="fade-up-in rounded-xl border border-[#d4af37]/20 bg-[#101010] p-4" style={{ animationDelay: `${idx * 70}ms` }}>
            <p className="text-xs uppercase tracking-wide text-gray-400">{metric.label}</p>
            <p className="mt-1 text-xl font-semibold text-white soft-glow">
              <AnimatedCounter value={metric.value} compact={Boolean(metric.compact)} suffix={metric.suffix || ''} />
            </p>
          </div>
        ))}
      </section>

      <HeritageLiveListings title="Recent Activity" query={{ sort: 'newest' }} />

      <section className="rounded-2xl border border-[#d4af37]/20 bg-[#101010] p-4 md:p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[#d4af37]">Trending Now</h3>
          <span className="text-xs text-gray-400">Premium visibility strip</span>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-1">
          {trendingNow.map((item, idx) => (
            <article
              key={item.title}
              className="fade-up-in group min-w-[260px] max-w-[260px] overflow-hidden rounded-xl border border-white/10 bg-[#0b0b0b] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#d4af37]/35"
              style={{ animationDelay: `${idx * 70}ms` }}
            >
              <div className="relative h-32">
                <img src={item.image} alt={item.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                <span className="absolute left-2 top-2 rounded-full border border-[#d4af37]/35 bg-black/60 px-2 py-0.5 text-[10px] uppercase tracking-wide text-[#d4af37]">
                  {item.type}
                </span>
              </div>
              <div className="p-3">
                <p className="line-clamp-2 text-sm font-semibold text-white">{item.title}</p>
                <p className="mt-1 text-xs text-[#d4af37]">{item.stat}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <div className="fade-up-in overflow-hidden rounded-2xl border border-[#d4af37]/20 bg-[#101010]">
          <img
            src="https://images.unsplash.com/photo-1524492412937-b28074a5d7c?w=1600&h=900&fit=crop"
            alt="Language preservation on Country"
            className="h-56 w-full object-cover"
          />
          <div className="space-y-3 p-5">
            <p className="text-xs uppercase tracking-wide text-[#d4af37]">What Pillar 7 Is</p>
            <h3 className="text-xl font-semibold text-white">A living language economy, not a static archive</h3>
            <p className="text-sm text-gray-300">
              Pillar 7 connects communities, Elders, learners, and institutions through ethical access to recordings, dictionaries,
              story collections, and language tools while keeping control with knowledge holders.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="rounded-full border border-white/20 px-2.5 py-1 text-xs text-gray-200">Community-controlled</span>
              <span className="rounded-full border border-white/20 px-2.5 py-1 text-xs text-gray-200">ICIP-aware</span>
              <span className="rounded-full border border-white/20 px-2.5 py-1 text-xs text-gray-200">Protocol-first</span>
            </div>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
          {keepers.map((keeper, idx) => (
            <article
              key={keeper.name}
              className="fade-up-in flex items-center gap-3 rounded-xl border border-[#d4af37]/20 bg-[#101010] p-3 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#d4af37]/35"
              style={{ animationDelay: `${idx * 90}ms` }}
            >
              <img src={keeper.image} alt={keeper.name} className="h-16 w-16 rounded-full object-cover" />
              <div>
                <p className="text-sm font-semibold text-white">{keeper.name}</p>
                <p className="text-xs text-gray-400">{keeper.nation}</p>
                <p className="text-xs text-[#d4af37]">{keeper.role}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-[#d4af37]/20 bg-[#101010] p-4 md:p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[#d4af37]">Top Rankings</h3>
          <span className="text-xs text-gray-400">Performance index this week</span>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {rankings.map((entry, idx) => (
            <article
              key={entry.title}
              className="fade-up-in overflow-hidden rounded-xl border border-white/10 bg-[#0b0b0b]"
              style={{ animationDelay: `${idx * 80}ms` }}
            >
              <div className="relative h-36">
                <img src={entry.image} alt={entry.title} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent" />
                <span className="absolute left-2 top-2 rounded-full border border-[#d4af37]/35 bg-black/65 px-2 py-0.5 text-xs font-semibold text-[#d4af37]">
                  #{entry.rank}
                </span>
              </div>
              <div className="space-y-2 p-4">
                <p className="text-sm font-semibold text-white">{entry.title}</p>
                <p className="text-xs text-gray-400">{entry.nation}</p>
                <p className="text-xs text-[#d4af37]">{entry.metric}</p>
                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-gradient-to-r from-[#b51d19] to-[#d4af37]" style={{ width: `${entry.score}%` }} />
                </div>
                <p className="text-xs text-gray-300">Score: {entry.score}/100</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <HeritageCardGrid
        title="Browse by Category"
        items={[
          { title: 'Language Learning', href: '/language-heritage/learning-materials', badge: 'Education' },
          { title: 'Audio & Video', href: '/language-heritage/audio-video', badge: 'Media' },
          { title: 'Apps & Tools', href: '/language-heritage/apps-tools', badge: 'Technology' },
          { title: 'Books', href: '/language-heritage/books-publications', badge: 'Publishing' },
          { title: 'Digital Archive', href: '/language-heritage/archive', badge: 'Archive' },
          { title: 'Sacred Portal', href: '/language-heritage/sacred', badge: 'Protected' },
          { title: 'IKS', href: '/language-heritage/knowledge-systems', badge: 'Knowledge' },
          { title: 'Repatriation Hub', href: '/language-heritage/repatriation', badge: 'Restitution' }
        ]}
      />

      <section className="grid gap-4 md:grid-cols-3">
        {[
          { title: 'Arapaho Community Archive', value: '87% funded', image: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=1200&h=700&fit=crop' },
          { title: 'Ainu Storytelling Recovery', value: '62% funded', image: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200&h=700&fit=crop' },
          { title: 'Inuit Youth Recording Lab', value: '54% funded', image: 'https://images.unsplash.com/photo-1511497584788-876760111969?w=1200&h=700&fit=crop' }
        ].map((project, idx) => (
          <article key={project.title} className="fade-up-in overflow-hidden rounded-xl border border-[#d4af37]/20 bg-[#101010]" style={{ animationDelay: `${idx * 80}ms` }}>
            <img src={project.image} alt={project.title} className="h-36 w-full object-cover" />
            <div className="p-4">
              <p className="text-sm font-semibold text-white">{project.title}</p>
              <p className="mt-1 text-xs text-[#d4af37]">{project.value}</p>
              <button type="button" className="mt-3 rounded-full border border-[#d4af37]/40 px-3 py-1 text-xs text-[#d4af37] hover:bg-[#d4af37]/10">
                Support Project
              </button>
            </div>
          </article>
        ))}
      </section>

      <section className="rounded-2xl border border-[#d4af37]/20 bg-gradient-to-r from-[#141414] via-[#101010] to-[#141414] p-6">
        <h3 className="text-xl font-semibold text-white">Start Your Language Journey</h3>
        <p className="mt-1 max-w-3xl text-sm text-gray-300">
          Buyers come here to discover authentic resources. Contributors come here to preserve and earn. Communities stay in control.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/language-heritage/marketplace" className="rounded-full bg-[#d4af37] px-5 py-2 text-sm font-semibold text-black">
            Browse Marketplace
          </Link>
          <Link href="/language-heritage/contributor-dashboard" className="rounded-full border border-[#d4af37]/40 px-5 py-2 text-sm text-[#d4af37] hover:bg-[#d4af37]/10">
            Become a Contributor
          </Link>
        </div>
      </section>
    </LanguageHeritageFrame>
  );
}
