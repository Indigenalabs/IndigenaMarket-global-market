'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Wallet, ExternalLink, Copy, Check, Clock, ArrowUpRight, 
  ArrowDownRight, RefreshCw, Shield, AlertCircle
} from 'lucide-react';

interface Transaction {
  id: string;
  type: 'buy' | 'sell' | 'bid' | 'receive' | 'send';
  amount: number;
  currency: string;
  description: string;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
}

interface WalletIntegrationProps {
  isConnected: boolean;
  walletAddress?: string;
  balance: { indi: number; xrp: number };
  transactions?: Transaction[];
  onConnect: () => void;
  onDisconnect: () => void;
  onRefresh: () => void;
}

export default function WalletIntegration({
  isConnected,
  walletAddress,
  balance,
  transactions = [],
  onConnect,
  onDisconnect,
  onRefresh
}: WalletIntegrationProps) {
  const [showTransactions, setShowTransactions] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleCopy = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefresh();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (!isConnected) {
    return (
      <div className="bg-gradient-to-r from-[#d4af37]/20 to-[#DC143C]/10 rounded-xl p-6 border border-[#d4af37]/30">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-[#d4af37]/20 rounded-full flex items-center justify-center">
            <Wallet size={28} className="text-[#d4af37]" />
          </div>
          <div className="flex-1">
            <h3 className="text-white font-semibold text-lg">Connect Your Wallet</h3>
            <p className="text-gray-400 text-sm">Connect with Xumm to buy, sell, and bid on NFTs</p>
          </div>
          <button 
            onClick={onConnect}
            className="px-6 py-3 bg-[#d4af37] text-black font-semibold rounded-lg hover:bg-[#f4e4a6] transition-colors"
          >
            Connect
          </button>
        </div>
        
        <div className="mt-4 pt-4 border-t border-[#d4af37]/20">
          <div className="flex items-center gap-2 text-gray-400 text-xs">
            <Shield size={14} className="text-green-400" />
            <span>Secure connection via Xumm Wallet</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#141414] rounded-xl border border-[#d4af37]/20 overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-[#d4af37]/10 to-[#DC143C]/5 border-b border-[#d4af37]/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#d4af37]/20 rounded-full flex items-center justify-center">
              <Wallet size={20} className="text-[#d4af37]" />
            </div>
            <div>
              <p className="text-white font-semibold">Connected</p>
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-sm">{truncateAddress(walletAddress || '')}</span>
                <button 
                  onClick={handleCopy}
                  className="text-[#d4af37] hover:text-[#f4e4a6] transition-colors"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                </button>
                <a 
                  href={`https://bithomp.com/explorer/${walletAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#d4af37] hover:text-[#f4e4a6] transition-colors"
                >
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>
          </div>
          <button 
            onClick={onDisconnect}
            className="px-3 py-1.5 bg-[#DC143C]/10 text-[#DC143C] text-sm font-medium rounded-lg hover:bg-[#DC143C]/20 transition-colors"
          >
            Disconnect
          </button>
        </div>
      </div>

      {/* Balance Cards */}
      <div className="p-4 grid grid-cols-2 gap-3">
        <div className="p-4 bg-[#0a0a0a] rounded-xl">
          <p className="text-gray-400 text-xs mb-1">INDI Balance</p>
          <p className="text-2xl font-bold text-[#d4af37]">{balance.indi.toLocaleString()}</p>
          <p className="text-gray-500 text-xs">~${(balance.indi * 0.5).toFixed(2)} USD</p>
        </div>
        <div className="p-4 bg-[#0a0a0a] rounded-xl">
          <p className="text-gray-400 text-xs mb-1">XRP Balance</p>
          <p className="text-2xl font-bold text-white">{balance.xrp.toFixed(2)}</p>
          <p className="text-gray-500 text-xs">~${(balance.xrp * 0.6).toFixed(2)} USD</p>
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 pb-4 flex gap-2">
        <button 
          onClick={() => setShowTransactions(!showTransactions)}
          className="flex-1 py-2 bg-[#0a0a0a] text-white text-sm font-medium rounded-lg hover:bg-[#1a1a1a] transition-colors flex items-center justify-center gap-2"
        >
          <Clock size={16} />
          History
        </button>
        <button 
          onClick={handleRefresh}
          className={`flex-1 py-2 bg-[#0a0a0a] text-white text-sm font-medium rounded-lg hover:bg-[#1a1a1a] transition-colors flex items-center justify-center gap-2 ${isRefreshing ? 'animate-pulse' : ''}`}
        >
          <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Transactions */}
      {showTransactions && (
        <div className="border-t border-[#d4af37]/10">
          <div className="p-3 bg-[#0a0a0a]">
            <h4 className="text-white font-medium text-sm">Recent Transactions</h4>
          </div>
          <div className="max-h-60 overflow-y-auto">
            {transactions.length === 0 ? (
              <div className="p-4 text-center">
                <p className="text-gray-400 text-sm">No transactions yet</p>
              </div>
            ) : (
              transactions.map((tx) => (
                <div 
                  key={tx.id}
                  className="flex items-center justify-between p-3 border-b border-[#d4af37]/10 last:border-0 hover:bg-[#0a0a0a] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      tx.type === 'buy' || tx.type === 'send' ? 'bg-[#DC143C]/10' : 'bg-green-500/10'
                    }`}>
                      {tx.type === 'buy' || tx.type === 'send' ? (
                        <ArrowUpRight size={14} className="text-[#DC143C]" />
                      ) : (
                        <ArrowDownRight size={14} className="text-green-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium capitalize">{tx.type}</p>
                      <p className="text-gray-500 text-xs">{tx.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${
                      tx.type === 'buy' || tx.type === 'send' ? 'text-[#DC143C]' : 'text-green-400'
                    }`}>
                      {tx.type === 'buy' || tx.type === 'send' ? '-' : '+'}{tx.amount} {tx.currency}
                    </p>
                    <p className="text-gray-500 text-xs">{tx.timestamp}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Pending Offers/Bids Alert */}
      <div className="p-4 border-t border-[#d4af37]/10">
        <div className="flex items-start gap-3 p-3 bg-yellow-500/10 rounded-lg">
          <AlertCircle size={18} className="text-yellow-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-yellow-400 text-sm font-medium">Active Bids</p>
            <p className="text-gray-400 text-xs">You have 2 active bids. Funds are held in escrow until auction ends.</p>
          </div>
          <Link
            href="/wallet"
            className="text-[#d4af37] text-xs hover:underline"
          >
            View
          </Link>
        </div>
      </div>
    </div>
  );
}
