import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { Product, AsinTier, CartItem } from '../../types/pos';
import { formatRupiah } from '../../lib/invoice';

interface VariantModalProps {
  isOpen: boolean;
  product: Product | null;
  onClose: () => void;
  onAdd: (item: CartItem) => void;
}

const tierLabels: Record<AsinTier, string> = {
  biasa: 'Biasa',
  spesial: 'Spesial',
  super: 'Super',
};

const quickNotes = ['Garing', 'Setengah Matang', 'Extra Keju', 'Pedas'];

export default function VariantModal({ isOpen, product, onClose, onAdd }: VariantModalProps) {
  const [selectedTier, setSelectedTier] = useState<AsinTier | null>(null);
  const [selectedNotes, setSelectedNotes] = useState<string[]>([]);

  if (!isOpen || !product || !product.variantPrices) return null;

  const availableTiers = (Object.entries(product.variantPrices) as [AsinTier, number | undefined][])
    .filter(([, price]) => price !== undefined && price > 0)
    .map(([tier, price]) => ({ tier, price: price as number }));

  const toggleNote = (note: string) => {
    setSelectedNotes((prev) =>
      prev.includes(note) ? prev.filter((n) => n !== note) : [...prev, note]
    );
  };

  const handleAdd = () => {
    if (!selectedTier) return;
    const price = product.variantPrices![selectedTier];
    if (!price) return;

    const noteStr = selectedNotes.length > 0 ? selectedNotes.join(', ') : undefined;
    const cartId = `${product.id}-${selectedTier}-${noteStr || ''}`;

    const item: CartItem = {
      id: cartId,
      productId: product.id,
      name: product.name,
      category: product.category,
      tier: selectedTier,
      price,
      qty: 1,
      note: noteStr,
      subtotal: price,
    };

    onAdd(item);
    setSelectedTier(null);
    setSelectedNotes([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 rounded-t-2xl sm:rounded-2xl w-full sm:w-[400px] max-h-[80vh] overflow-y-auto border border-slate-700 shadow-xl">
        <div className="sticky top-0 bg-slate-900 px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-100">{product.name}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-400"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Tier selector */}
          <div>
            <label className="text-sm text-slate-400 mb-2 block">Pilih Tipe</label>
            <div className="grid grid-cols-3 gap-2">
              {availableTiers.map(({ tier, price }) => (
                <button
                  key={tier}
                  onClick={() => setSelectedTier(tier)}
                  className={`p-3 rounded-xl text-center transition-all ${
                    selectedTier === tier
                      ? 'bg-brand-600 text-white ring-2 ring-brand-400'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <div className="text-sm font-medium">{tierLabels[tier]}</div>
                  <div className="text-xs mt-0.5 opacity-80">{formatRupiah(price)}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Quick notes */}
          <div>
            <label className="text-sm text-slate-400 mb-2 block">Catatan (opsional)</label>
            <div className="flex flex-wrap gap-2">
              {quickNotes.map((note) => (
                <button
                  key={note}
                  onClick={() => toggleNote(note)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                    selectedNotes.includes(note)
                      ? 'bg-brand-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {note}
                </button>
              ))}
            </div>
          </div>

          {/* Add button */}
          <button
            onClick={handleAdd}
            disabled={!selectedTier}
            className={`w-full h-14 rounded-xl text-lg font-semibold transition-all ${
              selectedTier
                ? 'bg-brand-600 text-white hover:bg-brand-500 active:bg-brand-700'
                : 'bg-slate-800 text-slate-600 cursor-not-allowed'
            }`}
          >
            {selectedTier
              ? `Tambah - ${formatRupiah(product.variantPrices![selectedTier] ?? 0)}`
              : 'Pilih tipe dulu'}
          </button>
        </div>
      </div>
    </div>
  );
}
