/**
 * Transactional email for the swag store, over lib/email/resend.ts.
 *
 * Off until configured (RESEND_API_KEY + EMAIL_FROM): every send is then a
 * logged no-op, so the webhook behaves exactly as before. Always best-effort —
 * a failed email never fails the webhook that triggered it, because Shopify
 * retries a failing webhook and a retry would re-run the order write for the
 * sake of an email. The idempotency key (swag-claim-invite/<order>) means a
 * webhook redelivered within Resend's 24h window cannot send it twice.
 */
import { logger } from '../../utils/logger';
import { appUrl, escapeHtml, sendEmail, type SendResult } from '../email/resend';

export type { SendResult };

/**
 * After a card order is paid: the parcel is coming, and the digital
 * collectible is waiting at /swag/claim for the email that paid. One email per
 * Shopify order, however many lines it has.
 */
export async function sendClaimInvite(opts: { to: string; shopifyOrderId: string; items: string[] }): Promise<SendResult> {
  const link = `${appUrl()}/swag/claim?email=${encodeURIComponent(opts.to)}`;
  const orderNumber = opts.shopifyOrderId.split('/').pop() ?? opts.shopifyOrderId;
  const list = opts.items.map((i) => `<li>${escapeHtml(i)}</li>`).join('');

  const html = `<div style="font-family:system-ui,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#111">
<h1 style="font-size:20px;margin:0 0 12px">Gracias por tu compra en ETH Cali</h1>
<p>Recibimos tu pago. Imprimimos cada pieza bajo pedido: tu paquete se despacha en 1 a 10 días y te avisaremos con el número de guía.</p>
<ul>${list}</ul>
<p>Cada pieza viene con un <strong>coleccionable digital</strong>. Reclámalo con este mismo correo; tu cuenta y tu wallet se crean al entrar, sin costo.</p>
<p style="margin:24px 0"><a href="${escapeHtml(link)}" style="background:rgb(43,35,239);color:#fff;padding:12px 20px;border-radius:12px;text-decoration:none;font-weight:700">Reclamar mi coleccionable</a></p>
<p style="color:#555;font-size:13px">¿Preguntas? Responde a este correo o escribe a hola@ethcali.org.</p>
</div>`;
  const text = [
    'Gracias por tu compra en ETH Cali.',
    'Imprimimos cada pieza bajo pedido: tu paquete se despacha en 1 a 10 días y te avisaremos con el número de guía.',
    '',
    ...opts.items.map((i) => `- ${i}`),
    '',
    `Reclama tu coleccionable digital con este correo: ${link}`,
    '',
    '¿Preguntas? Escribe a hola@ethcali.org.',
  ].join('\n');

  const result = await sendEmail(`swag-claim-invite/${orderNumber}`, {
    to: [opts.to],
    subject: 'Tu pedido ETH Cali y tu coleccionable digital',
    html,
    text,
  });
  if (!result.sent) logger.info(`[swag/email] claim invite for ${opts.shopifyOrderId} not sent: ${result.reason}`);
  return result;
}
