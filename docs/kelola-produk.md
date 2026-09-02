# Mengelola katalog produk

Ada dua cara menambah dan mengubah produk:

1. **Lewat panel admin di browser** — bisa dari HP, tanpa membuka laptop.
   Ini cara yang biasa dipakai. Panduannya di [`panel-admin.md`](panel-admin.md).
2. **Langsung mengedit berkas** — dijelaskan di dokumen ini. Berguna saat
   mengubah banyak produk sekaligus, atau saat panel sedang tidak bisa dipakai.

Satu produk = satu berkas Markdown. Tidak ada basis data.

## Menambah produk baru

1. Siapkan foto produk. Taruh di `src/assets/produk/` dengan nama tanpa spasi,
   misalnya `mocha-almond.jpg`. Ukuran ideal potret, sekitar 1000×1250 piksel.

2. Buat berkas baru di `src/data/produk/`, misalnya `mocha-latte.md`.
   Nama berkas menjadi alamat halamannya: `shaku.id/katalog/mocha-latte/`.

3. Isi berkas seperti ini:

```markdown
---
nama: "Mocha Latte"
harga: 85000
hargaCoret: 100000      # hapus baris ini kalau tidak sedang diskon
bentuk: "almond"        # almond | coffin | square | stiletto | oval | round
panjang: "sedang"       # pendek | sedang | panjang
warna: ["cokelat", "nude"]
jumlahKuku: 24
foto:
  - "@assets/produk/mocha-almond.jpg"
tersedia: true
unggulan: false         # true = ikut tampil di beranda
urutan: 70              # angka kecil tampil lebih dulu
ringkasan: "Cokelat susu lembut, maksimal 160 karakter."
---

Tulis deskripsi panjang di sini. Boleh beberapa paragraf,
boleh pakai **tebal** dan daftar berpoin.
```

4. Bangun ulang dan unggah:

```powershell
npm run build
```

Lalu salin isi `dist/` ke `usb1/situs/web/shaku/` di router.

## Mengubah harga atau menandai stok habis

Buka berkas produknya, ubah `harga`, atau ganti `tersedia: true` menjadi
`tersedia: false`. Produk yang habis tetap tampil di katalog tapi diberi
label "STOK HABIS", dan tombolnya berubah jadi "Kabari saat restok".

## Mengganti nomor WhatsApp dan identitas

Semua ada di satu berkas: `src/konfigurasi.ts`.
Termasuk nomor WhatsApp, nama merek, alamat domain, dan akun sosial media.

## Bila kelak perlu basis data

Panel admin yang terpasang sekarang menyimpan produk sebagai berkas Markdown
di GitHub, bukan di basis data. Untuk toko dengan puluhan sampai ratusan
produk, itu sudah cukup dan justru lebih ringan — tidak ada proses yang harus
hidup terus di router.

Kalau suatu saat memang butuh basis data (misalnya stok terhubung ke kasir,
atau pesanan online), struktur sekarang sengaja dibuat supaya perpindahannya
tidak merombak tampilan. Yang perlu diubah hanya dua titik:

1. `src/content.config.ts` — ganti `loader: glob(...)` dengan loader yang
   membaca dari API atau basis data. Skema Zod di bawahnya dipakai ulang
   sebagai validasi, tidak perlu diubah.

2. Halaman yang memanggil `getCollection('produk')` tetap bekerja tanpa
   perubahan, karena bentuk datanya sama.

Komponen tampilan (`KartuProduk.astro`, halaman katalog, halaman detail)
tidak perlu disentuh sama sekali.

Yang perlu dipikirkan saat itu tiba: basis data berarti ada proses yang harus
hidup terus dan menyimpan data — beban di container router jadi lebih berat
daripada sekadar menyajikan berkas statis, dan datanya perlu dicadangkan
sendiri. Sekarang cadangannya otomatis, karena semuanya ada di GitHub.
