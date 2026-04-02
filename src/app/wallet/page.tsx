'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Wallet, ArrowUpRight, ArrowDownRight, Clock, TrendingUp, Copy, ExternalLink, Shield, History, Grid, List, Heart } from 'lucide-react';
import Sidebar from '@/app/components/Sidebar';
import WalletSessionEntry from '@/app/components/WalletSessionEntry';
import { fetchWalletSnapshot } from '@/app/lib/walletApi';
import { fetchAccountSessionMe } from '@/app/lib/accountAuthClient';

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

  useEffect(() => {
    let active = true;
    const loadWallet = async () => {
      setLoadingLive(true);
      try {
        const account = await fetchAccountSessionMe().catch(() => null);
        if (account?.email) setAccountEmail(account.email);
        if (account?.walletProvider) setWalletProvider(account.walletProvider);
        const walletAddress =
          typeof window !== 'undefined'
            ? (window.localStorage.getItem('indigena_wallet_address') || '').trim()
            : '';
        if (!walletAddress) {
          if (!active) return;
          setWalletConnected(false);
          setWalletData(emptyWalletData);
          setTransactions([]);
          return;
        }
        const snapshot = await fetchWalletSnapshot(walletAddress);
        if (!active) return;
        setWalletConnected(true);
        setWalletData({
          ...emptyWalletData,
          address: snapshot.address,
          balance: snapshot.balance,
          stats: snapshot.stats
        });
        setTransactions(snapshot.transactions);
      } catch {
        if (!active) return;
        setWalletConnected(false);
        setWalletData(emptyWalletData);
        setTransactions([]);
      } finally {
        if (active) setLoadingLive(false);
      }
    };
    void loadWallet();
    return () => {
      active = false;
    };
  }, []);

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
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => router.push('/subscription')} className="p-4 bg-[#d4af37]/10 border border-[#d4af37]/30 rounded-xl text-left hover:bg-[#d4af37]/20 transition-all">
                <p className="text-white font-medium">Deposit</p>
                <p className="text-gray-400 text-xs">Add funds to wallet</p>
              </button>
              <button onClick={openExplorer} className="p-4 bg-[#d4af37]/10 border border-[#d4af37]/30 rounded-xl text-left hover:bg-[#d4af37]/20 transition-all">
                <p className="text-white font-medium">Withdraw</p>
                <p className="text-gray-400 text-xs">Send to external wallet</p>
              </button>
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



