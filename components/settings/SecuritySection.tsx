import React, { useState } from 'react';
import { useExportWallet } from '@privy-io/react-auth';
import type { User, WalletWithMetadata } from '@privy-io/react-auth';
import Button from '../shared/Button';
import { isEmbeddedWallet } from '../../utils/linkedAccounts';

interface SecuritySectionProps {
  user: User;
}

/**
 * Where the key is, in one line, and the way to take it with you.
 *
 * `exportWallet` from `useExportWallet` opens Privy's own modal — the key is
 * loaded in an iframe on another origin, so this app never sees it — and the
 * promise resolves when the person closes it
 * (docs.privy.io/wallets/wallets/export). It fails when there is no embedded
 * wallet, so the button is disabled with the reason instead of failing.
 */
const SecuritySection: React.FC<SecuritySectionProps> = ({ user }) => {
  const { exportWallet } = useExportWallet();
  const embedded = (user.linkedAccounts ?? []).find(
    (a): a is WalletWithMetadata => isEmbeddedWallet(a) && a.chainType === 'ethereum'
  );

  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const start = async () => {
    if (!embedded) return;
    setExporting(true);
    setError(null);
    try {
      await exportWallet({ address: embedded.address });
    } catch {
      setError('Export did not open. Nothing was shown; try again.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <section className="rounded-card border border-line-hairline bg-surface-slab p-5" aria-labelledby="settings-security">
      <h2 id="settings-security" className="text-lg font-bold text-content-primary">
        Security
      </h2>
      <p className="mb-0 mt-1 text-sm text-content-muted">
        Your embedded wallet key is held by Privy&apos;s infrastructure, not by ETH Cali and not on this device, and
        you can export it from the Privy widget at any time.
      </p>

      <div className="mt-4 space-y-2">
        <Button variant="outline" onClick={start} disabled={exporting || !embedded} fullWidth className="md:w-auto">
          {exporting ? 'Opening…' : 'Export wallet key'}
        </Button>
        {!embedded && <p className="mb-0 text-xs text-content-muted">No embedded wallet on this account.</p>}
      </div>

      {error && (
        <p className="mb-0 mt-3 text-sm text-signal-reverted" role="alert">
          {error}
        </p>
      )}
    </section>
  );
};

export default SecuritySection;
