// Skrip sekali pakai: membuat foto placeholder produk.
// Hapus berkas ini setelah foto asli tersedia.
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const keluaran = join(process.cwd(), 'src', 'assets', 'produk');
mkdirSync(keluaran, { recursive: true });

// Warna contoh disamakan dengan tema linen + burgundi. Nuansanya sengaja
// lembut agar kartu produk yang belum ada foto aslinya tidak terlihat
// mencolok di antara foto asli.
const daftar = [
  { berkas: 'ruby-almond', label: 'RUBY GLOSS', c1: '#c9a29a', c2: '#e8d6cc' },
  { berkas: 'nude-coffin', label: 'NUDE CLASSIC', c1: '#c8a488', c2: '#ecdcc9' },
  { berkas: 'french-square', label: 'FRENCH TIP', c1: '#d6cec6', c2: '#f2ece5' },
  { berkas: 'noir-stiletto', label: 'NOIR MATTE', c1: '#b6aaa6', c2: '#ddd4cf' },
  { berkas: 'pearl-oval', label: 'PEARL MILK', c1: '#c4c2c8', c2: '#ece9ea' },
  { berkas: 'sakura-round', label: 'SAKURA POP', c1: '#d3a9ae', c2: '#f0dcdc' },
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
  <rect width="100%" height="100%" fill="#faf7f3"/>
  <rect x="60" y="60" width="${LEBAR - 120}" height="${TINGGI - 120}" rx="48" fill="url(#g)"/>
  <text x="50%" y="47%" text-anchor="middle" font-family="Arial, sans-serif"
        font-size="76" font-weight="bold" fill="#4c0c0c" letter-spacing="4">${item.label}</text>
  <text x="50%" y="55%" text-anchor="middle" font-family="Arial, sans-serif"
        font-size="34" fill="#4c0c0c" opacity="0.7" letter-spacing="6">FOTO CONTOH</text>
</svg>`;

  const tujuan = join(keluaran, `${item.berkas}.jpg`);
  await sharp(Buffer.from(svg)).jpeg({ quality: 82 }).toFile(tujuan);
  console.log('dibuat:', tujuan);
}
