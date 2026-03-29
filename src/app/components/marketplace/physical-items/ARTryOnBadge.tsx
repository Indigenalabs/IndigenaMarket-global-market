'use client';

import { useState } from 'react';
import { Sparkles, X, Smartphone, Monitor, RotateCw } from 'lucide-react';

interface ARTryOnBadgeProps {
  itemTitle: string;
  itemImage: string;
  mockupType?: 'hand' | 'wall' | 'neck' | 'wrist';
}

const mockupImages: Record<string, string> = {
  hand: 'https://images.unsplash.com/photo-1533139502658-0198f920d8e8?w=600&h=600&fit=crop',
  wall: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=600&fit=crop',
  neck: 'https://images.unsplash.com/photo-1515347619252-60a4bf4fff4f?w=600&h=600&fit=crop',
  wrist: 'https://images.unsplash.com/photo-1587400486882-2a99a1d39ba5?w=600&h=600&fit=crop',
};

export default function ARTryOnBadge({ itemTitle, itemImage, mockupType = 'hand' }: ARTryOnBadgeProps) {
  const [showModal, setShowModal] = useState(false);
  const [activeView, setActiveView] = useState<'hand' | 'wall' | 'neck' | 'wrist'>(mockupType);
  const [rotating, setRotating] = useState(false);

  const handleRotate = () => {
    setRotating(true);
    setTimeout(() => setRotating(false), 600);
  };

  return (
    <>
      {/* Badge */}
      <button
        onClick={(e) => { e.stopPropagation(); setShowModal(true); }}
        className="flex items-center gap-1 px-2 py-1 bg-[#d4af37]/90 text-black text-xs font-bold rounded-full shadow-lg hover:bg-[#d4af37] transition-colors"
      >
        <Sparkles size={11} />
        AR Preview
      </button>

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-[#141414] rounded-2xl border border-[#d4af37]/30 w-full max-w-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#d4af37]/20">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-[#d4af37]" />
                <span className="text-white font-semibold">AR Try-On Preview</span>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* View Selector */}
            <div className="flex gap-2 p-4 pb-2">
              {(['hand', 'wrist', 'neck', 'wall'] as const).map((view) => (
                <button
                  key={view}
                  onClick={() => setActiveView(view)}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-lg capitalize transition-colors ${
                    activeView === view
                      ? 'bg-[#d4af37] text-black'
                      : 'bg-[#0a0a0a] text-gray-400 hover:text-white'
                  }`}
                >
                  {view}
                </button>
              ))}
            </div>

            {/* Composite Preview */}
            <div className="relative mx-4 mb-4 rounded-xl overflow-hidden aspect-square bg-[#0a0a0a]">
              {/* Background mockup */}
              <img
                src={mockupImages[activeView]}
                alt="AR mockup"
                className="w-full h-full object-cover opacity-80"
              />
              {/* Item overlay */}
              <div
                className={`absolute inset-0 flex items-center justify-center transition-transform ${
                  rotating ? 'rotate-12 scale-105' : ''
                } duration-500`}
              >
                <img
                  src={itemImage}
                  alt={itemTitle}
                  className="w-1/2 h-1/2 object-cover rounded-xl shadow-2xl opacity-90 mix-blend-multiply"
                />
              </div>

              {/* Controls */}
              <button
                onClick={handleRotate}
                className="absolute bottom-3 right-3 w-9 h-9 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-black/80 transition-colors"
              >
                <RotateCw size={16} className={rotating ? 'animate-spin' : ''} />
              </button>

              {/* Beta label */}
              <div className="absolute top-3 left-3 px-2 py-1 bg-[#d4af37]/90 text-black text-xs font-bold rounded-full">
                Preview Mode
              </div>
            </div>

            {/* CTA */}
            <div className="px-4 pb-4">
              <p className="text-gray-500 text-xs text-center mb-3">
                Full AR experience available on iOS 16+ and Android 12+
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button className="flex items-center justify-center gap-2 py-2.5 bg-[#0a0a0a] border border-[#d4af37]/20 rounded-xl text-gray-400 text-sm hover:border-[#d4af37]/50 transition-colors">
                  <Smartphone size={16} />
                  Open in AR App
                </button>
                <button className="flex items-center justify-center gap-2 py-2.5 bg-[#d4af37] rounded-xl text-black text-sm font-semibold hover:bg-[#f4e4a6] transition-colors">
                  <Monitor size={16} />
                  View Full Size
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
