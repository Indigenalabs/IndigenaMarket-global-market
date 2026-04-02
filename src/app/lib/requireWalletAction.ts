'use client';

import { ensureWalletSessionAuth, fetchWalletSessionMe } from './walletAuthClient';

type WalletPromptDetail = {
  state: 'pending' | 'success' | 'error';
  actionLabel: string;
  message: string;
  redirectHref?: string;
};

function getStoredWallet() {
  if (typeof window === 'undefined') return '';
  return (window.localStorage.getItem('indigena_wallet_address') || '').trim().toLowerCase();
}

function emitWalletPrompt(detail: WalletPromptDetail) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('indigena-wallet-action-prompt', { detail }));
}

function formatWalletActionError(error: unknown, actionLabel: string) {
  const fallback = `Sign in to ${actionLabel}.`;
  const message = error instanceof Error ? error.message : '';
  if (!message) return fallback;
  if (message.includes('provider not found')) {
    return `Sign in with your email account to ${actionLabel}.`;
  }
  if (message.includes('no connected wallet account')) {
    return `Finish signing in to ${actionLabel}.`;
  }
  if (message.toLowerCase().includes('user rejected') || message.toLowerCase().includes('denied')) {
    return `Sign-in was cancelled. Sign in to ${actionLabel}.`;
  }
  return message;
}

export async function requireWalletAction(actionLabel: string) {
  try {
    emitWalletPrompt({
      state: 'pending',
      actionLabel,
      message: `Checking your secure account session to ${actionLabel}.`
    });
    await ensureWalletSessionAuth();
    const me = await fetchWalletSessionMe().catch(() => null);
    const wallet = me?.walletAddress || getStoredWallet();
    if (!wallet) {
      throw new Error(`Sign in to ${actionLabel}.`);
    }
    emitWalletPrompt({
      state: 'success',
      actionLabel,
      message: `Signed in successfully. You can now ${actionLabel}.`
    });
    return {
      wallet,
      actorId: me?.actorId || wallet,
      role: me?.role || 'collector'
    };
  } catch (error) {
    const message = formatWalletActionError(error, actionLabel);
    emitWalletPrompt({
      state: 'error',
      actionLabel,
      message,
      redirectHref:
        typeof window !== 'undefined'
          ? `/sign-in?next=${encodeURIComponent(`${window.location.pathname}${window.location.search}${window.location.hash}`)}`
          : '/sign-in'
    });
    throw new Error(message);
  }
}



