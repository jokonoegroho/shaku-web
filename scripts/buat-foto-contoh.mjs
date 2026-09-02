// Skrip sekali pakai: membuat foto placeholder produk.
// Hapus berkas ini setelah foto asli tersedia.
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const keluaran = join(process.cwd(), 'src', 'assets', 'produk');
mkdirSync(keluaran, { recursive: true });

const daftar = [
  { berkas: 'ruby-almond', label: 'RUBY GLOSS', c1: '#7f1030', c2: '#ff2d78' },
  { berkas: 'nude-coffin', label: 'NUDE CLASSIC', c1: '#5a4438', c2: '#d9a684' },
  { berkas: 'french-square', label: 'FRENCH TIP', c1: '#2b2b33', c2: '#e9e4dd' },
  { berkas: 'noir-stiletto', label: 'NOIR MATTE', c1: '#101014', c2: '#3d3d47' },
  { berkas: 'pearl-oval', label: 'PEARL MILK', c1: '#4a4a5c', c2: '#cfd4e6' },
  { berkas: 'sakura-round', label: 'SAKURA POP', c1: '#6d2350', c2: '#ff9ec4' },
];

const LEBAR = 1000;
const TINGGI = 1250;

for (const item of daftar) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${LEBAR}" height="${TINGGI}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${item.c1}"/>
      <stop offset="100%" stop-color="${item.c2}"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="#0a0a0b"/>
  <rect x="60" y="60" width="${LEBAR - 120}" height="${TINGGI - 120}" rx="48" fill="url(#g)"/>
  <text x="50%" y="47%" text-anchor="middle" font-family="Arial, sans-serif"
        font-size="76" font-weight="bold" fill="#ffffff" letter-spacing="4">${item.label}</text>
  <text x="50%" y="55%" text-anchor="middle" font-family="Arial, sans-serif"
        font-size="34" fill="#ffffff" opacity="0.75" letter-spacing="6">FOTO CONTOH</text>
</svg>`;

  const tujuan = join(keluaran, `${item.berkas}.jpg`);
  await sharp(Buffer.from(svg)).jpeg({ quality: 82 }).toFile(tujuan);
  console.log('dibuat:', tujuan);
}
