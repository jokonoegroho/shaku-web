/**
 * Menyalin bundle Sveltia CMS dari node_modules ke public/admin/.
 *
 * Sengaja tidak memakai CDN: panel admin ini dipakai untuk mengelola isi
 * toko, jadi tidak boleh bergantung pada server pihak ketiga yang bisa
 * berubah atau mati. Versinya terkunci di package-lock.json.
 *
 * Dijalankan otomatis lewat "predev" dan "prebuild" di package.json.
 */
import { copyFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const akar = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const asal = resolve(akar, 'node_modules/@sveltia/cms/dist/sveltia-cms.js');
const tujuan = resolve(akar, 'public/admin/sveltia-cms.js');

if (!existsSync(asal)) {
  console.error(
    '[cms] Bundle tidak ditemukan. Jalankan "npm install" lebih dulu.\n' +
      '      Dicari di: ' + asal,
  );
  process.exit(1);
}

mkdirSync(dirname(tujuan), { recursive: true });
copyFileSync(asal, tujuan);
console.log('[cms] Panel admin siap di /admin/');
