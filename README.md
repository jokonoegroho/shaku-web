# SHA.KU — shaku.id

Situs katalog press-on nail **SHA.KU** (By.Gorgeousblom.nailart).
Situs statis, pemesanan lewat WhatsApp, di-hosting sendiri di container
RouterOS pada CCR2004.

> **Baru di sini atau lupa sudah sampai mana?**
> Baca [docs/MULAI-DARI-SINI.md](docs/MULAI-DARI-SINI.md) — satu halaman,
> berisi apa yang sudah jadi dan apa yang belum.

## Menjalankan di komputer

```powershell
npm install
npm run dev       # buka http://localhost:4321
npm run build     # hasil siap unggah ada di dist/
npm run preview   # menguji hasil build
```

Panel admin dibuka di http://localhost:4321/admin/index.html saat `npm run dev`
berjalan — di mode `dev`, `/admin/` tanpa `index.html` akan 404 karena server
pengembangan tidak meneruskan folder ke berkas indeksnya. Di `npm run preview`
dan di situs aslinya, `/admin/` normal. Bundle panelnya disalin otomatis dari
`node_modules` sebelum `dev` dan `build`, jadi tidak perlu langkah tambahan.

## Struktur

```
src/
  konfigurasi.ts        Nomor WhatsApp, nama merek, domain — semua di sini
  content.config.ts     Skema data produk
  data/produk/          Satu berkas Markdown per produk
  assets/produk/        Foto produk
  assets/logo-shaku.png Logo merek
  components/           Header, footer, kartu produk, tombol WhatsApp
  layouts/Layout.astro  Kerangka halaman + meta tag
  pages/                Beranda, katalog, detail produk, cara pesan, tentang
public/admin/           Panel admin (Sveltia CMS) — tampil di /admin/
.github/workflows/      Build otomatis di GitHub, hasilnya ke branch "terbit"
deploy/Caddyfile        Konfigurasi web server di container
deploy/tarik-situs.sh   Skrip container penarik di CCR2004
docs/                   Cara deploy, kelola produk, dan pakai panel admin
scripts/                Pembuat favicon, gambar pratinjau, foto contoh,
                        dan penyiap repo GitHub (siapkan-github.ps1)
```

## Dokumentasi

- [**Mulai dari sini**](docs/MULAI-DARI-SINI.md) — status proyek dan langkah berikutnya
- [Mengelola katalog produk lewat berkas](docs/kelola-produk.md)
- [Mengelola produk lewat panel admin](docs/panel-admin.md)
- [Cara deploy ke CCR2004](docs/deploy-ccr2004.md)

## Yang masih perlu diisi

- **Foto produk** masih placeholder bertulisan "FOTO CONTOH", dibuat oleh
  `scripts/buat-foto-contoh.mjs`. Ganti dengan foto asli, lalu hapus skrip itu.
- **Data produk** (nama, harga, ketersediaan) masih contoh, bukan produk asli.
- **Nama repo GitHub** di `public/admin/config.yml` masih `GANTI-AKUN-GITHUB`.
  Panel admin belum bisa dipakai sebelum ini diganti. Jalan pintasnya:
  buat repo `shaku-web` di GitHub, lalu jalankan `.\scripts\siapkan-github.ps1`.
- **Akun Instagram/TikTok** di `src/konfigurasi.ts` masih kosong; kolomnya
  otomatis tidak tampil selama masih kosong.
