/**
 * The one chain registry.
 *
 * Every chain the wallet knows about is described here once: its viem chain
 * object, RPC, explorer, native token, the ERC-20s we show, the contracts the
 * generated `frontend/addresses.json` says are deployed there, and — derived
 * from those — which features exist on it.
 *
 * Rules this file exists to enforce:
 *   - A read takes an explicit chain id. Nothing reads "the wallet's chain".
 *   - A feature chooses its chain from `chainsFor(feature)`, never from a
 *     global selector, and asks `useRequireChain(id)` to move the wallet
 *     right before signing.
 *   - An unknown chain id resolves to `undefined`. There is no silent fallback
 *     to Base anywhere; the UI says "not supported" instead.
 *
 * Adding a chain means adding one entry to `CHAIN_DEFS` and (if contracts are
 * deployed there) re-running `npm run sync:contracts`. The features map fills
 * itself in from the address book.
 */
import { createPublicClient, http } from 'viem';
import addressesJson from '../frontend/addresses.json';
import swagCollection from '../frontend/swag-collection.json';

// ── Identity ────────────────────────────────────────────────────────────────

export const CHAIN_IDS = {
  BASE: 8453,
  ETHEREUM: 1,
  OPTIMISM: 10,
  UNICHAIN: 130,
  CELO: 42220,
} as const;

export type ChainId = (typeof CHAIN_IDS)[keyof typeof CHAIN_IDS];

/** The key each chain has in the generated `frontend/addresses.json`. */
export type ChainKey = 'base' | 'ethereum' | 'optimism' | 'unichain' | 'celo';

export type Feature = 'faucet' | 'identity' | 'donations' | 'swag' | 'ens' | 'send' | 'swap';

export type TokenSymbol = 'USDC' | 'USDT' | 'EURC' | 'COPm';

export interface TokenInfo {
  symbol: TokenSymbol;
  name: string;
  address: `0x${string}`;
  /** Read from the token itself when it was added. USDC/USDT/EURC are 6, COPm is 18. */
  decimals: number;
  /** CoinGecko id used to price it; null when there is no stable id (COPm). */
  coingeckoId: string | null;
}

/** What `frontend/addresses.json` (plus the live swag clone) says is deployed. */
export interface ChainContracts {
  FaucetManager?: `0x${string}`;
  ZKPassportNFT?: `0x${string}`;
  SwagFactory?: `0x${string}`;
  DonationVault?: `0x${string}`;
  DonationReceipt1155?: `0x${string}`;
  /** The live Swag1155 clone. Only on the chain `frontend/swag-collection.json` names. */
  Swag1155?: `0x${string}`;
}

/**
 * A viem chain object written out by hand rather than imported from
 * `viem/chains`, for two reasons: viem 1.x (pinned here) has no Unichain, and
 * Privy bundles viem 2 whose `Chain` type does not accept viem 1's `formatters`.
 * A plain object with only the shared fields satisfies both.
 */
export interface ChainDefinition {
  id: number;
  name: string;
  network: string;
  nativeCurrency: { name: string; symbol: string; decimals: 18 };
  rpcUrls: {
    default: { http: readonly string[] };
    public: { http: readonly string[] };
  };
  blockExplorers: { default: { name: string; url: string } };
  contracts: { multicall3: { address: `0x${string}` } };
}

export interface ChainInfo {
  id: ChainId;
  key: ChainKey;
  name: string;
  shortName: string;
  rpcUrl: string;
  explorerUrl: string;
  nativeSymbol: 'ETH' | 'CELO';
  nativeName: string;
  nativeCoingeckoId: string;
  viem: ChainDefinition;
  tokens: readonly TokenInfo[];
  contracts: ChainContracts;
  features: Readonly<Record<Feature, boolean>>;
  /**
   * Defined but not offered. A hidden chain still resolves through `getChain`,
   * `publicClientFor` and the explorer helpers — an old link or an indexed row
   * can name it — but it is absent from `CHAINS`, `chainsFor`, every picker and
   * every balance list. Nothing that shows a chain shows a hidden one.
   */
  hidden: boolean;
}

// ── Inputs ──────────────────────────────────────────────────────────────────

/** Same canonical Multicall3 deployment on all five chains. */
const MULTICALL3 = '0xcA11bde05977b3631167028862bE2a173976CA11' as const;

/** Sentinel the contracts use to mean "the chain's native token". */
export const NATIVE_TOKEN_SENTINEL = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';

/**
 * RPC per chain. The env names are read literally so Next can inline them at
 * build time; a `process.env[dynamicKey]` lookup would always be undefined in
 * the browser.
 */
const RPC_URLS: Record<ChainKey, string> = {
  base: process.env.NEXT_PUBLIC_BASE_RPC_URL || 'https://mainnet.base.org',
  ethereum: process.env.NEXT_PUBLIC_MAINNET_RPC_URL || 'https://eth.llamarpc.com',
  optimism: process.env.NEXT_PUBLIC_OPTIMISM_RPC_URL || 'https://mainnet.optimism.io',
  unichain: process.env.NEXT_PUBLIC_UNICHAIN_RPC_URL || 'https://rpc.unichain.org',
  celo: process.env.NEXT_PUBLIC_CELO_RPC_URL || 'https://forno.celo.org',
};

/**
 * Chains where the LI.FI swap has actually been exercised. LI.FI lists more,
 * but a chain is only offered a Swap button once someone has run a quote and
 * a transaction there.
 */
const SWAP_VERIFIED: ReadonlySet<ChainKey> = new Set(['base', 'optimism', 'ethereum']);

interface ChainDef {
  id: ChainId;
  key: ChainKey;
  name: string;
  shortName: string;
  explorerName: string;
  explorerUrl: string;
  nativeSymbol: 'ETH' | 'CELO';
  nativeName: string;
  nativeCoingeckoId: string;
  tokens: readonly TokenInfo[];
  /** See `ChainInfo.hidden`. Contracts stay deployed; the UI just stops offering the chain. */
  hidden?: boolean;
}

const USDC = (address: `0x${string}`): TokenInfo => ({
  symbol: 'USDC',
  name: 'USD Coin',
  address,
  decimals: 6,
  coingeckoId: 'usd-coin',
});
const USDT = (address: `0x${string}`): TokenInfo => ({
  symbol: 'USDT',
  name: 'Tether USD',
  address,
  decimals: 6,
  coingeckoId: 'tether',
});
const EURC = (address: `0x${string}`): TokenInfo => ({
  symbol: 'EURC',
  name: 'Euro Coin',
  address,
  decimals: 6,
  coingeckoId: 'euro-coin',
});

/**
 * Order matters: it is the order every picker shows and Base is the default
 * everywhere. Ethereum is last because gas is not sponsored there.
 *
 * Optimism and Unichain are `hidden`: their deployments are untouched, but the
 * app shows Ethereum, Base and Celo only. Flip the flag to bring one back.
 */
const CHAIN_DEFS: readonly ChainDef[] = [
  {
    id: CHAIN_IDS.BASE,
    key: 'base',
    name: 'Base',
    shortName: 'Base',
    explorerName: 'Basescan',
    explorerUrl: 'https://basescan.org',
    nativeSymbol: 'ETH',
    nativeName: 'Ether',
    nativeCoingeckoId: 'ethereum',
    tokens: [
      USDC('0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'),
      USDT('0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2'),
      EURC('0x60a3E35Cc302bFA44Cb288Bc5a4F316Fdb1adb42'),
    ],
  },
  {
    id: CHAIN_IDS.OPTIMISM,
    key: 'optimism',
    name: 'Optimism',
    shortName: 'OP',
    hidden: true,
    explorerName: 'Etherscan',
    explorerUrl: 'https://optimistic.etherscan.io',
    nativeSymbol: 'ETH',
    nativeName: 'Ether',
    nativeCoingeckoId: 'ethereum',
    tokens: [
      // NATIVE Circle USDC. The bridged USDC.e at 0x7F5c764c… also answers
      // symbol() with "USDC" at 6 decimals, so only the address tells them
      // apart. The old balances hook listed USDC.e while the donation config
      // listed native; DonationVault on Optimism accepts the native one and
      // not the bridged one, so this registry keeps native and USDC.e is gone.
      USDC('0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85'),
      USDT('0x94b008aA00579c1307B0EF2c499aD98a8ce58e58'),
    ],
  },
  {
    id: CHAIN_IDS.UNICHAIN,
    key: 'unichain',
    name: 'Unichain',
    shortName: 'UNI',
    hidden: true,
    explorerName: 'Blockscout',
    explorerUrl: 'https://unichain.blockscout.com',
    nativeSymbol: 'ETH',
    nativeName: 'Ether',
    nativeCoingeckoId: 'ethereum',
    tokens: [USDC('0x078D782b760474a361dDA0AF3839290b0EF57AD6')],
  },
  {
    id: CHAIN_IDS.CELO,
    key: 'celo',
    name: 'Celo',
    shortName: 'CELO',
    explorerName: 'Celoscan',
    explorerUrl: 'https://celoscan.io',
    // Celo's gas token is CELO, not ETH. The contracts' native sentinel
    // resolves to whatever the chain's native token is.
    nativeSymbol: 'CELO',
    nativeName: 'Celo',
    nativeCoingeckoId: 'celo',
    tokens: [
      // Both verified on-chain via forno.celo.org (symbol/decimals read directly).
      USDC('0xcebA9300f2b948710d2653dD7B07f33A8B32118C'),
      {
        symbol: 'COPm',
        name: 'Mento Colombian Peso',
        address: '0x8a567e2ae79ca692bd748ab832081c45de4041ea',
        // 18 decimals, unlike the 6-decimal stablecoins. Never assume 6 for a
        // "stablecoin".
        decimals: 18,
        // Not on CoinGecko under a stable id; valued via the USD→COP rate instead.
        coingeckoId: null,
      },
    ],
  },
  {
    id: CHAIN_IDS.ETHEREUM,
    key: 'ethereum',
    name: 'Ethereum',
    shortName: 'ETH',
    explorerName: 'Etherscan',
    explorerUrl: 'https://etherscan.io',
    nativeSymbol: 'ETH',
    nativeName: 'Ether',
    nativeCoingeckoId: 'ethereum',
    tokens: [
      USDC('0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'),
      USDT('0xdAC17F958D2ee523a2206206994597C13D831ec7'),
      EURC('0x1aBaEA1f7C830bD89Acc67eC4af516284b1bC33c'),
    ],
  },
];

// ── Assembly ────────────────────────────────────────────────────────────────

type AddressBook = Record<string, { chainId: number; addresses: Record<string, string> }>;

function contractsFor(def: ChainDef): ChainContracts {
  const book = (addressesJson as AddressBook)[def.key]?.addresses ?? {};
  const pick = (name: keyof ChainContracts): `0x${string}` | undefined => {
    const value = book[name];
    return /^0x[0-9a-fA-F]{40}$/.test(value ?? '') ? (value as `0x${string}`) : undefined;
  };

  return {
    FaucetManager: pick('FaucetManager'),
    ZKPassportNFT: pick('ZKPassportNFT'),
    SwagFactory: pick('SwagFactory'),
    DonationVault: pick('DonationVault'),
    DonationReceipt1155: pick('DonationReceipt1155'),
    Swag1155:
      swagCollection.chainId === def.id ? (swagCollection.address as `0x${string}`) : undefined,
  };
}

function build(def: ChainDef): ChainInfo {
  const rpcUrl = RPC_URLS[def.key];
  const contracts = contractsFor(def);

  return {
    id: def.id,
    key: def.key,
    name: def.name,
    shortName: def.shortName,
    rpcUrl,
    explorerUrl: def.explorerUrl,
    nativeSymbol: def.nativeSymbol,
    nativeName: def.nativeName,
    nativeCoingeckoId: def.nativeCoingeckoId,
    viem: {
      id: def.id,
      name: def.name,
      network: def.key,
      nativeCurrency: { name: def.nativeName, symbol: def.nativeSymbol, decimals: 18 },
      rpcUrls: {
        default: { http: [rpcUrl] },
        public: { http: [rpcUrl] },
      },
      blockExplorers: { default: { name: def.explorerName, url: def.explorerUrl } },
      contracts: { multicall3: { address: MULTICALL3 } },
    },
    tokens: def.tokens,
    contracts,
    features: {
      faucet: Boolean(contracts.FaucetManager),
      identity: Boolean(contracts.ZKPassportNFT),
      donations: Boolean(contracts.DonationVault),
      swag: Boolean(contracts.Swag1155),
      // `<label>.ethcali.eth` is minted through the Durin registrar on Base
      // (ENS_CONFIG in config/constants.ts).
      ens: def.id === CHAIN_IDS.BASE,
      // Anything with an RPC can show a balance and send it.
      send: true,
      swap: SWAP_VERIFIED.has(def.key),
    },
    hidden: def.hidden ?? false,
  };
}

/**
 * Every chain the registry can resolve, hidden ones included. For lookups by
 * id (explorer links, API routes, decoding an indexed row) — never for a list
 * a user sees. Display code reads `CHAINS`.
 */
export const ALL_CHAINS: readonly ChainInfo[] = CHAIN_DEFS.map(build);

/** Every chain the app offers, in display order. Hidden chains are not here. */
export const CHAINS: readonly ChainInfo[] = ALL_CHAINS.filter((c) => !c.hidden);

const BY_ID: ReadonlyMap<number, ChainInfo> = new Map(ALL_CHAINS.map((c) => [c.id, c]));

export const DEFAULT_CHAIN: ChainInfo = CHAINS[0];

// ── Lookups ─────────────────────────────────────────────────────────────────

export function isChainId(id: number | undefined | null): id is ChainId {
  return id !== undefined && id !== null && BY_ID.has(id);
}

/** A known chain, or `undefined` — never a fallback to Base. */
export function getChain(id: ChainId): ChainInfo;
export function getChain(id: number | undefined | null): ChainInfo | undefined;
export function getChain(id: number | undefined | null): ChainInfo | undefined {
  return id === undefined || id === null ? undefined : BY_ID.get(id);
}

/** The chains a feature is offered on, in display order. Hidden chains are never offered. */
export function chainsFor(feature: Feature): ChainInfo[] {
  return CHAINS.filter((c) => c.features[feature]);
}

/** True when `id` names a chain the app offers with `feature`. False for a hidden chain. */
export function hasFeature(id: number | undefined | null, feature: Feature): boolean {
  const chain = getChain(id);
  return chain !== undefined && !chain.hidden && chain.features[feature];
}

export function findToken(id: number | undefined | null, symbol: string): TokenInfo | undefined {
  return getChain(id)?.tokens.find((t) => t.symbol === symbol);
}

// ── Clients ─────────────────────────────────────────────────────────────────

function makeClient(chain: ChainInfo) {
  return createPublicClient({ chain: chain.viem, transport: http(chain.rpcUrl) });
}

export type RegistryPublicClient = ReturnType<typeof makeClient>;

const clients = new Map<ChainId, RegistryPublicClient>();

/**
 * A cached viem public client for the chain. Built once per chain from the
 * registry's own RPC, never from the wallet's provider.
 */
export function publicClientFor(id: ChainId): RegistryPublicClient;
export function publicClientFor(id: number | undefined | null): RegistryPublicClient | undefined;
export function publicClientFor(id: number | undefined | null): RegistryPublicClient | undefined {
  const chain = getChain(id);
  if (!chain) return undefined;
  let client = clients.get(chain.id);
  if (!client) {
    client = makeClient(chain);
    clients.set(chain.id, client);
  }
  return client;
}

// ── Explorer links ──────────────────────────────────────────────────────────

export function explorerTx(id: ChainId, hash: string): string;
export function explorerTx(id: number | undefined | null, hash: string): string | undefined;
export function explorerTx(id: number | undefined | null, hash: string): string | undefined {
  const chain = getChain(id);
  return chain ? `${chain.explorerUrl}/tx/${hash}` : undefined;
}

export function explorerAddress(id: ChainId, address: string): string;
export function explorerAddress(id: number | undefined | null, address: string): string | undefined;
export function explorerAddress(id: number | undefined | null, address: string): string | undefined {
  const chain = getChain(id);
  return chain ? `${chain.explorerUrl}/address/${address}` : undefined;
}

// ── Privy ───────────────────────────────────────────────────────────────────

/**
 * What `PrivyProvider` is told it may sign on: the offered chains, same
 * objects, one list. A hidden chain is not here because nothing asks the
 * wallet to switch to it.
 */
export const PRIVY_SUPPORTED_CHAINS: ChainDefinition[] = CHAINS.map((c) => c.viem);
export const PRIVY_DEFAULT_CHAIN: ChainDefinition = DEFAULT_CHAIN.viem;
