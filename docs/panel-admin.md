# Panel admin — mengelola produk lewat browser

Panel ini membuat penambahan dan pengubahan produk bisa dilakukan dari HP,
tanpa membuka laptop dan tanpa menyentuh berkas apa pun.

Alamatnya: **https://shaku.id/admin/**

## "Di mana saya membuat user admin?"

Tidak ada. Panel ini tidak punya sistem pengguna sendiri — tidak ada
username, tidak ada kata sandi, tidak ada halaman "tambah user".

Di WordPress, user dan kata sandi disimpan di database situs. Situs ini tidak
punya database sama sekali, jadi tidak ada tempat menyimpannya.

**Yang berperan sebagai user admin adalah akun GitHub Anda.** Yang dibuat
bukan user, melainkan **token** — dibuat di GitHub, lalu ditempel di halaman
`/admin/` sebagai ganti username dan kata sandi. Langkahnya ada di bagian
persiapan nomor 5 di bawah.

**Kalau ingin memberi akses ke orang lain** (misalnya yang mengurus toko):
jangan membuatkan user. Undang akun GitHub orang itu sebagai **collaborator**
di repo `shaku-web` lewat Settings → Collaborators. Dia lalu membuat tokennya
sendiri. Aksesnya bisa dicabut kapan saja dari halaman yang sama, dan
tokennya langsung tidak berlaku.

## Cara kerjanya

```
Panel admin  ->  commit ke GitHub  ->  GitHub Actions build  ->  branch "terbit"
                                                                      |
                                        Caddy melayani  <-  container penarik
```

Panel admin bukan aplikasi server. Ia berjalan sepenuhnya di browser dan
menyimpan perubahan langsung sebagai commit ke repo GitHub. Tidak ada basis
data, tidak ada PHP, tidak ada panel yang bisa dibobol — karena tidak ada apa
pun di server selain berkas situs yang sudah jadi.

Konsekuensinya yang perlu diketahui sejak awal: **perubahan tidak muncul
seketika.** Setelah tombol simpan ditekan, GitHub perlu membangun ulang situs
(sekitar satu sampai dua menit), lalu container di router menariknya pada
pemeriksaan berikutnya (bawaan setiap tiga menit). Jadi hitungan wajarnya
dua sampai lima menit.

---

## Persiapan — sekali saja

> **Jalan pintas.** Langkah 2 dan 3 di bawah bisa dikerjakan sekaligus oleh
> skrip. Setelah repo di GitHub dibuat (langkah 1), jalankan dari folder
> proyek:
>
> ```powershell
> .\scripts\siapkan-github.ps1
> ```
>
> Skrip itu menanyakan nama akun GitHub, menyetel identitas commit, mengisi
> nama repo di `public/admin/config.yml` dan `deploy/tarik-situs.sh`, membuat
> commit, lalu mengirimkannya. Aman dijalankan berulang kali — bagian yang
> sudah beres dilewati. Langkah 1, 4, dan 5 tetap perlu dikerjakan sendiri
> karena butuh akun Anda.

### 1. Buat repo di GitHub

Buat repo baru bernama `shaku-web`. Jangan centang opsi apa pun (tanpa
README, tanpa .gitignore, tanpa lisensi) supaya tidak bentrok.

**Publik atau privat?** Keduanya bisa. Bedanya hanya di sisi router:

| | Repo publik | Repo privat |
| --- | --- | --- |
| Container penarik | Tanpa token | Butuh token di URL |
| Yang bisa dilihat orang | Kode dan foto produk | Tidak ada |

Isi repo ini adalah kode situs dan foto produk — keduanya toh akan tampil di
situs publik. Tidak ada kata sandi atau data pelanggan di dalamnya. Repo
publik lebih sederhana; repo privat lebih tertutup tapi menambah satu token
yang harus dijaga.

### 2. Kirim kode ke GitHub

Dari folder proyek di PC:

```powershell
git add -A
git commit -m "Situs SHA.KU versi pertama"
git branch -M main
git remote add origin https://github.com/NAMA-AKUN/shaku-web.git
git push -u origin main
```

Ganti `NAMA-AKUN` dengan nama akun GitHub Anda.

### 3. Isi nama repo di konfigurasi panel

Buka `public/admin/config.yml`, cari baris:

```yaml
  repo: GANTI-AKUN-GITHUB/shaku-web
```

Ganti menjadi nama akun Anda, misalnya `budi-nailart/shaku-web`. Simpan,
lalu kirim lagi:

```powershell
git add -A
git commit -m "Isi nama repo di panel admin"
git push
```

Selama baris ini belum diganti, panel admin akan menampilkan peringatan
dalam bahasa Indonesia, bukan error yang membingungkan.

### 4. Pastikan GitHub Actions berjalan

Setelah push pertama, buka tab **Actions** di halaman repo. Alur bernama
"Bangun dan terbitkan situs" akan berjalan sendiri. Bila berhasil, muncul
branch baru bernama **`terbit`** yang isinya berkas situs siap pakai.

Bila tab Actions menolak berjalan, aktifkan di
**Settings → Actions → General → Allow all actions**.

### 5. Buat token untuk masuk ke panel

Panel ini sengaja memakai token, bukan tombol "Login with GitHub". Alasannya
lugas: tombol login membutuhkan server perantara yang harus disewa dan
dirawat, sedangkan token tidak membutuhkan apa pun.

Buka https://github.com/settings/personal-access-tokens/new dan isi:

- **Token name**: `Panel SHA.KU`
- **Expiration**: pilih sesuai selera. Kalau habis masa berlakunya, panel
  akan minta token baru — situs tetap jalan, hanya panelnya yang perlu
  token baru.
- **Repository access**: pilih **Only select repositories**, lalu pilih
  `shaku-web` saja
- **Permissions → Repository permissions → Contents**: ubah ke
  **Read and write**

Klik Generate. **Salin tokennya sekarang juga** — GitHub tidak akan
menampilkannya lagi.

Token itu memberi izin menulis ke satu repo ini saja. Ia tidak bisa dipakai
untuk hal lain di akun Anda.

---

## Pemakaian sehari-hari

1. Buka **https://shaku.id/admin/** di HP atau komputer
2. Tekan **Sign In Using Access Token**, tempel token, masuk
3. Pilih **Produk**

Menambah produk baru: tekan tombol tambah, isi kolomnya, unggah foto
langsung dari galeri HP, lalu simpan.

Mengubah produk: pilih dari daftar, ubah, simpan.

Menandai stok habis: matikan sakelar **Stok tersedia**. Produk tetap tampil
di katalog tapi tombolnya berubah jadi permintaan restok — lebih baik
daripada menghapusnya, karena halaman yang sudah terlanjur dibagikan tidak
jadi mati.

### Kolom yang perlu diperhatikan

| Kolom | Catatan |
| --- | --- |
| Nama produk | Menentukan alamat halaman. Sebaiknya jangan diubah setelah dibagikan ke pelanggan, karena tautan lama akan mati. |
| Ringkasan singkat | Maksimal 160 huruf. Panel menolak bila lebih. |
| Foto produk | Boleh lebih dari satu. Yang pertama jadi gambar utama di katalog. |
| Harga coret | Kosongkan bila tidak sedang diskon. |
| Urutan tampil | Angka lebih kecil tampil lebih dulu. |

Foto tidak perlu dikecilkan dulu. Astro yang mengecilkan dan mengubahnya ke
WebP saat build, dalam beberapa ukuran sekaligus. Foto dari kamera HP
langsung boleh.

---

## Sisi router: container penarik

Container ini yang membuat perubahan sampai ke situs tanpa Anda sentuh.
Ia hanya menghubungi GitHub ke arah keluar — **tidak ada port baru yang
perlu dibuka dari internet.**

### 1. Taruh skrip di USB

Salin `deploy/tarik-situs.sh` ke `usb1/situs/kerja/tarik-situs.sh`.

Bila repo Anda privat, buka berkas itu dan ganti baris `REPO_URL` menjadi
bentuk yang memakai token:

```sh
REPO_URL="${REPO_URL:-https://x-access-token:TOKEN_ANDA@github.com/NAMA-AKUN/shaku-web.git}"
```

Bila repo publik, cukup ganti `GANTI-AKUN-GITHUB` dengan nama akun Anda.

### 2. Tambahkan container

```routeros
/container/mounts/add name=tarik-web src=/usb1/situs/web dst=/srv
/container/mounts/add name=tarik-kerja src=/usb1/situs/kerja dst=/kerja

/container/add \
  remote-image=alpine/git:latest \
  interface=veth-situs \
  root-dir=/usb1/situs/root-tarik \
  mounts=tarik-web,tarik-kerja \
  entrypoint="/bin/sh" \
  cmd="/kerja/tarik-situs.sh" \
  start-on-boot=yes \
  logging=yes \
  comment="Penarik situs dari GitHub"
```

Image `alpine/git` tersedia untuk arm64, jadi cocok untuk CCR2004.

Container ini memakai veth dan bridge yang sama dengan Caddy. Ia perlu bisa
keluar ke internet — aturan `masquerade` yang sudah dipasang untuk Caddy
sudah cukup.

### 3. Jalankan dan lihat lognya

```routeros
/container/print
/container/start [nomor container penarik]
/log/print where topics~"container"
```

Bila berhasil, di log muncul baris `Situs diperbarui ke <kode commit>`.

### Mengubah jeda pemeriksaan

Bawaannya tiga menit. Untuk mengubahnya, tambahkan variabel lingkungan:

```routeros
/container/envs/add name=penarik key=JEDA value=60
```

lalu tambahkan `envlist=penarik` pada container. Jangan terlalu pendek —
GitHub membatasi jumlah permintaan per jam.

---

## Kalau ada masalah

**`/admin/` 404 saat mencoba di komputer sendiri**
Hanya terjadi di `npm run dev`. Server pengembangan tidak meneruskan folder
ke berkas indeksnya, jadi pakai `http://localhost:4321/admin/index.html`.
Di `npm run preview` dan di situs asli, `/admin/` sudah normal.

**Panel menampilkan "Panel admin belum disetel"**
Baris `repo:` di `public/admin/config.yml` belum diganti. Ganti, commit,
push, tunggu build selesai.

**Panel menolak token**
Periksa izin token: harus **Contents: Read and write** pada repo yang benar.
Token yang sudah kedaluwarsa juga ditolak — buat yang baru.

**Perubahan tersimpan tapi situs belum berubah**
Urutannya: cek tab Actions di GitHub apakah build berhasil; cek apakah
branch `terbit` ikut diperbarui; cek log container penarik di router. Salah
satu dari tiga itu yang berhenti.

**Build gagal setelah menambah produk**
Biasanya karena kolom yang tidak lolos pemeriksaan. Pesan errornya tampil di
tab Actions. Situs lama tetap dilayani — container penarik tidak akan
memasang hasil build yang gagal, karena branch `terbit` tidak ikut berubah.

**Tombol "Work with Local Repository"**
Itu untuk mengedit langsung folder di komputer tanpa lewat GitHub, dan hanya
jalan di Chrome atau Edge di komputer. Tidak berfungsi di HP. Untuk
pemakaian dari HP, selalu pakai token.

---

## Catatan keamanan yang jujur

Alamat `/admin/` bisa dibuka siapa saja, dan itu tidak masalah: halamannya
statis dan tidak menyimpan apa pun. Tanpa token yang punya izin tulis ke
repo, tidak ada yang bisa dilakukan di sana. Yang harus dijaga adalah
tokennya, bukan alamatnya.

Halaman ini juga sudah dikecualikan dari `robots.txt` dan diberi tanda
`noindex`, jadi tidak muncul di hasil pencarian.
