import { useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Layout from '../components/shared/Layout';
import Loading from '../components/shared/Loading';
import Navigation from '../components/Navigation';
import AccountSection from '../components/settings/AccountSection';
import PasskeysSection from '../components/settings/PasskeysSection';
import SecuritySection from '../components/settings/SecuritySection';
import { ChevronRightIcon, CogIcon, LogoutIcon } from '../components/shared/icons';
import { useAdminRoles } from '../hooks/useAdminStatus';

/**
 * Settings: how you sign in, and where your key is.
 *
 * Prerendered like every page that imports Privy (see CLAUDE.md § Rendering
 * gotcha) and gated on the client the same way `/wallet` is: a signed-out
 * visitor is sent to the landing page with `?next=/settings`, so signing in
 * brings them back here. On a phone this is also where Sign out and the admin
 * entry live: the bottom tab bar has the six main pages and nothing else.
 */
export default function SettingsPage() {
  const router = useRouter();
  const { ready, authenticated, user, logout } = usePrivy();
  const { hasAnyAdmin } = useAdminRoles();

  useEffect(() => {
    if (ready && !authenticated) {
      // `replace`, not `push`: this route bounces again the moment Back
      // returns to it, which traps the Back button.
      router.replace(`/?next=${encodeURIComponent(router.pathname)}`);
    }
  }, [ready, authenticated, router]);

  if (!ready) {
    return <Loading fullScreen={true} text="Loading..." />;
  }

  if (!authenticated || !user) {
    return <Loading fullScreen={true} text="Redirecting..." />;
  }

  return (
    <div className="min-h-screen bg-surface-void">
      <Navigation />
      <Layout>
        <div className="mx-auto max-w-xl space-y-5 md:space-y-6">
          <header>
            <h1 className="text-2xl font-bold text-content-primary">Settings</h1>
            <p className="mb-0 mt-1 text-sm text-content-muted">How you sign in, and where your key is.</p>
          </header>
          <AccountSection user={user} />
          <PasskeysSection user={user} />
          <SecuritySection user={user} />

          {/* Admin areas: shown to role holders; every write is still checked on chain. */}
          {hasAnyAdmin && (
            <Link
              href="/admin"
              className="flex min-h-[60px] items-center gap-3 rounded-card border border-line-hairline bg-surface-slab px-5 transition-colors hover:border-line-strong"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-eth-blue-wash text-eth-blue-text">
                <CogIcon className="h-[18px] w-[18px]" />
              </span>
              <span className="flex-1 text-[15px] font-medium text-content-primary">Admin</span>
              <ChevronRightIcon className="h-4 w-4 text-content-faint" />
            </Link>
          )}

          {/* Desktop keeps Sign out in the top bar. */}
          <button
            type="button"
            onClick={logout}
            className="flex min-h-tap w-full items-center justify-center gap-2 rounded-control border border-signal-reverted/30 bg-signal-reverted/10 text-[15px] font-semibold text-signal-reverted transition-colors hover:bg-signal-reverted/20 md:hidden"
          >
            <LogoutIcon className="h-[18px] w-[18px]" />
            Sign out
          </button>
        </div>
      </Layout>
    </div>
  );
}
