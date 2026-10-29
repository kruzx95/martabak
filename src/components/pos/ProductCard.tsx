import React from 'react';
import { Plus, Minus, SlidersHorizontal } from 'lucide-react';
import type { Product } from '../../types/pos';
import { formatRupiah } from '../../lib/invoice';

interface ProductCardProps {
  product: Product;
  qty: number;
  onIncrement: (product: Product) => void;
  onDecrement: (productId: string) => void;
  onVariantClick: (product: Product) => void;
}

export default function ProductCard({
  product,
  qty,
  onIncrement,
  onDecrement,
  onVariantClick,
}: ProductCardProps) {
  const isUnavailable = !product.isAvailable;

  return (
    <div
      className={`relative rounded-xl border p-3 flex flex-col justify-between transition-all ${
        isUnavailable
          ? 'border-slate-800 bg-slate-900/50 opacity-50'
          : qty > 0
          ? 'border-brand-500/50 bg-brand-950/30 shadow-md shadow-brand-500/5'
          : 'border-slate-800 bg-slate-900 hover:border-slate-700'
      }`}
    >
      <div className="mb-2">
        <h3 className="font-medium text-sm text-slate-100 leading-tight line-clamp-2">
          {product.name}
        </h3>
        <p className="text-brand-400 font-semibold text-sm mt-1">
          {product.hasVariants && product.variantPrices
            ? `${formatRupiah(Math.min(...Object.values(product.variantPrices).filter(Boolean) as number[]))}+`
            : formatRupiah(product.price)}
        </p>
      </div>

      {isUnavailable ? (
        <div className="text-center text-xs text-slate-600 py-2">Habis</div>
      ) : product.hasVariants ? (
        <button
          onClick={() => onVariantClick(product)}
          className="w-full h-12 rounded-lg bg-brand-600 hover:bg-brand-500 active:bg-brand-700 text-white text-sm font-medium flex items-center justify-center gap-1.5 transition-colors"
        >
          <SlidersHorizontal size={14} />
          {qty > 0 ? `Opsi (${qty})` : 'Opsi'}
        </button>
      ) : qty === 0 ? (
        <button
          onClick={() => onIncrement(product)}
          className="w-full h-12 rounded-lg bg-brand-600 hover:bg-brand-500 active:bg-brand-700 text-white text-sm font-medium flex items-center justify-center gap-1 transition-colors"
        >
          <Plus size={16} />
          Tambah
        </button>
      ) : (
        <div className="flex items-center justify-between h-12">
          <button
            onClick={() => onDecrement(product.id)}
            className="w-12 h-12 rounded-lg bg-slate-800 hover:bg-slate-700 active:bg-red-700 text-slate-100 flex items-center justify-center transition-colors"
          >
            <Minus size={18} />
          </button>
          <span className="text-lg font-bold text-brand-400 min-w-[2rem] text-center">
            {qty}
          </span>
          <button
            onClick={() => onIncrement(product)}
            className="w-12 h-12 rounded-lg bg-brand-600 hover:bg-brand-500 active:bg-brand-700 text-white flex items-center justify-center transition-colors"
          >
            <Plus size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
