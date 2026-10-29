import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ArrowLeft,
  TrendingUp,
  Receipt,
  Banknote,
  QrCode,
  Download,
} from 'lucide-react';
import type { Transaction } from '../../types/pos';
import { db } from '../../lib/clientDb';
import { formatRupiah } from '../../lib/invoice';
import {
  aggregateSalesMetrics,
  getTopSellingProducts,
  filterTransactionsByRange,
  exportTransactionsToCsv,
} from '../../lib/analytics';
import TransactionHistoryTable from './TransactionHistoryTable';
import PinModal from '../auth/PinModal';

type DateRange = 'today' | '7days' | 'month' | 'all';

const rangeLabels: Record<DateRange, string> = {
  today: 'Hari Ini',
  '7days': '7 Hari',
  month: 'Bulan Ini',
  all: 'Semua',
};

export default function ReportsDashboard() {
  const [authenticated, setAuthenticated] = useState(false);
  const [ownerPin, setOwnerPin] = useState('1234');
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [range, setRange] = useState<DateRange>('today');

  useEffect(() => {
    db.settings.get('ownerPin').then((s) => {
      if (s) setOwnerPin(s.value);
    });
  }, []);

  const loadTransactions = useCallback(async () => {
    const txs = await db.transactions.orderBy('createdAt').reverse().toArray();
    setAllTransactions(txs);
  }, []);

  useEffect(() => {
    if (authenticated) loadTransactions();
  }, [authenticated, loadTransactions]);

  const filteredTxs = useMemo(
    () => filterTransactionsByRange(allTransactions, range),
    [allTransactions, range]
  );

  const metrics = useMemo(
    () => aggregateSalesMetrics(filteredTxs),
    [filteredTxs]
  );

  const topProducts = useMemo(
    () => getTopSellingProducts(filteredTxs, 5),
    [filteredTxs]
  );

  const maxTopQty = topProducts.length > 0 ? topProducts[0].totalQty : 1;

  const handleExportCsv = () => {
    const csv = exportTransactionsToCsv(filteredTxs);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `laporan-${range}-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!authenticated) {
    return (
      <PinModal
        isOpen={true}
        onClose={() => (window.location.href = '/')}
        onSuccess={() => setAuthenticated(true)}
        storedPin={ownerPin}
        title="PIN untuk Laporan"
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur border-b border-slate-800 px-4 py-3 flex items-center gap-3">
        <a
          href="/"
          className="p-2 rounded-xl hover:bg-slate-800 text-slate-400"
        >
          <ArrowLeft size={20} />
        </a>
        <h1 className="text-lg font-bold text-brand-400 flex-1">📊 Laporan</h1>
        <button
          onClick={handleExportCsv}
          className="h-10 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium flex items-center gap-1.5"
        >
          <Download size={16} />
          CSV
        </button>
      </header>

      <main className="flex-1 p-4 space-y-4 max-w-2xl mx-auto w-full">
        {/* Date range filter */}
        <div className="flex gap-2">
          {(Object.entries(rangeLabels) as [DateRange, string][]).map(
            ([key, label]) => (
              <button
                key={key}
                onClick={() => setRange(key)}
                className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
                  range === key
                    ? 'bg-brand-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                {label}
              </button>
            )
          )}
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <TrendingUp size={16} />
              <span className="text-xs">Total Omset</span>
            </div>
            <p className="text-xl font-bold text-brand-400">
              {formatRupiah(metrics.totalRevenue)}
            </p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <Receipt size={16} />
              <span className="text-xs">Transaksi</span>
            </div>
            <p className="text-xl font-bold text-slate-100">
              {metrics.transactionCount}
            </p>
            <p className="text-xs text-slate-500">
              Rata-rata: {formatRupiah(metrics.avgTransaction)}
            </p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <Banknote size={16} />
              <span className="text-xs">Tunai</span>
            </div>
            <p className="text-lg font-bold text-green-400">
              {formatRupiah(metrics.cashRevenue)}
            </p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <QrCode size={16} />
              <span className="text-xs">QRIS</span>
            </div>
            <p className="text-lg font-bold text-blue-400">
              {formatRupiah(metrics.qrisRevenue)}
            </p>
          </div>
        </div>

        {/* Top 5 Best Sellers */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-slate-100 mb-3">
            🏆 Top 5 Best Seller
          </h3>
          {topProducts.length > 0 ? (
            <div className="space-y-3">
              {topProducts.map((prod, i) => (
                <div key={prod.name} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-200">
                      {i + 1}. {prod.name}
                    </span>
                    <span className="text-slate-400">
                      {prod.totalQty}× · {formatRupiah(prod.totalRevenue)}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-500 rounded-full transition-all"
                      style={{
                        width: `${(prod.totalQty / maxTopQty) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-600 text-center py-4">
              Belum ada data
            </p>
          )}
        </div>

        {/* Transaction history */}
        <div>
          <h3 className="text-sm font-semibold text-slate-100 mb-3">
            📋 Riwayat Transaksi
          </h3>
          <TransactionHistoryTable transactions={filteredTxs} />
        </div>
      </main>

      {/* Hidden print area */}
      <div id="thermal-receipt-print" className="hidden print:block" />
    </div>
  );
}
