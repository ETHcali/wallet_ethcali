/**
 * "Is the active wallet on the chain this action needs, and if not, move it."
 *
 * The one chain-switch primitive. A feature never reads the wallet's network:
 * it reads with an explicit chain id and asks this hook right before signing.
 * When `ready` is false the UI shows a single "Switch to <chain>" primary
 * button (frontend-ux rule 2: the wrong-network check comes before approve
 * and execute). Every feature signs on Ethereum; the ethcali.eth claim is the
 * one that asks for Base.
 *
 * Switching goes through Privy's `wallet.switchChain`, which adds the chain to
 * an external wallet when it is missing and is a no-op prompt for an embedded
 * one. No raw `wallet_switchEthereumChain` anywhere else.
 */
import { useCallback, useState } from 'react';
import { getChain, type ChainInfo } from '../config/chains';
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
  /** The registry entry for `chainId`, or undefined for an unsupported id. */
  chain: ChainInfo | undefined;
  walletChainId: number | undefined;
  chainName: string;
}

export function useRequireChain(chainId: number): RequireChainResult {
  const { wallet } = useActiveWallet();
  const [switching, setSwitching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chain = getChain(chainId);
  const chainName = chain?.name ?? `chain ${chainId}`;
  const walletChainId = parseWalletChainId(wallet?.chainId);
  const ready = Boolean(wallet) && Boolean(chain) && walletChainId === chainId;

  const switchTo = useCallback(async (): Promise<boolean> => {
    if (!wallet) return false;
    if (!chain) {
      setError(`This wallet does not support chain ${chainId}.`);
      return false;
    }
    setSwitching(true);
    setError(null);
    try {
      await wallet.switchChain(chain.id);
      return true;
    } catch {
      setError(`Could not switch to ${chain.name}. Change the network in your wallet and try again.`);
      return false;
    } finally {
      // Cleared in finally so a rejected switch never locks the button.
      setSwitching(false);
    }
  }, [wallet, chain, chainId]);

  return { ready, switching, switchTo, error, chain, walletChainId, chainName };
}
