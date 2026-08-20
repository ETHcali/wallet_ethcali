/**
 * Resolves the DonationVault deployment and accepted currencies for a chain.
 *
 * Kept separate from utils/network.ts on purpose: that helper hardcodes a fixed
 * set of chains and contracts for the faucet/swag modules. Donations ship to five
 * networks including Celo, and must degrade gracefully on any chain where the
 * vault is not deployed yet rather than throwing.
 */
import { useMemo } from 'react';
import addressesJson from '../../frontend/addresses.json';
import {
  CHAIN_IDS,
  TOKEN_ADDRESSES,
  TOKEN_DECIMALS,
  NATIVE_SYMBOLS,
  NATIVE_TOKEN_SENTINEL,
  EXPLORER_URLS,
  NETWORK_NAMES,
  type ChainId,
} from '../../config/constants';
import type { DonationToken } from '../../types/donations';

type AddressBook = Record<string, { addresses?: Record<string, string> }>;

const CHAIN_ID_TO_KEY: Record<number, string> = {
  [CHAIN_IDS.BASE]: 'base',
  [CHAIN_IDS.ETHEREUM]: 'ethereum',
  [CHAIN_IDS.OPTIMISM]: 'optimism',
  [CHAIN_IDS.UNICHAIN]: 'unichain',
  [CHAIN_IDS.CELO]: 'celo',
};

/** Every chain the donation module can run on. */
export const DONATION_CHAIN_IDS: ChainId[] = [
  CHAIN_IDS.CELO,
  CHAIN_IDS.BASE,
  CHAIN_IDS.OPTIMISM,
  CHAIN_IDS.ETHEREUM,
  CHAIN_IDS.UNICHAIN,
];

function readAddress(chainId: number, contract: string): string | null {
  const key = CHAIN_ID_TO_KEY[chainId];
  if (!key) return null;
  const entry = (addressesJson as AddressBook)[key];
  const value = entry?.addresses?.[contract];
  return value ? value.toLowerCase() : null;
}

/**
 * Currencies a campaign can accept on a chain.
 *
 * The contract is the authority on what is actually accepted — this is the
 * catalogue the UI uses to label and format them. Decimals come from here and
 * are never assumed.
 */
export function getDonationTokens(chainId: number): DonationToken[] {
  const tokens: DonationToken[] = [];

  const nativeSymbol = NATIVE_SYMBOLS[chainId as ChainId] ?? 'ETH';
  tokens.push({
    address: NATIVE_TOKEN_SENTINEL.toLowerCase(),
    symbol: nativeSymbol,
    name: nativeSymbol === 'CELO' ? 'Celo' : 'Ether',
    decimals: 18,
    coingeckoId: nativeSymbol === 'CELO' ? 'celo' : 'ethereum',
    isNative: true,
  });

  const chainTokens = TOKEN_ADDRESSES[chainId as ChainId];
  if (chainTokens?.USDC) {
    tokens.push({
      address: chainTokens.USDC.toLowerCase(),
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: TOKEN_DECIMALS.USDC,
      coingeckoId: 'usd-coin',
      isNative: false,
    });
  }

  // COPm exists only on Celo. 18 decimals, unlike the 6-decimal stablecoins.
  if (chainTokens?.COPm) {
    tokens.push({
      address: chainTokens.COPm.toLowerCase(),
      symbol: 'COPm',
      name: 'Mento Colombian Peso',
      decimals: TOKEN_DECIMALS.COPm,
      // Not on CoinGecko under a stable id; valued via the USD→COP rate instead.
      coingeckoId: null,
      isNative: false,
    });
  }

  return tokens;
}

export interface DonationChainConfig {
  chainId: ChainId;
  name: string;
  explorerUrl: string;
  /** Null when DonationVault has not been deployed to this chain yet. */
  vault: string | null;
  receiptCollection: string | null;
  tokens: DonationToken[];
  isDeployed: boolean;
}

export function getDonationChainConfig(chainId: number): DonationChainConfig {
  const vault = readAddress(chainId, 'DonationVault');

  return {
    chainId: chainId as ChainId,
    name: NETWORK_NAMES[chainId as ChainId] ?? `Chain ${chainId}`,
    explorerUrl: EXPLORER_URLS[chainId as ChainId] ?? '',
    vault,
    receiptCollection: readAddress(chainId, 'DonationReceipt1155'),
    tokens: getDonationTokens(chainId),
    isDeployed: Boolean(vault),
  };
}

/** Config for the active chain. */
export function useDonationAddresses(chainId?: number): DonationChainConfig {
  return useMemo(
    () => getDonationChainConfig(chainId ?? CHAIN_IDS.CELO),
    [chainId]
  );
}

/** Every chain that currently has a deployed vault. */
export function useDeployedDonationChains(): DonationChainConfig[] {
  return useMemo(
    () =>
      DONATION_CHAIN_IDS.map((id) => getDonationChainConfig(id)).filter(
        (c) => c.isDeployed
      ),
    []
  );
}
