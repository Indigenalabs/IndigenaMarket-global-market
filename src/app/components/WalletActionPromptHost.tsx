'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, CheckCircle2, Loader2, Wallet } from 'lucide-react';

type PromptState = 'idle' | 'pending' | 'success' | 'error';

type PromptPayload = {
  state: Exclude<PromptState, 'idle'>;
  actionLabel: string;
  message: string;
};

const idlePrompt = {
  state: 'idle' as PromptState,
  actionLabel: '',
  message: ''
};

export default function WalletActionPromptHost() {
  const [prompt, setPrompt] = useState(idlePrompt);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    const onPrompt = (event: Event) => {
      const detail = (event as CustomEvent<PromptPayload>).detail;
      if (!detail) return;
      if (timer) clearTimeout(timer);
      setPrompt(detail);
      if (detail.state !== 'error') {
        timer = setTimeout(() => setPrompt(idlePrompt), detail.state === 'pending' ? 2500 : 2200);
      }
    };

    window.addEventListener('indigena-wallet-action-prompt', onPrompt as EventListener);
    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener('indigena-wallet-action-prompt', onPrompt as EventListener);
    };
  }, []);

  const styles = useMemo(() => {
    if (prompt.state === 'pending') {
      return {
        border: 'border-[#d4af37]/35',
        bg: 'bg-[#111111]/96',
        icon: <Loader2 size={18} className="animate-spin text-[#d4af37]" />
      };
    }
    if (prompt.state === 'success') {
      return {
        border: 'border-emerald-500/35',
        bg: 'bg-[#0f1713]/96',
        icon: <CheckCircle2 size={18} className="text-emerald-400" />
      };
    }
    if (prompt.state === 'error') {
      return {
        border: 'border-[#DC143C]/35',
        bg: 'bg-[#160d0f]/96',
        icon: <AlertCircle size={18} className="text-[#ff8f8f]" />
      };
    }
    return {
      border: '',
      bg: '',
      icon: <Wallet size={18} />
    };
  }, [prompt.state]);

  if (prompt.state === 'idle') return null;

  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-[100] w-[min(92vw,380px)]">
      <div className={`pointer-events-auto rounded-2xl border ${styles.border} ${styles.bg} p-4 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl`}>
        <div className="flex items-start gap-3">
          <div className="mt-0.5">{styles.icon}</div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] uppercase tracking-[0.22em] text-[#d4af37]/75">Wallet Required</p>
            <p className="mt-1 text-sm font-medium text-white">{prompt.message}</p>
            {prompt.state === 'error' && (
              <div className="mt-3 flex flex-wrap gap-2">
                <Link
                  href="/wallet"
                  className="rounded-full border border-[#d4af37]/35 px-3 py-1.5 text-xs font-medium text-[#d4af37] hover:bg-[#d4af37]/10"
                >
                  Open Wallet Page
                </Link>
                <button
                  type="button"
                  onClick={() => setPrompt(idlePrompt)}
                  className="rounded-full border border-white/10 px-3 py-1.5 text-xs font-medium text-gray-300 hover:bg-white/5"
                >
                  Dismiss
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
