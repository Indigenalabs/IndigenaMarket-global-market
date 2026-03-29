'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, X, ChevronLeft, ChevronRight, Heart, Send, Pause, Play } from 'lucide-react';

interface Story {
  id: string;
  user: {
    name: string;
    avatar: string;
    verified?: boolean;
  };
  image: string;
  type: 'image' | 'video';
  viewed: boolean;
  timestamp: string;
  isMine?: boolean;
}

interface StoryUser {
  id: string;
  name: string;
  avatar: string;
  verified?: boolean;
}

interface StoryGroup {
  user: StoryUser;
  stories: Story[];
}

const storyGroups: StoryGroup[] = [
  {
    user: { id: 'user-me', name: 'Your Story', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop' },
    stories: []
  },
  {
    user: { id: 'user-1', name: 'Maria Redfeather', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop', verified: true },
    stories: [
      { id: 'story-1-1', user: { name: 'Maria Redfeather', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop', verified: true }, image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=600&fit=crop', type: 'image', viewed: false, timestamp: '1h ago' },
      { id: 'story-1-2', user: { name: 'Maria Redfeather', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop', verified: true }, image: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=400&h=600&fit=crop', type: 'image', viewed: false, timestamp: '1h ago' }
    ]
  },
  {
    user: { id: 'user-2', name: 'ThunderVoice', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop', verified: true },
    stories: [
      { id: 'story-2-1', user: { name: 'ThunderVoice', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop', verified: true }, image: 'https://images.unsplash.com/photo-1549887534-1541e9326642?w=400&h=600&fit=crop', type: 'video', viewed: false, timestamp: '30m ago' }
    ]
  },
  {
    user: { id: 'user-3', name: 'Elena Rivers', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop' },
    stories: [
      { id: 'story-3-1', user: { name: 'Elena Rivers', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop' }, image: 'https://images.unsplash.com/photo-1515405295579-ba7b45403062?w=400&h=600&fit=crop', type: 'image', viewed: true, timestamp: '4h ago' },
      { id: 'story-3-2', user: { name: 'Elena Rivers', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop' }, image: 'https://images.unsplash.com/photo-1549887534-1541e9326642?w=400&h=600&fit=crop', type: 'image', viewed: true, timestamp: '4h ago' },
      { id: 'story-3-3', user: { name: 'Elena Rivers', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop' }, image: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=400&h=600&fit=crop', type: 'image', viewed: true, timestamp: '4h ago' }
    ]
  },
  {
    user: { id: 'user-4', name: 'DesertRose', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop' },
    stories: [
      { id: 'story-4-1', user: { name: 'DesertRose', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop' }, image: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=400&h=600&fit=crop', type: 'image', viewed: true, timestamp: '6h ago' }
    ]
  },
  {
    user: { id: 'user-5', name: 'MountainEagle', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop' },
    stories: [
      { id: 'story-5-1', user: { name: 'MountainEagle', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop' }, image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&h=600&fit=crop', type: 'video', viewed: false, timestamp: '15m ago' },
      { id: 'story-5-2', user: { name: 'MountainEagle', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop' }, image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=600&fit=crop', type: 'image', viewed: false, timestamp: '15m ago' }
    ]
  },
  {
    user: { id: 'user-6', name: 'RiverSong', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop' },
    stories: [
      { id: 'story-6-1', user: { name: 'RiverSong', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop' }, image: 'https://images.unsplash.com/photo-1578321272176-b7bbc0679853?w=400&h=600&fit=crop', type: 'image', viewed: true, timestamp: '8h ago' }
    ]
  }
];

// Flatten stories for viewing
const allStories: Story[] = storyGroups.flatMap(g => g.stories);

export default function StoriesBar() {
  const [activeStory, setActiveStory] = useState<Story | null>(null);
  const [viewedStories, setViewedStories] = useState<Set<string>>(new Set());
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [message, setMessage] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const STORY_DURATION = 5000; // 5 seconds per story

  const handleStoryClick = (story: Story) => {
    if (story.isMine) {
      setShowCreateModal(true);
    } else {
      setActiveStory(story);
      setViewedStories(prev => new Set([...prev, story.id]));
      setProgress(0);
    }
  };

  const handleClose = useCallback(() => {
    setActiveStory(null);
    setProgress(0);
    setMessage('');
  }, []);

  // Get next story for the same user or move to next user
  const getNextStory = useCallback(() => {
    if (!activeStory) return null;
    
    const currentGroup = storyGroups.find(g => g.user.name === activeStory.user.name);
    if (!currentGroup) return null;
    
    const currentStoryIndex = currentGroup.stories.findIndex(s => s.id === activeStory.id);
    const nextStoryInGroup = currentGroup.stories[currentStoryIndex + 1];
    
    if (nextStoryInGroup) {
      // Same user has more stories
      return nextStoryInGroup;
    } else {
      // Move to next user's first story
      const currentGroupIndex = storyGroups.findIndex(g => g.user.name === activeStory.user.name);
      const nextGroup = storyGroups[currentGroupIndex + 1];
      if (nextGroup && nextGroup.stories.length > 0) {
        return nextGroup.stories[0];
      }
    }
    return null;
  }, [activeStory]);

  // Get previous story for the same user or move to prev user
  const getPrevStory = useCallback(() => {
    if (!activeStory) return null;
    
    const currentGroup = storyGroups.find(g => g.user.name === activeStory.user.name);
    if (!currentGroup) return null;
    
    const currentStoryIndex = currentGroup.stories.findIndex(s => s.id === activeStory.id);
    const prevStoryInGroup = currentGroup.stories[currentStoryIndex - 1];
    
    if (prevStoryInGroup) {
      // Same user has previous stories
      return prevStoryInGroup;
    } else {
      // Move to previous user's last story
      const currentGroupIndex = storyGroups.findIndex(g => g.user.name === activeStory.user.name);
      const prevGroup = storyGroups[currentGroupIndex - 1];
      if (prevGroup && prevGroup.stories.length > 0) {
        return prevGroup.stories[prevGroup.stories.length - 1];
      }
    }
    return null;
  }, [activeStory]);

  const handleNext = useCallback(() => {
    const nextStory = getNextStory();
    if (nextStory) {
      setActiveStory(nextStory);
      setViewedStories(prev => new Set([...prev, nextStory.id]));
      setProgress(0);
    } else {
      handleClose();
    }
  }, [getNextStory, handleClose]);

  const handlePrev = useCallback(() => {
    const prevStory = getPrevStory();
    if (prevStory) {
      setActiveStory(prevStory);
      setProgress(0);
    }
  }, [getPrevStory]);

  // Auto-advance story
  useEffect(() => {
    if (!activeStory || isPaused) return;

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + (100 / (STORY_DURATION / 100));
      });
    }, 100);

    return () => clearInterval(interval);
  }, [activeStory, isPaused, handleNext]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!activeStory) return;
      
      switch (e.key) {
        case 'ArrowRight':
        case ' ':
          handleNext();
          break;
        case 'ArrowLeft':
          handlePrev();
          break;
        case 'Escape':
          handleClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeStory, handleNext, handlePrev, handleClose]);

  // Touch/swipe support
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    setIsPaused(true);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    setIsPaused(false);
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      handlePrev();
    }
  };

  return (
    <>
      {/* Stories Bar */}
      <div className="bg-[#141414] rounded-xl border border-[#d4af37]/10 p-4 mb-6">
        <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide pb-2">
          {storyGroups.map((group) => {
            const isMine = group.user.id === 'user-me';
            const hasStories = group.stories.length > 0;
            const allViewed = hasStories && group.stories.every(s => viewedStories.has(s.id) || s.viewed);
            const storyCount = group.stories.length;
            
            return (
              <button
                key={group.user.id}
                onClick={() => isMine ? setShowCreateModal(true) : handleStoryClick(group.stories[0])}
                className="flex flex-col items-center gap-2 flex-shrink-0 group"
              >
                <div className={`relative w-16 h-16 rounded-full p-0.5 ${
                  isMine 
                    ? 'bg-gray-600' 
                    : allViewed 
                      ? 'bg-gray-600' 
                      : 'bg-gradient-to-br from-[#d4af37] via-[#f4e4a6] to-[#b8941f]'
                }`}>
                  <div className="w-full h-full rounded-full overflow-hidden border-2 border-[#141414]">
                    <img 
                      src={group.user.avatar}
                      alt={group.user.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                    />
                  </div>
                  {isMine && (
                    <div className="absolute bottom-0 right-0 w-5 h-5 bg-[#d4af37] rounded-full flex items-center justify-center border-2 border-[#141414]">
                      <Plus size={12} className="text-black" />
                    </div>
                  )}
                  {/* Story count indicator */}
                  {!isMine && storyCount > 1 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#DC143C] rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-[#141414]">
                      {storyCount}
                    </div>
                  )}
                  {/* Video indicator */}
                  {!isMine && hasStories && group.stories.some(s => s.type === 'video') && storyCount === 1 && (
                    <div className="absolute top-0 right-0 w-4 h-4 bg-[#DC143C] rounded-full flex items-center justify-center">
                      <div className="w-0 h-0 border-l-[5px] border-l-white border-t-[3px] border-t-transparent border-b-[3px] border-b-transparent ml-0.5" />
                    </div>
                  )}
                </div>
                <span className={`text-xs truncate max-w-[64px] ${
                  allViewed && !isMine ? 'text-gray-500' : 'text-white'
                }`}>
                  {isMine ? 'Add Story' : group.user.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Create Story Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center p-4">
          <div className="bg-[#141414] rounded-2xl border border-[#d4af37]/20 p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Create Story</h3>
              <button 
                onClick={() => {
                  setShowCreateModal(false);
                  setSelectedFile(null);
                }}
                className="p-2 hover:bg-[#d4af37]/10 rounded-lg transition-colors"
              >
                <X size={24} className="text-gray-400" />
              </button>
            </div>

            {!selectedFile ? (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-[#d4af37]/30 rounded-xl p-8 text-center hover:border-[#d4af37] transition-colors cursor-pointer">
                  <input 
                    type="file" 
                    accept="image/*,video/*"
                    className="hidden"
                    id="story-upload"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const url = URL.createObjectURL(file);
                        setSelectedFile(url);
                      }
                    }}
                  />
                  <label htmlFor="story-upload" className="cursor-pointer">
                    <div className="w-16 h-16 bg-[#d4af37]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Plus size={32} className="text-[#d4af37]" />
                    </div>
                    <p className="text-white font-medium mb-2">Add Photo or Video</p>
                    <p className="text-gray-500 text-sm">Share a moment with your community</p>
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button className="flex items-center gap-2 p-4 bg-[#0a0a0a] rounded-xl hover:bg-[#1a1a1a] transition-colors">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-lg">Aa</span>
                    </div>
                    <span className="text-white text-sm">Text</span>
                  </button>
                  <button className="flex items-center gap-2 p-4 bg-[#0a0a0a] rounded-xl hover:bg-[#1a1a1a] transition-colors">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <span className="text-white text-sm">Camera</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative rounded-xl overflow-hidden aspect-[9/16] max-h-[400px]">
                  <img 
                    src={selectedFile}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <button 
                    onClick={() => setSelectedFile(null)}
                    className="absolute top-2 right-2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => {
                      setShowCreateModal(false);
                      setSelectedFile(null);
                    }}
                    className="flex-1 py-3 border border-[#d4af37]/30 rounded-xl text-[#d4af37] font-medium hover:bg-[#d4af37]/10 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => {
                      // Handle story creation
                      setShowCreateModal(false);
                      setSelectedFile(null);
                    }}
                    className="flex-1 py-3 bg-[#d4af37] text-black font-medium rounded-xl hover:bg-[#f4e4a6] transition-colors"
                  >
                    Share Story
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Story Viewer Modal */}
      {activeStory && (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
          {/* Close Button */}
          <button 
            onClick={handleClose}
            className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
          >
            <X size={24} />
          </button>

          {/* Navigation */}
          <button 
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <button 
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
          >
            <ChevronRight size={24} />
          </button>

          {/* Story Content */}
          <div className="relative w-full max-w-md h-[80vh]">
            {/* Progress Bars - Multiple for multi-story users */}
            <div className="absolute top-4 left-4 right-4 flex gap-1 z-10">
              {(() => {
                const currentGroup = storyGroups.find(g => g.user.name === activeStory.user.name);
                const storyCount = currentGroup?.stories.length || 1;
                const currentIndex = currentGroup?.stories.findIndex(s => s.id === activeStory.id) || 0;
                
                return currentGroup?.stories.map((story, idx) => {
                  const isCurrent = idx === currentIndex;
                  const isPast = idx < currentIndex;
                  
                  return (
                    <div key={story.id} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-white rounded-full transition-all duration-100 ease-linear"
                        style={{ 
                          width: isPast ? '100%' : isCurrent ? `${progress}%` : '0%'
                        }}
                      />
                    </div>
                  );
                });
              })()}
            </div>

            {/* Pause Button */}
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="absolute top-4 right-16 z-10 w-8 h-8 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            >
              {isPaused ? <Play size={16} /> : <Pause size={16} />}
            </button>

            {/* Header */}
            <div className="absolute top-8 left-4 right-4 flex items-center gap-3 z-10">
              <img 
                src={activeStory.user.avatar}
                alt={activeStory.user.name}
                className="w-10 h-10 rounded-full border-2 border-white"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-white font-semibold">{activeStory.user.name}</span>
                  {activeStory.user.verified && (
                    <div className="w-4 h-4 rounded-full bg-[#d4af37] flex items-center justify-center">
                      <svg className="w-3 h-3 text-black" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
                <span className="text-white/70 text-sm">{activeStory.timestamp}</span>
              </div>
            </div>

            {/* Image/Video */}
            <div 
              className="w-full h-full rounded-xl overflow-hidden"
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              <img 
                src={activeStory.image}
                alt="Story"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Tap Areas for Navigation */}
            <div className="absolute inset-y-0 left-0 w-1/3 z-5" onClick={handlePrev} />
            <div className="absolute inset-y-0 right-0 w-1/3 z-5" onClick={handleNext} />

            {/* Bottom Actions */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3 z-10">
              <div className="flex-1 relative">
                <input 
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onFocus={() => setIsPaused(true)}
                  onBlur={() => setIsPaused(false)}
                  placeholder="Send message..."
                  className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-3 pr-12 text-white placeholder-white/50 focus:outline-none focus:border-white/50"
                />
                {message && (
                  <button 
                    onClick={() => {
                      setMessage('');
                      // Handle send message
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-[#d4af37] rounded-full flex items-center justify-center text-black hover:bg-[#f4e4a6] transition-colors"
                  >
                    <Send size={14} />
                  </button>
                )}
              </div>
              <button 
                onClick={() => {
                  // Handle like story
                }}
                className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-[#DC143C] hover:text-white transition-colors"
              >
                <Heart size={24} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
