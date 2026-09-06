import { useState } from 'react';
import { formatEther } from 'viem';
import { useVaultDeposit, useVaultWithdraw } from '../../hooks/faucet';
import { Vault } from '../../types/faucet';

interface VaultDepositWithdrawProps {
  vault: Vault;
  onClose: () => void;
  onSuccess: () => void;
}

type ActionMode = 'deposit' | 'withdraw';

export function VaultDepositWithdraw({ vault, onClose, onSuccess }: VaultDepositWithdrawProps) {
  const { deposit, canDeposit } = useVaultDeposit();
  const { withdraw, canWithdraw } = useVaultWithdraw();

  const [mode, setMode] = useState<ActionMode>('deposit');
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const balanceEth = parseFloat(formatEther(vault.balance));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (mode === 'withdraw' && amountValue > balanceEth) {
      setError(`Cannot withdraw more than vault balance (${balanceEth.toFixed(4)} ETH)`);
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === 'deposit') {
        await deposit(vault.id, amount);
        setSuccess(`Successfully deposited ${amount} ETH`);
      } else {
        await withdraw(vault.id, amount);
        setSuccess(`Successfully withdrew ${amount} ETH`);
      }
      setAmount('');
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${mode}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const setMaxWithdraw = () => {
    setAmount(balanceEth.toString());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-card border border-line-hairline bg-surface-slab p-6 ">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-content-primary">{vault.name}</h2>
            <p className="text-sm text-content-faint">
              Current Balance: <span className="text-eth-blue-text font-mono">{balanceEth.toFixed(4)} ETH</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-content-muted hover:text-content-primary transition"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Mode Toggle */}
        <div className="flex rounded-control bg-surface-inset p-1 mb-6">
          <button
            type="button"
            onClick={() => {
              setMode('deposit');
              setError(null);
              setSuccess(null);
            }}
            className={`flex-1 rounded-chip py-2 text-sm font-medium transition ${
              mode === 'deposit'
                ? 'bg-eth-blue/20 text-eth-blue-text'
                : 'text-content-muted hover:text-content-primary'
            }`}
          >
            Deposit
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('withdraw');
              setError(null);
              setSuccess(null);
            }}
            className={`flex-1 rounded-chip py-2 text-sm font-medium transition ${
              mode === 'withdraw'
                ? 'bg-signal-reverted/20 text-signal-reverted'
                : 'text-content-muted hover:text-content-primary'
            }`}
          >
            Withdraw
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm text-content-muted">Amount (ETH)</label>
              {mode === 'withdraw' && (
                <button
                  type="button"
                  onClick={setMaxWithdraw}
                  className="text-xs text-eth-blue-text hover:text-eth-blue-text"
                >
                  Max
                </button>
              )}
            </div>
            <input
              type="number"
              min="0"
              step="0.0001"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-control border border-line-hairline bg-surface-inset p-3 text-content-primary placeholder-content-faint focus:border-eth-blue focus:outline-none font-mono"
              placeholder="0.01"
              disabled={isSubmitting}
            />
          </div>

          {/* Info Box */}
          <div className={`rounded-control border p-3 text-sm ${
            mode === 'deposit'
              ? 'border-signal-confirmed/30 bg-signal-confirmed/10 text-signal-confirmed'
              : 'border-signal-reverted/30 bg-signal-reverted/10 text-signal-reverted'
          }`}>
            {mode === 'deposit' ? (
              <p>ETH will be transferred from your wallet to this vault.</p>
            ) : (
              <p>ETH will be transferred from this vault to your wallet.</p>
            )}
          </div>

          {error && (
            <div className="rounded-control border border-signal-reverted/40 bg-signal-reverted/10 p-3">
              <p className="text-sm text-signal-reverted">{error}</p>
            </div>
          )}

          {success && (
            <div className="rounded-control border border-signal-confirmed/40 bg-signal-confirmed/10 p-3">
              <p className="text-sm text-signal-confirmed">{success}</p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-control border border-line-strong bg-surface-inset py-3 text-content-primary hover:bg-surface-ridge transition"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || (mode === 'deposit' ? !canDeposit : !canWithdraw)}
              className={`flex-1 rounded-control py-3 font-medium text-content-primary  disabled:opacity-50 transition ${
                mode === 'deposit'
                  ? 'bg-eth-blue hover:bg-eth-blue-lift'
                  : 'bg-signal-reverted/10 border border-signal-reverted/30 hover:bg-signal-reverted/20'
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Processing...
                </span>
              ) : mode === 'deposit' ? (
                'Deposit ETH'
              ) : (
                'Withdraw ETH'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
