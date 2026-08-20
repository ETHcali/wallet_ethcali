import { useState } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import Layout from '../components/shared/Layout';
import Navigation from '../components/Navigation';
import ENSSection from '../components/ens/ENSSection';
import { CHAIN_IDS, EXPLORER_URLS } from '../config/constants';

/**
 * Every state renders inside the same dark shell. The previous version bailed
 * out to bare `<div>Loading...</div>` strings, which in light mode were black
 * text on a white page with no navigation and no way back.
 */
function ProfileShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-950">
      <Navigation />
      <Layout>{children}</Layout>
    </div>
  );
}

function AddressRow({ address }: { address: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard is unavailable over plain http or when the user denies it.
      // The address stays selectable, so this is a silent downgrade.
    }
  };

  return (
    <div>
      <span className="text-xs text-gray-400">Wallet Address</span>

      {/* Full address on a wide screen, truncated on a phone — 42 characters
          of monospace hex wraps to three ugly lines at 320px. */}
      <div className="mt-1 flex items-center gap-2">
        <span className="hidden min-w-0 break-all font-mono text-sm text-white sm:block">
          {address}
        </span>
        <span className="font-mono text-sm text-white sm:hidden">
          {address.slice(0, 10)}…{address.slice(-8)}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={copy}
          className="inline-flex min-h-[40px] items-center rounded-lg border border-slate-700 bg-slate-800 px-3 text-xs font-semibold text-slate-300 transition-colors hover:border-cyan-500 hover:text-cyan-300"
        >
          {copied ? 'Copied' : 'Copy address'}
        </button>
        <a
          href={`${EXPLORER_URLS[CHAIN_IDS.BASE]}/address/${address}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-[40px] items-center rounded-lg border border-slate-700 bg-slate-800 px-3 text-xs font-semibold text-slate-300 transition-colors hover:border-cyan-500 hover:text-cyan-300"
        >
          View on explorer ↗
        </a>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { user, ready, authenticated, login } = usePrivy();
  const { wallets } = useWallets();
  const wallet = wallets?.[0];

  // Get user's login method info
  const getUserLoginInfo = () => {
    if (!user) return null;
    const emailAccount = user.linkedAccounts?.find((account) => account.type === 'email');
    const passkeyAccount = user.linkedAccounts?.find((account) => account.type === 'passkey');
    if (emailAccount && 'address' in emailAccount) {
      return { type: 'email', value: emailAccount.address as string };
    }
    if (passkeyAccount) {
      return { type: 'passkey', value: 'Passkey Authentication' };
    }
    return null;
  };
  const loginInfo = getUserLoginInfo();

  if (!ready) {
    return (
      <ProfileShell>
        <p className="py-16 text-center text-sm text-slate-500">Loading…</p>
      </ProfileShell>
    );
  }

  // A disconnected visitor gets a button, not a dead end.
  if (!authenticated) {
    return (
      <ProfileShell>
        <div className="mx-auto max-w-md rounded-2xl border border-slate-700 bg-slate-800/50 p-6 text-center sm:p-8">
          <h1 className="mb-2 text-lg font-bold text-white">Your profile</h1>
          <p className="mb-5 text-sm text-slate-400">
            Connect a wallet to see your address and manage your ENS name.
          </p>
          <button
            type="button"
            onClick={login}
            className="min-h-[48px] w-full rounded-lg bg-cyan-500 px-4 font-semibold text-slate-900 transition-colors hover:bg-cyan-400"
          >
            Connect wallet
          </button>
        </div>
      </ProfileShell>
    );
  }

  if (!wallet) {
    return (
      <ProfileShell>
        <div className="mx-auto max-w-md rounded-2xl border border-slate-700 bg-slate-800/50 p-6 text-center sm:p-8">
          <h1 className="mb-2 text-lg font-bold text-white">Setting up your wallet</h1>
          <p className="text-sm text-slate-400">
            Your embedded wallet is still being created. This usually takes a moment —
            reload if it does not appear.
          </p>
        </div>
      </ProfileShell>
    );
  }

  return (
    <ProfileShell>
      <div className="mx-auto max-w-xl space-y-4 sm:space-y-6">
        <h1 className="text-xl font-bold text-white sm:text-2xl">Profile</h1>

        <div className="rounded-xl bg-gray-800 p-4 sm:p-5">
          <AddressRow address={wallet.address} />

          {loginInfo && (
            <div className="mt-4 border-t border-slate-700 pt-4">
              <span className="text-xs text-gray-400">Signed in with</span>
              <div className="mt-1 break-all font-mono text-sm text-cyan-400">
                {loginInfo.type === 'email' ? loginInfo.value : 'Passkey'}
              </div>
            </div>
          )}
        </div>

        <div className="rounded-xl bg-gray-800 p-4 sm:p-5">
          <ENSSection userAddress={wallet.address} chainId={CHAIN_IDS.BASE} />
        </div>
      </div>
    </ProfileShell>
  );
}
