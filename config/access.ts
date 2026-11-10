/**
 * Who can do what, contract by contract — the registry behind /admin/access
 * and the Access tab on every product page.
 *
 * Every entry is an Ethereum contract the app administers. Roles are read
 * from the chain (hasRole / owner()); nothing here grants anything. The file
 * only names the roles, says what each one unlocks in the app, and says which
 * role can hand it out, so the UI can offer a grant to exactly the wallet
 * whose transaction the contract would accept.
 *
 * Verified on chain 2026-09-28: every AccessControl contract below reports
 * getRoleAdmin(ADMIN_ROLE) == DEFAULT_ADMIN_ROLE, so grantRole / revokeRole
 * from a DEFAULT_ADMIN_ROLE holder is the one grant path for all of them.
 */
import { keccak256, toBytes, type Address, type Hex } from 'viem';
import { CERT_ADDRESS } from '../lib/certificates/nft';
import { DEFAULT_ADMIN_ROLE, FULFILLMENT_ROLE, SIGNER_ROLE } from '../lib/swag/roles';
import { DEFAULT_CHAIN } from './chains';

export const ADMIN_ROLE = keccak256(toBytes('ADMIN_ROLE'));
export const MINTER_ROLE = keccak256(toBytes('MINTER_ROLE'));

/**
 * The operators every contract should always recognise. Owner decision
 * 2026-09-28: the EOA 0x35b0…BC6B, held by the ETH Cali foundation account,
 * is the seed admin — the wallet expected to reach every admin page and to
 * add everyone else. The Access page flags each role listed here that the
 * chain does not show, and offers the grant to whoever can sign it.
 *
 * Donations stop at ADMIN_ROLE on purpose: DEFAULT_ADMIN_ROLE there changes
 * the beneficiary and custody mode, and stays with the Safe.
 */
export interface SeedOperator {
  address: Address;
  label: string;
  expects: Partial<Record<AccessContractKey, readonly AccessRoleKey[]>>;
}

export const SEED_OPERATORS: readonly SeedOperator[] = [
  {
    address: '0x35b0c64CeDC2fD1a7298984CBa5C7E402970BC6B',
    label: 'ETH Cali foundation (seed operator)',
    expects: {
      swag: ['super', 'admin'],
      faucet: ['super', 'admin'],
      donations: ['admin'],
      receipts: ['admin'],
      identity: ['owner'],
      certificates: ['super', 'admin'],
    },
  },
];

/** Known wallets, named, so the matrix never shows an anonymous key the team already knows. */
export const KNOWN_WALLETS: Readonly<Record<string, string>> = {
  '0x35b0c64cedc2fd1a7298984cba5c7e402970bc6b': 'ETH Cali foundation (seed operator)',
  '0x3b89ad8cc39900778abcdcc22bc83cac031a415b': 'Ops key',
  '0xb6bde4fb6dfbad5488fa31edf0f3730d9d86da64': 'ethcali.eth Safe (3-of-5)',
  '0x3c9204b25966591749450fb233d58e850e7c1f9f': 'Original deployer',
  '0x397798d66f6a563c2ea51cd6f0a708c7298062e6': 'Swag voucher signer (server key)',
};

export type AccessRoleKey = 'super' | 'admin' | 'fulfilment' | 'signer' | 'minter' | 'owner';

export interface AccessRoleDef {
  key: AccessRoleKey;
  /** bytes32 role id; absent for Ownable's owner. */
  id?: Hex;
  label: string;
  /** What holding it unlocks, in the words an operator would use. */
  unlocks: string;
  /**
   * Whether the Access UI offers a grant form for it. MINTER is contract-to-
   * contract; the swag SIGNER moves only through addSigner / removeSigner.
   */
  grantable: boolean;
}

export type AccessContractKey = 'swag' | 'faucet' | 'donations' | 'receipts' | 'identity' | 'certificates';

export interface AccessContractDef {
  key: AccessContractKey;
  name: string;
  /** The admin page this contract belongs to. */
  product: 'swag' | 'faucet' | 'donations' | 'identity' | 'certificates';
  address: Address | undefined;
  kind: 'accessControl' | 'ownable';
  roles: readonly AccessRoleDef[];
}

const SUPER: AccessRoleDef = {
  key: 'super',
  id: DEFAULT_ADMIN_ROLE,
  label: 'Super admin',
  unlocks: 'Grants and revokes every role on this contract',
  grantable: true,
};

const c = DEFAULT_CHAIN.contracts;

export const ACCESS_CONTRACTS: readonly AccessContractDef[] = [
  {
    key: 'swag',
    name: 'Swag collection',
    product: 'swag',
    address: c.Swag1155,
    kind: 'accessControl',
    roles: [
      SUPER,
      { key: 'admin', id: ADMIN_ROLE, label: 'Admin', unlocks: 'Prices, caps, pause, vouchers, and the whole order desk', grantable: true },
      { key: 'fulfilment', id: FULFILLMENT_ROLE, label: 'Fulfilment', unlocks: 'Order desk only: addresses, batch, print sheet, shipped', grantable: true },
      {
        key: 'signer',
        id: SIGNER_ROLE,
        label: 'Voucher signer',
        unlocks: 'The server key whose vouchers claim() accepts for card and event orders. Changed with addSigner / removeSigner.',
        grantable: false,
      },
    ],
  },
  {
    key: 'faucet',
    name: 'FaucetManager',
    product: 'faucet',
    address: c.FaucetManager,
    kind: 'accessControl',
    roles: [
      SUPER,
      { key: 'admin', id: ADMIN_ROLE, label: 'Admin', unlocks: 'Create vaults, fund them, whitelist, pause', grantable: true },
    ],
  },
  {
    key: 'donations',
    name: 'DonationVault',
    product: 'donations',
    address: c.DonationVault,
    kind: 'accessControl',
    roles: [
      { ...SUPER, unlocks: 'Grants roles, changes the beneficiary and custody mode. Held by the Safe by design.' },
      {
        key: 'admin',
        id: ADMIN_ROLE,
        label: 'Admin',
        unlocks: 'Campaigns, currencies, tiers, pause — and site content and artwork editing across the app',
        grantable: true,
      },
    ],
  },
  {
    key: 'receipts',
    name: 'DonationReceipt1155',
    product: 'donations',
    address: c.DonationReceipt1155,
    kind: 'accessControl',
    roles: [
      { ...SUPER, unlocks: 'Grants roles and the minter. Held by the Safe by design.' },
      { key: 'admin', id: ADMIN_ROLE, label: 'Admin', unlocks: 'Receipt tiers', grantable: true },
      { key: 'minter', id: MINTER_ROLE, label: 'Minter', unlocks: 'Mints donor receipts (the DonationVault)', grantable: false },
    ],
  },
  {
    key: 'certificates',
    name: 'BuilderCertificate',
    product: 'certificates',
    address: CERT_ADDRESS,
    kind: 'accessControl',
    roles: [
      SUPER,
      { key: 'admin', id: ADMIN_ROLE, label: 'Admin', unlocks: 'Issue builder certificates and re-point minted metadata', grantable: true },
    ],
  },
  {
    key: 'identity',
    name: 'ZKPassportNFT',
    product: 'identity',
    address: c.ZKPassportNFT,
    kind: 'ownable',
    roles: [{ key: 'owner', label: 'Owner', unlocks: 'Metadata, verifier, domain and scope. One owner; transferring is final.', grantable: true }],
  },
];

export function accessContract(key: AccessContractKey): AccessContractDef | undefined {
  return ACCESS_CONTRACTS.find((x) => x.key === key);
}

/** The role that can grant `role` on its contract: DEFAULT_ADMIN_ROLE, or the owner itself. */
export function granterOf(contract: AccessContractDef): AccessRoleKey {
  return contract.kind === 'ownable' ? 'owner' : 'super';
}
