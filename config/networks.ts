/**
 * Network configuration
 * Uses centralized constants from config/constants.ts
 */
import {
  CHAIN_IDS,
  EXPLORER_URLS,
  NETWORK_NAMES,
  NETWORK_COLORS,
  TOKEN_ADDRESSES,
  getRpcUrl,
  DEFAULT_CHAIN_ID,
  type ChainId,
} from './constants';
import { getNetworkLogoUrl, getTokenLogoUrl } from '../utils/tokenUtils';

// Re-export constants for backward compatibility
export { CHAIN_IDS, DEFAULT_CHAIN_ID };

// Network interface
export interface Network {
  id: number;
  name: string;
  shortName: string;
  icon: string;
  explorerUrl: string;
  rpcUrl: string;
  testnet: boolean;
  color: string;
}

// Token interface
export interface TokenConfig {
  symbol: string;
  name: string;
  decimals: number;
  icon: string;
  address?: string;
}

// Build network configurations from constants
export const ETHEREUM: Network = {
  id: CHAIN_IDS.ETHEREUM,
  name: 'Ethereum Mainnet',
  shortName: NETWORK_NAMES[CHAIN_IDS.ETHEREUM],
  icon: getNetworkLogoUrl(CHAIN_IDS.ETHEREUM),
  explorerUrl: EXPLORER_URLS[CHAIN_IDS.ETHEREUM],
  rpcUrl: getRpcUrl(CHAIN_IDS.ETHEREUM),
  testnet: false,
  color: NETWORK_COLORS[CHAIN_IDS.ETHEREUM],
};

export const BASE: Network = {
  id: CHAIN_IDS.BASE,
  name: 'Base Mainnet',
  shortName: NETWORK_NAMES[CHAIN_IDS.BASE],
  icon: getNetworkLogoUrl(CHAIN_IDS.BASE),
  explorerUrl: EXPLORER_URLS[CHAIN_IDS.BASE],
  rpcUrl: getRpcUrl(CHAIN_IDS.BASE),
  testnet: false,
  color: NETWORK_COLORS[CHAIN_IDS.BASE],
};

export const OPTIMISM: Network = {
  id: CHAIN_IDS.OPTIMISM,
  name: 'Optimism Mainnet',
  shortName: NETWORK_NAMES[CHAIN_IDS.OPTIMISM],
  icon: getNetworkLogoUrl(CHAIN_IDS.OPTIMISM),
  explorerUrl: EXPLORER_URLS[CHAIN_IDS.OPTIMISM],
  rpcUrl: getRpcUrl(CHAIN_IDS.OPTIMISM),
  testnet: false,
  color: NETWORK_COLORS[CHAIN_IDS.OPTIMISM],
};

export const UNICHAIN: Network = {
  id: CHAIN_IDS.UNICHAIN,
  name: 'Unichain Mainnet',
  shortName: NETWORK_NAMES[CHAIN_IDS.UNICHAIN],
  icon: getNetworkLogoUrl(CHAIN_IDS.UNICHAIN),
  explorerUrl: EXPLORER_URLS[CHAIN_IDS.UNICHAIN],
  rpcUrl: getRpcUrl(CHAIN_IDS.UNICHAIN),
  testnet: false,
  color: NETWORK_COLORS[CHAIN_IDS.UNICHAIN],
};

// Network lookup map
const NETWORKS: Record<ChainId, Network> = {
  [CHAIN_IDS.ETHEREUM]: ETHEREUM,
  [CHAIN_IDS.BASE]: BASE,
  [CHAIN_IDS.OPTIMISM]: OPTIMISM,
  [CHAIN_IDS.UNICHAIN]: UNICHAIN,
};

// Default network
export const DEFAULT_NETWORK = BASE;

/**
 * Get network configuration by chain ID
 */
export function getNetworkById(chainId: number): Network {
  return NETWORKS[chainId as ChainId] || DEFAULT_NETWORK;
}

/**
 * Get all supported networks
 */
export function getSupportedNetworks(): Network[] {
  return Object.values(NETWORKS);
}

/**
 * Get RPC URL by chain ID
 * @deprecated Use getRpcUrl from config/constants.ts instead
 */
export function getChainRpc(chainId: number): string {
  return getRpcUrl(chainId as ChainId);
}

// Token configurations by chain
export const TOKENS: Record<number, Record<string, TokenConfig>> = {
  [CHAIN_IDS.ETHEREUM]: {
    ETH: {
      symbol: 'ETH',
      name: 'Ethereum',
      decimals: 18,
      icon: getTokenLogoUrl('ETH'),
    },
    USDC: {
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
      address: TOKEN_ADDRESSES[CHAIN_IDS.ETHEREUM].USDC,
      icon: getTokenLogoUrl('USDC'),
    },
    EURC: {
      symbol: 'EURC',
      name: 'Euro Coin',
      decimals: 6,
      address: TOKEN_ADDRESSES[CHAIN_IDS.ETHEREUM].EURC,
      icon: getTokenLogoUrl('EURC'),
    },
  },
  [CHAIN_IDS.BASE]: {
    ETH: {
      symbol: 'ETH',
      name: 'Ethereum',
      decimals: 18,
      icon: getTokenLogoUrl('ETH'),
    },
    USDC: {
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
      address: TOKEN_ADDRESSES[CHAIN_IDS.BASE].USDC,
      icon: getTokenLogoUrl('USDC'),
    },
    EURC: {
      symbol: 'EURC',
      name: 'Euro Coin',
      decimals: 6,
      address: TOKEN_ADDRESSES[CHAIN_IDS.BASE].EURC,
      icon: getTokenLogoUrl('EURC'),
    },
  },
  [CHAIN_IDS.OPTIMISM]: {
    ETH: {
      symbol: 'ETH',
      name: 'Ethereum',
      decimals: 18,
      icon: getTokenLogoUrl('ETH'),
    },
    USDC: {
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
      address: TOKEN_ADDRESSES[CHAIN_IDS.OPTIMISM].USDC,
      icon: getTokenLogoUrl('USDC'),
    },
  },
  [CHAIN_IDS.UNICHAIN]: {
    ETH: {
      symbol: 'ETH',
      name: 'Ethereum',
      decimals: 18,
      icon: getTokenLogoUrl('ETH'),
    },
    USDC: {
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
      address: TOKEN_ADDRESSES[CHAIN_IDS.UNICHAIN].USDC,
      icon: getTokenLogoUrl('USDC'),
    },
  },
};
