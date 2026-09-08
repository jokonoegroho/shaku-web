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
    plugins: [
      tailwindcss(),
      {
        name: 'pratinjau-hp-lokal',
        // Hanya tersedia saat dev; bingkai dan situs memakai origin yang sama.
        configureServer(server) {
          server.middlewares.use('/__pratinjau-hp', (_req, res) => {
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.end(`<!doctype html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Pratinjau HP SHA.KU</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; padding: 16px; background: #ececec; font: 13px Arial, sans-serif; text-align: center; }
    p { margin: 0 0 12px; color: #555; }
    iframe { display: block; width: 390px; max-width: 100%; height: 750px; margin: auto; border: 0; background: white; }
  </style>
</head>
<body>
  <p>Pratinjau HP - area web 390 x 750, bukan ukuran layar perangkat</p>
  <iframe src="/" title="Website SHA.KU tampilan HP"></iframe>
</body>
</html>`);
          });
        },
      },
    ],
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