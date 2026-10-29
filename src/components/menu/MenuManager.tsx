import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, Plus, Edit, Trash2, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import type { Product, ProductCategory } from '../../types/pos';
import { db } from '../../lib/clientDb';
import { formatRupiah } from '../../lib/invoice';
import ProductFormModal from './ProductFormModal';
import PinModal from '../auth/PinModal';

const categoryLabels: Record<string, string> = {
  all: 'Semua',
  manis: 'Manis',
  tipis_kering: 'Tipis Kering',
  asin_ayam: 'Asin (Ayam)',
  asin_sapi: 'Asin (Sapi)',
};

export default function MenuManager() {
  const [authenticated, setAuthenticated] = useState(false);
  const [ownerPin, setOwnerPin] = useState('1234');
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Load pin setting
  useEffect(() => {
    db.settings.get('ownerPin').then((s) => {
      if (s) setOwnerPin(s.value);
    });
  }, []);

  const loadProducts = useCallback(async () => {
    const all = await db.products.toArray();
    setProducts(all);
  }, []);

  useEffect(() => {
    if (authenticated) loadProducts();
  }, [authenticated, loadProducts]);

  const filtered = useMemo(() => {
    let result = products;
    if (filterCategory !== 'all') {
      result = result.filter((p) => p.category === filterCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(q));
    }
    return result;
  }, [products, filterCategory, search]);

  const toggleAvailability = async (product: Product) => {
    await db.products.update(product.id, {
      isAvailable: !product.isAvailable,
      updatedAt: Date.now(),
    });
    loadProducts();
  };

  const deleteProduct = async (id: string) => {
    await db.products.delete(id);
    setShowDeleteConfirm(null);
    loadProducts();
  };

  if (!authenticated) {
    return (
      <PinModal
        isOpen={true}
        onClose={() => (window.location.href = '/')}
        onSuccess={() => setAuthenticated(true)}
        storedPin={ownerPin}
        title="PIN untuk Menu Manager"
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur border-b border-slate-800 px-4 py-3 flex items-center gap-3">
        <a
          href="/"
          className="p-2 rounded-xl hover:bg-slate-800 text-slate-400"
        >
          <ArrowLeft size={20} />
        </a>
        <h1 className="text-lg font-bold text-brand-400 flex-1">Kelola Menu</h1>
        <button
          onClick={() => {
            setEditProduct(null);
            setShowForm(true);
          }}
          className="h-10 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium flex items-center gap-1.5"
        >
          <Plus size={16} />
          Tambah
        </button>
      </header>

      {/* Search & filter */}
      <div className="px-4 py-3 space-y-2">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari produk..."
            className="w-full h-11 bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {Object.entries(categoryLabels).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilterCategory(key)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 ${
                filterCategory === key
                  ? 'bg-brand-500 text-white'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Product list */}
      <main className="flex-1 px-4 pb-4 space-y-2">
        {filtered.map((product) => (
          <div
            key={product.id}
            className={`bg-slate-900 border rounded-xl p-3 flex items-center gap-3 ${
              product.isAvailable ? 'border-slate-800' : 'border-slate-800 opacity-60'
            }`}
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-100 truncate">
                {product.name}
              </p>
              <p className="text-xs text-slate-500">
                {categoryLabels[product.category] || product.category}
              </p>
              <p className="text-sm text-brand-400 font-semibold">
                {formatRupiah(product.price)}
              </p>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => toggleAvailability(product)}
                className={`p-2 rounded-lg ${
                  product.isAvailable
                    ? 'text-green-400 hover:bg-green-900/30'
                    : 'text-slate-600 hover:bg-slate-800'
                }`}
                title={product.isAvailable ? 'Tersedia' : 'Habis'}
              >
                {product.isAvailable ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
              <button
                onClick={() => {
                  setEditProduct(product);
                  setShowForm(true);
                }}
                className="p-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-brand-400"
              >
                <Edit size={18} />
              </button>
              <button
                onClick={() => setShowDeleteConfirm(product.id)}
                className="p-2 rounded-lg text-slate-400 hover:bg-red-900/30 hover:text-red-400"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center text-slate-600 py-16">
            <p>Tidak ada produk ditemukan</p>
          </div>
        )}
      </main>

      {/* Product form modal */}
      <ProductFormModal
        isOpen={showForm}
        product={editProduct}
        onClose={() => {
          setShowForm(false);
          setEditProduct(null);
        }}
        onSaved={loadProducts}
      />

      {/* Delete confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 rounded-2xl w-full max-w-sm p-6 border border-slate-700 space-y-4">
            <h3 className="text-lg font-semibold text-slate-100">Hapus Produk?</h3>
            <p className="text-sm text-slate-400">
              Produk akan dihapus permanen dari menu.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 h-12 rounded-xl bg-slate-800 text-slate-200 font-medium"
              >
                Batal
              </button>
              <button
                onClick={() => deleteProduct(showDeleteConfirm)}
                className="flex-1 h-12 rounded-xl bg-red-600 text-white font-medium"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
