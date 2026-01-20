import { useState } from 'react';
import { formatEther } from 'viem';
import { useVaultDeposit, useVaultWithdraw } from '../../hooks/useFaucetAdmin';
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
      <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-xl">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-white">{vault.name}</h2>
            <p className="text-sm text-slate-500">
              Current Balance: <span className="text-green-400 font-mono">{balanceEth.toFixed(4)} ETH</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Mode Toggle */}
        <div className="flex rounded-lg bg-slate-800 p-1 mb-6">
          <button
            type="button"
            onClick={() => {
              setMode('deposit');
              setError(null);
              setSuccess(null);
            }}
            className={`flex-1 rounded-md py-2 text-sm font-medium transition ${
              mode === 'deposit'
                ? 'bg-green-500/20 text-green-400'
                : 'text-slate-400 hover:text-white'
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
            className={`flex-1 rounded-md py-2 text-sm font-medium transition ${
              mode === 'withdraw'
                ? 'bg-red-500/20 text-red-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Withdraw
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm text-slate-400">Amount (ETH)</label>
              {mode === 'withdraw' && (
                <button
                  type="button"
                  onClick={setMaxWithdraw}
                  className="text-xs text-cyan-400 hover:text-cyan-300"
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
              className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none font-mono"
              placeholder="0.01"
              disabled={isSubmitting}
            />
          </div>

          {/* Info Box */}
          <div className={`rounded-lg border p-3 text-sm ${
            mode === 'deposit'
              ? 'border-green-500/30 bg-green-500/10 text-green-300'
              : 'border-red-500/30 bg-red-500/10 text-red-300'
          }`}>
            {mode === 'deposit' ? (
              <p>ETH will be transferred from your wallet to this vault.</p>
            ) : (
              <p>ETH will be transferred from this vault to your wallet.</p>
            )}
          </div>

          {error && (
            <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-3">
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          {success && (
            <div className="rounded-lg border border-green-500/40 bg-green-500/10 p-3">
              <p className="text-sm text-green-300">{success}</p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-slate-600 bg-slate-800 py-3 text-white hover:bg-slate-700 transition"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || (mode === 'deposit' ? !canDeposit : !canWithdraw)}
              className={`flex-1 rounded-lg py-3 font-medium text-white shadow-lg disabled:opacity-50 transition ${
                mode === 'deposit'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 shadow-green-500/20 hover:opacity-90'
                  : 'bg-gradient-to-r from-red-500 to-orange-500 shadow-red-500/20 hover:opacity-90'
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
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
