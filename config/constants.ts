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
  CHAINS,
  CHAIN_IDS,
  NATIVE_TOKEN_SENTINEL,
  findToken,
  getChain,
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
  // COPm (Mento Colombian Peso) is 18 decimals, unlike the 6-decimal
  // stablecoins above. Never assume 6 for a "stablecoin".
  COPm: 18,
} as const;

// =============================================================================
// SWAG COLLECTION
// =============================================================================
/**
 * The live Swag1155 clone on Base, `ETHCALI-SWAG-2026`. Swag is Base-only and
 * priced in USDC only; there is no chain selector anywhere in the swag UI.
 *
 * The address is not typed here by hand: `frontend/swag-collection.json` is
 * written by `npm run sync:contracts` from scs-ethcali/deployments/base-latest.json,
 * so a redeploy shows up as a diff in that file rather than as a stale literal.
 */
const baseUsdc = findToken(CHAIN_IDS.BASE, 'USDC');
if (!baseUsdc) throw new Error('config/chains.ts: Base has no USDC entry');

export const SWAG_COLLECTION_BASE = {
  name: swagCollection.name,
  chainId: CHAIN_IDS.BASE,
  address: swagCollection.address as `0x${string}`,
  /** Base USDC — the only payment token the collection accepts. */
  usdc: baseUsdc.address,
  usdcDecimals: baseUsdc.decimals,
} as const;

/** The Shopify store behind "Pay with card". COP, Stripe connected. */
export const SWAG_SHOPIFY_STORE = 'qpsxyq-9g.myshopify.com';

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
  CHAINS.map((c) => [c.id, c.explorerUrl])
) as Record<ChainId, string>;

export const NATIVE_SYMBOLS: Record<ChainId, string> = Object.fromEntries(
  CHAINS.map((c) => [c.id, c.nativeSymbol])
) as Record<ChainId, string>;
