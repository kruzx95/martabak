import type { Transaction } from '../types/pos';
import { formatRupiah } from './invoice';

function centerText(text: string, cols: number): string {
  const pad = Math.max(0, Math.floor((cols - text.length) / 2));
  return ' '.repeat(pad) + text;
}

function leftRight(left: string, right: string, cols: number): string {
  const space = Math.max(1, cols - left.length - right.length);
  return left + ' '.repeat(space) + right;
}

function divider(cols: number): string {
  return '-'.repeat(cols);
}

export function formatReceiptText(tx: Transaction, columns: number = 32): string {
  const lines: string[] = [];

  lines.push(centerText('MARTABAK PURNAMA', columns));
  lines.push(centerText('Idaman Mama Mertua', columns));
  lines.push(divider(columns));

  const date = new Date(tx.createdAt);
  const dateStr = date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const timeStr = date.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });
  lines.push(`Tgl: ${dateStr} ${timeStr}`);
  lines.push(`No : ${tx.invoiceNo}`);
  lines.push(divider(columns));

  for (const item of tx.items) {
    const tierLabel = item.tier ? ` (${item.tier})` : '';
    const name = `${item.name}${tierLabel}`;
    lines.push(name);
    const detail = `  ${item.qty} x ${formatRupiah(item.price)}`;
    const sub = formatRupiah(item.subtotal);
    lines.push(leftRight(detail, sub, columns));
    if (item.note) {
      lines.push(`  * ${item.note}`);
    }
  }

  lines.push(divider(columns));
  lines.push(leftRight('TOTAL', formatRupiah(tx.totalAmount), columns));

  if (tx.paymentMethod === 'cash') {
    lines.push(leftRight('Bayar', formatRupiah(tx.cashTendered ?? 0), columns));
    lines.push(leftRight('Kembali', formatRupiah(tx.changeAmount ?? 0), columns));
  } else {
    lines.push(leftRight('Bayar', 'QRIS', columns));
  }

  lines.push(divider(columns));
  lines.push(centerText('Terima Kasih!', columns));
  lines.push(centerText('Paseh: 085 724 770 052', columns));
  lines.push(centerText('Lengkong: 089 953 508 58', columns));
  lines.push(centerText('IG: @purnamamartabak', columns));

  return lines.join('\n');
}

export function formatWhatsAppReceipt(tx: Transaction, storePhone: string): string {
  const receiptText = formatReceiptText(tx, 32);
  const phone = storePhone.replace(/\D/g, '');
  const encodedText = encodeURIComponent(receiptText);
  return `https://wa.me/${phone}?text=${encodedText}`;
}

export function printViaBrowserDialog(): void {
  if (typeof window !== 'undefined') {
    window.print();
  }
}
