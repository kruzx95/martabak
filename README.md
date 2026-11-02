# Martabak Purnama POS (PWA + Astro.build)

Aplikasi Point of Sale (POS) modern, cepat, dan **Offline-First** khusus usaha **Martabak Purnama ("Idaman Mama Mertua")**.

Dibangun dengan **Astro 5**, **React 19**, **Tailwind CSS**, **Dexie.js (IndexedDB)**, dan **SQLite**, dioptimalkan untuk perangkat HP & Tablet di gerai tatap muka.

---

## Fitur Utama

1. **Transaksi 1 Layar (Single Screen)**:
   - Tambah/kurang item langsung pada kartu menu dengan tombol `+`/`-` tanpa perlu bolak-balik buka keranjang.
   - Ringkasan total dan tombol "Bayar" melayang (*sticky checkout bar*) di bagian bawah (mode HP) atau di sidebar kanan (mode Tablet).
   - Modal cepat varian rasa (Biasa, Spesial, Super) dan catatan khusus (misal: "Setengah Matang", "Garing", "Pedas").

2. **Katalog Menu Resmi Martabak Purnama**:
   - **Martabak Manis**: 20 varian rasa (Keju, Coklat, Kacang, Greentea, Kitkat, Silverqueen, dll.).
   - **Tipis Kering**: 19 varian renyah (Keju, Coklat, Milo, Oreo, dll.).
   - **Martabak Asin (Telur)**: Varian Ayam & Sapi lengkap dengan 3 tingkatan (Biasa, Spesial, Super).

3. **Dashboard Kelola Menu (CRUD Menu)**:
   - Dilindungi **PIN Owner 4 Digit** (default: `1234`).
   - Tambah menu baru, ubah nama atau harga, toggle status ketersediaan (*Tersedia / Habis*), dan hapus menu lama.

4. **Pembayaran & Struk Lengkap**:
   - **Tunai**: Tombol pecahan nominal cepat (*Uang Pas, 50k, 100k*) dan kalkulator kembalian otomatis.
   - **QRIS**: Tampilan QRIS statis gerai dengan verifikasi konfirmasi.
   - **Cetak Struk**: Format struk thermal (58mm / 80mm) via dialog cetak browser & Web Bluetooth, serta tombol langsung kirim struk digital lewat WhatsApp.

5. **Manajemen Shift Kasir (Cash Drawer)**:
   - Input modal awal kas saat buka kasir.
   - Rekap kas masuk (Tunai vs QRIS) dan hitung selisih laci saat tutup shift.

6. **Laporan Penjualan (Owner Analytics)**:
   - Dilindungi PIN Owner.
   - Grafik & kartu metrik omset, total transaksi, rata-rata transaksi.
   - Peringkat 5 Menu Terlaris (*Top Best Sellers*).
   - Riwayat transaksi terperinci dengan pencarian nomor nota dan tombol cetak ulang (*reprint*).
   - Ekspor data laporan ke format **CSV / Excel**.

7. **Offline-First & PWA Ready**:
   - Menggunakan **IndexedDB (Dexie.js)** di perangkat: kasir tetap bisa melayani transaksi lancar 100% meski tanpa internet.
   - Otomatis sinkronisasi ke server VPS saat perangkat terhubung ke internet.
   - PWA *installable* di HP/Tablet kasir (*Add to Home Screen*).

---

## Cara Menjalankan di Lokal (Development)

```bash
# 1. Install dependencies
npm install

# 2. Jalankan server lokal
npm run dev

# 3. Buka browser di http://localhost:4321
```

---

## Panduan VPS Deployment

Lihat panduan lengkap di: [`deploy/vps-setup.md`](deploy/vps-setup.md).

```bash
# Build untuk production
npm run build

# Jalankan via PM2
pm2 start deploy/ecosystem.config.cjs
```

