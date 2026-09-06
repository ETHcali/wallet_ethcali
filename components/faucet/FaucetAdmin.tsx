import React, { useState, useEffect, useCallback } from 'react';
import { useWallets, useSendTransaction } from '@privy-io/react-auth';
import { logger } from '../../utils/logger';
import {
  getFaucetBalance,
  isFaucetPaused,
  getClaimAmount,
  getFaucetNFTContract,
  getDepositTxData,
  getWithdrawTxData,
  getPauseTxData,
  getUnpauseTxData,
  getUpdateClaimAmountTxData,
  getSetNFTContractTxData,
  getExplorerUrl,
  getAddressExplorerUrl,
  getContractAddresses,
  isAdmin,
} from '../../utils/contracts';

interface FaucetAdminProps {
  chainId: number;
}

const FaucetAdmin: React.FC<FaucetAdminProps> = ({ chainId }) => {
  const { wallets } = useWallets();
  const { sendTransaction } = useSendTransaction();
  const userWallet = wallets?.[0];

  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Contract state
  const [faucetBalance, setFaucetBalance] = useState('0');
  const [isPaused, setIsPaused] = useState(false);
  const [claimAmount, setClaimAmount] = useState('0');
  const [linkedNFTContract, setLinkedNFTContract] = useState('');

  // Input state
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [newClaimAmount, setNewClaimAmount] = useState('');
  const [newNFTContract, setNewNFTContract] = useState('');

  const addresses = getContractAddresses(chainId);

  // Check if current user is admin
  const userIsAdmin = isAdmin(userWallet?.address);

  // Load admin data
  const loadAdminData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [fBalance, paused, amount, nftContract] = await Promise.all([
        getFaucetBalance(chainId),
        isFaucetPaused(chainId),
        getClaimAmount(chainId),
        getFaucetNFTContract(chainId),
      ]);

      setFaucetBalance(fBalance);
      setIsPaused(paused);
      setClaimAmount(amount);
      setLinkedNFTContract(nftContract);
    } catch (err) {
      logger.error('Error loading admin data:', err);
      setError('Failed to load contract data');
    } finally {
      setIsLoading(false);
    }
  }, [chainId]);

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  const executeTransaction = async (txData: { to: `0x${string}`; data?: `0x${string}`; value?: bigint }) => {
    if (!userWallet) return;

    setIsProcessing(true);
    setError(null);
    setTxHash(null);

    try {
      // Use Privy's sendTransaction for gas sponsorship support
      const result = await sendTransaction(
        {
          to: txData.to,
          data: txData.data,
          value: txData.value,
          chainId,
        },
        { sponsor: true }
      );

      setTxHash(result.hash);

      // Refresh data after delay
      setTimeout(loadAdminData, 3000);

    } catch (err: any) {
      logger.error('Transaction error:', err);
      setError(err.message || 'Transaction failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFaucetDeposit = () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) return;
    const txData = getDepositTxData(chainId, depositAmount);
    executeTransaction(txData);
    setDepositAmount('');
  };

  const handleFaucetWithdraw = () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) return;
    const txData = getWithdrawTxData(chainId, withdrawAmount);
    executeTransaction(txData);
    setWithdrawAmount('');
  };

  const handlePauseToggle = () => {
    const txData = isPaused ? getUnpauseTxData(chainId) : getPauseTxData(chainId);
    executeTransaction(txData);
  };

  const handleUpdateClaimAmount = () => {
    if (!newClaimAmount || parseFloat(newClaimAmount) <= 0) return;
    const txData = getUpdateClaimAmountTxData(chainId, newClaimAmount);
    executeTransaction(txData);
    setNewClaimAmount('');
  };

  const handleSetNFTContract = () => {
    if (!newNFTContract || !newNFTContract.startsWith('0x') || newNFTContract.length !== 42) {
      setError('Invalid contract address');
      return;
    }
    const txData = getSetNFTContractTxData(chainId, newNFTContract);
    executeTransaction(txData);
    setNewNFTContract('');
  };

  // Don't render if not admin
  if (!userIsAdmin) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="bg-surface-slab border border-eth-blue/30 rounded-card p-6">
        <div className="flex items-center justify-center gap-3">
          <div className="w-6 h-6 border-2 border-eth-blue border-t-transparent rounded-full animate-spin"></div>
          <span className="text-eth-blue-text font-mono">Loading admin data…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface-slab border border-eth-blue/30 rounded-card p-6 space-y-6">
      {/* Admin Header */}
      <div className="flex items-center gap-3">
        
        <div>
          <h2 className="text-xl font-bold text-eth-blue-text font-mono">Admin panel</h2>
          <p className="text-content-faint text-sm font-mono">Manage faucet contracts with Privy gas sponsorship</p>
        </div>
      </div>

      {/* Contract Balance */}
      <div className="bg-surface-inset/50 border border-eth-blue/20 rounded-control p-4">
        <p className="text-xs text-content-faint font-mono mb-2">Faucet vault</p>
        <p className="text-2xl font-bold text-eth-blue-text font-mono">{parseFloat(faucetBalance).toFixed(6)} ETH</p>
        <p className="text-xs text-content-faint font-mono mt-1">
          Claim amount: {claimAmount} ETH
        </p>
        <p className="text-xs text-content-faint font-mono">
          Status: <span className={isPaused ? 'text-signal-reverted' : 'text-signal-confirmed'}>
            {isPaused ? 'PAUSED' : 'ACTIVE'}
          </span>
        </p>
        <p className="text-xs text-eth-blue-text font-mono mt-2">
          No fee — we cover gas on this network.
        </p>
      </div>

      {/* Faucet Controls */}
      <div className="border border-eth-blue/20 rounded-control p-4 space-y-4">
        <h3 className="text-sm font-bold text-eth-blue-text font-mono">FAUCET_CONTROLS</h3>
        
        {/* Update Claim Amount */}
        <div className="bg-surface-inset/30 rounded-control p-3 space-y-2">
          <p className="text-xs text-content-muted font-mono">
            CURRENT_CLAIM_AMOUNT: <span className="text-eth-blue-text">{claimAmount} ETH</span>
          </p>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="New claim amount in ETH"
              value={newClaimAmount}
              onChange={(e) => setNewClaimAmount(e.target.value)}
              className="flex-1 px-3 py-2 bg-surface-inset border border-signal-pending/30 rounded-control text-content-primary font-mono text-sm focus:border-signal-pending focus:outline-none"
              step="0.0001"
              min="0"
            />
            <button
              onClick={handleUpdateClaimAmount}
              disabled={isProcessing || !newClaimAmount}
              className="px-4 py-2 bg-signal-pending/20 hover:bg-signal-pending/30 border border-signal-pending/50 rounded-control text-signal-pending font-mono text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              UPDATE
            </button>
          </div>
        </div>

        {/* Deposit */}
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Amount in ETH"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            className="flex-1 px-3 py-2 bg-surface-inset border border-line-strong rounded-control text-content-primary font-mono text-sm focus:border-eth-blue focus:outline-none"
            step="0.001"
            min="0"
          />
          <button
            onClick={handleFaucetDeposit}
            disabled={isProcessing || !depositAmount}
            className="px-4 py-2 bg-eth-blue/20 hover:bg-eth-blue/30 border border-eth-blue/50 rounded-control text-eth-blue-text font-mono text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            DEPOSIT
          </button>
        </div>

        {/* Withdraw */}
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Amount in ETH"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
            className="flex-1 px-3 py-2 bg-surface-inset border border-line-strong rounded-control text-content-primary font-mono text-sm focus:border-eth-blue focus:outline-none"
            step="0.001"
            min="0"
          />
          <button
            onClick={handleFaucetWithdraw}
            disabled={isProcessing || !withdrawAmount}
            className="px-4 py-2 bg-signal-reverted/20 hover:bg-signal-reverted/30 border border-signal-reverted/50 rounded-control text-signal-reverted font-mono text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            WITHDRAW
          </button>
        </div>

        {/* Pause/Unpause */}
        <button
          onClick={handlePauseToggle}
          disabled={isProcessing}
          className={`w-full py-2 rounded-control font-mono text-sm transition-all ${
            isPaused
              ? 'bg-eth-blue hover:bg-eth-blue-lift text-on-brand'
              : 'bg-eth-blue/20 hover:bg-eth-blue/30 border border-eth-blue/50 text-eth-blue-text'
          }`}
        >
          {isPaused ? 'UNPAUSE_FAUCET' : 'PAUSE_FAUCET'}
        </button>
      </div>

      {/* Advanced Settings */}
      <details className="border border-line-hairline rounded-control">
        <summary className="p-4 cursor-pointer text-sm font-bold text-content-muted font-mono hover:text-content-secondary">
          Advanced settings
        </summary>
        <div className="p-4 pt-0 space-y-4">
          {/* Current Linked NFT Contract */}
          <div className="bg-surface-inset/30 rounded-control p-3 space-y-2">
            <p className="text-xs text-content-faint font-mono">Linked NFT contract</p>
            <div className="flex items-center gap-2">
              <span className="text-content-primary">●</span>
              <a
                href={getAddressExplorerUrl(chainId, linkedNFTContract || addresses.ZKPassportNFT)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-eth-blue-text font-mono hover:underline break-all"
              >
                {linkedNFTContract || addresses.ZKPassportNFT}
              </a>
            </div>
            {linkedNFTContract && linkedNFTContract.toLowerCase() !== addresses.ZKPassportNFT.toLowerCase() && (
              <p className="text-xs text-signal-pending font-mono">
                Different from config: {addresses.ZKPassportNFT}
              </p>
            )}
          </div>

          {/* Update NFT Contract */}
          <div className="space-y-2">
            <p className="text-xs text-content-faint font-mono">UPDATE_NFT_CONTRACT</p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="0x... new NFT contract address"
                value={newNFTContract}
                onChange={(e) => setNewNFTContract(e.target.value)}
                className="flex-1 px-3 py-2 bg-surface-inset border border-line-strong rounded-control text-content-primary font-mono text-xs focus:border-signal-reverted focus:outline-none"
              />
              <button
                onClick={handleSetNFTContract}
                disabled={isProcessing || !newNFTContract}
                className="px-4 py-2 bg-signal-reverted/10 hover:bg-signal-reverted/20 border border-signal-reverted/30 rounded-control text-signal-reverted font-mono text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                SET
              </button>
            </div>
            <p className="text-xs text-signal-reverted/60 font-mono">
              Only change this if you know what you are doing.
            </p>
          </div>
        </div>
      </details>

      {/* Contract Addresses */}
      <div className="bg-surface-inset/30 rounded-control p-4 space-y-2">
        <p className="text-xs text-content-faint font-mono">CONTRACT_ADDRESSES</p>
        <p className="text-xs text-content-muted font-mono break-all">
          Faucet: {addresses.FaucetManager}
        </p>
        <p className="text-xs text-content-muted font-mono break-all">
          NFT: {addresses.ZKPassportNFT}
        </p>
        <p className="text-xs text-eth-blue-text font-mono">
          All transactions sponsored by Privy
        </p>
      </div>

      {/* Processing Indicator */}
      {isProcessing && (
        <div className="flex items-center justify-center gap-3 p-4 bg-eth-blue/10 border border-eth-blue/30 rounded-control">
          <div className="w-5 h-5 border-2 border-eth-blue border-t-transparent rounded-full animate-spin"></div>
          <span className="text-eth-blue-text font-mono">PROCESSING_TRANSACTION...</span>
        </div>
      )}

      {/* Success Message */}
      {txHash && (
        <div className="p-4 bg-signal-confirmed/10 border border-signal-confirmed/30 rounded-control">
          <p className="text-signal-confirmed font-mono text-sm mb-2">✓ Transaction confirmed</p>
          <a
            href={getExplorerUrl(chainId, txHash)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-signal-confirmed font-mono hover:underline break-all"
          >
            View: {txHash.slice(0, 30)}...
          </a>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-signal-reverted/10 border border-signal-reverted/30 rounded-control">
          <p className="text-signal-reverted font-mono text-sm">{error}</p>
        </div>
      )}

      {/* Refresh Button */}
      <button
        onClick={loadAdminData}
        disabled={isProcessing}
        className="w-full py-2 bg-surface-inset hover:bg-surface-ridge border border-line-strong rounded-control text-content-muted font-mono text-sm transition-all"
      >
        ↻ REFRESH_DATA
      </button>
    </div>
  );
};

export default FaucetAdmin;

