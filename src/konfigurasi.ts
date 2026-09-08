/**
 * Konfigurasi terpusat situs shaku.id.
 * Semua nilai yang mungkin berubah (nomor WA, domain, sosmed) ditaruh di sini
 * supaya tidak tersebar di banyak berkas.
 */

export const SITUS = {
  nama: 'SHA.KU',
  namaLengkap: 'SHA.KU — Press-On Nail by Gorgeousblom.nailart',
  subMerek: 'By.Gorgeousblom.nailart',
  domain: 'https://shaku.id',
  deskripsi:
    'Press-on nail siap pakai. Kuku cantik dalam hitungan menit, tanpa perlu ke salon.',
  /**
   * GANTI dengan nomor WhatsApp asli, format internasional tanpa tanda plus.
   * Contoh: 6281234567890
   */
  whatsapp: '62882005359524',
  instagram: '', // isi username tanpa @, kosongkan bila belum ada
  tiktok: '', // isi username tanpa @, kosongkan bila belum ada
  email: '', // kosongkan bila belum ada
  kota: 'Indonesia',
} as const;

export const TAUTAN_UTAMA = [
  { label: 'Beranda', href: '/' },
  { label: 'Katalog', href: '/katalog/' },
  { label: 'Cara Pesan', href: '/cara-pesan/' },
  { label: 'Tentang', href: '/tentang/' },
];

/** Mata uang rupiah tanpa desimal. */
export function formatRupiah(nilai: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  })
    .format(nilai)
    // Intl menyisipkan spasi tak-putus setelah "Rp"; diganti spasi biasa
    // supaya aman saat teks ikut dikirim ke WhatsApp.
    .replace(/\u00a0/g, ' ');
}

/** Membangun tautan wa.me dengan pesan yang sudah terisi. */
export function tautanWhatsApp(pesan: string): string {
  return `https://wa.me/${SITUS.whatsapp}?text=${encodeURIComponent(pesan)}`;
}

/** Pesan pemesanan untuk satu produk tertentu. */
export function pesanProduk(namaProduk: string, harga: number): string {
  return `Halo ${SITUS.nama}, saya mau pesan "${namaProduk}" (${formatRupiah(
    harga,
  )}). Apakah masih tersedia?`;
}
