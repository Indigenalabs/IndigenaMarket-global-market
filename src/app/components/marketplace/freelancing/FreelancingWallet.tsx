'use client';

import { useState } from 'react';
import { Wallet, ArrowUpRight, ArrowDownLeft, Eye, EyeOff, Copy, Plus, Send, Receipt } from 'lucide-react';

interface FreelancingWalletProps {
  compact?: boolean;
}

const mockTransactions = [
  { id: '1', type: 'incoming', amount: 750, from: 'Documentary Film Co.', service: 'Cultural Consulting', date: 'Today' },
  { id: '2', type: 'incoming', amount: 200, from: 'Tribal Arts Gallery', service: 'Brand Identity', date: 'Yesterday' },
  { id: '3', type: 'withdrawal', amount: 500, to: 'Bank Account', date: '2 days ago' },
  { id: '4', type: 'incoming', amount: 1200, from: 'Media Collective', service: 'Full Production Package', date: '3 days ago' },
];

export default function FreelancingWallet({ compact = false }: FreelancingWalletProps) {
  const [showBalance, setShowBalance] = useState(true);
  const [balance] = useState(4850);
  const [pendingBalance] = useState(750);

  if (compact) {
    return (
      <div className="bg-gradient-to-r from-[#d4af37]/20 via-[#141414] to-[#DC143C]/10 border border-[#d4af37]/20 rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#d4af37]/20 flex items-center justify-center">
              <Wallet size={24} className="text-[#d4af37]" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Your Freelancing Wallet</p>
              <div className="flex items-center gap-2">
                <p className="text-white text-2xl font-bold">
                  {showBalance ? `$${balance.toLocaleString()}` : '****'}
                </p>
                <button onClick={() => setShowBalance(!showBalance)} className="text-gray-500 hover:text-white">
                  {showBalance ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {pendingBalance > 0 && (
                <p className="text-gray-500 text-xs">${pendingBalance} pending clearance</p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-[#d4af37] text-black font-medium rounded-lg hover:bg-[#f4e4a6] transition-colors">
              <Plus size={16} />
              Withdraw
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-[#141414] border border-[#d4af37]/30 text-[#d4af37] rounded-lg hover:bg-[#d4af37]/10 transition-colors">
              <Receipt size={16} />
              History
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#141414] border border-[#d4af37]/20 rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#d4af37]/20 flex items-center justify-center">
            <Wallet size={24} className="text-[#d4af37]" />
          </div>
          <div>
            <h2 className="text-white text-lg font-bold">Freelancing Wallet</h2>
            <p className="text-gray-400 text-sm">Manage your earnings</p>
          </div>
        </div>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gradient-to-br from-[#d4af37]/20 to-[#141414] rounded-xl p-4 border border-[#d4af37]/30">
          <p className="text-gray-400 text-sm mb-1">Available Balance</p>
          <div className="flex items-center gap-2">
            <p className="text-white text-2xl font-bold">
              {showBalance ? `$${balance.toLocaleString()}` : '****'}
            </p>
            <button onClick={() => setShowBalance(!showBalance)} className="text-gray-500 hover:text-white">
              {showBalance ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
            <button className="text-gray-500 hover:text-white ml-auto">
              <Copy size={14} />
            </button>
          </div>
        </div>
        <div className="bg-[#0f0f0f] rounded-xl p-4 border border-white/5">
          <p className="text-gray-400 text-sm mb-1">Pending Clearance</p>
          <p className="text-[#d4af37] text-2xl font-bold">${pendingBalance.toLocaleString()}</p>
          <p className="text-gray-500 text-xs mt-1">Available in 3-5 days</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3 mb-6">
        <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#d4af37] text-black font-medium rounded-xl hover:bg-[#f4e4a6] transition-colors">
          <ArrowUpRight size={18} />
          Withdraw
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#0f0f0f] border border-[#d4af37]/30 text-[#d4af37] rounded-xl hover:bg-[#d4af37]/10 transition-colors">
          <Send size={18} />
          Transfer
        </button>
      </div>

      {/* Recent Transactions */}
      <div>
        <h3 className="text-white font-medium mb-3">Recent Transactions</h3>
        <div className="space-y-2">
          {mockTransactions.map((tx) => (
            <div key={tx.id} className="flex items-center gap-3 p-3 bg-[#0f0f0f] rounded-lg">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                tx.type === 'incoming' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
              }`}>
                {tx.type === 'incoming' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm truncate">{tx.type === 'incoming' ? tx.from : tx.to}</p>
                <p className="text-gray-500 text-xs">{tx.service || 'Withdrawal'} • {tx.date}</p>
              </div>
              <p className={`font-medium ${tx.type === 'incoming' ? 'text-green-400' : 'text-red-400'}`}>
                {tx.type === 'incoming' ? '+' : '-'}${tx.amount}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
