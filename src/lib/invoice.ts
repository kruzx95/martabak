export function generateInvoiceNumber(seq: number): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `MP-${yyyy}${mm}${dd}-${String(seq).padStart(4, '0')}`;
}

export function calculateChange(total: number, tendered: number): number {
  return tendered - total;
}

export function getQuickCashSuggestions(total: number): number[] {
  const suggestions = new Set<number>();
  suggestions.add(total); // Uang Pas
  const next10k = Math.ceil(total / 10000) * 10000;
  if (next10k > total) suggestions.add(next10k);
  const next50k = Math.ceil(total / 50000) * 50000;
  if (next50k > total) suggestions.add(next50k);
  const next100k = Math.ceil(total / 100000) * 100000;
  if (next100k > total) suggestions.add(next100k);
  return Array.from(suggestions).slice(0, 4);
}

export function formatRupiah(amount: number): string {
  return `Rp ${amount.toLocaleString('id-ID')}`;
}
