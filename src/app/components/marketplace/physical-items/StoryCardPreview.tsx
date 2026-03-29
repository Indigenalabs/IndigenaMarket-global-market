'use client';

import { Quote } from 'lucide-react';

interface StoryCardPreviewProps {
  makerName: string;
  makerAvatar: string;
  nation: string;
  quote: string;
  isSacred: boolean;
  onOpenStory: () => void;
}

export default function StoryCardPreview({
  makerName,
  quote,
  isSacred,
  onOpenStory,
}: StoryCardPreviewProps) {
  return (
    <button
      onClick={onOpenStory}
      className="w-full text-left px-3 py-2 bg-[#d4af37]/5 rounded-lg border border-[#d4af37]/15 hover:border-[#d4af37]/40 transition-all group"
    >
      <div className="flex items-start gap-1.5">
        <Quote size={11} className="text-[#d4af37] mt-0.5 flex-shrink-0" />
        <p className="text-gray-400 text-xs leading-relaxed line-clamp-2 group-hover:text-gray-200 transition-colors italic">
          {quote}
        </p>
      </div>
      <div className="flex items-center justify-between mt-1.5">
        <span className="text-gray-600 text-[10px]">— {makerName}</span>
        <div className="flex items-center gap-1.5">
          {isSacred && (
            <span className="px-1.5 py-0.5 bg-[#DC143C]/20 text-[#DC143C] text-[10px] rounded-full">Sacred</span>
          )}
          <span className="text-[#d4af37] text-[10px] font-medium group-hover:underline">Read Story →</span>
        </div>
      </div>
    </button>
  );
}
