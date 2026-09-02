import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Koleksi produk.
 *
 * Sumber data sengaja dipisah dari komponen tampilan: sekarang berasal dari
 * berkas Markdown di src/data/produk/, kelak bisa ditukar ke API atau basis
 * data cukup dengan mengganti loader di bawah, tanpa menyentuh halaman.
 */
const produk = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/data/produk' }),
  schema: ({ image }) =>
    z.object({
      nama: z.string(),
      harga: z.number().int().nonnegative(),
      /**
       * Harga sebelum diskon; dikosongkan bila tidak sedang diskon.
       * Panel admin menulis null saat dikosongkan, jadi null diterima lalu
       * diseragamkan menjadi undefined.
       */
      hargaCoret: z
        .number()
        .int()
        .nonnegative()
        .nullish()
        .transform((v) => v ?? undefined),
      bentuk: z.enum(['almond', 'coffin', 'square', 'stiletto', 'oval', 'round']),
      panjang: z.enum(['pendek', 'sedang', 'panjang']),
      /** Nama warna untuk filter, mis. ["merah", "nude"]. */
      warna: z.array(z.string()).min(1),
      /** Jumlah keping kuku dalam satu set. */
      jumlahKuku: z.number().int().positive().default(24),
      /** Foto pertama dipakai sebagai gambar utama di katalog. */
      foto: z.array(image()).min(1),
      tersedia: z.boolean().default(true),
      unggulan: z.boolean().default(false),
      /** Angka kecil tampil lebih dulu di katalog. */
      urutan: z.number().int().default(100),
      ringkasan: z.string().max(160),
    }),
});

export const collections = { produk };
