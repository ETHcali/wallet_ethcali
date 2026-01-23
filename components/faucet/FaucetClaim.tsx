import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useWallets, useSendTransaction } from '@privy-io/react-auth';
import { formatEther } from 'viem';
import { logger } from '../../utils/logger';
import {
  hasNFTByAddress,
  isFaucetPaused,
  getClaimTxData,
  getExplorerUrl,
  getNetworkName,
  getActiveVaults,
  canUserClaim,
  getClaimInfo,
} from '../../utils/contracts';
import { VaultType } from '../../types/faucet';

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
  const [claimingVaultId, setClaimingVaultId] = useState<number | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Faucet state
  const [hasNFT, setHasNFT] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [activeVaults, setActiveVaults] = useState<any[]>([]);
  const [vaultClaimInfo, setVaultClaimInfo] = useState<Record<number, any>>({});
  const [vaultEligibility, setVaultEligibility] = useState<Record<number, { canClaim: boolean; reason: string }>>({});

  const networkName = getNetworkName(chainId);

  const loadFaucetData = useCallback(async () => {
    if (!userWallet?.address) return;

    setIsLoading(true);
    setError(null);

    try {
      const [nftOwned, paused, vaults] = await Promise.all([
        hasNFTByAddress(chainId, userWallet.address),
        isFaucetPaused(chainId),
        getActiveVaults(chainId),
      ]);

      setHasNFT(nftOwned);
      setIsPaused(paused);
      setActiveVaults(vaults);

      // Fetch claim info and eligibility for each vault
      if (vaults.length > 0) {
        const claimInfoPromises = vaults.map(async (vault) => {
          const [claimInfo, eligibility] = await Promise.all([
            getClaimInfo(chainId, vault.id, userWallet.address),
            canUserClaim(chainId, vault.id, userWallet.address),
          ]);
          return { vaultId: vault.id, claimInfo, eligibility };
        });

        const results = await Promise.all(claimInfoPromises);
        const claimInfoMap: Record<number, any> = {};
        const eligibilityMap: Record<number, { canClaim: boolean; reason: string }> = {};

        results.forEach(({ vaultId, claimInfo, eligibility }) => {
          claimInfoMap[vaultId] = claimInfo;
          eligibilityMap[vaultId] = eligibility;
        });

        setVaultClaimInfo(claimInfoMap);
        setVaultEligibility(eligibilityMap);
      }
    } catch (err) {
      logger.error('Error loading faucet data:', err);
      setError('LOAD_ERROR');
    } finally {
      setIsLoading(false);
    }
  }, [chainId, userWallet?.address]);

  useEffect(() => {
    loadFaucetData();
  }, [loadFaucetData]);

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

  const handleClaim = async (vaultId: number) => {
    if (!userWallet) return;

    setIsClaiming(true);
    setClaimingVaultId(vaultId);
    setError(null);
    setTxHash(null);

    try {
      const switched = await switchWalletChain();
      if (!switched) {
        throw new Error('NETWORK_SWITCH_FAILED');
      }

      const txData = getClaimTxData(chainId, vaultId);

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
        setTxHash(null);
        loadFaucetData();
        onClaimSuccess?.();
      }, 3000);

    } catch (err: any) {
      logger.error('Claim error:', err);
      setError(err.message || 'CLAIM_FAILED');
    } finally {
      setIsClaiming(false);
      setClaimingVaultId(null);
    }
  };

  const getVaultEligibilityStatus = (vault: any) => {
    if (isPaused) return { canClaim: false, code: 'PAUSED', message: 'Faucet is paused' };
    if (!hasNFT) return { canClaim: false, code: 'NO_NFT', message: 'ZKPASSPORT required' };
    
    const eligibility = vaultEligibility[vault.id];
    if (eligibility) {
      if (!eligibility.canClaim) {
        return { canClaim: false, code: eligibility.reason.toUpperCase().replace(/\s+/g, '_'), message: eligibility.reason };
      }
    }

    const claimInfo = vaultClaimInfo[vault.id];
    if (claimInfo?.hasClaimed) {
      return { canClaim: false, code: 'CLAIMED', message: 'Already claimed from this vault' };
    }

    const vaultBalance = parseFloat(formatEther(vault.balance));
    const claimAmount = parseFloat(formatEther(vault.claimAmount));
    if (vaultBalance < claimAmount) {
      return { canClaim: false, code: 'EMPTY', message: 'Vault balance insufficient' };
    }

    return { canClaim: true, code: 'ELIGIBLE', message: 'Ready to claim' };
  };

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

  // No vaults created
  if (activeVaults.length === 0) {
    return (
      <div className="bg-black/60 border border-gray-700/40 rounded-lg p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
          <div>
            <h2 className="text-sm font-bold text-gray-400 font-mono tracking-wide">NO_FAUCET</h2>
            <p className="text-gray-600 text-[10px] font-mono">{networkName.toUpperCase()}</p>
          </div>
        </div>
        <div className="text-center py-6">
          <div className="text-gray-500 text-[10px] font-mono mb-2">
            THERE IS NO FAUCET CREATED
          </div>
          <div className="text-gray-700 text-[9px] font-mono">
            • WAITING_FOR_ADMIN • NO_VAULTS_AVAILABLE
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Status Bar */}
      <div className="bg-black/60 border border-green-500/30 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
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

        {/* Eligibility Checks - Minimal */}
        <div className="space-y-1.5 text-[10px] font-mono">
          <div className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${hasNFT ? 'bg-green-500' : 'bg-gray-600'}`}></div>
            <span className={hasNFT ? 'text-green-400' : 'text-gray-600'}>ZKPASSPORT</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${!isPaused ? 'bg-green-500' : 'bg-gray-600'}`}></div>
            <span className={!isPaused ? 'text-green-400' : 'text-gray-600'}>FAUCET_ACTIVE</span>
          </div>
        </div>

        {/* Get NFT Link */}
        {!hasNFT && (
          <Link
            href="/sybil"
            className="block mt-3 text-center text-[10px] text-cyan-500/70 hover:text-cyan-400 font-mono transition-colors"
          >
            GET_ZKPASSPORT →
          </Link>
        )}
      </div>

      {/* Vaults List */}
      {activeVaults.map((vault) => {
        const eligibility = getVaultEligibilityStatus(vault);
        const claimInfo = vaultClaimInfo[vault.id];
        const claimAmount = formatEther(vault.claimAmount);
        const vaultBalance = formatEther(vault.balance);
        const isReturnable = vault.vaultType === VaultType.Returnable;

        return (
          <div key={vault.id} className="bg-black/60 border border-green-500/30 rounded-lg p-4 space-y-3">
            {/* Vault Header */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-bold text-green-400 font-mono tracking-wide mb-1">
                  {vault.name}
                </h3>
                {vault.description && (
                  <p className="text-[9px] text-gray-600 font-mono mb-2">{vault.description}</p>
                )}
                <div className="flex gap-2 text-[9px] font-mono">
                  <span className={`px-2 py-0.5 rounded ${
                    isReturnable 
                      ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30' 
                      : 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                  }`}>
                    {isReturnable ? 'RETURNABLE' : 'NON-RETURNABLE'}
                  </span>
                  {vault.whitelistEnabled && (
                    <span className="px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-400 border border-yellow-500/30">
                      WHITELIST
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-black/40 rounded p-3">
                <p className="text-[9px] text-gray-600 font-mono tracking-wider mb-1">CLAIM</p>
                <p className="text-lg font-bold text-green-400 font-mono">{parseFloat(claimAmount).toFixed(4)}</p>
                <p className="text-[9px] text-gray-700 font-mono">ETH</p>
              </div>
              <div className="bg-black/40 rounded p-3">
                <p className="text-[9px] text-gray-600 font-mono tracking-wider mb-1">VAULT</p>
                <p className="text-lg font-bold text-cyan-400 font-mono">{parseFloat(vaultBalance).toFixed(4)}</p>
                <p className="text-[9px] text-gray-700 font-mono">ETH</p>
              </div>
            </div>

            {/* Claim Status */}
            {claimInfo?.hasClaimed && (
              <div className="p-2 bg-gray-900/50 border border-gray-700 rounded">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                  <span className="text-[10px] text-gray-400 font-mono tracking-wider">CLAIMED</span>
                </div>
                <div className="text-[9px] font-mono text-gray-600">
                  Amount: {claimInfo.claimedAmount} ETH
                </div>
                {isReturnable && claimInfo.hasReturned && (
                  <div className="text-[9px] font-mono text-gray-600 mt-1">
                    Returned: {claimInfo.returnedAmount} ETH
                  </div>
                )}
              </div>
            )}

            {/* Status Message */}
            {!claimInfo?.hasClaimed && (
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
                {eligibility.message && (
                  <p className="font-mono text-[9px] text-gray-600 mt-1">{eligibility.message}</p>
                )}
              </div>
            )}

            {/* Claim Button */}
            {!claimInfo?.hasClaimed && (
              <button
                onClick={() => handleClaim(vault.id)}
                disabled={!eligibility.canClaim || isClaiming}
                className={`w-full py-3 rounded font-mono font-bold text-sm transition-all ${
                  eligibility.canClaim && !isClaiming && claimingVaultId !== vault.id
                    ? 'bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 text-green-400'
                    : 'bg-gray-900/50 border border-gray-700 text-gray-600 cursor-not-allowed'
                }`}
              >
                {isClaiming && claimingVaultId === vault.id ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-3 h-3 border-2 border-green-400 border-t-transparent rounded-full animate-spin"></div>
                    CLAIMING...
                  </span>
                ) : (
                  `CLAIM ${parseFloat(claimAmount).toFixed(4)} ETH →`
                )}
              </button>
            )}

            {/* Success for this vault */}
            {txHash && claimingVaultId === vault.id && (
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
          </div>
        );
      })}

      {/* Error */}
      {error && (
        <div className="p-2 bg-red-500/10 border border-red-500/30 rounded">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span className="text-[10px] text-red-400 font-mono tracking-wider">{error}</span>
          </div>
        </div>
      )}

      {/* Refresh */}
      <button
        onClick={loadFaucetData}
        className="w-full py-2 text-[10px] text-gray-600 hover:text-gray-400 font-mono bg-black/60 border border-gray-700/40 rounded-lg"
      >
        REFRESH
      </button>
    </div>
  );
};

export default FaucetClaim;
