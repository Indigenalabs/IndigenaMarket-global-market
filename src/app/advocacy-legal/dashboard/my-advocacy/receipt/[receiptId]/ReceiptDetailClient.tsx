'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import AdvocacyFrame from '../../../../components/AdvocacyFrame';
import {
  fetchAdvocacyServerSnapshot,
  getAdvocacyReceiptRecord,
  getDashboardSnapshot,
  type AdvocacyDonation,
  type AdvocacyDonationReceipt
} from '@/app/lib/advocacyLegalClientStore';

function formatMoney(amount: number, currency = 'USD') {
  return `${currency} $${amount.toLocaleString()}`;
}

function receiptStatusLabel(status: string) {
  if (status === 'refund_requested') return 'Refund Review Pending';
  if (status === 'refunded') return 'Refunded';
  if (status === 'cancelled') return 'Cancelled';
  return 'Settled';
}

function downloadReceipt(receipt: AdvocacyDonationReceipt, donation: AdvocacyDonation | null) {
  const content = [
    'INDIGENA GLOBAL MARKET',
    'Pillar 9 Donation Receipt',
    '',
    `Receipt ID: ${receipt.id}`,
    `Payment Reference: ${receipt.paymentIntentId}`,
    `Campaign: ${receipt.campaignTitle}`,
    `Donor: ${receipt.donorName}`,
    `Amount: ${formatMoney(receipt.amount, receipt.currency)}`,
    `Payment Status: ${receipt.paymentStatus}`,
    `Donation Status: ${receiptStatusLabel(donation?.status || 'succeeded')}`,
    `Issued: ${new Date(receipt.createdAt).toLocaleString()}`
  ].join('\n');

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `advocacy-receipt-${receipt.id}.txt`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function downloadReceiptHtml(receipt: AdvocacyDonationReceipt, donation: AdvocacyDonation | null) {
  const status = receiptStatusLabel(donation?.status || receipt.paymentStatus);
  const issuedAt = new Date(receipt.createdAt).toLocaleString();
  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Indigena Advocacy Receipt ${receipt.id}</title>
    <style>
      body { font-family: Georgia, "Times New Roman", serif; margin: 0; padding: 32px; background: #f6f1e7; color: #18130f; }
      .sheet { max-width: 860px; margin: 0 auto; background: #fffdf8; border: 1px solid #d8c38a; border-radius: 20px; overflow: hidden; box-shadow: 0 24px 60px rgba(0,0,0,0.08); }
      .hero { padding: 28px 32px; background: linear-gradient(135deg, #1a1212, #2d2114); color: white; }
      .eyebrow { font-size: 11px; letter-spacing: 0.24em; text-transform: uppercase; color: #d4af37; }
      .title { margin: 10px 0 4px; font-size: 34px; font-weight: 700; }
      .subtitle { margin: 0; color: rgba(255,255,255,0.74); font-size: 15px; }
      .badge { display: inline-block; margin-top: 14px; padding: 8px 14px; border: 1px solid #d4af37; border-radius: 999px; color: #d4af37; font-size: 12px; text-transform: uppercase; letter-spacing: 0.16em; }
      .content { padding: 28px 32px 32px; }
      .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
      .card { border: 1px solid #eadfbd; border-radius: 16px; padding: 16px; background: #fffaf0; }
      .label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.18em; color: #8c7952; }
      .value { margin-top: 8px; font-size: 16px; font-weight: 600; color: #16120d; }
      .statement { margin-top: 18px; border: 1px solid #eadfbd; border-radius: 16px; padding: 18px; background: #fff; }
      .statement p { margin: 0; line-height: 1.6; color: #4b4033; }
      .footer { margin-top: 18px; display: flex; justify-content: space-between; gap: 20px; color: #766751; font-size: 12px; }
      @media print {
        body { background: white; padding: 0; }
        .sheet { box-shadow: none; border-radius: 0; }
      }
    </style>
  </head>
  <body>
    <div class="sheet">
      <div class="hero">
        <div class="eyebrow">Indigena Global Market | Pillar 9</div>
        <div class="title">Donation Receipt</div>
        <p class="subtitle">Payment confirmation for Indigenous-led legal defense and rights protection.</p>
        <div class="badge">${status}</div>
      </div>
      <div class="content">
        <div class="grid">
          <div class="card"><div class="label">Receipt ID</div><div class="value">${receipt.id}</div></div>
          <div class="card"><div class="label">Payment Reference</div><div class="value">${receipt.paymentIntentId}</div></div>
          <div class="card"><div class="label">Campaign</div><div class="value">${receipt.campaignTitle}</div></div>
          <div class="card"><div class="label">Donor</div><div class="value">${receipt.donorName}</div></div>
          <div class="card"><div class="label">Amount</div><div class="value">${formatMoney(receipt.amount, receipt.currency)}</div></div>
          <div class="card"><div class="label">Donation Status</div><div class="value">${receiptStatusLabel(donation?.status || 'succeeded')}</div></div>
        </div>
        <div class="statement">
          <p>This receipt acknowledges support directed to Indigenous-led advocacy, treaty defense, cultural rights protection, and legal response through Indigena Global Market.</p>
        </div>
        <div class="footer">
          <span>Issued ${issuedAt}</span>
          <span>Receipt status: ${status}</span>
        </div>
      </div>
    </div>
  </body>
</html>`;

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `advocacy-receipt-${receipt.id}.html`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export default function ReceiptDetailClient({ receiptId }: { receiptId: string }) {
  const [record, setRecord] = useState<{
    receipt: AdvocacyDonationReceipt;
    donation: AdvocacyDonation | null;
  } | null>(() => getAdvocacyReceiptRecord(receiptId));
  const [resolved, setResolved] = useState(() => Boolean(getAdvocacyReceiptRecord(receiptId)));

  useEffect(() => {
    let active = true;
    const local = getAdvocacyReceiptRecord(receiptId);
    if (local) {
      setRecord(local);
      setResolved(true);
    }

    (async () => {
      try {
        const response = await fetch(`/api/advocacy-legal/ops/receipt/${receiptId}`, { method: 'GET' });
        if (response.ok) {
          const json = (await response.json()) as {
            data?: {
              receipt?: AdvocacyDonationReceipt;
              donation?: AdvocacyDonation | null;
            };
          };
          if (!active) return;
          if (json?.data?.receipt) {
            setRecord({
              receipt: json.data.receipt,
              donation: json.data.donation || null
            });
            setResolved(true);
            return;
          }
        }
      } catch {
        // Fall back to the existing snapshot lookup when the direct detail route is unavailable.
      }

      const server = await fetchAdvocacyServerSnapshot();
      if (!active || !server || typeof server !== 'object') return;
      const snapshot = server as {
        recentDonationReceipts?: AdvocacyDonationReceipt[];
        recentDonations?: AdvocacyDonation[];
      };
      const receipt = snapshot.recentDonationReceipts?.find((item) => item.id === receiptId) || null;
      if (!receipt) {
        setResolved(true);
        return;
      }
      const donation = snapshot.recentDonations?.find((item) => item.id === receipt.donationId) || null;
      setRecord({ receipt, donation });
      setResolved(true);
    })();

    return () => {
      active = false;
    };
  }, [receiptId]);

  const receiptStatusTone = useMemo(() => {
    const status = record?.receipt.paymentStatus;
    if (status === 'refunded') return 'border-red-400/35 bg-red-500/10 text-red-300';
    if (record?.donation?.status === 'refund_requested') return 'border-amber-400/35 bg-amber-500/10 text-amber-200';
    if (status === 'cancelled') return 'border-gray-400/35 bg-gray-500/10 text-gray-300';
    return 'border-emerald-500/35 bg-emerald-500/10 text-emerald-300';
  }, [record]);

  if (!resolved) {
    return (
      <AdvocacyFrame title="Loading Receipt" subtitle="Fetching the latest receipt record for this advocacy contribution.">
        <section className="rounded-2xl border border-[#d4af37]/20 bg-[#101112] p-8 text-center">
          <p className="text-sm text-gray-300">Loading receipt details...</p>
        </section>
      </AdvocacyFrame>
    );
  }

  if (!record) {
    return (
      <AdvocacyFrame title="Receipt Unavailable" subtitle="We could not load that donation receipt in your current advocacy account.">
        <section className="rounded-2xl border border-[#d4af37]/20 bg-[#101112] p-8 text-center">
          <p className="text-sm text-gray-300">This receipt may belong to a different signed wallet or no longer be available in the current audit session.</p>
          <Link href="/advocacy-legal/dashboard/my-advocacy" className="mt-4 inline-flex rounded-full border border-[#d4af37]/35 px-4 py-2 text-sm text-[#d4af37] hover:bg-[#d4af37]/10">
            Back to My Advocacy
          </Link>
        </section>
      </AdvocacyFrame>
    );
  }

  const { receipt, donation } = record;

  return (
    <AdvocacyFrame title="Donation Receipt" subtitle="Payment confirmation for your support in the Protection Economy marketplace.">
      <style jsx global>{`
        @media print {
          nav, header, aside, .no-print {
            display: none !important;
          }
          main {
            padding-top: 0 !important;
          }
          body {
            background: #ffffff !important;
          }
          .print-shell {
            max-width: 100% !important;
            padding: 0 !important;
          }
          .print-card {
            box-shadow: none !important;
            border-radius: 0 !important;
            border: 1px solid #d4af37 !important;
            background: #fffdf8 !important;
          }
        }
      `}</style>
      <section className="print-shell grid gap-6 lg:grid-cols-[1.3fr,0.7fr]">
        <article className="print-card overflow-hidden rounded-3xl border border-[#d4af37]/25 bg-gradient-to-br from-[#171112] via-[#111112] to-[#151617] shadow-2xl shadow-black/30">
          <div className="border-b border-[#d4af37]/15 px-6 py-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-[#d4af37]">Indigena Receipt Ledger</p>
                <h2 className="mt-2 text-2xl font-bold text-white">{receipt.campaignTitle}</h2>
                <p className="mt-1 text-sm text-gray-400">Official contribution record for Indigenous-led legal defense and rights protection.</p>
                <div className="mt-4 flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.18em] text-gray-400">
                  <span className="rounded-full border border-white/10 px-3 py-1">Pillar 9</span>
                  <span className="rounded-full border border-white/10 px-3 py-1">Protection Economy</span>
                  <span className="rounded-full border border-white/10 px-3 py-1">{receiptStatusLabel(donation?.status || receipt.paymentStatus)}</span>
                </div>
              </div>
              <span className={`rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-wide ${receiptStatusTone}`}>
                {receiptStatusLabel(donation?.status || receipt.paymentStatus)}
              </span>
            </div>
          </div>

          <div className="grid gap-4 p-6 md:grid-cols-2">
            {[
              ['Receipt ID', receipt.id],
              ['Payment Reference', receipt.paymentIntentId],
              ['Donor', receipt.donorName],
              ['Issued', new Date(receipt.createdAt).toLocaleString()],
              ['Amount', formatMoney(receipt.amount, receipt.currency)],
              ['Donation State', receiptStatusLabel(donation?.status || 'succeeded')]
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-[11px] uppercase tracking-[0.2em] text-gray-500">{label}</p>
                <p className="mt-2 text-sm font-medium text-white">{value}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-4 border-t border-[#d4af37]/15 px-6 py-5 lg:grid-cols-[1fr,220px]">
            <div className="rounded-2xl border border-white/10 bg-black/15 p-4">
              <p className="text-[11px] uppercase tracking-[0.2em] text-[#d4af37]">Statement of Support</p>
              <p className="mt-3 text-sm leading-6 text-gray-300">
                This receipt acknowledges support directed to Indigenous-led legal defense and rights protection through Indigena Global Market.
                Your contribution helps sustain emergency filings, counsel access, advocacy coordination, and community-rights defense.
              </p>
              {donation?.status === 'refund_requested' ? <p className="mt-3 rounded-2xl border border-amber-400/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">A refund request has been submitted and is pending legal/admin review. This receipt remains valid until that review is completed.</p> : null}
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/15 p-4">
              <p className="text-[11px] uppercase tracking-[0.2em] text-[#d4af37]">Issue Ledger</p>
              <p className="mt-3 text-sm text-white">Issued {new Date(receipt.createdAt).toLocaleDateString()}</p>
              <p className="mt-1 text-xs text-gray-400">Ref {receipt.paymentIntentId}</p>
            </div>
          </div>
        </article>

        <aside className="no-print space-y-4">
          <article className="rounded-2xl border border-[#d4af37]/20 bg-[#101112] p-5">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-[#d4af37]">Receipt Actions</h3>
            <div className="mt-4 flex flex-col gap-3">
              <button
                type="button"
                onClick={() => window.print()}
                className="rounded-full bg-[#d4af37] px-4 py-2 text-sm font-semibold text-black hover:bg-[#f4d370]"
              >
                Print / Save PDF
              </button>
              <button
                type="button"
                onClick={() => downloadReceipt(receipt, donation)}
                className="rounded-full border border-[#d4af37]/35 px-4 py-2 text-sm text-[#d4af37] hover:bg-[#d4af37]/10"
              >
                Download Text Receipt
              </button>
              <button
                type="button"
                onClick={() => downloadReceiptHtml(receipt, donation)}
                className="rounded-full border border-[#d4af37]/35 px-4 py-2 text-sm text-[#d4af37] hover:bg-[#d4af37]/10"
              >
                Download Branded Receipt
              </button>
              <Link href="/advocacy-legal/dashboard/my-advocacy" className="rounded-full border border-white/15 px-4 py-2 text-sm text-gray-200 hover:bg-white/5">
                Back to Dashboard
              </Link>
            </div>
          </article>

          <article className="rounded-2xl border border-[#d4af37]/20 bg-[#101112] p-5">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-[#d4af37]">Support Summary</h3>
            <p className="mt-3 text-sm text-gray-300">
              {donation?.status === 'refund_requested'
                ? 'A refund request is pending review. The contribution remains in supporter totals until an admin or legal reviewer approves the request.'
                : receipt.paymentStatus === 'refunded'
                ? 'This contribution has been refunded and is no longer counted toward active supporter totals.'
                : receipt.paymentStatus === 'cancelled'
                  ? 'This contribution was cancelled before settlement.'
                  : 'This contribution remains active in your supporter history and advocacy totals.'}
            </p>
          </article>
        </aside>
      </section>
    </AdvocacyFrame>
  );
}
