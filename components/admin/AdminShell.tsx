import React, { useState } from 'react';
import { CloseIcon } from '../shared/icons';
import Link from 'next/link';
import { useWallets } from '@privy-io/react-auth';
import Navigation from '../Navigation';
import { useAdminStatus } from '../../hooks/useAdminStatus';
import { useDonationAdmin } from '../../hooks/donations/useDonationAdmin';

export type AdminSection =
  | 'overview'
  | 'donations'
  | 'faucet'
  | 'swag'
  | 'artwork'
  | 'identity'
  | 'content';

interface AdminShellProps {
  /** Which sidebar entry is current. */
  active: AdminSection;
  /** Heading for the content column. */
  title: string;
  /** One line under the heading — say what this area controls. */
  subtitle?: string;
  chainId?: number;
  children: React.ReactNode;
}

interface SectionDef {
  id: AdminSection;
  href: string;
  label: string;
  /** Tailwind text colour for the active accent, per domain. */
  accent: string;
}

const SECTIONS: SectionDef[] = [
  { id: 'overview', href: '/admin', label: 'Overview', accent: 'text-eth-blue-text' },
  { id: 'donations', href: '/donations/admin', label: 'Donations', accent: 'text-eth-blue-text' },
  { id: 'faucet', href: '/faucet/admin', label: 'Faucet', accent: 'text-eth-blue-text' },
  { id: 'swag', href: '/swag/admin', label: 'Swag', accent: 'text-eth-blue-text' },
  { id: 'artwork', href: '/admin/artwork', label: 'Artwork', accent: 'text-eth-blue-text' },
  { id: 'identity', href: '/sybil/admin', label: 'Identity', accent: 'text-eth-blue-text' },
  { id: 'content', href: '/admin/content', label: 'Site content', accent: 'text-eth-blue-text' },
];

function truncate(address?: string): string {
  if (!address) return 'Not connected';
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

/**
 * Shared chrome for every admin area: a left sidebar on desktop, a slide-over
 * sheet on a phone.
 *
 * Visibility here is presentation only. A section appears because the contract
 * says this address holds the role, but the contract re-checks on every write —
 * hiding a link has never been, and must never become, the access control.
 */
const AdminShell: React.FC<AdminShellProps> = ({
  active,
  title,
  subtitle,
  chainId,
  children,
}) => {
  const [navOpen, setNavOpen] = useState(false);
  const { wallets } = useWallets();
  const address = wallets?.[0]?.address;

  const { isSwagAdmin, isFaucetAdmin, isFaucetSuperAdmin, isZKPassportOwner } =
    useAdminStatus(chainId);
  const { isAdmin: isDonationAdmin, isSuperAdmin: isDonationSuperAdmin } =
    useDonationAdmin(chainId);

  const permitted: Record<AdminSection, boolean> = {
    overview: true,
    donations: isDonationAdmin || isDonationSuperAdmin,
    faucet: isFaucetAdmin || isFaucetSuperAdmin,
    swag: isSwagAdmin,
    // Artwork is production state, not an on-chain role. Anyone who can reach
    // an admin area can prepare artwork; the API still verifies ADMIN_ROLE.
    artwork: true,
    identity: isZKPassportOwner,
    // Site content is editorial, not an on-chain role, so the menu does not
    // gate it. The API still checks ADMIN_ROLE before it writes anything.
    content: true,
  };

  // The current section stays listed even if the role read is still resolving,
  // so the sidebar does not flicker an entry out from under the page you are on.
  const sections = SECTIONS.filter((s) => permitted[s.id] || s.id === active);

  const nav = (
    <nav className="space-y-1" aria-label="Admin sections">
      {sections.map((section) => {
        const current = section.id === active;
        return (
          <Link
            key={section.id}
            href={section.href}
            onClick={() => setNavOpen(false)}
            aria-current={current ? 'page' : undefined}
            className={`flex min-h-tap items-center gap-2 rounded-control px-3 text-sm font-semibold transition-colors ${
              current
                ? `bg-surface-inset ${section.accent}`
                : 'text-content-muted hover:bg-surface-inset/60 hover:text-content-primary'
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                current ? 'bg-current' : 'bg-surface-ridge'
              }`}
              aria-hidden
            />
            {section.label}
          </Link>
        );
      })}
    </nav>
  );

  const sidebarFooter = (
    <div className="mt-6 border-t border-line-hairline pt-4">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-content-faint">
        Signed in as
      </p>
      <p className="mt-1 font-mono text-xs text-content-muted">{truncate(address)}</p>
      <p className="mt-2 text-[10px] leading-relaxed text-content-faint">
        Roles are read from the contracts. The chain rejects a call your address
        cannot make, whatever this menu shows.
      </p>
    </div>
  );

  return (
    // The dark ground has to live here. globals.css only paints the body dark
    // under prefers-color-scheme: dark, so without this the app renders white
    // and every white heading disappears. Every other page root does the same.
    <div className="min-h-screen bg-surface-void">
      <Navigation currentChainId={chainId} />

      <div className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-6 lg:py-8">
        <div className="lg:grid lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-8">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-6">
              <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-wide text-content-faint">
                Admin
              </p>
              {nav}
              {sidebarFooter}
            </div>
          </aside>

          {/* min-w-0 so a wide table or long address inside the content column
              cannot stretch the grid and force the whole page to scroll sideways. */}
          <div className="min-w-0">
            <header className="mb-6 flex items-start gap-3">
              <button
                type="button"
                onClick={() => setNavOpen(true)}
                className="-ml-1 flex min-h-tap min-w-tap items-center justify-center rounded-control border border-line-hairline text-content-secondary transition-colors hover:border-line-strong hover:text-content-primary lg:hidden"
                aria-label="Open admin sections"
                aria-expanded={navOpen}
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5"
                  />
                </svg>
              </button>
              <div className="min-w-0">
                <h1 className="text-xl font-bold text-content-primary sm:text-2xl">{title}</h1>
                {subtitle && <p className="mt-1 text-sm text-content-muted">{subtitle}</p>}
              </div>
            </header>

            {children}
          </div>
        </div>
      </div>

      {/* Mobile slide-over */}
      {navOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 h-full w-full bg-black/70 backdrop-blur-sm"
            onClick={() => setNavOpen(false)}
            aria-label="Close admin sections"
          />
          <div className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col overflow-y-auto border-r border-line-hairline bg-surface-slab p-4">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-content-faint">
                Admin
              </p>
              <button
                type="button"
                onClick={() => setNavOpen(false)}
                className="-m-2 p-2 text-content-faint hover:text-content-primary"
                aria-label="Close"
              >
                <CloseIcon />
              </button>
            </div>
            {nav}
            {sidebarFooter}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminShell;
