import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Wallet, TokenBalance } from '../../types/index';
import Loading from '../../components/shared/Loading';
import { getTokenLogoUrl, formatTokenBalance } from '../../utils/tokenUtils';
import { usePrivy, useWallets, useSendTransaction, useFundWallet } from '@privy-io/react-auth';
import SendTokenModal from './SendTokenModal';
import QRScanner from './QRScanner';
import { parseUnits, encodeFunctionData } from 'viem';
import { base, mainnet, optimism } from 'viem/chains';
import { useTokenPrices } from '../../hooks/useTokenPrices';
import { getTokenAddresses } from '../../utils/network';
import ReceiveModal from './ReceiveModal';
import { useUserNFTs } from '../../hooks/useUserNFTs';
import { NFTCard } from './NFTCard';
import { logger } from '../../utils/logger';
import ENSSection from '../ens/ENSSection';
import SwapModal from './SwapModal';

interface WalletInfoProps {
  wallet: Wallet;
  balances: TokenBalance;
  isLoading: boolean;
  onRefresh: () => void;
  chainId?: number;
}

const WalletInfo: React.FC<WalletInfoProps> = ({
  wallet,
  balances,
  isLoading,
  onRefresh,
  chainId,
}) => {
  const { exportWallet, user } = usePrivy();
  const { wallets } = useWallets();
  const { sendTransaction } = useSendTransaction();
  const { fundWallet } = useFundWallet();
  const { getPriceForToken } = useTokenPrices();
  const activeWallet = wallets?.[0];

  // States for send token modal
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [_selectedToken, setSelectedToken] = useState<'ETH' | 'USDC'>('ETH');
  const [isSendingTx, setIsSendingTx] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  // Tab state for Tokens/Collectibles
  const [activeTab, setActiveTab] = useState<'tokens' | 'collectibles'>('tokens');

  // New state for QR scanner
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [scannedAddress, setScannedAddress] = useState<string | null>(null);

  // State for Receive modal
  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);

  // Fund wallet state
  const [isFunding, setIsFunding] = useState(false);

  // Swap modal state
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);

  // NFTs for collectibles tab - pass chainId to ensure correct chain on refresh
  const { data: nfts = [], isLoading: isLoadingNFTs, refetch: refetchNFTs } = useUserNFTs(chainId);

  // Refetch NFTs when chainId changes
  useEffect(() => {
    if (activeTab === 'collectibles' && chainId) {
      refetchNFTs();
    }
  }, [chainId, activeTab, refetchNFTs]);
  
  // Get the actual wallet instance from Privy's useWallets hook
  const privyWallet = wallets?.find(w => w.address.toLowerCase() === wallet.address.toLowerCase());
  
  // Get token logo URLs from CoinGecko
  const ethLogoUrl = getTokenLogoUrl('ETH');
  const usdcLogoUrl = getTokenLogoUrl('USDC');
  const eurclogoUrl = getTokenLogoUrl('EURC');
  const usdtLogoUrl = getTokenLogoUrl('USDT');
  
  // Explorer mapping per chain
  const explorerBase = (() => {
    switch (chainId) {
      case 1:
        return 'https://etherscan.io';
      case 10:
        return 'https://optimism.etherscan.io';
      case 8453:
        return 'https://basescan.org';
      case 130:
        return 'https://unichain.blockscout.com';
      default:
        return undefined;
    }
  })();
  
  // Calculate USD values
  const ethPrice = getPriceForToken('ETH');
  const usdcPrice = getPriceForToken('USDC');
  const usdtPrice = getPriceForToken('USDT');
  const eurcPrice = getPriceForToken('EURC');

  const ethValueUsd = parseFloat(balances.ethBalance) * ethPrice.price;
  const usdcValueUsd = parseFloat(balances.uscBalance) * usdcPrice.price;
  const usdtValueUsd = parseFloat(balances.usdtBalance || '0') * usdtPrice.price;
  const eurcValueUsd = parseFloat(balances.eurcBalance || '0') * eurcPrice.price;
  const totalValueUsd = ethValueUsd + usdcValueUsd + usdtValueUsd + eurcValueUsd;
  
  // Format USD values
  const formatUsd = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };
  
  // Handle export wallet button click
  const handleExportWallet = async () => {
    try {
      await exportWallet({ address: wallet.address });
    } catch (error) {
      logger.error('Error exporting wallet', error);
    }
  };

  // Get the viem chain object for current chainId
  const getViemChain = () => {
    switch (chainId) {
      case 1: return mainnet;
      case 10: return optimism;
      default: return base;
    }
  };

  // Handle fund wallet with Apple Pay / Google Pay
  const handleFundWallet = async () => {
    if (!wallet.address) return;

    setIsFunding(true);
    try {
      // Privy fundWallet API - opens modal for Apple Pay / Google Pay
      // Pass address and chain - asset and amount default to Dashboard settings
      const viemChain = getViemChain();
      await fundWallet({ address: wallet.address, options: { chain: viemChain } });
    } catch (error) {
      logger.error('Error funding wallet', error);
    } finally {
      setIsFunding(false);
    }
  };

  // Get token addresses based on chain (using centralized config)
  const getTokenAddress = (tokenSymbol: string): string | null => {
    if (tokenSymbol === 'ETH') return null; // Native token
    if (!chainId) return null;
    
    // Use centralized token addresses from utils/network
    const tokenAddresses = getTokenAddresses(chainId);
    const address = tokenAddresses[tokenSymbol as keyof typeof tokenAddresses];
    
    // Return null if token not available on this chain (empty string)
    return address && address.trim() !== '' ? address : null;
  };

  // Prepare available tokens for SendTokenModal - show all 4 tokens regardless of balance
  const availableTokens = [
    { symbol: 'ETH', balance: balances.ethBalance, name: 'Ethereum' },
    { symbol: 'USDC', balance: balances.uscBalance, name: 'USD Coin' },
    { symbol: 'USDT', balance: balances.usdtBalance || '0', name: 'Tether USD' },
    { symbol: 'EURC', balance: balances.eurcBalance || '0', name: 'Euro Coin' },
  ];

  // Handle opening the send token modal
  const openSendModal = (token?: string) => {
    if (token) {
      const foundToken = availableTokens.find(t => t.symbol === token);
      if (foundToken) {
        setSelectedToken(token as 'ETH' | 'USDC');
      }
    }
    setIsSendModalOpen(true);
  };
  
  // Handle sending tokens
  const handleSendToken = async (recipient: string, amount: string, tokenType: string) => {
    const walletToUse = activeWallet || privyWallet;

    if (!walletToUse) {
      logger.error('No wallet found');
      return;
    }

    logger.tx('Sending transaction', {
      hash: undefined,
      chainId,
      status: 'pending'
    });

    setIsSendingTx(true);
    setTxHash(null);

    try {
      const transferAbi = [{
        inputs: [
          { name: 'to', type: 'address' },
          { name: 'amount', type: 'uint256' }
        ],
        name: 'transfer',
        outputs: [{ name: '', type: 'bool' }],
        stateMutability: 'nonpayable',
        type: 'function'
      }] as const;

      // Ensure chainId is available for gas sponsorship
      if (!chainId) {
        throw new Error('Chain ID is required for transaction');
      }

      if (tokenType === 'ETH') {
        const value = parseUnits(amount, 18);
        const result = await sendTransaction(
          {
            to: recipient as `0x${string}`,
            value,
            chainId,
          },
          { sponsor: true }
        );
        setTxHash(result.hash);
      } else {
        // ERC20 token transfer
        const tokenAddress = getTokenAddress(tokenType);
        if (!tokenAddress) {
          throw new Error(`Token ${tokenType} not supported on this network`);
        }

        const decimals = tokenType === 'USDT' || tokenType === 'USDC' || tokenType === 'EURC' ? 6 : 18;
        const tokenAmount = parseUnits(amount, decimals);
        const data = encodeFunctionData({
          abi: transferAbi,
          functionName: 'transfer',
          args: [recipient as `0x${string}`, tokenAmount]
        });

        const result = await sendTransaction(
          {
            to: tokenAddress as `0x${string}`,
            data,
            chainId,
          },
          { sponsor: true }
        );
        setTxHash(result.hash);
      }

      // Refresh balances after successful transaction
      onRefresh();

    } catch (error) {
      logger.error('Error sending transaction', error);
      throw error;
    } finally {
      setIsSendingTx(false);
    }
  };
  
  // Handle QR code scan result
  const handleQRScan = (address: string) => {
    setScannedAddress(address);
    setIsQRScannerOpen(false);
    
    // Open send modal with the scanned address
    setSelectedToken('ETH'); // Default to ETH
    setIsSendModalOpen(true);
  };
  
  // Open QR scanner
  const openQRScanner = () => {
    setIsQRScannerOpen(true);
  };
  
  // Format address for mobile (truncated)
  const formatAddress = (address: string, isMobile: boolean = false) => {
    if (isMobile && address.length > 20) {
      return `${address.slice(0, 8)}...${address.slice(-6)}`;
    }
    return address;
  };

  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(wallet.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Get user's login method info
  const getUserLoginInfo = () => {
    if (!user) return null;

    // Check for email
    const emailAccount = user.linkedAccounts?.find(
      (account) => account.type === 'email'
    );

    // Check for passkey
    const passkeyAccount = user.linkedAccounts?.find(
      (account) => account.type === 'passkey'
    );

    if (emailAccount && 'address' in emailAccount) {
      return { type: 'email', value: emailAccount.address as string };
    }

    if (passkeyAccount) {
      return { type: 'passkey', value: 'Passkey Authentication' };
    }

    return null;
  };

  const loginInfo = getUserLoginInfo();

  return (
    <div className="wallet-info">
      {/* Total Portfolio Value - Hero Section */}
      <div className="portfolio-hero">
        <div className="portfolio-value-section">
          <span className="portfolio-label">Total Balance</span>
          <div className="portfolio-amount">{formatUsd(totalValueUsd)}</div>
        </div>

        {/* Quick Actions - Mobile First */}
        <div className="quick-actions">
            <button
              className="quick-action-btn fund-btn"
              onClick={handleFundWallet}
              disabled={isFunding}
            >
              <div className="action-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <line x1="2" y1="10" x2="22" y2="10" />
                </svg>
              </div>
              <span>{isFunding ? 'Loading...' : 'Buy'}</span>
            </button>
            <button
              className="quick-action-btn swap-btn"
              onClick={() => setIsSwapModalOpen(true)}
            >
              <div className="action-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
              </div>
              <span>Swap</span>
            </button>
            <button
              className="quick-action-btn send-btn"
              onClick={() => openSendModal('USDC')}
            >
              <div className="action-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 19V5M5 12l7-7 7 7" />
                </svg>
              </div>
              <span>Send</span>
            </button>
            <button
              className="quick-action-btn receive-btn"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsReceiveModalOpen(true);
              }}
            >
              <div className="action-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M5 12l7 7 7-7" />
                </svg>
              </div>
              <span>Receive</span>
            </button>
            <button
              className="quick-action-btn refresh-btn"
              onClick={onRefresh}
              disabled={isLoading}
            >
              <div className="action-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={isLoading ? 'spinning' : ''}>
                  <path d="M23 4v6h-6M1 20v-6h6" />
                  <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
                </svg>
              </div>
              <span>Refresh</span>
            </button>
          </div>
      </div>

      {/* Wallet Address Card - Compact */}
      <div className="wallet-address-card">
        <div className="address-row">
          <div className="address-info">
            <div className="address-text">
              <span className="address-label">Wallet Address</span>
              <span className="address-value">{formatAddress(wallet.address, true)}</span>
            </div>
          </div>
          <div className="address-actions-row">
            <button className="action-icon-btn" onClick={handleCopy} title="Copy address">
              {copied ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                </svg>
              )}
            </button>
            {explorerBase && (
              <a
                href={`${explorerBase}/address/${wallet.address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="action-icon-btn"
                title="View on explorer"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </a>
            )}
            <button className="action-icon-btn" onClick={handleExportWallet} title="Export wallet">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </button>
          </div>
        </div>

        {/* Login Method Info */}
        {loginInfo && (
          <div className="login-info-row">
            <div className="login-info-icon">
              {loginInfo.type === 'email' ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="M22 6l-10 7L2 6" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2a5 5 0 0 1 5 5v3H7V7a5 5 0 0 1 5-5z" />
                  <rect x="3" y="10" width="18" height="12" rx="2" />
                  <circle cx="12" cy="16" r="1" />
                </svg>
              )}
            </div>
            <div className="login-info-text">
              <span className="login-info-label">
                {loginInfo.type === 'email' ? 'Signed in with email' : 'Signed in with passkey'}
              </span>
              <span className="login-info-value">
                {loginInfo.type === 'email' ? loginInfo.value : 'Biometric / Security Key'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ENS Subdomain Section */}
      <ENSSection userAddress={wallet.address} chainId={chainId || 8453} />

      <div className="balance-section">

        <div className="balance-header">
          <h4>Assets</h4>
        </div>

        {/* Tabs for Tokens/Collectibles */}
        <div className="wallet-tabs">
          <button
            className={`wallet-tab ${activeTab === 'tokens' ? 'active' : ''}`}
            onClick={() => setActiveTab('tokens')}
          >
            Tokens
          </button>
          <button
            className={`wallet-tab ${activeTab === 'collectibles' ? 'active' : ''}`}
            onClick={() => setActiveTab('collectibles')}
          >
            Collectibles
          </button>
          {activeTab === 'collectibles' && (
            <button
              className="refresh-collectibles-btn"
              onClick={() => refetchNFTs()}
              disabled={isLoadingNFTs}
              title="Refresh collectibles"
            >
              <svg 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
                className={isLoadingNFTs ? 'spinning' : ''}
              >
                <path d="M23 4v6h-6M1 20v-6h6" />
                <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
              </svg>
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="loading-balances">
            <Loading size="small" text="Loading balances..." />
          </div>
        ) : activeTab === 'tokens' ? (
          <div className="token-list">
            {/* ETH Balance */}
            <div className="token-item">
              <div className="token-info">
                <Image src={ethLogoUrl} alt="ETH" width={32} height={32} className="token-icon" unoptimized />
                <div className="token-details">
                  <span className="token-name">Ethereum</span>
                  <span className="token-symbol">ETH</span>
                </div>
              </div>
              <div className="token-balance">
                <div className="balance-amount">{formatTokenBalance(balances.ethBalance, 6)}</div>
                <div className="balance-usd">{formatUsd(ethValueUsd)}</div>
              </div>
            </div>

            {/* USDC Balance */}
            <div className="token-item">
              <div className="token-info">
                <Image src={usdcLogoUrl} alt="USDC" width={32} height={32} className="token-icon" unoptimized />
                <div className="token-details">
                  <span className="token-name">USD Coin</span>
                  <span className="token-symbol">USDC</span>
                </div>
              </div>
              <div className="token-balance">
                <div className="balance-amount">{formatTokenBalance(balances.uscBalance, 6)}</div>
                <div className="balance-usd">{formatUsd(usdcValueUsd)}</div>
              </div>
            </div>

            {/* USDT Balance */}
            <div className="token-item">
              <div className="token-info">
                <Image src={usdtLogoUrl} alt="USDT" width={32} height={32} className="token-icon" unoptimized />
                <div className="token-details">
                  <span className="token-name">Tether USD</span>
                  <span className="token-symbol">USDT</span>
                </div>
              </div>
              <div className="token-balance">
                <div className="balance-amount">{formatTokenBalance(balances.usdtBalance || '0', 6)}</div>
                <div className="balance-usd">{formatUsd(usdtValueUsd)}</div>
              </div>
            </div>

            {/* EURC Balance */}
            <div className="token-item">
              <div className="token-info">
                <Image src={eurclogoUrl} alt="EURC" width={32} height={32} className="token-icon" unoptimized />
                <div className="token-details">
                  <span className="token-name">Euro Coin</span>
                  <span className="token-symbol">EURC</span>
                </div>
              </div>
              <div className="token-balance">
                <div className="balance-amount">{formatTokenBalance(balances.eurcBalance || '0', 6)}</div>
                <div className="balance-usd">{formatUsd(eurcValueUsd)}</div>
              </div>
            </div>
          </div>
        ) : (
          /* Collectibles Tab */
          <div className="collectibles-list">
            {isLoadingNFTs ? (
              <div className="collectibles-loading">
                <Loading size="small" text="Loading collectibles..." />
              </div>
            ) : nfts.length === 0 ? (
              <div className="collectibles-empty">
                <div className="empty-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="M21 15l-5-5L5 21" />
                  </svg>
                </div>
                <h4>No Collectibles Yet</h4>
                <p>Your NFTs and collectibles will appear here</p>
                <Link href="/swag" className="browse-swag-link">
                  Browse ETH CALI Swag
                </Link>
              </div>
            ) : (
              <div>
                <div className="collectibles-summary">
                  <span className="summary-label">Total Collectibles:</span>
                  <span className="summary-value">{nfts.length}</span>
                </div>
                <div className="nfts-grid">
                  {nfts.map((nft) => (
                    <NFTCard
                      key={`${nft.tokenId.toString()}-${nft.redemptionStatus}`}
                      nft={nft}
                      onRedeemSuccess={() => {
                        // Refetch NFTs after redemption to update status
                        setTimeout(() => {
                          refetchNFTs();
                        }, 2000);
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Show transaction receipt if available */}
      {txHash && (
        <div className="transaction-receipt">
          <div className="receipt-header">
            <div className="success-icon">✓</div>
            <h4>Transaction Sent</h4>
          </div>
          <div className="receipt-content">
            <div className="tx-hash-container">
              <span className="tx-label">Transaction Hash:</span>
              <code className="tx-hash">{txHash.substring(0, 10)}...{txHash.substring(txHash.length - 8)}</code>
              {explorerBase && (
                <a 
                  href={`${explorerBase}/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="explorer-button"
                >
                  View on Explorer
                </a>
              )}
            </div>
            <p className="receipt-info">Your transaction has been submitted. It may take a few moments to be confirmed.</p>
          </div>
        </div>
      )}
      
      {/* Add the QR Scanner component */}
      {isQRScannerOpen && (
        <QRScanner 
          onScan={handleQRScan} 
          onClose={() => setIsQRScannerOpen(false)} 
        />
      )}
      
      {/* Send Token Modal */}
      {isSendModalOpen && (
        <SendTokenModal
          onClose={() => setIsSendModalOpen(false)}
          onSend={handleSendToken}
          availableTokens={availableTokens}
          isSending={isSendingTx}
          txHash={txHash}
          initialRecipient={scannedAddress || ''}
          chainId={chainId}
        />
      )}

      {/* Receive Modal */}
      {isReceiveModalOpen && (
        <ReceiveModal
          address={wallet.address}
          onClose={() => setIsReceiveModalOpen(false)}
          onScanQR={() => {
            setIsReceiveModalOpen(false);
            openQRScanner();
          }}
        />
      )}

      {/* Swap Modal */}
      {isSwapModalOpen && (
        <SwapModal
          userAddress={wallet.address}
          chainId={chainId || 8453}
          onClose={() => setIsSwapModalOpen(false)}
          onSuccess={() => {
            setIsSwapModalOpen(false);
            onRefresh();
          }}
        />
      )}

      <style jsx>{`
        .wallet-info {
          background: transparent;
          padding: 0;
          border-radius: 0;
          margin-top: 0;
          position: relative;
          max-width: 100%;
        }

        /* Portfolio Hero Section */
        .portfolio-hero {
          background: linear-gradient(135deg, rgba(17, 24, 39, 0.95), rgba(31, 41, 55, 0.95));
          border-radius: 20px;
          padding: 1.5rem;
          margin-bottom: 1rem;
          border: 1px solid rgba(75, 85, 99, 0.3);
        }

        .portfolio-value-section {
          text-align: center;
          margin-bottom: 1.25rem;
        }

        .portfolio-label {
          display: block;
          font-size: 0.75rem;
          font-weight: 500;
          color: #9ca3af;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 0.5rem;
        }

        .portfolio-amount {
          font-size: 2.25rem;
          font-weight: 700;
          background: linear-gradient(135deg, #06b6d4 0%, #8b5cf6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1.2;
        }

        /* Wallet Address Card - Compact */
        .wallet-address-card {
          background: rgba(17, 24, 39, 0.8);
          border-radius: 12px;
          padding: 0.875rem 1rem;
          margin-bottom: 1.25rem;
          border: 1px solid rgba(75, 85, 99, 0.3);
        }

        .address-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
        }

        .address-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex: 1;
          min-width: 0;
        }

        .qr-code-mini {
          width: 44px;
          height: 44px;
          background: white;
          border-radius: 8px;
          padding: 3px;
          flex-shrink: 0;
        }

        .qr-code-mini img {
          width: 100%;
          height: 100%;
          display: block;
        }

        .address-text {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .address-label {
          font-size: 0.7rem;
          font-weight: 500;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .address-value {
          font-family: 'SF Mono', 'Menlo', monospace;
          font-size: 0.875rem;
          color: #06b6d4;
          font-weight: 500;
        }

        .address-actions-row {
          display: flex;
          gap: 0.5rem;
          flex-shrink: 0;
        }

        .action-icon-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 8px;
          background: rgba(55, 65, 81, 0.5);
          border: 1px solid rgba(75, 85, 99, 0.4);
          color: #9ca3af;
          cursor: pointer;
          transition: all 0.2s ease;
          text-decoration: none;
        }

        .action-icon-btn:hover {
          background: rgba(75, 85, 99, 0.6);
          color: #e5e7eb;
          border-color: rgba(107, 114, 128, 0.6);
        }

        .action-icon-btn svg {
          width: 16px;
          height: 16px;
        }

        /* Login Info Row */
        .login-info-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-top: 0.875rem;
          padding-top: 0.875rem;
          border-top: 1px solid rgba(75, 85, 99, 0.3);
        }

        .login-info-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          background: rgba(6, 182, 212, 0.15);
          border-radius: 8px;
          color: #06b6d4;
          flex-shrink: 0;
        }

        .login-info-icon svg {
          width: 16px;
          height: 16px;
        }

        .login-info-text {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .login-info-label {
          font-size: 0.6875rem;
          font-weight: 500;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .login-info-value {
          font-size: 0.8125rem;
          color: #e5e7eb;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .balance-section {
          margin-top: 0;
        }

        .balance-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.75rem;
          padding: 0 0.25rem;
        }

        .balance-header h4 {
          margin: 0;
          color: #9ca3af;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .loading-balances {
          padding: 2rem;
          text-align: center;
          color: #9ca3af;
        }

        .token-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .token-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.875rem 1rem;
          background: rgba(17, 24, 39, 0.6);
          border-radius: 12px;
          border: 1px solid rgba(75, 85, 99, 0.25);
          transition: all 0.15s ease;
        }

        .token-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .token-icon {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          object-fit: contain;
        }

        .token-details {
          display: flex;
          flex-direction: column;
          gap: 0.125rem;
        }

        .token-name {
          font-weight: 500;
          font-size: 0.9375rem;
          color: #e5e7eb;
        }

        .token-symbol {
          font-size: 0.75rem;
          color: #6b7280;
        }

        .token-balance {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 0.125rem;
        }

        .balance-amount {
          font-weight: 600;
          font-size: 0.9375rem;
          color: #e5e7eb;
        }

        .balance-usd {
          font-size: 0.75rem;
          color: #6b7280;
        }
        
        .transaction-receipt {
          margin: 1.5rem 0;
          background-color: #f1fbf6;
          border-radius: 12px;
          border: 1px solid #c5e8d1;
          overflow: hidden;
          box-shadow: 0 1px 3px var(--card-shadow);
        }
        
        .receipt-header {
          background-color: #e3f6ea;
          padding: 1rem 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          border-bottom: 1px solid #c5e8d1;
        }
        
        .receipt-header h4 {
          margin: 0;
          color: #2a9d5c;
          font-size: 1.1rem;
        }
        
        .success-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          background-color: #2a9d5c;
          color: white;
          border-radius: 50%;
          font-weight: bold;
        }
        
        .receipt-content {
          padding: 1.25rem 1.5rem;
        }
        
        .tx-hash-container {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
          flex-wrap: wrap;
        }
        
        .tx-label {
          font-weight: 500;
          color: var(--text-color);
          font-size: 0.9rem;
        }
        
        .tx-hash {
          font-family: monospace;
          background: var(--bg-tertiary);
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          color: var(--text-color);
          font-size: 0.9rem;
        }
        
        .explorer-button {
          display: inline-flex;
          align-items: center;
          background-color: #2a9d5c;
          color: white;
          text-decoration: none;
          padding: 0.25rem 0.75rem;
          border-radius: 4px;
          font-size: 0.85rem;
          transition: background-color 0.2s;
        }
        
        .explorer-button:hover {
          background-color: #237a49;
        }
        
        .receipt-info {
          margin: 0;
          color: var(--text-secondary);
          font-size: 0.9rem;
        }
        
        /* Mobile-first responsive design */
        @media (max-width: 480px) {
          .portfolio-hero {
            padding: 1.25rem;
            border-radius: 16px;
          }

          .portfolio-amount {
            font-size: 1.875rem;
          }

          .quick-action-btn .action-icon {
            width: 40px;
            height: 40px;
            border-radius: 12px;
          }

          .quick-action-btn svg {
            width: 18px;
            height: 18px;
          }

          .wallet-address-card {
            padding: 0.75rem;
          }

          .qr-code-mini {
            width: 38px;
            height: 38px;
          }

          .address-value {
            font-size: 0.8125rem;
          }

          .action-icon-btn {
            width: 32px;
            height: 32px;
          }

          .action-icon-btn svg {
            width: 14px;
            height: 14px;
          }

          .token-item {
            padding: 0.75rem;
          }

          .token-icon {
            width: 32px;
            height: 32px;
          }

          .token-name {
            font-size: 0.875rem;
          }

          .balance-amount {
            font-size: 0.875rem;
          }

          .wallet-tab {
            padding: 0.625rem 0.75rem;
            font-size: 0.8125rem;
          }
        }

        @media (min-width: 768px) {
          .portfolio-hero {
            padding: 2rem;
          }

          .portfolio-amount {
            font-size: 2.75rem;
          }

          .quick-action-btn .action-icon {
            width: 52px;
            height: 52px;
          }

          .quick-action-btn svg {
            width: 24px;
            height: 24px;
          }

          .wallet-address-card {
            padding: 1rem 1.25rem;
          }

          .qr-code-mini {
            width: 52px;
            height: 52px;
          }

          .token-icon {
            width: 40px;
            height: 40px;
          }
        }

        /* Wallet Tabs */
        .wallet-tabs {
          display: flex;
          gap: 0;
          margin-bottom: 1.5rem;
          background: rgba(17, 24, 39, 0.6);
          border-radius: 8px;
          padding: 4px;
          border: 1px solid rgba(75, 85, 99, 0.3);
        }

        .wallet-tab {
          flex: 1;
          padding: 0.75rem 1rem;
          font-size: 0.875rem;
          font-weight: 600;
          color: #9ca3af;
          background: transparent;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .wallet-tab:hover {
          color: #e5e7eb;
          background: rgba(75, 85, 99, 0.3);
        }

        .wallet-tab.active {
          color: #06b6d4;
          background: rgba(6, 182, 212, 0.15);
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
        }

        .refresh-collectibles-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.5rem;
          margin-left: auto;
          background: rgba(55, 65, 81, 0.5);
          border: 1px solid rgba(75, 85, 99, 0.4);
          border-radius: 6px;
          color: #9ca3af;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .refresh-collectibles-btn:hover:not(:disabled) {
          background: rgba(75, 85, 99, 0.6);
          color: #06b6d4;
          border-color: rgba(6, 182, 212, 0.4);
        }

        .refresh-collectibles-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .refresh-collectibles-btn svg {
          width: 16px;
          height: 16px;
        }

        .refresh-collectibles-btn svg.spinning {
          animation: spin 1s linear infinite;
        }

        /* Collectibles Section */
        .collectibles-list {
          min-height: 200px;
        }

        .collectibles-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 3rem 1.5rem;
        }

        .collectibles-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem 1.5rem;
          text-align: center;
          background: rgba(17, 24, 39, 0.4);
          border-radius: 12px;
          border: 1px dashed rgba(75, 85, 99, 0.5);
        }

        .collectibles-empty .empty-icon {
          color: #4b5563;
          margin-bottom: 1rem;
        }

        .collectibles-empty h4 {
          color: #e5e7eb;
          font-size: 1.125rem;
          font-weight: 600;
          margin: 0 0 0.5rem 0;
        }

        .collectibles-empty p {
          color: #9ca3af;
          font-size: 0.875rem;
          margin: 0 0 1.5rem 0;
        }

        .collectibles-summary {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem;
          margin-bottom: 1rem;
          background: rgba(6, 182, 212, 0.1);
          border: 1px solid rgba(6, 182, 212, 0.3);
          border-radius: 8px;
        }

        .summary-label {
          font-size: 0.875rem;
          color: #9ca3af;
          font-weight: 500;
        }

        .summary-value {
          font-size: 1.125rem;
          color: #06b6d4;
          font-weight: 700;
        }

        .nfts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1rem;
        }

        @media (max-width: 640px) {
          .nfts-grid {
            grid-template-columns: 1fr;
          }

          .collectibles-summary {
            padding: 0.875rem;
          }

          .summary-value {
            font-size: 1rem;
          }
        }

        .browse-swag-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(139, 92, 246, 0.2));
          border: 1px solid rgba(6, 182, 212, 0.4);
          border-radius: 8px;
          color: #06b6d4;
          font-size: 0.875rem;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.2s ease;
        }

        /* Quick Actions - Professional Mobile UI */
        .quick-actions {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 0.5rem;
        }

        .quick-action-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.375rem;
          padding: 0.75rem 0.5rem;
          background: transparent;
          border: none;
          border-radius: 12px;
          color: #9ca3af;
          font-size: 0.6875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .quick-action-btn:hover:not(:disabled) {
          color: #e5e7eb;
        }

        .quick-action-btn:active:not(:disabled) {
          transform: scale(0.95);
        }

        .quick-action-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .quick-action-btn .action-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          border-radius: 14px;
          transition: all 0.15s ease;
        }

        .quick-action-btn svg {
          width: 20px;
          height: 20px;
          stroke-width: 2;
        }

        .quick-action-btn.fund-btn .action-icon {
          background: linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(16, 185, 129, 0.25));
          color: #4ade80;
        }

        .quick-action-btn.fund-btn:hover:not(:disabled) .action-icon {
          background: linear-gradient(135deg, rgba(34, 197, 94, 0.3), rgba(16, 185, 129, 0.35));
        }

        .quick-action-btn.swap-btn .action-icon {
          background: linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(245, 158, 11, 0.25));
          color: #fbbf24;
        }

        .quick-action-btn.swap-btn:hover:not(:disabled) .action-icon {
          background: linear-gradient(135deg, rgba(251, 191, 36, 0.3), rgba(245, 158, 11, 0.35));
        }

        .quick-action-btn.send-btn .action-icon {
          background: linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(59, 130, 246, 0.25));
          color: #22d3ee;
        }

        .quick-action-btn.send-btn:hover:not(:disabled) .action-icon {
          background: linear-gradient(135deg, rgba(6, 182, 212, 0.3), rgba(59, 130, 246, 0.35));
        }

        .quick-action-btn.receive-btn .action-icon {
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(168, 85, 247, 0.25));
          color: #a78bfa;
        }

        .quick-action-btn.receive-btn:hover:not(:disabled) .action-icon {
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(168, 85, 247, 0.35));
        }

        .quick-action-btn.refresh-btn .action-icon {
          background: rgba(55, 65, 81, 0.5);
          color: #9ca3af;
        }

        .quick-action-btn.refresh-btn:hover:not(:disabled) .action-icon {
          background: rgba(75, 85, 99, 0.6);
          color: #e5e7eb;
        }

        .quick-action-btn.refresh-btn svg.spinning {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .browse-swag-link:hover {
          background: linear-gradient(135deg, rgba(6, 182, 212, 0.3), rgba(139, 92, 246, 0.3));
          border-color: rgba(6, 182, 212, 0.6);
          transform: translateY(-1px);
        }
      `}</style>
    </div>
  );
};

export default WalletInfo; 