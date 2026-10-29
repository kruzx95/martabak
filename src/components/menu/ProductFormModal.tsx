import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { Product, ProductCategory } from '../../types/pos';
import { validateProductPayload } from '../../lib/auth';
import { db } from '../../lib/clientDb';

interface ProductFormModalProps {
  isOpen: boolean;
  product: Product | null; // null = add mode
  onClose: () => void;
  onSaved: () => void;
}

const categoryOptions: { value: ProductCategory; label: string }[] = [
  { value: 'manis', label: 'Manis' },
  { value: 'tipis_kering', label: 'Tipis Kering' },
  { value: 'asin_ayam', label: 'Asin (Ayam)' },
  { value: 'asin_sapi', label: 'Asin (Sapi)' },
];

export default function ProductFormModal({
  isOpen,
  product,
  onClose,
  onSaved,
}: ProductFormModalProps) {
  const isEdit = product !== null;

  const [name, setName] = useState(product?.name ?? '');
  const [category, setCategory] = useState<ProductCategory>(
    product?.category ?? 'manis'
  );
  const [price, setPrice] = useState(String(product?.price ?? ''));
  const [hasVariants, setHasVariants] = useState(product?.hasVariants ?? false);
  const [biasa, setBiasa] = useState(String(product?.variantPrices?.biasa ?? ''));
  const [spesial, setSpesial] = useState(
    String(product?.variantPrices?.spesial ?? '')
  );
  const [superPrice, setSuperPrice] = useState(
    String(product?.variantPrices?.super ?? '')
  );
  const [isAvailable, setIsAvailable] = useState(product?.isAvailable ?? true);
  const [errors, setErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const payload: Partial<Product> = {
      name: name.trim(),
      category,
      price: parseInt(price) || 0,
      hasVariants,
      isAvailable,
    };

    if (hasVariants) {
      payload.variantPrices = {
        biasa: parseInt(biasa) || undefined,
        spesial: parseInt(spesial) || undefined,
        super: parseInt(superPrice) || undefined,
      };
      // Set base price from lowest variant
      const prices = [
        parseInt(biasa) || 0,
        parseInt(spesial) || 0,
        parseInt(superPrice) || 0,
      ].filter(Boolean);
      payload.price = Math.min(...prices) || 0;
    }

    const validation = validateProductPayload(payload);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setSaving(true);
    try {
      if (isEdit && product) {
        await db.products.update(product.id, {
          ...payload,
          updatedAt: Date.now(),
        });
      } else {
        const id = `${category}-${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
        await db.products.add({
          id,
          ...payload,
          updatedAt: Date.now(),
        } as Product);
      }
      onSaved();
      onClose();
    } catch (err) {
      console.error('Save error:', err);
      setErrors(['Gagal menyimpan produk']);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto border border-slate-700 shadow-xl">
        <div className="sticky top-0 bg-slate-900 flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <h2 className="text-lg font-semibold text-slate-100">
            {isEdit ? 'Edit Produk' : 'Tambah Produk'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-400"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {errors.length > 0 && (
            <div className="bg-red-900/30 border border-red-800 rounded-xl p-3">
              {errors.map((err, i) => (
                <p key={i} className="text-sm text-red-400">
                  {err}
                </p>
              ))}
            </div>
          )}

          <div>
            <label className="text-sm text-slate-400 block mb-1.5">Nama Produk</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-12 bg-slate-800 border border-slate-700 rounded-xl px-4 text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="text-sm text-slate-400 block mb-1.5">Kategori</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ProductCategory)}
              className="w-full h-12 bg-slate-800 border border-slate-700 rounded-xl px-4 text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {categoryOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-sm text-slate-400">Ada Varian Harga?</label>
            <button
              onClick={() => setHasVariants(!hasVariants)}
              className={`w-12 h-7 rounded-full transition-colors ${
                hasVariants ? 'bg-brand-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow transform transition-transform ${
                  hasVariants ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {hasVariants ? (
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Biasa</label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={biasa}
                  onChange={(e) => setBiasa(e.target.value)}
                  placeholder="0"
                  className="w-full h-10 bg-slate-800 border border-slate-700 rounded-lg px-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Spesial</label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={spesial}
                  onChange={(e) => setSpesial(e.target.value)}
                  placeholder="0"
                  className="w-full h-10 bg-slate-800 border border-slate-700 rounded-lg px-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Super</label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={superPrice}
                  onChange={(e) => setSuperPrice(e.target.value)}
                  placeholder="0"
                  className="w-full h-10 bg-slate-800 border border-slate-700 rounded-lg px-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="text-sm text-slate-400 block mb-1.5">Harga (Rp)</label>
              <input
                type="number"
                inputMode="numeric"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0"
                className="w-full h-12 bg-slate-800 border border-slate-700 rounded-xl px-4 text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          )}

          <div className="flex items-center gap-3">
            <label className="text-sm text-slate-400">Tersedia</label>
            <button
              onClick={() => setIsAvailable(!isAvailable)}
              className={`w-12 h-7 rounded-full transition-colors ${
                isAvailable ? 'bg-green-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow transform transition-transform ${
                  isAvailable ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full h-14 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:bg-slate-800 text-white text-lg font-bold transition-colors"
          >
            {saving ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Tambah Produk'}
          </button>
        </div>
      </div>
    </div>
  );
}
