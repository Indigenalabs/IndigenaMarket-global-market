'use client';

import { useMemo, useState } from 'react';
import { ArrowDownRight, ArrowUpRight, Banknote, DollarSign, Wallet } from 'lucide-react';

type TransactionType = 'sale' | 'refund' | 'payout';

type Transaction = {
  id: string;
  description: string;
  courseName: string;
  studentName: string;
  date: string;
  amount: number;
  type: TransactionType;
};

const transactions: Transaction[] = [
  {
    id: 'txn-1',
    description: 'Course sale',
    courseName: 'Navajo Weaving Masterclass',
    studentName: 'John Smith',
    date: '2026-03-24',
    amount: 149,
    type: 'sale'
  },
  {
    id: 'txn-2',
    description: 'Course sale',
    courseName: 'Lakota Language Fundamentals',
    studentName: 'Sarah Johnson',
    date: '2026-03-23',
    amount: 199,
    type: 'sale'
  },
  {
    id: 'txn-3',
    description: 'Monthly payout',
    courseName: '-',
    studentName: '-',
    date: '2026-03-20',
    amount: -1500,
    type: 'payout'
  },
  {
    id: 'txn-4',
    description: 'Refund',
    courseName: 'Indigenous Entrepreneurship',
    studentName: 'James Brown',
    date: '2026-03-18',
    amount: -199,
    type: 'refund'
  }
];

const earningsSnapshot = {
  available: 4523,
  pending: 800,
  thisMonth: 2845,
  lastMonth: 2210,
  lifetime: 15600
};

export default function InstructorEarningsPage() {
  const [range, setRange] = useState<'30d' | '90d' | 'year'>('30d');

  const growth = useMemo(() => {
    if (earningsSnapshot.lastMonth === 0) return 0;
    return Math.round(((earningsSnapshot.thisMonth - earningsSnapshot.lastMonth) / earningsSnapshot.lastMonth) * 100);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <header className="border-b border-[#d4af37]/20 bg-[#141414] px-6 py-5">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-[#d4af37]">Instructor earnings</p>
            <h1 className="mt-2 text-3xl font-semibold">See revenue, payouts, and transaction movement clearly.</h1>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-white/66">
              This route is now a stable earnings surface instead of a broken page. It shows available balance, pending payout value, and recent income movement.
            </p>
          </div>
          <select
            value={range}
            onChange={(event) => setRange(event.target.value as '30d' | '90d' | 'year')}
            className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none"
          >
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="year">This year</option>
          </select>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <section className="grid gap-4 md:grid-cols-4">
          <div className="rounded-[26px] bg-[linear-gradient(135deg,#d4af37,#b78a18)] p-5 text-black">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/25">
              <Wallet size={20} />
            </div>
            <p className="mt-4 text-sm text-black/68">Available balance</p>
            <p className="mt-1 text-3xl font-semibold">{earningsSnapshot.available.toLocaleString()} INDI</p>
          </div>
          <div className="rounded-[26px] border border-white/10 bg-[#141414] p-5">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#d4af37]/12 text-[#d4af37]">
              <DollarSign size={20} />
            </div>
            <p className="mt-4 text-sm text-white/56">This month</p>
            <p className="mt-1 text-3xl font-semibold text-white">{earningsSnapshot.thisMonth.toLocaleString()} INDI</p>
            <p className="mt-2 inline-flex items-center gap-1 text-sm text-emerald-300">
              <ArrowUpRight size={15} />
              {growth}% vs last month
            </p>
          </div>
          <div className="rounded-[26px] border border-white/10 bg-[#141414] p-5">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/8 text-white/72">
              <Banknote size={20} />
            </div>
            <p className="mt-4 text-sm text-white/56">Pending payout</p>
            <p className="mt-1 text-3xl font-semibold text-white">{earningsSnapshot.pending.toLocaleString()} INDI</p>
          </div>
          <div className="rounded-[26px] border border-white/10 bg-[#141414] p-5">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/8 text-white/72">
              <ArrowUpRight size={20} />
            </div>
            <p className="mt-4 text-sm text-white/56">Lifetime earnings</p>
            <p className="mt-1 text-3xl font-semibold text-white">{earningsSnapshot.lifetime.toLocaleString()} INDI</p>
          </div>
        </section>

        <section className="mt-8 rounded-[30px] border border-white/10 bg-[#141414] p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] text-[#d4af37]">Recent transactions</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Revenue movement for the selected period</h2>
            </div>
            <div className="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm text-white/64">
              Range: {range === '30d' ? '30 days' : range === '90d' ? '90 days' : 'Year'}
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {transactions.map((transaction) => {
              const isPositive = transaction.amount >= 0;
              return (
                <article key={transaction.id} className="flex flex-wrap items-center justify-between gap-4 rounded-[20px] border border-white/10 bg-black/20 p-4">
                  <div>
                    <p className="font-medium text-white">{transaction.description}</p>
                    <p className="mt-1 text-sm text-white/56">
                      {transaction.courseName !== '-' ? `${transaction.courseName} | ` : ''}
                      {transaction.studentName !== '-' ? transaction.studentName : 'Platform payout'}
                    </p>
                    <p className="mt-1 text-xs uppercase tracking-[0.16em] text-white/36">{transaction.date}</p>
                  </div>
                  <div className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${
                    isPositive
                      ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200'
                      : 'border-rose-400/20 bg-rose-400/10 text-rose-200'
                  }`}>
                    {isPositive ? <ArrowUpRight size={15} /> : <ArrowDownRight size={15} />}
                    {isPositive ? '+' : ''}
                    {transaction.amount} INDI
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
