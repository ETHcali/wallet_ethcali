import React, { useState, useEffect } from 'react';
import { useWallets } from '@privy-io/react-auth';
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
import { parseEther } from 'viem';

interface FaucetAdminProps {
  chainId: number;
}

const FaucetAdmin: React.FC<FaucetAdminProps> = ({ chainId }) => {
  const { wallets } = useWallets();
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
  const loadAdminData = async () => {
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
      console.error('Error loading admin data:', err);
      setError('Failed to load contract data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, [chainId]);

  const executeTransaction = async (txData: { to: `0x${string}`; data?: `0x${string}`; value?: bigint }) => {
    if (!userWallet) return;

    setIsProcessing(true);
    setError(null);
    setTxHash(null);

    try {
      const provider = await userWallet.getEthereumProvider();

      const params: any = {
        from: userWallet.address,
        to: txData.to,
        chainId: chainId,
      };

      if (txData.data) params.data = txData.data;
      if (txData.value) params.value = `0x${txData.value.toString(16)}`;

      const tx = await provider.request({
        method: 'eth_sendTransaction',
        params: [params],
      });

      setTxHash(tx as string);
      
      // Refresh data after delay
      setTimeout(loadAdminData, 3000);

    } catch (err: any) {
      console.error('Transaction error:', err);
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
      <div className="bg-gray-900 border border-orange-500/30 rounded-xl p-6">
        <div className="flex items-center justify-center gap-3">
          <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-orange-400 font-mono">LOADING_ADMIN_DATA...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-orange-500/30 rounded-xl p-6 space-y-6">
      {/* Admin Header */}
      <div className="flex items-center gap-3">
        <span className="text-3xl">⚙️</span>
        <div>
          <h2 className="text-xl font-bold text-orange-400 font-mono">ADMIN_PANEL</h2>
          <p className="text-gray-500 text-sm font-mono">Manage faucet contracts with Privy gas sponsorship</p>
        </div>
      </div>

      {/* Contract Balance */}
      <div className="bg-gray-800/50 border border-cyan-500/20 rounded-lg p-4">
        <p className="text-xs text-gray-500 font-mono mb-2">FAUCET_VAULT</p>
        <p className="text-2xl font-bold text-cyan-400 font-mono">{parseFloat(faucetBalance).toFixed(6)} ETH</p>
        <p className="text-xs text-gray-500 font-mono mt-1">
          Claim amount: {claimAmount} ETH
        </p>
        <p className="text-xs text-gray-500 font-mono">
          Status: <span className={isPaused ? 'text-red-400' : 'text-green-400'}>
            {isPaused ? 'PAUSED' : 'ACTIVE'}
          </span>
        </p>
        <p className="text-xs text-purple-400 font-mono mt-2">
          💰 Gas fees sponsored by Privy
        </p>
      </div>

      {/* Faucet Controls */}
      <div className="border border-cyan-500/20 rounded-lg p-4 space-y-4">
        <h3 className="text-sm font-bold text-cyan-400 font-mono">FAUCET_CONTROLS</h3>
        
        {/* Update Claim Amount */}
        <div className="bg-gray-800/30 rounded-lg p-3 space-y-2">
          <p className="text-xs text-gray-400 font-mono">
            CURRENT_CLAIM_AMOUNT: <span className="text-cyan-400">{claimAmount} ETH</span>
          </p>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="New claim amount in ETH"
              value={newClaimAmount}
              onChange={(e) => setNewClaimAmount(e.target.value)}
              className="flex-1 px-3 py-2 bg-gray-800 border border-yellow-500/30 rounded-lg text-white font-mono text-sm focus:border-yellow-500 focus:outline-none"
              step="0.0001"
              min="0"
            />
            <button
              onClick={handleUpdateClaimAmount}
              disabled={isProcessing || !newClaimAmount}
              className="px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/50 rounded-lg text-yellow-400 font-mono text-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
            className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white font-mono text-sm focus:border-cyan-500 focus:outline-none"
            step="0.001"
            min="0"
          />
          <button
            onClick={handleFaucetDeposit}
            disabled={isProcessing || !depositAmount}
            className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 rounded-lg text-cyan-400 font-mono text-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
            className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white font-mono text-sm focus:border-cyan-500 focus:outline-none"
            step="0.001"
            min="0"
          />
          <button
            onClick={handleFaucetWithdraw}
            disabled={isProcessing || !withdrawAmount}
            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-lg text-red-400 font-mono text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            WITHDRAW
          </button>
        </div>

        {/* Pause/Unpause */}
        <button
          onClick={handlePauseToggle}
          disabled={isProcessing}
          className={`w-full py-2 rounded-lg font-mono text-sm transition-all ${
            isPaused
              ? 'bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 text-green-400'
              : 'bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/50 text-orange-400'
          }`}
        >
          {isPaused ? 'UNPAUSE_FAUCET' : 'PAUSE_FAUCET'}
        </button>
      </div>

      {/* Advanced Settings */}
      <details className="border border-gray-700/50 rounded-lg">
        <summary className="p-4 cursor-pointer text-sm font-bold text-gray-400 font-mono hover:text-gray-300">
          ⚡ ADVANCED_SETTINGS
        </summary>
        <div className="p-4 pt-0 space-y-4">
          {/* Current Linked NFT Contract */}
          <div className="bg-gray-800/30 rounded-lg p-3 space-y-2">
            <p className="text-xs text-gray-500 font-mono">CURRENTLY_LINKED_NFT_CONTRACT</p>
            <div className="flex items-center gap-2">
              <span className="text-green-400">●</span>
              <a
                href={getAddressExplorerUrl(chainId, linkedNFTContract || addresses.ZKPassportNFT)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-cyan-400 font-mono hover:underline break-all"
              >
                {linkedNFTContract || addresses.ZKPassportNFT}
              </a>
            </div>
            {linkedNFTContract && linkedNFTContract.toLowerCase() !== addresses.ZKPassportNFT.toLowerCase() && (
              <p className="text-xs text-yellow-400 font-mono">
                ⚠️ Different from config: {addresses.ZKPassportNFT}
              </p>
            )}
          </div>

          {/* Update NFT Contract */}
          <div className="space-y-2">
            <p className="text-xs text-gray-500 font-mono">UPDATE_NFT_CONTRACT</p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="0x... new NFT contract address"
                value={newNFTContract}
                onChange={(e) => setNewNFTContract(e.target.value)}
                className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white font-mono text-xs focus:border-red-500 focus:outline-none"
              />
              <button
                onClick={handleSetNFTContract}
                disabled={isProcessing || !newNFTContract}
                className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 font-mono text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                SET
              </button>
            </div>
            <p className="text-xs text-red-400/60 font-mono">
              ⚠️ Caution: Only change if you know what you&apos;re doing
            </p>
          </div>
        </div>
      </details>

      {/* Contract Addresses */}
      <div className="bg-gray-800/30 rounded-lg p-4 space-y-2">
        <p className="text-xs text-gray-500 font-mono">CONTRACT_ADDRESSES</p>
        <p className="text-xs text-gray-400 font-mono break-all">
          Faucet: {addresses.FaucetManager}
        </p>
        <p className="text-xs text-gray-400 font-mono break-all">
          NFT: {addresses.ZKPassportNFT}
        </p>
        <p className="text-xs text-purple-400 font-mono">
          All transactions sponsored by Privy
        </p>
      </div>

      {/* Processing Indicator */}
      {isProcessing && (
        <div className="flex items-center justify-center gap-3 p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
          <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-orange-400 font-mono">PROCESSING_TRANSACTION...</span>
        </div>
      )}

      {/* Success Message */}
      {txHash && (
        <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
          <p className="text-green-400 font-mono text-sm mb-2">✓ TX_SUCCESS!</p>
          <a
            href={getExplorerUrl(chainId, txHash)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-green-400 font-mono hover:underline break-all"
          >
            View: {txHash.slice(0, 30)}...
          </a>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-red-400 font-mono text-sm">✗ {error}</p>
        </div>
      )}

      {/* Refresh Button */}
      <button
        onClick={loadAdminData}
        disabled={isProcessing}
        className="w-full py-2 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg text-gray-400 font-mono text-sm transition-all"
      >
        ↻ REFRESH_DATA
      </button>
    </div>
  );
};

export default FaucetAdmin;

