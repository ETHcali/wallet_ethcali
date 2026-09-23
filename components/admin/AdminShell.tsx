import React from 'react';
import Link from 'next/link';
import Navigation from '../Navigation';
import { useActiveWallet } from '../../hooks/useActiveWallet';
import { useAdminRoles } from '../../hooks/useAdminStatus';

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
 * Shared chrome for every admin area: a left sidebar on desktop, a row of
 * scrolling section chips under the title below lg (no drawer, no hamburger).
 *
 * Visibility here is presentation only. A section appears because the contract
 * says this address holds the role; the contract re-checks on every write —
 * hiding a link has never been, and must never become, the access control.
 */
const AdminShell: React.FC<AdminShellProps> = ({ active, title, subtitle, children }) => {
  const { address } = useActiveWallet();

  const {
    isSwagAdmin,
    isFaucetAdmin,
    isFaucetSuperAdmin,
    isZKPassportOwner,
    isDonationAdmin,
    isDonationSuperAdmin,
  } = useAdminRoles();

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
      <Navigation />

      <div className="mx-auto w-full max-w-7xl px-4 pb-8 pt-5 lg:px-6 lg:py-8">
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
            <header className="mb-5 lg:mb-6">
              <h1 className="text-2xl font-bold text-content-primary">{title}</h1>
              {subtitle && <p className="mb-0 mt-1 text-sm text-content-muted">{subtitle}</p>}
            </header>

            {/* Below lg: the sections as chips, scrolling sideways inside the gutter. */}
            <nav
              className="no-scrollbar -mx-4 mb-5 flex gap-2 overflow-x-auto px-4 lg:hidden"
              aria-label="Admin sections"
            >
              {sections.map((section) => {
                const current = section.id === active;
                return (
                  <Link
                    key={section.id}
                    href={section.href}
                    aria-current={current ? 'page' : undefined}
                    className={`inline-flex min-h-[40px] shrink-0 items-center rounded-full border px-4 text-sm font-medium transition-colors ${
                      current
                        ? 'border-line-brand bg-eth-blue-wash text-eth-blue-text'
                        : 'border-line-strong text-content-secondary hover:text-content-primary'
                    }`}
                  >
                    {section.label}
                  </Link>
                );
              })}
            </nav>

            {children}
          </div>
        </div>
      </div>

    </div>
  );
};

export default AdminShell;
