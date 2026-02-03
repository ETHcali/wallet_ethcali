import { useQueryClient } from '@tanstack/react-query';
import { useSendTransaction, useWallets } from '@privy-io/react-auth';
import { encodeFunctionData } from 'viem';
import Swag1155ABI from '../../frontend/abis/Swag1155.json';

export function useSetVariant(contractAddress: string, chainId: number) {
  const { wallets } = useWallets();
  const { sendTransaction } = useSendTransaction();
  const queryClient = useQueryClient();
  const activeWallet = wallets?.[0];

  const setVariant = async (tokenId: number, price: bigint, maxSupply: bigint, active: boolean) => {
    if (!contractAddress || !chainId) throw new Error('Missing contract address or chain ID');
    if (!activeWallet) throw new Error('Wallet not connected');
    const data = encodeFunctionData({
      abi: Swag1155ABI as any,
      functionName: 'setVariant',
      args: [BigInt(tokenId), price, maxSupply, active],
    });
    const result = await sendTransaction(
      { to: contractAddress as `0x${string}`, data, chainId },
      { sponsor: true }
    );
    queryClient.invalidateQueries({ queryKey: ['swag-variant', contractAddress] });
    queryClient.invalidateQueries({ queryKey: ['swag-token-ids', contractAddress] });
    return result;
  };
  return { setVariant, canSet: Boolean(contractAddress && activeWallet) };
}

export function useSetVariantWithURI(contractAddress: string, chainId: number) {
  const { wallets } = useWallets();
  const { sendTransaction } = useSendTransaction();
  const queryClient = useQueryClient();
  const activeWallet = wallets?.[0];

  const setVariantWithURI = async (tokenId: number, price: bigint, maxSupply: bigint, active: boolean, uri: string) => {
    if (!contractAddress || !chainId) throw new Error('Missing contract address or chain ID');
    if (!activeWallet) throw new Error('Wallet not connected');
    const data = encodeFunctionData({
      abi: Swag1155ABI as any,
      functionName: 'setVariantWithURI',
      args: [BigInt(tokenId), price, maxSupply, active, uri],
    });
    const result = await sendTransaction(
      { to: contractAddress as `0x${string}`, data, chainId },
      { sponsor: true }
    );
    queryClient.invalidateQueries({ queryKey: ['swag-variant', contractAddress] });
    queryClient.invalidateQueries({ queryKey: ['swag-token-ids', contractAddress] });
    queryClient.invalidateQueries({ queryKey: ['swag-variant-uri', contractAddress] });
    return result;
  };
  return { setVariantWithURI, canSet: Boolean(contractAddress && activeWallet) };
}
