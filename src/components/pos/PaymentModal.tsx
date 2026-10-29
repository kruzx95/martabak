import React, { useState, useMemo } from 'react';
import { X, Banknote, QrCode } from 'lucide-react';
import type { CartItem, Transaction } from '../../types/pos';
import {
  formatRupiah,
  calculateChange,
  getQuickCashSuggestions,
  generateInvoiceNumber,
} from '../../lib/invoice';
import { db } from '../../lib/clientDb';

interface PaymentModalProps {
  isOpen: boolean;
  cartItems: CartItem[];
  totalAmount: number;
  shiftId?: string;
  onClose: () => void;
  onComplete: (tx: Transaction) => void;
}

export default function PaymentModal({
  isOpen,
  cartItems,
  totalAmount,
  shiftId,
  onClose,
  onComplete,
}: PaymentModalProps) {
  const [method, setMethod] = useState<'cash' | 'qris'>('cash');
  const [cashInput, setCashInput] = useState('');
  const [processing, setProcessing] = useState(false);

  const cashAmount = parseInt(cashInput) || 0;
  const change = calculateChange(totalAmount, cashAmount);
  const quickSuggestions = useMemo(
    () => getQuickCashSuggestions(totalAmount),
    [totalAmount]
  );

  const canComplete =
    method === 'qris' || (method === 'cash' && cashAmount >= totalAmount);

  const handleComplete = async () => {
    if (!canComplete || processing) return;
    setProcessing(true);

    try {
      // Get next sequence number
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayCount = await db.transactions
        .where('createdAt')
        .aboveOrEqual(todayStart.getTime())
        .count();

      const tx: Transaction = {
        id: `tx-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        invoiceNo: generateInvoiceNumber(todayCount + 1),
        createdAt: Date.now(),
        items: cartItems,
        totalAmount,
        paymentMethod: method,
        cashTendered: method === 'cash' ? cashAmount : undefined,
        changeAmount: method === 'cash' ? change : undefined,
        shiftId,
        syncStatus: 'pending',
      };

      await db.transactions.add(tx);
      onComplete(tx);
    } catch (err) {
      console.error('Failed to save transaction:', err);
    } finally {
      setProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
        <h2 className="text-lg font-semibold text-slate-100">Pembayaran</h2>
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-slate-800 text-slate-400"
        >
          <X size={24} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 max-w-lg mx-auto w-full">
        {/* Total display */}
        <div className="text-center py-4">
          <p className="text-sm text-slate-400">Total Tagihan</p>
          <p className="text-4xl font-bold text-brand-400 mt-1">
            {formatRupiah(totalAmount)}
          </p>
        </div>

        {/* Method tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setMethod('cash')}
            className={`flex-1 h-14 rounded-xl flex items-center justify-center gap-2 text-base font-medium transition-all ${
              method === 'cash'
                ? 'bg-brand-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            <Banknote size={20} />
            Tunai
          </button>
          <button
            onClick={() => setMethod('qris')}
            className={`flex-1 h-14 rounded-xl flex items-center justify-center gap-2 text-base font-medium transition-all ${
              method === 'qris'
                ? 'bg-brand-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            <QrCode size={20} />
            QRIS
          </button>
        </div>

        {method === 'cash' ? (
          <div className="space-y-4">
            {/* Quick suggestions */}
            <div className="grid grid-cols-2 gap-2">
              {quickSuggestions.map((amount) => (
                <button
                  key={amount}
                  onClick={() => setCashInput(String(amount))}
                  className={`h-14 rounded-xl text-base font-medium transition-all ${
                    cashAmount === amount
                      ? 'bg-brand-600 text-white ring-2 ring-brand-400'
                      : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                  }`}
                >
                  {amount === totalAmount ? 'Uang Pas' : formatRupiah(amount)}
                </button>
              ))}
            </div>

            {/* Manual input */}
            <div>
              <label className="text-sm text-slate-400 block mb-2">
                Jumlah Bayar (manual)
              </label>
              <input
                type="number"
                inputMode="numeric"
                value={cashInput}
                onChange={(e) => setCashInput(e.target.value)}
                placeholder="Masukkan jumlah..."
                className="w-full h-14 bg-slate-800 border border-slate-700 rounded-xl px-4 text-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            {/* Change display */}
            {cashAmount > 0 && (
              <div
                className={`p-4 rounded-xl text-center ${
                  change >= 0
                    ? 'bg-green-900/30 border border-green-800'
                    : 'bg-red-900/30 border border-red-800'
                }`}
              >
                <p className="text-sm text-slate-400">Kembalian</p>
                <p
                  className={`text-2xl font-bold ${
                    change >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {change >= 0 ? formatRupiah(change) : `Kurang ${formatRupiah(-change)}`}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* QRIS placeholder */}
            <div className="bg-white rounded-xl p-8 flex items-center justify-center">
              <div className="text-center">
                <QrCode size={120} className="text-slate-800 mx-auto" />
                <p className="text-slate-600 text-sm mt-3">Scan QR Code untuk bayar</p>
              </div>
            </div>
            <p className="text-center text-xs text-slate-500">
              Konfirmasi setelah pembayaran diterima
            </p>
          </div>
        )}
      </div>

      {/* Bottom action */}
      <div className="p-4 border-t border-slate-800 max-w-lg mx-auto w-full">
        <button
          onClick={handleComplete}
          disabled={!canComplete || processing}
          className={`w-full h-16 rounded-xl text-lg font-bold transition-all ${
            canComplete && !processing
              ? 'bg-green-600 text-white hover:bg-green-500 active:bg-green-700'
              : 'bg-slate-800 text-slate-600 cursor-not-allowed'
          }`}
        >
          {processing
            ? 'Menyimpan...'
            : method === 'qris'
            ? '✅ Konfirmasi QRIS Diterima'
            : '✅ Selesaikan Transaksi'}
        </button>
      </div>
    </div>
  );
}
