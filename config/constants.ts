/**
 * Application constants that are not about a chain.
 *
 * Chains, RPCs, explorers, tokens and per-chain contracts live in
 * `config/chains.ts` — the one registry. The handful of chain-shaped exports
 * at the bottom of this file are views over that registry kept for the swag
 * module and the API routes, which import them by these names.
 */
import swagCollection from '../frontend/swag-collection.json';
import {
  ALL_CHAINS,
  CHAIN_IDS,
  ENS_CHAIN_ID,
  NATIVE_TOKEN_SENTINEL,
  findToken,
  getChain,
  isChainId,
  type ChainId,
} from './chains';

export { CHAIN_IDS, NATIVE_TOKEN_SENTINEL, type ChainId };

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
// SWAG COLLECTION
// =============================================================================
/**
 * The live Swag1155 clone, `ETHCALI-SWAG-2026`, on one chain — Ethereum
 * mainnet today — priced in USDC only. There is no chain selector anywhere in
 * the swag UI: every read, write and explorer link takes `SWAG_COLLECTION.chainId`.
 *
 * Nothing here is typed by hand. `frontend/swag-collection.json` is written by
 * `npm run sync:contracts` (SWAG_CHAIN=ethereum) from the contracts repo's
 * deployment record, so moving the store or redeploying the clone shows up as
 * a diff in that file rather than as a stale literal. The USDC the collection
 * was deployed against must be the registry's USDC for that chain; a mismatch
 * fails the build here instead of a buyer's approve().
 */
if (!isChainId(swagCollection.chainId)) {
  throw new Error(`frontend/swag-collection.json names chain ${swagCollection.chainId}, which config/chains.ts does not know`);
}
const swagChainId: ChainId = swagCollection.chainId;
const swagUsdc = findToken(swagChainId, 'USDC');
if (!swagUsdc) throw new Error(`config/chains.ts: chain ${swagChainId} has no USDC entry`);
if (swagUsdc.address.toLowerCase() !== swagCollection.usdc.toLowerCase()) {
  throw new Error(
    `frontend/swag-collection.json says the collection takes USDC ${swagCollection.usdc}, the registry lists ${swagUsdc.address}`
  );
}

export const SWAG_COLLECTION = {
  name: swagCollection.name,
  chainId: swagChainId,
  address: swagCollection.address as `0x${string}`,
  /** The chain's USDC — the only payment token the collection accepts. */
  usdc: swagUsdc.address,
  /** 6. Read from the registry's token entry, never assumed. */
  usdcDecimals: swagUsdc.decimals,
} as const;

/** The Shopify store behind "Pay with card". COP, Stripe connected. */
/** Customer-facing store host (Shopify primary domain). The Admin API still uses SHOPIFY_STORE_DOMAIN (the .myshopify.com host). */
export const SWAG_SHOPIFY_STORE = 'store.ethcali.org';

// =============================================================================
// ENS CONFIGURATION
// =============================================================================
/**
 * ethcali.eth subnames live on Base (Durin). Verified on-chain 2026-09-04:
 * registrar.registry() == registry, registry.name() == "ethcali.eth",
 * registry.registrars(registrar) == true. The mainnet resolver for ethcali.eth is
 * still the ENS PublicResolver, so L1 resolution of these names is not wired yet;
 * the wallet reads the Base registry directly and treats that as the truth.
 *
 * The app is Ethereum only; the name claim is the one deliberate exception
 * and switches the wallet to Base lazily, right before signing.
 */
export const ENS_CONFIG = {
  parentName: 'ethcali.eth',
  chainId: ENS_CHAIN_ID,
  registrar: '0x7103595fc32b4072b775e9f6b438921c8cf532ed',
  registry: '0x58f23036463463f947aeadab97eeecf5a76049c7',
} as const;

// =============================================================================
// REGISTRY VIEWS — for pages/api/** and the swag module only
// =============================================================================

/** RPC for a chain, from the registry. Throws for an unknown id rather than guessing. */
export function getRpcUrl(chainId: ChainId): string {
  const chain = getChain(chainId);
  if (!chain) throw new Error(`No RPC configured for chain ${chainId}`);
  return chain.rpcUrl;
}

export const EXPLORER_URLS: Record<ChainId, string> = Object.fromEntries(
  ALL_CHAINS.map((c) => [c.id, c.explorerUrl])
) as Record<ChainId, string>;

export const NATIVE_SYMBOLS: Record<ChainId, string> = Object.fromEntries(
  ALL_CHAINS.map((c) => [c.id, c.nativeSymbol])
) as Record<ChainId, string>;
