/**
 * The hash is not the outcome. Every admin write awaits this before it
 * re-reads the chain and releases its button: resolve on the hash alone and
 * the button re-enables while the change is still in flight, which is how a
 * second click sends the same change twice.
 */
import type { Hex } from 'viem';
import { publicClientFor } from '../config/chains';

export async function waitForSuccess(chainId: number, hash: Hex): Promise<void> {
  const client = publicClientFor(chainId);
  if (!client) throw new Error(`Chain ${chainId} is not supported`);
  const receipt = await client.waitForTransactionReceipt({ hash });
  if (receipt.status !== 'success') throw new Error('The transaction reverted on chain. Nothing changed.');
}
