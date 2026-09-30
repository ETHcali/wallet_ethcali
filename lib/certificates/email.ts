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
import { CERT_EVENTS, credentialPdfPath, credentialUrl, honorLabel, linkedInAddUrl, type Honor } from './events';
import { etherscanTokenUrl, openseaUrl } from './nft';
import { appUrl, escapeHtml, sendEmail, type SendResult } from '../email/resend';
import { truncateAddress } from '../../utils/linkedAccounts';

export interface CertificateEmailInput {
  event: string;
  memberName: string;
  projectName: string;
  credentialId: string;
  issueDate: string;
  honors: Honor[];
  tokenId: string;
  /** Lowercase address the NFT went to. */
  wallet: string;
  emails: string[];
}

const BLUE = 'rgb(43,35,239)';

/** Subject and bodies, without sending — what the dry run shows. */
export function renderCertificateEmail(c: CertificateEmailInput) {
  const ev = CERT_EVENTS[c.event];
  const eventName = ev?.credentialName ?? c.event;
  const page = credentialUrl(c.credentialId);
  const pdf = `${appUrl()}${credentialPdfPath(c.credentialId)}?download=1`;
  const opensea = openseaUrl(c.tokenId);
  const etherscan = etherscanTokenUrl(c.tokenId);
  const linkedin = linkedInAddUrl(c.event, c.credentialId, c.issueDate);
  const honors = c.honors.map((h) => honorLabel(h, 'es'));
  const firstName = c.memberName.trim().split(/\s+/)[0] || c.memberName;
  /** The signed-in view: their NFT, their wallet, their credential. Sign-in is this email. */
  const app = `${appUrl()}/certificate`;
  const shortWallet = truncateAddress(c.wallet);

  const subject = `Tu certificado ETH Cali · ${eventName}`;

  const button = (href: string, label: string, primary = false) =>
    `<a href="${escapeHtml(href)}" style="display:inline-block;margin:0 8px 8px 0;padding:12px 20px;border-radius:12px;text-decoration:none;font-weight:700;${
      primary ? `background:${BLUE};color:#fff` : `border:1px solid ${BLUE};color:${BLUE}`
    }">${escapeHtml(label)}</a>`;

  const html = `<div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#111">
<h1 style="font-size:20px;margin:0 0 12px">Tu certificado está listo, ${escapeHtml(firstName)}</h1>
<p>Construiste <strong>${escapeHtml(c.projectName)}</strong> en ${escapeHtml(ev?.headline ?? c.event)}${
    ev ? ` (${escapeHtml(ev.location)}, ${escapeHtml(ev.eventDates)})` : ''
  }, y ETH Cali lo certifica.</p>
${honors.length ? `<p>${honors.map((h) => `🏆 <strong>${escapeHtml(h)}</strong>`).join('<br>')}</p>` : ''}
<p>Tu diploma va adjunto en PDF. El certificado también es un <strong>NFT en Ethereum</strong> (token #${escapeHtml(
    c.tokenId
  )}, no transferible), y ya está en tu wallet <code>${escapeHtml(shortWallet)}</code>, la que quedó guardada con tu cuenta al reclamar.</p>
<p>Para verlo, entra a la app con <strong>este mismo correo</strong>: te llega un código, sin contraseña. Ahí tienes tu NFT, tu wallet y tu credencial en un solo lugar.</p>
<p style="margin:24px 0 8px">${button(app, 'Ver mi certificado en la app', true)}${linkedin ? button(linkedin, 'Agregar a LinkedIn') : ''}</p>
<p style="margin:0 0 24px">${button(opensea, 'Ver en OpenSea')}${button(etherscan, 'Ver en Etherscan')}</p>
<p style="color:#555;font-size:13px">Tu credencial pública, para compartir: <a href="${escapeHtml(page)}" style="color:#555">${escapeHtml(page)}</a></p>
<p style="color:#555;font-size:13px">¿Preguntas? Responde a este correo o escribe a hola@ethcali.org.</p>
</div>`;

  const text = [
    `Tu certificado está listo, ${firstName}.`,
    '',
    `Construiste ${c.projectName} en ${ev?.headline ?? c.event}${ev ? ` (${ev.location}, ${ev.eventDates})` : ''}, y ETH Cali lo certifica.`,
    ...honors.map((h) => `- ${h}`),
    '',
    `Tu diploma va adjunto en PDF. El certificado también es un NFT en Ethereum (token #${c.tokenId}, no transferible), y ya está en tu wallet ${shortWallet}, la que quedó guardada con tu cuenta al reclamar.`,
    '',
    `Para verlo, entra a la app con este mismo correo (te llega un código, sin contraseña): ${app}`,
    'Ahí tienes tu NFT, tu wallet y tu credencial en un solo lugar.',
    '',
    ...(linkedin ? [`Agregar a LinkedIn: ${linkedin}`] : []),
    `OpenSea: ${opensea}`,
    `Etherscan: ${etherscan}`,
    `Descargar el diploma: ${pdf}`,
    '',
    `Tu credencial pública, para compartir: ${page}`,
    '¿Preguntas? Escribe a hola@ethcali.org.',
  ].join('\n');

  return {
    subject,
    html,
    text,
    attachments: [{ filename: `ETHCali-certificado-${c.credentialId}.pdf`, path: pdf }],
  };
}

const dedupe = (xs: string[]) => Array.from(new Set(xs.map((x) => x.trim().toLowerCase()).filter(Boolean)));

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
