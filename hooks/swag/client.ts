/**
 * The one place the swag hooks touch the chain from.
 *
 * Swag is Base-only. The client is built with an explicit chain and the RPC
 * from config, never from the wallet — a wallet on Optimism still reads the
 * Base collection and is asked to switch only when it is about to sign.
 */
import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';
import { CHAIN_IDS, SWAG_COLLECTION_BASE, getRpcUrl } from '../../config/constants';

export const SWAG = SWAG_COLLECTION_BASE;

export const swagClient = createPublicClient({
  chain: base,
  transport: http(getRpcUrl(CHAIN_IDS.BASE)),
});

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
};
