import React, { useState, useMemo } from 'react';
import { Search, ChevronDown, ChevronUp, Printer } from 'lucide-react';
import type { Transaction } from '../../types/pos';
import { formatRupiah } from '../../lib/invoice';
import { formatReceiptText, printViaBrowserDialog } from '../../lib/receipt';

interface TransactionHistoryTableProps {
  transactions: Transaction[];
}

export default function TransactionHistoryTable({
  transactions,
}: TransactionHistoryTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return transactions;
    const q = searchQuery.toLowerCase();
    return transactions.filter(
      (tx) =>
        tx.invoiceNo.toLowerCase().includes(q) ||
        tx.items.some((i) => i.name.toLowerCase().includes(q))
    );
  }, [transactions, searchQuery]);

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari invoice..."
          className="w-full h-10 bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>

      <div className="space-y-2 max-h-[60vh] overflow-y-auto">
        {filtered.map((tx) => {
          const isExpanded = expandedId === tx.id;
          const date = new Date(tx.createdAt);

          return (
            <div
              key={tx.id}
              className="bg-slate-800/50 border border-slate-800 rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setExpandedId(isExpanded ? null : tx.id)}
                className="w-full p-3 flex items-center gap-3 text-left"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-100">
                    {tx.invoiceNo}
                  </p>
                  <p className="text-xs text-slate-500">
                    {date.toLocaleDateString('id-ID')} {date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-brand-400">
                    {formatRupiah(tx.totalAmount)}
                  </p>
                  <p className="text-xs text-slate-500 uppercase">
                    {tx.paymentMethod}
                  </p>
                </div>
                {isExpanded ? (
                  <ChevronUp size={16} className="text-slate-500" />
                ) : (
                  <ChevronDown size={16} className="text-slate-500" />
                )}
              </button>

              {isExpanded && (
                <div className="px-3 pb-3 border-t border-slate-800 pt-2 space-y-2">
                  {tx.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-xs">
                      <span className="text-slate-300">
                        {item.name}
                        {item.tier && ` (${item.tier})`}
                        {' × '}
                        {item.qty}
                      </span>
                      <span className="text-slate-400">
                        {formatRupiah(item.subtotal)}
                      </span>
                    </div>
                  ))}
                  {tx.paymentMethod === 'cash' && (
                    <div className="text-xs text-slate-500 pt-1 border-t border-slate-800">
                      Bayar: {formatRupiah(tx.cashTendered ?? 0)} | Kembali:{' '}
                      {formatRupiah(tx.changeAmount ?? 0)}
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-1">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        tx.syncStatus === 'synced'
                          ? 'bg-green-900/30 text-green-400'
                          : 'bg-yellow-900/30 text-yellow-400'
                      }`}
                    >
                      {tx.syncStatus === 'synced' ? '✓ Synced' : '⏳ Pending'}
                    </span>
                    <button
                      onClick={() => {
                        // Set receipt text for printing
                        const el = document.getElementById('thermal-receipt-print');
                        if (el) {
                          el.textContent = formatReceiptText(tx, 32);
                          printViaBrowserDialog();
                        }
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-700 hover:text-slate-200"
                      title="Cetak ulang"
                    >
                      <Printer size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <p className="text-center text-slate-600 py-8 text-sm">
            Tidak ada transaksi
          </p>
        )}
      </div>
    </div>
  );
}
