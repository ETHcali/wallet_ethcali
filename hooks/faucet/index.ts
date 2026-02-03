/**
 * Faucet hooks - Re-export all faucet-related hooks
 */

// Admin hooks
export { useFaucetManagerAdmin } from './useFaucetManagerAdmin';

// Vault query hooks
export { useAllVaults, useActiveVaults, useVaultById, useFaucetPaused } from './useVaults';

// Vault mutation hooks
export {
  useCreateVault,
  useUpdateVault,
  useVaultDeposit,
  useVaultWithdraw,
  useFaucetPause,
  useUpdateVaultGating,
} from './useVaultMutations';

// Whitelist hooks
export { useVaultWhitelist, useIsWhitelisted } from './useVaultWhitelist';
