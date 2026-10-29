import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { initialProducts, defaultSettings } from '../src/lib/initialMenu';
import { getServerDb, closeServerDb } from '../src/lib/serverDb';
import { PosDatabase, db } from '../src/lib/clientDb';
import type { Product, Transaction, Shift, StoreSettings } from '../src/types/pos';
import fs from 'node:fs';
import path from 'node:path';

describe('Data Models & Initial Menu Catalog', () => {
  it('contains all 20 Martabak Manis items with correct pricing', () => {
    const manis = initialProducts.filter(p => p.category === 'manis');
    expect(manis.length).toBe(20);

    // 25.000 items (13 items)
    const items25k = [
      'Keju', 'Coklat', 'Kacang', 'Keju Coklat', 'Keju Kacang',
      'Kacang Coklat', 'Oreo', 'Milo', 'Greentea', 'Tiramisu',
      'Choco Crunchy', 'Strawberry', 'Blueberry'
    ];
    for (const name of items25k) {
      const item = manis.find(p => p.name === name);
      expect(item, `Martabak Manis ${name} should exist`).toBeDefined();
      expect(item?.price).toBe(25000);
      expect(item?.hasVariants).toBe(false);
    }

    // 27.000 items (4 items)
    const items27k = ['Keju Kacang Coklat', 'Keju Pisang', 'Keju Kismis', 'Keju Jagung'];
    for (const name of items27k) {
      const item = manis.find(p => p.name === name);
      expect(item, `Martabak Manis ${name} should exist`).toBeDefined();
      expect(item?.price).toBe(27000);
    }

    // 40.000 items (3 items)
    const items40k = ['Double Cheese', 'Kitkat', 'Silverqueen'];
    for (const name of items40k) {
      const item = manis.find(p => p.name === name);
      expect(item, `Martabak Manis ${name} should exist`).toBeDefined();
      expect(item?.price).toBe(40000);
    }
  });

  it('contains all 19 Tipis Kering items with correct pricing', () => {
    const tipis = initialProducts.filter(p => p.category === 'tipis_kering');
    expect(tipis.length).toBe(19);

    // 12.000 items (13 items)
    const items12k = [
      'Keju', 'Coklat', 'Kacang', 'Kacang Coklat', 'Keju Coklat',
      'Keju Kacang', 'Oreo', 'Milo', 'Greentea', 'Choco Crunchy',
      'Strawberry', 'Blueberry', 'Tiramisu'
    ];
    for (const name of items12k) {
      const item = tipis.find(p => p.name === name);
      expect(item, `Tipis Kering ${name} should exist`).toBeDefined();
      expect(item?.price).toBe(12000);
      expect(item?.hasVariants).toBe(false);
    }

    // 15.000 items (6 items)
    const items15k = ['Keju Pisang', 'Keju Kismis', 'Keju Campur', 'Kitkat', 'Double Cheese', 'Silverqueen'];
    for (const name of items15k) {
      const item = tipis.find(p => p.name === name);
      expect(item, `Tipis Kering ${name} should exist`).toBeDefined();
      expect(item?.price).toBe(15000);
    }
  });

  it('contains Martabak Asin Ayam items with Biasa, Spesial, and Super tiers', () => {
    const ayam = initialProducts.filter(p => p.category === 'asin_ayam');
    expect(ayam.length).toBe(12);

    // Ayam Centil: Biasa 25k, Spesial 30k, Super 35k
    const centil = ayam.find(p => p.name === 'Ayam Centil');
    expect(centil).toBeDefined();
    expect(centil?.variantPrices?.biasa).toBe(25000);
    expect(centil?.variantPrices?.spesial).toBe(30000);
    expect(centil?.variantPrices?.super).toBe(35000);

    // Standard Ayam items: Biasa 27k, Spesial 33k, Super 37k
    const stdAyam = ['Ayam Jamur', 'Ayam Jagung', 'Ayam Meringis', 'Ayam Silongil Seuhah', 'Ayam Sosis'];
    for (const name of stdAyam) {
      const item = ayam.find(p => p.name === name);
      expect(item, `${name} should exist`).toBeDefined();
      expect(item?.variantPrices?.biasa).toBe(27000);
      expect(item?.variantPrices?.spesial).toBe(33000);
      expect(item?.variantPrices?.super).toBe(37000);
    }

    // Ayam Mozarella: Spesial 42k, Super 47k
    const mozarella = ayam.find(p => p.name === 'Ayam Mozarella');
    expect(mozarella).toBeDefined();
    expect(mozarella?.variantPrices?.spesial).toBe(42000);
    expect(mozarella?.variantPrices?.super).toBe(47000);

    // Ayam combo Mozarella: Spesial 45k, Super 50k
    const mozaCombos = [
      'Ayam Jamur Mozarella', 'Ayam Jagung Mozarella', 'Ayam Meringis Mozarella',
      'Ayam Silongil Seuhah Mozarella', 'Ayam Sosis Mozarella'
    ];
    for (const name of mozaCombos) {
      const item = ayam.find(p => p.name === name);
      expect(item, `${name} should exist`).toBeDefined();
      expect(item?.variantPrices?.spesial).toBe(45000);
      expect(item?.variantPrices?.super).toBe(50000);
    }
  });

  it('contains Martabak Asin Sapi items with Biasa, Spesial, and Super tiers', () => {
    const sapi = initialProducts.filter(p => p.category === 'asin_sapi');
    expect(sapi.length).toBe(12);

    // Sapi Bujangan: Biasa 27k, Spesial 32k, Super 37k
    const bujangan = sapi.find(p => p.name === 'Sapi Bujangan');
    expect(bujangan).toBeDefined();
    expect(bujangan?.variantPrices?.biasa).toBe(27000);
    expect(bujangan?.variantPrices?.spesial).toBe(32000);
    expect(bujangan?.variantPrices?.super).toBe(37000);

    // Standard Sapi items: Biasa 30k, Spesial 35k, Super 40k
    const stdSapi = ['Sapi Jamur', 'Sapi Jagung', 'Sapi Meringis', 'Sapi Silongil Seuhah', 'Sapi Sosis'];
    for (const name of stdSapi) {
      const item = sapi.find(p => p.name === name);
      expect(item, `${name} should exist`).toBeDefined();
      expect(item?.variantPrices?.biasa).toBe(30000);
      expect(item?.variantPrices?.spesial).toBe(35000);
      expect(item?.variantPrices?.super).toBe(40000);
    }

    // Sapi Mozarella: Spesial 45k, Super 50k
    const sapiMoza = sapi.find(p => p.name === 'Sapi Mozarella');
    expect(sapiMoza).toBeDefined();
    expect(sapiMoza?.variantPrices?.spesial).toBe(45000);
    expect(sapiMoza?.variantPrices?.super).toBe(50000);

    // Sapi combo Mozarella: Spesial 47k, Super 53k
    const sapiMozaCombos = [
      'Sapi Jamur Mozarella', 'Sapi Jagung Mozarella', 'Sapi Meringis Mozarella',
      'Sapi Silayung Seuhah Mozarella', 'Sapi Sosis Mozarella'
    ];
    for (const name of sapiMozaCombos) {
      const item = sapi.find(p => p.name === name);
      expect(item, `${name} should exist`).toBeDefined();
      expect(item?.variantPrices?.spesial).toBe(47000);
      expect(item?.variantPrices?.super).toBe(53000);
    }
  });

  it('contains authentic store default settings', () => {
    expect(defaultSettings.storeName).toBe('Martabak Purnama');
    expect(defaultSettings.tagline).toBe('Idaman Mama Mertua');
    expect(defaultSettings.contactPaseh).toBe('085 724 770 052');
    expect(defaultSettings.contactLengkong).toBe('089 953 508 58');
    expect(defaultSettings.instagram).toBe('@purnamamartabak');
    expect(defaultSettings.facebook).toBe('martabak purnama');
    expect(defaultSettings.ownerPin).toBe('1234');
  });

  it('initializes and manages SQLite server database', () => {
    const testDbPath = path.join(process.cwd(), 'tests', 'test-martabak.sqlite');
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }

    try {
      const serverDb = getServerDb(testDbPath);
      expect(serverDb).toBeDefined();

      // Check tables exist
      const tables = serverDb
        .prepare("SELECT name FROM sqlite_master WHERE type='table'")
        .all() as { name: string }[];
      const tableNames = tables.map(t => t.name);

      expect(tableNames).toContain('products');
      expect(tableNames).toContain('transactions');
      expect(tableNames).toContain('shifts');
      expect(tableNames).toContain('settings');

      // Check seeding products in server db
      const productCount = serverDb.prepare('SELECT count(*) as count FROM products').get() as { count: number };
      expect(productCount.count).toBeGreaterThan(0);

      // Verify insertion of a transaction
      const insertTx = serverDb.prepare(`
        INSERT INTO transactions (id, invoice_no, created_at, items, total_amount, payment_method, sync_status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      insertTx.run('tx-test-1', 'INV-TEST-001', Date.now(), JSON.stringify([]), 50000, 'cash', 'synced');

      const retrievedTx = serverDb.prepare('SELECT * FROM transactions WHERE id = ?').get('tx-test-1') as any;
      expect(retrievedTx).toBeDefined();
      expect(retrievedTx.invoice_no).toBe('INV-TEST-001');
      expect(retrievedTx.total_amount).toBe(50000);

      closeServerDb(testDbPath);
    } finally {
      if (fs.existsSync(testDbPath)) {
        fs.unlinkSync(testDbPath);
      }
    }
  });

  it('exposes Dexie clientDb configuration and schema', () => {
    expect(PosDatabase).toBeDefined();
    expect(db).toBeInstanceOf(PosDatabase);
    expect(db.name).toBe('MartabakPurnamaDB');
    expect(typeof db.seedDefaultsIfEmpty).toBe('function');
  });
});
