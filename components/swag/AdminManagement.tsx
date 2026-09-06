import { useState } from 'react';
import { useSendTransaction, useWallets } from '@privy-io/react-auth';
import { encodeFunctionData, isAddress } from 'viem';
import Swag1155ABI from '../../frontend/abis/Swag1155.json';
import { useSwagAddresses } from '../../utils/network';

export function AdminManagement() {
  const { swag1155, chainId } = useSwagAddresses();
  const { wallets } = useWallets();
  const { sendTransaction } = useSendTransaction();

  const [newAdmin, setNewAdmin] = useState('');
  const [removeAdminAddr, setRemoveAdminAddr] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const activeWallet = wallets?.[0];

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAddress(newAdmin)) {
      setMessage({ type: 'error', text: 'Invalid address format' });
      return;
    }
    if (!swag1155 || !activeWallet) return;

    setIsAdding(true);
    setMessage(null);

    try {
      const data = encodeFunctionData({
        abi: Swag1155ABI as any,
        functionName: 'addAdmin',
        args: [newAdmin as `0x${string}`],
      });

      await sendTransaction(
        {
          to: swag1155 as `0x${string}`,
          data,
          chainId,
        },
        { sponsor: true }
      );

      setMessage({ type: 'success', text: `Admin added: ${newAdmin.slice(0, 8)}...` });
      setNewAdmin('');
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to add admin' });
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAddress(removeAdminAddr)) {
      setMessage({ type: 'error', text: 'Invalid address format' });
      return;
    }
    if (!swag1155 || !activeWallet) return;

    setIsRemoving(true);
    setMessage(null);

    try {
      const data = encodeFunctionData({
        abi: Swag1155ABI as any,
        functionName: 'removeAdmin',
        args: [removeAdminAddr as `0x${string}`],
      });

      await sendTransaction(
        {
          to: swag1155 as `0x${string}`,
          data,
          chainId,
        },
        { sponsor: true }
      );

      setMessage({ type: 'success', text: `Admin removed: ${removeAdminAddr.slice(0, 8)}...` });
      setRemoveAdminAddr('');
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to remove admin' });
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <div className="rounded-card border border-line-hairline bg-surface-slab/60 p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-content-primary mb-1">Admin Management</h3>
        <p className="text-sm text-content-muted">Add or remove addresses that can create products</p>
      </div>

      {message && (
        <div className={`p-3 rounded-control text-sm ${
          message.type === 'success'
            ? 'bg-signal-confirmed/10 border border-signal-confirmed/40 text-signal-confirmed'
            : 'bg-signal-reverted/10 border border-signal-reverted/40 text-signal-reverted'
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleAddAdmin} className="space-y-3">
        <label className="block">
          <span className="text-sm text-content-muted">Add Admin</span>
          <div className="flex gap-2 mt-1">
            <input
              type="text"
              value={newAdmin}
              onChange={(e) => setNewAdmin(e.target.value)}
              placeholder="0x..."
              className="flex-1 rounded-control border border-line-hairline bg-surface-slab/80 p-3 text-content-primary text-sm font-mono focus:border-eth-blue focus:outline-none"
              disabled={isAdding}
            />
            <button
              type="submit"
              disabled={isAdding || !newAdmin}
              className="px-4 py-2 rounded-control bg-eth-blue text-on-brand font-medium hover:bg-eth-blue-lift disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isAdding ? 'Adding...' : 'Add'}
            </button>
          </div>
        </label>
      </form>

      <form onSubmit={handleRemoveAdmin} className="space-y-3">
        <label className="block">
          <span className="text-sm text-content-muted">Remove Admin</span>
          <div className="flex gap-2 mt-1">
            <input
              type="text"
              value={removeAdminAddr}
              onChange={(e) => setRemoveAdminAddr(e.target.value)}
              placeholder="0x..."
              className="flex-1 rounded-control border border-line-hairline bg-surface-slab/80 p-3 text-content-primary text-sm font-mono focus:border-eth-blue focus:outline-none"
              disabled={isRemoving}
            />
            <button
              type="submit"
              disabled={isRemoving || !removeAdminAddr}
              className="px-4 py-2 rounded-control bg-signal-reverted text-content-primary font-medium hover:bg-signal-reverted disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isRemoving ? 'Removing...' : 'Remove'}
            </button>
          </div>
        </label>
      </form>
    </div>
  );
}
