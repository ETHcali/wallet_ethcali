/**
 * The builder diploma as a PDF — server-only (reads fonts and the logo from disk).
 *
 * One A4 landscape page on the brand's black, the ETH Cali mark, and the
 * builder's name in Sarun Pro. It is what the certificate email attaches and
 * what /certificate/<id> downloads, from this one function, so the two are
 * always the same file. The onchain NFT comes later; this is the paper copy.
 *
 * The font and logo paths are listed in next.config.js
 * (outputFileTracingIncludes) so they ship with the function on Vercel.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { PDFDocument, rgb, type PDFFont, type PDFPage } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { CERT_EVENTS, credentialUrl, honorLabel, type Honor } from './events';

export interface DiplomaInput {
  event: string;
  memberName: string;
  projectName: string;
  credentialId: string;
  issueDate: string; // YYYY-MM-DD
  honors: Honor[];
}

const W = 842;
const H = 595;

const BLACK = rgb(0, 0, 0);
const WHITE = rgb(1, 1, 1);
const BLUE = rgb(43 / 255, 35 / 255, 239 / 255);
const BLUE_TEXT = rgb(154 / 255, 150 / 255, 1);
const MUTED = rgb(0.62, 0.63, 0.7);
const FAINT = rgb(0.42, 0.43, 0.5);

// TTF, not the design-tokens woff2: @pdf-lib/fontkit mis-decodes woff2 glyphs
// (every character renders as a dot). Same files ethcali.org publishes in
// public/branding/fonts.
const FONT_DIR = path.join(process.cwd(), 'lib/certificates/fonts');
const LOGO = path.join(process.cwd(), 'public/1x1ethcali.png');

let cache: { bold: Buffer; regular: Buffer; logo: Buffer } | null = null;
function assets() {
  if (!cache) {
    cache = {
      bold: readFileSync(path.join(FONT_DIR, 'SarunPro-Bold.ttf')),
      regular: readFileSync(path.join(FONT_DIR, 'SarunPro-Regular.ttf')),
      logo: readFileSync(LOGO),
    };
  }
  return cache;
}

/** Centred text, shrunk until it fits `maxWidth`. */
function centred(page: PDFPage, text: string, y: number, font: PDFFont, size: number, color = WHITE, maxWidth = W - 160) {
  let s = size;
  while (s > 8 && font.widthOfTextAtSize(text, s) > maxWidth) s -= 1;
  page.drawText(text, { x: (W - font.widthOfTextAtSize(text, s)) / 2, y, size: s, font, color });
}

/** Letter-spaced small caps line, centred. pdf-lib has no tracking, so draw per glyph. */
function spaced(page: PDFPage, text: string, y: number, font: PDFFont, size: number, color: ReturnType<typeof rgb>, tracking = 2.4) {
  const chars = [...text];
  const width = chars.reduce((w, c) => w + font.widthOfTextAtSize(c, size) + tracking, -tracking);
  let x = (W - width) / 2;
  for (const c of chars) {
    page.drawText(c, { x, y, size, font, color });
    x += font.widthOfTextAtSize(c, size) + tracking;
  }
}

const MONTHS_ES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

export async function renderDiploma(input: DiplomaInput): Promise<Uint8Array> {
  const ev = CERT_EVENTS[input.event];
  if (!ev) throw new Error(`Unknown certificate event: ${input.event}`);
  const a = assets();

  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  doc.setTitle(`${ev.credentialName} — ${input.memberName}`);
  doc.setAuthor('ETH Cali');
  doc.setSubject(`${input.projectName} · ${ev.title}`);
  doc.setKeywords(['ETH Cali', 'Ethereum', 'certificate', input.credentialId]);

  const bold = await doc.embedFont(a.bold, { subset: true });
  const regular = await doc.embedFont(a.regular, { subset: true });
  const logo = await doc.embedPng(a.logo);

  const page = doc.addPage([W, H]);
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: BLACK });

  // Double frame: brand blue, then a hairline inside it.
  page.drawRectangle({ x: 18, y: 18, width: W - 36, height: H - 36, borderColor: BLUE, borderWidth: 2 });
  page.drawRectangle({ x: 26, y: 26, width: W - 52, height: H - 52, borderColor: rgb(0.16, 0.16, 0.3), borderWidth: 0.6 });

  // The mark. The PNG is square with generous black margins, so it is drawn
  // larger than it reads and overlaps nothing.
  const L = 170;
  page.drawImage(logo, { x: (W - L) / 2, y: H - 30 - L, width: L, height: L });

  spaced(page, 'CERTIFICADO DE BUILDER · BUILDER CERTIFICATE', 392, bold, 10, BLUE_TEXT);
  centred(page, 'Se certifica que · This certifies that', 362, regular, 12, MUTED);
  centred(page, input.memberName, 318, bold, 40, WHITE);

  // Underline under the name, the width of a signature line.
  const line = Math.min(W - 200, Math.max(340, bold.widthOfTextAtSize(input.memberName, 40) + 40)) / 2;
  page.drawLine({ start: { x: W / 2 - line, y: 306 }, end: { x: W / 2 + line, y: 306 }, thickness: 0.8, color: BLUE });

  centred(page, 'construyó y publicó · built and shipped', 280, regular, 12, MUTED);
  centred(page, input.projectName, 248, bold, 26, BLUE_TEXT);
  centred(page, ev.title, 220, regular, 13, WHITE);
  centred(page, `${ev.venue} · ${ev.dates.es} · ${ev.dates.en}`, 201, regular, 10.5, MUTED);

  // Prizes, one pill each, side by side.
  if (input.honors.length > 0) {
    const labels = input.honors.map((h) => `${honorLabel(h, 'es')}  ·  ${honorLabel(h, 'en')}`);
    const size = 9.5;
    const padX = 12;
    const gap = 10;
    const widths = labels.map((l) => bold.widthOfTextAtSize(l, size) + padX * 2);
    let x = (W - (widths.reduce((s, w) => s + w, 0) + gap * (labels.length - 1))) / 2;
    labels.forEach((l, i) => {
      page.drawRectangle({ x, y: 160, width: widths[i], height: 22, color: BLUE });
      page.drawText(l, { x: x + padX, y: 167, size, font: bold, color: WHITE });
      x += widths[i] + gap;
    });
  }

  // Footer: issuer · date · credential.
  const [yy, mm, dd] = input.issueDate.split('-').map(Number);
  const dateEs = `${dd} de ${MONTHS_ES[mm - 1]} de ${yy}`;
  const colY = 78;
  const cols: [string, string][] = [
    ['EMITIDO POR · ISSUED BY', 'ETH Cali · ethcali.org'],
    ['FECHA · DATE', dateEs],
    ['ID DE CREDENCIAL · CREDENTIAL ID', input.credentialId],
  ];
  const colW = (W - 120) / 3;
  cols.forEach(([label, value], i) => {
    const cx = 60 + colW * i + colW / 2;
    page.drawText(label, { x: cx - bold.widthOfTextAtSize(label, 7.5) / 2, y: colY + 16, size: 7.5, font: bold, color: FAINT });
    page.drawText(value, { x: cx - regular.widthOfTextAtSize(value, 11) / 2, y: colY, size: 11, font: regular, color: WHITE });
  });

  const verify = `Verifica en · Verify at ${credentialUrl(input.credentialId)}`;
  centred(page, verify, 44, regular, 8.5, FAINT);

  return doc.save();
}
