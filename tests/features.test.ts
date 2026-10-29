import { describe, it, expect } from 'vitest';
import { generateInvoiceNumber, calculateChange, getQuickCashSuggestions, formatRupiah } from '../src/lib/invoice';
import { formatReceiptText, formatWhatsAppReceipt } from '../src/lib/receipt';
import { calculateShiftSummary } from '../src/lib/shift';
import { aggregateSalesMetrics, getTopSellingProducts, exportTransactionsToCsv } from '../src/lib/analytics';
import { verifyOwnerPin, validateProductPayload } from '../src/lib/auth';
import type { Transaction } from '../src/types/pos';

describe('Invoice and Payment Utilities', () => {
  it('generates sequential invoice numbers with MP prefix', () => {
    const inv = generateInvoiceNumber(1);
    expect(inv).toMatch(/^MP-\d{8}-0001$/);
  });

  it('calculates cash change accurately', () => {
    expect(calculateChange(85000, 100000)).toBe(15000);
    expect(calculateChange(50000, 50000)).toBe(0);
    expect(calculateChange(60000, 50000)).toBe(-10000);
  });

  it('provides quick cash denominations for cashier', () => {
    const suggestions = getQuickCashSuggestions(77000);
    expect(suggestions).toContain(77000); // Uang pas
    expect(suggestions).toContain(80000); // Round 10k
    expect(suggestions).toContain(100000); // Round 50k/100k
  });

  it('formats Indonesian Rupiah properly', () => {
    expect(formatRupiah(25000)).toContain('25.000');
  });
});

describe('Receipt Formatting', () => {
  const sampleTx: Transaction = {
    id: 'tx-1',
    invoiceNo: 'MP-20261029-0001',
    createdAt: Date.now(),
    items: [
      { id: '1', productId: 'p1', name: 'Martabak Keju Coklat', category: 'manis', price: 25000, qty: 2, subtotal: 50000 },
      { id: '2', productId: 'p2', name: 'Ayam Spesial', category: 'asin_ayam', tier: 'spesial', price: 30000, qty: 1, subtotal: 30000 },
    ],
    totalAmount: 80000,
    paymentMethod: 'cash',
    cashTendered: 100000,
    changeAmount: 20000,
    syncStatus: 'pending',
  };

  it('generates 32-column thermal receipt text with header and items', () => {
    const receipt = formatReceiptText(sampleTx, 32);
    expect(receipt).toContain('MARTABAK PURNAMA');
    expect(receipt).toContain('MP-20261029-0001');
    expect(receipt).toContain('80.000');
    expect(receipt).toContain('Kembali');
  });

  it('generates valid WhatsApp receipt URL with encoded details', () => {
    const waUrl = formatWhatsAppReceipt(sampleTx, '085724770052');
    expect(waUrl).toContain('https://wa.me/085724770052');
    expect(waUrl).toContain('MARTABAK%20PURNAMA');
  });
});

describe('Shift Reconciliation', () => {
  it('accurately tallies cash, QRIS, and drawer discrepancy', () => {
    const txs: Transaction[] = [
      { id: '1', invoiceNo: '1', createdAt: 1, items: [], totalAmount: 50000, paymentMethod: 'cash', syncStatus: 'synced' },
      { id: '2', invoiceNo: '2', createdAt: 2, items: [], totalAmount: 30000, paymentMethod: 'cash', syncStatus: 'synced' },
      { id: '3', invoiceNo: '3', createdAt: 3, items: [], totalAmount: 40000, paymentMethod: 'qris', syncStatus: 'synced' },
    ];
    const initialCash = 100000;
    const actualCash = 180000;
    const summary = calculateShiftSummary(initialCash, txs, actualCash);

    expect(summary.totalCashSales).toBe(80000);
    expect(summary.totalQrisSales).toBe(40000);
    expect(summary.expectedCash).toBe(180000);
    expect(summary.difference).toBe(0);
  });
});

describe('Sales Reports and Analytics', () => {
  const sampleTxs: Transaction[] = [
    {
      id: '1', invoiceNo: 'MP-01', createdAt: Date.now(),
      items: [{ id: '1', productId: 'p1', name: 'Keju Coklat', category: 'manis', price: 25000, qty: 3, subtotal: 75000 }],
      totalAmount: 75000, paymentMethod: 'cash', syncStatus: 'pending'
    },
    {
      id: '2', invoiceNo: 'MP-02', createdAt: Date.now(),
      items: [
        { id: '1', productId: 'p1', name: 'Keju Coklat', category: 'manis', price: 25000, qty: 1, subtotal: 25000 },
        { id: '2', productId: 'p2', name: 'Ayam Spesial', category: 'asin_ayam', price: 30000, qty: 2, subtotal: 60000 },
      ],
      totalAmount: 85000, paymentMethod: 'qris', syncStatus: 'pending'
    },
  ];

  it('calculates total revenue and split between cash and QRIS', () => {
    const summary = aggregateSalesMetrics(sampleTxs);
    expect(summary.totalRevenue).toBe(160000);
    expect(summary.transactionCount).toBe(2);
    expect(summary.cashRevenue).toBe(75000);
    expect(summary.qrisRevenue).toBe(85000);
  });

  it('ranks top selling products correctly', () => {
    const top = getTopSellingProducts(sampleTxs);
    expect(top[0].name).toBe('Keju Coklat');
    expect(top[0].totalQty).toBe(4);
  });

  it('generates exportable CSV string with headers', () => {
    const csv = exportTransactionsToCsv(sampleTxs);
    expect(csv).toContain('Invoice,Tanggal,Item,Qty,Harga,Subtotal,Total,Metode Bayar,Status Sync');
    expect(csv).toContain('MP-01');
    expect(csv).toContain('75000');
  });
});

describe('Security & Product Validation', () => {
  it('verifies owner PIN', () => {
    expect(verifyOwnerPin('1234', '1234')).toBe(true);
    expect(verifyOwnerPin('9999', '1234')).toBe(false);
  });

  it('validates product payloads', () => {
    const valid = validateProductPayload({ name: 'Martabak Red Velvet', category: 'manis', price: 35000 });
    expect(valid.isValid).toBe(true);

    const invalid = validateProductPayload({ name: '', category: 'manis', price: -100 });
    expect(invalid.isValid).toBe(false);
  });
});
