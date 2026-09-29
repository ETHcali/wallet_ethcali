/**
 * The builder diploma as a PDF — server-only (reads fonts and the logo from disk).
 *
 * One A4 landscape page, paper-white like a diploma: ETH Cali's mark as the
 * issuer's seal at the top, the builder's name in Sarun Pro, and the event's
 * sponsors along the bottom under a hairline rule.
 *
 * It is a template, not a one-off: everything event-specific (title, venue,
 * dates, sponsors) comes from CERT_EVENTS in ./events, so the next hackathon
 * is a new entry there and its logos in ./logos, and nothing here changes. It is what the certificate email attaches and
 * what /certificate/<id> downloads, from this one function, so the two are
 * always the same file. The onchain NFT comes later; this is the paper copy.
 *
 * The font and logo paths are listed in next.config.js
 * (outputFileTracingIncludes) so they ship with the function on Vercel.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { PDFArray, PDFDocument, PDFName, PDFString, rgb, type PDFFont, type PDFPage } from 'pdf-lib';
import QRCode from 'qrcode';
import fontkit from '@pdf-lib/fontkit';
import { CERT_EVENTS, credentialUrl, honorLabel, type Honor } from './events';
import { CERT_ADDRESS, etherscanTokenUrl } from './nft';

export interface DiplomaInput {
  event: string;
  memberName: string;
  projectName: string;
  credentialId: string;
  issueDate: string; // YYYY-MM-DD
  honors: Honor[];
  /** The token this certificate is (or will be, once minted as planned). */
  tokenId: string | null;
}

const W = 842;
const H = 595;

// Paper, ink, and the one brand blue. Greys are the ink at lower strength.
const PAPER = rgb(0.992, 0.992, 1);
const INK = rgb(12 / 255, 13 / 255, 22 / 255);
const WHITE = rgb(1, 1, 1);
const BLUE = rgb(43 / 255, 35 / 255, 239 / 255);
const MUTED = rgb(0.36, 0.37, 0.45);
const FAINT = rgb(0.55, 0.56, 0.63);


// TTF, not the design-tokens woff2: @pdf-lib/fontkit mis-decodes woff2 glyphs
// (every character renders as a dot). Same files ethcali.org publishes in
// public/branding/fonts.
const FONT_DIR = path.join(process.cwd(), 'lib/certificates/fonts');
// The full mark (frame + Ethereum diamond), cropped from logo_eth_cali.png
// without the ETH·CO CALI text. logoethcali.png is the frame alone and read
// as an empty outline on the paper.
const LOGO = path.join(process.cwd(), 'public/logo_eth_cali_mark.png');
const SPONSOR_DIR = path.join(process.cwd(), 'lib/certificates/logos');
const sponsorFiles = new Map<string, Buffer>();
function sponsorFile(file: string): Buffer {
  if (!sponsorFiles.has(file)) sponsorFiles.set(file, readFileSync(path.join(SPONSOR_DIR, file)));
  return sponsorFiles.get(file) as Buffer;
}

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
function centred(page: PDFPage, text: string, y: number, font: PDFFont, size: number, color = INK, maxWidth = W - 160) {
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

/** A clickable URI annotation over a rectangle of the page. */
function addLink(doc: PDFDocument, page: PDFPage, url: string, r: { x: number; y: number; w: number; h: number }) {
  const annot = doc.context.obj({
    Type: 'Annot',
    Subtype: 'Link',
    Rect: [r.x, r.y, r.x + r.w, r.y + r.h],
    Border: [0, 0, 0],
    A: { Type: 'Action', S: 'URI', URI: PDFString.of(url) },
  });
  const ref = doc.context.register(annot);
  const existing = page.node.lookupMaybe(PDFName.of('Annots'), PDFArray);
  if (existing) existing.push(ref);
  else page.node.set(PDFName.of('Annots'), doc.context.obj([ref]));
}


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
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: PAPER });

  // Frame: a heavy brand-blue rule, a hairline inside it.
  page.drawRectangle({ x: 16, y: 16, width: W - 32, height: H - 32, borderColor: BLUE, borderWidth: 3 });
  page.drawRectangle({ x: 25, y: 25, width: W - 50, height: H - 50, borderColor: rgb(0.8, 0.8, 0.9), borderWidth: 0.6 });

  // Issuer: the ETH Cali mark, centred at the top.
  const logoH = 100;
  const logoW = (logo.width / logo.height) * logoH;
  page.drawImage(logo, { x: (W - logoW) / 2, y: H - 40 - logoH, width: logoW, height: logoH });

  spaced(page, 'BUILDER CERTIFICATE', 426, bold, 11, BLUE, 3.2);
  centred(page, 'This certifies that', 402, regular, 12, MUTED);
  centred(page, input.memberName, 362, bold, 40, INK);

  // Underline under the name, the width of a signature line.
  const line = Math.min(W - 200, Math.max(340, bold.widthOfTextAtSize(input.memberName, 40) + 40)) / 2;
  page.drawLine({ start: { x: W / 2 - line, y: 350 }, end: { x: W / 2 + line, y: 350 }, thickness: 0.9, color: BLUE });

  centred(page, 'built and shipped', 327, regular, 12, MUTED);
  centred(page, input.projectName, 298, bold, 26, BLUE);
  centred(page, `at ${ev.headline}`, 274, bold, 13, INK);
  centred(page, ev.chapter, 257, regular, 10.5, MUTED);

  // Prizes, one pill each, side by side.
  if (input.honors.length > 0) {
    const labels = input.honors.map((h) => honorLabel(h, 'en'));
    const size = 9.5;
    const padX = 12;
    const gap = 10;
    const widths = labels.map((l) => bold.widthOfTextAtSize(l, size) + padX * 2);
    let x = (W - (widths.reduce((t, w) => t + w, 0) + gap * (labels.length - 1))) / 2;
    labels.forEach((l, i) => {
      page.drawRectangle({ x, y: 219, width: widths[i], height: 22, color: BLUE });
      page.drawText(l, { x: x + padX, y: 226, size, font: bold, color: WHITE });
      x += widths[i] + gap;
    });
  }

  // Issuer · date · credential.
  // Two rows: the event (who issued, where, when it ran, which credential),
  // then the token (chain, contract, id). No issue date: a diploma is pinned
  // before its mint, so it only carries what cannot change; the exact moment
  // of issue is the block's, shown live on the credential page and Etherscan.
  const row = (y: number, cells: [string, string][]) => {
    const colW = (W - 100) / cells.length;
    cells.forEach(([label, value], i) => {
      const cx = 50 + colW * i + colW / 2;
      page.drawText(label, { x: cx - bold.widthOfTextAtSize(label, 7) / 2, y: y + 14, size: 7, font: bold, color: FAINT });
      let size = 10.5;
      while (size > 7 && regular.widthOfTextAtSize(value, size) > colW - 8) size -= 0.5;
      page.drawText(value, { x: cx - regular.widthOfTextAtSize(value, size) / 2, y, size, font: regular, color: INK });
    });
  };
  row(176, [
    ['ISSUED BY', 'ETH CALI'],
    ['LOCATION', ev.location],
    ['EVENT DATES', ev.eventDates],
    ['CREDENTIAL ID', input.credentialId],
  ]);
  row(137, [
    ['BLOCKCHAIN', 'Ethereum Mainnet'],
    ['CONTRACT', `${CERT_ADDRESS.slice(0, 6)}…${CERT_ADDRESS.slice(-4)}`],
    ['TOKEN ID', input.tokenId ? `#${input.tokenId}` : '—'],
  ]);

  // Verification: a QR to the token on Etherscan — the on-chain proof — in the
  // top-right corner, and a link over it, so a printed copy scans and a digital
  // one clicks. Before a token id exists it points at the credential page.
  const verifyUrl = input.tokenId ? etherscanTokenUrl(input.tokenId) : credentialUrl(input.credentialId);
  const qrPng = await QRCode.toBuffer(verifyUrl, { type: 'png', errorCorrectionLevel: 'M', margin: 1, width: 400, color: { dark: '#0C0D16', light: '#FDFDFF' } });
  const qr = await doc.embedPng(qrPng);
  const Q = 64;
  const qx = W - 40 - Q;
  const qy = H - 44 - Q;
  page.drawImage(qr, { x: qx, y: qy, width: Q, height: Q });
  const cap = 'SCAN TO VERIFY';
  page.drawText(cap, { x: qx + (Q - bold.widthOfTextAtSize(cap, 5.5)) / 2, y: qy - 9, size: 5.5, font: bold, color: FAINT });
  addLink(doc, page, verifyUrl, { x: qx, y: qy - 11, w: Q, h: Q + 11 });

  // Sponsors: a hairline rule, a label, one row of logos on the paper.
  if (ev.sponsors.length > 0) {
    const ruleY = 116;
    page.drawLine({ start: { x: 60, y: ruleY }, end: { x: W - 60, y: ruleY }, thickness: 0.6, color: rgb(0.82, 0.82, 0.9) });
    spaced(page, 'WITH THE SUPPORT OF', ruleY - 18, bold, 7.5, FAINT, 1.8);
    const imgs = await Promise.all(
      ev.sponsors.map(async (sp) => {
        const bytes = sponsorFile(sp.file);
        const img = sp.file.endsWith('.jpg') ? await doc.embedJpg(bytes) : await doc.embedPng(bytes);
        return { img, h: sp.height, w: (img.width / img.height) * sp.height };
      })
    );
    const gap = 36;
    const rowMid = 62;
    let x = (W - (imgs.reduce((t, i) => t + i.w, 0) + gap * (imgs.length - 1))) / 2;
    for (const i of imgs) {
      page.drawImage(i.img, { x, y: rowMid - i.h / 2, width: i.w, height: i.h });
      x += i.w + gap;
    }
  }

  return doc.save();
}
