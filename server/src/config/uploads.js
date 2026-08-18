import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const localDir = path.join(__dirname, '../../uploads');
const knownDirs = [
  process.env.UPLOAD_DIR,
  '/var/www/thedenimforge/uploads',
  '/var/www/thedenimforge/server/uploads',
  '/root/thedenimforge/server/uploads',
  localDir,
].filter(Boolean);

export const uploadRoot = knownDirs.find((dir) => {
  try {
    return fs.existsSync(path.join(dir, 'products'));
  } catch {
    return false;
  }
}) || localDir;

export const extraUploadRoots = [...new Set(knownDirs.filter((dir) => dir !== uploadRoot))];

for (const dir of [uploadRoot, ...extraUploadRoots]) {
  try {
    fs.mkdirSync(path.join(dir, 'products'), { recursive: true });
  } catch {
    /* ignore missing parent dirs on local */
  }
}
