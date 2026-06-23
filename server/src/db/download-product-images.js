import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { IMAGE_DOWNLOADS } from './product-images.js';
import { BANNER_DOWNLOADS } from './banner-images.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const productDir = path.resolve(__dirname, '../../../client/public/images/products');
const bannerDir = path.resolve(__dirname, '../../../client/public/images/banners');

async function download(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 1000) throw new Error('File too small');
  return buf;
}

async function main() {
  fs.mkdirSync(productDir, { recursive: true });
  fs.mkdirSync(bannerDir, { recursive: true });
  let ok = 0;
  let fail = 0;

  for (const { file, url } of [...IMAGE_DOWNLOADS, ...BANNER_DOWNLOADS]) {
    const dest = path.join(file.startsWith('slider-') ? bannerDir : productDir, file);
    try {
      const buf = await download(url);
      fs.writeFileSync(dest, buf);
      console.log(`✓ ${file}`);
      ok++;
    } catch (err) {
      console.error(`✗ ${file}: ${err.message}`);
      fail++;
    }
  }

  console.log(`\nDone: ${ok} downloaded, ${fail} failed`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
