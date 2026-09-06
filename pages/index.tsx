import React from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Loading from '../components/shared/Loading';
import Navigation from '../components/Navigation';
import {
  ArrowRightIcon,
  BagIcon,
  DropIcon,
  GasIcon,
  GitHubIcon,
  InstagramIcon,
  LinkedInIcon,
  ShieldIcon,
  TelegramIcon,
  XIcon,
  YouTubeIcon,
} from '../components/shared/icons';

/* UX_GUIDELINES.md §1 — Landing (signed out): display headline, one-paragraph
   promise, one primary CTA, then four numbered feature cells in a hairline
   grid, an infrastructure logo strip, network pills and the footer. */

const FEATURES = [
  {
    n: '01',
    title: 'Gas paid by the community',
    body: 'Every transaction on Base, Optimism and Unichain is sponsored. You never buy ETH just to move.',
    Icon: GasIcon,
  },
  {
    n: '02',
    title: 'Identity without surveillance',
    body: 'Prove you are one person with a zero-knowledge passport proof. We store a nullifier, never a name.',
    Icon: ShieldIcon,
  },
  {
    n: '03',
    title: 'A faucet for verified humans',
    body: 'Verify once, then claim test ETH from community vaults without asking anyone.',
    Icon: DropIcon,
  },
  {
    n: '04',
    title: 'Swag and donations, onchain',
    body: 'Buy merch in USDC and support ETH Cali campaigns. Every receipt is a token you keep.',
    Icon: BagIcon,
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

const NETWORKS = ['Base', 'Ethereum', 'Optimism', 'Unichain', 'Celo'];

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

  // Auto-redirect authenticated users to wallet.
  // The Privy session token alone is enough — no need to wait for a wallet object.
  React.useEffect(() => {
    if (ready && authenticated) {
      router.push('/wallet');
    }
  }, [ready, authenticated, router]);

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
        <Loading fullScreen={true} text="Opening your wallet…" />
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
        <div className="relative mx-auto max-w-page px-6 pb-16 pt-10 sm:pt-16 lg:pb-24">
          <Image
            src="/logotethcali.png"
            alt="ETH Cali"
            width={200}
            height={96}
            className="mb-12 h-9 w-auto sm:h-10"
            priority
            unoptimized
          />
          <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.16em] text-eth-blue-text">
            Wallet · Cali, Colombia
          </p>
          <h1 className="max-w-3xl text-5xl font-black leading-[0.98] tracking-[-0.035em] sm:text-6xl lg:text-7xl">
            Your keys. Our gas.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-content-secondary sm:text-lg">
            A self-custody wallet that feels like a fintech app. Sign in with email or a passkey,
            keep your own keys, and let the ETH Cali community cover the gas.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              onClick={login}
              className="inline-flex min-h-[56px] items-center justify-center gap-2 rounded-control bg-eth-blue px-7 text-base font-semibold text-on-brand transition-colors duration-base hover:bg-eth-blue-lift active:bg-eth-blue-deep"
            >
              Open your wallet
              <ArrowRightIcon className="h-5 w-5" />
            </button>
            <p className="font-mono text-xs text-content-faint">
              0.00 <span className="text-signal-confirmed">· sponsored</span> on every supported network
            </p>
          </div>
        </div>
      </section>

      {/* ── Features: four numbered cells in a hairline grid ── */}
      <section className="mx-auto max-w-page px-6 pb-16 lg:pb-24">
        <div className="grid grid-cols-1 overflow-hidden rounded-card border border-line-hairline sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ n, title, body, Icon }) => (
            <div
              key={n}
              className="border-line-hairline p-6 sm:[&:nth-child(odd)]:border-r lg:[&:not(:last-child)]:border-r [&:not(:last-child)]:border-b sm:[&:nth-child(-n+2)]:border-b lg:[&:not(:last-child)]:border-b-0"
            >
              <div className="mb-6 flex items-center justify-between">
                <span className="font-mono text-[11px] tracking-[0.16em] text-content-faint">/{n}</span>
                <span className="flex h-10 w-10 items-center justify-center rounded-control bg-eth-blue-wash text-eth-blue-text">
                  <Icon className="h-5 w-5" />
                </span>
              </div>
              <h2 className="mb-2 text-xl font-bold leading-snug">{title}</h2>
              <p className="text-sm leading-relaxed text-content-muted">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Infrastructure strip ── */}
      <section className="mx-auto max-w-page px-6 pb-16 lg:pb-24">
        <p className="mb-6 font-mono text-[11px] uppercase tracking-[0.16em] text-content-faint">
          Built on
        </p>
        <div className="flex flex-wrap items-center gap-x-10 gap-y-6">
          {INFRA.map(({ src, name }) => (
            <div key={name} className="flex items-center gap-3 text-content-muted">
              <Image src={src} alt="" width={28} height={28} className="h-7 w-7 object-contain opacity-80" unoptimized />
              <span className="font-mono text-sm">{name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Networks ── */}
      <section className="mx-auto max-w-page px-6 pb-20 lg:pb-28">
        <p className="mb-6 font-mono text-[11px] uppercase tracking-[0.16em] text-content-faint">
          Same address on
        </p>
        <div className="flex flex-wrap gap-2">
          {NETWORKS.map((name) => (
            <span
              key={name}
              className="inline-flex min-h-[36px] items-center rounded-full border border-line-strong px-4 font-mono text-sm text-content-secondary"
            >
              {name}
            </span>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-line-hairline">
        <div className="mx-auto max-w-page px-6 py-12">
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
              <p className="mb-6 text-base text-content-muted">El Jardín Infinito del Pacífico Colombiano</p>
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
