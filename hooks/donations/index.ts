/**
 * Donations hooks — barrel export.
 */

// Address / deployment resolution
export {
  useDonationAddresses,
  useDeployedDonationChains,
  getDonationChainConfig,
  getDonationTokens,
  DONATION_CHAIN_IDS,
  type DonationChainConfig,
} from './useDonationAddresses';

// Campaign queries
export {
  useActiveCampaigns,
  useCampaign,
  useCampaignTotals,
  useCampaignTiers,
  useResolveTier,
  useCanDonate,
} from './useCampaigns';

// Donate mutations
export {
  useDonate,
  useDonationAllowance,
  useDonorBalance,
  type UseDonateResult,
} from './useDonate';

// Donor wall
export { useDonorWall } from './useDonorWall';

// Beneficiary identity
export {
  useBeneficiaryProfile,
  useBeneficiarySafe,
  ETHCALI_ENS_NAME,
} from './useBeneficiary';

// Admin
export {
  useDonationAdmin,
  useDonationAdminActions,
  useReceiptMinterStatus,
  type DonationAdminStatus,
  type DonationAdminActions,
  type CreateCampaignInput,
} from './useDonationAdmin';

// Display currency
export {
  useDisplayCurrency,
  useDisplayCurrencyStore,
  useFxRates,
  type CurrencyFormatter,
  type FxRates,
} from './useDisplayCurrency';
