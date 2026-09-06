import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { getChainRpc } from '../config/networks';
import { useAdminStatus } from '../hooks/useAdminStatus';
import { useDonationAdmin } from '../hooks/donations/useDonationAdmin';
import { logger } from '../utils/logger';
import { CheckIcon, ChevronDownIcon, CloseIcon } from './shared/icons';

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

/** Real ellipsis, per BRAND.md: `0x55C9…711d`. */
function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

interface NavigationProps {
  className?: string;
  currentChainId?: number;
  onChainChange?: (chainId: number) => void;
}

/* COMPONENTS.md — Nav (topbar): 60px, --surface-void at 86% + blur, bottom
   hairline. Items are mono 11 uppercase; the active one sits on --eth-blue-wash.
   Chain switching lives here and nowhere else. */
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
    <nav className={`sticky top-0 z-50 border-b border-line-hairline bg-surface-void/85 backdrop-blur-[14px] ${className}`}>
      <div className="mx-auto max-w-page px-3 sm:px-4">
        <div className="flex h-nav items-center justify-between">
          {/* Logo — horizontal lockup, never below 32px */}
          <Link href="/" className="flex shrink-0 items-center gap-2" aria-label="ETH Cali">
            <Image
              src="/logotethcali.png"
              alt="ETH Cali"
              width={200}
              height={96}
              className="h-8 w-auto"
              priority
              unoptimized
            />
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(item.href) ? 'page' : undefined}
                className={`inline-flex min-h-[36px] items-center rounded-chip border px-3 font-mono text-[11px] uppercase tracking-[0.12em] transition-colors duration-base ${
                  isActive(item.href)
                    ? 'border-line-brand bg-eth-blue-wash text-eth-blue-text'
                    : 'border-transparent text-content-muted hover:bg-surface-inset hover:text-content-primary'
                }`}
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
                aria-haspopup="listbox"
                aria-expanded={isDropdownOpen}
                className={`flex min-h-[36px] items-center gap-1.5 rounded-full border bg-surface-slab px-2 font-mono text-xs transition-colors duration-base sm:px-3 ${
                  isSwitching
                    ? 'border-signal-pending/50 text-signal-pending'
                    : isDropdownOpen
                    ? 'border-line-brand text-eth-blue-text'
                    : 'border-line-strong text-content-secondary hover:border-line-brand'
                }`}
              >
                <div className="flex h-5 w-5 items-center justify-center">
                  {isSwitching ? (
                    <div className="h-4 w-4 animate-[spin_0.9s_linear_infinite] rounded-full border-2 border-signal-pending border-t-transparent" />
                  ) : (
                    <Image src={currentChain.logo} alt="" width={20} height={20} className="h-5 w-5 rounded-full object-contain" unoptimized />
                  )}
                </div>
                <span className="hidden sm:inline">{isSwitching ? 'Switching…' : currentChain.name}</span>
                <ChevronDownIcon
                  className={`h-3.5 w-3.5 text-content-faint transition-transform duration-base ${isDropdownOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {/* Dropdown Menu */}
              <div
                role="listbox"
                aria-label="Network"
                className={`absolute right-0 top-full z-50 mt-1 min-w-[180px] origin-top overflow-hidden rounded-control border border-line-hairline bg-surface-slab transition-all duration-base ${
                  isDropdownOpen
                    ? 'translate-y-0 scale-100 opacity-100'
                    : 'pointer-events-none -translate-y-1 scale-95 opacity-0'
                }`}
              >
                {SUPPORTED_CHAINS.map((chain) => (
                  <button
                    key={chain.id}
                    role="option"
                    aria-selected={displayChainId === chain.id}
                    onClick={() => handleChainSwitch(chain.id)}
                    disabled={isSwitching}
                    className={`flex min-h-[44px] w-full items-center gap-2 px-3 text-left font-mono text-xs transition-colors duration-fast ${
                      displayChainId === chain.id
                        ? 'bg-eth-blue-wash text-eth-blue-text'
                        : 'text-content-secondary hover:bg-surface-inset hover:text-content-primary'
                    } ${isSwitching ? 'cursor-not-allowed opacity-50' : ''}`}
                  >
                    <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center">
                      <Image src={chain.logo} alt="" width={20} height={20} className="h-5 w-5 rounded-full object-contain" unoptimized />
                    </div>
                    <span className="flex-1">{chain.name}</span>
                    {displayChainId === chain.id && <CheckIcon className="h-4 w-4" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Address chip - Desktop */}
            {userWallet && (
              <span className="hidden min-h-[36px] items-center rounded-full border border-line-hairline bg-surface-slab px-3 font-mono text-xs text-eth-blue-text lg:inline-flex">
                {truncateAddress(userWallet.address)}
              </span>
            )}

            {/* Sign out - Desktop (destructive-quiet) */}
            <button
              onClick={logout}
              className="hidden min-h-[36px] items-center gap-1.5 rounded-control border border-signal-reverted/30 bg-signal-reverted/10 px-3 text-xs font-medium text-signal-reverted transition-colors duration-base hover:bg-signal-reverted/20 sm:inline-flex"
            >
              <LogoutIcon />
              <span className="hidden md:inline">Sign out</span>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="flex min-h-tap min-w-tap items-center justify-center rounded-chip text-content-muted transition-colors hover:text-content-primary md:hidden"
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <CloseIcon />
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

      </div>

      {/* Mobile Menu - Full screen slide-in drawer */}
      <div
        className={`fixed inset-0 z-[60] transition-opacity duration-slow md:hidden ${
          isMobileMenuOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
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
          className={`absolute bottom-0 right-0 top-0 flex w-[280px] max-w-[85vw] transform flex-col border-l border-line-hairline bg-surface-slab transition-transform duration-slow ease-out ${
            isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Header with close button */}
          <div className="flex flex-shrink-0 items-center justify-between border-b border-line-hairline px-4 py-3">
            <div className="flex items-center gap-3">
              <Image
                src={currentChain.logo}
                alt=""
                width={28}
                height={28}
                className="h-7 w-7 rounded-full ring-1 ring-line-strong"
                unoptimized
              />
              <div className="min-w-0">
                <p className="font-mono text-xs text-content-primary">{currentChain.name}</p>
                {userWallet && (
                  <p className="truncate font-mono text-[11px] text-eth-blue-text">
                    {truncateAddress(userWallet.address)}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={closeMobileMenu}
              className="-mr-2 flex min-h-tap min-w-tap items-center justify-center rounded-full text-content-muted transition-colors hover:text-content-primary"
              aria-label="Close menu"
            >
              <CloseIcon />
            </button>
          </div>

          {/* Navigation Links - Scrollable area */}
          <div className="flex-1 overflow-y-auto overscroll-contain py-2">
            {/* Main Navigation */}
            <div className="space-y-1 px-3">
              {mainNavItems.map((item) => {
                const IconComponent = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMobileMenu}
                    aria-current={active ? 'page' : undefined}
                    className={`flex min-h-tap items-center gap-3 rounded-control px-4 text-sm font-medium transition-colors ${
                      active
                        ? 'bg-eth-blue-wash text-eth-blue-text'
                        : 'text-content-secondary active:bg-surface-inset'
                    }`}
                  >
                    <span className={active ? 'text-eth-blue-text' : 'text-content-faint'}>
                      <IconComponent />
                    </span>
                    {item.label}
                    {active && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-eth-blue" />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Admin Section */}
            {adminNavItems.length > 0 && (
              <div className="mt-4 px-3">
                <div className="mb-1 border-b border-line-hairline px-4 pb-2">
                  <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-content-faint">Admin</span>
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
                        aria-current={active ? 'page' : undefined}
                        className={`flex min-h-tap items-center gap-3 rounded-control px-4 text-sm font-medium transition-colors ${
                          active
                            ? 'bg-eth-blue-wash text-eth-blue-text'
                            : 'text-content-secondary active:bg-surface-inset'
                        }`}
                      >
                        <span className={active ? 'text-eth-blue-text' : 'text-content-faint'}>
                          <IconComponent />
                        </span>
                        {item.label}
                        {active && (
                          <span className="ml-auto h-1.5 w-1.5 rounded-full bg-eth-blue" />
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Footer - Always visible sign out */}
          <div className="flex-shrink-0 border-t border-line-hairline p-3">
            <button
              onClick={() => {
                closeMobileMenu();
                logout();
              }}
              className="flex min-h-tap w-full items-center justify-center gap-2 rounded-control border border-signal-reverted/30 bg-signal-reverted/10 px-4 font-medium text-signal-reverted transition-colors hover:bg-signal-reverted/20 active:bg-signal-reverted/30"
            >
              <LogoutIcon />
              Sign out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
