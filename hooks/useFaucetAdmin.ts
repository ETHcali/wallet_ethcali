/**
 * useFaucetAdmin - Re-export from modular faucet hooks
 * @deprecated Import directly from './faucet' instead
 */

export {
  useFaucetManagerAdmin,
  useAllVaults,
  useActiveVaults,
  useVaultById,
  useFaucetPaused,
  useCreateVault,
  useUpdateVault,
  useVaultDeposit,
  useVaultWithdraw,
  useFaucetPause,
  useVaultWhitelist,
  useIsWhitelisted,
} from './faucet';
