import React, { useState, useEffect } from 'react';
import { useWallets } from '@privy-io/react-auth';
import {
  hasNFTByAddress,
  hasClaimed,
  getFaucetBalance,
  getClaimAmount,
  isFaucetPaused,
  getFaucetNFTContract,
  getClaimTxData,
  getExplorerUrl,
  getAddressExplorerUrl,
  getContractAddresses,
  getNetworkName,
} from '../../utils/contracts';

interface FaucetClaimProps {
  chainId: number;
  onClaimSuccess?: () => void;
}

const FaucetClaim: React.FC<FaucetClaimProps> = ({ chainId, onClaimSuccess }) => {
  const { wallets } = useWallets();
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
  const [linkedNFTContract, setLinkedNFTContract] = useState('');

  const addresses = getContractAddresses(chainId);
  const networkName = getNetworkName(chainId);

  // Load faucet data
  const loadFaucetData = async () => {
    if (!userWallet?.address) return;

    setIsLoading(true);
    setError(null);

    try {
      const [nftOwned, claimed, balance, amount, paused, nftContract] = await Promise.all([
        hasNFTByAddress(chainId, userWallet.address),
        hasClaimed(chainId, userWallet.address),
        getFaucetBalance(chainId),
        getClaimAmount(chainId),
        isFaucetPaused(chainId),
        getFaucetNFTContract(chainId),
      ]);

      setHasNFT(nftOwned);
      setAlreadyClaimed(claimed);
      setFaucetBalance(balance);
      setClaimAmount(amount);
      setIsPaused(paused);
      setLinkedNFTContract(nftContract);
    } catch (err) {
      console.error('Error loading faucet data:', err);
      setError('Failed to load faucet data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFaucetData();
  }, [chainId, userWallet?.address]);

  // Switch wallet to the correct chain
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
            chainId: '0x2105',
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
          console.error('Error adding chain:', addError);
          return false;
        }
      }
      console.error('Error switching chain:', error);
      return false;
    }
  };

  const handleClaim = async () => {
    if (!userWallet) return;

    setIsClaiming(true);
    setError(null);
    setTxHash(null);

    try {
      // First, switch to the correct chain
      const switched = await switchWalletChain();
      if (!switched) {
        throw new Error('Failed to switch to the correct network');
      }

      const provider = await userWallet.getEthereumProvider();
      const txData = getClaimTxData(chainId);

      const tx = await provider.request({
        method: 'eth_sendTransaction',
        params: [{
          from: userWallet.address,
          to: txData.to,
          data: txData.data,
        }],
      });

      setTxHash(tx as string);
      
      // Refresh data after a delay
      setTimeout(() => {
        loadFaucetData();
        onClaimSuccess?.();
      }, 3000);

    } catch (err: any) {
      console.error('Claim error:', err);
      setError(err.message || 'Failed to claim');
    } finally {
      setIsClaiming(false);
    }
  };

  // Determine eligibility status
  const getEligibilityStatus = () => {
    if (isPaused) return { canClaim: false, reason: 'Faucet is currently paused' };
    if (!hasNFT) return { canClaim: false, reason: 'You need a ZKPassport NFT to claim' };
    if (alreadyClaimed) return { canClaim: false, reason: 'You have already claimed' };
    if (parseFloat(faucetBalance) < parseFloat(claimAmount)) {
      return { canClaim: false, reason: 'Faucet is empty' };
    }
    return { canClaim: true, reason: 'You are eligible to claim!' };
  };

  const eligibility = getEligibilityStatus();

  if (isLoading) {
    return (
      <div className="bg-gray-900 border border-cyan-500/30 rounded-xl p-6">
        <div className="flex items-center justify-center gap-3">
          <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-cyan-400 font-mono">LOADING_FAUCET_DATA...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-cyan-500/30 rounded-xl p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <span className="text-3xl">🚰</span>
        <div>
          <h2 className="text-xl font-bold text-cyan-400 font-mono">CLAIM_FAUCET</h2>
          <p className="text-gray-500 text-sm font-mono">Get ETH for verified humans</p>
        </div>
      </div>

      {/* Network Badge */}
      <div className="flex items-center justify-between">
        <div className={`px-3 py-1 rounded-full text-xs font-mono font-bold ${
          networkName === 'base' 
            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
            : 'bg-pink-500/20 text-pink-400 border border-pink-500/30'
        }`}>
          {networkName.toUpperCase()} MAINNET
        </div>
        <span className={`text-xs font-mono ${isPaused ? 'text-red-400' : 'text-green-400'}`}>
          {isPaused ? '⏸ PAUSED' : '● ACTIVE'}
        </span>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-800/50 border border-cyan-500/20 rounded-lg p-4">
          <p className="text-xs text-gray-500 font-mono mb-1">CLAIM_AMOUNT</p>
          <p className="text-2xl font-bold text-cyan-400 font-mono">{claimAmount} ETH</p>
          <p className="text-xs text-gray-600 font-mono mt-1">per verified human</p>
        </div>
        <div className="bg-gray-800/50 border border-purple-500/20 rounded-lg p-4">
          <p className="text-xs text-gray-500 font-mono mb-1">VAULT_BALANCE</p>
          <p className="text-2xl font-bold text-purple-400 font-mono">{parseFloat(faucetBalance).toFixed(4)} ETH</p>
          <p className="text-xs text-gray-600 font-mono mt-1">available to claim</p>
        </div>
      </div>

      {/* NFT Contract Info */}
      <div className="bg-gray-800/30 border border-green-500/20 rounded-lg p-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-mono">REQUIRED_NFT_CONTRACT</p>
            <p className="text-xs text-green-400 font-mono mt-1">ZKPassport Soulbound NFT</p>
          </div>
          <a
            href={getAddressExplorerUrl(chainId, linkedNFTContract || addresses.ZKPassportNFT)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-cyan-400 font-mono hover:underline"
          >
            {linkedNFTContract ? `${linkedNFTContract.slice(0, 6)}...${linkedNFTContract.slice(-4)}` : 'View →'}
          </a>
        </div>
      </div>

      {/* Eligibility Checklist */}
      <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-4 space-y-3">
        <p className="text-sm text-gray-400 font-mono font-bold">ELIGIBILITY_CHECK</p>
        
        <div className="flex items-center gap-2">
          <span className={hasNFT ? 'text-green-400' : 'text-red-400'}>
            {hasNFT ? '✓' : '✗'}
          </span>
          <span className={`text-sm font-mono ${hasNFT ? 'text-green-400' : 'text-gray-400'}`}>
            ZKPassport NFT Holder
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className={!alreadyClaimed ? 'text-green-400' : 'text-red-400'}>
            {!alreadyClaimed ? '✓' : '✗'}
          </span>
          <span className={`text-sm font-mono ${!alreadyClaimed ? 'text-green-400' : 'text-gray-400'}`}>
            First-time claimer
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className={!isPaused ? 'text-green-400' : 'text-red-400'}>
            {!isPaused ? '✓' : '✗'}
          </span>
          <span className={`text-sm font-mono ${!isPaused ? 'text-green-400' : 'text-gray-400'}`}>
            Faucet active
          </span>
        </div>
      </div>

      {/* Eligibility Message */}
      <div className={`p-4 rounded-lg border ${
        eligibility.canClaim 
          ? 'bg-green-500/10 border-green-500/30' 
          : 'bg-yellow-500/10 border-yellow-500/30'
      }`}>
        <p className={`font-mono text-sm ${
          eligibility.canClaim ? 'text-green-400' : 'text-yellow-400'
        }`}>
          {eligibility.canClaim ? '✓ ' : '⚠ '}{eligibility.reason}
        </p>
      </div>

      {/* Claim Button */}
      <button
        onClick={handleClaim}
        disabled={!eligibility.canClaim || isClaiming}
        className={`w-full py-4 rounded-lg font-mono font-bold text-lg transition-all ${
          eligibility.canClaim && !isClaiming
            ? 'bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white'
            : 'bg-gray-700 text-gray-500 cursor-not-allowed'
        }`}
      >
        {isClaiming ? (
          <span className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            CLAIMING...
          </span>
        ) : (
          `CLAIM ${claimAmount} ETH`
        )}
      </button>

      {/* Success Message */}
      {txHash && (
        <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
          <p className="text-green-400 font-mono text-sm mb-2">✓ CLAIM_SUCCESS!</p>
          <a
            href={getExplorerUrl(chainId, txHash)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-green-400 font-mono hover:underline break-all"
          >
            View transaction: {txHash.slice(0, 20)}...
          </a>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-red-400 font-mono text-sm">✗ {error}</p>
        </div>
      )}

      {/* NFT Link */}
      {!hasNFT && (
        <div className="text-center">
          <a
            href="/sybil"
            className="text-cyan-400 font-mono text-sm hover:underline"
          >
            → Get your ZKPassport NFT to become eligible
          </a>
        </div>
      )}

      {/* Contract Info Footer */}
      <div className="bg-gray-800/20 rounded-lg p-3 space-y-1">
        <p className="text-xs text-gray-600 font-mono">FAUCET_CONTRACT</p>
        <a
          href={getAddressExplorerUrl(chainId, addresses.FaucetVault)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-gray-500 font-mono hover:text-cyan-400 break-all"
        >
          {addresses.FaucetVault}
        </a>
      </div>

      {/* Refresh Button */}
      <button
        onClick={loadFaucetData}
        className="w-full py-2 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg text-gray-400 font-mono text-sm transition-all"
      >
        ↻ REFRESH_STATUS
      </button>
    </div>
  );
};

export default FaucetClaim;

