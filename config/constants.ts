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
  CELO: 42220,
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
  [CHAIN_IDS.CELO]: 'https://celoscan.io',
} as const;

// =============================================================================
// NETWORK NAMES
// =============================================================================
export const NETWORK_NAMES: Record<ChainId, string> = {
  [CHAIN_IDS.BASE]: 'Base',
  [CHAIN_IDS.ETHEREUM]: 'Ethereum',
  [CHAIN_IDS.OPTIMISM]: 'Optimism',
  [CHAIN_IDS.UNICHAIN]: 'Unichain',
  [CHAIN_IDS.CELO]: 'Celo',
} as const;

export const NETWORK_SHORT_NAMES: Record<ChainId, string> = {
  [CHAIN_IDS.BASE]: 'Base',
  [CHAIN_IDS.ETHEREUM]: 'ETH',
  [CHAIN_IDS.OPTIMISM]: 'OP',
  [CHAIN_IDS.UNICHAIN]: 'UNI',
  [CHAIN_IDS.CELO]: 'CELO',
} as const;

export const NETWORK_COLORS: Record<ChainId, string> = {
  [CHAIN_IDS.BASE]: '#0052FF',
  [CHAIN_IDS.ETHEREUM]: '#627EEA',
  [CHAIN_IDS.OPTIMISM]: '#FF0B51',
  [CHAIN_IDS.UNICHAIN]: '#00FF00',
  [CHAIN_IDS.CELO]: '#FCFF52',
} as const;

// =============================================================================
// RPC URLS
// =============================================================================
export const DEFAULT_RPC_URLS: Record<ChainId, string> = {
  [CHAIN_IDS.BASE]: 'https://mainnet.base.org',
  [CHAIN_IDS.ETHEREUM]: 'https://eth.llamarpc.com',
  [CHAIN_IDS.OPTIMISM]: 'https://mainnet.optimism.io',
  [CHAIN_IDS.UNICHAIN]: 'https://rpc.unichain.org',
  [CHAIN_IDS.CELO]: 'https://forno.celo.org',
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
    case CHAIN_IDS.CELO:
      return process.env.NEXT_PUBLIC_CELO_RPC_URL || DEFAULT_RPC_URLS[CHAIN_IDS.CELO];
    default:
      return DEFAULT_RPC_URLS[CHAIN_IDS.BASE];
  }
}

// =============================================================================
// NATIVE CURRENCY
// Celo's native gas token is CELO, not ETH. The contracts' ETH sentinel
// (0xEeee...EEeE) resolves to whatever the chain's native token is.
// =============================================================================
export const NATIVE_SYMBOLS: Record<ChainId, string> = {
  [CHAIN_IDS.BASE]: 'ETH',
  [CHAIN_IDS.ETHEREUM]: 'ETH',
  [CHAIN_IDS.OPTIMISM]: 'ETH',
  [CHAIN_IDS.UNICHAIN]: 'ETH',
  [CHAIN_IDS.CELO]: 'CELO',
} as const;

/** Sentinel the contracts use to mean "the chain's native token". */
export const NATIVE_TOKEN_SENTINEL = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';

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
  // COPm (Mento Colombian Peso) is 18 decimals, unlike the 6-decimal
  // stablecoins above. Never assume 6 for a "stablecoin".
  COPm: 18,
} as const;

// =============================================================================
// TOKEN ADDRESSES BY CHAIN
// =============================================================================
export const TOKEN_ADDRESSES: Record<ChainId, {
  USDC: string;
  USDT: string;
  EURC: string;
  COPm?: string;
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
    // NATIVE Circle USDC. The bridged USDC.e at 0x7F5c764c… also answers
    // symbol() with "USDC" at 6 decimals, so only the address tells them apart.
    // DonationVault on Optimism accepts this address and not the bridged one —
    // offering USDC.e here makes every Optimism USDC donation revert.
    USDC: process.env.NEXT_PUBLIC_USDC_OPTIMISM || '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
    USDT: process.env.NEXT_PUBLIC_USDT_OPTIMISM || '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58',
    EURC: '', // Not available on Optimism
  },
  [CHAIN_IDS.UNICHAIN]: {
    USDC: process.env.NEXT_PUBLIC_USDC_UNICHAIN || '0x078D782b760474a361dDA0AF3839290b0EF57AD6',
    USDT: '', // Not available on Unichain
    EURC: '', // Not available on Unichain
  },
  [CHAIN_IDS.CELO]: {
    // Verified on-chain via forno.celo.org (symbol/decimals read directly).
    USDC: process.env.NEXT_PUBLIC_USDC_CELO || '0xcebA9300f2b948710d2653dD7B07f33A8B32118C',
    USDT: '', // Not used on Celo for donations
    EURC: '', // Not available on Celo
    COPm: process.env.NEXT_PUBLIC_COPM_CELO || '0x8a567e2ae79ca692bd748ab832081c45de4041ea',
  },
} as const;

// =============================================================================
// SUPPORTED CHAINS
// =============================================================================
export const SUPPORTED_CHAIN_IDS: ChainId[] = [
  CHAIN_IDS.BASE,
  // CHAIN_IDS.ETHEREUM, // Hidden — re-add when new contracts are deployed on Ethereum mainnet
  CHAIN_IDS.OPTIMISM,
  CHAIN_IDS.UNICHAIN,
];

export function isSupportedChain(chainId: number): chainId is ChainId {
  return SUPPORTED_CHAIN_IDS.includes(chainId as ChainId);
}

// =============================================================================
// ENS CONFIGURATION
// =============================================================================
/**
 * ethcali.eth subnames live on Base (Durin). Verified on-chain 2026-09-04:
 * registrar.registry() == registry, registry.name() == "ethcali.eth",
 * registry.registrars(registrar) == true. The mainnet resolver for ethcali.eth is
 * still the ENS PublicResolver, so L1 resolution of these names is not wired yet;
 * the wallet reads the Base registry directly and treats that as the truth.
 */
export const ENS_CONFIG = {
  parentName: 'ethcali.eth',
  chainId: CHAIN_IDS.BASE,
  registrar: '0x7103595fc32b4072b775e9f6b438921c8cf532ed',
  registry: '0x58f23036463463f947aeadab97eeecf5a76049c7',
} as const;
