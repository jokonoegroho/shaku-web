// @ts-check
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // Dipakai untuk URL kanonik, sitemap, dan tag Open Graph.
  site: 'https://shaku.id',
  // Setiap halaman jadi folder + index.html; cocok untuk server statis
  // sederhana di container tanpa aturan rewrite tambahan.
  build: { format: 'directory' },

  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        // Panel admin menulis jalur foto sebagai "@assets/produk/...".
        // Sveltia CMS mewajibkan public_folder berupa jalur absolut atau
        // alias berawalan "@", jadi jalur relatif tidak bisa dipakai.
        '@assets': fileURLToPath(new URL('./src/assets', import.meta.url)),
      },
    },
  },

  integrations: [sitemap()]
});