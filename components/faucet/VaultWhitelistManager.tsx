import { useState } from 'react';
import { useVaultWhitelist, useIsWhitelisted } from '../../hooks/faucet';
import { Vault } from '../../types/faucet';
import { useWallets } from '@privy-io/react-auth';

interface VaultWhitelistManagerProps {
  vault: Vault;
  onSuccess?: () => void;
}

export function VaultWhitelistManager({ vault, onSuccess }: VaultWhitelistManagerProps) {
  const { wallets: _wallets } = useWallets();
  const [addressInput, setAddressInput] = useState('');
  const [batchInput, setBatchInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeMode, setActiveMode] = useState<'single' | 'batch'>('single');

  const {
    addToWhitelist,
    addBatchToWhitelist,
    removeFromWhitelist,
    removeBatchFromWhitelist,
    setWhitelistEnabled,
    canManage,
  } = useVaultWhitelist();

  const isValidAddress = addressInput && addressInput.match(/^0x[a-fA-F0-9]{40}$/);
  const { isWhitelisted, refetch: refetchWhitelist } = useIsWhitelisted(
    vault.id,
    isValidAddress ? addressInput : null
  );

  const handleAddSingle = async () => {
    if (!addressInput || !addressInput.match(/^0x[a-fA-F0-9]{40}$/)) {
      alert('Invalid address');
      return;
    }

    setIsProcessing(true);
    try {
      await addToWhitelist(vault.id, addressInput);
      setAddressInput('');
      refetchWhitelist();
      onSuccess?.();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to add to whitelist');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveSingle = async () => {
    if (!addressInput || !addressInput.match(/^0x[a-fA-F0-9]{40}$/)) {
      alert('Invalid address');
      return;
    }

    setIsProcessing(true);
    try {
      await removeFromWhitelist(vault.id, addressInput);
      setAddressInput('');
      refetchWhitelist();
      onSuccess?.();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to remove from whitelist');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddBatch = async () => {
    const addresses = batchInput
      .split(/[,\n]/)
      .map(addr => addr.trim())
      .filter(addr => addr.match(/^0x[a-fA-F0-9]{40}$/));

    if (addresses.length === 0) {
      alert('No valid addresses found');
      return;
    }

    setIsProcessing(true);
    try {
      await addBatchToWhitelist(vault.id, addresses);
      setBatchInput('');
      onSuccess?.();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to add batch to whitelist');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveBatch = async () => {
    const addresses = batchInput
      .split(/[,\n]/)
      .map(addr => addr.trim())
      .filter(addr => addr.match(/^0x[a-fA-F0-9]{40}$/));

    if (addresses.length === 0) {
      alert('No valid addresses found');
      return;
    }

    setIsProcessing(true);
    try {
      await removeBatchFromWhitelist(vault.id, addresses);
      setBatchInput('');
      onSuccess?.();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to remove batch from whitelist');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggleWhitelist = async () => {
    setIsProcessing(true);
    try {
      await setWhitelistEnabled(vault.id, !vault.whitelistEnabled);
      onSuccess?.();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to toggle whitelist');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!canManage) {
    return null;
  }

  return (
    <div className="bg-black/60 border border-line-hairline rounded-chip p-4 space-y-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[9px] text-content-faint font-mono tracking-wider">Whitelist management</p>
        <div className="flex items-center gap-2">
          <span className={`text-[9px] font-mono ${vault.whitelistEnabled ? 'text-signal-confirmed' : 'text-content-faint'}`}>
            {vault.whitelistEnabled ? 'ENABLED' : 'DISABLED'}
          </span>
          <button
            onClick={handleToggleWhitelist}
            disabled={isProcessing}
            className={`text-[9px] font-mono px-2 py-1 rounded-chip transition ${
              vault.whitelistEnabled
                ? 'bg-signal-reverted/10 text-signal-reverted hover:bg-signal-reverted/20'
                : 'bg-eth-blue/10 text-eth-blue-text hover:bg-eth-blue/20'
            }`}
          >
            {vault.whitelistEnabled ? 'DISABLE' : 'ENABLE'}
          </button>
        </div>
      </div>

      {/* Mode Toggle */}
      <div className="flex gap-1 mb-3">
        <button
          onClick={() => setActiveMode('single')}
          className={`px-2 py-1 text-[9px] font-mono rounded-chip transition ${
            activeMode === 'single'
              ? 'bg-eth-blue/20 text-eth-blue-text border border-eth-blue/40'
              : 'text-content-faint hover:text-content-muted border border-transparent'
          }`}
        >
          SINGLE
        </button>
        <button
          onClick={() => setActiveMode('batch')}
          className={`px-2 py-1 text-[9px] font-mono rounded-chip transition ${
            activeMode === 'batch'
              ? 'bg-eth-blue/20 text-eth-blue-text border border-eth-blue/40'
              : 'text-content-faint hover:text-content-muted border border-transparent'
          }`}
        >
          BATCH
        </button>
      </div>

      {activeMode === 'single' ? (
        <div className="space-y-3">
          <div>
            <input
              type="text"
              value={addressInput}
              onChange={(e) => setAddressInput(e.target.value)}
              placeholder="0x..."
              className="w-full bg-black/40 border border-line-hairline rounded-chip px-3 py-2 text-[10px] font-mono text-content-secondary placeholder-content-faint focus:border-eth-blue/50 focus:outline-none"
            />
            {isValidAddress && (
              <div className="mt-1 text-[9px] font-mono text-content-faint">
                Status: <span className={isWhitelisted ? 'text-signal-confirmed' : 'text-signal-reverted'}>
                  {isWhitelisted ? 'WHITELISTED' : 'Not whitelisted'}
                </span>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAddSingle}
              disabled={isProcessing || !addressInput}
              className="flex-1 px-3 py-2 bg-eth-blue/10 border border-eth-blue/30 rounded-chip text-eth-blue-text text-[10px] font-mono hover:bg-eth-blue/20 transition disabled:opacity-50"
            >
              ADD
            </button>
            <button
              onClick={handleRemoveSingle}
              disabled={isProcessing || !addressInput}
              className="flex-1 px-3 py-2 bg-signal-reverted/10 border border-signal-reverted/30 rounded-chip text-signal-reverted text-[10px] font-mono hover:bg-signal-reverted/20 transition disabled:opacity-50"
            >
              REMOVE
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <textarea
            value={batchInput}
            onChange={(e) => setBatchInput(e.target.value)}
            placeholder="0x...&#10;0x...&#10;0x... (one per line or comma-separated)"
            rows={6}
            className="w-full bg-black/40 border border-line-hairline rounded-chip px-3 py-2 text-[10px] font-mono text-content-secondary placeholder-content-faint focus:border-eth-blue/50 focus:outline-none resize-none"
          />
          <div className="flex gap-2">
            <button
              onClick={handleAddBatch}
              disabled={isProcessing || !batchInput.trim()}
              className="flex-1 px-3 py-2 bg-eth-blue/10 border border-eth-blue/30 rounded-chip text-eth-blue-text text-[10px] font-mono hover:bg-eth-blue/20 transition disabled:opacity-50"
            >
              ADD_BATCH
            </button>
            <button
              onClick={handleRemoveBatch}
              disabled={isProcessing || !batchInput.trim()}
              className="flex-1 px-3 py-2 bg-signal-reverted/10 border border-signal-reverted/30 rounded-chip text-signal-reverted text-[10px] font-mono hover:bg-signal-reverted/20 transition disabled:opacity-50"
            >
              REMOVE_BATCH
            </button>
          </div>
        </div>
      )}

      <p className="text-[9px] text-content-faint font-mono">
        Vault ID: <span className="text-content-muted">{vault.id}</span> | {vault.name}
      </p>
    </div>
  );
}
