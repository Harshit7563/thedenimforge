const MAX_EDGE = 1600;
const TARGET_BYTES = 700_000;

function blobToFile(blob: Blob, originalName: string): File {
  const name = originalName.replace(/\.\w+$/, '.jpg');
  return new File([blob], name, { type: 'image/jpeg' });
}

function canvasToBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Image compress failed'))),
      'image/jpeg',
      quality
    );
  });
}

/** Shrink phone-camera photos so admin upload does not hit nginx / multer limits. */
export async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith('image/') || file.type === 'image/gif') return file;
  if (file.size <= TARGET_BYTES) return file;

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();

    let quality = 0.82;
    let blob = await canvasToBlob(canvas, quality);
    while (blob.size > TARGET_BYTES && quality > 0.5) {
      quality -= 0.08;
      blob = await canvasToBlob(canvas, quality);
    }

    if (blob.size >= file.size) return file;
    return blobToFile(blob, file.name);
  } catch {
    return file;
  }
}

export async function compressImages(files: File[]): Promise<File[]> {
  return Promise.all(files.map(compressImage));
}
