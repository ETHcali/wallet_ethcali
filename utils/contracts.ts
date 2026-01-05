import { createPublicClient, http, parseEther, formatEther, encodeFunctionData, type Chain } from 'viem';
import { base, mainnet } from 'viem/chains';
import { CONTRACTS, ADDRESSES, getContracts, getAddresses } from '../frontend/contracts';

// Admin address for faucet management
export const ADMIN_ADDRESS = '0x3b89ad8cc39900778abcdcc22bc83cac031a415b';

// Unichain definition (not in viem by default)
export const unichain: Chain = {
  id: 130,
  name: 'Unichain',
  network: 'unichain',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://mainnet.unichain.org'] },
    public: { http: ['https://mainnet.unichain.org'] },
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
export function getNetworkName(chainId: number): 'base' | 'unichain' {
  return chainId === 130 ? 'unichain' : 'base';
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
  return getAddresses(network).addresses;
}

// Get contract ABI (cast as any to avoid complex union type issues)
export function getContractABI(contractName: 'ZKPassportNFT' | 'SponsorContract' | 'FaucetVault'): any {
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

// ============================================
// FaucetVault Contract Functions
// ============================================

export async function getFaucetBalance(chainId: number): Promise<string> {
  const client = getPublicClient(chainId);
  const addresses = getContractAddresses(chainId);
  const abi = getContractABI('FaucetVault');

  try {
    const result = await readContract(client, addresses.FaucetVault, abi, 'getBalance');
    return formatEther(result as bigint);
  } catch (error) {
    console.error('Error getting faucet balance:', error);
    return '0';
  }
}

export async function getClaimAmount(chainId: number): Promise<string> {
  const client = getPublicClient(chainId);
  const addresses = getContractAddresses(chainId);
  const abi = getContractABI('FaucetVault');

  try {
    const result = await readContract(client, addresses.FaucetVault, abi, 'claimAmount');
    return formatEther(result as bigint);
  } catch (error) {
    console.error('Error getting claim amount:', error);
    return '0';
  }
}

export async function hasClaimed(chainId: number, userAddress: string): Promise<boolean> {
  const client = getPublicClient(chainId);
  const addresses = getContractAddresses(chainId);
  const abi = getContractABI('FaucetVault');

  try {
    const result = await readContract(client, addresses.FaucetVault, abi, 'hasClaimed', [userAddress]);
    return Boolean(result);
  } catch (error) {
    console.error('Error checking claim status:', error);
    return false;
  }
}

export async function isFaucetPaused(chainId: number): Promise<boolean> {
  const client = getPublicClient(chainId);
  const addresses = getContractAddresses(chainId);
  const abi = getContractABI('FaucetVault');

  try {
    const result = await readContract(client, addresses.FaucetVault, abi, 'paused');
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
  const abi = getContractABI('FaucetVault');

  try {
    const result = await readContract(client, addresses.FaucetVault, abi, 'nftContract');
    return String(result);
  } catch (error) {
    console.error('Error getting faucet NFT contract:', error);
    return '';
  }
}

// ============================================
// SponsorContract Functions
// ============================================

export async function getSponsorBalance(chainId: number): Promise<string> {
  const client = getPublicClient(chainId);
  const addresses = getContractAddresses(chainId);
  const abi = getContractABI('SponsorContract');

  try {
    const result = await readContract(client, addresses.SponsorContract, abi, 'getBalance');
    return formatEther(result as bigint);
  } catch (error) {
    console.error('Error getting sponsor balance:', error);
    return '0';
  }
}

// ============================================
// Transaction Helpers (for use with wallet provider)
// ============================================

export function getClaimTxData(chainId: number) {
  const addresses = getContractAddresses(chainId);
  const abi = getContractABI('FaucetVault');

  return {
    to: addresses.FaucetVault as `0x${string}`,
    data: encodeFunctionData({ abi, functionName: 'claim' } as any),
  };
}

export function getDepositTxData(chainId: number, amountEth: string) {
  const addresses = getContractAddresses(chainId);

  return {
    to: addresses.FaucetVault as `0x${string}`,
    value: parseEther(amountEth),
  };
}

export function getWithdrawTxData(chainId: number, amountEth: string) {
  const addresses = getContractAddresses(chainId);
  const abi = getContractABI('FaucetVault');

  return {
    to: addresses.FaucetVault as `0x${string}`,
    data: encodeFunctionData({ abi, functionName: 'withdraw', args: [parseEther(amountEth)] } as any),
  };
}

export function getPauseTxData(chainId: number) {
  const addresses = getContractAddresses(chainId);
  const abi = getContractABI('FaucetVault');

  return {
    to: addresses.FaucetVault as `0x${string}`,
    data: encodeFunctionData({ abi, functionName: 'pause' } as any),
  };
}

export function getUnpauseTxData(chainId: number) {
  const addresses = getContractAddresses(chainId);
  const abi = getContractABI('FaucetVault');

  return {
    to: addresses.FaucetVault as `0x${string}`,
    data: encodeFunctionData({ abi, functionName: 'unpause' } as any),
  };
}

// Update claim amount (admin only)
export function getUpdateClaimAmountTxData(chainId: number, amountEth: string) {
  const addresses = getContractAddresses(chainId);
  const abi = getContractABI('FaucetVault');

  return {
    to: addresses.FaucetVault as `0x${string}`,
    data: encodeFunctionData({ abi, functionName: 'updateClaimAmount', args: [parseEther(amountEth)] } as any),
  };
}

// Update NFT contract address (admin only)
export function getSetNFTContractTxData(chainId: number, newContractAddress: string) {
  const addresses = getContractAddresses(chainId);
  const abi = getContractABI('FaucetVault');

  return {
    to: addresses.FaucetVault as `0x${string}`,
    data: encodeFunctionData({ abi, functionName: 'setNFTContract', args: [newContractAddress] } as any),
  };
}

// Sponsor contract deposit (for admin)
export function getSponsorDepositTxData(chainId: number, amountEth: string) {
  const addresses = getContractAddresses(chainId);

  return {
    to: addresses.SponsorContract as `0x${string}`,
    value: parseEther(amountEth),
  };
}

export function getSponsorWithdrawTxData(chainId: number, amountEth: string) {
  const addresses = getContractAddresses(chainId);
  const abi = getContractABI('SponsorContract');

  return {
    to: addresses.SponsorContract as `0x${string}`,
    data: encodeFunctionData({ abi, functionName: 'withdraw', args: [parseEther(amountEth)] } as any),
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

