import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSendTransaction } from '@privy-io/react-auth';
import { formatEther } from 'viem';
import { logger } from '../../utils/logger';
import {
  hasNFTByAddress,
  isFaucetPaused,
  getClaimTxData,
  getActiveVaults,
  canUserClaim,
  getClaimInfo,
  type ActiveVault,
  type ClaimInfo,
} from '../../utils/contracts';
import { explorerTx, getChain } from '../../config/chains';
import { useActiveWallet } from '../../hooks/useActiveWallet';
import { useRequireChain } from '../../hooks/useRequireChain';
import SwitchChainButton from '../shared/SwitchChainButton';
import { VaultType } from '../../types/faucet';

interface FaucetClaimProps {
  /** The chain the page reads from (Ethereum). Every read below uses it. */
  chainId: number;
  onClaimSuccess?: () => void;
}

const FaucetClaim: React.FC<FaucetClaimProps> = ({ chainId, onClaimSuccess }) => {
  const { wallet: userWallet } = useActiveWallet();
  const { sendTransaction } = useSendTransaction();
  // The wallet is moved right before signing, never before reading.
  const chain = useRequireChain(chainId);

  const [isLoading, setIsLoading] = useState(true);
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimingVaultId, setClaimingVaultId] = useState<number | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Faucet state
  const [hasNFT, setHasNFT] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [activeVaults, setActiveVaults] = useState<ActiveVault[]>([]);
  const [vaultClaimInfo, setVaultClaimInfo] = useState<Record<number, ClaimInfo | null>>({});
  const [vaultEligibility, setVaultEligibility] = useState<Record<number, { canClaim: boolean; reason: string }>>({});

  const networkName = getChain(chainId)?.name ?? 'Unsupported network';

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
        const results = await Promise.all(
          vaults.map(async (vault) => {
            const [claimInfo, eligibility] = await Promise.all([
              getClaimInfo(chainId, vault.id, userWallet.address),
              canUserClaim(chainId, vault.id, userWallet.address),
            ]);
            return { vaultId: vault.id, claimInfo, eligibility };
          })
        );

        const claimInfoMap: Record<number, ClaimInfo | null> = {};
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
      setError('Could not load the faucet');
    } finally {
      setIsLoading(false);
    }
  }, [chainId, userWallet?.address]);

  useEffect(() => {
    loadFaucetData();
  }, [loadFaucetData]);

  const handleClaim = async (vaultId: number) => {
    if (!userWallet) return;

    setIsClaiming(true);
    setClaimingVaultId(vaultId);
    setError(null);
    setTxHash(null);

    try {
      // The switch button is shown first; this catches a wallet that drifted
      // between render and click rather than signing on the wrong chain.
      if (!chain.ready) {
        const switched = await chain.switchTo();
        if (!switched) throw new Error(`Switch your wallet to ${chain.chainName} to claim.`);
      }

      const txData = getClaimTxData(chainId, vaultId);
      if (!txData) throw new Error(`The faucet is not deployed on ${networkName}.`);

      const result = await sendTransaction(
        { to: txData.to, data: txData.data, chainId },
        { sponsor: true }
      );

      setTxHash(result.hash);

      setTimeout(() => {
        setTxHash(null);
        loadFaucetData();
        onClaimSuccess?.();
      }, 3000);

    } catch (err: any) {
      logger.error('Claim error:', err);
      setError(err.message || 'Claim failed. Nothing left the faucet.');
    } finally {
      // Always released, or a rejected claim locks every vault's button.
      setIsClaiming(false);
      setClaimingVaultId(null);
    }
  };

  const getVaultEligibilityStatus = (vault: ActiveVault) => {
    if (isPaused) return { canClaim: false, code: 'PAUSED', message: 'Faucet is paused' };
    if (!hasNFT) return { canClaim: false, code: 'NO_NFT', message: 'ZKPassport required' };

    const eligibility = vaultEligibility[vault.id];
    if (eligibility) {
      if (!eligibility.canClaim) {
        const reason = eligibility.reason || 'Not eligible';
        return { canClaim: false, code: reason.toUpperCase().replace(/\s+/g, '_'), message: reason };
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
      <div className="bg-black/60 border border-line-hairline rounded-control p-4">
        <div className="flex items-center justify-center gap-3">
          <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
          <span className="text-content-primary font-mono text-[10px] tracking-wider">Loading…</span>
        </div>
      </div>
    );
  }

  // No vaults created
  if (activeVaults.length === 0) {
    return (
      <div className="bg-black/60 border border-line-hairline rounded-control p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-3 h-3 bg-surface-ridge rounded-full"></div>
          <h2 className="text-sm font-bold text-content-muted font-mono tracking-wide">NO_FAUCET</h2>
        </div>
        <div className="text-center py-6">
          <div className="text-content-faint text-[10px] font-mono mb-2">
            THERE IS NO FAUCET CREATED
          </div>
          <div className="text-content-faint text-[9px] font-mono">
            • WAITING_FOR_ADMIN • NO_VAULTS_AVAILABLE
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Status Bar */}
      <div className="bg-black/60 border border-line-hairline rounded-control p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className={`w-1.5 h-1.5 rounded-full ${isPaused ? 'bg-signal-reverted' : 'bg-signal-confirmed'}`}></div>
          <span className="text-[10px] font-mono text-content-faint tracking-wider">
            {isPaused ? 'PAUSED' : 'ACTIVE'}
          </span>
        </div>

        {/* Eligibility Checks - Minimal */}
        <div className="space-y-1.5 text-[10px] font-mono">
          <div className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${hasNFT ? 'bg-signal-confirmed' : 'bg-surface-ridge'}`}></div>
            <span className={hasNFT ? 'text-signal-confirmed' : 'text-content-faint'}>ZKPassport</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${!isPaused ? 'bg-signal-confirmed' : 'bg-surface-ridge'}`}></div>
            <span className={!isPaused ? 'text-signal-confirmed' : 'text-content-faint'}>Faucet active</span>
          </div>
        </div>

        {/* Get NFT Link */}
        {!hasNFT && (
          <Link
            href={{ pathname: '/sybil', query: { chain: String(chainId) } }}
            className="block mt-3 text-center text-[10px] text-eth-blue-text/70 hover:text-eth-blue-text font-mono transition-colors"
          >
            GET_ZKPassport →
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
        const explorerLink = txHash ? explorerTx(chainId, txHash) : undefined;

        return (
          <div key={vault.id} className="bg-black/60 border border-line-hairline rounded-control p-4 space-y-3">
            {/* Vault Header */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-bold text-content-primary font-mono tracking-wide mb-1">
                  {vault.name}
                </h3>
                {vault.description && (
                  <p className="text-[9px] text-content-faint font-mono mb-2">{vault.description}</p>
                )}
                <div className="flex gap-2 text-[9px] font-mono">
                  <span className="px-2 py-0.5 rounded-chip bg-eth-blue/10 text-eth-blue-text border border-eth-blue/30">
                    {isReturnable ? 'RETURNABLE' : 'NON-RETURNABLE'}
                  </span>
                  {vault.whitelistEnabled && (
                    <span className="px-2 py-0.5 rounded-chip bg-signal-pending/10 text-signal-pending border border-signal-pending/30">
                      WHITELIST
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-black/40 rounded-chip p-3">
                <p className="text-[9px] text-content-faint font-mono tracking-wider mb-1">CLAIM</p>
                <p className="text-lg font-bold text-eth-blue-text font-mono">{parseFloat(claimAmount).toFixed(4)}</p>
                <p className="text-[9px] text-content-faint font-mono">ETH</p>
              </div>
              <div className="bg-black/40 rounded-chip p-3">
                <p className="text-[9px] text-content-faint font-mono tracking-wider mb-1">VAULT</p>
                <p className="text-lg font-bold text-eth-blue-text font-mono">{parseFloat(vaultBalance).toFixed(4)}</p>
                <p className="text-[9px] text-content-faint font-mono">ETH</p>
              </div>
            </div>

            {/* Claim Status */}
            {claimInfo?.hasClaimed && (
              <div className="p-2 bg-surface-slab/50 border border-line-hairline rounded-chip">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-surface-ridge rounded-full"></div>
                  <span className="text-[10px] text-content-muted font-mono tracking-wider">CLAIMED</span>
                </div>
                <div className="text-[9px] font-mono text-content-faint">
                  Amount: {claimInfo.claimedAmount} ETH
                </div>
                {isReturnable && claimInfo.hasReturned && (
                  <div className="text-[9px] font-mono text-content-faint mt-1">
                    Returned: {claimInfo.returnedAmount} ETH
                  </div>
                )}
              </div>
            )}

            {/* Status Message */}
            {!claimInfo?.hasClaimed && (
              <div className={`p-2 rounded-chip border ${
                eligibility.canClaim
                  ? 'bg-signal-confirmed/10 border-signal-confirmed/30'
                  : 'bg-surface-slab/50 border-line-hairline'
              }`}>
                <p className={`font-mono text-[10px] tracking-wider ${
                  eligibility.canClaim ? 'text-signal-confirmed' : 'text-content-faint'
                }`}>
                  STATUS: {eligibility.code}
                </p>
                {eligibility.message && (
                  <p className="font-mono text-[9px] text-content-faint mt-1">{eligibility.message}</p>
                )}
              </div>
            )}

            {/* One primary action: switch first, then claim */}
            {!claimInfo?.hasClaimed && eligibility.canClaim && !chain.ready && (
              <SwitchChainButton chain={chain} />
            )}

            {!claimInfo?.hasClaimed && (eligibility.canClaim ? chain.ready : true) && (
              <button
                onClick={() => handleClaim(vault.id)}
                disabled={!eligibility.canClaim || isClaiming}
                className={`w-full min-h-tap rounded-chip font-mono font-bold text-sm transition-all ${
                  eligibility.canClaim && !isClaiming
                    ? 'bg-eth-blue hover:bg-eth-blue-lift text-on-brand'
                    : 'bg-surface-slab/50 border border-line-hairline text-content-faint cursor-not-allowed'
                }`}
              >
                {isClaiming && claimingVaultId === vault.id ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-3 h-3 border-2 border-signal-confirmed border-t-transparent rounded-full animate-spin"></div>
                    CLAIMING...
                  </span>
                ) : (
                  `CLAIM ${parseFloat(claimAmount).toFixed(4)} ETH →`
                )}
              </button>
            )}

            {/* Success for this vault */}
            {txHash && claimingVaultId === vault.id && (
              <div className="p-2 bg-signal-confirmed/10 border border-signal-confirmed/30 rounded-chip">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-signal-confirmed rounded-full"></div>
                  <span className="text-[10px] text-signal-confirmed font-mono tracking-wider">SUCCESS</span>
                </div>
                {explorerLink ? (
                  <a
                    href={explorerLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[9px] text-content-faint hover:text-eth-blue-text font-mono"
                  >
                    tx: {txHash.slice(0, 10)}…{txHash.slice(-6)} →
                  </a>
                ) : (
                  <span className="text-[9px] text-content-faint font-mono">tx: {txHash.slice(0, 10)}…{txHash.slice(-6)}</span>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Error */}
      {error && (
        <div className="p-2 bg-signal-reverted/10 border border-signal-reverted/30 rounded-chip">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-signal-reverted rounded-full"></div>
            <span className="text-[10px] text-signal-reverted font-mono tracking-wider">{error}</span>
          </div>
        </div>
      )}

      {/* Refresh */}
      <button
        onClick={loadFaucetData}
        className="w-full py-2 text-[10px] text-content-faint hover:text-content-muted font-mono bg-black/60 border border-line-hairline rounded-control"
      >
        REFRESH
      </button>
    </div>
  );
};

export default FaucetClaim;
