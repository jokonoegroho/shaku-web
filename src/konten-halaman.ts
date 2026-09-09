import { z } from 'astro:content';
import caraPesan from './data/halaman/cara-pesan.json';
import tentang from './data/halaman/tentang.json';
import tidakDitemukan from './data/halaman/tidak-ditemukan.json';

const teks = z.string().trim().min(1);
const meta = z.object({
  judul: teks,
  deskripsi: teks,
});
const ajakan = z.object({
  judul: teks,
  deskripsi: teks,
  tombol: teks,
  pesanWhatsApp: teks,
});

export const CARA_PESAN = z.object({
  meta,
  judul: teks,
  pengantar: teks,
  langkah: z.array(z.object({ judul: teks, isi: teks })).min(1),
  ajakan,
  judulFaq: teks,
  faq: z.array(z.object({ tanya: teks, jawab: teks })).min(1),
}).parse(caraPesan);

export const TENTANG = z.object({
  meta,
  judul: teks,
  paragraf: z.array(teks).min(1),
  ajakan,
}).parse(tentang);

export const TIDAK_DITEMUKAN = z.object({
  meta: meta.extend({
    // Nilai kosong memakai deskripsi situs, sama seperti halaman 404 sebelumnya.
    deskripsi: z.string().trim().nullish().transform((nilai) => nilai ?? ''),
  }),
  kode: teks,
  judul: teks,
  deskripsi: teks,
  tombol: teks,
}).parse(tidakDitemukan);
