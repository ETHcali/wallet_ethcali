import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { usePrivy } from '@privy-io/react-auth';
import { useAdminRoles } from '../hooks/useAdminStatus';
import {
  BagIcon,
  CogIcon,
  DropIcon,
  HeartIcon,
  LogoutIcon,
  ShieldIcon,
  SlidersIcon,
  WalletIcon,
} from './shared/icons';

interface NavItem {
  href: string;
  label: string;
  icon: React.FC<{ className?: string; strokeWidth?: number }>;
}

/** Every main page, in the order the tab bar shows them. Nothing hides in a menu. */
const MAIN_NAV: NavItem[] = [
  { href: '/wallet', label: 'Wallet', icon: WalletIcon },
  { href: '/swag', label: 'Swag', icon: BagIcon },
  { href: '/donations', label: 'Donate', icon: HeartIcon },
  { href: '/faucet', label: 'Faucet', icon: DropIcon },
  { href: '/sybil', label: 'Identity', icon: ShieldIcon },
  { href: '/settings', label: 'Settings', icon: SlidersIcon },
];

/** The phone header names the page, since the tab bar is at the other end of the screen. */
function pageTitle(pathname: string): string | null {
  if (pathname.startsWith('/admin') || pathname.endsWith('/admin')) return 'Admin';
  if (pathname === '/swag/orders') return 'My swag';
  if (pathname === '/swag/claim') return 'Claim';
  return MAIN_NAV.find((item) => pathname === item.href || pathname.startsWith(item.href + '/'))?.label ?? null;
}

const Logo: React.FC<{ className: string }> = ({ className }) => (
  <Link href="/" className="flex shrink-0 items-center" aria-label="ETH Cali">
    <Image src="/logotethcali.png" alt="ETH Cali" width={200} height={96} className={className} priority unoptimized />
  </Link>
);

/**
 * Two bars.
 *
 * md and up: the 60px top bar with every route and Sign out, as before.
 * Below md: a 56px header (logo, the page's name, Sign in when signed out) and a
 * fixed bottom tab bar with all six main pages — no drawer, nothing behind a
 * hamburger. Sign out and the admin entry live on /settings on a phone.
 * `data-tabbar` is what globals.css keys the page's bottom padding on, so no
 * page content ends up under the bar.
 *
 * No chain selector and no address anywhere in here: the app is Ethereum only
 * and the wallet page's hero is where the address lives.
 */
const Navigation: React.FC = () => {
  const router = useRouter();
  const { authenticated, login, logout } = usePrivy();
  const { hasAnyAdmin } = useAdminRoles();
  const [signingIn, setSigningIn] = useState(false);
  const signInRelease = useRef<number>();

  /**
   * Sign in, with its own pending state. Released by a timer as well: closing
   * the Privy modal fires neither callback, and a button released only by them
   * would stay disabled forever.
   */
  const startSignIn = useCallback(() => {
    setSigningIn(true);
    window.clearTimeout(signInRelease.current);
    signInRelease.current = window.setTimeout(() => setSigningIn(false), 4000);
    login();
  }, [login]);

  useEffect(() => () => window.clearTimeout(signInRelease.current), []);

  const isActive = (href: string) => router.pathname === href || router.pathname.startsWith(href + '/');
  const desktopItems: NavItem[] = hasAnyAdmin
    ? [...MAIN_NAV, { href: '/admin', label: 'Admin', icon: CogIcon }]
    : MAIN_NAV;
  const title = pageTitle(router.pathname);

  const signInButton = (size: 'sm' | 'md') => (
    <button
      type="button"
      onClick={startSignIn}
      disabled={signingIn}
      className={`inline-flex items-center rounded-control bg-eth-blue font-semibold text-on-brand transition-colors duration-base hover:bg-eth-blue-lift disabled:opacity-60 ${
        size === 'sm' ? 'min-h-[44px] px-4 text-sm' : 'min-h-tap px-5 text-sm'
      }`}
    >
      {signingIn ? 'Opening…' : 'Sign in'}
    </button>
  );

  return (
    <>
      {/* ── Phone header ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-line-hairline bg-surface-void/85 pt-[env(safe-area-inset-top)] backdrop-blur-[14px] md:hidden">
        <div className="flex h-14 items-center gap-3 px-4">
          <Logo className="h-7 w-auto" />
          {title && (
            <>
              <span className="h-5 w-px bg-line-hairline" aria-hidden />
              <p className="mb-0 min-w-0 truncate font-mono text-[11px] uppercase tracking-[0.14em] text-content-secondary">
                {title}
              </p>
            </>
          )}
          <div className="ml-auto">{!authenticated && signInButton('sm')}</div>
        </div>
      </header>

      {/* ── Desktop top bar ──────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 hidden border-b border-line-hairline bg-surface-void/85 backdrop-blur-[14px] md:block">
        <div className="mx-auto flex h-nav max-w-page items-center justify-between gap-3 px-4">
          <Logo className="h-8 w-auto" />

          {authenticated && (
            <div className="flex items-center gap-1">
              {desktopItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive(item.href) ? 'page' : undefined}
                  className={`inline-flex min-h-[36px] items-center rounded-chip border px-3 font-mono text-[11px] uppercase tracking-[0.12em] transition-colors duration-base ${
                    isActive(item.href)
                      ? 'border-line-brand bg-eth-blue-wash text-eth-blue-text'
                      : 'border-transparent text-content-muted hover:bg-surface-inset hover:text-content-primary'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2">
            {authenticated ? (
              <button
                type="button"
                onClick={logout}
                className="inline-flex min-h-[36px] items-center gap-1.5 rounded-control border border-signal-reverted/30 bg-signal-reverted/10 px-3 text-xs font-medium text-signal-reverted transition-colors duration-base hover:bg-signal-reverted/20"
              >
                <LogoutIcon className="h-4 w-4" />
                Sign out
              </button>
            ) : (
              <>
                {/* The way back. The apex 307s to `www`, the host that serves the site. */}
                <a
                  href="https://www.ethcali.org"
                  className="inline-flex min-h-[36px] items-center rounded-chip px-3 font-mono text-[11px] uppercase tracking-[0.12em] text-content-muted transition-colors duration-base hover:bg-surface-inset hover:text-content-primary"
                >
                  ← ethcali.org
                </a>
                {signInButton('md')}
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── Phone tab bar ────────────────────────────────────────────── */}
      <nav
        data-tabbar
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-line-hairline bg-surface-void/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-[14px] md:hidden"
      >
        <ul className="grid h-14 grid-cols-6">
          {MAIN_NAV.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <li key={item.href} className="min-w-0">
                <Link
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={`relative flex h-full flex-col items-center justify-center gap-1 transition-colors duration-base ${
                    active ? 'text-eth-blue-text' : 'text-content-muted active:text-content-primary'
                  }`}
                >
                  {active && <span className="absolute top-0 h-0.5 w-7 rounded-full bg-eth-blue" aria-hidden />}
                  <Icon className="h-[22px] w-[22px]" strokeWidth={active ? 1.9 : 1.6} />
                  <span className="max-w-full truncate px-0.5 text-[10px] font-medium leading-none tracking-tight">
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
};

export default Navigation;
