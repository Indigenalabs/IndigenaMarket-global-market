'use client';

import { useState } from 'react';
import { X, Star, Send, CheckCircle } from 'lucide-react';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: {
    id: string;
    title: string;
    thumbnail: string;
  };
}

export default function ReviewModal({ isOpen, onClose, course }: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = () => {
    // Mock submission
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setRating(0);
      setReview('');
      onClose();
    }, 2000);
  };

  const quickReviews = [
    'Excellent course! Highly recommended.',
    'Great content and well explained.',
    'Good course but could use more examples.',
    'Very informative and engaging.',
  ];

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-6">
      <div className="bg-[#141414] rounded-2xl border border-[#d4af37]/30 w-full max-w-lg">
        {submitted ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-green-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Review Submitted!</h3>
            <p className="text-gray-400">Thank you for sharing your feedback.</p>
          </div>
        ) : (
          <>
            <div className="p-6 border-b border-[#d4af37]/20 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Rate & Review</h3>
              <button onClick={onClose} className="p-2 text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <div className="flex gap-4 mb-6">
                <img src={course.thumbnail} alt={course.title} className="w-20 h-14 object-cover rounded-lg" />
                <div>
                  <p className="text-white font-medium">{course.title}</p>
                  <p className="text-gray-400 text-sm">Share your experience</p>
                </div>
              </div>

              <div className="text-center mb-6">
                <p className="text-gray-400 mb-3">How would you rate this course?</p>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className="p-1 transition-colors"
                    >
                      <Star
                        size={32}
                        className={`${
                          star <= (hoverRating || rating)
                            ? 'fill-[#d4af37] text-[#d4af37]'
                            : 'text-gray-600'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <p className="text-[#d4af37] mt-2">
                  {rating === 1 && 'Poor'}
                  {rating === 2 && 'Fair'}
                  {rating === 3 && 'Good'}
                  {rating === 4 && 'Very Good'}
                  {rating === 5 && 'Excellent'}
                </p>
              </div>

              <div className="mb-4">
                <textarea
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  placeholder="Write your review..."
                  rows={4}
                  className="w-full bg-[#0a0a0a] border border-[#d4af37]/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#d4af37] resize-none"
                />
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {quickReviews.map((text, i) => (
                  <button
                    key={i}
                    onClick={() => setReview(text)}
                    className="px-3 py-1.5 bg-[#0a0a0a] border border-[#d4af37]/20 rounded-full text-gray-400 text-sm hover:border-[#d4af37]/50 transition-colors"
                  >
                    {text}
                  </button>
                ))}
              </div>

              <button
                onClick={handleSubmit}
                disabled={rating === 0}
                className="w-full py-3 bg-gradient-to-r from-[#d4af37] to-[#b8941f] text-black font-medium rounded-lg hover:shadow-lg hover:shadow-[#d4af37]/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Send size={18} />
                Submit Review
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
