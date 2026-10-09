/**
 * The diploma PDF as the PNG that becomes the NFT's image — server-only.
 *
 * Same file the PDF route serves, rasterized at 250 dpi: 842×595 pt becomes
 * 2924×2066 px, the size every diploma pinned before this existed has. pdfjs
 * renders it onto @napi-rs/canvas (a prebuilt native canvas that runs on
 * Vercel); both are server externals in next.config.js.
 */
import { createCanvas } from '@napi-rs/canvas';

const DPI = 250;

export async function diplomaPng(pdf: Uint8Array): Promise<Buffer> {
  // The legacy build is the one pdfjs supports in Node.
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const doc = await pdfjs.getDocument({ data: new Uint8Array(pdf) }).promise;
  try {
    const page = await doc.getPage(1);
    const viewport = page.getViewport({ scale: DPI / 72 });
    const width = Math.round(viewport.width);
    const height = Math.round(viewport.height);
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    await page.render({ canvas: canvas as unknown as HTMLCanvasElement, canvasContext: ctx as unknown as CanvasRenderingContext2D, viewport }).promise;
    return canvas.toBuffer('image/png');
  } finally {
    await doc.destroy();
  }
}
