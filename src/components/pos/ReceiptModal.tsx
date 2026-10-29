import React from 'react';
import { X, Printer, MessageCircle, PlusCircle } from 'lucide-react';
import type { Transaction } from '../../types/pos';
import { formatReceiptText, formatWhatsAppReceipt, printViaBrowserDialog } from '../../lib/receipt';

interface ReceiptModalProps {
  isOpen: boolean;
  transaction: Transaction | null;
  onClose: () => void;
  onNewOrder: () => void;
}

export default function ReceiptModal({
  isOpen,
  transaction,
  onClose,
  onNewOrder,
}: ReceiptModalProps) {
  if (!isOpen || !transaction) return null;

  const receiptText = formatReceiptText(transaction, 32);
  const waUrl = formatWhatsAppReceipt(transaction, '6285724770052');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 rounded-2xl w-full max-w-md max-h-[90vh] flex flex-col border border-slate-700 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <h2 className="text-lg font-semibold text-slate-100">✅ Transaksi Berhasil</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-400"
          >
            <X size={20} />
          </button>
        </div>

        {/* Receipt preview */}
        <div className="flex-1 overflow-y-auto p-5">
          <div
            id="thermal-receipt-print"
            className="bg-white text-black rounded-lg p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap shadow-inner"
          >
            {receiptText}
          </div>
        </div>

        {/* Action buttons */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <div className="flex gap-2">
            <button
              onClick={printViaBrowserDialog}
              className="flex-1 h-12 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <Printer size={16} />
              Cetak
            </button>
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 h-12 rounded-xl bg-green-700 hover:bg-green-600 text-white text-sm font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <MessageCircle size={16} />
              WhatsApp
            </a>
          </div>
          <button
            onClick={onNewOrder}
            className="w-full h-14 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-lg font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <PlusCircle size={20} />
            Pesanan Baru
          </button>
        </div>
      </div>
    </div>
  );
}
