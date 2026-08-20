import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { getChainRpc } from '../config/networks';
import { useAdminStatus } from '../hooks/useAdminStatus';
import { useDonationAdmin } from '../hooks/donations/useDonationAdmin';
import { logger } from '../utils/logger';

// Icons as simple SVG components for cleaner mobile menu
const WalletIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
  </svg>
);
const FaucetIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v16.5c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9zm3.75 11.625a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
  </svg>
);
const IdentityIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
  </svg>
);
const SwagIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
  </svg>
);
const DonateIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
  </svg>
);
const AdminIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
const LogoutIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
  </svg>
);

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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
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

  // Check if user is admin/owner on the current chain's contracts (single combined query)
  const {
    isSwagAdmin,
    isFaucetAdmin,
    isFaucetSuperAdmin,
    isZKPassportOwner,
  } = useAdminStatus(displayChainId);

  // Donation roles live on a different contract, read separately.
  const { isAdmin: isDonationAdmin } = useDonationAdmin(displayChainId);

  const mainNavItems = [
    { href: '/wallet', label: 'Wallet', icon: WalletIcon },
    { href: '/faucet', label: 'Faucet', icon: FaucetIcon },
    { href: '/sybil', label: 'Identity', icon: IdentityIcon },
    { href: '/swag', label: 'Swag', icon: SwagIcon },
    { href: '/donations', label: 'Donate', icon: DonateIcon },
  ];

  // One entry, not four. The admin areas are reachable from the dashboard
  // sidebar now, so repeating each of them in the top nav is noise — and on a
  // phone four extra rows pushed the real navigation off the screen.
  const hasAnyAdminRole =
    isSwagAdmin ||
    isFaucetAdmin ||
    isFaucetSuperAdmin ||
    isZKPassportOwner ||
    isDonationAdmin;

  const adminNavItems = hasAnyAdminRole
    ? [{ href: '/admin', label: 'Admin', icon: AdminIcon }]
    : [];

  const navItems = [...mainNavItems, ...adminNavItems];

  // Lock body scroll and signal mobile menu state when open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      document.body.setAttribute('data-mobile-menu-open', 'true');
    } else {
      document.body.style.overflow = '';
      document.body.removeAttribute('data-mobile-menu-open');
    }
    return () => {
      document.body.style.overflow = '';
      document.body.removeAttribute('data-mobile-menu-open');
    };
  }, [isMobileMenuOpen]);

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

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
                  px-3 py-1.5 rounded-lg font-mono text-xs transition-all uppercase
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

      </div>

      {/* Mobile Menu - Full screen slide-in drawer */}
      <div
        className={`md:hidden fixed inset-0 z-[60] transition-opacity duration-300 ${
          isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={closeMobileMenu}
        />

        {/* Drawer Panel */}
        <div
          ref={mobileMenuRef}
          className={`absolute right-0 top-0 bottom-0 w-[280px] max-w-[85vw] bg-slate-950 flex flex-col shadow-2xl transform transition-transform duration-300 ease-out ${
            isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Header with close button */}
          <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-slate-800/80 bg-slate-900/50">
            <div className="flex items-center gap-3">
              <Image
                src={currentChain.logo}
                alt={currentChain.name}
                width={28}
                height={28}
                className="w-7 h-7 rounded-full ring-2 ring-slate-700"
                unoptimized
              />
              <div className="min-w-0">
                <p className="text-xs text-white font-medium">{currentChain.name}</p>
                {userWallet && (
                  <p className="text-[10px] text-slate-500 font-mono truncate">
                    {userWallet.address.slice(0, 6)}...{userWallet.address.slice(-4)}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={closeMobileMenu}
              className="p-2 -mr-1 text-slate-400 hover:text-white rounded-full hover:bg-slate-800/50 transition-colors"
              aria-label="Close menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation Links - Scrollable area */}
          <div className="flex-1 overflow-y-auto overscroll-contain py-2">
            {/* Main Navigation */}
            <div className="px-3 space-y-1">
              {mainNavItems.map((item) => {
                const IconComponent = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMobileMenu}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                      ${active
                        ? 'bg-cyan-500/15 text-cyan-400'
                        : 'text-slate-300 active:bg-slate-800'
                      }
                    `}
                  >
                    <span className={active ? 'text-cyan-400' : 'text-slate-500'}>
                      <IconComponent />
                    </span>
                    {item.label}
                    {active && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Admin Section */}
            {adminNavItems.length > 0 && (
              <div className="px-3 mt-4">
                <div className="px-4 pb-2 mb-1 border-b border-slate-800/50">
                  <span className="text-[10px] text-orange-500/70 uppercase tracking-widest font-medium">Admin</span>
                </div>
                <div className="space-y-1">
                  {adminNavItems.map((item) => {
                    const IconComponent = item.icon;
                    const active = isActive(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={closeMobileMenu}
                        className={`
                          flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                          ${active
                            ? 'bg-orange-500/15 text-orange-400'
                            : 'text-orange-400/70 active:bg-slate-800'
                          }
                        `}
                      >
                        <span className={active ? 'text-orange-400' : 'text-orange-500/50'}>
                          <IconComponent />
                        </span>
                        {item.label}
                        {active && (
                          <span className="ml-auto w-1.5 h-1.5 rounded-full bg-orange-400" />
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Footer - Always visible logout */}
          <div className="flex-shrink-0 border-t border-slate-800/80 p-3 bg-slate-950/95 backdrop-blur-sm">
            <button
              onClick={() => {
                closeMobileMenu();
                logout();
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-red-500/10 hover:bg-red-500/20 active:bg-red-500/30 border border-red-500/30 rounded-xl text-red-400 font-medium transition-all"
            >
              <LogoutIcon />
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
