import type { Transaction } from '../types/pos';

export interface SalesMetrics {
  totalRevenue: number;
  transactionCount: number;
  avgTransaction: number;
  cashRevenue: number;
  qrisRevenue: number;
}

export interface TopProduct {
  name: string;
  totalQty: number;
  totalRevenue: number;
}

export function aggregateSalesMetrics(transactions: Transaction[]): SalesMetrics {
  const totalRevenue = transactions.reduce((sum, t) => sum + t.totalAmount, 0);
  const transactionCount = transactions.length;
  const avgTransaction = transactionCount > 0 ? Math.round(totalRevenue / transactionCount) : 0;
  const cashRevenue = transactions
    .filter((t) => t.paymentMethod === 'cash')
    .reduce((sum, t) => sum + t.totalAmount, 0);
  const qrisRevenue = transactions
    .filter((t) => t.paymentMethod === 'qris')
    .reduce((sum, t) => sum + t.totalAmount, 0);

  return { totalRevenue, transactionCount, avgTransaction, cashRevenue, qrisRevenue };
}

export function getTopSellingProducts(
  transactions: Transaction[],
  limit: number = 5
): TopProduct[] {
  const productMap = new Map<string, TopProduct>();

  for (const tx of transactions) {
    for (const item of tx.items) {
      const key = item.name + (item.tier ? ` (${item.tier})` : '');
      const existing = productMap.get(key);
      if (existing) {
        existing.totalQty += item.qty;
        existing.totalRevenue += item.subtotal;
      } else {
        productMap.set(key, {
          name: key,
          totalQty: item.qty,
          totalRevenue: item.subtotal,
        });
      }
    }
  }

  return Array.from(productMap.values())
    .sort((a, b) => b.totalQty - a.totalQty)
    .slice(0, limit);
}

export function exportTransactionsToCsv(transactions: Transaction[]): string {
  const headers = [
    'Invoice',
    'Tanggal',
    'Item',
    'Qty',
    'Harga',
    'Subtotal',
    'Total',
    'Metode Bayar',
    'Status Sync',
  ];

  const rows: string[] = [headers.join(',')];

  for (const tx of transactions) {
    const date = new Date(tx.createdAt).toLocaleString('id-ID');
    for (const item of tx.items) {
      rows.push(
        [
          tx.invoiceNo,
          `"${date}"`,
          `"${item.name}${item.tier ? ` (${item.tier})` : ''}"`,
          item.qty,
          item.price,
          item.subtotal,
          tx.totalAmount,
          tx.paymentMethod,
          tx.syncStatus,
        ].join(',')
      );
    }
  }

  return rows.join('\n');
}

export function filterTransactionsByRange(
  transactions: Transaction[],
  range: 'today' | '7days' | 'month' | 'all'
): Transaction[] {
  if (range === 'all') return transactions;

  const now = new Date();
  let startDate: Date;

  switch (range) {
    case 'today':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case '7days':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
  }

  return transactions.filter((t) => t.createdAt >= startDate.getTime());
}
