'use client';

import { useState } from 'react';
import {
  ShoppingCart, Gavel, Send, ArrowUpRight, ArrowDownRight,
  Download, ExternalLink, Filter, Search, Clock
} from 'lucide-react';

type TxType = 'purchase' | 'sale' | 'bid_placed' | 'bid_won' | 'bid_lost' | 'offer_sent' | 'offer_received' | 'offer_accepted';

interface Transaction {
  id: string;
  type: TxType;
  artworkTitle: string;
  artworkImage: string;
  artworkId: string;
  counterparty: string;
  amount: number;
  fee?: number;
  currency: string;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  timestamp: string;
  txHash?: string;
}

interface TransactionHistoryProps {
  transactions?: Transaction[];
  onViewArtwork?: (artworkId: string) => void;
  onViewTx?: (txHash: string) => void;
}

const mockTransactions: Transaction[] = [
  { id: '1', type: 'purchase', artworkTitle: 'Sacred Buffalo Spirit', artworkImage: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=80&h=80&fit=crop', artworkId: '1', counterparty: 'LakotaDreams', amount: 275, fee: 22, currency: 'INDI', status: 'completed', timestamp: '2 hours ago', txHash: 'ABC123' },
  { id: '2', type: 'bid_placed', artworkTitle: 'Thunderbird Rising', artworkImage: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=80&h=80&fit=crop', artworkId: '3', counterparty: 'CoastalArtist', amount: 500, currency: 'INDI', status: 'pending', timestamp: '45 min ago' },
  { id: '3', type: 'offer_sent', artworkTitle: 'Medicine Wheel', artworkImage: 'https://images.unsplash.com/photo-1549887534-1541e9326642?w=80&h=80&fit=crop', artworkId: '4', counterparty: 'PlainsElder', amount: 450, currency: 'INDI', status: 'pending', timestamp: '1 day ago' },
  { id: '4', type: 'sale', artworkTitle: 'Sky Warriors', artworkImage: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=80&h=80&fit=crop', artworkId: '2', counterparty: 'ArtCollector99', amount: 580, fee: 46, currency: 'INDI', status: 'completed', timestamp: '2 days ago', txHash: 'DEF456' },
  { id: '5', type: 'bid_lost', artworkTitle: 'Dreamcatcher #1', artworkImage: 'https://images.unsplash.com/photo-1515405295579-ba7b45403062?w=80&h=80&fit=crop', artworkId: '5', counterparty: 'WinningBidder', amount: 95, currency: 'INDI', status: 'refunded', timestamp: '3 days ago' },
];

const txConfig: Record<TxType, { label: string; icon: React.ReactNode; isOutflow: boolean; color: string }> = {
  purchase:       { label: 'Purchased',        icon: <ShoppingCart size={14} />, isOutflow: true,  color: 'text-red-400' },
  sale:           { label: 'Sold',             icon: <ArrowUpRight size={14} />, isOutflow: false, color: 'text-green-400' },
  bid_placed:     { label: 'Bid Placed',       icon: <Gavel size={14} />,        isOutflow: true,  color: 'text-yellow-400' },
  bid_won:        { label: 'Bid Won',          icon: <Gavel size={14} />,        isOutflow: true,  color: 'text-green-400' },
  bid_lost:       { label: 'Bid Refunded',     icon: <ArrowDownRight size={14} />, isOutflow: false, color: 'text-gray-400' },
  offer_sent:     { label: 'Offer Sent',       icon: <Send size={14} />,         isOutflow: false, color: 'text-[#d4af37]' },
  offer_received: { label: 'Offer Received',   icon: <Send size={14} />,         isOutflow: false, color: 'text-[#d4af37]' },
  offer_accepted: { label: 'Offer Accepted',   icon: <ShoppingCart size={14} />, isOutflow: true,  color: 'text-green-400' },
};

const statusColors: Record<Transaction['status'], string> = {
  completed: 'text-green-400 bg-green-400/10',
  pending:   'text-yellow-400 bg-yellow-400/10',
  failed:    'text-red-400 bg-red-400/10',
  refunded:  'text-gray-400 bg-gray-400/10',
};

export default function TransactionHistory({
  transactions = mockTransactions,
  onViewArtwork,
  onViewTx
}: TransactionHistoryProps) {
  const [typeFilter, setTypeFilter] = useState<TxType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = transactions.filter(tx => {
    if (typeFilter !== 'all' && tx.type !== typeFilter) return false;
    if (searchQuery && !tx.artworkTitle.toLowerCase().includes(searchQuery.toLowerCase()) && !tx.counterparty.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const totalSpent = transactions.filter(t => txConfig[t.type].isOutflow && t.status === 'completed').reduce((s, t) => s + t.amount, 0);
  const totalEarned = transactions.filter(t => !txConfig[t.type].isOutflow && t.status === 'completed').reduce((s, t) => s + t.amount, 0);
  const totalFees = transactions.filter(t => t.fee && t.status === 'completed').reduce((s, t) => s + (t.fee || 0), 0);

  return (
    <div className="bg-[#141414] rounded-xl border border-[#d4af37]/20 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-[#d4af37]/10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-bold text-lg">Transaction History</h2>
          <button className="flex items-center gap-2 px-3 py-1.5 bg-[#0a0a0a] text-gray-400 hover:text-white rounded-lg text-sm transition-colors">
            <Download size={14} />
            Export
          </button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="p-3 bg-[#0a0a0a] rounded-lg text-center">
            <p className="text-gray-400 text-xs mb-1">Total Spent</p>
            <p className="text-red-400 font-bold">{totalSpent} INDI</p>
          </div>
          <div className="p-3 bg-[#0a0a0a] rounded-lg text-center">
            <p className="text-gray-400 text-xs mb-1">Total Earned</p>
            <p className="text-green-400 font-bold">{totalEarned} INDI</p>
          </div>
          <div className="p-3 bg-[#0a0a0a] rounded-lg text-center">
            <p className="text-gray-400 text-xs mb-1">Fees Paid</p>
            <p className="text-gray-300 font-bold">{totalFees} INDI</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by artwork or user..."
            className="w-full bg-[#0a0a0a] border border-[#d4af37]/20 rounded-lg pl-9 pr-4 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#d4af37]"
          />
        </div>

        {/* Type Filter */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {(['all', 'purchase', 'sale', 'bid_placed', 'offer_sent'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors capitalize ${
                typeFilter === type
                  ? 'bg-[#d4af37] text-black'
                  : 'bg-[#0a0a0a] text-gray-400 hover:text-white'
              }`}
            >
              {type === 'all' ? 'All' : type.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions List */}
      <div className="divide-y divide-[#d4af37]/10 max-h-[500px] overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="p-8 text-center">
            <Clock size={28} className="text-gray-600 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">No transactions found</p>
          </div>
        ) : (
          filtered.map((tx) => {
            const cfg = txConfig[tx.type];
            const isExpanded = expandedId === tx.id;

            return (
              <div key={tx.id} className="hover:bg-[#1a1a1a] transition-colors">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : tx.id)}
                  className="w-full flex items-center gap-3 p-3 text-left"
                >
                  {/* Artwork image */}
                  <div
                    className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer"
                    onClick={(e) => { e.stopPropagation(); onViewArtwork?.(tx.artworkId); }}
                  >
                    <img src={tx.artworkImage} alt={tx.artworkTitle} className="w-full h-full object-cover" />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`flex items-center gap-1 text-xs font-medium ${cfg.color}`}>
                        {cfg.icon}
                        {cfg.label}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded-full text-xs ${statusColors[tx.status]}`}>
                        {tx.status}
                      </span>
                    </div>
                    <p className="text-white text-sm truncate">{tx.artworkTitle}</p>
                    <p className="text-gray-500 text-xs">{cfg.isOutflow ? 'to' : 'from'} {tx.counterparty}</p>
                  </div>

                  {/* Amount + time */}
                  <div className="text-right flex-shrink-0">
                    <p className={`font-bold text-sm ${cfg.isOutflow ? 'text-red-400' : 'text-green-400'}`}>
                      {cfg.isOutflow ? '-' : '+'}{tx.amount} {tx.currency}
                    </p>
                    <p className="text-gray-500 text-xs flex items-center justify-end gap-1">
                      <Clock size={10} />
                      {tx.timestamp}
                    </p>
                  </div>
                </button>

                {/* Expanded Detail */}
                {isExpanded && (
                  <div className="px-3 pb-3 bg-[#0a0a0a] mx-3 mb-3 rounded-lg">
                    <div className="grid grid-cols-2 gap-3 p-3 text-xs">
                      <div>
                        <p className="text-gray-500 mb-0.5">Amount</p>
                        <p className="text-white font-semibold">{tx.amount} {tx.currency}</p>
                      </div>
                      {tx.fee && (
                        <div>
                          <p className="text-gray-500 mb-0.5">Platform Fee (8%)</p>
                          <p className="text-gray-300 font-semibold">{tx.fee} {tx.currency}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-gray-500 mb-0.5">Counterparty</p>
                        <p className="text-white font-semibold">{tx.counterparty}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 mb-0.5">Status</p>
                        <span className={`px-2 py-0.5 rounded-full ${statusColors[tx.status]}`}>
                          {tx.status}
                        </span>
                      </div>
                    </div>
                    {tx.txHash && (
                      <button
                        onClick={() => onViewTx?.(tx.txHash!)}
                        className="flex items-center gap-2 text-[#d4af37] text-xs hover:underline"
                      >
                        <ExternalLink size={12} />
                        View on XRPL Explorer
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
