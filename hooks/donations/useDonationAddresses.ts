/**
 * Resolves the DonationVault deployment and accepted currencies for a chain,
 * from the chain registry.
 *
 * Donations ship to every chain `frontend/addresses.json` lists a vault on,
 * and must degrade gracefully on any chain where it is not deployed rather
 * than throwing.
 */
import { useMemo } from 'react';
import {
  CHAIN_IDS,
  NATIVE_TOKEN_SENTINEL,
  chainsFor,
  getChain,
  publicClientFor,
  type ChainInfo,
} from '../../config/chains';
import type { DonationToken } from '../../types/donations';

/** The registry tokens a campaign can accept. USDT/EURC are wallet-only. */
const DONATION_SYMBOLS: ReadonlySet<string> = new Set(['USDC', 'COPm']);

/**
 * Every chain with a deployed vault. Celo first — it is where COPm lives, the
 * natural currency for local donors — then registry order.
 */
export const DONATION_CHAINS: readonly ChainInfo[] = [...chainsFor('donations')].sort(
  (a, b) => Number(b.id === CHAIN_IDS.CELO) - Number(a.id === CHAIN_IDS.CELO)
);

export const DONATION_CHAIN_IDS: number[] = DONATION_CHAINS.map((c) => c.id);

/** A client for a chain the vault is deployed on. Throws for an unknown chain rather than guessing. */
export function donationClient(chainId: number) {
  const client = publicClientFor(chainId);
  if (!client) throw new Error(`Donations are not available on chain ${chainId}`);
  return client;
}

/**
 * Currencies a campaign can accept on a chain.
 *
 * The contract is the authority on what is actually accepted — this is the
 * catalogue the UI uses to label and format them. Decimals come from the
 * registry and are never assumed.
 */
export function getDonationTokens(chainId: number): DonationToken[] {
  const chain = getChain(chainId);
  if (!chain) return [];

  return [
    {
      address: NATIVE_TOKEN_SENTINEL.toLowerCase(),
      symbol: chain.nativeSymbol,
      name: chain.nativeName,
      decimals: 18,
      coingeckoId: chain.nativeCoingeckoId,
      isNative: true,
    },
    ...chain.tokens
      .filter((t) => DONATION_SYMBOLS.has(t.symbol))
      .map((t) => ({
        address: t.address.toLowerCase(),
        symbol: t.symbol,
        name: t.name,
        decimals: t.decimals,
        coingeckoId: t.coingeckoId,
        isNative: false,
      })),
  ];
}

export interface DonationChainConfig {
  chainId: number;
  name: string;
  explorerUrl: string;
  /** Null when DonationVault has not been deployed to this chain yet. */
  vault: string | null;
  receiptCollection: string | null;
  tokens: DonationToken[];
  isDeployed: boolean;
}

export function getDonationChainConfig(chainId: number): DonationChainConfig {
  const chain = getChain(chainId);
  const vault = chain?.contracts.DonationVault?.toLowerCase() ?? null;

  return {
    chainId,
    name: chain?.name ?? `Chain ${chainId}`,
    explorerUrl: chain?.explorerUrl ?? '',
    vault,
    receiptCollection: chain?.contracts.DonationReceipt1155?.toLowerCase() ?? null,
    tokens: getDonationTokens(chainId),
    isDeployed: Boolean(vault),
  };
}

/** Config for the chosen chain; Celo when none is given. */
export function useDonationAddresses(chainId?: number): DonationChainConfig {
  return useMemo(() => getDonationChainConfig(chainId ?? CHAIN_IDS.CELO), [chainId]);
}
