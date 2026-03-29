'use client';

import { useState } from 'react';
import { createFulfillmentRequest, createInsuranceClaimRequest, createInventoryToolsSubscription, createLogisticsQuote, issueNfcTagRequest } from '@/app/lib/logisticsApi';

export default function LogisticsPage() {
  const [feedback, setFeedback] = useState('');

  async function quoteShipping() {
    try {
      const quote = await createLogisticsQuote({ origin: 'Phoenix, AZ', destination: 'Toronto, ON', weightKg: 3.5, insured: true });
      setFeedback(`Shipping quote: ${quote.carrier} · ${quote.currency} ${quote.total.toFixed(2)} total including ${quote.markupAmount.toFixed(2)} markup and ${quote.insurancePremium.toFixed(2)} insurance.`);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Unable to create shipping quote.');
    }
  }

  async function fileClaim() {
    try {
      const claim = await createInsuranceClaimRequest({ orderId: 'order-physical-1', actorId: 'creator-warehouse', claimantName: 'Studio owner', amount: 120, reason: 'Damage in transit' });
      setFeedback(`Insurance claim submitted for ${claim.orderId}. Current status: ${claim.status}.`);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Unable to create insurance claim.');
    }
  }

  async function createFulfillment() {
    try {
      const record = await createFulfillmentRequest({ actorId: 'creator-warehouse', orderId: 'order-physical-1', warehouse: 'Desert Southwest Hub' });
      setFeedback(`Fulfillment order ${record.orderId} entered at ${record.warehouse}.`);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Unable to create fulfillment order.');
    }
  }

  async function createTag() {
    try {
      const tag = await issueNfcTagRequest({ actorId: 'creator-warehouse', listingId: 'listing-physical-1', encodedUrl: 'https://indigena.market/provenance/listing-physical-1' });
      setFeedback(`NFC tag issued for ${tag.listingId} at ${tag.unitFee.toFixed(2)} USD.`);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Unable to issue NFC tag.');
    }
  }

  async function activateInventory() {
    try {
      const subscription = await createInventoryToolsSubscription({ actorId: 'creator-warehouse', catalogSize: 86 });
      setFeedback(`Inventory tools active for ${subscription.catalogSize} items at ${subscription.monthlyFee.toFixed(2)} USD/month.`);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Unable to activate inventory tools.');
    }
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] px-6 py-12 text-white">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-[28px] border border-[#d4af37]/20 bg-[#111111] p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-[#d4af37]">Logistics & operations</p>
          <h1 className="mt-2 text-4xl font-semibold">Shipping, insurance, fulfillment, NFC, inventory</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-400">Phase 4 adds monetized operating tools for physical delivery, authenticity, and warehouse support.</p>
        </section>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">
          <button onClick={() => void quoteShipping()} className="rounded-[24px] border border-white/10 bg-[#111111] p-5 text-left"><p className="text-white font-semibold">Shipping quote</p><p className="mt-2 text-sm text-gray-400">Carrier markup and insurance quote.</p></button>
          <button onClick={() => void fileClaim()} className="rounded-[24px] border border-white/10 bg-[#111111] p-5 text-left"><p className="text-white font-semibold">Insurance claim</p><p className="mt-2 text-sm text-gray-400">Claim handling with payout review.</p></button>
          <button onClick={() => void createFulfillment()} className="rounded-[24px] border border-white/10 bg-[#111111] p-5 text-left"><p className="text-white font-semibold">Fulfillment</p><p className="mt-2 text-sm text-gray-400">Warehouse receiving and handling fees.</p></button>
          <button onClick={() => void createTag()} className="rounded-[24px] border border-white/10 bg-[#111111] p-5 text-left"><p className="text-white font-semibold">NFC tag</p><p className="mt-2 text-sm text-gray-400">$5 authenticity tag issuance.</p></button>
          <button onClick={() => void activateInventory()} className="rounded-[24px] border border-white/10 bg-[#111111] p-5 text-left"><p className="text-white font-semibold">Inventory tools</p><p className="mt-2 text-sm text-gray-400">$10/month catalog ops subscription.</p></button>
        </div>
        {feedback ? <section className="rounded-[24px] border border-white/10 bg-[#111111] p-6 text-sm text-[#f3deb1]">{feedback}</section> : null}
      </div>
    </main>
  );
}
