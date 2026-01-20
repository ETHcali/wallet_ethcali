import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useWallets, useSendTransaction } from '@privy-io/react-auth';
import {
  hasNFTByAddress,
  hasClaimed,
  getFaucetBalance,
  getClaimAmount,
  isFaucetPaused,
  getFaucetNFTContract,
  getClaimTxData,
  getExplorerUrl,
  getNetworkName,
} from '../../utils/contracts';

interface FaucetClaimProps {
  chainId: number;
  onClaimSuccess?: () => void;
}

const FaucetClaim: React.FC<FaucetClaimProps> = ({ chainId, onClaimSuccess }) => {
  const { wallets } = useWallets();
  const { sendTransaction } = useSendTransaction();
  const userWallet = wallets?.[0];

  const [isLoading, setIsLoading] = useState(true);
  const [isClaiming, setIsClaiming] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Faucet state
  const [hasNFT, setHasNFT] = useState(false);
  const [alreadyClaimed, setAlreadyClaimed] = useState(false);
  const [faucetBalance, setFaucetBalance] = useState('0');
  const [claimAmount, setClaimAmount] = useState('0');
  const [isPaused, setIsPaused] = useState(false);

  const networkName = getNetworkName(chainId);

  const loadFaucetData = async () => {
    if (!userWallet?.address) return;

    setIsLoading(true);
    setError(null);

    try {
      const [nftOwned, claimed, balance, amount, paused] = await Promise.all([
        hasNFTByAddress(chainId, userWallet.address),
        hasClaimed(chainId, userWallet.address),
        getFaucetBalance(chainId),
        getClaimAmount(chainId),
        isFaucetPaused(chainId),
      ]);

      setHasNFT(nftOwned);
      setAlreadyClaimed(claimed);
      setFaucetBalance(balance);
      setClaimAmount(amount);
      setIsPaused(paused);
    } catch (err) {
      console.error('Error loading faucet data:', err);
      setError('LOAD_ERROR');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFaucetData();
  }, [chainId, userWallet?.address]);

  const switchWalletChain = async () => {
    if (!userWallet) return false;

    try {
      const provider = await userWallet.getEthereumProvider();
      const chainHex = `0x${chainId.toString(16)}`;

      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chainHex }],
      });

      return true;
    } catch (error: any) {
      if (error.code === 4902) {
        try {
          const provider = await userWallet.getEthereumProvider();
          const chainConfig = chainId === 130 ? {
            chainId: '0x82',
            chainName: 'Unichain',
            nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
            rpcUrls: ['https://mainnet.unichain.org'],
            blockExplorerUrls: ['https://unichain.blockscout.com'],
          } : {
            chainId: '8453',
            chainName: 'Base',
            nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
            rpcUrls: ['https://mainnet.base.org'],
            blockExplorerUrls: ['https://basescan.org'],
          };

          await provider.request({
            method: 'wallet_addEthereumChain',
            params: [chainConfig],
          });

          return true;
        } catch (addError) {
          return false;
        }
      }
      return false;
    }
  };

  const handleClaim = async () => {
    if (!userWallet) return;

    setIsClaiming(true);
    setError(null);
    setTxHash(null);

    try {
      const switched = await switchWalletChain();
      if (!switched) {
        throw new Error('NETWORK_SWITCH_FAILED');
      }

      const txData = getClaimTxData(chainId);

      const result = await sendTransaction(
        {
          to: txData.to as `0x${string}`,
          data: txData.data,
        },
        {
          sponsor: true,
        } as any
      );

      setTxHash(result.hash);

      setTimeout(() => {
        loadFaucetData();
        onClaimSuccess?.();
      }, 3000);

    } catch (err: any) {
      console.error('Claim error:', err);
      setError(err.message || 'CLAIM_FAILED');
    } finally {
      setIsClaiming(false);
    }
  };

  const getEligibilityStatus = () => {
    if (isPaused) return { canClaim: false, code: 'PAUSED' };
    if (!hasNFT) return { canClaim: false, code: 'NO_NFT' };
    if (alreadyClaimed) return { canClaim: false, code: 'CLAIMED' };
    if (parseFloat(faucetBalance) < parseFloat(claimAmount)) {
      return { canClaim: false, code: 'EMPTY' };
    }
    return { canClaim: true, code: 'ELIGIBLE' };
  };

  const eligibility = getEligibilityStatus();

  if (isLoading) {
    return (
      <div className="bg-black/60 border border-green-500/30 rounded-lg p-4">
        <div className="flex items-center justify-center gap-3">
          <div className="w-3 h-3 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-green-400 font-mono text-[10px] tracking-wider">LOADING...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black/60 border border-green-500/30 rounded-lg p-4 space-y-4">
      {/* Status Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${isPaused ? 'bg-red-500' : 'bg-green-500'}`}></div>
          <span className="text-[10px] font-mono text-gray-500 tracking-wider">
            {isPaused ? 'PAUSED' : 'ACTIVE'}
          </span>
        </div>
        <span className="text-[10px] font-mono text-gray-600">
          {networkName.toUpperCase()}
        </span>
      </div>

      {/* Stats Grid - Compact */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-black/40 rounded p-3">
          <p className="text-[9px] text-gray-600 font-mono tracking-wider mb-1">CLAIM</p>
          <p className="text-lg font-bold text-green-400 font-mono">{claimAmount}</p>
          <p className="text-[9px] text-gray-700 font-mono">ETH</p>
        </div>
        <div className="bg-black/40 rounded p-3">
          <p className="text-[9px] text-gray-600 font-mono tracking-wider mb-1">VAULT</p>
          <p className="text-lg font-bold text-cyan-400 font-mono">{parseFloat(faucetBalance).toFixed(3)}</p>
          <p className="text-[9px] text-gray-700 font-mono">ETH</p>
        </div>
      </div>

      {/* Eligibility Checks - Minimal */}
      <div className="space-y-1.5 text-[10px] font-mono">
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${hasNFT ? 'bg-green-500' : 'bg-gray-600'}`}></div>
          <span className={hasNFT ? 'text-green-400' : 'text-gray-600'}>ZKPASSPORT</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${!alreadyClaimed ? 'bg-green-500' : 'bg-gray-600'}`}></div>
          <span className={!alreadyClaimed ? 'text-green-400' : 'text-gray-600'}>FIRST_CLAIM</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${!isPaused ? 'bg-green-500' : 'bg-gray-600'}`}></div>
          <span className={!isPaused ? 'text-green-400' : 'text-gray-600'}>FAUCET_ACTIVE</span>
        </div>
      </div>

      {/* Status Message */}
      <div className={`p-2 rounded border ${
        eligibility.canClaim
          ? 'bg-green-500/10 border-green-500/30'
          : 'bg-gray-900/50 border-gray-700'
      }`}>
        <p className={`font-mono text-[10px] tracking-wider ${
          eligibility.canClaim ? 'text-green-400' : 'text-gray-500'
        }`}>
          STATUS: {eligibility.code}
        </p>
      </div>

      {/* Claim Button */}
      <button
        onClick={handleClaim}
        disabled={!eligibility.canClaim || isClaiming}
        className={`w-full py-3 rounded font-mono font-bold text-sm transition-all ${
          eligibility.canClaim && !isClaiming
            ? 'bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 text-green-400'
            : 'bg-gray-900/50 border border-gray-700 text-gray-600 cursor-not-allowed'
        }`}
      >
        {isClaiming ? (
          <span className="flex items-center justify-center gap-2">
            <div className="w-3 h-3 border-2 border-green-400 border-t-transparent rounded-full animate-spin"></div>
            CLAIMING...
          </span>
        ) : (
          `CLAIM ${claimAmount} ETH →`
        )}
      </button>

      {/* Success */}
      {txHash && (
        <div className="p-2 bg-green-500/10 border border-green-500/30 rounded">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-[10px] text-green-400 font-mono tracking-wider">SUCCESS</span>
          </div>
          <a
            href={getExplorerUrl(chainId, txHash)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[9px] text-gray-500 hover:text-green-400 font-mono"
          >
            tx: {txHash.slice(0, 10)}...{txHash.slice(-6)} →
          </a>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="p-2 bg-red-500/10 border border-red-500/30 rounded">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span className="text-[10px] text-red-400 font-mono tracking-wider">{error}</span>
          </div>
        </div>
      )}

      {/* Get NFT Link */}
      {!hasNFT && (
        <Link
          href="/sybil"
          className="block text-center text-[10px] text-cyan-500/70 hover:text-cyan-400 font-mono transition-colors"
        >
          GET_ZKPASSPORT →
        </Link>
      )}

      {/* Refresh */}
      <button
        onClick={loadFaucetData}
        className="w-full py-2 text-[10px] text-gray-600 hover:text-gray-400 font-mono"
      >
        REFRESH
      </button>
    </div>
  );
};

export default FaucetClaim;
