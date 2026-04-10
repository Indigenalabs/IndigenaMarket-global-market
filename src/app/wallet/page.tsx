'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Wallet, ArrowUpRight, ArrowDownRight, Clock, TrendingUp, Copy, ExternalLink, Shield, History, Grid, List, Heart, Loader2 } from 'lucide-react';
import Sidebar from '@/app/components/Sidebar';
import WalletSessionEntry from '@/app/components/WalletSessionEntry';
import { fetchWalletSnapshot } from '@/app/lib/walletApi';
import { fetchAccountSessionMe } from '@/app/lib/accountAuthClient';
import { fetchMyIndiBalance, fetchMyIndiLedger, fetchMyIndiWithdrawals, recordMyIndiTopUp, requestMyIndiWithdrawal } from '@/app/lib/indiBalanceApi';
import { fetchMyFiatRailsSnapshot, requestMyFiatRailsReview, saveMyFiatPayoutDestination } from '@/app/lib/fiatRailsApi';
import { createMyXrplTrustRecord, fetchMyXrplTrustRecords } from '@/app/lib/xrplTrustApi';
import type { FiatRailsSnapshot } from '@/app/lib/fiatRails';
import type { XrplTrustAssetType, XrplTrustRecord, XrplTrustType } from '@/app/lib/xrplTrustLayer';

const emptyWalletData = {
  address: '',
  balance: {
    INDI: 0,
    XRP: 0,
    USD: 0
  },
  nfts: {
    collected: 0,
    created: 0,
    favorites: 0,
    listed: 0
  },
  stats: {
    totalBought: 0,
    totalSold: 0,
    totalVolume: 0,
    profit: 0
  }
};

function mapIndiLedgerType(type: string): 'buy' | 'sell' | 'mint' | 'royalty' | 'bid' {
  switch (type) {
    case 'earning':
    case 'deposit':
    case 'refund':
      return 'sell';
    case 'withdrawal_request':
    case 'withdrawal_complete':
    case 'spend':
      return 'buy';
    default:
      return 'royalty';
  }
}

export default function WalletPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [copied, setCopied] = useState(false);
  const [activePillar, setActivePillar] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [walletData, setWalletData] = useState(emptyWalletData);
  const [transactions, setTransactions] = useState<Array<{ id: string; type: 'buy' | 'sell' | 'mint' | 'royalty' | 'bid'; item: string; amount: number; currency: string; date: string; status: string }>>([]);
  const [myNFTs] = useState<Array<{ id: string; title: string; image: string; price: number; listed: boolean }>>([]);
  const [walletConnected, setWalletConnected] = useState(false);
  const [loadingLive, setLoadingLive] = useState(false);
  const [walletProvider, setWalletProvider] = useState('');
  const [accountEmail, setAccountEmail] = useState('');
  const [indiPendingBalance, setIndiPendingBalance] = useState(0);
  const [indiLifetimeCredits, setIndiLifetimeCredits] = useState(0);
  const [indiLifetimeDebits, setIndiLifetimeDebits] = useState(0);
  const [creatorProfileSlug, setCreatorProfileSlug] = useState('');
  const [depositAmount, setDepositAmount] = useState('250');
  const [withdrawAmount, setWithdrawAmount] = useState('50');
  const [submittingAction, setSubmittingAction] = useState<'deposit' | 'withdraw' | ''>('');
  const [actionMessage, setActionMessage] = useState('');
  const [actionError, setActionError] = useState('');
  const [withdrawDestinationType, setWithdrawDestinationType] = useState<'bank_account' | 'payid' | 'debit_card' | 'manual_review'>('bank_account');
  const [withdrawDestinationLabel, setWithdrawDestinationLabel] = useState('Primary bank payout');
  const [withdrawAccountName, setWithdrawAccountName] = useState('');
  const [withdrawInstitutionName, setWithdrawInstitutionName] = useState('');
  const [withdrawLast4, setWithdrawLast4] = useState('');
  const [withdrawalRequests, setWithdrawalRequests] = useState<Array<{ id: string; amount: number; netAmount: number; destinationLabel: string; destinationType: string; status: string; requestedAt: string }>>([]);
  const [fiatRailsSnapshot, setFiatRailsSnapshot] = useState<FiatRailsSnapshot | null>(null);
  const [xrplTrustRecords, setXrplTrustRecords] = useState<XrplTrustRecord[]>([]);
  const [savingDestination, setSavingDestination] = useState(false);
  const [requestingReview, setRequestingReview] = useState(false);
  const [creatingTrustRecord, setCreatingTrustRecord] = useState(false);
  const [trustAssetType, setTrustAssetType] = useState<XrplTrustAssetType>('digital_art');
  const [trustType, setTrustType] = useState<XrplTrustType>('provenance');
  const [trustAssetTitle, setTrustAssetTitle] = useState('Community provenance certificate');
  const [trustAssetId, setTrustAssetId] = useState('community-provenance-1');

  const loadWallet = useCallback(async () => {
    setLoadingLive(true);
    try {
      const account = await fetchAccountSessionMe().catch(() => null);
      if (account?.email) setAccountEmail(account.email);
      if (account?.walletProvider) setWalletProvider(account.walletProvider);
      const walletAddress = account?.walletAddress ||
        (typeof window !== 'undefined'
          ? (window.localStorage.getItem('indigena_wallet_address') || '').trim()
          : '');
      const profileSlug = account?.creatorProfileSlug || '';
      setCreatorProfileSlug(profileSlug);
      if (!walletAddress && !account?.actorId) {
        setWalletConnected(false);
        setWalletData(emptyWalletData);
        setTransactions([]);
        setIndiPendingBalance(0);
        setIndiLifetimeCredits(0);
        setIndiLifetimeDebits(0);
        setCreatorProfileSlug('');
        return;
      }
      const [snapshot, indiBalance, indiLedger, indiWithdrawals, railsSnapshot, trustRecords] = await Promise.all([
        walletAddress ? fetchWalletSnapshot(walletAddress).catch(() => null) : Promise.resolve(null),
        account?.actorId ? fetchMyIndiBalance(profileSlug).catch(() => null) : Promise.resolve(null),
        account?.actorId ? fetchMyIndiLedger(profileSlug).catch(() => []) : Promise.resolve([]),
        account?.actorId ? fetchMyIndiWithdrawals(profileSlug).catch(() => []) : Promise.resolve([]),
        account?.actorId ? fetchMyFiatRailsSnapshot(profileSlug).catch(() => null) : Promise.resolve(null),
        account?.actorId ? fetchMyXrplTrustRecords(profileSlug).catch(() => []) : Promise.resolve([])
      ]);
      setWalletConnected(true);
      const ledgerTransactions = indiLedger.map((entry) => ({
        id: entry.id,
        type: mapIndiLedgerType(entry.type),
        item: entry.description || entry.type,
        amount: Number(entry.amount || 0),
        currency: 'INDI',
        date: entry.createdAt ? new Date(entry.createdAt).toLocaleDateString() : 'Recently',
        status: entry.status
      }));
      setWalletData({
        ...emptyWalletData,
        address: walletAddress,
        balance: {
          INDI: indiBalance?.availableBalance ?? snapshot?.balance.INDI ?? 0,
          XRP: snapshot?.balance.XRP ?? 0,
          USD: indiBalance?.estimatedFiatValueUsd ?? snapshot?.balance.USD ?? 0
        },
        stats: snapshot?.stats ?? emptyWalletData.stats
      });
      setTransactions(ledgerTransactions.length > 0 ? ledgerTransactions : (snapshot?.transactions ?? []));
      setIndiPendingBalance(indiBalance?.pendingBalance ?? 0);
      setIndiLifetimeCredits(indiBalance?.lifetimeCreditAmount ?? 0);
      setIndiLifetimeDebits(indiBalance?.lifetimeDebitAmount ?? 0);
      setWithdrawalRequests(
        indiWithdrawals.map((request) => ({
          id: request.id,
          amount: Number(request.amount || 0),
          netAmount: Number(request.netAmount || 0),
          destinationLabel: request.destinationLabel || 'Fiat payout destination',
          destinationType: request.destinationType,
          status: request.status,
          requestedAt: request.requestedAt
        }))
      );
      setFiatRailsSnapshot(railsSnapshot);
      setXrplTrustRecords(trustRecords);
    } catch {
      setWalletConnected(false);
      setWalletData(emptyWalletData);
      setTransactions([]);
      setIndiPendingBalance(0);
      setIndiLifetimeCredits(0);
      setIndiLifetimeDebits(0);
      setWithdrawalRequests([]);
      setFiatRailsSnapshot(null);
      setXrplTrustRecords([]);
    } finally {
      setLoadingLive(false);
    }
  }, []);

  useEffect(() => {
    void loadWallet();
  }, [loadWallet]);

  const submitDeposit = async () => {
    const amount = Number(depositAmount || 0);
    if (!Number.isFinite(amount) || amount <= 0) {
      setActionError('Enter a valid INDI top-up amount.');
      setActionMessage('');
      return;
    }
    setSubmittingAction('deposit');
    setActionError('');
    setActionMessage('');
    try {
      await recordMyIndiTopUp({
        amount,
        profileSlug: creatorProfileSlug,
        source: 'wallet-page',
        note: 'Wallet quick action top-up'
      });
      setActionMessage(`Added ${amount.toLocaleString()} INDI to this managed balance.`);
      await loadWallet();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Top-up failed.');
    } finally {
      setSubmittingAction('');
    }
  };

  const submitWithdrawal = async () => {
    const amount = Number(withdrawAmount || 0);
    if (!Number.isFinite(amount) || amount <= 0) {
      setActionError('Enter a valid withdrawal amount.');
      setActionMessage('');
      return;
    }
    setSubmittingAction('withdraw');
    setActionError('');
    setActionMessage('');
    try {
      await requestMyIndiWithdrawal({
        amount,
        profileSlug: creatorProfileSlug,
        destination: 'fiat',
        destinationType: withdrawDestinationType,
        destinationLabel: withdrawDestinationLabel,
        accountName: withdrawAccountName,
        last4: withdrawLast4,
        note: 'Wallet quick action withdrawal'
      });
      setActionMessage(`Queued a ${amount.toLocaleString()} INDI withdrawal request for fiat settlement.`);
      await loadWallet();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Withdrawal request failed.');
    } finally {
      setSubmittingAction('');
    }
  };

  const submitPayoutDestination = async () => {
    if (!walletConnected) return;
    if (!withdrawDestinationLabel.trim()) {
      setActionError('Add a label before saving this payout destination.');
      setActionMessage('');
      return;
    }
    setSavingDestination(true);
    setActionError('');
    setActionMessage('');
    try {
      const result = await saveMyFiatPayoutDestination({
        profileSlug: creatorProfileSlug,
        label: withdrawDestinationLabel,
        destinationType: withdrawDestinationType,
        accountName: withdrawAccountName,
        institutionName: withdrawInstitutionName,
        last4: withdrawLast4,
        isDefault: true,
        metadata: { source: 'wallet-page' }
      });
      setFiatRailsSnapshot(result.snapshot);
      setActionMessage(`Saved ${result.destination.label} into the fiat payout rail.`);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Saving payout destination failed.');
    } finally {
      setSavingDestination(false);
    }
  };

  const submitReviewRequest = async () => {
    if (!walletConnected) return;
    setRequestingReview(true);
    setActionError('');
    setActionMessage('');
    try {
      const snapshot = await requestMyFiatRailsReview({
        profileSlug: creatorProfileSlug,
        note: 'Wallet owner requested payout/compliance review.'
      });
      setFiatRailsSnapshot(snapshot);
      setActionMessage('Compliance review request recorded. This wallet is now queued for fiat rails review.');
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Compliance review request failed.');
    } finally {
      setRequestingReview(false);
    }
  };

  const submitTrustRecord = async () => {
    if (!walletConnected) return;
    if (!trustAssetId.trim() || !trustAssetTitle.trim()) {
      setActionError('Add both an asset id and title before creating an XRPL trust record.');
      setActionMessage('');
      return;
    }
    setCreatingTrustRecord(true);
    setActionError('');
    setActionMessage('');
    try {
      const record = await createMyXrplTrustRecord({
        profileSlug: creatorProfileSlug,
        assetType: trustAssetType,
        assetId: trustAssetId,
        assetTitle: trustAssetTitle,
        trustType,
        status: 'draft',
        metadata: { source: 'wallet-page' }
      });
      setXrplTrustRecords((current) => [record, ...current]);
      setActionMessage(`Created a draft ${record.trustType} record for ${record.assetTitle}.`);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Creating XRPL trust record failed.');
    } finally {
      setCreatingTrustRecord(false);
    }
  };

  const copyAddress = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(walletData.address);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const openExplorer = () => {
    if (typeof window === 'undefined') return;
    if (walletProvider === 'indigena_managed') return;
    window.open('https://bithomp.com/explorer/' + walletData.address, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      {/* Sidebar */}
      <Sidebar 
        activePillar={activePillar} 
        onPillarChange={setActivePillar}
        isCollapsed={isCollapsed}
        onCollapseChange={setIsCollapsed}
      />
      
      {/* Main Content */}
      <div className="flex-1 min-w-0 p-6 transition-all duration-300">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#d4af37] to-[#b8941f] flex items-center justify-center">
            <Wallet size={24} className="text-black" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">My Wallet</h1>
            <p className="text-gray-400">
              Manage your assets and transactions {loadingLive ? '• syncing live data...' : walletConnected ? '• live' : '• sign in to sync'}
            </p>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <WalletSessionEntry variant="panel" />
      </div>

      {!walletConnected && !loadingLive ? (
        <div className="mb-6 rounded-xl border border-[#d4af37]/20 bg-[#141414] p-4 text-sm text-gray-300">
          Sign in to load live balances, transaction history, and financial services.
        </div>
      ) : null}

      {/* Wallet Address */}
      <div className="bg-[#141414] rounded-xl border border-[#d4af37]/10 p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#d4af37]/10 flex items-center justify-center">
              <Shield size={20} className="text-[#d4af37]" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Managed Wallet</p>
              <p className="text-white font-mono">{walletData.address ? `${walletData.address.slice(0, 8)}...${walletData.address.slice(-8)}` : 'No wallet connected'}</p>
              {accountEmail ? <p className="mt-1 text-xs text-gray-500">{accountEmail}</p> : null}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={copyAddress}
              className="flex items-center gap-2 px-4 py-2 bg-[#d4af37]/10 border border-[#d4af37]/30 rounded-lg text-[#d4af37] hover:bg-[#d4af37] hover:text-black transition-all"
            >
              <Copy size={16} />
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button
              onClick={openExplorer}
              disabled={walletProvider === 'indigena_managed'}
              className="p-2 bg-[#d4af37]/10 border border-[#d4af37]/30 rounded-lg text-[#d4af37] hover:bg-[#d4af37] hover:text-black transition-all"
            >
              <ExternalLink size={18} />
            </button>
          </div>
        </div>
        {walletProvider === 'indigena_managed' ? (
          <p className="mt-3 text-xs leading-6 text-gray-500">This wallet is managed by Indigena as part of your email-based account. External explorer links are reserved for connected external wallets later.</p>
        ) : null}
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gradient-to-br from-[#d4af37]/20 to-[#d4af37]/5 rounded-xl border border-[#d4af37]/30 p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[#d4af37] text-sm font-medium">INDI Balance</span>
            <TrendingUp size={16} className="text-green-400" />
          </div>
          <p className="text-3xl font-bold text-white">{walletData.balance.INDI.toLocaleString()}</p>
          <p className="text-gray-400 text-sm">~ ${walletData.balance.USD.toLocaleString()} USD</p>
          <p className="mt-1 text-xs text-gray-500">Pending: {indiPendingBalance.toLocaleString()} INDI</p>
        </div>

        <div className="bg-[#141414] rounded-xl border border-[#d4af37]/10 p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">XRP Balance</span>
          </div>
          <p className="text-3xl font-bold text-white">{walletData.balance.XRP}</p>
          <p className="text-gray-400 text-sm">For transaction fees</p>
        </div>

        <div className="bg-[#141414] rounded-xl border border-[#d4af37]/10 p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Portfolio Value</span>
          </div>
          <p className="text-3xl font-bold text-white">${walletData.balance.USD.toLocaleString()}</p>
          <p className="text-green-400 text-sm flex items-center gap-1">
            <ArrowUpRight size={14} />
            +12.5% this month
          </p>
        </div>
      </div>

      {/* NFT Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Collected', value: walletData.nfts.collected, icon: Grid },
          { label: 'Created', value: walletData.nfts.created, icon: Wallet },
          { label: 'Favorites', value: walletData.nfts.favorites, icon: Heart },
          { label: 'Listed', value: walletData.nfts.listed, icon: TrendingUp }
        ].map((stat) => (
          <div key={stat.label} className="bg-[#141414] rounded-xl border border-[#d4af37]/10 p-4 text-center">
            <stat.icon size={20} className="text-[#d4af37] mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-gray-400 text-sm">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'nfts', label: 'My NFTs' },
          { id: 'transactions', label: 'Transactions' },
          { id: 'analytics', label: 'Analytics' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-[#d4af37] text-black'
                : 'bg-[#141414] text-gray-400 hover:text-white border border-[#d4af37]/20'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <div className="bg-[#141414] rounded-xl border border-[#d4af37]/10 p-5">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <History size={18} className="text-[#d4af37]" />
              Recent Activity
            </h3>
            <div className="space-y-3">
              {transactions.length === 0 ? <p className="text-sm text-gray-500">No wallet activity yet.</p> : transactions.slice(0, 4).map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-[#1a1a1a] transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      tx.type === 'buy' ? 'bg-red-500/20 text-red-400' :
                      tx.type === 'sell' ? 'bg-green-500/20 text-green-400' :
                      'bg-[#d4af37]/20 text-[#d4af37]'
                    }`}>
                      {tx.type === 'buy' ? <ArrowDownRight size={18} /> :
                       tx.type === 'sell' ? <ArrowUpRight size={18} /> :
                       <Clock size={18} />}
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium capitalize">{tx.type}</p>
                      <p className="text-gray-400 text-xs truncate max-w-[150px]">{tx.item}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${
                      tx.type === 'sell' || tx.type === 'royalty' ? 'text-green-400' : 'text-white'
                    }`}>
                      {tx.type === 'sell' || tx.type === 'royalty' ? '+' : '-'}{tx.amount} {tx.currency}
                    </p>
                    <p className="text-gray-400 text-xs">{tx.date}</p>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => setActiveTab('transactions')}
              className="w-full mt-4 py-2 border border-[#d4af37]/30 rounded-lg text-[#d4af37] text-sm hover:bg-[#d4af37]/10 transition-all">
              View All Transactions
            </button>
          </div>

          {/* Quick Actions */}
          <div className="bg-[#141414] rounded-xl border border-[#d4af37]/10 p-5">
            <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <div className="rounded-xl border border-[#d4af37]/20 bg-[#d4af37]/5 p-4">
                <div className="mb-3">
                  <p className="text-white font-medium">Add INDI</p>
                  <p className="text-gray-400 text-xs">Credit this managed balance so you can buy, support projects, or test future split flows.</p>
                </div>
                <div className="flex gap-2">
                  <input
                    value={depositAmount}
                    onChange={(event) => setDepositAmount(event.target.value)}
                    inputMode="decimal"
                    className="flex-1 rounded-lg border border-[#d4af37]/20 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-[#d4af37]/50"
                    placeholder="250"
                  />
                  <button
                    onClick={submitDeposit}
                    disabled={!walletConnected || submittingAction === 'deposit'}
                    className="inline-flex min-w-[120px] items-center justify-center gap-2 rounded-lg bg-[#d4af37] px-4 py-2 text-sm font-semibold text-black transition-all hover:bg-[#e4bf47] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submittingAction === 'deposit' ? <Loader2 size={16} className="animate-spin" /> : null}
                    Top Up
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <div className="mb-3">
                  <p className="text-white font-medium">Withdraw To Fiat</p>
                  <p className="text-gray-400 text-xs">Queue a withdrawal request from your INDI balance into the payout rail.</p>
                </div>
                <div className="mb-3 grid grid-cols-1 gap-2 md:grid-cols-2">
                  <select
                    value={withdrawDestinationType}
                    onChange={(event) => setWithdrawDestinationType(event.target.value as typeof withdrawDestinationType)}
                    className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-[#d4af37]/50"
                  >
                    <option value="bank_account">Bank account</option>
                    <option value="payid">PayID</option>
                    <option value="debit_card">Debit card</option>
                    <option value="manual_review">Manual review</option>
                  </select>
                  <input
                    value={withdrawDestinationLabel}
                    onChange={(event) => setWithdrawDestinationLabel(event.target.value)}
                    className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-[#d4af37]/50"
                    placeholder="Primary bank payout"
                  />
                  <input
                    value={withdrawAccountName}
                    onChange={(event) => setWithdrawAccountName(event.target.value)}
                    className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-[#d4af37]/50"
                    placeholder="Account holder"
                  />
                  <input
                    value={withdrawInstitutionName}
                    onChange={(event) => setWithdrawInstitutionName(event.target.value)}
                    className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-[#d4af37]/50"
                    placeholder="Institution / bank"
                  />
                  <input
                    value={withdrawLast4}
                    onChange={(event) => setWithdrawLast4(event.target.value)}
                    maxLength={4}
                    className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-[#d4af37]/50"
                    placeholder="Last 4"
                  />
                </div>
                <div className="flex gap-2">
                  <input
                    value={withdrawAmount}
                    onChange={(event) => setWithdrawAmount(event.target.value)}
                    inputMode="decimal"
                    className="flex-1 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-[#d4af37]/50"
                    placeholder="50"
                  />
                  <button
                    onClick={submitPayoutDestination}
                    disabled={!walletConnected || savingDestination}
                    className="inline-flex min-w-[140px] items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {savingDestination ? <Loader2 size={16} className="animate-spin" /> : null}
                    Save destination
                  </button>
                  <button
                    onClick={submitWithdrawal}
                    disabled={!walletConnected || submittingAction === 'withdraw'}
                    className="inline-flex min-w-[120px] items-center justify-center gap-2 rounded-lg border border-[#d4af37]/30 bg-[#d4af37]/10 px-4 py-2 text-sm font-semibold text-[#d4af37] transition-all hover:bg-[#d4af37]/20 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submittingAction === 'withdraw' ? <Loader2 size={16} className="animate-spin" /> : null}
                    Request
                  </button>
                </div>
              </div>

              {(actionMessage || actionError) ? (
                <div className={`rounded-xl border px-4 py-3 text-sm ${actionError ? 'border-[#DC143C]/30 bg-[#DC143C]/10 text-[#ff9f9f]' : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-200'}`}>
                  {actionError || actionMessage}
                </div>
              ) : null}

              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Fiat rails readiness</p>
                    <p className="text-gray-400 text-xs">Phase 6 compliance and payout onboarding for this managed wallet.</p>
                  </div>
                  <Shield size={16} className="text-[#d4af37]" />
                </div>
                <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                  {[
                    { label: 'KYC', value: fiatRailsSnapshot?.readiness.kycApproved ? 'Approved' : (fiatRailsSnapshot?.complianceProfile?.kycStatus || 'Pending') },
                    { label: 'AML', value: fiatRailsSnapshot?.readiness.amlApproved ? 'Approved' : (fiatRailsSnapshot?.complianceProfile?.amlStatus || 'Pending') },
                    { label: 'Payouts', value: fiatRailsSnapshot?.readiness.payoutEnabled ? 'Enabled' : 'Review needed' },
                    { label: 'Instant rail', value: fiatRailsSnapshot?.readiness.instantPayoutReady ? 'Ready' : 'Not ready' }
                  ].map((item) => (
                    <div key={item.label} className="rounded-lg border border-white/5 bg-white/5 px-3 py-3">
                      <p className="text-[11px] uppercase tracking-[0.16em] text-gray-500">{item.label}</p>
                      <p className="mt-1 text-sm font-medium text-white">{item.value}</p>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={submitReviewRequest}
                    disabled={!walletConnected || requestingReview}
                    className="inline-flex items-center gap-2 rounded-lg border border-[#d4af37]/30 bg-[#d4af37]/10 px-4 py-2 text-sm font-semibold text-[#d4af37] transition-all hover:bg-[#d4af37]/20 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {requestingReview ? <Loader2 size={16} className="animate-spin" /> : null}
                    Request compliance review
                  </button>
                  <p className="text-xs text-gray-500">{fiatRailsSnapshot?.destinations?.length || 0} saved payout destinations</p>
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-white font-medium">Withdrawal Status</p>
                  <p className="text-xs text-gray-500">{withdrawalRequests.length} requests</p>
                </div>
                <div className="space-y-2">
                  {withdrawalRequests.length === 0 ? (
                    <p className="text-xs text-gray-500">No withdrawal requests yet.</p>
                  ) : withdrawalRequests.slice(0, 4).map((request) => (
                    <div key={request.id} className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 px-3 py-2">
                      <div>
                        <p className="text-sm text-white">{request.amount.toLocaleString()} INDI to {request.destinationLabel}</p>
                        <p className="text-xs text-gray-500">{request.destinationType.replace('_', ' ')} • {new Date(request.requestedAt).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-[#d4af37]">{request.netAmount.toLocaleString()} net</p>
                        <p className="text-xs uppercase tracking-[0.16em] text-gray-400">{request.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-white font-medium">Saved payout destinations</p>
                  <p className="text-xs text-gray-500">{fiatRailsSnapshot?.destinations?.length || 0} destinations</p>
                </div>
                <div className="space-y-2">
                  {(fiatRailsSnapshot?.destinations?.length || 0) === 0 ? (
                    <p className="text-xs text-gray-500">No payout destinations saved yet. Save one from the withdrawal form above.</p>
                  ) : fiatRailsSnapshot?.destinations.slice(0, 4).map((destination) => (
                    <div key={destination.id} className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 px-3 py-2">
                      <div>
                        <p className="text-sm text-white">{destination.label}</p>
                        <p className="text-xs text-gray-500">
                          {destination.destinationType.replace('_', ' ')}{destination.last4 ? ` • •••• ${destination.last4}` : ''}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs uppercase tracking-[0.16em] text-gray-400">{destination.status}</p>
                        {destination.isDefault ? <p className="text-xs text-[#d4af37]">Default</p> : null}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <div className="mb-3">
                  <p className="text-white font-medium">XRPL trust layer</p>
                  <p className="text-gray-400 text-xs">Phase 7 provenance, authenticity, and certificate anchors start here.</p>
                </div>
                <div className="mb-3 grid grid-cols-1 gap-2 md:grid-cols-2">
                  <select
                    value={trustAssetType}
                    onChange={(event) => setTrustAssetType(event.target.value as XrplTrustAssetType)}
                    className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-[#d4af37]/50"
                  >
                    <option value="digital_art">Digital art</option>
                    <option value="physical_item">Physical item</option>
                    <option value="course_certificate">Course certificate</option>
                    <option value="community_certificate">Community certificate</option>
                  </select>
                  <select
                    value={trustType}
                    onChange={(event) => setTrustType(event.target.value as XrplTrustType)}
                    className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-[#d4af37]/50"
                  >
                    <option value="provenance">Provenance</option>
                    <option value="authenticity">Authenticity</option>
                    <option value="certificate">Certificate</option>
                  </select>
                  <input
                    value={trustAssetTitle}
                    onChange={(event) => setTrustAssetTitle(event.target.value)}
                    className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-[#d4af37]/50"
                    placeholder="Asset title"
                  />
                  <input
                    value={trustAssetId}
                    onChange={(event) => setTrustAssetId(event.target.value)}
                    className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-[#d4af37]/50"
                    placeholder="Asset id"
                  />
                </div>
                <div className="mb-4">
                  <button
                    onClick={submitTrustRecord}
                    disabled={!walletConnected || creatingTrustRecord}
                    className="inline-flex items-center gap-2 rounded-lg border border-[#d4af37]/30 bg-[#d4af37]/10 px-4 py-2 text-sm font-semibold text-[#d4af37] transition-all hover:bg-[#d4af37]/20 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {creatingTrustRecord ? <Loader2 size={16} className="animate-spin" /> : null}
                    Create trust record
                  </button>
                </div>
                <div className="space-y-2">
                  {xrplTrustRecords.length === 0 ? (
                    <p className="text-xs text-gray-500">No XRPL trust anchors yet for this wallet.</p>
                  ) : xrplTrustRecords.slice(0, 4).map((record) => (
                    <div key={record.id} className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 px-3 py-2">
                      <div>
                        <p className="text-sm text-white">{record.assetTitle}</p>
                        <p className="text-xs text-gray-500">{record.assetType.replace('_', ' ')} • {record.trustType}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs uppercase tracking-[0.16em] text-gray-400">{record.status}</p>
                        <p className="text-xs text-[#d4af37]">{new Date(record.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => router.push('/digital-arts/add')} className="p-4 bg-[#d4af37]/10 border border-[#d4af37]/30 rounded-xl text-left hover:bg-[#d4af37]/20 transition-all">
                  <p className="text-white font-medium">Mint NFT</p>
                  <p className="text-gray-400 text-xs">Create new artwork</p>
                </button>
                <button onClick={() => router.push('/digital-arts')} className="p-4 bg-[#d4af37]/10 border border-[#d4af37]/30 rounded-xl text-left hover:bg-[#d4af37]/20 transition-all">
                  <p className="text-white font-medium">List Item</p>
                  <p className="text-gray-400 text-xs">Sell your NFTs</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'nfts' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-gray-400">{myNFTs.length} items</p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-[#d4af37]/20 text-[#d4af37]' : 'text-gray-400'}`}
              >
                <Grid size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-[#d4af37]/20 text-[#d4af37]' : 'text-gray-400'}`}
              >
                <List size={18} />
              </button>
            </div>
          </div>

          <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-1'}`}>
            {myNFTs.length === 0 ? <p className="col-span-full text-sm text-gray-500">NFT holdings will appear here once live wallet indexing is available.</p> : null}
            {myNFTs.map((nft) => (
              <div key={nft.id} className="bg-[#141414] rounded-xl border border-[#d4af37]/10 overflow-hidden group">
                <div className="aspect-square overflow-hidden">
                  <img src={nft.image} alt={nft.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                </div>
                <div className="p-3">
                  <h4 className="text-white font-medium truncate">{nft.title}</h4>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-[#d4af37] text-sm">{nft.price} INDI</p>
                    {nft.listed ? (
                      <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">Listed</span>
                    ) : (
                      <button onClick={() => router.push('/digital-arts')} className="text-xs text-gray-400 hover:text-[#d4af37]">List</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'transactions' && (
        <div className="bg-[#141414] rounded-xl border border-[#d4af37]/10 p-5">
          <h3 className="text-lg font-bold text-white mb-4">All Transactions</h3>
          <div className="space-y-2">
            {transactions.length === 0 ? <p className="text-sm text-gray-500">No transactions recorded for this wallet yet.</p> : null}
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-4 rounded-lg hover:bg-[#1a1a1a] transition-colors border-b border-[#d4af37]/5 last:border-0">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    tx.type === 'buy' ? 'bg-red-500/20 text-red-400' :
                    tx.type === 'sell' ? 'bg-green-500/20 text-green-400' :
                    'bg-[#d4af37]/20 text-[#d4af37]'
                  }`}>
                    {tx.type === 'buy' ? <ArrowDownRight size={20} /> :
                     tx.type === 'sell' ? <ArrowUpRight size={20} /> :
                     <Clock size={20} />}
                  </div>
                  <div>
                    <p className="text-white font-medium capitalize">{tx.type}</p>
                    <p className="text-gray-400 text-sm">{tx.item}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-medium ${
                    tx.type === 'sell' || tx.type === 'royalty' ? 'text-green-400' : 'text-white'
                  }`}>
                    {tx.type === 'sell' || tx.type === 'royalty' ? '+' : '-'}{tx.amount} {tx.currency}
                  </p>
                  <p className="text-gray-400 text-sm">{tx.date}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    tx.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {tx.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#141414] rounded-xl border border-[#d4af37]/10 p-5">
            <h3 className="text-lg font-bold text-white mb-4">Trading Stats</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Total Bought</span>
                <span className="text-white font-medium">{walletData.stats.totalBought} NFTs</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Total Sold</span>
                <span className="text-white font-medium">{walletData.stats.totalSold} NFTs</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Total Volume</span>
                <span className="text-[#d4af37] font-medium">{walletData.stats.totalVolume} INDI</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Total Profit</span>
                <span className="text-green-400 font-medium">+{walletData.stats.profit} INDI</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Lifetime Credits</span>
                <span className="text-white font-medium">{indiLifetimeCredits.toLocaleString()} INDI</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Lifetime Debits</span>
                <span className="text-white font-medium">{indiLifetimeDebits.toLocaleString()} INDI</span>
              </div>
            </div>
          </div>

          <div className="bg-[#141414] rounded-xl border border-[#d4af37]/10 p-5">
            <h3 className="text-lg font-bold text-white mb-4">Monthly Activity</h3>
            <div className="h-48 flex items-end gap-2">
              {[40, 65, 45, 80, 55, 90, 70].map((height, i) => (
                <div key={i} className="flex-1 bg-[#d4af37]/20 rounded-t hover:bg-[#d4af37]/40 transition-colors" style={{ height: `${height}%` }} />
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-400">
              <span>Jan</span>
              <span>Feb</span>
              <span>Mar</span>
              <span>Apr</span>
              <span>May</span>
              <span>Jun</span>
              <span>Jul</span>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}



