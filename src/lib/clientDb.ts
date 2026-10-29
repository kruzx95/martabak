import Dexie, { type EntityTable } from 'dexie';
import type { Product, Transaction, Shift } from '../types/pos';
import { initialProducts, defaultSettings } from './initialMenu';

export interface SettingItem {
  key: string;
  value: any;
}

export class PosDatabase extends Dexie {
  products!: EntityTable<Product, 'id'>;
  transactions!: EntityTable<Transaction, 'id'>;
  shifts!: EntityTable<Shift, 'id'>;
  settings!: EntityTable<SettingItem, 'key'>;

  constructor() {
    super('MartabakPurnamaDB');
    this.version(1).stores({
      products: 'id, name, category, isAvailable, updatedAt',
      transactions: 'id, invoiceNo, createdAt, syncStatus, shiftId',
      shifts: 'id, status, startTime',
      settings: 'key',
    });
  }

  async seedDefaultsIfEmpty() {
    const count = await this.products.count();
    if (count === 0) {
      await this.products.bulkAdd(initialProducts);
      for (const [key, val] of Object.entries(defaultSettings)) {
        await this.settings.put({ key, value: val });
      }
    }
  }
}

export const db = new PosDatabase();
