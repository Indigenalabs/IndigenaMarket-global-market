'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Download,
  Search,
  Filter,
  FileText,
  CheckCircle,
  AlertCircle,
  Clock,
  RefreshCw,
  Calendar,
  Wallet
} from 'lucide-react';
import {
  fetchMyCourseReceipts,
  type CourseEnrollmentReceipt
} from '@/app/lib/coursesMarketplaceApi';
import { requireWalletAction } from '@/app/lib/requireWalletAction';

function formatDate(value?: string) {
  if (!value) return 'Unknown date';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'Unknown date';
  return parsed.toLocaleString();
}

function downloadTextFile(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function buildReceiptText(receipt: CourseEnrollmentReceipt) {
  return [
    'INDIGENA COURSE RECEIPT',
    `Receipt ID: ${receipt.receiptId}`,
    `Course ID: ${receipt.courseId}`,
    `Amount: ${receipt.amount} ${receipt.currency}`,
    `Status: ${receipt.status || 'issued'}`,
    `Issued At: ${receipt.createdAt ? new Date(receipt.createdAt).toISOString() : ''}`
  ].join('\n');
}

export default function DownloadsPage() {
  const [receipts, setReceipts] = useState<CourseEnrollmentReceipt[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'issued' | 'refunded'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'amount-high' | 'amount-low'>('newest');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadReceipts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMyCourseReceipts(200);
      setReceipts(data);
    } catch {
      setReceipts([]);
      setError('Unable to load receipts yet. Sign in to load your receipt history.');
    } finally {
      setLoading(false);
    }
  };

  const handleConnectAndReload = async () => {
    setLoading(true);
    setError(null);
    try {
      await requireWalletAction('view your course receipts');
      const data = await fetchMyCourseReceipts(200);
      setReceipts(data);
    } catch (connectError) {
      setReceipts([]);
      setError(connectError instanceof Error ? connectError.message : 'Sign in to view your course receipts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadReceipts();
  }, []);

  const filteredReceipts = useMemo(() => {
    let list = [...receipts];

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter((r) =>
        String(r.receiptId || '').toLowerCase().includes(q) ||
        String(r.courseId || '').toLowerCase().includes(q) ||
        String(r.currency || '').toLowerCase().includes(q)
      );
    }

    if (statusFilter !== 'all') {
      list = list.filter((r) => (r.status || 'issued') === statusFilter);
    }

    if (sortBy === 'newest') list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    if (sortBy === 'oldest') list.sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());
    if (sortBy === 'amount-high') list.sort((a, b) => Number(b.amount || 0) - Number(a.amount || 0));
    if (sortBy === 'amount-low') list.sort((a, b) => Number(a.amount || 0) - Number(b.amount || 0));

    return list;
  }, [receipts, searchQuery, statusFilter, sortBy]);

  const toggleSelection = (id: string) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const selectAllVisible = () => {
    setSelectedItems(filteredReceipts.map((r) => String(r.receiptId)));
  };

  const clearSelection = () => setSelectedItems([]);

  const downloadReceipt = (receipt: CourseEnrollmentReceipt) => {
    downloadTextFile(`${receipt.receiptId || 'course-receipt'}.txt`, buildReceiptText(receipt));
  };

  const downloadSelected = () => {
    if (selectedItems.length === 0) return;
    const selected = receipts.filter((r) => selectedItems.includes(String(r.receiptId)));
    const payload = selected
      .map((r) => buildReceiptText(r))
      .join('\n\n----------------------------------------\n\n');
    downloadTextFile(`course-receipts-${Date.now()}.txt`, payload);
  };

  const totalAmount = filteredReceipts.reduce((sum, r) => sum + Number(r.amount || 0), 0);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <header className="bg-[#141414] border-b border-[#d4af37]/20 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">My Course Receipts</h1>
            <p className="text-gray-400 text-sm">View, filter, and download all enrollment receipts</p>
          </div>
          <button
            onClick={() => void loadReceipts()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#d4af37]/30 text-[#d4af37] hover:bg-[#d4af37]/10 transition-colors"
          >
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-[#141414] rounded-xl border border-[#d4af37]/20 p-4">
            <p className="text-gray-400 text-sm">Receipts (filtered)</p>
            <p className="text-white text-2xl font-bold mt-1">{filteredReceipts.length}</p>
          </div>
          <div className="bg-[#141414] rounded-xl border border-[#d4af37]/20 p-4">
            <p className="text-gray-400 text-sm">Total Value</p>
            <p className="text-[#d4af37] text-2xl font-bold mt-1">{totalAmount.toFixed(2)} INDI</p>
          </div>
          <div className="bg-[#141414] rounded-xl border border-[#d4af37]/20 p-4">
            <p className="text-gray-400 text-sm">Selected</p>
            <p className="text-white text-2xl font-bold mt-1">{selectedItems.length}</p>
          </div>
        </div>

        <div className="bg-[#141414] rounded-xl border border-[#d4af37]/20 p-4 mb-5">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
            <div className="relative lg:col-span-2">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by receipt ID, course ID, currency"
                className="w-full pl-9 pr-3 py-2 bg-[#0a0a0a] border border-[#d4af37]/20 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#d4af37]"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter size={14} className="text-gray-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'issued' | 'refunded')}
                className="w-full bg-[#0a0a0a] border border-[#d4af37]/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="issued">Issued</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'amount-high' | 'amount-low')}
              className="bg-[#0a0a0a] border border-[#d4af37]/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="amount-high">Amount High-Low</option>
              <option value="amount-low">Amount Low-High</option>
            </select>
          </div>
        </div>

        {selectedItems.length > 0 && (
          <div className="flex items-center justify-between mb-4 p-3 bg-[#141414] rounded-lg border border-[#d4af37]/20">
            <span className="text-gray-400 text-sm">{selectedItems.length} selected</span>
            <div className="flex items-center gap-2">
              <button
                onClick={downloadSelected}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#d4af37]/30 text-[#d4af37] hover:bg-[#d4af37]/10 text-sm"
              >
                <Download size={14} /> Bulk Download
              </button>
              <button
                onClick={clearSelection}
                className="px-3 py-1.5 rounded-lg border border-gray-600/40 text-gray-300 hover:bg-gray-600/10 text-sm"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        <div className="bg-[#141414] rounded-xl border border-[#d4af37]/20 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#d4af37]/10">
            <p className="text-white text-sm font-medium">Receipts</p>
            <button onClick={selectAllVisible} className="text-xs text-[#d4af37] hover:text-[#f4e4a6] transition-colors">Select all visible</button>
          </div>

          {loading && (
            <div className="p-6 text-gray-400 text-sm flex items-center gap-2">
              <Clock size={16} /> Loading receipts...
            </div>
          )}

          {error && !loading && (
            <div className="p-6">
              <div className="flex items-start gap-2 text-amber-400 text-sm">
                <AlertCircle size={16} className="mt-0.5" />
                <div className="space-y-3">
                  <p>{error}</p>
                  <button
                    type="button"
                    onClick={() => void handleConnectAndReload()}
                    className="inline-flex items-center gap-2 rounded-lg border border-[#d4af37]/30 px-3 py-2 text-xs font-medium text-[#d4af37] transition-colors hover:bg-[#d4af37]/10"
                  >
                    <Wallet size={14} />
                    Sign In
                  </button>
                </div>
              </div>
            </div>
          )}

          {!loading && !error && filteredReceipts.length === 0 && (
            <div className="p-10 text-center text-gray-500">
              <FileText size={34} className="mx-auto mb-2 opacity-60" />
              <p>No receipts found for the current filters.</p>
            </div>
          )}

          {!loading && !error && filteredReceipts.length > 0 && (
            <div className="divide-y divide-[#d4af37]/10">
              {filteredReceipts.map((receipt) => {
                const id = String(receipt.receiptId || '');
                const selected = selectedItems.includes(id);
                return (
                  <div key={id} className="px-4 py-3 flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => toggleSelection(id)}
                      className="rounded border-[#d4af37]/30 bg-[#0a0a0a] text-[#d4af37]"
                    />

                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-medium truncate">{receipt.receiptId}</p>
                      <p className="text-xs text-gray-500 truncate">Course {receipt.courseId}</p>
                    </div>

                    <div className="hidden md:flex items-center gap-2 text-xs text-gray-400 min-w-[210px]">
                      <Calendar size={12} /> {formatDate(receipt.createdAt)}
                    </div>

                    <div className="flex items-center gap-2 text-sm min-w-[140px] justify-end">
                      <Wallet size={14} className="text-[#d4af37]" />
                      <span className="text-[#d4af37] font-medium">{Number(receipt.amount || 0).toFixed(2)} {receipt.currency}</span>
                    </div>

                    <div className="min-w-[80px] text-right">
                      {(receipt.status || 'issued') === 'issued' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                          <CheckCircle size={11} /> Issued
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                          <AlertCircle size={11} /> Refunded
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => downloadReceipt(receipt)}
                      className="ml-2 flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#d4af37]/30 text-[#d4af37] text-xs hover:bg-[#d4af37]/10 transition-colors"
                    >
                      <Download size={12} /> Download
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-6 p-4 bg-[#141414] rounded-xl border border-[#d4af37]/20">
          <h3 className="text-white font-medium mb-2">Receipt Center</h3>
          <ul className="text-gray-400 text-sm space-y-1">
            <li>- Receipts are generated on successful enrollment.</li>
            <li>- Use filters to find specific transactions quickly.</li>
            <li>- Bulk download exports selected receipts into one file.</li>
          </ul>
        </div>
      </main>
    </div>
  );
}



