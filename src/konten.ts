import { z } from 'astro:content';
import situs from './data/pengaturan/situs.json';
import beranda from './data/pengaturan/beranda.json';
import katalog from './data/pengaturan/katalog.json';

const teks = z.string().trim().min(1);
const opsional = z.string().nullish().transform((nilai) => nilai ?? '');
const akun = z.string().regex(/^[A-Za-z0-9._]*$/).nullish().transform((nilai) => nilai ?? '');

export const PENGATURAN = z.object({
  nama: teks,
  namaLengkap: teks,
  subMerek: teks,
  deskripsi: teks.max(300),
  whatsapp: z.string().regex(/^[1-9][0-9]{7,14}$/, 'Nomor WA harus memakai kode negara tanpa tanda plus.'),
  instagram: akun,
  tiktok: akun,
  email: z.union([z.string().email(), z.literal('')]).nullish().transform((nilai) => nilai ?? ''),
  pengumuman: opsional,
  tampilkanPengumuman: z.boolean(),
  menu: z.object({ beranda: teks, katalog: teks, caraPesan: teks, tentang: teks }),
  footer: z.object({ jelajahi: teks, hubungi: teks, hakCipta: teks }),
  pesanUmum: teks,
  pesanPesan: teks,
  pesanTerjual: teks,
  labelWa: teks,
}).parse(situs);

export const BERANDA = z.object({
  judul: teks,
  jargon: teks,
  subJargon: teks,
  judulKatalog: teks,
  tautanKatalog: teks,
  tampilkanKeunggulan: z.boolean(),
  keunggulan: z.array(z.object({ judul: teks, isi: teks })).nullish().transform((nilai) => nilai ?? []),
  tampilkanAjakan: z.boolean(),
  ajakanJudul: teks,
  ajakanIsi: teks,
  ajakanTombol: teks,
}).parse(beranda);

export const KATALOG = z.object({
  fotoKosong: teks,
  judul: teks, deskripsi: teks, jumlah: teks, cari: teks, labelCari: teks,
  placeholderCari: teks, placeholderBanner: teks, semua: teks,
  bentuk: teks, panjang: teks, warna: teks, isi: teks, satuan: teks, satuanKartu: teks,
  kosong: teks, hemat: teks, terjualKartu: teks, pesanTombol: teks,
  terjualJudul: teks, terjualIsi: teks, terjualTombol: teks,
  panduanJudul: teks, panduanTautan: teks, lainnya: teks,
}).parse(katalog);
