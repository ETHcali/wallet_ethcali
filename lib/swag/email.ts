/**
 * Transactional email for the swag store, through Resend's REST API.
 *
 * Off until configured: with RESEND_API_KEY or SWAG_EMAIL_FROM unset every
 * send is a logged no-op, so the webhook behaves exactly as before. Always
 * best-effort — a failed email never fails the webhook that triggered it,
 * because Shopify retries a failing webhook and a retry would re-run the
 * order write for the sake of an email.
 *
 *   RESEND_API_KEY   sending-only key is enough
 *   SWAG_EMAIL_FROM  e.g. "ETH Cali <tienda@ethcali.org>" — the domain must be
 *                    verified in Resend or every send is a 403
 *   SWAG_APP_URL     optional, defaults to https://app.ethcali.org
 *
 * Each send carries an idempotency key (`<event>/<entity>`), so a webhook
 * redelivered within Resend's 24h window cannot send the same email twice.
 */
import { logger } from '../../utils/logger';

export interface SendResult {
  sent: boolean;
  id?: string;
  /** Why nothing was sent: not configured, or the API's error. */
  reason?: string;
}

function appUrl(): string {
  return (process.env.SWAG_APP_URL?.trim() || 'https://app.ethcali.org').replace(/\/$/, '');
}

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

async function send(
  idempotencyKey: string,
  payload: { to: string; subject: string; html: string; text: string }
): Promise<SendResult> {
  const key = process.env.RESEND_API_KEY?.trim();
  const from = process.env.SWAG_EMAIL_FROM?.trim();
  if (!key || !from) return { sent: false, reason: 'email not configured' };

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotencyKey,
      },
      body: JSON.stringify({ from, to: [payload.to], subject: payload.subject, html: payload.html, text: payload.text }),
    });
    const body = (await res.json().catch(() => ({}))) as { id?: string; message?: string };
    if (!res.ok) return { sent: false, reason: `${res.status} ${body.message ?? 'Resend refused the email'}` };
    return { sent: true, id: body.id };
  } catch (e) {
    return { sent: false, reason: e instanceof Error ? e.message : 'network error' };
  }
}

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

  const result = await send(`swag-claim-invite/${orderNumber}`, {
    to: opts.to,
    subject: 'Tu pedido ETH Cali y tu coleccionable digital',
    html,
    text,
  });
  if (!result.sent) logger.info(`[swag/email] claim invite for ${opts.shopifyOrderId} not sent: ${result.reason}`);
  return result;
}
