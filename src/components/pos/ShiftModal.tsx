import React, { useState, useEffect } from 'react';
import { X, Play, Square, AlertTriangle } from 'lucide-react';
import type { Shift, Transaction } from '../../types/pos';
import { db } from '../../lib/clientDb';
import { openNewShift, closeCurrentShift, calculateShiftSummary } from '../../lib/shift';
import { formatRupiah } from '../../lib/invoice';

interface ShiftModalProps {
  isOpen: boolean;
  currentShift: Shift | null;
  onClose: () => void;
  onShiftChange: (shift: Shift | null) => void;
  onRequestPin: (onSuccess: () => void) => void;
}

export default function ShiftModal({
  isOpen,
  currentShift,
  onClose,
  onShiftChange,
  onRequestPin,
}: ShiftModalProps) {
  const [cashierName, setCashierName] = useState('');
  const [initialCash, setInitialCash] = useState('');
  const [actualCash, setActualCash] = useState('');
  const [shiftTransactions, setShiftTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && currentShift) {
      db.transactions
        .where('shiftId')
        .equals(currentShift.id)
        .toArray()
        .then(setShiftTransactions);
    }
  }, [isOpen, currentShift]);

  const handleOpenShift = async () => {
    if (!cashierName.trim() || !initialCash) return;
    setLoading(true);
    try {
      const shift = await openNewShift(cashierName.trim(), parseInt(initialCash) || 0);
      onShiftChange(shift);
      setCashierName('');
      setInitialCash('');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleCloseShift = () => {
    onRequestPin(async () => {
      if (!currentShift) return;
      setLoading(true);
      try {
        const closed = await closeCurrentShift(
          currentShift.id,
          parseInt(actualCash) || 0
        );
        onShiftChange(null);
        setActualCash('');
        onClose();
      } finally {
        setLoading(false);
      }
    });
  };

  if (!isOpen) return null;

  const summary = currentShift
    ? calculateShiftSummary(
        currentShift.initialCash,
        shiftTransactions,
        parseInt(actualCash) || 0
      )
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 rounded-2xl w-full max-w-md border border-slate-700 shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <h2 className="text-lg font-semibold text-slate-100">
            {currentShift ? '⏱️ Shift Aktif' : '🟢 Buka Shift'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-400"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {!currentShift ? (
            <>
              <div>
                <label className="text-sm text-slate-400 block mb-1.5">
                  Nama Kasir
                </label>
                <input
                  type="text"
                  value={cashierName}
                  onChange={(e) => setCashierName(e.target.value)}
                  placeholder="Masukkan nama..."
                  className="w-full h-12 bg-slate-800 border border-slate-700 rounded-xl px-4 text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="text-sm text-slate-400 block mb-1.5">
                  Modal Awal (Rp)
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={initialCash}
                  onChange={(e) => setInitialCash(e.target.value)}
                  placeholder="0"
                  className="w-full h-12 bg-slate-800 border border-slate-700 rounded-xl px-4 text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <button
                onClick={handleOpenShift}
                disabled={!cashierName.trim() || loading}
                className="w-full h-14 rounded-xl bg-green-600 hover:bg-green-500 disabled:bg-slate-800 disabled:text-slate-600 text-white text-lg font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <Play size={20} />
                Mulai Shift
              </button>
            </>
          ) : (
            <>
              <div className="bg-slate-800/50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Kasir</span>
                  <span className="text-slate-100">{currentShift.cashierName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Mulai</span>
                  <span className="text-slate-100">
                    {new Date(currentShift.startTime).toLocaleTimeString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Modal Awal</span>
                  <span className="text-slate-100">
                    {formatRupiah(currentShift.initialCash)}
                  </span>
                </div>
              </div>

              {summary && (
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-slate-800/50 rounded-xl p-3 text-center">
                    <p className="text-xs text-slate-400">Tunai</p>
                    <p className="text-lg font-bold text-green-400">
                      {formatRupiah(summary.totalCashSales)}
                    </p>
                  </div>
                  <div className="bg-slate-800/50 rounded-xl p-3 text-center">
                    <p className="text-xs text-slate-400">QRIS</p>
                    <p className="text-lg font-bold text-blue-400">
                      {formatRupiah(summary.totalQrisSales)}
                    </p>
                  </div>
                  <div className="bg-slate-800/50 rounded-xl p-3 text-center col-span-2">
                    <p className="text-xs text-slate-400">Total Transaksi</p>
                    <p className="text-lg font-bold text-brand-400">
                      {summary.totalTransactions}
                    </p>
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm text-slate-400 block mb-1.5">
                  Kas Aktual Saat Tutup (Rp)
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={actualCash}
                  onChange={(e) => setActualCash(e.target.value)}
                  placeholder="Hitung uang di laci..."
                  className="w-full h-12 bg-slate-800 border border-slate-700 rounded-xl px-4 text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              {actualCash && summary && (
                <div
                  className={`p-3 rounded-xl text-center ${
                    summary.difference >= 0
                      ? 'bg-green-900/30 border border-green-800'
                      : 'bg-red-900/30 border border-red-800'
                  }`}
                >
                  <p className="text-xs text-slate-400">Selisih Kas</p>
                  <p
                    className={`text-lg font-bold ${
                      summary.difference >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {summary.difference >= 0
                      ? `+${formatRupiah(summary.difference)}`
                      : formatRupiah(summary.difference)}
                  </p>
                </div>
              )}

              <button
                onClick={handleCloseShift}
                disabled={loading}
                className="w-full h-14 rounded-xl bg-red-600 hover:bg-red-500 disabled:bg-slate-800 disabled:text-slate-600 text-white text-lg font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <Square size={20} />
                Tutup Shift (PIN)
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
