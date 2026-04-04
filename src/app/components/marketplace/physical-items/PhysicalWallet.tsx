'use client';

import { useState } from 'react';
import {
  Wallet, Coins, ArrowUpRight, ArrowDownLeft, Link2, RefreshCw,
  ShieldCheck, ChevronRight, Copy, CheckCircle, ExternalLink
} from 'lucide-react';

interface PhysicalWalletProps {
  compact?: boolean;
}

const MOCK_TRANSACTIONS = [
  { id: 'tx1', type: 'purchase' as const, label: 'Lakota Beadwork Bracelet', amount: -185, currency: 'INDI', time: '2h ago' },
  { id: 'tx2', type: 'received' as const, label: 'Community reward', amount: +50, currency: 'INDI', time: '1d ago' },
  { id: 'tx3', type: 'purchase' as const, label: 'Navajo Sand-Painted Pot', amount: -220, currency: 'INDI', time: '3d ago' },
  { id: 'tx4', type: 'received' as const, label: 'Top-up via card', amount: +500, currency: 'INDI', time: '5d ago' },
];

const RATE = 0.82; // 1 INDI = $0.82 USD

export default function PhysicalWallet({ compact = false }: PhysicalWalletProps) {
  const [connected, setConnected] = useState(false);
  const [balance] = useState(1340);
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(!compact);

  const walletAddress = '0x3F7a...d4B2';
  const fullAddress = '0x3F7a9e12b3c4d5e6f7a8b9c0d1e2f3a4b5c6d4B2';

  const handleCopy = () => {
    navigator.clipboard.writeText(fullAddress).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!connected) {
    return (
      <div className="bg-[#141414] rounded-2xl border border-[#d4af37]/20 p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-[#d4af37]/10 flex items-center justify-center">
            <Wallet size={20} className="text-[#d4af37]" />
          </div>
          <div>
            <h3 className="text-white font-semibold">INDI Wallet</h3>
            <p className="text-gray-500 text-xs">Sign in to pay and earn rewards</p>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          {[
            'Pay directly for physical items',
            'Earn 2% INDI cashback on every purchase',
            'Instant maker payouts â€” no delays',
          ].map((feat) => (
            <div key={feat} className="flex items-center gap-2 text-sm text-gray-400">
              <ShieldCheck size={13} className="text-[#d4af37] flex-shrink-0" />
              {feat}
            </div>
          ))}
        </div>

        <button
          onClick={() => setConnected(true)}
          className="w-full py-3 bg-[#d4af37] text-black font-semibold rounded-xl hover:bg-[#f4e4a6] transition-colors flex items-center justify-center gap-2"
        >
          <Link2 size={16} />
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#141414] rounded-2xl border border-[#d4af37]/20 overflow-hidden">
      {/* Balance header */}
      <div className="p-5 bg-gradient-to-br from-[#d4af37]/10 to-transparent border-b border-[#d4af37]/10">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#d4af37]/20 flex items-center justify-center">
              <Coins size={16} className="text-[#d4af37]" />
            </div>
            <div>
              <p className="text-gray-400 text-xs">INDI Balance</p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-white text-2xl font-bold">{balance.toLocaleString()}</span>
                <span className="text-[#d4af37] text-sm font-medium">INDI</span>
              </div>
              <p className="text-gray-500 text-xs">â‰ˆ ${(balance * RATE).toFixed(2)} USD</p>
            </div>
          </div>
          <button
            className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-500 hover:text-white transition-colors"
            title="Refresh"
          >
            <RefreshCw size={13} />
          </button>
        </div>

        {/* Wallet address */}
        <div className="flex items-center gap-2 bg-[#0a0a0a] rounded-xl px-3 py-2">
          <span className="text-gray-400 text-xs font-mono flex-1">{walletAddress}</span>
          <button onClick={handleCopy} className="text-gray-500 hover:text-[#d4af37] transition-colors">
            {copied ? <CheckCircle size={13} className="text-green-400" /> : <Copy size={13} />}
          </button>
          <a
            href={`https://xrpscan.com/account/${fullAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-500 hover:text-[#d4af37] transition-colors"
          >
            <ExternalLink size={13} />
          </a>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 divide-x divide-white/5 border-b border-white/5">
        {[
          { label: 'Top Up', icon: <ArrowDownLeft size={14} />, color: 'text-green-400' },
          { label: 'Send', icon: <ArrowUpRight size={14} />, color: 'text-blue-400' },
        ].map(({ label, icon, color }) => (
          <button
            key={label}
            className="flex items-center justify-center gap-1.5 py-3 hover:bg-white/5 transition-colors"
          >
            <span className={color}>{icon}</span>
            <span className="text-gray-300 text-sm">{label}</span>
          </button>
        ))}
      </div>

      {/* Transaction history toggle */}
      {compact && (
        <button
          onClick={() => setExpanded((e) => !e)}
          className="w-full flex items-center justify-between px-5 py-3 hover:bg-white/5 transition-colors"
        >
          <span className="text-gray-400 text-sm">Recent Transactions</span>
          <ChevronRight size={14} className={`text-gray-500 transition-transform ${expanded ? 'rotate-90' : ''}`} />
        </button>
      )}

      {/* Transactions */}
      {(!compact || expanded) && (
        <div className="divide-y divide-white/5">
          {!compact && (
            <div className="px-5 py-3">
              <span className="text-gray-400 text-sm font-medium">Recent Transactions</span>
            </div>
          )}
          {MOCK_TRANSACTIONS.map((tx) => (
            <div key={tx.id} className="flex items-center gap-3 px-5 py-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                tx.type === 'purchase' ? 'bg-red-500/10' : 'bg-green-500/10'
              }`}>
                {tx.type === 'purchase'
                  ? <ArrowUpRight size={14} className="text-red-400" />
                  : <ArrowDownLeft size={14} className="text-green-400" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white text-sm truncate">{tx.label}</div>
                <div className="text-gray-500 text-xs">{tx.time}</div>
              </div>
              <div className={`text-sm font-semibold flex-shrink-0 ${
                tx.amount < 0 ? 'text-red-400' : 'text-green-400'
              }`}>
                {tx.amount > 0 ? '+' : ''}{tx.amount} {tx.currency}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cashback meter */}
      <div className="p-4 border-t border-white/5 bg-[#0a0a0a]">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-gray-500 text-xs">Cashback earned this month</span>
          <span className="text-[#d4af37] text-xs font-semibold">+8.1 INDI</span>
        </div>
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[#d4af37] to-[#f4e4a6] rounded-full" style={{ width: '27%' }} />
        </div>
        <p className="text-gray-600 text-xs mt-1">27% to next tier reward</p>
      </div>
    </div>
  );
}



