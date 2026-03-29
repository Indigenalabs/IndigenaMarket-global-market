'use client';

import { useState } from 'react';
import { Star, ThumbsUp, Flag, X, CheckCircle } from 'lucide-react';

interface Review {
  id: string;
  orderId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  rating: number;
  comment: string;
  serviceTitle: string;
  tierPurchased: string;
  date: string;
  helpful: number;
  response?: {
    freelancerName: string;
    comment: string;
    date: string;
  };
}

interface ServiceReviewSystemProps {
  serviceId: string;
  freelancerName: string;
  reviews: Review[];
  canReview?: boolean;
  onSubmitReview?: (rating: number, comment: string) => void;
}

export default function ServiceReviewSystem({
  serviceId,
  freelancerName,
  reviews,
  canReview = false,
  onSubmitReview
}: ServiceReviewSystemProps) {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  const ratingDistribution = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
    percentage: reviews.length > 0 
      ? (reviews.filter(r => r.rating === star).length / reviews.length) * 100 
      : 0
  }));

  const handleSubmit = async () => {
    if (rating === 0 || !comment.trim()) return;
    
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    onSubmitReview?.(rating, comment);
    setSubmitted(true);
    setIsSubmitting(false);
  };

  return (
    <div className="bg-[#141414] border border-[#d4af37]/20 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-white/5">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-semibold">Reviews ({reviews.length})</h3>
          {canReview && !submitted && (
            <button
              onClick={() => setShowReviewForm(true)}
              className="px-4 py-2 bg-[#d4af37] text-black text-sm font-medium rounded-lg hover:bg-[#f4e4a6] transition-colors"
            >
              Write a Review
            </button>
          )}
        </div>
      </div>

      {/* Rating Summary */}
      <div className="p-4 border-b border-white/5 bg-[#0f0f0f]">
        <div className="flex gap-6">
          {/* Overall Rating */}
          <div className="text-center">
            <p className="text-4xl font-bold text-[#d4af37]">{avgRating}</p>
            <div className="flex items-center justify-center gap-0.5 mt-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  className={i < Math.round(parseFloat(avgRating)) ? 'text-[#d4af37] fill-[#d4af37]' : 'text-gray-600'}
                />
              ))}
            </div>
            <p className="text-gray-500 text-xs mt-1">{reviews.length} reviews</p>
          </div>

          {/* Distribution */}
          <div className="flex-1">
            {ratingDistribution.map(({ star, count, percentage }) => (
              <div key={star} className="flex items-center gap-2 text-xs">
                <span className="text-gray-400 w-3">{star}</span>
                <Star size={10} className="text-[#d4af37] fill-[#d4af37]" />
                <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#d4af37] transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-gray-500 w-6 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Review Form Modal */}
      {showReviewForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#141414] border border-[#d4af37]/30 rounded-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-white/5">
              <h3 className="text-white font-semibold">Write a Review</h3>
              <button onClick={() => setShowReviewForm(false)} className="text-gray-500 hover:text-white">
                <X size={18} />
              </button>
            </div>
            <div className="p-4 space-y-4">
              {/* Star Rating */}
              <div>
                <label className="text-white text-sm font-medium mb-2 block">Your Rating</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className="p-1 transition-transform hover:scale-110"
                    >
                      <Star
                        size={28}
                        className={star <= rating ? 'text-[#d4af37] fill-[#d4af37]' : 'text-gray-600'}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment */}
              <div>
                <label className="text-white text-sm font-medium mb-2 block">Your Review</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={`Share your experience working with ${freelancerName}...`}
                  className="w-full h-32 bg-[#0f0f0f] border border-white/10 rounded-xl p-4 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#d4af37] resize-none"
                />
              </div>

              <button
                onClick={handleSubmit}
                disabled={rating === 0 || !comment.trim() || isSubmitting}
                className="w-full py-3 bg-gradient-to-r from-[#d4af37] to-[#b8941f] text-black font-semibold rounded-xl hover:shadow-lg hover:shadow-[#d4af37]/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submitted Confirmation */}
      {submitted && (
        <div className="p-4 bg-green-500/10 border-b border-white/5">
          <div className="flex items-center gap-2 text-green-400 text-sm">
            <CheckCircle size={16} />
            <span>Thank you! Your review has been submitted.</span>
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="divide-y divide-white/5">
        {reviews.map((review) => (
          <div key={review.id} className="p-4">
            <div className="flex items-start gap-3 mb-3">
              <img
                src={review.authorAvatar}
                alt={review.authorName}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-white font-medium text-sm">{review.authorName}</p>
                  <span className="text-gray-500 text-xs">{review.date}</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={10}
                        className={i < review.rating ? 'text-[#d4af37] fill-[#d4af37]' : 'text-gray-600'}
                      />
                    ))}
                  </div>
                  <span className="text-gray-500 text-xs">• {review.tierPurchased}</span>
                </div>
              </div>
            </div>

            <p className="text-gray-300 text-sm mb-3">{review.comment}</p>

            <div className="flex items-center gap-4 text-xs">
              <button className="flex items-center gap-1 text-gray-500 hover:text-[#d4af37] transition-colors">
                <ThumbsUp size={12} />
                Helpful ({review.helpful})
              </button>
              <button className="flex items-center gap-1 text-gray-500 hover:text-red-400 transition-colors">
                <Flag size={12} />
                Report
              </button>
            </div>

            {/* Freelancer Response */}
            {review.response && (
              <div className="mt-3 ml-4 pl-4 border-l-2 border-[#d4af37]/30 bg-[#0f0f0f] rounded-r-lg p-3">
                <p className="text-[#d4af37] text-xs font-medium mb-1">
                  Response from {review.response.freelancerName}
                </p>
                <p className="text-gray-400 text-sm">{review.response.comment}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Load More */}
      {reviews.length >= 5 && (
        <div className="p-4 text-center border-t border-white/5">
          <button className="text-[#d4af37] text-sm hover:underline">
            Load more reviews
          </button>
        </div>
      )}
    </div>
  );
}
