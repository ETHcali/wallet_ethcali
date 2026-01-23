/**
 * Swag hooks - Re-export all swag-related hooks
 */

// Query hooks
export { useContractSettings } from './useDesignQueries';

// Mutation hooks
export {
  useUpdateDesignInfo,
  useUpdateDesignDiscountConfig,
  useSetDesignActive,
  useSetDesignPaymentToken,
  useSetDesignPrice,
  useSetDesignTotalSupply,
} from './useDesignMutations';

// Minted NFTs hooks
export { useAllMintedNFTs } from './useMintedNFTs';
export type { MintedNFT } from './useMintedNFTs';

// Fulfillment hooks
export { useMarkRedemptionFulfilled } from './useNFTFulfillment';

// Re-export types
export { RedemptionStatus } from '../../types/swag';
