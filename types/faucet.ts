export enum VaultType {
  NonReturnable = 0,
  Returnable = 1,
}

export interface Vault {
  id: number;
  name: string;
  description: string;
  claimAmount: bigint;
  balance: bigint;
  totalClaimed: bigint;
  totalReturned: bigint;
  vaultType: VaultType;
  active: boolean;
  whitelistEnabled: boolean;
  createdAt: number;
}

export interface ClaimInfo {
  hasClaimed: boolean;
  claimedAmount: bigint;
  claimedAt: number;
  hasReturned: boolean;
  returnedAmount: bigint;
  returnedAt: number;
}

export interface VaultFormData {
  name: string;
  description: string;
  claimAmount: string; // ETH amount as string for form input
  vaultType: VaultType;
}

export interface VaultUpdateData {
  vaultId: number;
  name: string;
  description: string;
  claimAmount: string; // ETH amount as string
  active: boolean;
}
