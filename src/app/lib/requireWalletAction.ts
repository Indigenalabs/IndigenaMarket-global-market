'use client';

import { ensureWalletSessionAuth, fetchWalletSessionMe } from './walletAuthClient';

type WalletPromptDetail = {
  state: 'pending' | 'success' | 'error';
  actionLabel: string;
  message: string;
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
  const fallback = `Connect your wallet to ${actionLabel}.`;
  const message = error instanceof Error ? error.message : '';
  if (!message) return fallback;
  if (message.includes('provider not found')) {
    return `Install or open your browser wallet to ${actionLabel}.`;
  }
  if (message.includes('no connected wallet account')) {
    return `Connect a wallet account to ${actionLabel}.`;
  }
  if (message.toLowerCase().includes('user rejected') || message.toLowerCase().includes('denied')) {
    return `Wallet sign-in was cancelled. Connect your wallet to ${actionLabel}.`;
  }
  return message;
}

export async function requireWalletAction(actionLabel: string) {
  try {
    emitWalletPrompt({
      state: 'pending',
      actionLabel,
      message: `Opening secure wallet sign-in to ${actionLabel}.`
    });
    await ensureWalletSessionAuth();
    const me = await fetchWalletSessionMe().catch(() => null);
    const wallet = me?.walletAddress || getStoredWallet();
    if (!wallet) {
      throw new Error(`Connect your wallet to ${actionLabel}.`);
    }
    emitWalletPrompt({
      state: 'success',
      actionLabel,
      message: `Wallet connected. You can now ${actionLabel}.`
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
      message
    });
    throw new Error(message);
  }
}
