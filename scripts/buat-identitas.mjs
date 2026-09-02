import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

// Membuat favicon dan gambar pratinjau (Open Graph) dari logo asli SHA.KU.
// Jalankan ulang bila logo diganti: node scripts/buat-identitas.mjs
const publik = join(process.cwd(), 'public');
const logo = join(process.cwd(), 'src', 'assets', 'logo-shaku.png');
mkdirSync(publik, { recursive: true });

// Favicon PNG beberapa ukuran; browser modern menerima PNG langsung.
await sharp(logo).resize(32, 32).png().toFile(join(publik, 'favicon-32.png'));
await sharp(logo).resize(180, 180).png().toFile(join(publik, 'apple-touch-icon.png'));

// Gambar pratinjau saat tautan dibagikan: logo di tengah latar gelap situs.
const latar = await sharp({
  create: { width: 1200, height: 630, channels: 3, background: '#0a0a0b' },
})
  .png()
  .toBuffer();

const logoBulat = await sharp(logo).resize(440, 440).png().toBuffer();

const teks = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <text x="700" y="290" font-family="Arial, sans-serif" font-size="96"
        font-weight="bold" fill="#f5f5f7" letter-spacing="4">SHA.KU</text>
  <text x="704" y="345" font-family="Arial, sans-serif" font-size="28"
        fill="#e8879b" letter-spacing="4">By.Gorgeousblom.nailart</text>
  <text x="704" y="410" font-family="Arial, sans-serif" font-size="30"
        fill="#a1a1aa">Press-on nail siap pakai.</text>
</svg>`;

await sharp(latar)
  .composite([
    { input: logoBulat, top: 95, left: 160 },
    { input: Buffer.from(teks), top: 0, left: 0 },
  ])
  .png({ compressionLevel: 9, palette: true })
  .toFile(join(publik, 'og.png'));

console.log('favicon-32.png, apple-touch-icon.png, dan og.png dibuat di public/');
