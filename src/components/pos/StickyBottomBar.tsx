import React from 'react';
import { ShoppingCart, Plus, Minus, Trash2 } from 'lucide-react';
import type { CartItem } from '../../types/pos';
import { formatRupiah } from '../../lib/invoice';

interface StickyBottomBarProps {
  cartItems: CartItem[];
  totalAmount: number;
  totalQty: number;
  onPayClick: () => void;
  onIncrementItem: (itemId: string) => void;
  onDecrementItem: (itemId: string) => void;
  onRemoveItem: (itemId: string) => void;
}

export default function StickyBottomBar({
  cartItems,
  totalAmount,
  totalQty,
  onPayClick,
  onIncrementItem,
  onDecrementItem,
  onRemoveItem,
}: StickyBottomBarProps) {
  if (totalQty === 0) return null;

  return (
    <>
      {/* Tablet sidebar - shown on md+ */}
      <aside className="hidden md:flex fixed right-0 top-0 bottom-0 w-80 lg:w-96 bg-slate-900 border-l border-slate-800 flex-col z-20">
        <div className="p-4 border-b border-slate-800">
          <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <ShoppingCart size={20} />
            Pesanan ({totalQty} item)
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cartItems.map((item) => (
            <div
              key={item.id}
              className="bg-slate-800/50 rounded-lg p-3 space-y-2"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-100 truncate">
                    {item.name}
                    {item.tier && (
                      <span className="text-brand-400 ml-1 text-xs">({item.tier})</span>
                    )}
                  </p>
                  {item.note && (
                    <p className="text-xs text-slate-500 mt-0.5">* {item.note}</p>
                  )}
                  <p className="text-xs text-slate-400 mt-0.5">
                    {formatRupiah(item.price)} × {item.qty}
                  </p>
                </div>
                <p className="text-sm font-semibold text-brand-400 ml-2">
                  {formatRupiah(item.subtotal)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onDecrementItem(item.id)}
                  className="w-8 h-8 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 flex items-center justify-center"
                >
                  <Minus size={14} />
                </button>
                <span className="text-sm font-semibold text-slate-100 w-8 text-center">
                  {item.qty}
                </span>
                <button
                  onClick={() => onIncrementItem(item.id)}
                  className="w-8 h-8 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 flex items-center justify-center"
                >
                  <Plus size={14} />
                </button>
                <button
                  onClick={() => onRemoveItem(item.id)}
                  className="ml-auto w-8 h-8 rounded-lg bg-red-900/30 hover:bg-red-900/60 text-red-400 flex items-center justify-center"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Total</span>
            <span className="text-xl font-bold text-brand-400">
              {formatRupiah(totalAmount)}
            </span>
          </div>
          <button
            onClick={onPayClick}
            className="w-full h-14 rounded-xl bg-green-600 hover:bg-green-500 active:bg-green-700 text-white text-lg font-bold transition-colors"
          >
            💰 Bayar
          </button>
        </div>
      </aside>

      {/* Mobile bottom bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-slate-900/95 backdrop-blur border-t border-slate-800 px-4 py-3 flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-slate-400">{totalQty} item</p>
          <p className="text-lg font-bold text-brand-400">{formatRupiah(totalAmount)}</p>
        </div>
        <button
          onClick={onPayClick}
          className="h-14 px-8 rounded-xl bg-green-600 hover:bg-green-500 active:bg-green-700 text-white text-lg font-bold transition-colors shrink-0"
        >
          💰 Bayar
        </button>
      </div>
    </>
  );
}
