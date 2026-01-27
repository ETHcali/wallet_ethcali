import { createPublicClient, http, parseEther, formatEther, encodeFunctionData, type Chain } from 'viem';
import { base, mainnet } from 'viem/chains';
import { CONTRACTS, getAddresses } from '../frontend/contracts';
import { getChainRpc } from '../config/networks';
import { ADMIN_ADDRESS, CHAIN_IDS, DEFAULT_RPC_URLS } from '../config/constants';
import { getExplorerUrl, getAddressExplorerUrl } from './explorer';
import { logger } from './logger';

// Re-export for backward compatibility
export { ADMIN_ADDRESS };
export { getExplorerUrl, getAddressExplorerUrl }; 

// Unichain definition (not in viem by default)
export const unichain: Chain = {
  id: CHAIN_IDS.UNICHAIN,
  name: 'Unichain',
  network: 'unichain',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: [DEFAULT_RPC_URLS[CHAIN_IDS.UNICHAIN]] },
    public: { http: [DEFAULT_RPC_URLS[CHAIN_IDS.UNICHAIN]] },
  },
  blockExplorers: {
    default: { name: 'Uniscan', url: 'https://unichain.blockscout.com' },
  },
};

// Get chain config by chainId
export function getChainConfig(chainId: number): Chain {
  switch (chainId) {
    case CHAIN_IDS.BASE:
      return base;
    case CHAIN_IDS.UNICHAIN:
      return unichain;
    case CHAIN_IDS.ETHEREUM:
      return mainnet;
    default:
      return base;
  }
}

// Get network name from chainId
export function getNetworkName(chainId: number): string {
  switch (chainId) {
    case CHAIN_IDS.ETHEREUM:
      return 'ethereum';
    case CHAIN_IDS.UNICHAIN:
      return 'unichain';
    case CHAIN_IDS.BASE:
    default:
      return 'base';
  }
}

// Create public client for reading contract state
export function getPublicClient(chainId: number) {
  const chain = getChainConfig(chainId);
  const rpcUrl = getChainRpc(chainId);
  return createPublicClient({
    chain,
    transport: http(rpcUrl),
  });
}

// Get contract addresses for a chain
export function getContractAddresses(chainId: number) {
  const network = getNetworkName(chainId);
  // Use type assertion as network name comes from chainId
  return getAddresses(network as any).addresses;
}

// Get contract ABI (cast as any to avoid complex union type issues)
export function getContractABI(contractName: 'ZKPassportNFT' | 'FaucetManager'): any {
  // ABIs are the same across networks
  return CONTRACTS.networks.base.contracts[contractName].abi;
}

// Helper to call contract read functions with proper typing
async function readContract(
  client: ReturnType<typeof getPublicClient>,
  address: string,
  abi: any,
  functionName: string,
  args?: any[]
): Promise<any> {
  return client.readContract({
    address: address as `0x${string}`,
    abi,
    functionName,
    args,
  } as any);
}

// Check if address is admin
export function isAdmin(address: string | undefined): boolean {
  if (!address) return false;
  return address.toLowerCase() === ADMIN_ADDRESS.toLowerCase();
}

// ============================================
// ZKPassportNFT Contract Functions
// ============================================

export async function hasNFTByAddress(chainId: number, userAddress: string): Promise<boolean> {
  const client = getPublicClient(chainId);
  const addresses = getContractAddresses(chainId);
  const abi = getContractABI('ZKPassportNFT');

  if (!addresses.ZKPassportNFT) {
    logger.error(`No ZKPassportNFT address for chainId ${chainId}`);
    return false;
  }

  try {
    // Try hasNFTByAddress first (contract-specific)
    const result = await readContract(client, addresses.ZKPassportNFT, abi, 'hasNFTByAddress', [userAddress]);
    return Boolean(result);
  } catch (error: any) {
    // Fallback to ERC721 balanceOf if hasNFTByAddress fails (e.g., RPC errors)
    try {
      const balance = await readContract(client, addresses.ZKPassportNFT, abi, 'balanceOf', [userAddress]);
      return (balance as bigint) > 0n;
    } catch (fallbackError: any) {
      // If both fail, log but don't spam console with RPC rate limit errors
      if (!fallbackError?.message?.includes('429') && !fallbackError?.message?.includes('503')) {
        logger.error('Error checking NFT ownership:', fallbackError);
      }
      return false;
    }
  }
}

export async function hasNFT(chainId: number, uniqueIdentifier: string): Promise<boolean> {
  const client = getPublicClient(chainId);
  const addresses = getContractAddresses(chainId);
  const abi = getContractABI('ZKPassportNFT');

  try {
    const result = await readContract(client, addresses.ZKPassportNFT, abi, 'hasNFT', [uniqueIdentifier]);
    return Boolean(result);
  } catch (error) {
    logger.error('Error checking NFT by identifier:', error);
    return false;
  }
}

/**
 * Get tokenId for a user's address by checking NFTMinted events
 */
export async function getTokenIdByAddress(chainId: number, userAddress: string): Promise<bigint | null> {
  const client = getPublicClient(chainId);
  const addresses = getContractAddresses(chainId);

  try {
    // Use a recent block range to avoid RPC limits (most RPCs limit to ~50k blocks)
    const currentBlock = await client.getBlockNumber();
    const fromBlock = currentBlock > 45000n ? currentBlock - 45000n : 0n;

    // Get NFTMinted events for this address
    const events = await client.getLogs({
      address: addresses.ZKPassportNFT as `0x${string}`,
      event: {
        type: 'event',
        name: 'NFTMinted',
        inputs: [
          { type: 'address', indexed: true, name: 'to' },
          { type: 'uint256', indexed: false, name: 'tokenId' },
          { type: 'string', indexed: false, name: 'uniqueIdentifier' },
          { type: 'bool', indexed: false, name: 'faceMatchPassed' },
          { type: 'bool', indexed: false, name: 'personhoodVerified' },
        ],
      } as any,
      args: {
        to: userAddress as `0x${string}`,
      } as any,
      fromBlock,
    });

    if (events && events.length > 0) {
      // Get the most recent tokenId
      const latestEvent = events[events.length - 1] as any;
      const args = latestEvent?.args;
      return args?.tokenId ? BigInt(args.tokenId) : null;
    }

    return null;
  } catch (error: any) {
    // Silent fail - RPC may be down/rate limited, not critical
    if (error?.message && !error.message.includes('503') && !error.message.includes('429')) {
      logger.warn('Error getting tokenId:', error.message);
    }
    return null;
  }
}

/**
 * Get token data for a tokenId
 */
export async function getTokenData(chainId: number, tokenId: bigint): Promise<{
  uniqueIdentifier: string;
  faceMatchPassed: boolean;
  personhoodVerified: boolean;
} | null> {
  const client = getPublicClient(chainId);
  const addresses = getContractAddresses(chainId);
  const abi = getContractABI('ZKPassportNFT');

  try {
    const result = await readContract(client, addresses.ZKPassportNFT, abi, 'getTokenData', [tokenId]);
    return result as {
      uniqueIdentifier: string;
      faceMatchPassed: boolean;
      personhoodVerified: boolean;
    };
  } catch (error) {
    logger.error('Error getting token data:', error);
    return null;
  }
}

/**
 * Get token URI (metadata) for a tokenId
 */
export async function getTokenURI(chainId: number, tokenId: bigint): Promise<string | null> {
  const client = getPublicClient(chainId);
  const addresses = getContractAddresses(chainId);
  const abi = getContractABI('ZKPassportNFT');

  try {
    const uri = await readContract(client, addresses.ZKPassportNFT, abi, 'tokenURI', [tokenId]);
    return uri as string;
  } catch (error) {
    logger.error('Error getting token URI:', error);
    return null;
  }
}

// ============================================
// FaucetManager Contract Functions
// ============================================

export async function getFaucetBalance(chainId: number): Promise<string> {
  const client = getPublicClient(chainId);
  const addresses = getContractAddresses(chainId);
  const abi = getContractABI('FaucetManager');

  try {
    const result = await readContract(client, addresses.FaucetManager, abi, 'getBalance');
    return formatEther(result as bigint);
  } catch (error) {
    logger.error('Error getting faucet balance:', error);
    return '0';
  }
}

export async function getClaimAmount(chainId: number): Promise<string> {
  const client = getPublicClient(chainId);
  const addresses = getContractAddresses(chainId);
  const abi = getContractABI('FaucetManager');

  try {
    const result = await readContract(client, addresses.FaucetManager, abi, 'claimAmount');
    return formatEther(result as bigint);
  } catch (error) {
    logger.error('Error getting claim amount:', error);
    return '0';
  }
}

export async function hasClaimed(chainId: number, userAddress: string): Promise<boolean> {
  const client = getPublicClient(chainId);
  const addresses = getContractAddresses(chainId);
  const abi = getContractABI('FaucetManager');

  try {
    const result = await readContract(client, addresses.FaucetManager, abi, 'hasClaimed', [userAddress]);
    return Boolean(result);
  } catch (error) {
    logger.error('Error checking claim status:', error);
    return false;
  }
}

export async function isFaucetPaused(chainId: number): Promise<boolean> {
  const client = getPublicClient(chainId);
  const addresses = getContractAddresses(chainId);
  const abi = getContractABI('FaucetManager');

  try {
    const result = await readContract(client, addresses.FaucetManager, abi, 'paused');
    return Boolean(result);
  } catch (error) {
    logger.error('Error checking faucet paused status:', error);
    return false;
  }
}

// Get the NFT contract address linked to the faucet
export async function getFaucetNFTContract(chainId: number): Promise<string> {
  const client = getPublicClient(chainId);
  const addresses = getContractAddresses(chainId);
  const abi = getContractABI('FaucetManager');

  try {
    const result = await readContract(client, addresses.FaucetManager, abi, 'nftContract');
    return String(result);
  } catch (error) {
    logger.error('Error getting faucet NFT contract:', error);
    return '';
  }
}

// ============================================
// Transaction Helpers (for use with wallet provider)
// ============================================

export function getClaimTxData(chainId: number, vaultId: number) {
  const addresses = getContractAddresses(chainId);
  const abi = getContractABI('FaucetManager');

  return {
    to: addresses.FaucetManager as `0x${string}`,
    data: encodeFunctionData({ abi, functionName: 'claim', args: [vaultId] } as any),
  };
}

// Get active vaults for users to claim from
export async function getActiveVaults(chainId: number): Promise<any[]> {
  const client = getPublicClient(chainId);
  const addresses = getContractAddresses(chainId);
  const abi = getContractABI('FaucetManager');

  try {
    const result = await readContract(client, addresses.FaucetManager, abi, 'getActiveVaults');
    const [vaultIds, vaults] = result as [bigint[], any[]];
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

// Check if user can claim from a specific vault
export async function canUserClaim(chainId: number, vaultId: number, userAddress: string): Promise<{ canClaim: boolean; reason: string }> {
  const client = getPublicClient(chainId);
  const addresses = getContractAddresses(chainId);
  const abi = getContractABI('FaucetManager');

  try {
    const result = await readContract(client, addresses.FaucetManager, abi, 'canUserClaim', [vaultId, userAddress]);
    // Handle both array and object return formats from contract
    if (Array.isArray(result)) {
      return { canClaim: Boolean(result[0]), reason: String(result[1] || '') };
    }
    return {
      canClaim: Boolean((result as any).canClaim),
      reason: String((result as any).reason || '')
    };
  } catch (error) {
    logger.error('Error checking user claim eligibility:', error);
    return { canClaim: false, reason: 'Error checking eligibility' };
  }
}

// Get claim info for a user and vault
export async function getClaimInfo(chainId: number, vaultId: number, userAddress: string): Promise<any> {
  const client = getPublicClient(chainId);
  const addresses = getContractAddresses(chainId);
  const abi = getContractABI('FaucetManager');

  try {
    const result = await readContract(client, addresses.FaucetManager, abi, 'getClaimInfo', [vaultId, userAddress]);
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

export function getDepositTxData(chainId: number, amountEth: string) {
  const addresses = getContractAddresses(chainId);

  return {
    to: addresses.FaucetManager as `0x${string}`,
    value: parseEther(amountEth),
  };
}

export function getWithdrawTxData(chainId: number, amountEth: string) {
  const addresses = getContractAddresses(chainId);
  const abi = getContractABI('FaucetManager');

  return {
    to: addresses.FaucetManager as `0x${string}`,
    data: encodeFunctionData({ abi, functionName: 'withdraw', args: [parseEther(amountEth)] } as any),
  };
}

export function getPauseTxData(chainId: number) {
  const addresses = getContractAddresses(chainId);
  const abi = getContractABI('FaucetManager');

  return {
    to: addresses.FaucetManager as `0x${string}`,
    data: encodeFunctionData({ abi, functionName: 'pause' } as any),
  };
}

export function getUnpauseTxData(chainId: number) {
  const addresses = getContractAddresses(chainId);
  const abi = getContractABI('FaucetManager');

  return {
    to: addresses.FaucetManager as `0x${string}`,
    data: encodeFunctionData({ abi, functionName: 'unpause' } as any),
  };
}

// Update claim amount (admin only)
export function getUpdateClaimAmountTxData(chainId: number, amountEth: string) {
  const addresses = getContractAddresses(chainId);
  const abi = getContractABI('FaucetManager');

  return {
    to: addresses.FaucetManager as `0x${string}`,
    data: encodeFunctionData({ abi, functionName: 'updateClaimAmount', args: [parseEther(amountEth)] } as any),
  };
}

// Update NFT contract address (admin only)
export function getSetNFTContractTxData(chainId: number, newContractAddress: string) {
  const addresses = getContractAddresses(chainId);
  const abi = getContractABI('FaucetManager');

  return {
    to: addresses.FaucetManager as `0x${string}`,
    data: encodeFunctionData({ abi, functionName: 'setNFTContract', args: [newContractAddress] } as any),
  };
}

// Explorer URL functions are now in utils/explorer.ts
// Re-exported above for backward compatibility
