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
import { RefreshIcon } from '../shared/icons';
import { useTokenPrices } from '../../hooks/useTokenPrices';
import { formatUsd } from '../../utils/money';
import { formatTokenBalance } from '../../utils/tokenUtils';
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
  const { getPriceForToken } = useTokenPrices();

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

  const getVaultEligibilityStatus = (vault: ActiveVault): { canClaim: boolean; message: string } => {
    if (isPaused) return { canClaim: false, message: 'The faucet is paused right now.' };
    if (!hasNFT) return { canClaim: false, message: 'Verify your identity first — this faucet is for verified people.' };

    const eligibility = vaultEligibility[vault.id];
    if (eligibility && !eligibility.canClaim) {
      return { canClaim: false, message: eligibility.reason || 'This wallet cannot claim from this vault.' };
    }

    const claimInfo = vaultClaimInfo[vault.id];
    if (claimInfo?.hasClaimed) {
      return { canClaim: false, message: 'You already claimed from this vault.' };
    }

    if (vault.balance < vault.claimAmount) {
      return { canClaim: false, message: 'This vault is empty for now.' };
    }

    return { canClaim: true, message: 'You can claim.' };
  };

  /** ETH with its dollar value beside it. */
  const ethLabel = (wei: bigint) => {
    const eth = Number(formatEther(wei));
    const price = getPriceForToken('ETH').price;
    return { eth: formatTokenBalance(formatEther(wei), 4), usd: price > 0 ? formatUsd(eth * price, { cents: true }) : null };
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[96px] items-center justify-center gap-3 rounded-card border border-line-hairline bg-surface-slab text-sm text-content-muted">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-eth-blue border-t-transparent" aria-hidden />
        Loading the faucet…
      </div>
    );
  }

  if (activeVaults.length === 0) {
    return (
      <div className="rounded-card border border-line-hairline bg-surface-slab px-5 py-8 text-center">
        <p className="mb-0 text-[15px] font-semibold text-content-primary">No faucet open right now</p>
        <p className="mx-auto mb-0 mt-1 max-w-sm text-sm text-content-muted">
          When ETH Cali opens a vault for an event or a hackathon, you can claim a little ETH for gas here.
        </p>
        <Link
          href="/wallet"
          className="mt-5 inline-flex min-h-tap items-center justify-center rounded-control border border-line-strong px-5 text-sm font-semibold text-content-primary transition-colors hover:border-line-brand hover:text-eth-blue-text"
        >
          Back to wallet
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Requirements */}
      <section className="rounded-card border border-line-hairline bg-surface-slab px-5 py-4" aria-label="Requirements">
        <ul className="space-y-2 text-sm">
          <li className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${hasNFT ? 'bg-signal-confirmed' : 'bg-surface-ridge'}`} aria-hidden />
            <span className={hasNFT ? 'text-content-primary' : 'text-content-muted'}>
              {hasNFT ? 'Identity verified' : 'Identity not verified yet'}
            </span>
            {!hasNFT && (
              <Link href="/sybil" className="ml-auto inline-flex min-h-[44px] items-center font-semibold text-eth-blue-text hover:underline">
                Verify
              </Link>
            )}
          </li>
          <li className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${!isPaused ? 'bg-signal-confirmed' : 'bg-signal-reverted'}`} aria-hidden />
            <span className={!isPaused ? 'text-content-primary' : 'text-content-muted'}>
              {isPaused ? 'Faucet paused' : 'Faucet open'}
            </span>
          </li>
        </ul>
      </section>

      {activeVaults.map((vault) => {
        const eligibility = getVaultEligibilityStatus(vault);
        const claimInfo = vaultClaimInfo[vault.id];
        const claim = ethLabel(vault.claimAmount);
        const left = ethLabel(vault.balance);
        const isReturnable = vault.vaultType === VaultType.Returnable;
        const explorerLink = txHash ? explorerTx(chainId, txHash) : undefined;
        const claimingThis = isClaiming && claimingVaultId === vault.id;

        return (
          <section key={vault.id} className="space-y-4 rounded-card border border-line-hairline bg-surface-slab p-5" aria-label={vault.name}>
            <div>
              <h2 className="text-lg font-bold leading-tight text-content-primary">{vault.name}</h2>
              {vault.description && <p className="mb-0 mt-1 text-sm text-content-muted">{vault.description}</p>}
              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                <span className="rounded-chip bg-surface-inset px-2 py-0.5 text-content-secondary">
                  {isReturnable ? 'Return it later' : 'Yours to keep'}
                </span>
                {vault.whitelistEnabled && (
                  <span className="rounded-chip bg-surface-inset px-2 py-0.5 text-content-secondary">Invite list</span>
                )}
              </div>
            </div>

            <dl className="grid grid-cols-2 gap-2">
              <div className="min-w-0 rounded-control bg-surface-inset px-3 py-2.5">
                <dt className="text-xs text-content-muted">You get</dt>
                <dd className="truncate font-mono text-lg tabular-nums text-content-primary">{claim.eth} ETH</dd>
                <dd className="font-mono text-xs text-content-faint">{claim.usd ?? '—'}</dd>
              </div>
              <div className="min-w-0 rounded-control bg-surface-inset px-3 py-2.5">
                <dt className="text-xs text-content-muted">Left in vault</dt>
                <dd className="truncate font-mono text-lg tabular-nums text-content-primary">{left.eth} ETH</dd>
                <dd className="font-mono text-xs text-content-faint">{left.usd ?? '—'}</dd>
              </div>
            </dl>

            {claimInfo?.hasClaimed ? (
              <p className="mb-0 rounded-control bg-surface-inset px-4 py-3 text-sm text-content-secondary">
                Claimed <span className="font-mono">{claimInfo.claimedAmount} ETH</span>
                {isReturnable && claimInfo.hasReturned && (
                  <>
                    {' '}· returned <span className="font-mono">{claimInfo.returnedAmount} ETH</span>
                  </>
                )}
              </p>
            ) : (
              !eligibility.canClaim && <p className="mb-0 text-sm text-content-muted">{eligibility.message}</p>
            )}

            {/* One primary action: switch first, then claim */}
            {!claimInfo?.hasClaimed && eligibility.canClaim && !chain.ready && <SwitchChainButton chain={chain} />}

            {!claimInfo?.hasClaimed && (eligibility.canClaim ? chain.ready : true) && (
              <button
                type="button"
                onClick={() => handleClaim(vault.id)}
                disabled={!eligibility.canClaim || isClaiming}
                className="flex min-h-tap w-full items-center justify-center gap-2 rounded-control bg-eth-blue px-5 text-[15px] font-semibold text-on-brand transition-colors hover:bg-eth-blue-lift disabled:cursor-not-allowed disabled:bg-surface-ridge disabled:text-content-faint"
              >
                {claimingThis && <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden />}
                {claimingThis ? 'Claiming…' : `Claim ${claim.eth} ETH`}
              </button>
            )}

            {txHash && claimingVaultId === vault.id && (
              <p className="mb-0 rounded-control border border-signal-confirmed/30 bg-signal-confirmed/10 px-4 py-3 text-sm text-content-primary">
                Claimed. The ETH is on its way.{' '}
                {explorerLink ? (
                  <a href={explorerLink} target="_blank" rel="noopener noreferrer" className="font-mono text-eth-blue-text hover:underline">
                    {txHash.slice(0, 6)}…{txHash.slice(-4)} ↗
                  </a>
                ) : (
                  <span className="font-mono">{txHash.slice(0, 6)}…{txHash.slice(-4)}</span>
                )}
              </p>
            )}
          </section>
        );
      })}

      {error && (
        <p role="alert" className="mb-0 rounded-control border border-signal-reverted/30 bg-signal-reverted/10 px-4 py-3 text-sm text-signal-reverted">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={loadFaucetData}
        className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-control text-sm font-medium text-content-muted transition-colors hover:text-content-primary"
      >
        <RefreshIcon className="h-4 w-4" />
        Refresh
      </button>
    </div>
  );
};

export default FaucetClaim;
