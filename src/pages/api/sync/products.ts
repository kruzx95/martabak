import type { APIRoute } from 'astro';
import { getServerDb } from '../../../lib/serverDb';
import type { Product } from '../../../types/pos';

export const GET: APIRoute = async () => {
  try {
    const db = getServerDb();
    const rows = db.prepare('SELECT * FROM products').all() as any[];

    const products: Product[] = rows.map((r) => ({
      id: r.id,
      name: r.name,
      category: r.category,
      price: r.price,
      hasVariants: Boolean(r.has_variants),
      variantPrices: r.variant_prices ? JSON.parse(r.variant_prices) : undefined,
      isAvailable: Boolean(r.is_available),
      updatedAt: r.updated_at,
    }));

    return new Response(JSON.stringify({ success: true, products }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const products: Product[] = body.products || [];
    const db = getServerDb();

    const upsertProduct = db.prepare(`
      INSERT INTO products (id, name, category, price, has_variants, variant_prices, is_available, updated_at)
      VALUES (@id, @name, @category, @price, @has_variants, @variant_prices, @is_available, @updated_at)
      ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        category = excluded.category,
        price = excluded.price,
        has_variants = excluded.has_variants,
        variant_prices = excluded.variant_prices,
        is_available = excluded.is_available,
        updated_at = excluded.updated_at
    `);

    const upsertMany = db.transaction((prods: Product[]) => {
      for (const p of prods) {
        upsertProduct.run({
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
    });

    upsertMany(products);

    return new Response(JSON.stringify({ success: true, count: products.length }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
