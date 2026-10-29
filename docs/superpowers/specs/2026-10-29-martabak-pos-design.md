# Spesifikasi Desain: Aplikasi POS Martabak Purnama (PWA + Astro.build)

- **Tanggal**: 2026-10-29
- **Status**: Draft Disetujui (Menunggu Review Akhir)
- **Kategori**: Architectural Specification
- **Bisnis**: Martabak Purnama ("Idaman Mama Mertua") - Cabang Paseh & Lengkong

---

## 1. Ringkasan & Tujuan Proyek

Aplikasi Point of Sale (POS) modern berbasis **Astro.build** yang dirancang khusus untuk gerai fisik martabak secara tatap muka (*face-to-face*). Aplikasi ini mengutamakan kecepatan layanan antrean kasir dengan prinsip **1-Screen Transaction** (tambah/kurang item langsung di kartu menu tanpa berpindah layar), beroperasi secara **Offline-First** (dapat digunakan 100% tanpa internet), dan otomatis tersinkronisasi ke server VPS saat perangkat terhubung ke jaringan internet.

### Kriteria Kunci:
1. **Transaksi 1 Layar**: Tombol `+` / `-` langsung di setiap kartu produk, subtotal dan tombol bayar melayang di bawah tanpa navigasi keranjang terpisah.
2. **Katalog Bawaan Martabak Purnama**: Preloaded menu lengkap Martabak Manis, Tipis Kering, dan Martabak Asin (Ayam/Sapi varian Biasa, Spesial, Super).
3. **Dashboard Kelola Menu (CRUD)**: Memungkinkan penambahan menu baru, ubah harga, hapus/arsipkan menu secara mandiri.
4. **Laporan Penjualan & Shift**: Laporan omset harian/bulanan, produk terlaris, filter tanggal, ekspor CSV/Excel, serta manajemen kasir buka/tutup shift (modal awal & hitung selisih laci).
5. **Keamanan PIN Owner**: Layar kasir terbuka instan tanpa login ribet, namun modul Laporan dan Kelola Menu diproteksi PIN 4-digit.
6. **PWA & Fleksibilitas Perangkat**: Berjalan responsif di HP (portrait) dan Tablet (landscape split-screen), dapat di-*install* (*Add to Home Screen*).
7. **Siap VPS**: Menggunakan Node.js adapter untuk Astro, berjalan di VPS dengan database terpusat SQLite.

---

## 2. Arsitektur Sistem

```
┌─────────────────────────────────────────────────────────────┐
│ Perangkat Kasir (HP / Tablet - PWA Standalone)              │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │ UI Interaktif (Astro + React Islands + TailwindCSS) │   │
│   │ - Kasir 1-Screen (+/- counter instan)               │   │
│   │ - Quick Modifier Sheet (topping / catatan)          │   │
│   │ - Modal Pembayaran Cepat (Tunai kembalian & QRIS)   │   │
│   │ - Struk Thermal ESC/POS (Bluetooth / Web Print)     │   │
│   │ - Laporan & Kelola Menu (Proteksi PIN 4 Digit)      │   │
│   └──────────────────────────┬──────────────────────────┘   │
│                              │                              │
│   ┌──────────────────────────▼──────────────────────────┐   │
│   │ Database Lokal: IndexedDB (Dexie.js)                │   │
│   │ - Tabel: products, transactions, shifts, settings   │   │
│   │ - 100% Offline-First: Write < 5ms                   │   │
│   └──────────────────────────┬──────────────────────────┘   │
└──────────────────────────────┼──────────────────────────────┘
                               │
            Auto-Sync saat ada │ koneksi internet
            (Background Sync)  │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ Server VPS (Node.js Environment via Astro SSR Hybrid)       │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │ Astro API Routes (/api/sync/push, /api/sync/pull)   │   │
│   └──────────────────────────┬──────────────────────────┘   │
│                              │                              │
│   ┌──────────────────────────▼──────────────────────────┐   │
│   │ Database Pusat VPS: SQLite (better-sqlite3)         │   │
│   │ - Agregasi data penjualan & backup terpusat         │   │
│   └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Desain Antarmuka Pengguna (UI/UX)

### 3.1. Mode Tampilan HP (Portrait)
* **Header Bar**:
  * Judul: "Martabak Purnama" + Cabang Aktif.
  * Indikator Koneksi: Titik Hijau (*Online & Synced*) / Kuning (*Offline / Pending Sync*).
  * Tombol Kasir/Shift & Tombol Kunci PIN (Menu Laporan / Manajemen).
* **Kategori Tab (Pills Horizontal)**:
  * Filter cepat: `Semua`, `Manis`, `Tipis Kering`, `Asin (Ayam)`, `Asin (Sapi)`, `Ekstra/Topping`.
* **Katalog Menu 1-Screen**:
  * Setiap kartu produk: Nama produk, harga dasar.
  * Kontrol `+` / `-` langsung di kartu:
    * Jika `Qty = 0`: Menampilkan tombol `+ Tambah`.
    * Jika `Qty > 0`: Menampilkan kontrol `- [Qty] +` berwarna amber kontras.
    * Tombol catatan/varian: Ikon pensil/opsi kecil untuk memunculkan modal kustomisasi tanpa reload.
* **Sticky Checkout Bar**:
  * Melayang di bagian bawah layar (*fixed bottom*):
  * Menampilkan: **Ringkasan Qty (Total X item)** | **Total Rp YYY.000** | **Tombol [ Bayar ]**.

### 3.2. Mode Tampilan Tablet (Landscape - Split Screen)
* **Sisi Kiri (65%)**: Grid katalog menu lengkap dengan tab kategori.
* **Sisi Kanan (35%)**: Panel struk pesanan aktif:
  * Menampilkan daftar item terpilih secara realtime beserta subtotal.
  * Kasir bisa mengubah Qty atau menghapus item langsung dari panel kanan.
  * Tombol Bayar dan metode pembayaran terpasang statis di bawah panel kanan.

### 3.3. Tema Visual
* **Warna Dasar**: Slate Dark Modern (`#0F172A` / `#1E293B`) untuk mode malam kasir & Crisp Clean Slate (`#F8FAFC`) untuk mode terang.
* **Aksen Martabak**: Golden Amber (`#F59E0B` / `#D97706`) melambangkan adonan martabak matang sempurna.
* **Ergonomi**: Tombol sentuh minimal 48px × 48px, ramah sentuhan kasir yang bergerak cepat (*fat-finger proof*).

---

## 4. Struktur Data & Katalog Bawaan "Martabak Purnama"

Data awal sistem langsung menyertakan menu resmi Martabak Purnama:

### 4.1. Martabak Manis (20 Varian)
* **Kategori Rp 25.000**: Keju, Coklat, Kacang, Keju Coklat, Keju Kacang, Kacang Coklat, Oreo, Milo, Greentea, Tiramisu, Choco Crunchy, Strawberry, Blueberry.
* **Kategori Rp 27.000**: Keju Kacang Coklat, Keju Pisang, Keju Kismis, Keju Jagung.
* **Kategori Rp 40.000**: Double Cheese, Kitkat, Silverqueen.

### 4.2. Tipis Kering (19 Varian)
* **Kategori Rp 12.000**: Keju, Coklat, Kacang, Kacang Coklat, Keju Coklat, Keju Kacang, Oreo, Milo, Greentea, Choco Crunchy, Strawberry, Blueberry, Tiramisu.
* **Kategori Rp 15.000**: Keju Pisang, Keju Kismis, Keju Campur, Kitkat, Double Cheese, Silverqueen.

### 4.3. Martabak Asin / Telur (Multi-Tier Pricing: Biasa / Spesial / Super)
* **Varian Ayam**:
  * Ayam Centil: Biasa (25k), Spesial (30k), Super (35k)
  * Ayam Jamur / Jagung / Meringis / Silongil Seuhah / Sosis: Biasa (27k), Spesial (33k), Super (37k)
  * Ayam Mozarella: Spesial (42k), Super (47k)
  * Ayam Jamur/Jagung/Meringis/Silongil/Sosis Mozarella: Spesial (45k), Super (50k)
* **Varian Sapi**:
  * Sapi Bujangan: Biasa (27k), Spesial (32k), Super (37k)
  * Sapi Jamur / Jagung / Meringis / Silongil Seuhah / Sosis: Biasa (30k), Spesial (35k), Super (40k)
  * Sapi Mozarella: Spesial (45k), Super (50k)
  * Sapi Jamur/Jagung/Meringis/Silayung/Sosis Mozarella: Spesial (47k), Super (53k)

---

## 5. Modul & Fitur Sistem

### 5.1. Alur Transaksi & Pembayaran (Checkout)
1. Kasir memilih menu menggunakan tombol `+` / `-`.
2. Klik tombol **"Bayar"**:
   * Memilih metode: `[ Tunai ]` atau `[ QRIS ]`.
   * **Tunai**: Terdapat tombol nominal instan (`Uang Pas`, `Rp 50.000`, `Rp 100.000`, dll.). Kembalian dihitung otomatis secara *realtime*.
   * **QRIS**: Menampilkan gambar kode QRIS gerai + tombol verifikasi sukses.
3. Transaksi disimpan dalam IndexedDB (status: `pending`).
4. Opsi Cetak Struk:
   * **Thermal Printer**: Kirim perintah ESC/POS via Web Bluetooth API (58mm/80mm) atau Browser Print Dialog.
   * **Struk WhatsApp**: Tombol buka tautan WhatsApp dengan format teks nota rapi ke nomor pembeli.
5. Layar kasir reset kembali ke keadaan siap melayani antrean berikutnya dalam 0 detik.

### 5.2. Dashboard Kelola Menu (CRUD Menu)
* **Hak Akses**: Terproteksi PIN Owner 4-digit.
* **Operasi**:
  * **Tambah Menu**: Input nama, kategori, harga tunggal atau harga berjenjang (Biasa, Spesial, Super).
  * **Edit Menu & Harga**: Perbarui harga item jika bahan baku naik.
  * **Hapus / Arsipkan**: Sembunyikan produk yang sedang tidak dijual.
  * **Toggle Ketersediaan**: Ubah status menjadi "Habis" jika topping tertentu kosong hari ini.

### 5.3. Manajemen Shift Kasir (Cash Drawer)
* **Buka Shift**: Input modal awal di laci (cth: Rp 100.000).
* **Tutup Shift**: Input jumlah uang fisik di laci saat tutup toko. Sistem menghitung:
  * Total Penjualan Tunai vs QRIS.
  * Selisih kas (*Over / Short*).
  * Cetak struk rekap harian untuk arsip setoran kasir.

### 5.4. Laporan Penjualan (Owner Analytics)
* **Ringkasan Finansial**: Total omset, total transaksi, rata-rata transaksi.
* **Filter Waktu**: Hari ini, 7 hari terakhir, bulan ini, rentang kustom.
* **Top 5 Best Seller**: Martabak paling banyak terjual untuk optimasi persediaan bahan.
* **Riwayat Transaksi**: Tabel pencarian transaksi, rincian nota, dan tombol **Reprint Struk**.
* **Ekspor Data**: Download data penjualan ke format `.csv` / Excel.

---

## 6. Skema Data (Database Schema)

### 6.1. IndexedDB (Client) & SQLite (Server)

```sql
-- Tabel Produk
CREATE TABLE products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL, -- 'manis', 'tipis_kering', 'asin_ayam', 'asin_sapi', 'ekstra'
  base_price INTEGER NOT NULL,
  has_variants INTEGER DEFAULT 0, -- 0 = false, 1 = true
  variant_prices TEXT, -- JSON: {"biasa": 25000, "spesial": 30000, "super": 35000}
  is_available INTEGER DEFAULT 1,
  updated_at INTEGER NOT NULL
);

-- Tabel Transaksi
CREATE TABLE transactions (
  id TEXT PRIMARY KEY,
  invoice_no TEXT NOT NULL UNIQUE,
  shift_id TEXT,
  created_at INTEGER NOT NULL,
  items TEXT NOT NULL, -- JSON array of items
  total_amount INTEGER NOT NULL,
  payment_method TEXT NOT NULL, -- 'cash' | 'qris'
  cash_tendered INTEGER,
  change_amount INTEGER,
  customer_phone TEXT,
  sync_status TEXT DEFAULT 'pending', -- 'pending' | 'synced'
  synced_at INTEGER
);

-- Tabel Shift
CREATE TABLE shifts (
  id TEXT PRIMARY KEY,
  cashier_name TEXT NOT NULL,
  start_time INTEGER NOT NULL,
  end_time INTEGER,
  initial_cash INTEGER NOT NULL,
  total_cash_sales INTEGER DEFAULT 0,
  total_qris_sales INTEGER DEFAULT 0,
  actual_cash INTEGER,
  difference INTEGER,
  status TEXT DEFAULT 'open', -- 'open' | 'closed'
  created_at INTEGER NOT NULL
);

-- Tabel Pengaturan Gerai
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
```

---

## 7. Rencana Pengujian & Verifikasi

1. **Pengujian 1-Screen Responsiveness**: Memastikan pertambahan/pengurangan item, update subtotal, dan toggle kategori berjalan mulus tanpa lag di perangkat HP dan tablet.
2. **Pengujian Offline Persistence**: Menguji memutus koneksi internet (Airplane mode), mencatat 3 transaksi berturut-turut, dan memeriksa bahwa data tersimpan aman di IndexedDB.
3. **Pengujian Background Sync**: Mengaktifkan kembali internet dan memverifikasi data transaksi `pending` terkirim dan tersimpan di database SQLite VPS dengan status berubah menjadi `synced`.
4. **Pengujian Cetak Struk**: Format struk 58mm/80mm diuji melalui simulasi browser print dan generator teks struk WhatsApp.
5. **Pengujian Hak Akses PIN**: Memverifikasi menu Laporan dan Pengaturan Menu tidak dapat dibuka tanpa memasukkan PIN 4 digit yang valid.
