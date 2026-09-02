# Mulai dari sini

Dokumen lain sudah terlalu banyak. Halaman ini saja yang perlu dibaca dulu.

---

## Situsnya sudah online

**Buka <https://shaku.id> dari HP mana pun.** Situsnya sudah hidup di
internet sejak 2 September 2026, jalan dari container di CCR2004 sendiri,
dengan sertifikat HTTPS yang sah.

Perubahan yang Anda simpan lewat panel admin sampai ke situs **dengan
sendirinya** dalam sekitar 3–5 menit. Tidak ada yang perlu disalin, tidak
ada yang perlu di-restart.

Kalau ingin mengutak-atik dulu di PC tanpa mempengaruhi situs asli:

```powershell
cd C:\Users\noegr\shaku-web
npm run dev
```

Buka `http://localhost:4321`. Tekan `Ctrl+C` untuk mematikannya. Yang ini
hanya di PC ini, tidak terlihat orang lain.

Yang sudah ada di dalamnya:

- Halaman depan, katalog, halaman tiap produk, cara pesan, dan tentang
- 6 produk **contoh** — nama dan harganya karangan, fotonya bertulisan
  "FOTO CONTOH"
- Tombol pesan yang membuka WhatsApp ke +62 882-0053-59524 dengan pesan
  yang sudah terisi nama produknya

> **Catatan kecil tapi bikin bingung.** Saat `npm run dev`, panel admin harus
> dibuka di `http://localhost:4321/admin/index.html` — pakai `/admin/` saja
> akan 404. Ini cuma berlaku di mode `dev`. Di situs aslinya,
> <https://shaku.id/admin/> normal.

---

## Yang belum beres, dan yang sudah

Tinggal satu hal yang benar-benar penting.

### 1. Ganti foto dan data produk asli

Ini yang paling penting, dan sekarang satu-satunya yang menghalangi situs
ini benar-benar dipakai jualan.

Yang dibutuhkan per produk: foto, nama, harga, bentuk kuku, panjang, warna,
jumlah kuku per set.

Foto sebaiknya bujur sangkar, minimal 1000×1000 piksel. Format apa pun
(JPG/PNG) — nanti diubah otomatis ke WebP oleh sistemnya, jadi tidak perlu
dikecilkan sendiri.

Cara memasukkannya ada dua, dan **cukup pilih salah satu**:

- **Lewat panel admin di HP** — buka <https://shaku.id/admin/>. Ini yang
  paling praktis sekarang, karena panel adminnya sudah menyala.
- **Lewat berkas di PC** — lihat `kelola-produk.md`.

### 2. Akun Instagram dan TikTok (opsional)

Kolom `instagram` dan `tiktok` di `src/konfigurasi.ts` masih kosong.
Selama kosong, tautannya otomatis tidak ditampilkan di footer.

### 3. Panel admin — sudah menyala

Panel admin sudah bisa dipakai di <https://shaku.id/admin/>, dari HP
sekalipun. Masuknya pakai token GitHub, bukan username dan kata sandi.

**Tidak ada "user admin" yang perlu dibuat.** Situs ini tanpa database,
jadi tidak ada tempat menyimpan user. Kunci masuknya adalah akun GitHub
Anda plus token yang dibuat di GitHub. Penjelasan lengkapnya di bagian
paling atas `panel-admin.md`.

Kalau tokennya hilang atau kedaluwarsa, buat baru dengan cara yang sama —
tidak ada yang rusak.

### 4. Situs sudah online — tidak ada yang perlu dikerjakan lagi

`shaku.id` sudah dilayani dari container di CCR2004, DNS sudah menunjuk ke
IP publik router, dan sertifikat HTTPS-nya terbit otomatis. Container-nya
disetel `start-on-boot`, jadi ikut hidup lagi sendiri setelah router mati
listrik atau di-reboot.

Catatan yang perlu diterima apa adanya: kalau router mati, uplink putus,
atau listrik padam, situsnya ikut mati. Itu konsekuensi hosting sendiri,
bukan kesalahan konfigurasi.

Rinciannya di `deploy-ccr2004.md`.

---

## Kalau bingung, kerjakan ini saja

1. Buka <https://shaku.id> dari HP, lihat situsnya.
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
