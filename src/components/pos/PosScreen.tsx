import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { Product, CartItem, Transaction, Shift } from '../../types/pos';
import { db } from '../../lib/clientDb';
import { startAutoSync } from '../../lib/syncWorker';
import HeaderBar from './HeaderBar';
import CategoryTabs from './CategoryTabs';
import ProductCard from './ProductCard';
import VariantModal from './VariantModal';
import StickyBottomBar from './StickyBottomBar';
import PaymentModal from './PaymentModal';
import ReceiptModal from './ReceiptModal';
import ShiftModal from './ShiftModal';
import PinModal from '../auth/PinModal';

export default function PosScreen() {
  // Data state
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<Map<string, CartItem>>(new Map());
  const [activeCategory, setActiveCategory] = useState('all');
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [currentShift, setCurrentShift] = useState<Shift | null>(null);
  const [ownerPin, setOwnerPin] = useState('1234');

  // Modal states
  const [showPayment, setShowPayment] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [showShift, setShowShift] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState<Transaction | null>(null);
  const [variantProduct, setVariantProduct] = useState<Product | null>(null);
  const [pinCallback, setPinCallback] = useState<(() => void) | null>(null);

  // Initialize
  useEffect(() => {
    const init = async () => {
      await db.seedDefaultsIfEmpty();
      const allProducts = await db.products.toArray();
      setProducts(allProducts);

      // Load settings
      const pinSetting = await db.settings.get('ownerPin');
      if (pinSetting) setOwnerPin(pinSetting.value);

      // Check for open shift
      const openShifts = await db.shifts.where('status').equals('open').toArray();
      if (openShifts.length > 0) setCurrentShift(openShifts[0]);

      // Start auto sync
      startAutoSync();
    };
    init();
  }, []);

  // Online/offline listener
  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  // Filtered products
  const filteredProducts = useMemo(() => {
    if (activeCategory === 'all') return products;
    return products.filter((p) => p.category === activeCategory);
  }, [products, activeCategory]);

  // Cart helpers
  const cartItems = useMemo(() => Array.from(cart.values()), [cart]);
  const totalAmount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.subtotal, 0),
    [cartItems]
  );
  const totalQty = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.qty, 0),
    [cartItems]
  );

  // Get total quantity for a product (across all variants)
  const getProductQty = useCallback(
    (productId: string): number => {
      let qty = 0;
      cart.forEach((item) => {
        if (item.productId === productId) qty += item.qty;
      });
      return qty;
    },
    [cart]
  );

  // Cart operations
  const handleIncrement = useCallback((product: Product) => {
    const cartId = `${product.id}-std-`;
    setCart((prev) => {
      const next = new Map(prev);
      const existing = next.get(cartId);
      if (existing) {
        next.set(cartId, {
          ...existing,
          qty: existing.qty + 1,
          subtotal: (existing.qty + 1) * existing.price,
        });
      } else {
        next.set(cartId, {
          id: cartId,
          productId: product.id,
          name: product.name,
          category: product.category,
          price: product.price,
          qty: 1,
          subtotal: product.price,
        });
      }
      return next;
    });
  }, []);

  const handleDecrement = useCallback((productId: string) => {
    const cartId = `${productId}-std-`;
    setCart((prev) => {
      const next = new Map(prev);
      const existing = next.get(cartId);
      if (existing) {
        if (existing.qty <= 1) {
          next.delete(cartId);
        } else {
          next.set(cartId, {
            ...existing,
            qty: existing.qty - 1,
            subtotal: (existing.qty - 1) * existing.price,
          });
        }
      }
      return next;
    });
  }, []);

  const handleVariantAdd = useCallback((item: CartItem) => {
    setCart((prev) => {
      const next = new Map(prev);
      const existing = next.get(item.id);
      if (existing) {
        next.set(item.id, {
          ...existing,
          qty: existing.qty + item.qty,
          subtotal: (existing.qty + item.qty) * existing.price,
        });
      } else {
        next.set(item.id, item);
      }
      return next;
    });
  }, []);

  const handleCartItemIncrement = useCallback((itemId: string) => {
    setCart((prev) => {
      const next = new Map(prev);
      const item = next.get(itemId);
      if (item) {
        next.set(itemId, {
          ...item,
          qty: item.qty + 1,
          subtotal: (item.qty + 1) * item.price,
        });
      }
      return next;
    });
  }, []);

  const handleCartItemDecrement = useCallback((itemId: string) => {
    setCart((prev) => {
      const next = new Map(prev);
      const item = next.get(itemId);
      if (item) {
        if (item.qty <= 1) {
          next.delete(itemId);
        } else {
          next.set(itemId, {
            ...item,
            qty: item.qty - 1,
            subtotal: (item.qty - 1) * item.price,
          });
        }
      }
      return next;
    });
  }, []);

  const handleRemoveItem = useCallback((itemId: string) => {
    setCart((prev) => {
      const next = new Map(prev);
      next.delete(itemId);
      return next;
    });
  }, []);

  const handlePaymentComplete = useCallback((tx: Transaction) => {
    setCurrentTransaction(tx);
    setShowPayment(false);
    setShowReceipt(true);
  }, []);

  const handleNewOrder = useCallback(() => {
    setCart(new Map());
    setCurrentTransaction(null);
    setShowReceipt(false);
  }, []);

  const handleSettingsClick = useCallback(() => {
    setPinCallback(() => () => {
      // Navigate to menu/settings page
      window.location.href = '/menu';
    });
    setShowPin(true);
  }, []);

  const handleRequestPin = useCallback((onSuccess: () => void) => {
    setPinCallback(() => onSuccess);
    setShowPin(true);
  }, []);

  const handlePinSuccess = useCallback(() => {
    setShowPin(false);
    if (pinCallback) {
      pinCallback();
      setPinCallback(null);
    }
  }, [pinCallback]);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <HeaderBar
        isOnline={isOnline}
        shiftName={currentShift?.cashierName}
        onSettingsClick={handleSettingsClick}
      />

      <CategoryTabs
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />

      {/* Product grid - shrink right margin on md+ for sidebar */}
      <main className="flex-1 p-3 pb-28 md:pb-4 md:mr-80 lg:mr-96">
        {/* Quick actions */}
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setShowShift(true)}
            className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
          >
            ⏱️ {currentShift ? 'Lihat Shift' : 'Buka Shift'}
          </button>
          <a
            href="/reports"
            className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
          >
            📊 Laporan
          </a>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              qty={getProductQty(product.id)}
              onIncrement={handleIncrement}
              onDecrement={handleDecrement}
              onVariantClick={setVariantProduct}
            />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center text-slate-600 py-16">
            <p className="text-lg">Tidak ada produk</p>
          </div>
        )}
      </main>

      <StickyBottomBar
        cartItems={cartItems}
        totalAmount={totalAmount}
        totalQty={totalQty}
        onPayClick={() => setShowPayment(true)}
        onIncrementItem={handleCartItemIncrement}
        onDecrementItem={handleCartItemDecrement}
        onRemoveItem={handleRemoveItem}
      />

      {/* Modals */}
      <VariantModal
        isOpen={variantProduct !== null}
        product={variantProduct}
        onClose={() => setVariantProduct(null)}
        onAdd={handleVariantAdd}
      />

      <PaymentModal
        isOpen={showPayment}
        cartItems={cartItems}
        totalAmount={totalAmount}
        shiftId={currentShift?.id}
        onClose={() => setShowPayment(false)}
        onComplete={handlePaymentComplete}
      />

      <ReceiptModal
        isOpen={showReceipt}
        transaction={currentTransaction}
        onClose={() => setShowReceipt(false)}
        onNewOrder={handleNewOrder}
      />

      <ShiftModal
        isOpen={showShift}
        currentShift={currentShift}
        onClose={() => setShowShift(false)}
        onShiftChange={setCurrentShift}
        onRequestPin={handleRequestPin}
      />

      <PinModal
        isOpen={showPin}
        onClose={() => {
          setShowPin(false);
          setPinCallback(null);
        }}
        onSuccess={handlePinSuccess}
        storedPin={ownerPin}
      />
    </div>
  );
}
