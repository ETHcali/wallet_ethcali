/**
 * Centralized constants for the ETH Cali Wallet
 * This is the single source of truth for all application-wide constants.
 */

// =============================================================================
// CHAIN IDS
// =============================================================================
export const CHAIN_IDS = {
  BASE: 8453,
  ETHEREUM: 1,
  OPTIMISM: 10,
  UNICHAIN: 130,
} as const;

export type ChainId = (typeof CHAIN_IDS)[keyof typeof CHAIN_IDS];

export const DEFAULT_CHAIN_ID = Number(process.env.NEXT_PUBLIC_DEFAULT_CHAIN_ID) || CHAIN_IDS.BASE;

// =============================================================================
// ADMIN CONFIGURATION
// =============================================================================
export const ADMIN_ADDRESS = process.env.NEXT_PUBLIC_ADMIN_ADDRESS!;

// =============================================================================
// EXPLORER URLS
// =============================================================================
export const EXPLORER_URLS: Record<ChainId, string> = {
  [CHAIN_IDS.BASE]: 'https://basescan.org',
  [CHAIN_IDS.ETHEREUM]: 'https://etherscan.io',
  [CHAIN_IDS.OPTIMISM]: 'https://optimistic.etherscan.io',
  [CHAIN_IDS.UNICHAIN]: 'https://unichain.blockscout.com',
} as const;

// =============================================================================
// NETWORK NAMES
// =============================================================================
export const NETWORK_NAMES: Record<ChainId, string> = {
  [CHAIN_IDS.BASE]: 'Base',
  [CHAIN_IDS.ETHEREUM]: 'Ethereum',
  [CHAIN_IDS.OPTIMISM]: 'Optimism',
  [CHAIN_IDS.UNICHAIN]: 'Unichain',
} as const;

export const NETWORK_SHORT_NAMES: Record<ChainId, string> = {
  [CHAIN_IDS.BASE]: 'Base',
  [CHAIN_IDS.ETHEREUM]: 'ETH',
  [CHAIN_IDS.OPTIMISM]: 'OP',
  [CHAIN_IDS.UNICHAIN]: 'UNI',
} as const;

export const NETWORK_COLORS: Record<ChainId, string> = {
  [CHAIN_IDS.BASE]: '#0052FF',
  [CHAIN_IDS.ETHEREUM]: '#627EEA',
  [CHAIN_IDS.OPTIMISM]: '#FF0B51',
  [CHAIN_IDS.UNICHAIN]: '#00FF00',
} as const;

// =============================================================================
// RPC URLS
// =============================================================================
export const DEFAULT_RPC_URLS: Record<ChainId, string> = {
  [CHAIN_IDS.BASE]: 'https://mainnet.base.org',
  [CHAIN_IDS.ETHEREUM]: 'https://eth.llamarpc.com',
  [CHAIN_IDS.OPTIMISM]: 'https://mainnet.optimism.io',
  [CHAIN_IDS.UNICHAIN]: 'https://rpc.unichain.org',
} as const;

/**
 * Get RPC URL for a chain, with environment variable override support
 */
export function getRpcUrl(chainId: ChainId): string {
  switch (chainId) {
    case CHAIN_IDS.ETHEREUM:
      return process.env.NEXT_PUBLIC_MAINNET_RPC_URL || DEFAULT_RPC_URLS[CHAIN_IDS.ETHEREUM];
    case CHAIN_IDS.BASE:
      return process.env.NEXT_PUBLIC_BASE_RPC_URL || DEFAULT_RPC_URLS[CHAIN_IDS.BASE];
    case CHAIN_IDS.OPTIMISM:
      return process.env.NEXT_PUBLIC_OPTIMISM_RPC_URL || DEFAULT_RPC_URLS[CHAIN_IDS.OPTIMISM];
    case CHAIN_IDS.UNICHAIN:
      return process.env.NEXT_PUBLIC_UNICHAIN_RPC_URL || DEFAULT_RPC_URLS[CHAIN_IDS.UNICHAIN];
    default:
      return DEFAULT_RPC_URLS[CHAIN_IDS.BASE];
  }
}

// =============================================================================
// TIMEOUTS
// =============================================================================
export const TIMEOUTS = {
  IPFS_FETCH: 10000,
  QUERY_STALE: 60000,
  DEBOUNCE_INPUT: 300,
  TX_CONFIRMATION: 30000,
} as const;

// =============================================================================
// TOKEN DECIMALS
// =============================================================================
export const TOKEN_DECIMALS = {
  ETH: 18,
  USDC: 6,
  USDT: 6,
  EURC: 6,
} as const;

// =============================================================================
// TOKEN ADDRESSES BY CHAIN
// =============================================================================
export const TOKEN_ADDRESSES: Record<ChainId, {
  USDC: string;
  USDT: string;
  EURC: string;
}> = {
  [CHAIN_IDS.BASE]: {
    USDC: process.env.NEXT_PUBLIC_USDC_BASE || '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    USDT: process.env.NEXT_PUBLIC_USDT_BASE || '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2',
    EURC: process.env.NEXT_PUBLIC_EURC_BASE || '0x60a3E35Cc302bFA44Cb288Bc5a4F316Fdb1adb42',
  },
  [CHAIN_IDS.ETHEREUM]: {
    USDC: process.env.NEXT_PUBLIC_USDC_ETHEREUM || '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    USDT: process.env.NEXT_PUBLIC_USDT_ETHEREUM || '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    EURC: process.env.NEXT_PUBLIC_EURC_ETHEREUM || '0x1aBaEA1f7C830bD89Acc67eC4af516284b1bC33c',
  },
  [CHAIN_IDS.OPTIMISM]: {
    USDC: process.env.NEXT_PUBLIC_USDC_OPTIMISM || '0x7F5c764cBc14f9669B88837ca1490cCa17c31607',
    USDT: process.env.NEXT_PUBLIC_USDT_OPTIMISM || '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58',
    EURC: '', // Not available on Optimism
  },
  [CHAIN_IDS.UNICHAIN]: {
    USDC: process.env.NEXT_PUBLIC_USDC_UNICHAIN || '0x078D782b760474a361dDA0AF3839290b0EF57AD6',
    USDT: '', // Not available on Unichain
    EURC: '', // Not available on Unichain
  },
} as const;

// =============================================================================
// SUPPORTED CHAINS
// =============================================================================
export const SUPPORTED_CHAIN_IDS: ChainId[] = [
  CHAIN_IDS.BASE,
  CHAIN_IDS.ETHEREUM,
  CHAIN_IDS.OPTIMISM,
  CHAIN_IDS.UNICHAIN,
];

export function isSupportedChain(chainId: number): chainId is ChainId {
  return SUPPORTED_CHAIN_IDS.includes(chainId as ChainId);
}

// =============================================================================
// ENS CONFIGURATION
// =============================================================================
export const ENS_CONFIG = {
  parentName: 'ethcali.eth',
  chainId: CHAIN_IDS.BASE,
} as const;

export const ENS_REGISTRAR_ADDRESSES: Partial<Record<ChainId, string>> = {
  [CHAIN_IDS.BASE]: '0x7103595fc32b4072b775e9f6b438921c8cf532ed',
} as const;
