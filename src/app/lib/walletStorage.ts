'use client';

function browserSafe() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function getStoredWalletAddress() {
  if (!browserSafe()) return '';
  return (window.localStorage.getItem('indigena_wallet_address') || '').trim().toLowerCase();
}

export function setStoredWalletAddress(wallet: string) {
  if (!browserSafe()) return;
  const normalized = String(wallet || '').trim().toLowerCase();
  if (!normalized) return;
  window.localStorage.setItem('indigena_wallet_address', normalized);
  window.localStorage.removeItem('walletAddress');
  window.localStorage.removeItem('wallet');
  window.localStorage.removeItem('userWallet');
}

export function clearLegacyWalletStorage() {
  if (!browserSafe()) return;
  window.localStorage.removeItem('walletAddress');
  window.localStorage.removeItem('wallet');
  window.localStorage.removeItem('userWallet');
}
