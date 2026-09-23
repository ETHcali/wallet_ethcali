/**
 * Read helpers for the ZKPassportNFT and FaucetManager contracts.
 *
 * Every function takes an explicit chain id and resolves the deployment and
 * the client through the registry. A chain without the contract returns the
 * safe default (false / empty) and logs; nothing falls back to Base.
 */
import { encodeFunctionData, formatEther } from 'viem';
import FaucetManagerABI from '../frontend/abis/FaucetManager.json';
import ZKPassportNFTABI from '../frontend/abis/ZKPassportNFT.json';
import { getChain, publicClientFor } from '../config/chains';
import { logger } from './logger';

function zkpassportOn(chainId: number) {
  const chain = getChain(chainId);
  const address = chain?.contracts.ZKPassportNFT;
  const client = publicClientFor(chainId);
  if (!chain || !address || !client) {
    logger.debug(`ZKPassportNFT is not deployed on chain ${chainId}`);
    return null;
  }
  return { client, address };
}

function faucetOn(chainId: number) {
  const chain = getChain(chainId);
  const address = chain?.contracts.FaucetManager;
  const client = publicClientFor(chainId);
  if (!chain || !address || !client) {
    logger.debug(`FaucetManager is not deployed on chain ${chainId}`);
    return null;
  }
  return { client, address };
}

// The ABIs are generated JSON, so viem cannot infer function names or return
// types from them; the call goes through one loosely typed helper.
async function read(
  client: NonNullable<ReturnType<typeof publicClientFor>>,
  address: `0x${string}`,
  abi: unknown,
  functionName: string,
  args?: unknown[]
): Promise<any> {
  return client.readContract({ address, abi, functionName, args } as any);
}

function isRateLimit(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return message.includes('429') || message.includes('503');
}

// ============================================
// ZKPassportNFT
// ============================================

export async function hasNFTByAddress(chainId: number, userAddress: string): Promise<boolean> {
  const target = zkpassportOn(chainId);
  if (!target) return false;

  try {
    return Boolean(await read(target.client, target.address, ZKPassportNFTABI, 'hasNFTByAddress', [userAddress]));
  } catch {
    // Fall back to ERC721 balanceOf if the custom view is unavailable on this RPC.
    try {
      const balance = (await read(target.client, target.address, ZKPassportNFTABI, 'balanceOf', [userAddress])) as bigint;
      return balance > 0n;
    } catch (fallbackError) {
      if (!isRateLimit(fallbackError)) logger.error('Error checking NFT ownership:', fallbackError);
      return false;
    }
  }
}

/** Whether a bytes32 scoped nullifier already has an NFT on this chain. */
export async function hasNFTByIdentifier(chainId: number, uniqueIdentifier: `0x${string}` | string): Promise<boolean> {
  const target = zkpassportOn(chainId);
  if (!target) return false;

  try {
    return Boolean(await read(target.client, target.address, ZKPassportNFTABI, 'hasNFTByIdentifier', [uniqueIdentifier]));
  } catch (error) {
    logger.error('Error checking NFT by identifier:', error);
    return false;
  }
}

// ============================================
// FaucetManager
// ============================================

export async function isFaucetPaused(chainId: number): Promise<boolean> {
  const target = faucetOn(chainId);
  if (!target) return false;

  try {
    return Boolean(await read(target.client, target.address, FaucetManagerABI, 'paused'));
  } catch (error) {
    logger.error('Error checking faucet paused status:', error);
    return false;
  }
}

export interface ActiveVault {
  id: number;
  name: string;
  description: string;
  claimAmount: bigint;
  balance: bigint;
  totalClaimed: bigint;
  totalReturned: bigint;
  vaultType: number;
  active: boolean;
  whitelistEnabled: boolean;
  createdAt: number;
}

export async function getActiveVaults(chainId: number): Promise<ActiveVault[]> {
  const target = faucetOn(chainId);
  if (!target) return [];

  try {
    const [vaultIds, vaults] = (await read(target.client, target.address, FaucetManagerABI, 'getActiveVaults')) as [bigint[], any[]];
    return vaults.map((vault, index) => ({
      id: Number(vaultIds[index]),
      name: vault.name,
      description: vault.description,
      claimAmount: vault.claimAmount,
      balance: vault.balance,
      totalClaimed: vault.totalClaimed,
      totalReturned: vault.totalReturned,
      vaultType: vault.vaultType,
      active: vault.active,
      whitelistEnabled: vault.whitelistEnabled,
      createdAt: Number(vault.createdAt),
    }));
  } catch (error) {
    logger.error('Error getting active vaults:', error);
    return [];
  }
}

/** Mirrors the contract's `canUserClaim` so the button can be disabled with a reason. */
export async function canUserClaim(
  chainId: number,
  vaultId: number,
  userAddress: string
): Promise<{ canClaim: boolean; reason: string }> {
  const target = faucetOn(chainId);
  if (!target) return { canClaim: false, reason: 'Faucet is not deployed on this network' };

  try {
    const result = await read(target.client, target.address, FaucetManagerABI, 'canUserClaim', [vaultId, userAddress]);
    if (Array.isArray(result)) {
      return { canClaim: Boolean(result[0]), reason: String(result[1] || '') };
    }
    return { canClaim: Boolean(result.canClaim), reason: String(result.reason || '') };
  } catch (error) {
    logger.error('Error checking user claim eligibility:', error);
    return { canClaim: false, reason: 'Error checking eligibility' };
  }
}

export interface ClaimInfo {
  hasClaimed: boolean;
  claimedAmount: string;
  claimedAt: number;
  hasReturned: boolean;
  returnedAmount: string;
  returnedAt: number;
}

export async function getClaimInfo(chainId: number, vaultId: number, userAddress: string): Promise<ClaimInfo | null> {
  const target = faucetOn(chainId);
  if (!target) return null;

  try {
    const result = await read(target.client, target.address, FaucetManagerABI, 'getClaimInfo', [vaultId, userAddress]);
    return {
      hasClaimed: result.hasClaimed,
      claimedAmount: formatEther(result.claimedAmount as bigint),
      claimedAt: Number(result.claimedAt),
      hasReturned: result.hasReturned,
      returnedAmount: formatEther(result.returnedAmount as bigint),
      returnedAt: Number(result.returnedAt),
    };
  } catch (error) {
    logger.error('Error getting claim info:', error);
    return null;
  }
}

/** Calldata for `claim(vaultId)`, or null when the faucet is not on this chain. */
export function getClaimTxData(chainId: number, vaultId: number): { to: `0x${string}`; data: `0x${string}` } | null {
  const address = getChain(chainId)?.contracts.FaucetManager;
  if (!address) return null;

  return {
    to: address,
    data: encodeFunctionData({ abi: FaucetManagerABI, functionName: 'claim', args: [vaultId] } as any),
  };
}
