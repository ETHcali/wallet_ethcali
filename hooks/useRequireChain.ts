/**
 * "Is the active wallet on the chain this action needs, and if not, move it."
 *
 * A feature that lives on one chain (swag on Base) never reads a global
 * network selector. It asks this hook, and shows a single "Switch to <chain>"
 * primary button right before signing when `ready` is false (frontend-ux
 * rule 2: the wrong-network check comes before approve and execute).
 */
import { useCallback, useState } from 'react';
import { NETWORK_NAMES, type ChainId } from '../config/constants';
import { useActiveWallet } from './useActiveWallet';

/** Privy reports the chain as CAIP-2 ("eip155:8453"); older shapes were bare numbers. */
export function parseWalletChainId(raw: string | number | undefined): number | undefined {
  if (raw === undefined || raw === null) return undefined;
  if (typeof raw === 'number') return raw;
  const tail = raw.split(':').pop();
  const parsed = tail ? parseInt(tail, 10) : NaN;
  return Number.isNaN(parsed) ? undefined : parsed;
}

export interface RequireChainResult {
  /** True when a wallet is connected and already on `chainId`. */
  ready: boolean;
  /** True while the wallet is being asked to switch. */
  switching: boolean;
  /** Ask the wallet to move. Resolves true on success, false otherwise. */
  switchTo: () => Promise<boolean>;
  error: string | null;
  walletChainId: number | undefined;
  chainName: string;
}

export function useRequireChain(chainId: ChainId): RequireChainResult {
  const { wallet } = useActiveWallet();
  const [switching, setSwitching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const walletChainId = parseWalletChainId(wallet?.chainId);
  const chainName = NETWORK_NAMES[chainId];
  const ready = Boolean(wallet) && walletChainId === chainId;

  const switchTo = useCallback(async (): Promise<boolean> => {
    if (!wallet) return false;
    setSwitching(true);
    setError(null);
    try {
      await wallet.switchChain(chainId);
      return true;
    } catch {
      setError(`Could not switch to ${chainName}. Change the network in your wallet and try again.`);
      return false;
    } finally {
      // Cleared in finally so a rejected switch never locks the button.
      setSwitching(false);
    }
  }, [wallet, chainId, chainName]);

  return { ready, switching, switchTo, error, walletChainId, chainName };
}
