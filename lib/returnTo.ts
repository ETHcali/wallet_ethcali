/**
 * `?next=` — where to go once you are signed in.
 *
 * Three pages (`/wallet`, `/faucet`, `/sybil`) bounce a signed-out visitor to
 * the landing page. Until now they bounced with nothing attached, so the
 * destination was lost: you asked for the faucet, signed in, and arrived at the
 * wallet. ethcali.org had the same problem from the other side — every link into
 * the app pointed either at the landing page or at a page that would throw you
 * back to it.
 *
 * A redirect target that comes out of a URL is attacker-controlled. Someone can
 * send `app.ethcali.org/?next=https://evil.example` to a user, who sees our
 * origin in the address bar, signs in, and gets forwarded somewhere else — a
 * textbook open redirect, and a good phishing primitive because the first hop is
 * genuinely us. So nothing is trusted: a value has to match this allowlist or it
 * does not survive.
 */

/**
 * Every route a `next` may name.
 *
 * `ethcaliorg/lib/links.ts` has the same list as its `AppRoute` union — it is the
 * other half of this contract. A route added here and not there is unreachable
 * from the site; one added there and not here falls back to `/wallet` silently,
 * which is the failure that is hard to spot. Change both.
 *
 * `/admin` is on the list but grants nothing: it is `AccessControl` on chain that
 * decides, and this only decides where a browser lands.
 */
const ALLOWED = [
  '/wallet',
  '/faucet',
  '/sybil',
  '/swag',
  '/donations',
  '/settings',
  // No page any more — next.config.js 308s it to /wallet — but ethcali.org
  // still links it, and a link the site sends must survive this list.
  '/profile',
  '/admin',
] as const;

export type AppRoute = (typeof ALLOWED)[number];

/** Where a visitor goes when `next` is absent or not honoured. */
export const DEFAULT_NEXT: AppRoute = '/wallet';

/**
 * Ordinary path characters, and nothing else.
 *
 * Anchored at both ends, so a value that smuggles in a colon, a backslash, a
 * percent-escape or a control character never reaches the comparison below —
 * those are the shapes that turn into a different origin once a browser has had
 * a go at normalising them.
 */
const PLAIN_PATH = /^\/[A-Za-z0-9\-._~/]*$/;

/**
 * A `next` query value, or null.
 *
 * Never returns anything but an allowlisted internal path. In particular it
 * cannot return an absolute URL, a protocol-relative `//host` (which a browser
 * reads as another origin), a traversal, or a path that merely starts with an
 * allowed string — `/wallet-evil`, `/wallet../admin` and `//evil.example` are
 * all rejected. `/wallet` passes, and so does `/admin/content`, because the
 * sub-pages of an allowed route are part of it.
 */
export function safeNext(raw: string | string[] | undefined): string | null {
  // Next gives an array when the parameter is repeated. Two answers to one
  // question is not a question we have to answer.
  if (typeof raw !== 'string' || raw.length === 0) return null;

  // Judge `/wallet?x=1` on `/wallet`, and carry nothing else forward.
  const path = raw.split('?')[0].split('#')[0];

  if (!PLAIN_PATH.test(path)) return null;
  // `..` cannot appear even inside a segment, and `//` cannot appear at all —
  // both are rejected by the origin test above at position 0, but not deeper in.
  if (path.includes('..') || path.includes('//')) return null;

  const allowed = ALLOWED.some((route) => path === route || path.startsWith(`${route}/`));
  return allowed ? path : null;
}
