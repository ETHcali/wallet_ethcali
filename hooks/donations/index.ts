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

// Fiat donation accounts
export {
  useCampaignBankAccounts,
  useBankAccountAdmin,
  useCampaignRowId,
  type PublicBankAccount,
  type BankAccount,
  type BankAccountInput,
  type BankAccountType,
  type BankAccountCurrency,
  type HolderDocumentType,
} from './useCampaignBankAccounts';

// Display currency
export {
  useDisplayCurrency,
  useDisplayCurrencyStore,
  useFxRates,
  tokenToUsd,
  type CurrencyFormatter,
  type FxRates,
} from './useDisplayCurrency';
