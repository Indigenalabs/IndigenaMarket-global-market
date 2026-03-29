'use client';

import { useState } from 'react';
import { createBnplApplicationApi, purchaseTaxReportApi, requestInstantPayoutApi } from '@/app/lib/financialServicesApi';
import { requireWalletAction } from '@/app/lib/requireWalletAction';

export default function WalletServicesPage() {
  const [feedback, setFeedback] = useState('');

  async function requestPayout() {
    const identity = await requireWalletAction('request an instant payout');
    const payout = await requestInstantPayoutApi({ actorId: identity.actorId, walletAddress: identity.wallet, amount: 420 });
    setFeedback(`Instant payout requested. Fee ${payout.feeAmount.toFixed(2)} USD, net ${payout.netAmount.toFixed(2)} USD.`);
  }

  async function applyBnpl() {
    const identity = await requireWalletAction('apply for BNPL');
    const app = await createBnplApplicationApi({ actorId: identity.actorId, orderId: `market-order-${identity.actorId}`, amount: 560 });
    setFeedback(`BNPL submitted to ${app.partner}. Service fee ${app.feeAmount.toFixed(2)} USD.`);
  }

  async function buyTaxReport() {
    const identity = await requireWalletAction('purchase a tax report');
    const report = await purchaseTaxReportApi({ actorId: identity.actorId, taxYear: 2025 });
    setFeedback(`Tax report purchased for ${report.taxYear}. Fee ${report.feeAmount.toFixed(2)} USD.`);
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] px-6 py-12 text-white">
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="rounded-[28px] border border-[#d4af37]/20 bg-[#111111] p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-[#d4af37]">Financial services</p>
          <h1 className="mt-2 text-4xl font-semibold">Payouts, BNPL, tax reporting</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-400">Phase 4 adds service-fee-backed financial operations for payouts, installment lanes, and tax-report generation.</p>
        </section>

        <div className="grid gap-6 md:grid-cols-3">
          <button onClick={() => void requestPayout()} className="rounded-[24px] border border-white/10 bg-[#111111] p-6 text-left">
            <p className="text-sm font-semibold text-white">Instant payout</p>
            <p className="mt-2 text-sm text-gray-400">1% service fee, faster settlement than standard payout timing.</p>
          </button>
          <button onClick={() => void applyBnpl()} className="rounded-[24px] border border-white/10 bg-[#111111] p-6 text-left">
            <p className="text-sm font-semibold text-white">BNPL partner lane</p>
            <p className="mt-2 text-sm text-gray-400">Submit larger orders to the partner installment program.</p>
          </button>
          <button onClick={() => void buyTaxReport()} className="rounded-[24px] border border-white/10 bg-[#111111] p-6 text-left">
            <p className="text-sm font-semibold text-white">Tax report</p>
            <p className="mt-2 text-sm text-gray-400">Purchase a generated tax packet for creator accounting and filing support.</p>
          </button>
        </div>

        <section className="rounded-[24px] border border-white/10 bg-[#111111] p-6">
          <h2 className="text-lg font-semibold text-white">Policy</h2>
          <p className="mt-3 text-sm leading-7 text-gray-400">KYC, AML, lending-partner, and reporting obligations remain enforced operational rules. This surface starts the request flow; ops review and reconciliation happen in financial services admin.</p>
          {feedback ? <p className="mt-4 text-sm text-[#f3deb1]">{feedback}</p> : null}
        </section>
      </div>
    </main>
  );
}
