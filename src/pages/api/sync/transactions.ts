import type { APIRoute } from 'astro';
import { getServerDb } from '../../../lib/serverDb';
import type { Transaction } from '../../../types/pos';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const transactions: Transaction[] = body.transactions || [];

    if (!Array.isArray(transactions) || transactions.length === 0) {
      return new Response(JSON.stringify({ success: true, syncedIds: [] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const db = getServerDb();
    const insertTx = db.prepare(`
      INSERT INTO transactions (
        id, invoice_no, shift_id, created_at, items, total_amount, payment_method,
        cash_tendered, change_amount, customer_phone, sync_status, synced_at
      ) VALUES (
        @id, @invoice_no, @shift_id, @created_at, @items, @total_amount, @payment_method,
        @cash_tendered, @change_amount, @customer_phone, 'synced', @synced_at
      )
      ON CONFLICT(id) DO UPDATE SET
        sync_status = 'synced',
        synced_at = excluded.synced_at
    `);

    const syncedIds: string[] = [];
    const now = Date.now();

    const insertMany = db.transaction((txs: Transaction[]) => {
      for (const tx of txs) {
        insertTx.run({
          id: tx.id,
          invoice_no: tx.invoiceNo,
          shift_id: tx.shiftId || null,
          created_at: tx.createdAt,
          items: JSON.stringify(tx.items),
          total_amount: tx.totalAmount,
          payment_method: tx.paymentMethod,
          cash_tendered: tx.cashTendered || null,
          change_amount: tx.changeAmount || null,
          customer_phone: tx.customerPhone || null,
          synced_at: now,
        });
        syncedIds.push(tx.id);
      }
    });

    insertMany(transactions);

    return new Response(JSON.stringify({ success: true, syncedIds }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error syncing transactions:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
