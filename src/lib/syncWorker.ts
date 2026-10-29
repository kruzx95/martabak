import type { Transaction } from '../types/pos';
import { db } from './clientDb';

export function prepareSyncBatch(txs: Transaction[]): Transaction[] {
  return txs.filter((t) => t.syncStatus === 'pending');
}

export async function markTransactionsAsSynced(
  txs: Transaction[],
  syncedIds: string[]
): Promise<void> {
  const syncedSet = new Set(syncedIds);
  for (const tx of txs) {
    if (syncedSet.has(tx.id)) {
      await db.transactions.update(tx.id, {
        syncStatus: 'synced',
        syncedAt: Date.now(),
      });
    }
  }
}

export function startAutoSync(): void {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return;

  const doSync = async () => {
    if (!navigator.onLine) return;
    try {
      const pending = await db.transactions
        .where('syncStatus')
        .equals('pending')
        .toArray();

      if (pending.length === 0) return;

      const batch = prepareSyncBatch(pending);
      const response = await fetch('/api/sync/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(batch),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.syncedIds) {
          await markTransactionsAsSynced(batch, data.syncedIds);
        }
      }
    } catch {
      // Sync failed silently - will retry on next online event
    }
  };

  window.addEventListener('online', () => {
    doSync();
  });

  // Also sync periodically when online (every 5 minutes)
  setInterval(() => {
    if (navigator.onLine) {
      doSync();
    }
  }, 5 * 60 * 1000);

  // Initial sync attempt
  doSync();
}
