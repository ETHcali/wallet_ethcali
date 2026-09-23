/**
 * Swag hooks. One chain (`SWAG_COLLECTION.chainId`), USDC-only; see
 * docs/swag-rebuild-spec.md in the workspace.
 */

export {
  useSwagCatalogue,
  productImageUrl,
  productOgImageUrl,
  siteProductUrl,
  appProductPath,
  shopifyCartUrl,
  shopifyVariantFor,
  utmFromQuery,
  withUtm,
  usdcDiscountPct,
  SWAG_SITE_ORIGIN,
} from './useSwagCatalogue';
export type { UtmParams } from './useSwagCatalogue';
export { useSwagOnchain } from './useSwagOnchain';
export type { SwagTokenState, SwagOnchainState } from './useSwagOnchain';
export { useBuySwag } from './useBuySwag';
export type { BuyStep, UseBuySwagResult } from './useBuySwag';
export { useMySwag } from './useMySwag';
export type { OwnedSwag } from './useMySwag';
export { useSwagOrdersQuery, useCreateSwagOrder } from './useSwagOrders';
export { useTrm, formatUsd, formatCop } from './useTrm';
export { useSwagLocale, productName, productDescription, productAltName } from './useSwagLocale';
export type { SwagLocale } from './useSwagLocale';
export { translateSwagError, describeBlockedReason, formatUsdc } from './swagErrors';
export { SWAG, SWAG_CHAIN, swagClient, swagKeys } from './client';

// Admin surface (/swag/admin)
export {
  useSwagAdminOrders,
  usePatchSwagOrder,
  useSwagAdminSummary,
  useSwagStock,
  useSwagCollectionState,
  useSwagAdminTx,
  looksLikeAddressInput,
  resolveAddressInput,
} from './useSwagAdmin';
export type {
  AdminOrderFilters,
  SwagTokenStock,
  SwagCollectionState,
  SwagAdminTxResult,
} from './useSwagAdmin';

// Artwork pipeline (admin)
export {
  useSwagArtwork,
  type SwagVariant,
  type SwagVariantPatch,
  type SwagProductSummary,
  type SwagCategory,
  type ArtworkStatus,
} from './useSwagArtwork';
