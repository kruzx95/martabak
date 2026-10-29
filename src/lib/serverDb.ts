import Database from 'better-sqlite3';
import path from 'node:path';
import fs from 'node:fs';
import { initialProducts, defaultSettings } from './initialMenu';

const dbInstances: Map<string, Database.Database> = new Map();

export function getServerDb(customPath?: string): Database.Database {
  const dbPath = customPath || path.resolve(process.cwd(), 'data', 'martabak.sqlite');

  if (dbInstances.has(dbPath)) {
    return dbInstances.get(dbPath)!;
  }

  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const db = new Database(dbPath);

  // Initialize tables with snake_case and camelCase compatibility
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      price INTEGER NOT NULL,
      has_variants INTEGER DEFAULT 0,
      variant_prices TEXT,
      is_available INTEGER DEFAULT 1,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      invoice_no TEXT NOT NULL UNIQUE,
      shift_id TEXT,
      created_at INTEGER NOT NULL,
      items TEXT NOT NULL,
      total_amount INTEGER NOT NULL,
      payment_method TEXT NOT NULL,
      cash_tendered INTEGER,
      change_amount INTEGER,
      customer_phone TEXT,
      sync_status TEXT DEFAULT 'synced',
      synced_at INTEGER
    );

    CREATE TABLE IF NOT EXISTS shifts (
      id TEXT PRIMARY KEY,
      cashier_name TEXT NOT NULL,
      start_time INTEGER NOT NULL,
      end_time INTEGER,
      initial_cash INTEGER NOT NULL,
      total_cash_sales INTEGER DEFAULT 0,
      total_qris_sales INTEGER DEFAULT 0,
      actual_cash INTEGER,
      difference INTEGER,
      status TEXT DEFAULT 'open',
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  // Seed initial products if table is empty
  const countRow = db.prepare('SELECT count(*) as count FROM products').get() as { count: number };
  if (countRow.count === 0) {
    const insertProduct = db.prepare(`
      INSERT INTO products (id, name, category, price, has_variants, variant_prices, is_available, updated_at)
      VALUES (@id, @name, @category, @price, @has_variants, @variant_prices, @is_available, @updated_at)
    `);

    const seedAll = db.transaction(() => {
      for (const p of initialProducts) {
        insertProduct.run({
          id: p.id,
          name: p.name,
          category: p.category,
          price: p.price,
          has_variants: p.hasVariants ? 1 : 0,
          variant_prices: p.variantPrices ? JSON.stringify(p.variantPrices) : null,
          is_available: p.isAvailable ? 1 : 0,
          updated_at: p.updatedAt,
        });
      }

      const insertSetting = db.prepare(`
        INSERT INTO settings (key, value) VALUES (?, ?)
      `);
      for (const [key, val] of Object.entries(defaultSettings)) {
        insertSetting.run(key, JSON.stringify(val));
      }
    });

    seedAll();
  }

  dbInstances.set(dbPath, db);
  return db;
}

export function closeServerDb(customPath?: string): void {
  const dbPath = customPath || path.resolve(process.cwd(), 'data', 'martabak.sqlite');
  const db = dbInstances.get(dbPath);
  if (db) {
    db.close();
    dbInstances.delete(dbPath);
  }
}
