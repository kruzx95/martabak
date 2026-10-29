export type ProductCategory = 'manis' | 'tipis_kering' | 'asin_ayam' | 'asin_sapi' | 'ekstra';

export type AsinTier = 'biasa' | 'spesial' | 'super';

export interface ProductVariantPrices {
  biasa?: number;
  spesial?: number;
  super?: number;
}

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  hasVariants?: boolean;
  variantPrices?: ProductVariantPrices;
  isAvailable: boolean;
  updatedAt: number;
}

export interface CartItem {
  id: string; // unique cart entry key: `${productId}-${tier || 'std'}-${note || ''}`
  productId: string;
  name: string;
  category: ProductCategory;
  tier?: AsinTier;
  price: number;
  qty: number;
  note?: string;
  subtotal: number;
}

export interface Transaction {
  id: string;
  invoiceNo: string;
  createdAt: number;
  items: CartItem[];
  totalAmount: number;
  paymentMethod: 'cash' | 'qris';
  cashTendered?: number;
  changeAmount?: number;
  customerPhone?: string;
  shiftId?: string;
  syncStatus: 'pending' | 'synced';
  syncedAt?: number;
}

export interface Shift {
  id: string;
  cashierName: string;
  startTime: number;
  endTime?: number;
  initialCash: number;
  totalCashSales: number;
  totalQrisSales: number;
  actualCash?: number;
  difference?: number;
  status: 'open' | 'closed';
  createdAt: number;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  contactPaseh: string;
  contactLengkong: string;
  instagram: string;
  facebook: string;
  ownerPin: string;
  ownerPinHash?: string;
  paperWidth: '58mm' | '80mm';
}
