import type { Transaction, Shift } from '../types/pos';
import { db } from './clientDb';

export interface ShiftSummary {
  totalCashSales: number;
  totalQrisSales: number;
  expectedCash: number;
  difference: number;
  totalTransactions: number;
}

export function calculateShiftSummary(
  initialCash: number,
  transactions: Transaction[],
  actualCash: number
): ShiftSummary {
  const totalCashSales = transactions
    .filter((t) => t.paymentMethod === 'cash')
    .reduce((sum, t) => sum + t.totalAmount, 0);

  const totalQrisSales = transactions
    .filter((t) => t.paymentMethod === 'qris')
    .reduce((sum, t) => sum + t.totalAmount, 0);

  const expectedCash = initialCash + totalCashSales;
  const difference = actualCash - expectedCash;

  return {
    totalCashSales,
    totalQrisSales,
    expectedCash,
    difference,
    totalTransactions: transactions.length,
  };
}

export async function openNewShift(
  cashierName: string,
  initialCash: number
): Promise<Shift> {
  const shift: Shift = {
    id: `shift-${Date.now()}`,
    cashierName,
    startTime: Date.now(),
    initialCash,
    totalCashSales: 0,
    totalQrisSales: 0,
    status: 'open',
    createdAt: Date.now(),
  };
  await db.shifts.add(shift);
  return shift;
}

export async function closeCurrentShift(
  shiftId: string,
  actualCash: number
): Promise<Shift | null> {
  const shift = await db.shifts.get(shiftId);
  if (!shift) return null;

  const transactions = await db.transactions
    .where('shiftId')
    .equals(shiftId)
    .toArray();

  const summary = calculateShiftSummary(shift.initialCash, transactions, actualCash);

  const updated: Partial<Shift> = {
    endTime: Date.now(),
    actualCash,
    totalCashSales: summary.totalCashSales,
    totalQrisSales: summary.totalQrisSales,
    difference: summary.difference,
    status: 'closed',
  };

  await db.shifts.update(shiftId, updated);
  return { ...shift, ...updated } as Shift;
}
