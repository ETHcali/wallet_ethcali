import { createPublicClient, http, parseEther, formatEther, encodeFunctionData, type Chain } from 'viem';
import { base, mainnet } from 'viem/chains';
import { CONTRACTS, ADDRESSES, getContracts, getAddresses } from '../frontend/contracts';

// Admin address for faucet management
export const ADMIN_ADDRESS = process.env.NEXT_PUBLIC_ADMIN_ADDRESS || '0x3B89Ad8CC39900778aBCdcc22bc83cAC031A415B'; 

// Unichain definition (not in viem by default)
export const unichain: Chain = {
  id: 130,
  name: 'Unichain',
  network: 'unichain',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.unichain.org'] },
    public: { http: ['https://rpc.unichain.org'] },
  },
  blockExplorers: {
    default: { name: 'Uniscan', url: 'https://unichain.blockscout.com' },
  },
};

// Get chain config by chainId
export function getChainConfig(chainId: number): Chain {
  switch (chainId) {
    case 8453:
      return base;
    case 130:
      return unichain;
    case 1:
      return mainnet;
    default:
      return base;
  }
}

// Get network name from chainId
export function getNetworkName(chainId: number): string {
  switch (chainId) {
    case 1:
      return 'ethereum';
    case 130:
      return 'unichain';
    case 8453:
    default:
      return 'base';
  }
}

// Create public client for reading contract state
export function getPublicClient(chainId: number) {
  const chain = getChainConfig(chainId);
  return createPublicClient({
    chain,
    transport: http(),
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
    console.error(`No ZKPassportNFT address for chainId ${chainId}`);
    return false;
  }

  try {
    const result = await readContract(client, addresses.ZKPassportNFT, abi, 'hasNFTByAddress', [userAddress]);
    return Boolean(result);
  } catch (error) {
    console.error('Error checking NFT ownership:', error);
    return false;
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
    console.error('Error checking NFT by identifier:', error);
    return false;
  }
}

/**
 * Get tokenId for a user's address by checking NFTMinted events
 */
export async function getTokenIdByAddress(chainId: number, userAddress: string): Promise<bigint | null> {
  const client = getPublicClient(chainId);
  const addresses = getContractAddresses(chainId);
  const abi = getContractABI('ZKPassportNFT');

  try {
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
      fromBlock: 0n,
    });

    if (events && events.length > 0) {
      // Get the most recent tokenId
      const latestEvent = events[events.length - 1];
      const args = latestEvent.args as any;
      return args?.tokenId ? BigInt(args.tokenId) : null;
    }

    return null;
  } catch (error) {
    console.error('Error getting tokenId:', error);
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
    console.error('Error getting token data:', error);
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
    console.error('Error getting token URI:', error);
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
    console.error('Error getting faucet balance:', error);
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
    console.error('Error getting claim amount:', error);
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
    console.error('Error checking claim status:', error);
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
    console.error('Error checking faucet paused status:', error);
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
    console.error('Error getting faucet NFT contract:', error);
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
    console.error('Error getting active vaults:', error);
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
    return result as { canClaim: boolean; reason: string };
  } catch (error) {
    console.error('Error checking user claim eligibility:', error);
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
    console.error('Error getting claim info:', error);
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

// Get explorer URL for transaction
export function getExplorerUrl(chainId: number, txHash: string): string {
  if (chainId === 130) {
    return `https://unichain.blockscout.com/tx/${txHash}`;
  }
  return `https://basescan.org/tx/${txHash}`;
}

// Get explorer URL for address
export function getAddressExplorerUrl(chainId: number, address: string): string {
  if (chainId === 130) {
    return `https://unichain.blockscout.com/address/${address}`;
  }
  return `https://basescan.org/address/${address}`;
}

