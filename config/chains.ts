/**
 * The chain registry: Ethereum mainnet, and nothing else the user can see.
 *
 * Two entries exist. `ETHEREUM` is where every feature lives — wallet
 * balances, faucet, identity, donations, swag, swap — and is the default chain
 * Privy starts embedded wallets on. `ENS_CHAIN` (Base) exists for exactly one
 * action: the `<label>.ethcali.eth` claim, whose Durin registrar was deployed
 * there and nowhere else. Nothing lists Base, prices it, or reads a balance
 * on it; the ENS hooks address `ENS_CHAIN_ID` directly and `useRequireChain`
 * moves the wallet there right before signing.
 *
 * There is no multi-chain UI. Adding a chain is a deliberate future change:
 * an entry here, a deployment in `frontend/addresses.json`, and a decision
 * about which features it offers — not a flag.
 *
 * Rules this file enforces:
 *   - A read takes an explicit chain id. Nothing reads "the wallet's chain".
 *   - An unknown chain id resolves to `undefined`; the UI says "not
 *     supported" rather than silently falling back.
 *   - Token addresses were read from the token itself when added
 *     (`symbol()`, `decimals()`); decimals are never assumed.
 */
import { createPublicClient, http } from 'viem';
import addressesJson from '../frontend/addresses.json';
import swagCollection from '../frontend/swag-collection.json';

// ── Identity ────────────────────────────────────────────────────────────────

export const CHAIN_IDS = {
  ETHEREUM: 1,
  BASE: 8453,
} as const;

export type ChainId = (typeof CHAIN_IDS)[keyof typeof CHAIN_IDS];

/** The key each chain has in the generated `frontend/addresses.json`. */
export type ChainKey = 'ethereum' | 'base';

export type TokenSymbol = 'USDC' | 'USDT' | 'EURC';

export interface TokenInfo {
  symbol: TokenSymbol;
  name: string;
  address: `0x${string}`;
  /** Read from the token itself when it was added. USDC/USDT/EURC are 6. */
  decimals: number;
  /** CoinGecko id used to price it. */
  coingeckoId: string;
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
 * `viem/chains`: Privy bundles viem 2 whose `Chain` type does not accept
 * viem 1's `formatters`. A plain object with only the shared fields
 * satisfies both.
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
  rpcUrl: string;
  /** The explorer's own name, for link labels ("Contract on Etherscan"). */
  explorerName: string;
  explorerUrl: string;
  nativeSymbol: 'ETH';
  nativeName: string;
  nativeCoingeckoId: string;
  viem: ChainDefinition;
  tokens: readonly TokenInfo[];
  contracts: ChainContracts;
}

// ── Inputs ──────────────────────────────────────────────────────────────────

/** Same canonical Multicall3 deployment on both chains. */
const MULTICALL3 = '0xcA11bde05977b3631167028862bE2a173976CA11' as const;

/** Sentinel the contracts use to mean "the chain's native token". */
export const NATIVE_TOKEN_SENTINEL = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';

/**
 * Where `<label>.ethcali.eth` is minted: the Durin registrar exists on Base
 * and nowhere else. The one action the app signs off Ethereum.
 */
export const ENS_CHAIN_ID = CHAIN_IDS.BASE;

/**
 * RPC per chain. The env names are read literally so Next can inline them at
 * build time; a `process.env[dynamicKey]` lookup would always be undefined in
 * the browser.
 */
const RPC_URLS: Record<ChainKey, string> = {
  ethereum: process.env.NEXT_PUBLIC_MAINNET_RPC_URL || 'https://eth.llamarpc.com',
  base: process.env.NEXT_PUBLIC_BASE_RPC_URL || 'https://mainnet.base.org',
};

interface ChainDef {
  id: ChainId;
  key: ChainKey;
  name: string;
  explorerName: string;
  explorerUrl: string;
  nativeName: string;
  tokens: readonly TokenInfo[];
}

const ETHEREUM_DEF: ChainDef = {
  id: CHAIN_IDS.ETHEREUM,
  key: 'ethereum',
  name: 'Ethereum',
  explorerName: 'Etherscan',
  explorerUrl: 'https://etherscan.io',
  nativeName: 'Ether',
  tokens: [
    { symbol: 'USDC', name: 'USD Coin', address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', decimals: 6, coingeckoId: 'usd-coin' },
    { symbol: 'USDT', name: 'Tether USD', address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', decimals: 6, coingeckoId: 'tether' },
    { symbol: 'EURC', name: 'Euro Coin', address: '0x1aBaEA1f7C830bD89Acc67eC4af516284b1bC33c', decimals: 6, coingeckoId: 'euro-coin' },
  ],
};

/** Base, for the ethcali.eth registrar only. No tokens: nothing shows a Base balance. */
const ENS_CHAIN_DEF: ChainDef = {
  id: CHAIN_IDS.BASE,
  key: 'base',
  name: 'Base',
  explorerName: 'Basescan',
  explorerUrl: 'https://basescan.org',
  nativeName: 'Ether',
  tokens: [],
};

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

  return {
    id: def.id,
    key: def.key,
    name: def.name,
    rpcUrl,
    explorerName: def.explorerName,
    explorerUrl: def.explorerUrl,
    nativeSymbol: 'ETH',
    nativeName: def.nativeName,
    nativeCoingeckoId: 'ethereum',
    viem: {
      id: def.id,
      name: def.name,
      network: def.key,
      nativeCurrency: { name: def.nativeName, symbol: 'ETH', decimals: 18 },
      rpcUrls: {
        default: { http: [rpcUrl] },
        public: { http: [rpcUrl] },
      },
      blockExplorers: { default: { name: def.explorerName, url: def.explorerUrl } },
      contracts: { multicall3: { address: MULTICALL3 } },
    },
    tokens: def.tokens,
    contracts: contractsFor(def),
  };
}

/** The chain. Every feature reads and signs here. */
export const ETHEREUM: ChainInfo = build(ETHEREUM_DEF);

/** Base, resolvable for the ethcali.eth claim and for nothing else. */
export const ENS_CHAIN: ChainInfo = build(ENS_CHAIN_DEF);

export const DEFAULT_CHAIN: ChainInfo = ETHEREUM;

/**
 * Every chain the registry can resolve. For lookups by id (explorer links, an
 * old transaction's chain) — never for a list a user sees. There is no such
 * list: the app is Ethereum only.
 */
export const ALL_CHAINS: readonly ChainInfo[] = [ETHEREUM, ENS_CHAIN];

const BY_ID: ReadonlyMap<number, ChainInfo> = new Map(ALL_CHAINS.map((c) => [c.id, c]));

// ── Lookups ─────────────────────────────────────────────────────────────────

export function isChainId(id: number | undefined | null): id is ChainId {
  return id !== undefined && id !== null && BY_ID.has(id);
}

/** A known chain, or `undefined` — never a fallback to the default. */
export function getChain(id: ChainId): ChainInfo;
export function getChain(id: number | undefined | null): ChainInfo | undefined;
export function getChain(id: number | undefined | null): ChainInfo | undefined {
  return id === undefined || id === null ? undefined : BY_ID.get(id);
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
 * What `PrivyProvider` is told it may sign on. `wallet.switchChain` and
 * `sendTransaction({ chainId })` throw for a chain outside this list, so Base
 * has to be here for the name claim even though nothing else offers it.
 */
export const PRIVY_SUPPORTED_CHAINS: ChainDefinition[] = ALL_CHAINS.map((c) => c.viem);
export const PRIVY_DEFAULT_CHAIN: ChainDefinition = DEFAULT_CHAIN.viem;
