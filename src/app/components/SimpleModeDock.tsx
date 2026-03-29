'use client';

import Link from 'next/link';
import { ChevronLeft, ChevronRight, Headphones, HelpCircle, Mic, Volume2, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

export default function SimpleModeDock({
  title = 'Need help now?',
  tips = []
}: {
  title?: string;
  tips?: string[];
}) {
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [tipIndex, setTipIndex] = useState(0);
  const [speaking, setSpeaking] = useState(false);
  const hasSpeech = typeof window !== 'undefined' && 'speechSynthesis' in window;
  const helperTips = useMemo(
    () => (tips.length > 0 ? tips : ['Say what you want to share, then save and keep going.']),
    [tips]
  );
  const activeTip = helperTips[Math.min(tipIndex, helperTips.length - 1)] ?? helperTips[0];

  useEffect(() => {
    if (tipIndex > helperTips.length - 1) {
      setTipIndex(0);
    }
  }, [helperTips.length, tipIndex]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const syncMobileState = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setOpen((current) => (mobile ? true : current));
    };
    syncMobileState();
    window.addEventListener('resize', syncMobileState);
    return () => window.removeEventListener('resize', syncMobileState);
  }, []);

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speakTip = () => {
    if (!hasSpeech || !activeTip) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(activeTip);
    utterance.rate = 0.92;
    utterance.pitch = 1;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className={`fixed z-[70] flex flex-col gap-3 ${isMobile ? 'inset-x-3 bottom-3 items-stretch max-w-none' : 'bottom-4 right-4 items-end max-w-[300px]'}`}>
      {open ? (
        <div className={`w-full rounded-2xl border border-[#d4af37]/20 bg-[#101010]/95 p-4 text-white shadow-[0_24px_60px_rgba(0,0,0,0.4)] backdrop-blur ${isMobile ? 'rounded-[24px] p-5' : ''}`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] text-[#d4af37]">Simple help</p>
              <h3 className="mt-2 text-base font-semibold">{title}</h3>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full border border-white/10 p-2 text-gray-400 hover:text-white"
              aria-label="Close helper"
            >
              <X size={14} />
            </button>
          </div>

          <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-3">
            <div className="flex items-center justify-between gap-2 text-[11px] uppercase tracking-[0.18em] text-[#d4af37]">
              <span>Right now</span>
              {helperTips.length > 1 ? <span>{tipIndex + 1}/{helperTips.length}</span> : null}
            </div>
            <p className={`mt-2 text-gray-200 ${isMobile ? 'text-base leading-7' : 'text-sm leading-6'}`}>{activeTip}</p>

            {helperTips.length > 1 ? (
              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setTipIndex((current) => (current - 1 + helperTips.length) % helperTips.length)}
                  className={`inline-flex items-center gap-1 rounded-full border border-white/10 text-gray-300 hover:text-white ${isMobile ? 'px-4 py-2 text-sm' : 'px-3 py-1.5 text-xs'}`}
                >
                  <ChevronLeft size={12} />
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setTipIndex((current) => (current + 1) % helperTips.length)}
                  className={`inline-flex items-center gap-1 rounded-full border border-white/10 text-gray-300 hover:text-white ${isMobile ? 'px-4 py-2 text-sm' : 'px-3 py-1.5 text-xs'}`}
                >
                  Next
                  <ChevronRight size={12} />
                </button>
              </div>
            ) : null}
          </div>

          <div className={`mt-4 flex flex-wrap gap-2 ${isMobile ? 'gap-3' : ''}`}>
            <Link
              href="/help"
              className={`inline-flex items-center gap-2 rounded-full bg-[#d4af37] font-semibold text-black ${isMobile ? 'px-5 py-3 text-sm' : 'px-4 py-2 text-sm'}`}
            >
              <Headphones size={14} />
              Get help
            </Link>
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className={`inline-flex items-center gap-2 rounded-full border border-white/10 text-gray-300 hover:text-white ${isMobile ? 'px-5 py-3 text-sm' : 'px-4 py-2 text-sm'}`}
            >
              <Mic size={14} />
              Use voice
            </button>
            <button
              type="button"
              onClick={speakTip}
              disabled={!hasSpeech}
              className={`inline-flex items-center gap-2 rounded-full border border-white/10 text-gray-300 hover:text-white disabled:cursor-not-allowed disabled:opacity-50 ${isMobile ? 'px-5 py-3 text-sm' : 'px-4 py-2 text-sm'}`}
            >
              <Volume2 size={14} />
              {speaking ? 'Reading...' : 'Read this'}
            </button>
          </div>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={`inline-flex items-center gap-2 rounded-full border border-[#d4af37]/30 bg-[#101010]/95 text-sm font-semibold text-[#f3ddb1] shadow-[0_18px_40px_rgba(0,0,0,0.35)] backdrop-blur ${isMobile ? 'self-stretch justify-center px-5 py-3.5' : 'px-4 py-3'}`}
      >
        <HelpCircle size={16} />
        {title}
      </button>
    </div>
  );
}
