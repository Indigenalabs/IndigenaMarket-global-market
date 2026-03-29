'use client';

import { useState } from 'react';
import { 
  Heart, Share2, MessageCircle, Flag, Link2, Twitter, Facebook, 
  Send, MoreHorizontal, User, Clock, ThumbsUp
} from 'lucide-react';

interface Comment {
  id: string;
  author: string;
  avatar?: string;
  content: string;
  timestamp: string;
  likes: number;
  isLiked?: boolean;
  replies?: Comment[];
}

interface SocialFeaturesProps {
  artworkId: string;
  likes: number;
  isLiked?: boolean;
  comments?: Comment[];
  onLike: () => void;
  onUnlike: () => void;
  onShare: (platform: string) => void;
  onComment: (content: string) => void;
  onReport: () => void;
}

export default function SocialFeatures({
  artworkId,
  likes,
  isLiked = false,
  comments = [],
  onLike,
  onUnlike,
  onShare,
  onComment,
  onReport
}: SocialFeaturesProps) {
  const [liked, setLiked] = useState(isLiked);
  const [likeCount, setLikeCount] = useState(likes);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);

  const handleLike = () => {
    if (liked) {
      setLikeCount(prev => prev - 1);
      onUnlike();
    } else {
      setLikeCount(prev => prev + 1);
      onLike();
    }
    setLiked(!liked);
  };

  const handleShare = (platform: string) => {
    onShare(platform);
    setShowShareMenu(false);
  };

  const handleComment = () => {
    if (newComment.trim()) {
      onComment(newComment);
      setNewComment('');
    }
  };

  return (
    <div className="space-y-4">
      {/* Action Bar */}
      <div className="flex items-center justify-between p-4 bg-[#141414] rounded-xl border border-[#d4af37]/20">
        <div className="flex items-center gap-4">
          {/* Like Button */}
          <button 
            onClick={handleLike}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
              liked 
                ? 'bg-[#DC143C] text-white' 
                : 'bg-[#0a0a0a] text-gray-400 hover:text-[#DC143C]'
            }`}
          >
            <Heart size={18} fill={liked ? 'currentColor' : 'none'} />
            <span className="font-medium">{likeCount}</span>
          </button>

          {/* Comment Button */}
          <button 
            onClick={() => setShowComments(!showComments)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
              showComments 
                ? 'bg-[#d4af37] text-black' 
                : 'bg-[#0a0a0a] text-gray-400 hover:text-white'
            }`}
          >
            <MessageCircle size={18} />
            <span className="font-medium">{comments.length}</span>
          </button>

          {/* Share Button */}
          <div className="relative">
            <button 
              onClick={() => setShowShareMenu(!showShareMenu)}
              className="flex items-center gap-2 px-4 py-2 bg-[#0a0a0a] rounded-full text-gray-400 hover:text-[#d4af37] transition-colors"
            >
              <Share2 size={18} />
              <span className="font-medium">Share</span>
            </button>

            {/* Share Menu */}
            {showShareMenu && (
              <div className="absolute top-full left-0 mt-2 p-2 bg-[#141414] rounded-xl border border-[#d4af37]/20 shadow-xl z-10 min-w-[160px]">
                <button 
                  onClick={() => handleShare('copy')}
                  className="w-full flex items-center gap-3 px-3 py-2 text-gray-300 hover:text-white hover:bg-[#0a0a0a] rounded-lg transition-colors text-left"
                >
                  <Link2 size={16} />
                  Copy Link
                </button>
                <button 
                  onClick={() => handleShare('twitter')}
                  className="w-full flex items-center gap-3 px-3 py-2 text-gray-300 hover:text-white hover:bg-[#0a0a0a] rounded-lg transition-colors text-left"
                >
                  <Twitter size={16} />
                  Twitter
                </button>
                <button 
                  onClick={() => handleShare('facebook')}
                  className="w-full flex items-center gap-3 px-3 py-2 text-gray-300 hover:text-white hover:bg-[#0a0a0a] rounded-lg transition-colors text-left"
                >
                  <Facebook size={16} />
                  Facebook
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Report Button */}
        <button 
          onClick={() => setShowReportModal(true)}
          className="p-2 text-gray-400 hover:text-[#DC143C] transition-colors"
        >
          <Flag size={18} />
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="p-4 bg-[#141414] rounded-xl border border-[#d4af37]/20 space-y-4">
          <h3 className="text-white font-semibold">Comments ({comments.length})</h3>

          {/* Comment Input */}
          <div className="flex gap-3">
            <div className="w-10 h-10 bg-[#d4af37]/20 rounded-full flex items-center justify-center flex-shrink-0">
              <User size={20} className="text-[#d4af37]" />
            </div>
            <div className="flex-1 flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 bg-[#0a0a0a] border border-[#d4af37]/30 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#d4af37]"
                onKeyPress={(e) => e.key === 'Enter' && handleComment()}
              />
              <button 
                onClick={handleComment}
                disabled={!newComment.trim()}
                className="px-4 py-2 bg-[#d4af37] text-black font-medium rounded-lg hover:bg-[#f4e4a6] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={18} />
              </button>
            </div>
          </div>

          {/* Comments List */}
          <div className="space-y-4 max-h-80 overflow-y-auto">
            {comments.length === 0 ? (
              <p className="text-center text-gray-400 py-4">No comments yet. Be the first to comment!</p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <div className="w-10 h-10 bg-[#0a0a0a] rounded-full flex items-center justify-center flex-shrink-0">
                    <User size={20} className="text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white font-medium">{comment.author}</span>
                      <span className="text-gray-500 text-xs flex items-center gap-1">
                        <Clock size={12} />
                        {comment.timestamp}
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm mb-2">{comment.content}</p>
                    <div className="flex items-center gap-4">
                      <button className="flex items-center gap-1 text-gray-400 text-xs hover:text-[#d4af37] transition-colors">
                        <ThumbsUp size={12} />
                        {comment.likes}
                      </button>
                      <button className="text-gray-400 text-xs hover:text-white transition-colors">
                        Reply
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#141414] rounded-xl p-6 border border-[#d4af37]/20">
            <h3 className="text-xl font-bold text-white mb-4">Report Artwork</h3>
            <p className="text-gray-400 text-sm mb-4">
              Please select a reason for reporting this artwork. Our team will review it within 24 hours.
            </p>
            
            <div className="space-y-2 mb-6">
              {['Inappropriate content', 'Copyright infringement', 'Misleading information', 'Spam', 'Other'].map((reason) => (
                <button 
                  key={reason}
                  className="w-full text-left px-4 py-3 bg-[#0a0a0a] rounded-lg text-gray-300 hover:bg-[#d4af37]/10 hover:text-[#d4af37] transition-colors"
                >
                  {reason}
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setShowReportModal(false)}
                className="flex-1 py-3 bg-[#0a0a0a] text-white font-medium rounded-lg hover:bg-[#1a1a1a] transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => { onReport(); setShowReportModal(false); }}
                className="flex-1 py-3 bg-[#DC143C] text-white font-semibold rounded-lg hover:bg-[#ff1a1a] transition-colors"
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
