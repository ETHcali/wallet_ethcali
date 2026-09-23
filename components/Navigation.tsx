import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { usePrivy } from '@privy-io/react-auth';
import { useActiveWallet } from '../hooks/useActiveWallet';
import { useAdminRoles } from '../hooks/useAdminStatus';
import { CloseIcon } from './shared/icons';

// Icons as simple SVG components for cleaner mobile menu
const WalletIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
  </svg>
);
const FaucetIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v16.5c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9zm3.75 11.625a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
  </svg>
);
const IdentityIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
  </svg>
);
const SwagIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
  </svg>
);
const DonateIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
  </svg>
);
const AdminIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
const LogoutIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
  </svg>
);

/** Real ellipsis, per BRAND.md: `0x55C9…711d`. */
function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

interface NavigationProps {
  className?: string;
}

/* COMPONENTS.md — Nav (topbar): 60px, --surface-void at 86% + blur, bottom
   hairline. Items are mono 11 uppercase; the active one sits on --eth-blue-wash.

   There is no chain selector here. Every feature owns its chain: it picks one
   in-page from `chainsFor(feature)` and moves the wallet with `useRequireChain`
   right before signing. The bar shows the connected wallet and nothing about
   networks. */
const Navigation: React.FC<NavigationProps> = ({ className = '' }) => {
  const router = useRouter();
  const { authenticated, login, logout } = usePrivy();
  const { wallet: userWallet } = useActiveWallet();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const signInRelease = useRef<number>();
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [router.pathname]);

  // Admin roles OR'd across every chain each contract is deployed on, so the
  // entry does not appear and vanish with a network choice made elsewhere.
  const { hasAnyAdmin } = useAdminRoles();

  const mainNavItems = [
    { href: '/wallet', label: 'Wallet', icon: WalletIcon },
    { href: '/faucet', label: 'Faucet', icon: FaucetIcon },
    { href: '/sybil', label: 'Identity', icon: IdentityIcon },
    { href: '/swag', label: 'Swag', icon: SwagIcon },
    { href: '/donations', label: 'Donate', icon: DonateIcon },
  ];

  // One entry, not four. The admin areas are reachable from the dashboard
  // sidebar now, so repeating each of them in the top nav is noise — and on a
  // phone four extra rows pushed the real navigation off the screen.
  const adminNavItems = hasAnyAdmin
    ? [{ href: '/admin', label: 'Admin', icon: AdminIcon }]
    : [];

  const navItems = [...mainNavItems, ...adminNavItems];

  // Lock body scroll and signal mobile menu state when open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      document.body.setAttribute('data-mobile-menu-open', 'true');
    } else {
      document.body.style.overflow = '';
      document.body.removeAttribute('data-mobile-menu-open');
    }
    return () => {
      document.body.style.overflow = '';
      document.body.removeAttribute('data-mobile-menu-open');
    };
  }, [isMobileMenuOpen]);

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  /**
   * Sign in, with its own pending state — never a shared one.
   *
   * The release is a timer rather than only the two callbacks, and that is the
   * point: dismissing the Privy modal without signing in fires neither
   * `onComplete` nor `onError`, so a button released only by those would sit
   * disabled forever after one closed modal. Same failure as an onchain button
   * with no `finally`, and the same fix — something always releases it.
   */
  const startSignIn = useCallback(() => {
    setSigningIn(true);
    window.clearTimeout(signInRelease.current);
    signInRelease.current = window.setTimeout(() => setSigningIn(false), 4000);
    login();
  }, [login]);

  // Clear on unmount, so a pending release cannot fire against a gone component.
  useEffect(() => () => window.clearTimeout(signInRelease.current), []);

  const isActive = (href: string) => router.pathname === href || router.pathname.startsWith(href + '/');

  // Signed out, this component used to render nothing at all.
  //
  // `/donations` and `/swag` mount it unconditionally and are readable without a
  // session, so a visitor arriving on one from ethcali.org got a page with no
  // header: no way to sign in, no way back, not even the ETH Cali mark. A
  // stranded view rather than a page.
  //
  // Same bar as the signed-in one — same height, same hairline, same blur — so
  // nothing shifts when a session appears. What it drops is everything that
  // needs a wallet to mean anything: the address chip and Sign out.
  if (!authenticated) {
    return (
      <nav className={`sticky top-0 z-50 border-b border-line-hairline bg-surface-void/85 backdrop-blur-[14px] ${className}`}>
        <div className="mx-auto max-w-page px-3 sm:px-4">
          <div className="flex h-nav items-center justify-between gap-3">
            <Link href="/" className="flex shrink-0 items-center gap-2" aria-label="ETH Cali">
              <Image
                src="/logotethcali.png"
                alt="ETH Cali"
                width={200}
                height={96}
                className="h-8 w-auto"
                priority
                unoptimized
              />
            </Link>

            <div className="flex items-center gap-2">
              {/* The way back. The apex 307s to the `www` host — only that one
                  serves the page — so this is the spelling that does not cost a
                  redirect. Hidden on the narrowest phones, where the sign-in
                  button is the thing that has to fit. */}
              <a
                href="https://www.ethcali.org"
                className="hidden min-h-[36px] items-center rounded-chip px-3 font-mono text-[11px] uppercase tracking-[0.12em] text-content-muted transition-colors duration-base hover:bg-surface-inset hover:text-content-primary sm:inline-flex"
              >
                ← ethcali.org
              </a>

              {/* The only primary action a signed-out visitor has. */}
              <button
                onClick={startSignIn}
                disabled={signingIn}
                className="inline-flex min-h-tap items-center rounded-control bg-eth-blue px-5 text-sm font-semibold text-on-brand transition-colors duration-base hover:bg-eth-blue-lift disabled:opacity-60"
              >
                {signingIn ? 'Opening…' : 'Sign in'}
              </button>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className={`sticky top-0 z-50 border-b border-line-hairline bg-surface-void/85 backdrop-blur-[14px] ${className}`}>
      <div className="mx-auto max-w-page px-3 sm:px-4">
        <div className="flex h-nav items-center justify-between">
          {/* Logo — horizontal lockup, never below 32px */}
          <Link href="/" className="flex shrink-0 items-center gap-2" aria-label="ETH Cali">
            <Image
              src="/logotethcali.png"
              alt="ETH Cali"
              width={200}
              height={96}
              className="h-8 w-auto"
              priority
              unoptimized
            />
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
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

          {/* Right side: the connected wallet, Sign out, and the menu on a phone */}
          <div className="flex items-center gap-2">
            {userWallet && (
              <Link
                href="/profile"
                className="hidden min-h-[36px] items-center rounded-full border border-line-hairline bg-surface-slab px-3 font-mono text-xs text-eth-blue-text transition-colors duration-base hover:border-line-brand sm:inline-flex"
                title={userWallet.address}
              >
                {truncateAddress(userWallet.address)}
              </Link>
            )}

            {/* Sign out - Desktop (destructive-quiet) */}
            <button
              onClick={logout}
              className="hidden min-h-[36px] items-center gap-1.5 rounded-control border border-signal-reverted/30 bg-signal-reverted/10 px-3 text-xs font-medium text-signal-reverted transition-colors duration-base hover:bg-signal-reverted/20 sm:inline-flex"
            >
              <LogoutIcon />
              <span className="hidden md:inline">Sign out</span>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="flex min-h-tap min-w-tap items-center justify-center rounded-chip text-content-muted transition-colors hover:text-content-primary md:hidden"
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <CloseIcon />
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

      </div>

      {/* Mobile Menu - Full screen slide-in drawer */}
      <div
        className={`fixed inset-0 z-[60] transition-opacity duration-slow md:hidden ${
          isMobileMenuOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={closeMobileMenu}
        />

        {/* Drawer Panel */}
        <div
          ref={mobileMenuRef}
          className={`absolute bottom-0 right-0 top-0 flex w-[280px] max-w-[85vw] transform flex-col border-l border-line-hairline bg-surface-slab transition-transform duration-slow ease-out ${
            isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Header with close button */}
          <div className="flex flex-shrink-0 items-center justify-between border-b border-line-hairline px-4 py-3">
            <div className="min-w-0">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-content-faint">Signed in as</p>
              {userWallet ? (
                <p className="truncate font-mono text-xs text-eth-blue-text">
                  {truncateAddress(userWallet.address)}
                </p>
              ) : (
                <p className="font-mono text-xs text-content-muted">Setting up your wallet…</p>
              )}
            </div>
            <button
              onClick={closeMobileMenu}
              className="-mr-2 flex min-h-tap min-w-tap items-center justify-center rounded-full text-content-muted transition-colors hover:text-content-primary"
              aria-label="Close menu"
            >
              <CloseIcon />
            </button>
          </div>

          {/* Navigation Links - Scrollable area */}
          <div className="flex-1 overflow-y-auto overscroll-contain py-2">
            {/* Main Navigation */}
            <div className="space-y-1 px-3">
              {mainNavItems.map((item) => {
                const IconComponent = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMobileMenu}
                    aria-current={active ? 'page' : undefined}
                    className={`flex min-h-tap items-center gap-3 rounded-control px-4 text-sm font-medium transition-colors ${
                      active
                        ? 'bg-eth-blue-wash text-eth-blue-text'
                        : 'text-content-secondary active:bg-surface-inset'
                    }`}
                  >
                    <span className={active ? 'text-eth-blue-text' : 'text-content-faint'}>
                      <IconComponent />
                    </span>
                    {item.label}
                    {active && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-eth-blue" />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Admin Section */}
            {adminNavItems.length > 0 && (
              <div className="mt-4 px-3">
                <div className="mb-1 border-b border-line-hairline px-4 pb-2">
                  <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-content-faint">Admin</span>
                </div>
                <div className="space-y-1">
                  {adminNavItems.map((item) => {
                    const IconComponent = item.icon;
                    const active = isActive(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={closeMobileMenu}
                        aria-current={active ? 'page' : undefined}
                        className={`flex min-h-tap items-center gap-3 rounded-control px-4 text-sm font-medium transition-colors ${
                          active
                            ? 'bg-eth-blue-wash text-eth-blue-text'
                            : 'text-content-secondary active:bg-surface-inset'
                        }`}
                      >
                        <span className={active ? 'text-eth-blue-text' : 'text-content-faint'}>
                          <IconComponent />
                        </span>
                        {item.label}
                        {active && (
                          <span className="ml-auto h-1.5 w-1.5 rounded-full bg-eth-blue" />
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Footer - Always visible sign out */}
          <div className="flex-shrink-0 border-t border-line-hairline p-3">
            <button
              onClick={() => {
                closeMobileMenu();
                logout();
              }}
              className="flex min-h-tap w-full items-center justify-center gap-2 rounded-control border border-signal-reverted/30 bg-signal-reverted/10 px-4 font-medium text-signal-reverted transition-colors hover:bg-signal-reverted/20 active:bg-signal-reverted/30"
            >
              <LogoutIcon />
              Sign out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
