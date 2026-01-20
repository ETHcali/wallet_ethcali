import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSendTransaction, useWallets } from '@privy-io/react-auth';
import { createPublicClient, http, encodeFunctionData } from 'viem';
import ZKPassportNFTABI from '../frontend/abis/ZKPassportNFT.json';
import { useSwagAddresses } from '../utils/network';
import { getChainRpc } from '../config/networks';

export interface ZKPassportMetadata {
  imageURI: string;
  description: string;
  externalURL: string;
  useIPFS: boolean;
}

/**
 * Hook to check if the connected wallet is the owner of ZKPassportNFT contract
 */
export function useZKPassportAdmin() {
  const { wallets } = useWallets();
  const { zkpassport, chainId } = useSwagAddresses();
  const activeWallet = wallets?.[0];
  const walletAddress = activeWallet?.address;

  const query = useQuery({
    queryKey: ['zkpassport-admin', zkpassport, chainId, walletAddress],
    queryFn: async () => {
      if (!zkpassport || !chainId || !walletAddress) {
        return { isOwner: false, owner: null };
      }

      const rpcUrl = getChainRpc(chainId);
      const client = createPublicClient({
        transport: http(rpcUrl),
      });

      try {
        const owner = await (client.readContract as any)({
          address: zkpassport as `0x${string}`,
          abi: ZKPassportNFTABI,
          functionName: 'owner',
        });

        return {
          isOwner: (owner as string).toLowerCase() === walletAddress.toLowerCase(),
          owner: owner as string,
        };
      } catch {
        return { isOwner: false, owner: null };
      }
    },
    enabled: Boolean(zkpassport && chainId && walletAddress),
    staleTime: 1000 * 60,
  });

  return {
    isOwner: query.data?.isOwner ?? false,
    owner: query.data?.owner ?? null,
    isLoading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
    walletAddress,
    refetch: query.refetch,
  };
}

/**
 * Hook to fetch current ZKPassport NFT metadata settings
 */
export function useZKPassportMetadata() {
  const { zkpassport, chainId } = useSwagAddresses();

  const query = useQuery({
    queryKey: ['zkpassport-metadata', zkpassport, chainId],
    queryFn: async () => {
      if (!zkpassport || !chainId) throw new Error('Missing contract address or chain ID');

      const rpcUrl = getChainRpc(chainId);
      const client = createPublicClient({
        transport: http(rpcUrl),
      });

      const [imageURI, description, externalURL, useIPFS] = await Promise.all([
        (client.readContract as any)({
          address: zkpassport as `0x${string}`,
          abi: ZKPassportNFTABI,
          functionName: 'nftImageURI',
        }),
        (client.readContract as any)({
          address: zkpassport as `0x${string}`,
          abi: ZKPassportNFTABI,
          functionName: 'nftDescription',
        }),
        (client.readContract as any)({
          address: zkpassport as `0x${string}`,
          abi: ZKPassportNFTABI,
          functionName: 'nftExternalURL',
        }),
        (client.readContract as any)({
          address: zkpassport as `0x${string}`,
          abi: ZKPassportNFTABI,
          functionName: 'useIPFSImage',
        }),
      ]);

      return {
        imageURI: String(imageURI || ''),
        description: String(description || ''),
        externalURL: String(externalURL || ''),
        useIPFS: Boolean(useIPFS),
      } as ZKPassportMetadata;
    },
    enabled: Boolean(zkpassport && chainId),
    staleTime: 1000 * 30,
  });

  return {
    metadata: query.data,
    isLoading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
    refetch: query.refetch,
  };
}

/**
 * Hook to update ZKPassport NFT metadata (owner only)
 */
export function useUpdateZKPassportMetadata() {
  const { zkpassport, chainId } = useSwagAddresses();
  const { wallets } = useWallets();
  const { sendTransaction } = useSendTransaction();
  const queryClient = useQueryClient();

  const activeWallet = wallets?.[0];
  const isEmbedded = activeWallet?.walletClientType === 'privy';

  const updateMetadata = async (metadata: ZKPassportMetadata) => {
    if (!zkpassport || !chainId) {
      throw new Error('Missing contract address');
    }

    if (!activeWallet) {
      throw new Error('Wallet not connected');
    }

    const txData = encodeFunctionData({
      abi: ZKPassportNFTABI as any,
      functionName: 'setMetadata',
      args: [metadata.imageURI, metadata.description, metadata.externalURL, metadata.useIPFS],
    });

    const result = await sendTransaction({
      to: zkpassport as `0x${string}`,
      data: txData,
      chainId,
    }, {
      address: activeWallet.address,
      sponsor: isEmbedded,
    } as any);

    queryClient.invalidateQueries({ queryKey: ['zkpassport-metadata'] });

    return result;
  };

  const setImageURI = async (imageURI: string) => {
    if (!zkpassport || !chainId || !activeWallet) {
      throw new Error('Missing requirements');
    }

    const txData = encodeFunctionData({
      abi: ZKPassportNFTABI as any,
      functionName: 'setImageURI',
      args: [imageURI],
    });

    const result = await sendTransaction({
      to: zkpassport as `0x${string}`,
      data: txData,
      chainId,
    }, {
      address: activeWallet.address,
      sponsor: isEmbedded,
    } as any);

    queryClient.invalidateQueries({ queryKey: ['zkpassport-metadata'] });
    return result;
  };

  const setDescription = async (description: string) => {
    if (!zkpassport || !chainId || !activeWallet) {
      throw new Error('Missing requirements');
    }

    const txData = encodeFunctionData({
      abi: ZKPassportNFTABI as any,
      functionName: 'setDescription',
      args: [description],
    });

    const result = await sendTransaction({
      to: zkpassport as `0x${string}`,
      data: txData,
      chainId,
    }, {
      address: activeWallet.address,
      sponsor: isEmbedded,
    } as any);

    queryClient.invalidateQueries({ queryKey: ['zkpassport-metadata'] });
    return result;
  };

  const setExternalURL = async (externalURL: string) => {
    if (!zkpassport || !chainId || !activeWallet) {
      throw new Error('Missing requirements');
    }

    const txData = encodeFunctionData({
      abi: ZKPassportNFTABI as any,
      functionName: 'setExternalURL',
      args: [externalURL],
    });

    const result = await sendTransaction({
      to: zkpassport as `0x${string}`,
      data: txData,
      chainId,
    }, {
      address: activeWallet.address,
      sponsor: isEmbedded,
    } as any);

    queryClient.invalidateQueries({ queryKey: ['zkpassport-metadata'] });
    return result;
  };

  return {
    updateMetadata,
    setImageURI,
    setDescription,
    setExternalURL,
    canUpdate: Boolean(zkpassport && activeWallet),
  };
}

/**
 * Hook to approve a verification (owner only)
 */
export function useApproveVerification() {
  const { zkpassport, chainId } = useSwagAddresses();
  const { wallets } = useWallets();
  const { sendTransaction } = useSendTransaction();

  const activeWallet = wallets?.[0];
  const isEmbedded = activeWallet?.walletClientType === 'privy';

  const approveVerification = async (
    uniqueIdentifier: string,
    userAddress: string,
    faceMatchPassed: boolean,
    personhoodVerified: boolean
  ) => {
    if (!zkpassport || !chainId) {
      throw new Error('Missing contract address');
    }

    if (!activeWallet) {
      throw new Error('Wallet not connected');
    }

    const txData = encodeFunctionData({
      abi: ZKPassportNFTABI as any,
      functionName: 'approveVerification',
      args: [uniqueIdentifier, userAddress as `0x${string}`, faceMatchPassed, personhoodVerified],
    });

    const result = await sendTransaction({
      to: zkpassport as `0x${string}`,
      data: txData,
      chainId,
    }, {
      address: activeWallet.address,
      sponsor: isEmbedded,
    } as any);

    return result;
  };

  return {
    approveVerification,
    canApprove: Boolean(zkpassport && activeWallet),
  };
}
