# Mulai dari sini

Dokumen lain sudah terlalu banyak. Halaman ini saja yang perlu dibaca dulu.

---

## Situsnya sudah jadi

Situs SHA.KU sudah bisa dilihat. Buka PowerShell, lalu ketik dua baris ini:

```powershell
cd C:\Users\noegr\shaku-web
npm run dev
```

Buka `http://localhost:4321` di browser. Itu situsnya. Tekan `Ctrl+C` di
PowerShell untuk mematikannya.

Yang sudah ada di dalamnya:

- Halaman depan, katalog, halaman tiap produk, cara pesan, dan tentang
- 6 produk **contoh** — nama dan harganya karangan, fotonya bertulisan
  "FOTO CONTOH"
- Tombol pesan yang membuka WhatsApp ke +62 882-0053-59524 dengan pesan
  yang sudah terisi nama produknya

Situs ini masih berjalan **di PC ini saja**. Orang lain belum bisa membukanya.

> **Catatan kecil tapi bikin bingung.** Saat `npm run dev`, panel admin harus
> dibuka di `http://localhost:4321/admin/index.html` — pakai `/admin/` saja
> akan 404. Ini cuma berlaku di mode `dev`. Di `npm run preview` dan di situs
> aslinya nanti, `/admin/` normal.

---

## Tiga hal yang belum beres

Urutannya tidak wajib, tapi ini yang paling masuk akal.

### 1. Ganti foto dan data produk asli

Ini yang paling penting. Tanpa ini situsnya belum ada gunanya.

Yang dibutuhkan per produk: foto, nama, harga, bentuk kuku, panjang, warna,
jumlah kuku per set.

Foto sebaiknya bujur sangkar, minimal 1000×1000 piksel. Format apa pun
(JPG/PNG) — nanti diubah otomatis ke WebP oleh sistemnya, jadi tidak perlu
dikecilkan sendiri.

Cara memasukkannya ada dua, dan **cukup pilih salah satu**:

- **Lewat berkas di PC** — lihat `kelola-produk.md`. Tidak perlu GitHub,
  tidak perlu internet. Ini yang paling cepat kalau Anda memang di depan PC.
- **Lewat panel admin di browser** — perlu langkah nomor 2 di bawah dulu.

### 2. Menyalakan panel admin (opsional)

**Ini opsional.** Situs tetap jalan tanpa ini.

Gunanya cuma satu: supaya bisa menambah dan mengubah produk **dari HP**,
tanpa membuka PC. Kalau Anda tidak keberatan selalu mengedit dari PC,
lewati saja bagian ini.

Harganya: perlu akun GitHub, dan setiap perubahan butuh 2–5 menit sampai
muncul di situs. Caranya di `panel-admin.md`.

**Tidak ada "user admin" yang perlu dibuat.** Tidak ada username dan kata
sandi seperti WordPress, karena situs ini tanpa database. Kunci masuknya
adalah akun GitHub Anda plus sebuah token yang dibuat di GitHub. Penjelasan
lengkapnya di bagian paling atas `panel-admin.md`.

### 3. Menaikkan situs ke CCR2004

Supaya `shaku.id` bisa dibuka orang lain dari internet.

Domainnya sudah Anda beli di Exabytes. Yang belum: menjalankan container di
router, dan mengarahkan DNS. Caranya di `deploy-ccr2004.md`.

Anda sendiri yang minta ini ditunda, jadi belum saya kerjakan.

---

## Kalau bingung, kerjakan ini saja

1. `npm run dev`, buka `http://localhost:4321`, lihat situsnya.
2. Catat apa yang mau diubah — tulisan, warna, susunan, apa pun.
3. Siapkan foto produk asli di satu folder.

Sisanya bisa menyusul, dan tidak ada yang mendesak.

---

## Peta dokumen

| Berkas | Isinya | Kapan dibaca |
| --- | --- | --- |
| `MULAI-DARI-SINI.md` | Halaman ini | Sekarang |
| `kelola-produk.md` | Menambah/mengubah produk lewat berkas | Saat menyiapkan produk asli |
| `panel-admin.md` | Menyalakan panel admin di browser | Kalau mau mengedit dari HP |
| `deploy-ccr2004.md` | Menaikkan situs ke router | Saat siap online |
