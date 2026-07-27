import sharp from 'sharp';
import { writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const SRC_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'images');
const QUALITY = 88;

const SIZES = {
  small: { width: 400, height: 320 },     // 2x of the 200x160 CSS display size
  featured: { width: 1520, height: 1040 }, // 2x of the 760x520 CSS display size
};

const files = process.argv.slice(2);

for (const [folder, { width, height }] of Object.entries(SIZES)) {
  const OUT_DIR = join(SRC_DIR, folder);
  for (const name of files) {
    const src = join(SRC_DIR, name);
    const base = name.replace(/\.(jpe?g|png)$/i, '');
    const jpgOut = join(OUT_DIR, `${base}.jpg`);
    const webpOut = join(OUT_DIR, `${base}.webp`);

    const jpgBuf = await sharp(src)
      .resize({ width, height, fit: 'cover' })
      .jpeg({ quality: QUALITY, mozjpeg: true, progressive: true })
      .toBuffer();
    await writeFile(jpgOut, jpgBuf);

    const webpBuf = await sharp(src)
      .resize({ width, height, fit: 'cover' })
      .webp({ quality: 85 })
      .toBuffer();
    await writeFile(webpOut, webpBuf);

    console.log(`${name} -> ${folder}/${base}.jpg + .webp (${(jpgBuf.length/1024).toFixed(0)}KB, ${(webpBuf.length/1024).toFixed(0)}KB)`);
  }
}
console.log('done');
