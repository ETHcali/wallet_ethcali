import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { usePrivy, useWallets } from '@privy-io/react-auth';

const SUPPORTED_CHAINS = [
  { id: 8453, name: 'Base', icon: '🔵' },
  { id: 130, name: 'Unichain', icon: '🦄' },
];

interface NavigationProps {
  className?: string;
  currentChainId?: number;
  onChainChange?: (chainId: number) => void;
}

const Navigation: React.FC<NavigationProps> = ({ 
  className = '',
  currentChainId = 8453,
  onChainChange
}) => {
  const router = useRouter();
  const { authenticated, logout, user } = usePrivy();
  const { wallets } = useWallets();

  const userWallet = wallets?.[0];

  const navItems = [
    { href: '/wallet', label: 'WALLET', icon: '💳' },
    { href: '/faucet', label: 'FAUCET', icon: '🚰' },
    { href: '/sybil', label: 'SYBIL', icon: '🛡️' },
  ];

  const isActive = (href: string) => router.pathname === href;
  const currentChain = SUPPORTED_CHAINS.find(c => c.id === currentChainId) || SUPPORTED_CHAINS[0];

  // Switch wallet chain
  const handleChainSwitch = async (chainId: number) => {
    if (!userWallet) return;
    
    try {
      const provider = await userWallet.getEthereumProvider();
      const chainHex = `0x${chainId.toString(16)}`;
      
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chainHex }],
      });
      
      onChainChange?.(chainId);
    } catch (error: any) {
      // If chain doesn't exist, add it
      if (error.code === 4902) {
        try {
          const provider = await userWallet.getEthereumProvider();
          const chainConfig = chainId === 130 ? {
            chainId: '0x82',
            chainName: 'Unichain',
            nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
            rpcUrls: ['https://mainnet.unichain.org'],
            blockExplorerUrls: ['https://unichain.blockscout.com'],
          } : {
            chainId: '0x2105',
            chainName: 'Base',
            nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
            rpcUrls: ['https://mainnet.base.org'],
            blockExplorerUrls: ['https://basescan.org'],
          };
          
          await provider.request({
            method: 'wallet_addEthereumChain',
            params: [chainConfig],
          });
          
          onChainChange?.(chainId);
        } catch (addError) {
          console.error('Error adding chain:', addError);
        }
      } else {
        console.error('Error switching chain:', error);
      }
    }
  };

  if (!authenticated) return null;

  return (
    <nav className={`bg-black border-b border-cyan-500/30 ${className}`}>
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <img 
              src="/Logo ETHCALI Fondo Negro.png" 
              alt="ETH CALI" 
              className="h-8 w-auto"
            />
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  px-2 sm:px-3 py-1.5 rounded-lg font-mono text-xs transition-all
                  ${isActive(item.href)
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                    : 'text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10'
                  }
                `}
              >
                <span className="sm:mr-1">{item.icon}</span>
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            ))}
          </div>

          {/* Chain Switcher + User */}
          <div className="flex items-center gap-2">
            {/* Chain Switcher Dropdown */}
            <div className="relative group">
              <button className="flex items-center gap-1 px-2 py-1.5 bg-gray-900 border border-gray-700 rounded-lg text-xs font-mono text-gray-300 hover:border-cyan-500/50 transition-all">
                <span>{currentChain.icon}</span>
                <span className="hidden sm:inline">{currentChain.name}</span>
                <span className="text-gray-500">▼</span>
              </button>
              <div className="absolute right-0 top-full mt-1 bg-gray-900 border border-gray-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 min-w-[120px]">
                {SUPPORTED_CHAINS.map((chain) => (
                  <button
                    key={chain.id}
                    onClick={() => handleChainSwitch(chain.id)}
                    className={`w-full px-3 py-2 text-left text-xs font-mono flex items-center gap-2 hover:bg-gray-800 transition-all first:rounded-t-lg last:rounded-b-lg ${
                      currentChainId === chain.id ? 'text-cyan-400 bg-cyan-500/10' : 'text-gray-300'
                    }`}
                  >
                    <span>{chain.icon}</span>
                    <span>{chain.name}</span>
                    {currentChainId === chain.id && <span className="ml-auto">✓</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Address */}
            {userWallet && (
              <span className="text-xs text-gray-500 font-mono hidden md:block">
                {userWallet.address.slice(0, 4)}...{userWallet.address.slice(-3)}
              </span>
            )}

            {/* Logout */}
            <button
              onClick={logout}
              className="px-2 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-xs font-mono transition-all"
            >
              EXIT
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
