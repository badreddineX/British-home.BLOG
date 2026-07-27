import sharp from 'sharp';
import { writeFile, readFile, stat } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'images');
const MAX_WIDTH = 1400, MAX_HEIGHT = 1400, QUALITY = 82;

const files = process.argv.slice(2);

for (const name of files) {
  const path = join(DIR, name);
  const before = (await stat(path)).size;
  const inputBuf = await readFile(path);
  const img = sharp(inputBuf);
  const meta = await img.metadata();
  let pipeline = img;
  if ((meta.width ?? 0) > MAX_WIDTH || (meta.height ?? 0) > MAX_HEIGHT) {
    pipeline = pipeline.resize({ width: MAX_WIDTH, height: MAX_HEIGHT, fit: 'inside', withoutEnlargement: true });
  }
  pipeline = pipeline.jpeg({ quality: QUALITY, mozjpeg: true, progressive: true });
  const buf = await pipeline.toBuffer();
  await writeFile(path, buf);
  console.log(`${name}: ${(before/1024/1024).toFixed(1)}MB -> ${(buf.length/1024/1024).toFixed(1)}MB`);
}
