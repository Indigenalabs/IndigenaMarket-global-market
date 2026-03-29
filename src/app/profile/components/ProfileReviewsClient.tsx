'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { ExternalLink, Star } from 'lucide-react';
import type { CreatorProfileRecord, ProfilePillarId } from '@/app/profile/data/profileShowcase';
import { trackProfileAnalyticsEvent } from '@/app/lib/profileApi';

const REVIEW_PILLAR_LABELS: Record<Exclude<ProfilePillarId, 'seva'>, string> = {
  'digital-arts': 'Digital Art',
  'physical-items': 'Physical',
  courses: 'Courses',
  freelancing: 'Freelancing',
  'cultural-tourism': 'Tourism',
  'language-heritage': 'Language',
  'land-food': 'Land & Food',
  'advocacy-legal': 'Advocacy',
  'materials-tools': 'Materials'
};

export default function ProfileReviewsClient({
  profile
}: {
  profile: CreatorProfileRecord;
}) {
  useEffect(() => {
    trackProfileAnalyticsEvent({
      profileSlug: profile.slug,
      eventName: 'reviews_view',
      pageKind: 'reviews'
    });
  }, [profile.slug]);

  const averageRating =
    profile.featuredReviews.length > 0
      ? (profile.featuredReviews.reduce((sum, review) => sum + review.rating, 0) / profile.featuredReviews.length).toFixed(1)
      : null;

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-white/10 bg-[#101010] p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-[#d4af37]">Reviews</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">What buyers, learners, and clients say about {profile.displayName}</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-400">
              This page is dedicated to feedback. The storefront only shows a small trust strip so people can reach the items faster.
            </p>
          </div>
          <Link
            href={`/profile/${profile.slug}`}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-gray-300 hover:border-[#d4af37]/35 hover:text-white"
          >
            Back to storefront
            <ExternalLink size={14} />
          </Link>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-[24px] border border-[#d4af37]/20 bg-black/20 p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-gray-500">Average rating</p>
            <p className="mt-3 text-3xl font-semibold text-white">{averageRating ?? 'N/A'}</p>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-black/20 p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-gray-500">Review count</p>
            <p className="mt-3 text-3xl font-semibold text-white">{profile.featuredReviews.length}</p>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-black/20 p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-gray-500">Verified creator</p>
            <p className="mt-3 text-lg font-semibold text-white">{profile.verificationLabel}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4">
        {profile.featuredReviews.map((review) => (
          <article key={review.id} className="rounded-[28px] border border-white/10 bg-[#101010] p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-lg font-semibold text-white">{review.title}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.18em] text-[#d4af37]">
                  {REVIEW_PILLAR_LABELS[review.pillar as Exclude<ProfilePillarId, 'seva'>] ?? review.pillar}
                </p>
              </div>
              <div className="flex items-center gap-1 text-[#d4af37]">
                {Array.from({ length: review.rating }).map((_, index) => (
                  <Star key={`${review.id}-${index}`} size={14} fill="currentColor" />
                ))}
              </div>
            </div>
            <p className="mt-5 text-base leading-8 text-[#ddd6c8]">"{review.quote}"</p>
            <div className="mt-5 flex items-center justify-between text-sm text-gray-400">
              <span>{review.authorName} · {review.authorHandle}</span>
              <span>{review.ago}</span>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
