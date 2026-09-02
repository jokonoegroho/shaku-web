<#
.SYNOPSIS
  Menyiapkan repo GitHub untuk situs SHA.KU dan menyalakan panel admin.

.DESCRIPTION
  Skrip ini mengerjakan semua langkah yang bisa diotomatiskan:
    1. Mengatur identitas git bila belum ada
    2. Mengganti nama repo contoh di berkas panel admin dan skrip penarik
    3. Membuat commit pertama
    4. Menghubungkan ke repo GitHub dan mengirimnya

  Yang tetap harus dikerjakan manual: membuat repo kosong di GitHub, dan
  membuat token untuk masuk ke panel admin. Keduanya butuh akun Anda.

  Aman dijalankan ulang: langkah yang sudah beres akan dilewati.

.EXAMPLE
  .\scripts\siapkan-github.ps1
#>

[CmdletBinding()]
param(
  # Nama akun GitHub. Bila kosong, akan ditanyakan.
  [string]$Akun,
  # Nama repo di GitHub.
  [string]$NamaRepo = 'shaku-web',
  # Nama yang tertulis sebagai pembuat commit.
  [string]$NamaGit,
  # Email untuk commit.
  [string]$EmailGit,
  # Alamat dasar server git. Hanya diubah saat pengujian.
  [string]$UrlDasar = 'https://github.com/',
  # Lewati pembuatan repo di browser. Dipakai saat pengujian.
  [switch]$TanpaBrowser
)

$ErrorActionPreference = 'Stop'

function Tulis($teks, $warna = 'White') { Write-Host $teks -ForegroundColor $warna }
function Judul($teks) { Write-Host ''; Tulis "== $teks" 'Cyan' }

function Berhenti($teks) {
  Write-Host ''
  Write-Host $teks -ForegroundColor Red
  exit 1
}

$akarProyek = Split-Path -Parent $PSScriptRoot
Set-Location $akarProyek

if (-not (Test-Path (Join-Path $akarProyek 'astro.config.mjs'))) {
  Berhenti "Ini bukan folder proyek situs. Dicari di: $akarProyek"
}

# ---------- 1. Nama akun ----------
Judul 'Akun GitHub'
while ([string]::IsNullOrWhiteSpace($Akun)) {
  $Akun = (Read-Host 'Nama akun GitHub Anda (bukan email)').Trim()
}
if ($Akun -notmatch '^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9])){0,38}$') {
  Berhenti "Nama akun '$Akun' tidak sesuai aturan GitHub. Periksa lagi ejaannya."
}
$repoPenuh = "$Akun/$NamaRepo"
Tulis "Repo yang akan dipakai: $repoPenuh" 'Green'

# ---------- 2. Identitas git ----------
Judul 'Identitas commit'
$namaAda = (git config user.name) 2>$null
$emailAda = (git config user.email) 2>$null

if ([string]::IsNullOrWhiteSpace($namaAda)) {
  if ([string]::IsNullOrWhiteSpace($NamaGit)) {
    $NamaGit = (Read-Host "Nama Anda untuk catatan commit [$Akun]").Trim()
    if ([string]::IsNullOrWhiteSpace($NamaGit)) { $NamaGit = $Akun }
  }
  git config user.name $NamaGit
  Tulis "Nama disetel: $NamaGit" 'Green'
} else {
  Tulis "Nama sudah ada: $namaAda" 'DarkGray'
}

if ([string]::IsNullOrWhiteSpace($emailAda)) {
  $bawaan = "$Akun@users.noreply.github.com"
  if ([string]::IsNullOrWhiteSpace($EmailGit)) {
    $EmailGit = (Read-Host "Email untuk commit [$bawaan]").Trim()
    if ([string]::IsNullOrWhiteSpace($EmailGit)) { $EmailGit = $bawaan }
  }
  git config user.email $EmailGit
  Tulis "Email disetel: $EmailGit" 'Green'
} else {
  Tulis "Email sudah ada: $emailAda" 'DarkGray'
}

# ---------- 3. Ganti nama repo contoh ----------
Judul 'Mengisi nama repo di berkas'
$berkasDiubah = @()
foreach ($berkas in @('public/admin/config.yml', 'deploy/tarik-situs.sh')) {
  $jalur = Join-Path $akarProyek $berkas
  if (-not (Test-Path $jalur)) { continue }
  $isi = Get-Content $jalur -Raw
  if ($isi -like '*GANTI-AKUN-GITHUB*') {
    $baru = $isi.Replace('GANTI-AKUN-GITHUB/shaku-web', $repoPenuh).Replace('GANTI-AKUN-GITHUB', $Akun)
    Set-Content -Path $jalur -Value $baru -NoNewline -Encoding utf8
    $berkasDiubah += $berkas
    Tulis "  diisi: $berkas" 'Green'
  } else {
    Tulis "  sudah terisi: $berkas" 'DarkGray'
  }
}
if ($berkasDiubah.Count -eq 0) { Tulis 'Tidak ada yang perlu diubah.' 'DarkGray' }

# ---------- 4. Commit ----------
Judul 'Menyimpan ke riwayat git'
git add -A | Out-Null
$adaPerubahan = (git status --porcelain) -ne $null
$adaCommit = $false
try { git rev-parse HEAD 2>&1 | Out-Null; $adaCommit = $LASTEXITCODE -eq 0 } catch { $adaCommit = $false }

if ($adaPerubahan) {
  $pesan = if ($adaCommit) { 'Isi nama repo untuk panel admin' } else { 'Situs SHA.KU versi pertama' }
  git commit -q -m $pesan
  Tulis "Commit dibuat: $pesan" 'Green'
} else {
  Tulis 'Tidak ada perubahan untuk disimpan.' 'DarkGray'
}

$cabang = git symbolic-ref --short HEAD
if ($cabang -ne 'main') {
  git branch -M main
  Tulis "Branch diganti dari '$cabang' menjadi 'main'" 'Green'
}

# ---------- 5. Repo di GitHub ----------
$urlRepo = "$UrlDasar$repoPenuh" + $(if ($UrlDasar -like 'https://github.com/*') { '.git' } else { '' })

Judul 'Repo di GitHub'
$remoteAda = (git remote) -contains 'origin'
if ($remoteAda) {
  $urlLama = git remote get-url origin
  if ($urlLama -ne $urlRepo) {
    git remote set-url origin $urlRepo
    Tulis "Alamat origin diperbarui ke $urlRepo" 'Green'
  } else {
    Tulis "origin sudah benar: $urlRepo" 'DarkGray'
  }
} else {
  git remote add origin $urlRepo
  Tulis "origin ditambahkan: $urlRepo" 'Green'
}

if (-not $TanpaBrowser) {
  Tulis ''
  Tulis 'Sekarang buat repo kosongnya di GitHub:' 'Yellow'
  Tulis "  - Nama repo : $NamaRepo" 'Yellow'
  Tulis '  - JANGAN centang README, .gitignore, atau lisensi' 'Yellow'
  Tulis ''
  $buka = Read-Host 'Buka halaman pembuatan repo di browser sekarang? (y/n)'
  if ($buka -match '^[yY]') {
    Start-Process "https://github.com/new?name=$NamaRepo"
  }
  Read-Host 'Tekan Enter setelah repo kosongnya selesai dibuat'
}

# ---------- 6. Kirim ----------
Judul 'Mengirim ke GitHub'
Tulis 'Bila diminta login, ikuti jendela yang muncul.' 'DarkGray'
$ErrorActionPreference = 'Continue'
git push -u origin main
if ($LASTEXITCODE -ne 0) {
  Tulis ''
  Tulis 'Pengiriman gagal. Yang biasanya jadi sebab:' 'Red'
  Tulis '  - Repo di GitHub belum dibuat, atau namanya beda' 'Red'
  Tulis '  - Repo dibuat dengan README sehingga isinya bentrok' 'Red'
  Tulis '  - Login dibatalkan' 'Red'
  Tulis ''
  Tulis 'Perbaiki lalu jalankan skrip ini lagi. Aman diulang.' 'Yellow'
  exit 1
}

# ---------- Selesai ----------
Judul 'Selesai'
Tulis "Kode sudah ada di $UrlDasar$repoPenuh" 'Green'
Tulis ''
Tulis 'Dua langkah terakhir, keduanya butuh akun Anda:' 'Yellow'
Tulis ''
Tulis '1. Pastikan build otomatis berjalan.' 'White'
Tulis "   Buka https://github.com/$repoPenuh/actions" 'DarkGray'
Tulis '   Tunggu alur "Bangun dan terbitkan situs" selesai.' 'DarkGray'
Tulis '   Bila berhasil, muncul branch baru bernama "terbit".' 'DarkGray'
Tulis ''
Tulis '2. Buat token untuk masuk ke panel admin.' 'White'
Tulis '   Buka https://github.com/settings/personal-access-tokens/new' 'DarkGray'
Tulis "   Repository access : Only select repositories -> $NamaRepo" 'DarkGray'
Tulis '   Permissions       : Contents -> Read and write' 'DarkGray'
Tulis '   Salin tokennya, lalu tempel di halaman /admin/.' 'DarkGray'
Tulis ''
Tulis 'Penjelasan lengkap ada di docs/panel-admin.md' 'DarkGray'
