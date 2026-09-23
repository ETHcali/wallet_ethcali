import { useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/router';
import Layout from '../components/shared/Layout';
import Loading from '../components/shared/Loading';
import Navigation from '../components/Navigation';
import AccountSection from '../components/settings/AccountSection';
import PasskeysSection from '../components/settings/PasskeysSection';
import SecuritySection from '../components/settings/SecuritySection';

/**
 * Settings: how you sign in, and where your key is.
 *
 * Prerendered like every page that imports Privy (see CLAUDE.md § Rendering
 * gotcha) and gated on the client the same way `/wallet` is: a signed-out
 * visitor is sent to the landing page with `?next=/settings`, so signing in
 * brings them back here. Sign out is in the navigation, not on this page.
 */
export default function SettingsPage() {
  const router = useRouter();
  const { ready, authenticated, user } = usePrivy();

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
        <div className="space-y-6">
          <header>
            <h1 className="text-2xl font-semibold text-content-primary">Settings</h1>
            <p className="mt-1 text-sm text-content-muted">How you sign in, and where your key is.</p>
          </header>
          <AccountSection user={user} />
          <PasskeysSection user={user} />
          <SecuritySection user={user} />
        </div>
      </Layout>
    </div>
  );
}
