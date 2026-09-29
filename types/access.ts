import type { AccessContractKey, AccessRoleKey } from '../config/access';

export interface AccessHolder {
  contract: AccessContractKey;
  role: AccessRoleKey;
}

/** One contract's live holders. Wallets are lowercase. */
export interface AccessContractView {
  key: AccessContractKey;
  address: string | null;
  holders: Partial<Record<AccessRoleKey, string[]>>;
  /** Set when the chain could not be read; `holders` is then empty, never partial. */
  readError: string | null;
}

export interface AccessPerson {
  label: string | null;
  email: string | null;
}

export interface SeedStatus {
  address: string;
  label: string;
  /** Roles config/access.ts expects that the chain does not show. */
  missing: AccessHolder[];
}

export interface AccessMatrix {
  contracts: AccessContractView[];
  people: Record<string, AccessPerson>;
  seed: SeedStatus[];
  readAt: string;
}

export interface AccessResolveResponse {
  did: string;
  address: string;
  created: boolean;
}
