import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { usePrivy, useWallets } from '@privy-io/react-auth';

const ADMIN_ADDRESS = process.env.NEXT_PUBLIC_ADMIN_ADDRESS!.toLowerCase();

const SUPPORTED_CHAINS = [
  { id: 8453, name: 'Base', logo: '/chains/base_logo.svg' },
  { id: 1, name: 'Ethereum', logo: '/chains/ethereum.png' },
  { id: 10, name: 'Optimism', logo: '/chains/op mainnet.png' },
  { id: 130, name: 'Unichain', logo: '/chains/unichain.png' },
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
  const [displayChainId, setDisplayChainId] = useState(currentChainId);

  // Sync displayChainId with prop
  useEffect(() => {
    setDisplayChainId(currentChainId);
  }, [currentChainId]);

  const userWallet = wallets?.[0];
  
  // Check if user is admin
  const isAdmin = wallets.some(w => w.address?.toLowerCase() === ADMIN_ADDRESS);

  const navItems = [
    { href: '/wallet', label: 'WALLET' },
    { href: '/faucet', label: 'FAUCET' },
    { href: '/sybil', label: 'IDENTITY' },
    { href: '/swag', label: 'SWAG' },
    ...(isAdmin ? [{ href: '/swag/admin', label: 'ADMIN' }] : []),
  ];

  const isActive = (href: string) => router.pathname === href || router.pathname.startsWith(href + '/');
  const currentChain = SUPPORTED_CHAINS.find(c => c.id === displayChainId) || SUPPORTED_CHAINS[0];

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
      setDisplayChainId(chainId);
      onChainChange?.(chainId);
      // Force reload for Unichain to ensure UI updates
      if (chainId === 130) {
        window.location.reload();
      }
    } catch (error: any) {
      // If chain doesn't exist, add it
      if (error.code === 4902) {
        try {
          const provider = await userWallet.getEthereumProvider();
          const chainConfig = chainId === 130 ? {
            chainId: '0x82',
            chainName: 'Unichain',
            nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
            rpcUrls: ['https://rpc.unichain.org'],
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
          setDisplayChainId(chainId);
          onChainChange?.(chainId);
          if (chainId === 130) {
            window.location.reload();
          }
        } catch (addError) {
          alert('Error adding Unichain: ' + addError?.message);
          console.error('Error adding chain:', addError);
        }
      } else if (chainId === 130) {
        alert('Your wallet provider does not support Unichain (chainId 130). Even though it is enabled for gas sponsorship, your wallet must support this chain. Please check with your wallet provider or Privy dashboard.');
        console.error('Unsupported chainId 130 for Unichain.');
      } else {
        alert('Error switching chain: ' + error?.message);
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
              src="/logotethcali.png" 
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
                  px-3 py-1.5 rounded-lg font-mono text-xs transition-all
                  ${isActive(item.href)
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                    : 'text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10'
                  }
                `}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Chain Switcher + User */}
          <div className="flex items-center gap-2">
            
            {/* Chain Switcher Dropdown */}
            <div className="relative group">
              <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-900 border border-gray-700 rounded-lg text-xs font-mono text-gray-300 hover:border-cyan-500/50 transition-all">
                <div className="w-5 h-5 flex items-center justify-center">
                  <img src={currentChain.logo} alt={currentChain.name} className="w-5 h-5 rounded-full object-contain" />
                </div>
                <span className="hidden sm:inline">{currentChain.name}</span>
                <span className="text-gray-500">▼</span>
              </button>
              <div className="absolute right-0 top-full mt-1 bg-gray-900 border border-gray-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 min-w-[140px]">
                {SUPPORTED_CHAINS.map((chain) => (
                  <button
                    key={chain.id}
                    onClick={() => handleChainSwitch(chain.id)}
                    className={`w-full px-3 py-2 text-left text-xs font-mono flex items-center gap-2 hover:bg-gray-800 transition-all first:rounded-t-lg last:rounded-b-lg ${
                      displayChainId === chain.id ? 'text-cyan-400 bg-cyan-500/10' : 'text-gray-300'
                    }`}
                  >
                    <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                      <img src={chain.logo} alt={chain.name} className="w-5 h-5 rounded-full object-contain" />
                    </div>
                    <span>{chain.name}</span>
                    {displayChainId === chain.id && <span className="ml-auto">✓</span>}
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
