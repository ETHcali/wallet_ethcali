/**
 * Swag hooks - Re-export all swag-related hooks
 */

// Variant query hooks
export { useTokenIds, useVariant, useVariantUri, useVariantRemaining, useContractSettings } from './useVariantQueries';

// Variant mutation hooks
export { useSetVariant, useSetVariantWithURI } from './useVariantMutations';

// Royalty hooks
export { useRoyalties, useTotalRoyaltyBps, useAddRoyalty, useClearRoyalties } from './useRoyalties';

// Minted NFTs hooks
export { useAllMintedNFTs } from './useMintedNFTs';
export type { MintedNFT } from './useMintedNFTs';

// Fulfillment hooks
export { useMarkRedemptionFulfilled } from './useNFTFulfillment';

// Discount hooks
export { usePoapDiscounts, useHolderDiscounts, useDiscountedPrice, useAddPoapDiscount, useRemovePoapDiscount, useAddHolderDiscount, useRemoveHolderDiscount } from './useDiscounts';

// Re-export types
export { RedemptionStatus } from '../../types/swag';
export type { Variant, RoyaltyInfo, PoapDiscount, HolderDiscount } from '../../types/swag';
