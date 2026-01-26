import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { getChainRpc } from '../config/networks';
import { useContractAdmin } from '../hooks/useContractAdmin';
import { useFaucetManagerAdmin } from '../hooks/faucet';
import { useZKPassportAdmin } from '../hooks/useZKPassportAdmin';
import { logger } from '../utils/logger';

const SUPPORTED_CHAINS = [
  { id: 8453, name: 'Base', logo: '/chains/base.jpeg' },
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
  const { authenticated, logout } = usePrivy();
  const { wallets } = useWallets();
  const [displayChainId, setDisplayChainId] = useState(currentChainId);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Sync displayChainId with prop
  useEffect(() => {
    setDisplayChainId(currentChainId);
  }, [currentChainId]);

  // Close dropdown and mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [router.pathname]);

  const userWallet = wallets?.[0];

  // Check if user is admin/owner on the current chain's contracts
  // Pass displayChainId to ensure hooks check the currently selected chain
  const { isAdmin: isSwagAdmin, walletAddress: swagWalletAddress } = useContractAdmin(displayChainId);
  const { isAdmin: isFaucetAdmin, isSuperAdmin: isFaucetSuperAdmin, walletAddress: faucetWalletAddress } = useFaucetManagerAdmin(displayChainId);
  const { isOwner: isZKPassportOwner, walletAddress: zkWalletAddress } = useZKPassportAdmin(displayChainId);

  // Debug logging for admin status
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_DEBUG === 'true') {
      logger.info('[Navigation] Admin status check', {
        displayChainId,
        walletAddress: userWallet?.address?.slice(0, 10),
        swagAdmin: isSwagAdmin,
        faucetAdmin: isFaucetAdmin,
        faucetSuperAdmin: isFaucetSuperAdmin,
        zkOwner: isZKPassportOwner,
      });
    }
  }, [displayChainId, userWallet?.address, isSwagAdmin, isFaucetAdmin, isFaucetSuperAdmin, isZKPassportOwner]);

  const navItems = [
    { href: '/wallet', label: 'WALLET' },
    { href: '/faucet', label: 'FAUCET' },
    { href: '/sybil', label: 'IDENTITY' },
    { href: '/swag', label: 'SWAG' },
    ...(isSwagAdmin ? [{ href: '/swag/admin', label: 'SWAG ADMIN' }] : []),
    ...(isFaucetAdmin || isFaucetSuperAdmin ? [{ href: '/faucet/admin', label: 'FAUCET ADMIN' }] : []),
    ...(isZKPassportOwner ? [{ href: '/sybil/admin', label: 'IDENTITY ADMIN' }] : []),
  ];

  const isActive = (href: string) => router.pathname === href || router.pathname.startsWith(href + '/');
  const currentChain = SUPPORTED_CHAINS.find(c => c.id === displayChainId) || SUPPORTED_CHAINS[0];

  // Chain configurations for adding new chains (uses centralized RPC config)
  const CHAIN_CONFIGS: Record<number, any> = {
    8453: {
      chainId: '0x2105',
      chainName: 'Base',
      nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
      rpcUrls: [getChainRpc(8453)],
      blockExplorerUrls: ['https://basescan.org'],
    },
    1: {
      chainId: '0x1',
      chainName: 'Ethereum',
      nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
      rpcUrls: [getChainRpc(1)],
      blockExplorerUrls: ['https://etherscan.io'],
    },
    10: {
      chainId: '0xa',
      chainName: 'Optimism',
      nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
      rpcUrls: [getChainRpc(10)],
      blockExplorerUrls: ['https://optimistic.etherscan.io'],
    },
    130: {
      chainId: '0x82',
      chainName: 'Unichain',
      nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
      rpcUrls: [getChainRpc(130)],
      blockExplorerUrls: ['https://unichain.blockscout.com'],
    },
  };

  // Helper to check if error indicates chain needs to be added
  const isChainNotFoundError = (error: any): boolean => {
    if (!error) return false;
    // Check common error codes
    if (error.code === 4902 || error.code === -32603) return true;
    // Check error message for common patterns
    const message = (error.message || '').toLowerCase();
    return (
      message.includes('unsupported chainid') ||
      message.includes('unrecognized chain') ||
      message.includes('chain not found') ||
      message.includes('unknown chain') ||
      message.includes('not supported')
    );
  };

  // Switch wallet chain
  const handleChainSwitch = async (chainId: number) => {
    if (!userWallet || isSwitching) return;
    if (chainId === displayChainId) {
      setIsDropdownOpen(false);
      return;
    }

    setIsSwitching(true);
    setIsDropdownOpen(false);

    try {
      const provider = await userWallet.getEthereumProvider();
      const chainHex = `0x${chainId.toString(16)}`;
      const chainConfig = CHAIN_CONFIGS[chainId];

      // For less common chains like Unichain, try adding first
      if (chainId === 130 && chainConfig) {
        try {
          await provider.request({
            method: 'wallet_addEthereumChain',
            params: [chainConfig],
          });
        } catch (addError: any) {
          // Ignore if chain already exists (some wallets throw, some don't)
          if (addError.code !== 4001) {
            logger.debug('Chain add attempt', { message: addError.message });
          }
        }
      }

      try {
        // Try to switch to the chain
        await provider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: chainHex }],
        });
      } catch (switchError: any) {
        // If chain doesn't exist, try adding it
        if (isChainNotFoundError(switchError)) {
          if (chainConfig) {
            await provider.request({
              method: 'wallet_addEthereumChain',
              params: [chainConfig],
            });
            // After adding, some wallets auto-switch, some don't - try switching again
            try {
              await provider.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: chainHex }],
              });
            } catch {
              // Ignore - chain was added, user may need to switch manually
            }
          } else {
            throw new Error(`Chain configuration not found for chainId ${chainId}`);
          }
        } else {
          throw switchError;
        }
      }

      // Update state after successful switch
      setDisplayChainId(chainId);
      onChainChange?.(chainId);

    } catch (error: any) {
      logger.error('Error switching chain', error);
      // Only show alert for non-user-rejected errors
      if (error.code !== 4001) {
        const chainName = SUPPORTED_CHAINS.find(c => c.id === chainId)?.name || `Chain ${chainId}`;
        // Provide more helpful message for Unichain
        if (chainId === 130) {
          alert(`Unable to switch to Unichain. Your wallet may not support this network yet. Try adding it manually in your wallet settings with RPC: https://rpc.unichain.org`);
        } else {
          alert(`Failed to switch to ${chainName}: ${error.message || 'Unknown error'}`);
        }
      }
    } finally {
      setIsSwitching(false);
    }
  };

  if (!authenticated) return null;

  return (
    <nav className={`bg-black border-b border-cyan-500/30 sticky top-0 z-50 ${className}`}>
      <div className="max-w-6xl mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Image
              src="/logotethcali.png"
              alt="ETH CALI"
              width={200}
              height={96}
              className="h-7 sm:h-8 w-auto"
              priority
              unoptimized
            />
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
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

          {/* Right Side: Chain + Actions */}
          <div className="flex items-center gap-2">

            {/* Chain Switcher Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                disabled={isSwitching}
                className={`flex items-center gap-1.5 px-2 sm:px-3 py-1.5 bg-gray-900 border rounded-lg text-xs font-mono transition-all duration-200 ${
                  isSwitching
                    ? 'border-yellow-500/50 text-yellow-400'
                    : isDropdownOpen
                    ? 'border-cyan-500 text-cyan-400'
                    : 'border-gray-700 text-gray-300 hover:border-cyan-500/50'
                }`}
              >
                <div className="w-5 h-5 flex items-center justify-center">
                  {isSwitching ? (
                    <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Image src={currentChain.logo} alt={currentChain.name} width={20} height={20} className="w-5 h-5 rounded-full object-contain" unoptimized />
                  )}
                </div>
                <span className="hidden sm:inline">{isSwitching ? 'Switching...' : currentChain.name}</span>
                <span className={`text-gray-500 transition-transform duration-200 text-[10px] ${isDropdownOpen ? 'rotate-180' : ''}`}>▼</span>
              </button>

              {/* Dropdown Menu */}
              <div
                className={`absolute right-0 top-full mt-1 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50 min-w-[160px] overflow-hidden transition-all duration-200 origin-top ${
                  isDropdownOpen
                    ? 'opacity-100 scale-100 translate-y-0'
                    : 'opacity-0 scale-95 -translate-y-1 pointer-events-none'
                }`}
              >
                {SUPPORTED_CHAINS.map((chain) => (
                  <button
                    key={chain.id}
                    onClick={() => handleChainSwitch(chain.id)}
                    disabled={isSwitching}
                    className={`w-full px-3 py-2.5 text-left text-xs font-mono flex items-center gap-2 transition-all duration-150 ${
                      displayChainId === chain.id
                        ? 'text-cyan-400 bg-cyan-500/10'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    } ${isSwitching ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                      <Image src={chain.logo} alt={chain.name} width={20} height={20} className="w-5 h-5 rounded-full object-contain" unoptimized />
                    </div>
                    <span className="flex-1">{chain.name}</span>
                    {displayChainId === chain.id && (
                      <span className="text-cyan-400">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Logout - Desktop */}
            <button
              onClick={logout}
              className="hidden sm:block px-2 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-xs font-mono transition-all"
            >
              EXIT
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-400 hover:text-cyan-400 transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          ref={mobileMenuRef}
          className={`md:hidden overflow-hidden transition-all duration-300 ${
            isMobileMenuOpen ? 'max-h-80 opacity-100 pb-4' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="flex flex-col gap-1 pt-2 border-t border-gray-800">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`
                  px-4 py-3 rounded-lg font-mono text-sm transition-all
                  ${isActive(item.href)
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                    : 'text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10'
                  }
                `}
              >
                {item.label}
              </Link>
            ))}

            {/* Address in mobile menu */}
            {userWallet && (
              <div className="px-4 py-2 text-xs text-gray-500 font-mono border-t border-gray-800 mt-2 pt-3">
                {userWallet.address.slice(0, 8)}...{userWallet.address.slice(-6)}
              </div>
            )}

            {/* Logout in mobile menu */}
            <button
              onClick={logout}
              className="mx-4 mt-2 px-4 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm font-mono transition-all text-center"
            >
              LOGOUT
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
