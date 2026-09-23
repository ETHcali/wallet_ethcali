/**
 * The one place the swag hooks touch the chain from.
 *
 * The collection lives on one chain, `SWAG_COLLECTION.chainId`, and nothing
 * in the swag code names that chain any other way. The client is the
 * registry's, built from its RPC and never from the wallet — a wallet
 * elsewhere still reads the collection and is asked to switch only when it
 * is about to sign.
 */
import { getChain, publicClientFor } from '../../config/chains';
import { SWAG_COLLECTION } from '../../config/constants';

export const SWAG = SWAG_COLLECTION;

/** The registry entry for the collection's chain: name, explorer, client. */
export const SWAG_CHAIN = getChain(SWAG.chainId);

export const swagClient = publicClientFor(SWAG.chainId);

/**
 * Minimal ERC-20 surface for USDC. Declared here rather than imported from
 * viem because this project pins viem 1.x, which does not export `erc20Abi`.
 */
export const erc20Abi = [
  {
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'allowance',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const;

/** Query keys, in one place so invalidation after a buy cannot miss one. */
export const swagKeys = {
  catalogue: ['swag-catalogue'] as const,
  trm: ['fx-trm'] as const,
  onchain: (tokenIds: readonly number[]) => ['swag-onchain', tokenIds.join(',')] as const,
  allowance: (owner?: string) => ['swag-usdc-allowance', owner?.toLowerCase()] as const,
  usdcBalance: (owner?: string) => ['swag-usdc-balance', owner?.toLowerCase()] as const,
  myBalances: (owner?: string) => ['swag-my-balances', owner?.toLowerCase()] as const,
  orders: (owner?: string) => ['swag-orders', owner?.toLowerCase()] as const,
  // Admin surface (/swag/admin)
  adminOrders: (filters: string) => ['swag-admin-orders', filters] as const,
  adminSummary: ['swag-admin-summary'] as const,
  adminStock: (tokenIds: readonly number[]) => ['swag-admin-stock', tokenIds.join(',')] as const,
  adminRoles: (account?: string) => ['swag-admin-roles', account?.toLowerCase()] as const,
};
