#!/bin/sh
# ---------------------------------------------------------------
# Penarik situs otomatis untuk container di CCR2004.
#
# Dijalankan terus-menerus di dalam container kecil berbasis image
# alpine/git. Tugasnya satu: memeriksa branch "terbit" di GitHub, dan
# bila ada perubahan, menyalin isinya ke folder yang dilayani Caddy.
#
# Alurnya: panel admin menyimpan -> GitHub Actions build -> branch
# "terbit" -> skrip ini menariknya -> Caddy melayaninya.
#
# Semua koneksi bersifat keluar. Tidak ada port baru yang perlu dibuka
# dari internet.
# ---------------------------------------------------------------

set -u

# ====== YANG PERLU DIISI ======
# Nilai di bawah bisa ditimpa lewat variabel lingkungan container
# (parameter envlist di RouterOS), jadi berkas ini tidak wajib diubah.
#
# Untuk repo publik cukup seperti ini:
REPO_URL="${REPO_URL:-https://github.com/jokonoegroho/shaku-web.git}"
# Untuk repo privat, pakai bentuk berikut dan isi tokennya:
# REPO_URL="https://x-access-token:GANTI_TOKEN@github.com/jokonoegroho/shaku-web.git"

BRANCH="${BRANCH:-terbit}"
# Folder yang dilayani Caddy. Harus cocok dengan nama di Caddyfile.
TUJUAN="${TUJUAN:-/srv/shaku}"
# Jeda antar pemeriksaan, dalam detik.
JEDA="${JEDA:-180}"
# Folder kerja untuk salinan repo.
KERJA_DIR="${KERJA_DIR:-/kerja}"
# Isi 1 bila ingin sekali jalan lalu berhenti, bukan mengulang terus.
SEKALI="${SEKALI:-0}"
# ==============================

KERJA="$KERJA_DIR/repo"
CATATAN="$KERJA_DIR/terpasang.txt"

catat() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"
}

pasang() {
  BARU="$1"
  SEMENTARA="${TUJUAN}.baru"
  LAMA="${TUJUAN}.lama"

  rm -rf "$SEMENTARA" "$LAMA"
  mkdir -p "$SEMENTARA" || return 1
  cp -R "$KERJA"/. "$SEMENTARA"/ || return 1
  rm -rf "$SEMENTARA/.git"

  # Tukar cepat supaya situs tidak pernah terlihat setengah jadi.
  if [ -d "$TUJUAN" ]; then
    mv "$TUJUAN" "$LAMA" || return 1
  fi
  mv "$SEMENTARA" "$TUJUAN" || return 1
  rm -rf "$LAMA"

  echo "$BARU" > "$CATATAN"
  catat "Situs diperbarui ke $BARU"
}

mkdir -p "$KERJA_DIR"

catat "Penarik situs mulai. Branch $BRANCH, jeda ${JEDA} detik."

while true; do
  if [ -d "$KERJA/.git" ]; then
    git -C "$KERJA" fetch --depth 1 origin "$BRANCH" >/dev/null 2>&1 &&
      git -C "$KERJA" reset --hard "origin/$BRANCH" >/dev/null 2>&1 ||
      catat "Gagal mengambil perubahan. Coba lagi nanti."
  else
    rm -rf "$KERJA"
    if git clone --depth 1 -b "$BRANCH" "$REPO_URL" "$KERJA" >/dev/null 2>&1; then
      catat "Repo berhasil diambil pertama kali."
    else
      catat "Gagal mengambil repo. Periksa URL, token, dan koneksi keluar."
    fi
  fi

  BARU=$(git -C "$KERJA" rev-parse HEAD 2>/dev/null || echo '')
  TERPASANG=$(cat "$CATATAN" 2>/dev/null || echo '')

  if [ -n "$BARU" ] && [ "$BARU" != "$TERPASANG" ]; then
    pasang "$BARU" || catat "Gagal memasang. Situs lama tetap dilayani."
  fi

  [ "$SEKALI" = "1" ] && break
  sleep "$JEDA"
done
