import React, { useState } from 'react';
import Image from 'next/image';
import { Wallet, TokenBalance } from '../../types/index';
import Button from '../../components/shared/Button';
import Loading from '../../components/shared/Loading';
import { getTokenLogoUrl, getNetworkLogoUrl, formatTokenBalance } from '../../utils/tokenUtils';
import { usePrivy, useWallets, useSendTransaction } from '@privy-io/react-auth';
import SendTokenModal from './SendTokenModal';
import QRScanner from './QRScanner';
import { parseUnits, encodeFunctionData } from 'viem';
import { useTokenPrices } from '../../hooks/useTokenPrices';
import { useActiveWallet } from '../../hooks/useActiveWallet';

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
  const { exportWallet } = usePrivy();
  const { wallets } = useWallets();
  const { sendTransaction } = useSendTransaction();
  const { getPriceForToken } = useTokenPrices();
  const { wallet: activeWallet, canUseSponsoredGas, isEmbeddedWallet, walletClientType } = useActiveWallet();
  
  // States for send token modal
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [selectedToken, setSelectedToken] = useState<'ETH' | 'USDC'>('ETH');
  const [isSendingTx, setIsSendingTx] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  
  // New state for QR scanner
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [scannedAddress, setScannedAddress] = useState<string | null>(null);
  
  // Get the actual wallet instance from Privy's useWallets hook
  const privyWallet = wallets?.find(w => w.address.toLowerCase() === wallet.address.toLowerCase());
  
  // Generate QR code URL using a public QR code service
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${wallet.address}`;
  
  // Get token logo URLs from CoinGecko
  const ethLogoUrl = getTokenLogoUrl('ETH');
  const usdcLogoUrl = getTokenLogoUrl('USDC');
  const eurclogoUrl = getTokenLogoUrl('EURC');
  
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
  
  const ethValueUsd = parseFloat(balances.ethBalance) * ethPrice.price;
  const usdcValueUsd = parseFloat(balances.uscBalance) * usdcPrice.price;
  const totalValueUsd = ethValueUsd + usdcValueUsd;
  
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
      console.error("Error exporting wallet:", error);
    }
  };
  
  // Handle opening the send token modal
  const openSendModal = (token: 'ETH' | 'USDC') => {
    setSelectedToken(token);
    setIsSendModalOpen(true);
  };
  
  // Handle sending tokens
  const handleSendToken = async (recipient: string, amount: string) => {
    // Use active wallet from useActiveWallet hook (the wallet user logged in with)
    const walletToUse = activeWallet || privyWallet;
    
    if (!walletToUse) {
      console.error("No wallet found");
      return;
    }
    
    const walletIsEmbedded = walletToUse.walletClientType === 'privy';
    
    console.log('Sending transaction:', {
      address: walletToUse.address,
      type: walletToUse.walletClientType,
      isEmbedded: walletIsEmbedded,
      willSponsorGas: walletIsEmbedded // Sponsorship only for embedded
    });
    
    setIsSendingTx(true);
    setTxHash(null);
    
    try {
      if (walletIsEmbedded) {
        // Embedded wallet - use Privy's sendTransaction with gas sponsorship
        if (selectedToken === 'ETH') {
          const value = parseUnits(amount, 18);
          const result = await sendTransaction(
            {
              to: recipient as `0x${string}`,
              value,
            },
            {
              sponsor: true, // Always sponsor for embedded wallets
            } as any
          );
          setTxHash(result.hash);
        } else if (selectedToken === 'USDC') {
          const USDC_ADDRESS = '0x0b2c639c533813f4aa9d7837caf62653d097ff85';
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
          
          const usdcAmount = parseUnits(amount, 6);
          const data = encodeFunctionData({
            abi: transferAbi,
            functionName: 'transfer',
            args: [recipient as `0x${string}`, usdcAmount]
          });
          
          const result = await sendTransaction(
            {
              to: USDC_ADDRESS as `0x${string}`,
              data,
            },
            {
              sponsor: true, // Always sponsor for embedded wallets
            } as any
          );
          setTxHash(result.hash);
        }
      } else {
        // External wallet (MetaMask, etc.) - use provider directly, user pays gas
        const provider = await walletToUse.getEthereumProvider();
        
        if (selectedToken === 'ETH') {
          const value = parseUnits(amount, 18);
          const txHash = await provider.request({
            method: 'eth_sendTransaction',
            params: [{
              from: walletToUse.address,
              to: recipient,
              value: `0x${value.toString(16)}`,
            }],
          });
          setTxHash(txHash as string);
        } else if (selectedToken === 'USDC') {
          const USDC_ADDRESS = '0x0b2c639c533813f4aa9d7837caf62653d097ff85';
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
          
          const usdcAmount = parseUnits(amount, 6);
          const data = encodeFunctionData({
            abi: transferAbi,
            functionName: 'transfer',
            args: [recipient as `0x${string}`, usdcAmount]
          });
          
          const txHash = await provider.request({
            method: 'eth_sendTransaction',
            params: [{
              from: walletToUse.address,
              to: USDC_ADDRESS,
              data,
            }],
          });
          setTxHash(txHash as string);
        }
      }
      
      // Refresh balances after successful transaction
      onRefresh();
      
    } catch (error) {
      console.error("Error sending transaction:", error);
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
  
  return (
    <div className="wallet-info">
      <h3>Your Wallet</h3>
      
      <div className="wallet-address-container">
        <div className="qr-code-container">
          <div className="qr-code">
            <Image src={qrCodeUrl} alt="Wallet Address QR Code" width={150} height={150} unoptimized />
          </div>
          <p className="qr-help">Scan to view or send funds</p>
        </div>
        <div className="address-details">
          <div className="address-header">
            <h4>Wallet Address</h4>
            <Button 
              onClick={handleExportWallet}
              size="small" 
              variant="outline"
              className="export-button"
            >
              Export Wallet
            </Button>
          </div>
          
          <div className="address-display">
            <p className="wallet-address">{wallet.address}</p>
            <div className="address-actions">
              <button 
                className="copy-button"
                onClick={() => {
                  navigator.clipboard.writeText(wallet.address);
                }}
              >
                Copy
              </button>
              {explorerBase && (
                <a 
                  href={`${explorerBase}/address/${wallet.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="view-button"
                >
                  View on Explorer
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="balance-section">
        <div className="balance-header">
          <h4>Balances</h4>
          <div className="balance-actions">
            <Button
              onClick={onRefresh}
              size="small"
              variant="outline"
              className="refresh-button"
              disabled={isLoading}
            >
              Refresh
            </Button>
            <Button
              onClick={openQRScanner}
              size="small"
              variant="outline"
              className="scan-button"
            >
              Scan Wallet
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="loading-balances">
            <Loading size="small" text="Loading balances..." />
          </div>
        ) : (
          <div className="token-list">
             {/* Total Balance - Featured */}
            <div className="total-balance-featured">
              <div className="total-balance-content">
                <div className="total-label">Total Portfolio Value</div>
                <div className="total-amount-large">{formatUsd(totalValueUsd)}</div>
              </div>
              <div className="portfolio-breakdown">
                <span className="breakdown-item">
                  <Image src={ethLogoUrl} alt="ETH" width={16} height={16} className="breakdown-icon" unoptimized />
                  {formatUsd(ethValueUsd)}
                </span>
                <span className="breakdown-divider">+</span>
                <span className="breakdown-item">
                  <Image src={usdcLogoUrl} alt="USDC" width={16} height={16} className="breakdown-icon" unoptimized />
                  {formatUsd(usdcValueUsd)}
                </span>
              </div>
            </div>
            {/* ETH Balance */}
            <div className="token-item">
              <div className="token-info">
                <Image src={ethLogoUrl} alt="ETH" width={40} height={40} className="token-icon" unoptimized />
                <div className="token-details">
                  <span className="token-name">Ethereum</span>
                  <span className="token-symbol">ETH</span>
                </div>
              </div>
              <div className="token-balance">
                <div className="balance-amount">{formatTokenBalance(balances.ethBalance, 6)}</div>
                <div className="balance-usd">{formatUsd(ethValueUsd)}</div>
              </div>
              <div className="token-actions">
                <Button onClick={() => openSendModal('ETH')} size="small" variant="primary">
                  Send
                </Button>
              </div>
            </div>
            
            {/* USDC Balance */}
            <div className="token-item">
              <div className="token-info">
                <Image src={usdcLogoUrl} alt="USDC" width={40} height={40} className="token-icon" unoptimized />
                <div className="token-details">
                  <span className="token-name">USD Coin</span>
                  <span className="token-symbol">USDC</span>
                </div>
              </div>
              <div className="token-balance">
                <div className="balance-amount">{formatTokenBalance(balances.uscBalance, 6)}</div>
                <div className="balance-usd">{formatUsd(usdcValueUsd)}</div>
              </div>
              <div className="token-actions">
                <Button onClick={() => openSendModal('USDC')} size="small" variant="primary">
                  Send
                </Button>
              </div>
            </div>

            

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
          tokenType={selectedToken}
          balance={selectedToken === 'ETH' ? balances.ethBalance : balances.uscBalance}
          isSending={isSendingTx}
          txHash={txHash}
          initialRecipient={scannedAddress || ''}
          chainId={chainId}
        />
      )}
      
      <style jsx>{`
        .wallet-info {
          background: transparent;
          padding: 1.5rem;
          border-radius: 8px;
          margin-top: 1rem;
          position: relative;
        }
        
        /* removed network indicator styles */
        
        h3 {
          margin: 0 0 1rem 0;
          color: #e5e7eb;
        }
        
        .wallet-address-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 1.5rem;
          background: rgba(17, 24, 39, 0.8);
          border-radius: 12px;
          border: 1px solid rgba(6, 182, 212, 0.2);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
          padding: 1.5rem;
        }
        
        .qr-code-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 1.5rem;
        }
        
        .qr-code {
          background: white;
          padding: 10px;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(6, 182, 212, 0.3);
        }
        
        .qr-code img {
          display: block;
          width: 150px;
          height: 150px;
        }
        
        .qr-help {
          margin: 0.5rem 0 0 0;
          font-size: 0.85rem;
          color: #9ca3af;
        }
        
        .address-details {
          width: 100%;
        }
        
        .address-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
        }
        
        .address-header h4 {
          margin: 0;
          color: #e5e7eb;
        }
        
        .export-button {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.25rem 0.75rem;
          border-radius: 6px;
          font-size: 0.85rem;
        }
        
        .export-icon {
          font-size: 0.9rem;
        }
        
        .address-display {
          position: relative;
          display: flex;
          align-items: center;
          background: rgba(31, 41, 55, 0.8);
          padding: 0.75rem 1rem;
          border-radius: 8px;
          border: 1px solid rgba(6, 182, 212, 0.2);
          margin-bottom: 0.75rem;
        }
        
        .wallet-address {
          flex: 1;
          font-family: monospace;
          overflow-wrap: break-word;
          font-size: 0.9rem;
          color: #06b6d4;
          user-select: all;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .copy-button {
          background: rgba(6, 182, 212, 0.1);
          border: 1px solid rgba(6, 182, 212, 0.3);
          cursor: pointer;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #06b6d4;
          transition: all 0.2s;
          font-size: 0.85rem;
        }
        
        .copy-button:hover {
          background-color: rgba(6, 182, 212, 0.2);
        }
        
        .view-button {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          color: #a855f7;
          text-decoration: none;
          font-size: 0.85rem;
          padding: 0.5rem 1rem;
          border: 1px solid rgba(168, 85, 247, 0.3);
          border-radius: 6px;
          background: rgba(168, 85, 247, 0.1);
          transition: all 0.2s;
        }
        
        .view-button:hover {
          background: rgba(168, 85, 247, 0.2);
        }
        
        .address-actions {
          display: flex;
          gap: 1rem;
        }
        
        .balance-section {
          margin-top: 2rem;
        }
        
        .balance-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1rem;
        }
        
        .balance-header h4 {
          margin: 0;
          color: #e5e7eb;
        }
        
        .balance-actions {
          display: flex;
          gap: 8px;
        }
        
        .refresh-button {
          width: 100%;
          border-radius: 8px;
          font-weight: 500;
          margin-top: 0.5rem;
        }
        
        .scan-button {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        
        .loading-balances {
          margin-top: 1rem;
          text-align: center;
          color: #9ca3af;
        }
        
        .token-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        
        .token-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background: rgba(17, 24, 39, 0.8);
          border-radius: 12px;
          border: 1px solid rgba(6, 182, 212, 0.2);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
          transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
        }
        
        .token-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.4);
          border-color: rgba(6, 182, 212, 0.4);
        }
        
        .token-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        
        .token-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          object-fit: contain;
        }
        
        .token-details {
          display: flex;
          flex-direction: column;
        }
        
        .token-name {
          font-weight: 500;
          color: #e5e7eb;
        }
        
        .token-symbol {
          font-size: 0.8rem;
          color: #9ca3af;
        }
        
        .token-balance {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }
        
        .balance-amount {
          font-weight: 600;
          font-size: 1.1rem;
          color: #06b6d4;
        }
        
        .balance-usd {
          font-size: 0.85rem;
          color: #9ca3af;
          margin-top: 0.2rem;
        }
        
        .token-actions {
          display: flex;
          gap: 0.75rem;
        }
        
        .total-balance-featured {
          background: linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%);
          border: 1px solid rgba(6, 182, 212, 0.4);
          border-radius: 16px;
          padding: 1.5rem;
          margin-bottom: 1rem;
          text-align: center;
        }
        
        .total-balance-content {
          margin-bottom: 1rem;
        }
        
        .total-label {
          font-size: 0.875rem;
          font-weight: 500;
          color: #9ca3af;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.5rem;
        }
        
        .total-amount-large {
          font-weight: 800;
          font-size: 2.5rem;
          background: linear-gradient(135deg, #06b6d4 0%, #8b5cf6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1.2;
        }
        
        .portfolio-breakdown {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 0.75rem;
          padding-top: 1rem;
          border-top: 1px solid rgba(6, 182, 212, 0.2);
        }
        
        .breakdown-item {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          font-size: 0.875rem;
          color: #9ca3af;
        }
        
        .breakdown-icon {
          width: 16px;
          height: 16px;
          border-radius: 50%;
        }
        
        .breakdown-divider {
          color: #4b5563;
          font-weight: 500;
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
        
        @media (min-width: 768px) {
          .wallet-address-container {
            flex-direction: row;
            align-items: flex-start;
          }
          
          .qr-code-container {
            margin-right: 1.5rem;
            margin-bottom: 0;
          }
          
          .address-details {
            flex: 1;
          }
        }
        
        @media (max-width: 768px) {
          .wallet-address-container {
            flex-direction: column;
            align-items: center;
          }
          
          .qr-code-container {
            margin-bottom: 1.5rem;
          }
          
          .address-details {
            width: 100%;
          }
          
          .token-item {
            padding: 0.75rem;
          }
          
          .token-icon {
            width: 32px;
            height: 32px;
          }
          
          .token-name {
            font-size: 0.9rem;
          }
          
          .balance-amount {
            font-size: 1rem;
          }
          
          .balance-usd {
            font-size: 0.8rem;
          }
        }
        
        @media (max-width: 480px) {
          .balance-actions {
            flex-direction: column;
            align-items: flex-end;
            gap: 6px;
          }
          
          .scan-button,
          .refresh-button {
            font-size: 0.75rem;
            padding: 4px 8px;
          }
          
          .token-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.75rem;
          }
          
          .token-info {
            width: 100%;
          }
          
          .token-balance {
            width: 100%;
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
          }
          
          .token-actions {
            width: 100%;
          }
          
          .token-actions button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default WalletInfo; 