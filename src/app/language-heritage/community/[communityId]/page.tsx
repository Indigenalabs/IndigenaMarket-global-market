'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import LanguageHeritageFrame from '../../components/LanguageHeritageFrame';
import HeritageCardGrid from '../../components/HeritageCardGrid';
import HeritageHeroBanner from '../../components/HeritageHeroBanner';
import { fetchCommunityProfile, type HeritageCommunityProfile } from '@/app/lib/languageHeritageApi';

export default function CommunityProfilePage() {
  const params = useParams<{ communityId: string }>();
  const communityId = String(params?.communityId || '');
  const [profile, setProfile] = useState<HeritageCommunityProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const next = await fetchCommunityProfile(communityId);
        if (!mounted) return;
        setProfile(next);
      } catch (e) {
        if (!mounted) return;
        setProfile(null);
        setError((e as Error).message || 'Failed to load community profile');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    if (communityId) void load();
    return () => {
      mounted = false;
    };
  }, [communityId]);

  return (
    <LanguageHeritageFrame title={`Community Profile: ${communityId}`} subtitle="Community language status, featured contributors, and materials.">
      {loading ? <p className="text-sm text-gray-400">Loading...</p> : null}
      {!loading && error ? <p className="text-sm text-red-300">{error}</p> : null}
      {!loading && !error && !profile ? <p className="text-sm text-red-300">Community not found.</p> : null}
      {profile && (
        <>
          <HeritageHeroBanner
            eyebrow="Community Profile"
            title={profile.nation}
            description="Language collections, featured knowledge keepers, and category activity from this community."
            image="https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1400&h=700&fit=crop"
            chips={[`${profile.totalItems} Materials`, `${profile.featured.length} Featured`, 'Community Controlled']}
          />
          <section className="rounded-xl border border-[#d4af37]/20 bg-[#101010] p-4">
            <p className="text-white font-semibold">{profile.nation}</p>
            <p className="text-sm text-gray-400">{profile.totalItems} materials in this community profile.</p>
          </section>
          <HeritageCardGrid
            title="Category Coverage"
            columns={3}
            items={Object.entries(profile.categoryCounts).map(([category, count]) => ({
              title: category,
              meta: `${count} items`,
              badge: 'Category'
            }))}
          />
          <HeritageCardGrid
            title="Featured Materials"
            items={profile.featured.slice(0, 8).map((item) => ({
              title: item.title,
              meta: `${item.currency} ${item.price} • ${item.categoryLabel}`,
              badge: item.accessLevel,
              actionLabel: 'Open Listing'
            }))}
          />
        </>
      )}
    </LanguageHeritageFrame>
  );
}
