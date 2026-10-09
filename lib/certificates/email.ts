/**
 * The certificate email — server-only.
 *
 * Sent once per certificate, after its NFT is minted: it names the token, links
 * the credential page (LinkedIn button, download) and the token on OpenSea and
 * Etherscan, and attaches the diploma PDF by URL — the same file
 * /api/certificates/<id>/pdf serves, so the attachment and the download are
 * one file. In Spanish, like the claim page: it exists for one room of
 * Colombian builders.
 *
 * Addressed to every email the builder used (Devfolio's and Luma's): whichever
 * inbox they read, the certificate arrives, and either address signs them in.
 * Idempotency key certificate-issued/<credential_id>, so a retry within
 * Resend's 24h window cannot deliver it twice.
 */
import {
  achievementEs,
  credentialPdfPath,
  credentialUrl,
  honorLabel,
  linkedInAddUrl,
  roleCredentialName,
  type CertEvent,
  type CertRole,
  type Honor,
} from './events';
import { etherscanTokenUrl, openseaUrl } from './nft';
import { appUrl, escapeHtml, sendEmail, type SendResult } from '../email/resend';
import { truncateAddress } from '../../utils/linkedAccounts';

export interface CertificateEmailInput {
  /** The event as the database has it (eventStore.loadCertEvent). */
  ev: CertEvent;
  role: CertRole;
  memberName: string;
  projectName: string | null;
  credentialId: string;
  issueDate: string;
  honors: Honor[];
  tokenId: string;
  /** Lowercase address the NFT went to. */
  wallet: string;
  emails: string[];
}

const BLUE = 'rgb(43,35,239)';

const dedupe = (xs: string[]) => Array.from(new Set(xs.map((x) => x.trim().toLowerCase()).filter(Boolean)));

/** Subject and bodies, without sending — what the dry run shows. */
export function renderCertificateEmail(c: CertificateEmailInput) {
  const ev = c.ev;
  const eventName = roleCredentialName(ev, c.role);
  // "Construiste Phycos en EAG …" / "Organizaste EAG …" — second person, no name.
  const did = achievementEs({ role: c.role, memberName: c.memberName, projectName: c.projectName }, ev);
  const page = credentialUrl(c.credentialId);
  const pdf = `${appUrl()}${credentialPdfPath(c.credentialId)}?download=1`;
  const opensea = openseaUrl(c.tokenId);
  const etherscan = etherscanTokenUrl(c.tokenId);
  const linkedin = linkedInAddUrl(ev, c.credentialId, c.issueDate, c.role);
  const honors = c.honors.map((h) => honorLabel(h, 'es'));
  const firstName = c.memberName.trim().split(/\s+/)[0] || c.memberName;
  /** The signed-in view: their NFT, their wallet, their credential. Sign-in is this email. */
  const app = `${appUrl()}/certificate`;
  const shortWallet = truncateAddress(c.wallet);
  /** The exact addresses that sign in to see it: the primary first. Any of them works. */
  const logins = dedupe(c.emails);
  const loginsHtml = logins.map((e) => `<strong>${escapeHtml(e)}</strong>`).join(' o ');
  const loginsText = logins.join(' o ');
  /** Share intents are plain URLs, so they work inside an email; a copy button cannot. */
  const shareText =
    c.role === 'builder' && c.projectName
      ? `Construí ${c.projectName} en ${ev.headline} y ETH Cali lo certifica.`
      : `Fui parte del equipo del ${ev.headline} y ETH Cali lo certifica.`;
  const share: [string, string][] = [
    ['LinkedIn', `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(page)}`],
    ['X', `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(page)}`],
    ['WhatsApp', `https://wa.me/?text=${encodeURIComponent(`${shareText} ${page}`)}`],
  ];

  const subject = `Tu certificado ETH Cali · ${eventName}`;

  const button = (href: string, label: string, primary = false) =>
    `<a href="${escapeHtml(href)}" style="display:inline-block;margin:0 8px 8px 0;padding:12px 20px;border-radius:12px;text-decoration:none;font-weight:700;${
      primary ? `background:${BLUE};color:#fff` : `border:1px solid ${BLUE};color:${BLUE}`
    }">${escapeHtml(label)}</a>`;

  const html = `<div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#111">
<h1 style="font-size:20px;margin:0 0 12px">Tu certificado está listo, ${escapeHtml(firstName)}</h1>
<p>${escapeHtml(did)} (${escapeHtml(ev.location)}, ${escapeHtml(ev.eventDates)}), y ETH Cali lo certifica.</p>
${honors.length ? `<p>${honors.map((h) => `🏆 <strong>${escapeHtml(h)}</strong>`).join('<br>')}</p>` : ''}
<p>Tu diploma va adjunto en PDF. El certificado también es un <strong>NFT en Ethereum</strong> (token #${escapeHtml(
    c.tokenId
  )}, no transferible), y ya está en tu wallet <code>${escapeHtml(shortWallet)}</code>, la que quedó guardada con tu cuenta al reclamar.</p>
<p style="padding:12px 14px;border-radius:12px;background:#f5f5fa;border:1px solid #d9d9e3">Para verlo, entra a <a href="${escapeHtml(app)}" style="color:${BLUE}">app.ethcali.org/certificate</a> con ${loginsHtml}. Te llega un código a ese correo, sin contraseña. Ahí tienes tu NFT, tu wallet y tu credencial en un solo lugar.</p>
<p style="margin:24px 0 8px">${button(app, 'Ver mi certificado en la app', true)}${linkedin ? button(linkedin, 'Agregar a LinkedIn') : ''}</p>
<p style="margin:0 0 24px">${button(opensea, 'Ver en OpenSea')}${button(etherscan, 'Ver en Etherscan')}</p>
<div style="margin:0 0 24px;padding:16px;border:1px solid #d9d9e3;border-radius:12px;background:#f5f5fa">
<p style="margin:0 0 6px;font-size:12px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:#555">Tu credencial pública</p>
<p style="margin:0 0 10px;font-size:14px;color:#333">Este es el enlace que va en tu LinkedIn y el que puedes compartir con quien quieras. No requiere cuenta.</p>
<p style="margin:0 0 12px;word-break:break-all"><a href="${escapeHtml(page)}" style="font-family:ui-monospace,Menlo,monospace;font-size:14px;color:${BLUE};text-decoration:underline">${escapeHtml(page)}</a></p>
<p style="margin:0;font-size:13px">Compartir: ${share.map(([label, href]) => `<a href="${escapeHtml(href)}" style="color:${BLUE};font-weight:700;margin-right:14px">${escapeHtml(label)}</a>`).join('')}</p>
</div>
<p style="color:#555;font-size:13px">¿Preguntas? Responde a este correo o escribe a hola@ethcali.org.</p>
</div>`;

  const text = [
    `Tu certificado está listo, ${firstName}.`,
    '',
    `${did} (${ev.location}, ${ev.eventDates}), y ETH Cali lo certifica.`,
    ...honors.map((h) => `- ${h}`),
    '',
    `Tu diploma va adjunto en PDF. El certificado también es un NFT en Ethereum (token #${c.tokenId}, no transferible), y ya está en tu wallet ${shortWallet}, la que quedó guardada con tu cuenta al reclamar.`,
    '',
    `Para verlo, entra a ${app} con ${loginsText}. Te llega un código a ese correo, sin contraseña.`,
    'Ahí tienes tu NFT, tu wallet y tu credencial en un solo lugar.',
    '',
    ...(linkedin ? [`Agregar a LinkedIn: ${linkedin}`] : []),
    `OpenSea: ${opensea}`,
    `Etherscan: ${etherscan}`,
    `Descargar el diploma: ${pdf}`,
    '',
    'Tu credencial pública — el enlace que va en tu LinkedIn y el que puedes compartir con quien quieras, sin cuenta:',
    page,
    ...share.map(([label, href]) => `Compartir en ${label}: ${href}`),
    '¿Preguntas? Escribe a hola@ethcali.org.',
  ].join('\n');

  return {
    subject,
    html,
    text,
    attachments: [{ filename: `ETHCali-certificado-${c.credentialId}.pdf`, path: pdf }],
  };
}


/** The real one: to every address of the builder, keyed by credential. */
export function sendCertificateEmail(c: CertificateEmailInput): Promise<SendResult> {
  return sendEmail(`certificate-issued/${c.credentialId}`, { to: dedupe(c.emails), ...renderCertificateEmail(c) });
}

/**
 * The same email, to an operator instead of the builder, so they can see it
 * before the batch goes out. Keyed by recipient too, so one operator can test
 * one certificate once a day, and another operator still can.
 */
export function sendCertificateEmailTest(c: CertificateEmailInput, to: string): Promise<SendResult> {
  const r = renderCertificateEmail(c);
  return sendEmail(`certificate-test/${c.credentialId}/${to.toLowerCase()}`, {
    to: [to],
    ...r,
    subject: `[Prueba] ${r.subject}`,
  });
}
