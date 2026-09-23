/**
 * Resolves the DonationVault deployment and accepted currencies, from the
 * chain registry.
 *
 * Donations live on Ethereum (`DONATION_CHAIN_ID`). Every hook still takes an
 * explicit chain id — a read never guesses — and degrades to "not deployed"
 * rather than throwing for a chain without a vault.
 */
import { useMemo } from 'react';
import { DEFAULT_CHAIN, NATIVE_TOKEN_SENTINEL, getChain, publicClientFor } from '../../config/chains';
import type { DonationToken } from '../../types/donations';

/** The registry tokens a campaign can accept. USDT/EURC are wallet-only. */
const DONATION_SYMBOLS: ReadonlySet<string> = new Set(['USDC']);

/** The chain the vault is offered on. The one chain there is. */
export const DONATION_CHAIN_ID = DEFAULT_CHAIN.id;

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

/** Config for the chosen chain; the donation chain when none is given. */
export function useDonationAddresses(chainId?: number): DonationChainConfig {
  return useMemo(() => getDonationChainConfig(chainId ?? DONATION_CHAIN_ID), [chainId]);
}
