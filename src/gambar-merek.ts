import { getEntry } from 'astro:content';

export async function gambarMerek() {
  const entri = await getEntry('identitas', 'gambar');
  if (!entri) throw new Error('Pengaturan gambar merek tidak ditemukan.');
  return entri.data;
}
