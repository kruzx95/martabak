# Panduan Deployment Martabak Purnama POS ke VPS

Aplikasi kasir ini dirancang berbasis **Astro.build** dalam mode SSR Standalone yang sangat ringan dan siap dijalankan di VPS Ubuntu/Debian/CentOS dengan Node.js.

---

## 1. Persyaratan Server VPS
- **OS**: Ubuntu 22.04 / 24.04 LTS (atau Debian 11/12)
- **Spesifikasi Minimal**: 1 vCPU, 1 GB RAM, 10 GB Disk
- **Software**: Node.js v20+, NPM, PM2, dan Nginx

---

## 2. Instalasi Node.js & PM2 di VPS

```bash
# Update repository
sudo apt update && sudo apt upgrade -y

# Install Node.js 22 LTS
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs git

# Verifikasi versi
node -v
npm -v

# Install PM2 secara global
sudo npm install -g pm2
```

---

## 3. Clone & Build Aplikasi

```bash
# Masuk ke direktori web
cd /var/www

# Clone repository atau upload source code
git clone <URL_REPO_ANDA> martabak-pos
cd martabak-pos

# Install dependensi
npm install

# Build aplikasi untuk production
npm run build
```

---

## 4. Jalankan Aplikasi dengan PM2

```bash
# Jalankan menggunakan file konfigurasi PM2 bawaan
pm2 start deploy/ecosystem.config.cjs

# Simpan proses agar otomatis jalan saat VPS reboot
pm2 save
pm2 startup
```

Periksa status:
```bash
pm2 status
pm2 logs martabak-pos
```
Aplikasi sekarang berjalan di `http://127.0.0.1:4321`.

---

## 5. Konfigurasi Nginx Reverse Proxy & SSL (Domain)

Buat file konfigurasi Nginx:
```bash
sudo nano /etc/nginx/sites-available/pos.domainanda.com
```

Isi konfigurasi berikut:
```nginx
server {
    server_name pos.domainanda.com;

    location / {
        proxy_pass http://127.0.0.1:4321;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Aktifkan konfigurasi dan restart Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/pos.domainanda.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

Pasang SSL gratis dari Let's Encrypt:
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d pos.domainanda.com
```

---

## 6. Cara Menggunakan di Tablet / HP Kasir
1. Buka browser (Chrome di Android atau Safari di iOS) ke alamat: `https://pos.domainanda.com`.
2. Klik tombol menu browser -> **"Tambahkan ke Layar Utama" (Add to Home Screen)**.
3. Aplikasi akan terinstal sebagai aplikasi mandiri (PWA) berlayar penuh tanpa bilah browser.
4. Aplikasi siap digunakan secara **offline maupun online**.

