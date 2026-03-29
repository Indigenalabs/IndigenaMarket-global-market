import Link from 'next/link';
import { Award, ChevronLeft, Crown, Gem, Heart, Star, Target, TrendingUp, Trophy, Zap } from 'lucide-react';

const stats: Array<{ label: string; value: string; icon: typeof Trophy }> = [
  { label: 'Karma Points', value: '3,450', icon: Trophy },
  { label: 'Awards Received', value: '702', icon: Award },
  { label: 'Badges Earned', value: '4 / 6', icon: Gem },
  { label: 'Next Milestone', value: '50 sales', icon: Target },
];

const badges = [
  { name: 'First Steps', detail: 'Created your first post', rarity: 'Common', icon: Star },
  { name: 'Rising Star', detail: 'Reached 100 followers', rarity: 'Rare', icon: Zap },
  { name: 'Community Champion', detail: 'Helped 50 community members', rarity: 'Rare', icon: Heart },
  { name: 'Trendsetter', detail: 'Had a post trend #1', rarity: 'Epic', icon: TrendingUp },
  { name: 'Master Artisan', detail: 'Sold 50 artworks', rarity: 'Epic', icon: Gem },
  { name: 'Legend', detail: 'Reached 10,000 karma points', rarity: 'Legendary', icon: Crown },
];

export default function CommunityReputationPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <Link href="/community" className="inline-flex items-center gap-2 text-sm text-[#d4af37] hover:underline">
          <ChevronLeft size={16} />
          Back to Community
        </Link>

        <section className="mt-6 rounded-3xl border border-[#d4af37]/20 bg-[#141414] p-8">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-[#d4af37]">Community Reputation</p>
              <h1 className="mt-3 text-4xl font-semibold">Karma, badges, and contribution standing</h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-400">
                Track earned badges, award history, and the milestones that shape community standing.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Current Level</p>
              <p className="mt-2 text-3xl font-bold text-white">Lvl 12</p>
              <p className="mt-1 text-sm text-[#d4af37]">Culture Bearer</p>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-4">
          {stats.map(({ label, value, icon: Icon }) => (
            <article key={label} className="rounded-2xl border border-white/10 bg-[#141414] p-5">
              <div className="flex items-center gap-2 text-[#d4af37]">
                <Icon size={16} />
                <p className="text-xs uppercase tracking-[0.2em] text-gray-500">{label}</p>
              </div>
              <p className="mt-4 text-2xl font-semibold text-white">{value}</p>
            </article>
          ))}
        </section>

        <section className="mt-8 rounded-3xl border border-[#d4af37]/20 bg-[#141414] p-8">
          <p className="text-xs uppercase tracking-[0.28em] text-[#d4af37]">Badge Cabinet</p>
          <h2 className="mt-2 text-2xl font-semibold">Every badge and unlock condition</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {badges.map(({ name, detail, rarity, icon: Icon }) => (
              <article key={name} className="rounded-2xl border border-white/10 bg-black/20 p-5">
                <div className="flex items-center justify-between gap-3">
                  <div className="inline-flex rounded-full border border-[#d4af37]/25 bg-[#d4af37]/10 p-2 text-[#d4af37]">
                    <Icon size={16} />
                  </div>
                  <span className="rounded-full border border-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-gray-400">
                    {rarity}
                  </span>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-white">{name}</h3>
                <p className="mt-2 text-sm leading-7 text-gray-400">{detail}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
