# Deploy shaku.id ke container CCR2004

Dokumen ini mencatat cara menaruh situs statis `shaku.id` di container RouterOS v7
pada CCR2004, memakai image Caddy resmi dan folder situs yang di-mount dari USB.

> **Sudah dijalankan sungguhan.** Situs sudah hidup di `https://shaku.id`
> sejak 2 September 2026, lengkap dengan sertifikat Let's Encrypt dan
> pembaruan otomatis dari GitHub. Perintah-perintah di bawah adalah yang
> benar-benar dipakai, bukan perkiraan. Ringkasan hasilnya ada di bagian
> "Hasil deploy sungguhan" di akhir dokumen.


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

- Mode container aktif di RouterOS (`/system/device-mode/print` → `container: yes`).
  Di CCR2004 PROGONET ini **sudah aktif** sejak sebelum proyek ini, jadi tidak
  perlu menekan tombol reset atau mematikan router.
- USB terpasang dan terbaca (`/disk/print`, biasanya bernama `usb1`)
- IP publik statis, port 80 dan 443 tidak diblokir dari sisi upstream
- DNS `shaku.id` sudah menunjuk ke IP publik itu
- Cadangkan konfigurasi lebih dulu, dan tarik salinannya ke PC:

  ```routeros
  /export file=cadangan-sebelum-web
  ```

  ```powershell
  scp -P <port-ssh> -i <kunci> admin@<ip>:cadangan-sebelum-web.rsc .
  ```


## 1. Bangun situs di PC

```powershell
npm install
npm run build
```

Hasilnya ada di folder `dist/`. Semua yang dibutuhkan server ada di situ.

## 2. Siapkan struktur folder di USB

Lewat WinBox → Files, atau lewat SFTP, buat susunan berikut di USB:

> **Jebakan SFTP RouterOS.** Server SFTP RouterOS **tidak bisa membuat
> folder**. `scp -r` akan gagal dengan `path canonicalization failed`.
> Folder harus dibuat lebih dulu satu per satu dengan
> `/file/add name=<jalur> type=directory`, baru berkasnya disalin.
> Selain itu, `scp` yang mengirim **satu** berkas ke tujuan berakhiran `/`
> juga ditolak — sebut nama berkas tujuannya secara lengkap.


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

> **Ini yang benar-benar dipakai di CCR2004 PROGONET pada 2 September 2026.**
> Router itu **sudah punya** bridge container bernama `internal`
> (`172.18.0.1/24`, komentar "app network") dengan enam container lain di
> dalamnya. Jadi tidak ada bridge baru yang dibuat — cukup menumpang.
> Alamat bebas berikutnya waktu itu `172.18.0.7`.
> WAN-nya `ether16-LDP` dengan IP publik `124.40.251.234/29`.
>
> Kalau nanti dipakai di router lain, periksa dulu
> `/interface/bridge/print` dan `/interface/veth/print` sebelum menyalin
> perintah di bawah.

```routeros
# Menumpang bridge container yang sudah ada
/interface/veth/add name=veth-situs address=172.18.0.7/24 gateway=172.18.0.1 \
  comment="Situs statis - Caddy"
/interface/bridge/port/add bridge=internal interface=veth-situs \
  comment="Situs statis - Caddy"
```

Masquerade untuk `172.18.0.0/24` sudah ada di router ini, jadi tidak
ditambah lagi. Di router yang masih kosong, aturan itu perlu dibuat:

```routeros
/ip/firewall/nat/add chain=srcnat action=masquerade src-address=172.18.0.0/24
```

Veth akan berbendera `I` (inactive) sampai ada container yang memakainya.
Itu normal.

## 4. Mount dan container

> **Menu `/container/mounts` sudah usang di RouterOS 7.21.5.** Menambah
> lewat menu itu ditolak dengan `expected end of command`. Mount sekarang
> ditulis langsung di `/container/add` lewat parameter `mount=`, dengan
> bentuk `sumber:tujuan:mode`, dipisah koma.

```routeros
/container/config/set registry-url=https://registry-1.docker.io \
  tmpdir=/usb1/apps/pull layer-dir=/usb1/apps/layers

/container/add \
  name=situs-web \
  remote-image=caddy:alpine \
  interface=veth-situs \
  root-dir=/usb1/situs/root \
  layer-dir=/usb1/apps/layers \
  mount=/usb1/situs/web:/srv:ro,/usb1/situs/etc:/etc/caddy:ro,/usb1/situs/data:/data:rw \
  hostname=situs-web \
  workdir=/srv \
  logging=yes \
  start-on-boot=yes \
  auto-restart-interval=1m \
  memory-high=256.0MiB \
  comment="Situs statis - Caddy (shaku.id)"
```

Folder situs dan folder Caddyfile sengaja `ro` — Caddy hanya membacanya.
Yang `rw` hanya `/data`, tempat Caddy menyimpan sertifikat dan log.

Tunggu bendera berubah dari `E` (downloading/extracting) ke `S` (stopped),
lalu jalankan:

```routeros
/container/print
/container/start [find where name="situs-web"]
/log/print where topics~"container"
```

## 5. Teruskan port dari internet

```routeros
/ip/firewall/nat/add chain=dstnat action=dst-nat to-addresses=172.18.0.7 \
  protocol=tcp dst-address=124.40.251.234 port=80 comment="SITUS_WEB_HTTP"

/ip/firewall/nat/add chain=dstnat action=dst-nat to-addresses=172.18.0.7 \
  protocol=tcp dst-address=124.40.251.234 port=443 comment="SITUS_WEB_HTTPS"

# Hairpin, mengikuti pola HAIRPIN_* yang sudah dipakai router ini
/ip/firewall/nat/add chain=srcnat action=masquerade protocol=tcp \
  dst-address=172.18.0.7 dst-port=80 comment="HAIRPIN_SITUS_HTTP"

/ip/firewall/nat/add chain=srcnat action=masquerade protocol=tcp \
  dst-address=172.18.0.7 dst-port=443 comment="HAIRPIN_SITUS_HTTPS"
```

Satu pasang aturan ini cukup untuk berapa pun jumlah situs. Pemisahan antar
situs terjadi di dalam Caddy, bukan di NAT.

Port 80 wajib terbuka, bukan cuma 443 — Let's Encrypt memverifikasi lewat port 80.
Chain `forward` di router ini hanya berisi aturan DNS, tidak ada penolakan
umum, jadi trafik ke `172.18.0.7` lolos tanpa aturan tambahan. Di router lain
hal ini perlu diperiksa sendiri.

## 6. DNS di Exabytes

Di panel pengelolaan domain `shaku.id`:

| Tipe | Nama  | Nilai              |
| ---- | ----- | ------------------ |
| A    | `@`   | IP publik CCR2004  |
| A    | `www` | IP publik CCR2004  |

Tunggu propagasi. Selama DNS belum menunjuk dengan benar, Caddy akan gagal
mengambil sertifikat dan situs hanya bisa dibuka lewat HTTP dari dalam jaringan.

Untuk `shaku.id` langkah ini **sudah selesai** — kedua record menunjuk ke
`124.40.251.234` dan sertifikatnya sudah terbit.

Caddy mencoba lagi dengan jeda yang makin panjang bila gagal, sampai sebulan.
Jadi kalau DNS baru diarahkan setelah container jalan, sertifikat tetap akan
terbit sendiri. Kalau ingin dipercepat, restart containernya.

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
/container/shell [find where name="situs-web"]
```

## 8. Memperbarui situs

Ada dua cara, dan sebaiknya pilih salah satu saja.

### Cara otomatis (dianjurkan)

Pasang container penarik. Setelah itu setiap perubahan — baik dari panel
admin di HP maupun dari PC — sampai ke situs dengan sendirinya dalam
beberapa menit. Bagian "Cara manual" di bawah tidak perlu dikerjakan lagi.

Naikkan `deploy/tarik-situs.sh` ke `usb1/situs/kerja/tarik-situs.sh`, lalu:

```routeros
/file/add name=usb1/situs/tarik-root type=directory

/interface/veth/add name=veth-tarik address=172.18.0.8/24 gateway=172.18.0.1 \
  comment="Penarik situs otomatis"
/interface/bridge/port/add bridge=internal interface=veth-tarik \
  comment="Penarik situs otomatis"

/container/add \
  name=situs-tarik \
  remote-image=alpine/git \
  interface=veth-tarik \
  root-dir=/usb1/situs/tarik-root \
  layer-dir=/usb1/apps/layers \
  mount=/usb1/situs/web:/srv:rw,/usb1/situs/kerja:/kerja:rw \
  entrypoint=/bin/sh \
  cmd=/kerja/tarik-situs.sh \
  hostname=situs-tarik \
  workdir=/kerja \
  logging=yes \
  start-on-boot=yes \
  auto-restart-interval=1m \
  memory-high=256.0MiB \
  comment="Penarik situs otomatis dari GitHub"

/container/start [find where name="situs-tarik"]
```

`entrypoint=/bin/sh` wajib ditulis. Image `alpine/git` punya entrypoint
bawaan `git`, jadi tanpa penimpaan itu skripnya diperlakukan sebagai
argumen `git` dan container langsung mati.

Container ini me-mount folder situs sebagai `rw`, sedangkan container Caddy
me-mount folder yang sama sebagai `ro`. Tidak bentrok — mode mount hanya
berlaku di dalam masing-masing container.

> **Jebakan akhir baris.** Kalau `tarik-situs.sh` terunggah dengan akhir
> baris Windows (CRLF), container mati seketika dengan
> `set: illegal option -r`, karena shell membaca `set -u` sebagai
> `set -u\r`. Repo ini sudah memaksa LF lewat `.gitattributes`, tapi kalau
> berkasnya pernah diedit di aplikasi Windows, periksa lagi sebelum diunggah.

Memantau kerjanya:

```routeros
/log/print where message~"situs-tarik"
```

Baris yang dicari: `Situs diperbarui ke <commit>`.

### Cara manual

```powershell
npm run build
```

Lalu salin ulang isi `dist/` ke `usb1/situs/web/shaku/` menimpa yang lama. Selesai —
Caddy membaca berkas langsung dari folder itu, tidak perlu restart container.

Kalau `deploy/Caddyfile` yang diubah, salin ke `usb1/situs/etc/` lalu:

```routeros
/container/stop [find where name="situs-web"]
/container/start [find where name="situs-web"]
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
sendiri (misalnya container lain di `172.18.0.9:3000`), ganti isi bloknya
jadi `reverse_proxy 172.18.0.9:3000`. Contohnya sudah ditulis dalam bentuk
komentar di `deploy/Caddyfile`.

### Yang sudah diuji

Pola multi-situs di atas dijalankan dengan binary Caddy sungguhan sebelum
ditulis di sini. Hasilnya: dua domain di satu instance melayani isi yang benar
masing-masing, halaman 404 tidak tertukar, `http://` keduanya dialihkan 308 ke
HTTPS, dan akses lewat IP telanjang tanpa nama domain dijawab 404 tanpa
membocorkan situs mana pun.

### Hasil deploy sungguhan, 2 September 2026

Seluruh isi dokumen ini dijalankan di CCR2004 produksi dan berhasil:

- Konfigurasi router dicadangkan lebih dulu ke
  `cadangan-sebelum-web-<tanggal>.rsc`, dan salinannya ditarik ke PC
- 70 berkas situs terunggah ke `usb1/situs/web/shaku/`
- Container `situs-web` (Caddy) berjalan di `172.18.0.7`
- Sertifikat Let's Encrypt terbit otomatis untuk `shaku.id` dan `www.shaku.id`
  dalam waktu di bawah satu menit setelah dst-nat dibuat
- Semua halaman dijawab 200 dari internet, halaman tak dikenal 404,
  `www.shaku.id` dialihkan 301 ke `shaku.id`
- Container `situs-tarik` berjalan di `172.18.0.8` dan memasang situs sendiri
  dari branch `terbit`
- Rantai penuh diuji ujung ke ujung: `git push` ke `main` → GitHub Actions →
  branch `terbit` → penarik → situs baru hidup, tanpa satu pun langkah manual

Tidak ada konfigurasi lama yang diubah atau dihapus. Yang ditambahkan hanya:
dua veth, dua bridge port, empat aturan NAT, dua container, dan folder baru
di USB.

## Catatan jujur soal risiko

- Situs ikut mati bila router restart, listrik padam, atau uplink putus.
  Ini konsekuensi self-hosting, bukan kesalahan konfigurasi.
- Trafik gambar situs ini melewati uplink yang sama dengan pelanggan PPPoE.
  Kalau nanti trafiknya besar, ini perlu ditinjau ulang.
- Sertifikat Let's Encrypt berlaku 90 hari dan diperbarui otomatis oleh Caddy,
  tapi hanya bila port 80 tetap terbuka. Jangan tutup port 80 setelah situs jalan.
