import type { APIRoute } from 'astro';
import { SITUS } from '../konfigurasi';

// robots.txt dibuat saat build supaya alamat sitemap selalu ikut domain aktif.
// Panel admin dikecualikan agar tidak muncul di hasil pencarian.
export const GET: APIRoute = () =>
  new Response(
    `User-agent: *\nAllow: /\nDisallow: /admin/\n\nSitemap: ${SITUS.domain}/sitemap-index.xml\n`,
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );
