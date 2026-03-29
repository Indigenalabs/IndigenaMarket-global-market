'use client';

import { useState } from 'react';
import { Star, ThumbsUp, Flag, Check, ChevronDown, Camera } from 'lucide-react';

interface Review {
  id: string;
  author: string;
  authorAvatar: string;
  nation?: string;
  rating: number;
  title: string;
  body: string;
  date: string;
  helpful: number;
  verified: boolean;
  photos?: string[];
  makerReply?: string;
}

interface ReviewsSectionProps {
  itemId: string;
  itemTitle: string;
  makerName: string;
  averageRating: number;
  reviewCount: number;
}

// Star rating breakdown (mock distribution)
function getRatingDistribution(avg: number): Record<number, number> {
  const total = 24;
  if (avg >= 4.8) return { 5: 18, 4: 4, 3: 1, 2: 1, 1: 0 };
  if (avg >= 4.5) return { 5: 14, 4: 6, 3: 2, 2: 1, 1: 1 };
  if (avg >= 4.0) return { 5: 10, 4: 8, 3: 4, 2: 1, 1: 1 };
  return { 5: 8, 4: 6, 3: 5, 2: 3, 1: 2 };
}

const MOCK_REVIEWS: Review[] = [
  {
    id: '1',
    author: 'TwoBears',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop',
    nation: 'Lakota',
    rating: 5,
    title: 'Absolutely stunning craftsmanship',
    body: 'The quality of this piece exceeded my expectations. You can feel the care and tradition woven into every detail. It arrived beautifully packaged with a hand-written note about its story. Truly a treasure.',
    date: '2025-01-14',
    helpful: 12,
    verified: true,
    photos: ['https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=300&h=300&fit=crop'],
  },
  {
    id: '2',
    author: 'SunflowerMama',
    authorAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop',
    rating: 5,
    title: 'A meaningful gift for my daughter',
    body: 'I ordered this as a graduation gift and the maker even included a short blessing note. The Hub packaging was secure and arrived in perfect condition. Will absolutely order again.',
    date: '2024-12-30',
    helpful: 8,
    verified: true,
    makerReply: 'Thank you so much! It was an honour to make this for your daughter\'s graduation. Wishing her all the best on her journey. 🙏',
  },
  {
    id: '3',
    author: 'ArtCollector_PNW',
    authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop',
    rating: 4,
    title: 'Excellent quality, slight delay',
    body: 'The piece itself is absolutely beautiful and exactly as described. Shipping took a bit longer than expected — 12 days instead of 8 — but the maker kept me updated. No complaints on the item.',
    date: '2024-11-18',
    helpful: 5,
    verified: true,
  },
  {
    id: '4',
    author: 'FirstNationsCollector',
    authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop',
    nation: 'Cree',
    rating: 5,
    title: 'Culturally authentic and spiritually powerful',
    body: 'As someone from the community, I can tell immediately when a piece is made with true cultural understanding. This is the real thing. The materials, the techniques, the story — all authentic.',
    date: '2024-10-05',
    helpful: 19,
    verified: true,
  },
];

function StarDisplay({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={size}
          className={s <= Math.round(rating) ? 'text-[#d4af37] fill-[#d4af37]' : 'text-gray-600'}
        />
      ))}
    </div>
  );
}

function StarInput({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          onMouseEnter={() => setHover(s)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(s)}
          className="transition-transform hover:scale-110"
        >
          <Star
            size={24}
            className={(hover || value) >= s ? 'text-[#d4af37] fill-[#d4af37]' : 'text-gray-600'}
          />
        </button>
      ))}
    </div>
  );
}

export default function ReviewsSection({ itemId: _itemId, itemTitle: _itemTitle, makerName, averageRating, reviewCount }: ReviewsSectionProps) {
  const [sortBy, setSortBy] = useState<'recent' | 'helpful' | 'high' | 'low'>('helpful');
  const [filterStar, setFilterStar] = useState<number | null>(null);
  const [showWriteForm, setShowWriteForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [helpfulVotes, setHelpfulVotes] = useState<Set<string>>(new Set());

  const [newReview, setNewReview] = useState({ rating: 0, title: '', body: '' });

  const distribution = getRatingDistribution(averageRating);
  const total = Object.values(distribution).reduce((s, v) => s + v, 0);

  let reviews = [...MOCK_REVIEWS];
  if (filterStar) reviews = reviews.filter((r) => r.rating === filterStar);
  reviews.sort((a, b) => {
    if (sortBy === 'recent') return new Date(b.date).getTime() - new Date(a.date).getTime();
    if (sortBy === 'helpful') return b.helpful - a.helpful;
    if (sortBy === 'high') return b.rating - a.rating;
    return a.rating - b.rating;
  });

  const handleSubmit = () => {
    if (newReview.rating === 0 || !newReview.body.trim()) return;
    setSubmitted(true);
  };

  const toggleHelpful = (id: string) => {
    setHelpfulVotes((prev) => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="flex items-start gap-8 p-4 bg-white/5 rounded-xl border border-white/10">
        <div className="text-center flex-shrink-0">
          <p className="text-5xl font-bold text-white">{averageRating.toFixed(1)}</p>
          <StarDisplay rating={averageRating} size={16} />
          <p className="text-gray-500 text-xs mt-1">{reviewCount} reviews</p>
        </div>
        <div className="flex-1 space-y-1">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = distribution[star] ?? 0;
            const pct = total > 0 ? (count / total) * 100 : 0;
            return (
              <button
                key={star}
                onClick={() => setFilterStar(filterStar === star ? null : star)}
                className="flex items-center gap-2 w-full group"
              >
                <span className="text-gray-400 text-xs w-3">{star}</span>
                <Star size={10} className="text-[#d4af37] fill-[#d4af37] flex-shrink-0" />
                <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${filterStar === star ? 'bg-[#d4af37]' : 'bg-[#d4af37]/60 group-hover:bg-[#d4af37]'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-gray-500 text-xs w-4 text-right">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          {filterStar && (
            <button
              onClick={() => setFilterStar(null)}
              className="flex items-center gap-1 px-2 py-1 bg-[#d4af37]/20 border border-[#d4af37]/40 rounded-full text-[#d4af37] text-xs"
            >
              {filterStar}★ only <span className="ml-0.5">×</span>
            </button>
          )}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="appearance-none bg-[#0a0a0a] border border-white/15 rounded-lg pl-3 pr-7 py-1.5 text-white text-xs focus:outline-none focus:border-[#d4af37]/40"
            >
              <option value="helpful">Most Helpful</option>
              <option value="recent">Most Recent</option>
              <option value="high">Highest Rated</option>
              <option value="low">Lowest Rated</option>
            </select>
            <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          </div>
        </div>
        {!submitted && (
          <button
            onClick={() => setShowWriteForm(!showWriteForm)}
            className="px-3 py-1.5 bg-[#d4af37]/15 border border-[#d4af37]/40 text-[#d4af37] text-xs rounded-lg hover:bg-[#d4af37]/25 transition-colors"
          >
            + Write a Review
          </button>
        )}
      </div>

      {/* Write Review Form */}
      {showWriteForm && !submitted && (
        <div className="p-4 bg-[#0a0a0a] rounded-xl border border-[#d4af37]/20 space-y-3">
          <h4 className="text-white text-sm font-semibold">Your Review</h4>
          <StarInput value={newReview.rating} onChange={(r) => setNewReview((p) => ({ ...p, rating: r }))} />
          <input
            type="text"
            placeholder="Review title"
            value={newReview.title}
            onChange={(e) => setNewReview((p) => ({ ...p, title: e.target.value }))}
            className="w-full bg-[#141414] border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#d4af37]/40"
          />
          <textarea
            rows={3}
            placeholder="Share your experience with this item and maker…"
            value={newReview.body}
            onChange={(e) => setNewReview((p) => ({ ...p, body: e.target.value }))}
            className="w-full bg-[#141414] border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#d4af37]/40 resize-none"
          />
          <div className="flex items-center justify-between">
            <button className="flex items-center gap-1.5 text-gray-500 hover:text-gray-300 text-xs transition-colors">
              <Camera size={13} /> Add photos
            </button>
            <button
              onClick={handleSubmit}
              disabled={newReview.rating === 0 || !newReview.body.trim()}
              className="px-4 py-1.5 bg-[#d4af37] text-black text-sm font-semibold rounded-lg hover:bg-[#e5c84a] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Submit Review
            </button>
          </div>
        </div>
      )}

      {submitted && (
        <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-xl">
          <Check size={16} className="text-green-400" />
          <p className="text-green-300 text-sm">Your review has been submitted and is pending approval. Thank you!</p>
        </div>
      )}

      {/* Review list */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="p-4 bg-white/3 rounded-xl border border-white/8">
            {/* Author row */}
            <div className="flex items-center gap-2 mb-2">
              <img src={review.authorAvatar} alt={review.author} className="w-8 h-8 rounded-full object-cover" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-white text-sm font-medium">{review.author}</span>
                  {review.nation && (
                    <span className="text-xs text-gray-500 bg-white/5 px-1.5 py-0.5 rounded">{review.nation}</span>
                  )}
                  {review.verified && (
                    <span className="flex items-center gap-0.5 text-xs text-green-400">
                      <Check size={10} /> Verified
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <StarDisplay rating={review.rating} size={11} />
                  <span className="text-gray-600 text-xs">{new Date(review.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                </div>
              </div>
            </div>

            {review.title && <p className="text-white text-sm font-medium mb-1">{review.title}</p>}
            <p className="text-gray-300 text-sm leading-relaxed">{review.body}</p>

            {/* Review photos */}
            {review.photos && review.photos.length > 0 && (
              <div className="flex gap-2 mt-2">
                {review.photos.map((ph, i) => (
                  <img key={i} src={ph} alt="Review" className="w-16 h-16 rounded-lg object-cover border border-white/10" />
                ))}
              </div>
            )}

            {/* Maker reply */}
            {review.makerReply && (
              <div className="mt-3 pl-3 border-l-2 border-[#d4af37]/40">
                <p className="text-[#d4af37] text-xs font-medium mb-0.5">{makerName} replied:</p>
                <p className="text-gray-400 text-xs leading-relaxed">{review.makerReply}</p>
              </div>
            )}

            {/* Helpful */}
            <div className="flex items-center gap-3 mt-3">
              <button
                onClick={() => toggleHelpful(review.id)}
                className={`flex items-center gap-1 text-xs transition-colors ${
                  helpfulVotes.has(review.id) ? 'text-[#d4af37]' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                <ThumbsUp size={12} />
                Helpful ({review.helpful + (helpfulVotes.has(review.id) ? 1 : 0)})
              </button>
              <button className="text-gray-600 hover:text-gray-400 text-xs flex items-center gap-1 transition-colors">
                <Flag size={11} /> Report
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
