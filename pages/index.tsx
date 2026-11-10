import React from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Loading from '../components/shared/Loading';
import { safeNext, DEFAULT_NEXT } from '../lib/returnTo';
import Navigation from '../components/Navigation';
import { DEFAULT_CHAIN } from '../config/chains';
import Link from 'next/link';
import {
  ArrowRightIcon,
  GitHubIcon,
  InstagramIcon,
  LinkedInIcon,
  TelegramIcon,
  XIcon,
  YouTubeIcon,
} from '../components/shared/icons';

/* UX_GUIDELINES.md §1 — Landing (signed out): display headline, one-paragraph
   promise, one primary CTA, then the app's areas as numbered cells in a
   hairline grid, an infrastructure logo strip, the network line and the footer.

   Every cell opens its part of the app. The list mirrors `MAIN_NAV` in
   components/Navigation.tsx and `APP_AREAS` in ethcaliorg/content/app.ts —
   add an area there and it belongs here too.

   `signIn` says how the cell gets you there. Wallet, identity, faucet and
   certificates need a session, so the cell signs you in and carries the
   destination through `?next=`. Swag and donations read fine signed out, so
   they are plain links: a login wall in front of a store is a click for nothing. */

type Area = {
  n: string;
  href: string;
  title: string;
  body: string;
  action: string;
  signIn: boolean;
  /** One of a set rendered together, so the six read as a family. public/images/landing/ */
  image: string;
};

const AREAS: Area[] = [
  {
    n: '01',
    href: '/wallet',
    title: 'A wallet that pays its own gas',
    body: `Send, receive and swap ETH, USDC, USDT and EURC on ${DEFAULT_CHAIN.name}. The community sponsors the gas; the keys stay yours.`,
    action: 'Open your wallet',
    signIn: true,
    image: '/images/landing/wallet.webp',
  },
  {
    n: '02',
    href: '/sybil',
    title: 'Identity without surveillance',
    body: 'Prove you are one person with a zero-knowledge passport proof, then claim your name.ethcali.eth. We store a nullifier, never a name.',
    action: 'Verify yourself',
    signIn: true,
    image: '/images/landing/identity.webp',
  },
  {
    n: '03',
    href: '/faucet',
    title: 'A faucet for verified humans',
    body: 'When ETH Cali opens a vault for an event or a hackathon, verified people claim a little ETH for gas without asking anyone.',
    action: 'Go to the faucet',
    signIn: true,
    image: '/images/landing/faucet.webp',
  },
  {
    n: '04',
    href: '/certificate',
    title: 'Certificates you own',
    body: 'Builders and organisers of ETH Cali events receive a soulbound certificate on Ethereum, with a PDF and a one-click LinkedIn credential.',
    action: 'See your certificates',
    signIn: true,
    image: '/images/landing/certificates.webp',
  },
  {
    n: '05',
    href: '/swag',
    title: 'Swag, paid by card or USDC',
    body: 'Every design is a token on Ethereum. Pay by card, or in USDC for less, and the token is yours either way.',
    action: 'Browse the store',
    signIn: false,
    image: '/images/landing/swag.webp',
  },
  {
    n: '06',
    href: '/donations',
    title: 'Donations you can verify',
    body: 'Fund ETH Cali campaigns in ETH or USDC, straight to the community Safe. Totals and the donor wall are read from the chain.',
    action: 'See the campaigns',
    signIn: false,
    image: '/images/landing/donations.webp',
  },
];

const INFRA = [
  { src: '/infraused/privy.png', name: 'Privy' },
  { src: '/infraused/zkpassportid.png', name: 'ZKPassport' },
  { src: '/infraused/ens.png', name: 'ENS' },
  { src: '/infraused/lifiprotocol.png', name: 'LI.FI' },
  { src: '/infraused/poaplogo.png', name: 'POAP' },
  { src: '/infraused/opensea.png', name: 'OpenSea' },
];


/**
 * What the sign-in button says, per destination.
 *
 * A visitor sent here from ethcali.org's "Donate" link arrives at a page whose
 * only button said "Open your wallet", which is not what they clicked and reads
 * as the wrong page. The button should name the thing they asked for; the wallet
 * is what they get either way, but that is not the errand they are on.
 *
 * Keyed by the routes `lib/returnTo.ts` allows. Any route without an entry falls
 * back to the wallet wording, so adding one to the allowlist cannot break this.
 */
const DESTINATIONS: Record<string, { cta: string; opening: string }> = {
  '/wallet': { cta: 'Open your wallet', opening: 'Opening your wallet…' },
  '/faucet': { cta: 'Sign in to use the faucet', opening: 'Opening the faucet…' },
  '/sybil': { cta: 'Sign in to verify your identity', opening: 'Opening identity…' },
  '/swag': { cta: 'Sign in to shop', opening: 'Opening the store…' },
  '/donations': { cta: 'Sign in to donate', opening: 'Opening donations…' },
  '/settings': { cta: 'Sign in to open settings', opening: 'Opening settings…' },
  '/admin': { cta: 'Sign in to the admin area', opening: 'Opening admin…' },
};

const SOCIAL = [
  { href: 'https://twitter.com/ethcali_org', label: 'X', Icon: XIcon },
  { href: 'https://www.linkedin.com/company/eth-cali/', label: 'LinkedIn', Icon: LinkedInIcon },
  { href: 'https://instagram.com/ethcali.eth', label: 'Instagram', Icon: InstagramIcon },
  { href: 'https://www.youtube.com/@ethereumcali', label: 'YouTube', Icon: YouTubeIcon },
  { href: 'https://github.com/ethcali', label: 'GitHub', Icon: GitHubIcon },
  { href: 'https://t.me/ethcali', label: 'Telegram', Icon: TelegramIcon },
];

const COMMUNITY = [
  { href: 'https://discord.gg/GvkDmHnDuE', label: 'Discord' },
  { href: 'https://t.me/ethcali', label: 'Telegram' },
  { href: 'https://www.meetup.com/members/378305434/group/36837943/', label: 'Meetup' },
  { href: 'https://lu.ma/ethcali', label: 'Luma' },
];

const WEB3 = [
  { href: 'https://app.ens.domains/name/ethereumcali.eth/details', label: 'ENS' },
  { href: 'https://opensea.io/es/ETHCALI', label: 'OpenSea' },
  { href: 'https://zora.co/@ethcali', label: 'Zora' },
  { href: 'https://farcaster.xyz/ethereumcali', label: 'Farcaster' },
  { href: 'https://mirror.xyz/0x55C9fbf09c056ACac807CD674e34F1F8Df0E711d', label: 'Mirror' },
];

const footerLink =
  'text-sm text-content-muted transition-colors duration-fast hover:text-content-primary';

export default function Home() {
  const { login, ready, authenticated } = usePrivy();
  const router = useRouter();

  // Where this visit was actually headed.
  //
  // `/wallet`, `/faucet` and `/sybil` send a signed-out visitor here, and
  // ethcali.org links in through `?next=` as well. Without this the destination
  // was lost at the door: you asked for the faucet and arrived at the wallet.
  // `safeNext` returns null for anything not on its allowlist, so an untrusted
  // value degrades to the wallet rather than redirecting off-site.
  const next = safeNext(router.query.next) ?? DEFAULT_NEXT;
  const destination = DESTINATIONS[next] ?? DESTINATIONS[DEFAULT_NEXT];

  // Auto-redirect authenticated users to where they were going.
  // The Privy session token alone is enough — no need to wait for a wallet object.
  //
  // `replace`, not `push`: this page only ever bounces an authenticated visitor
  // onward, so leaving it in history means Back lands on a page that immediately
  // throws you forward again and you can never leave the app with the Back
  // button. `router.isReady` because `query.next` is empty on the first render
  // of a static page — without the guard every deep link redirects to the
  // default before the parameter has arrived.
  React.useEffect(() => {
    if (ready && authenticated && router.isReady) {
      router.replace(next);
    }
  }, [ready, authenticated, router, next]);

  // A cell that needs a session: record where it leads, then open Privy. The
  // redirect effect above reads `next` once the session lands. Shallow, so the
  // page does not re-run its data fetching for a query change.
  const signInTo = (href: string) => {
    router.replace({ pathname: '/', query: { next: href } }, undefined, { shallow: true });
    login();
  };

  // Loading timeout state
  const [loadingTimeout, setLoadingTimeout] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (!ready) {
        setLoadingTimeout(true);
      }
    }, 10000);
    return () => clearTimeout(timer);
  }, [ready]);

  if (!ready) {
    if (loadingTimeout) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-surface-void p-6 text-content-primary">
          <div className="max-w-sm text-center">
            <h2 className="mb-2 text-xl font-bold">The wallet is taking too long to load.</h2>
            <p className="mb-6 text-content-muted">Nothing was sent. Reload to try again.</p>
            <button
              onClick={() => window.location.reload()}
              className="min-h-tap rounded-control bg-eth-blue px-6 font-semibold text-on-brand transition-colors duration-base hover:bg-eth-blue-lift"
            >
              Reload
            </button>
          </div>
        </div>
      );
    }
    return <Loading fullScreen={true} text="Loading…" />;
  }

  if (authenticated) {
    return (
      <div className="min-h-screen bg-surface-void">
        <Navigation />
        <Loading fullScreen={true} text={destination.opening} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-void text-content-primary">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        {/* The only gradient the brand allows: ultramarine to transparent, ≤16%. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(60% 55% at 78% 18%, rgb(var(--eth-blue-rgb) / 0.16), transparent 70%)',
          }}
        />
        <div className="relative mx-auto max-w-page px-4 pb-12 pt-8 sm:px-6 sm:pb-16 sm:pt-16 lg:pb-24">
          <Image
            src="/logotethcali.png"
            alt="ETH Cali"
            width={200}
            height={96}
            className="mb-10 h-8 w-auto sm:mb-12 sm:h-10"
            priority
            unoptimized
          />
          <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.16em] text-eth-blue-text">
            Wallet · Cali, Colombia
          </p>
          <h1 className="max-w-3xl text-[44px] font-black leading-[0.98] tracking-[-0.035em] sm:text-6xl lg:text-7xl">
            Your keys.<br /> Our gas.
          </h1>
          <p className="mb-0 mt-5 max-w-xl text-base leading-relaxed text-content-secondary sm:mt-6 sm:text-lg">
            A self-custody wallet that feels like a fintech app. Sign in with email or a passkey,
            keep your own keys, and let the ETH Cali community cover the gas.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              onClick={login}
              className="inline-flex min-h-[56px] items-center justify-center gap-2 rounded-control bg-eth-blue px-7 text-base font-semibold text-on-brand transition-colors duration-base hover:bg-eth-blue-lift active:bg-eth-blue-deep"
            >
              {destination.cta}
              <ArrowRightIcon className="h-5 w-5" />
            </button>
            <p className="font-mono text-xs text-content-faint">
              gas 0.00 <span className="text-signal-confirmed">· sponsored</span> on {DEFAULT_CHAIN.name}
            </p>
          </div>
        </div>
      </section>

      {/* ── What the app does: one cell per area, each one a way in ── */}
      <section aria-labelledby="areas-heading" className="mx-auto max-w-page px-4 pb-12 sm:px-6 sm:pb-16 lg:pb-24">
        <h2 id="areas-heading" className="mb-6 font-mono text-[11px] font-normal uppercase tracking-[0.16em] text-content-faint">
          What you can do here
        </h2>
        {/* The 1px gap over a hairline background draws the grid lines at every
            breakpoint, without per-column border rules to keep in step. */}
        <ul className="grid grid-cols-1 gap-px overflow-hidden rounded-card border border-line-hairline bg-line-hairline sm:grid-cols-2 lg:grid-cols-3">
          {AREAS.map((area) => {
            const { n, href, title, body, action, signIn, image } = area;
            const cell =
              'group flex h-full w-full flex-col bg-surface-void text-left';
            const inner = (
              <>
                {/* Decorative: the title says what the cell is. */}
                <span className="relative block aspect-[16/10] overflow-hidden">
                  <Image
                    src={image}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"
                    className="object-contain opacity-90 transition-opacity duration-base [mask-image:radial-gradient(ellipse_closest-side_at_center,black_60%,transparent_100%)] group-hover:opacity-100 motion-reduce:transition-none"
                  />
                </span>
                <span className="flex flex-1 flex-col px-5 pb-5 sm:px-6 sm:pb-6">
                  <span className="mb-3 font-mono text-[11px] tracking-[0.16em] text-content-faint">/{n}</span>
                  <span className="mb-2 block text-lg font-bold leading-snug text-content-primary sm:text-xl">{title}</span>
                  <span className="mb-5 block flex-1 text-sm leading-relaxed text-content-muted">{body}</span>
                  <span className="inline-flex min-h-tap items-center gap-2 text-sm font-semibold text-eth-blue-text group-hover:text-content-primary">
                    {action}
                    <ArrowRightIcon className="h-4 w-4" />
                  </span>
                </span>
              </>
            );
            return (
              <li key={n} className="flex">
                {signIn ? (
                  <button type="button" onClick={() => signInTo(href)} className={cell}>
                    {inner}
                  </button>
                ) : (
                  <Link href={href} className={cell}>
                    {inner}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      {/* ── Infrastructure strip ── */}
      <section className="mx-auto max-w-page px-4 pb-12 sm:px-6 sm:pb-16 lg:pb-24">
        <p className="mb-6 font-mono text-[11px] uppercase tracking-[0.16em] text-content-faint">
          Built on
        </p>
        <div className="grid grid-cols-2 gap-x-6 gap-y-5 sm:flex sm:flex-wrap sm:items-center sm:gap-x-10 sm:gap-y-6">
          {INFRA.map(({ src, name }) => (
            <div key={name} className="flex items-center gap-3 text-content-muted">
              <Image src={src} alt="" width={28} height={28} className="h-7 w-7 object-contain opacity-80" unoptimized />
              <span className="font-mono text-sm">{name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Network: one line, straight from the registry ── */}
      <section className="mx-auto max-w-page px-4 pb-14 sm:px-6 sm:pb-20 lg:pb-28">
        <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.16em] text-content-faint">
          Network
        </p>
        <p className="font-mono text-sm text-content-secondary">{DEFAULT_CHAIN.name} mainnet</p>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-line-hairline">
        <div className="mx-auto max-w-page px-4 py-10 sm:px-6 sm:py-12">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
            <div>
              <Image
                src="/logotethcali.png"
                alt="ETH Cali"
                width={200}
                height={96}
                className="mb-4 h-9 w-auto"
                unoptimized
              />
              <p className="mb-4 text-base text-content-muted">El Jardín Infinito del Pacífico Colombiano</p>
              {/* The way back to the community site. This page is where every
                  link from ethcali.org lands and where every protected route
                  bounces a signed-out visitor, and it had no route home — only
                  social profiles. The `www` host, because the apex 307s. */}
              <a
                href="https://www.ethcali.org"
                className="mb-6 inline-flex text-sm font-semibold text-eth-blue-text transition-colors duration-fast hover:text-content-primary"
              >
                ← ethcali.org
              </a>
              <div className="flex flex-wrap gap-1">
                {SOCIAL.map(({ href, label, Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="flex h-10 w-10 items-center justify-center rounded-chip text-content-muted transition-colors duration-fast hover:bg-surface-inset hover:text-content-primary"
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-4 font-mono text-[11px] uppercase tracking-[0.16em] text-content-faint">Community</h3>
              <ul className="space-y-2">
                {COMMUNITY.map(({ href, label }) => (
                  <li key={label}>
                    <a href={href} target="_blank" rel="noopener noreferrer" className={footerLink}>
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="mb-4 font-mono text-[11px] uppercase tracking-[0.16em] text-content-faint">Onchain</h3>
              <ul className="space-y-2">
                {WEB3.map(({ href, label }) => (
                  <li key={label}>
                    <a href={href} target="_blank" rel="noopener noreferrer" className={footerLink}>
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-start justify-between gap-4 border-t border-line-hairline pt-6 sm:flex-row sm:items-center">
            <p className="text-xs text-content-faint">
              © {new Date().getFullYear()} ETH Cali. Todos los derechos reservados.
            </p>
            {/* Node endorsement lives on a paper plate: light backgrounds only. */}
            <div className="rounded-control bg-surface-paper px-3 py-2">
              <Image
                src="/branding/Logo_Nodo_CLO_ETH_CO-01.png"
                alt="Ethereum Colombia node"
                width={120}
                height={32}
                className="h-7 w-auto"
                unoptimized
              />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
