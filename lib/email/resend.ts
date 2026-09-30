/**
 * Transactional email, through Resend's REST API. Server-only.
 *
 * Off until configured: with RESEND_API_KEY or EMAIL_FROM unset every send is
 * a no-op that says why, so a caller can log it or show it and nothing else
 * changes. Every send carries an idempotency key (`<event>/<entity>`), so a
 * retry within Resend's 24h window cannot deliver the same email twice.
 *
 *   RESEND_API_KEY   a sending-only key is enough
 *   EMAIL_FROM       e.g. "ETH Cali <hola@ethcali.org>" — the domain must be
 *                    verified in Resend or every send is a 403.
 *                    SWAG_EMAIL_FROM is read as a fallback (the store set it first).
 *   SWAG_APP_URL     optional, defaults to https://app.ethcali.org
 *
 * Attachments are fetched by Resend from a public URL (`path`), so the app
 * never buffers a PDF into the request; the URL must be reachable from the
 * internet, which rules out localhost.
 */

export interface SendResult {
  sent: boolean;
  id?: string;
  /** Why nothing was sent: not configured, or the API's error. */
  reason?: string;
}

export interface EmailPayload {
  to: string[];
  subject: string;
  html: string;
  text: string;
  attachments?: { filename: string; path: string }[];
}

/** The origin for links that leave the app: the same one on every email. */
export function appUrl(): string {
  return (process.env.SWAG_APP_URL?.trim() || 'https://app.ethcali.org').replace(/\/$/, '');
}

/** What is missing, or null when a send would go out. */
export function emailConfigError(): string | null {
  if (!process.env.RESEND_API_KEY?.trim()) return 'RESEND_API_KEY is not set';
  if (!(process.env.EMAIL_FROM ?? process.env.SWAG_EMAIL_FROM)?.trim()) return 'EMAIL_FROM is not set';
  return null;
}

export const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export async function sendEmail(idempotencyKey: string, payload: EmailPayload): Promise<SendResult> {
  const missing = emailConfigError();
  if (missing) return { sent: false, reason: `email not configured: ${missing}` };
  const key = process.env.RESEND_API_KEY!.trim();
  const from = (process.env.EMAIL_FROM ?? process.env.SWAG_EMAIL_FROM)!.trim();

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotencyKey,
      },
      body: JSON.stringify({
        from,
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
        text: payload.text,
        ...(payload.attachments?.length ? { attachments: payload.attachments } : {}),
      }),
    });
    const body = (await res.json().catch(() => ({}))) as { id?: string; message?: string };
    if (!res.ok) return { sent: false, reason: `${res.status} ${body.message ?? 'Resend refused the email'}` };
    return { sent: true, id: body.id };
  } catch (e) {
    return { sent: false, reason: e instanceof Error ? e.message : 'network error' };
  }
}
