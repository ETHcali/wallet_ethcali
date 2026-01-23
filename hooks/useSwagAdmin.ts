/**
 * useSwagAdmin - Re-export from modular swag hooks
 * @deprecated Import directly from './swag' instead
 */

export {
  useContractSettings,
  useUpdateDesignInfo,
  useUpdateDesignDiscountConfig,
  useSetDesignActive,
  useSetDesignPaymentToken,
  useSetDesignPrice,
  useSetDesignTotalSupply,
  useAllMintedNFTs,
  useMarkRedemptionFulfilled,
  RedemptionStatus,
} from './swag';

export type { MintedNFT } from './swag';
