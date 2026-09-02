# Deploy shaku.id ke container CCR2004

Dokumen ini mencatat cara menaruh situs statis `shaku.id` di container RouterOS v7
pada CCR2004, memakai image Caddy resmi dan folder situs yang di-mount dari USB.

## Kenapa tidak membangun image sendiri

Situs ini hasil akhirnya berupa berkas statis. Membungkusnya jadi image container
berarti: harus punya Docker, harus build khusus arm64, dan setiap kali ganti harga
atau tambah produk harus build + unggah image baru.

Dengan cara mount, image yang dipakai adalah `caddy:alpine` resmi yang sudah
tersedia untuk arm64. Memperbarui situs cukup menyalin ulang isi folder `dist/`
ke USB — container tidak perlu dibongkar, bahkan tidak perlu di-restart.

Kalau suatu saat memang ingin image mandiri, itu bisa ditambahkan belakangan
tanpa mengubah struktur proyek.

## Prasyarat

- Mode container aktif di RouterOS (`/system/device-mode/print` → `container: yes`)
- USB terpasang dan terbaca (`/disk/print`, biasanya bernama `usb1`)
- IP publik statis, port 80 dan 443 tidak diblokir dari sisi upstream
- DNS `shaku.id` sudah menunjuk ke IP publik itu

## 1. Bangun situs di PC

```powershell
npm install
npm run build
```

Hasilnya ada di folder `dist/`. Semua yang dibutuhkan server ada di situ.

## 2. Siapkan struktur folder di USB

Lewat WinBox → Files, atau lewat SFTP, buat susunan berikut di USB:

```
usb1/
  situs/
    web/
      shaku/      <- isi folder dist/ disalin ke sini
    etc/          <- taruh Caddyfile di sini
    data/         <- sertifikat & log Caddy (biarkan kosong)
      log/        <- log akses per situs
    kerja/        <- skrip & salinan repo milik container penarik
    root/         <- root filesystem container (biarkan kosong)
```

Salin isi `dist/` ke `usb1/situs/web/shaku/`, dan salin `deploy/Caddyfile`
ke `usb1/situs/etc/Caddyfile`.

> Yang disalin adalah **isi** folder `dist`, bukan folder `dist`-nya.
> Setelah benar, `usb1/situs/web/shaku/index.html` harus ada.

Kenapa ada satu lapis folder `shaku` di dalam `web`? Supaya satu container
ini bisa melayani beberapa situs sekaligus dengan satu IP publik. Situs kedua
nanti tinggal jadi `usb1/situs/web/<nama-situs-kedua>/`. Penjelasannya ada
di bagian 9.

## 3. Jaringan container

Nama interface WAN di bawah (`ether1`) harus disesuaikan dengan yang dipakai
di router ini.

```routeros
# Jaringan terpisah untuk container
/interface/bridge/add name=bridge-container
/ip/address/add address=172.20.0.1/24 interface=bridge-container

/interface/veth/add name=veth-situs address=172.20.0.2/24 gateway=172.20.0.1
/interface/bridge/port/add bridge=bridge-container interface=veth-situs

# Agar container bisa keluar ke internet (dibutuhkan untuk ambil sertifikat)
/ip/firewall/nat/add chain=srcnat action=masquerade src-address=172.20.0.0/24
```

## 4. Mount dan container

```routeros
/container/mounts/add name=situs-web src=/usb1/situs/web dst=/srv
/container/mounts/add name=situs-etc src=/usb1/situs/etc dst=/etc/caddy
/container/mounts/add name=situs-data src=/usb1/situs/data dst=/data

/container/config/set registry-url=https://registry-1.docker.io tmpdir=/usb1/pull

/container/add \
  remote-image=caddy:alpine \
  interface=veth-situs \
  root-dir=/usb1/situs/root \
  mounts=situs-web,situs-etc,situs-data \
  start-on-boot=yes \
  logging=yes \
  comment="Web server semua situs"
```

Tunggu status berubah dari `extracting` ke `stopped`, lalu jalankan:

```routeros
/container/print
/container/start 0
```

Sesuaikan angka `0` dengan nomor container yang benar.

## 5. Teruskan port dari internet

```routeros
/ip/firewall/nat/add chain=dstnat in-interface=ether1 protocol=tcp \
  dst-port=80 action=dst-nat to-addresses=172.20.0.2 to-ports=80 \
  comment="Web HTTP semua situs"

/ip/firewall/nat/add chain=dstnat in-interface=ether1 protocol=tcp \
  dst-port=443 action=dst-nat to-addresses=172.20.0.2 to-ports=443 \
  comment="Web HTTPS semua situs"
```

Satu pasang aturan ini cukup untuk berapa pun jumlah situs. Pemisahan antar
situs terjadi di dalam Caddy, bukan di NAT.

Port 80 wajib terbuka, bukan cuma 443 — Let's Encrypt memverifikasi lewat port 80.
Kalau ada aturan filter di chain `forward`, pastikan trafik ke `172.20.0.2` diizinkan.

## 6. DNS di Exabytes

Di panel pengelolaan domain `shaku.id`:

| Tipe | Nama  | Nilai              |
| ---- | ----- | ------------------ |
| A    | `@`   | IP publik CCR2004  |
| A    | `www` | IP publik CCR2004  |

Tunggu propagasi. Selama DNS belum menunjuk dengan benar, Caddy akan gagal
mengambil sertifikat dan situs hanya bisa dibuka lewat HTTP dari dalam jaringan.

## 7. Verifikasi

Cek dari **luar** jaringan (pakai data seluler, jangan dari dalam jaringan sendiri —
sebagian NAT tidak bisa hairpin):

- `https://shaku.id` terbuka dan gembok sertifikat valid
- `http://shaku.id` otomatis dialihkan ke HTTPS
- `https://www.shaku.id` dialihkan ke `https://shaku.id`
- Tombol WhatsApp membuka chat dengan nomor yang benar
- Reboot router, tunggu, lalu pastikan situs hidup lagi sendiri

Untuk melihat log container bila ada masalah:

```routeros
/log/print where topics~"container"
/container/shell 0
```

## 8. Memperbarui situs

Ada dua cara, dan sebaiknya pilih salah satu saja.

### Cara otomatis (dianjurkan)

Pasang container penarik seperti dijelaskan di
[`panel-admin.md`](panel-admin.md). Setelah itu setiap perubahan — baik dari
panel admin di HP maupun dari PC — sampai ke situs dengan sendirinya dalam
beberapa menit. Bagian di bawah ini tidak perlu dikerjakan lagi.

### Cara manual

```powershell
npm run build
```

Lalu salin ulang isi `dist/` ke `usb1/situs/web/shaku/` menimpa yang lama. Selesai —
Caddy membaca berkas langsung dari folder itu, tidak perlu restart container.

Kalau `deploy/Caddyfile` yang diubah, salin ke `usb1/situs/etc/` lalu:

```routeros
/container/stop 0
/container/start 0
```

## 9. Menambah situs kedua di IP publik yang sama

Tidak perlu container baru, veth baru, atau dst-nat baru. Yang membedakan
situs adalah nama domain di header `Host` (untuk HTTP) dan di SNI (untuk
HTTPS) — keduanya sudah dibaca Caddy, dan keduanya tetap terbaca meskipun
IP tujuannya sama.

Langkahnya tiga:

1. Buat folder situsnya: `usb1/situs/web/tokokedua/`, isi dengan berkas
   situs kedua (`index.html` dan seterusnya).

2. Tambahkan blok ini di `deploy/Caddyfile`, **di atas** blok `:80` yang
   paling bawah:

   ```caddyfile
   tokokedua.com {
   	import situs_statis tokokedua
   }

   www.tokokedua.com {
   	redir https://tokokedua.com{uri} permanent
   }
   ```

   Nama sesudah `import situs_statis` harus sama persis dengan nama folder
   di langkah 1.

3. Arahkan A record `@` dan `www` domain kedua ke IP publik yang sama,
   salin Caddyfile ke `usb1/situs/etc/`, lalu restart container.

Caddy mengambil sertifikat untuk domain baru itu sendiri, asal DNS-nya sudah
menunjuk dengan benar dan port 80 terbuka.

Kalau situs kedua bukan berkas statis melainkan aplikasi yang punya port
sendiri (misalnya container lain di `172.20.0.3:3000`), ganti isi bloknya
jadi `reverse_proxy 172.20.0.3:3000`. Contohnya sudah ditulis dalam bentuk
komentar di `deploy/Caddyfile`.

### Yang sudah diuji

Pola di atas dijalankan dengan binary Caddy sungguhan sebelum ditulis di sini.
Hasilnya: dua domain di satu instance melayani isi yang benar masing-masing,
halaman 404 tidak tertukar, `http://` keduanya dialihkan 308 ke HTTPS, dan
akses lewat IP telanjang tanpa nama domain dijawab 404 tanpa membocorkan situs
mana pun.

## Catatan jujur soal risiko

- Situs ikut mati bila router restart, listrik padam, atau uplink putus.
  Ini konsekuensi self-hosting, bukan kesalahan konfigurasi.
- Trafik gambar situs ini melewati uplink yang sama dengan pelanggan PPPoE.
  Kalau nanti trafiknya besar, ini perlu ditinjau ulang.
- Sertifikat Let's Encrypt berlaku 90 hari dan diperbarui otomatis oleh Caddy,
  tapi hanya bila port 80 tetap terbuka. Jangan tutup port 80 setelah situs jalan.
