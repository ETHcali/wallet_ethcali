/**
 * Owner-only operations on ZKPassportNFT, on one explicit chain.
 *
 * The identity admin page passes the chain (Ethereum) down; nothing here reads
 * the wallet's chain. Writes pin `chainId`
 * and the page shows "Switch to <chain>" before any of them is reachable.
 */
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSendTransaction } from '@privy-io/react-auth';
import { encodeFunctionData } from 'viem';
import ZKPassportNFTABI from '../frontend/abis/ZKPassportNFT.json';
import { getChain, publicClientFor } from '../config/chains';
import { useActiveWallet } from './useActiveWallet';
import { waitForSuccess } from '../utils/waitForSuccess';

export interface ZKPassportMetadata {
  imageURI: string;
  description: string;
  externalURL: string;
  useIPFS: boolean;
}

function zkpassportAddress(chainId: number) {
  return getChain(chainId)?.contracts.ZKPassportNFT;
}

/** Whether the active wallet owns the ZKPassportNFT contract on `chainId`. */
export function useZKPassportAdmin(chainId: number) {
  const { address: walletAddress } = useActiveWallet();
  const zkpassport = zkpassportAddress(chainId);

  const query = useQuery({
    queryKey: ['zkpassport-admin', chainId, walletAddress?.toLowerCase()],
    queryFn: async () => {
      const client = publicClientFor(chainId);
      if (!zkpassport || !client || !walletAddress) return { isOwner: false, owner: null };

      try {
        const owner = (await client.readContract({
          address: zkpassport,
          abi: ZKPassportNFTABI,
          functionName: 'owner',
        } as any)) as string;

        return { isOwner: owner.toLowerCase() === walletAddress.toLowerCase(), owner };
      } catch {
        return { isOwner: false, owner: null };
      }
    },
    enabled: Boolean(zkpassport && walletAddress),
    staleTime: 1000 * 60,
  });

  return {
    isOwner: query.data?.isOwner ?? false,
    owner: query.data?.owner ?? null,
    isLoading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
    walletAddress,
    contractAddress: zkpassport,
    refetch: query.refetch,
  };
}

/** Current NFT metadata settings on `chainId`. */
export function useZKPassportMetadata(chainId: number) {
  const zkpassport = zkpassportAddress(chainId);

  const query = useQuery({
    queryKey: ['zkpassport-metadata', chainId],
    queryFn: async () => {
      const client = publicClientFor(chainId);
      if (!zkpassport || !client) throw new Error('ZKPassportNFT is not deployed on this network');

      const readString = (functionName: string) =>
        client.readContract({ address: zkpassport, abi: ZKPassportNFTABI, functionName } as any) as Promise<unknown>;

      const [imageURI, description, externalURL, useIPFS] = await Promise.all([
        readString('nftImageURI'),
        readString('nftDescription'),
        readString('nftExternalURL'),
        readString('useIPFSImage'),
      ]);

      return {
        imageURI: String(imageURI || ''),
        description: String(description || ''),
        externalURL: String(externalURL || ''),
        useIPFS: Boolean(useIPFS),
      } as ZKPassportMetadata;
    },
    enabled: Boolean(zkpassport),
    staleTime: 1000 * 30,
  });

  return {
    metadata: query.data,
    isLoading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
    refetch: query.refetch,
  };
}

/** Shared write path for every owner call: encode, send pinned to the chain, wait for the receipt, re-read. */
function useZKPassportWrite(chainId: number, invalidate: string[]) {
  const zkpassport = zkpassportAddress(chainId);
  const { wallet } = useActiveWallet();
  const { sendTransaction } = useSendTransaction();
  const queryClient = useQueryClient();

  const write = async (functionName: string, args: unknown[]) => {
    if (!zkpassport) throw new Error('ZKPassportNFT is not deployed on this network');
    if (!wallet) throw new Error('Wallet not connected');

    const data = encodeFunctionData({ abi: ZKPassportNFTABI as any, functionName, args });
    const result = await sendTransaction({ to: zkpassport, data, chainId }, { sponsor: true });

    await waitForSuccess(chainId, result.hash);
    await Promise.all(invalidate.map((key) => queryClient.invalidateQueries({ queryKey: [key] })));
    return result;
  };

  return { write, canWrite: Boolean(zkpassport && wallet) };
}

/** Update NFT metadata (owner only). */
export function useUpdateZKPassportMetadata(chainId: number) {
  const { write, canWrite } = useZKPassportWrite(chainId, ['zkpassport-metadata']);

  return {
    updateMetadata: (m: ZKPassportMetadata) =>
      write('setMetadata', [m.imageURI, m.description, m.externalURL, m.useIPFS]),
    setImageURI: (imageURI: string) => write('setImageURI', [imageURI]),
    setDescription: (description: string) => write('setDescription', [description]),
    setExternalURL: (externalURL: string) => write('setExternalURL', [externalURL]),
    canUpdate: canWrite,
  };
}

/** Domain / scope (owner only). The verifier is fixed at deploy and has no setter. */
export function useZKPassportContractSettings(chainId: number) {
  const { write, canWrite } = useZKPassportWrite(chainId, ['zkpassport-admin', 'zkpassport-policy']);

  return {
    setDomain: (domain: string) => write('setDomain', [domain]),
    setScope: (scope: string) => write('setScope', [scope]),
    canUpdate: canWrite,
  };
}

/**
 * The policy the contract enforces, read with a minimal ABI so it works before
 * and after the ABI in frontend/ is regenerated. A contract without these views
 * (the January build) reads as `null`.
 */
const POLICY_ABI = [
  { type: 'function', name: 'domain', stateMutability: 'view', inputs: [], outputs: [{ type: 'string' }] },
  { type: 'function', name: 'scope', stateMutability: 'view', inputs: [], outputs: [{ type: 'string' }] },
  { type: 'function', name: 'excludedCountries', stateMutability: 'view', inputs: [], outputs: [{ type: 'string[]' }] },
  { type: 'function', name: 'SANCTIONS_STRICT', stateMutability: 'view', inputs: [], outputs: [{ type: 'bool' }] },
] as const;

export interface ZKPassportPolicy {
  domain: string;
  scope: string;
  excludedCountries: readonly string[];
  sanctionsStrict: boolean;
}

export function useZKPassportPolicy(chainId: number) {
  const zkpassport = zkpassportAddress(chainId);
  return useQuery({
    queryKey: ['zkpassport-policy', chainId, zkpassport],
    queryFn: async (): Promise<ZKPassportPolicy | null> => {
      const client = publicClientFor(chainId);
      if (!zkpassport || !client) return null;
      const read = <T,>(functionName: (typeof POLICY_ABI)[number]['name']) =>
        client.readContract({ address: zkpassport, abi: POLICY_ABI, functionName } as never) as Promise<T>;
      try {
        const [domain, scope, excludedCountries, sanctionsStrict] = await Promise.all([
          read<string>('domain'),
          read<string>('scope'),
          read<readonly string[]>('excludedCountries'),
          read<boolean>('SANCTIONS_STRICT'),
        ]);
        return { domain, scope, excludedCountries, sanctionsStrict };
      } catch {
        return null;
      }
    },
    enabled: Boolean(zkpassport),
    staleTime: 1000 * 60,
  });
}
