import { createConfig, http } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { base, mainnet, optimism } from 'wagmi/chains';
import { defineChain } from 'viem';

const DEFAULT_UNICHAIN_RPC = 'https://rpc.unichain.org';

export const unichain = defineChain({
  id: 130,
  name: 'Unichain Mainnet',
  network: 'unichain-mainnet',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: [process.env.NEXT_PUBLIC_UNICHAIN_RPC_URL || DEFAULT_UNICHAIN_RPC] },
    public: { http: [process.env.NEXT_PUBLIC_UNICHAIN_RPC_URL || DEFAULT_UNICHAIN_RPC] },
  },
  blockExplorers: {
    default: { name: 'Blockscout', url: 'https://explorer.unichain.org' },
  },
});

const baseRpc = process.env.NEXT_PUBLIC_BASE_RPC_URL || base.rpcUrls.default.http[0];
const mainnetRpc = process.env.NEXT_PUBLIC_MAINNET_RPC_URL || mainnet.rpcUrls.default.http[0];
const unichainRpc = process.env.NEXT_PUBLIC_UNICHAIN_RPC_URL || DEFAULT_UNICHAIN_RPC;
const optimismRpc = process.env.NEXT_PUBLIC_OPTIMISM_RPC_URL || optimism.rpcUrls.default.http[0];

export const wagmiChains = [base, mainnet, unichain] as const;

export const wagmiConfig = createConfig({
  chains: wagmiChains as any,
  connectors: [injected({ shimDisconnect: true })],
  transports: {
    [base.id]: http(baseRpc),
    [mainnet.id]: http(mainnetRpc),
    [unichain.id]: http(unichainRpc),
    [optimism.id]: http(optimismRpc),
  },
  ssr: true,
});
