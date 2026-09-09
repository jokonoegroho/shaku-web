/**
 * Konfigurasi terpusat situs shaku.id.
 * Semua nilai yang mungkin berubah (nomor WA, domain, sosmed) ditaruh di sini
 * supaya tidak tersebar di banyak berkas.
 */

import { PENGATURAN } from './konten';

export const SITUS = {
  ...PENGATURAN,
  domain: 'https://shaku.id',
} as const;

export const TAUTAN_UTAMA = [
  { label: SITUS.menu.beranda, href: '/' },
  { label: SITUS.menu.katalog, href: '/katalog/' },
  { label: SITUS.menu.caraPesan, href: '/cara-pesan/' },
  { label: SITUS.menu.tentang, href: '/tentang/' },
];

/** Pengganti variabel hanya sekali, agar isi nama produk tidak ditafsirkan ulang. */
export function isiTemplat(teks: string, nilai: Record<string, string>): string {
  return teks.replace(/\{(\w+)\}/g, (asli, kunci: string) => nilai[kunci] ?? asli);
}

export function pesanUmum(): string {
  return isiTemplat(SITUS.pesanUmum, { nama: SITUS.nama });
}

export function pesanTerjual(namaProduk: string): string {
  return isiTemplat(SITUS.pesanTerjual, { nama: SITUS.nama, produk: namaProduk });
}

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
  return isiTemplat(SITUS.pesanPesan, {
    nama: SITUS.nama, produk: namaProduk, harga: formatRupiah(harga),
  });
}
