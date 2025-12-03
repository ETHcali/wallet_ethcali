import React, { useState } from 'react';
import { Wallet, TokenBalance } from '../../types/index';
import Button from '../../components/shared/Button';
import Loading from '../../components/shared/Loading';
import { getTokenLogoUrl, getNetworkLogoUrl, formatTokenBalance } from '../../utils/tokenUtils';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import SendTokenModalTailwind from './SendTokenModalTailwind';
import QRScannerTailwind from './QRScannerTailwind';
import { parseUnits, encodeFunctionData } from 'viem';
import { useTokenPrices } from '../../hooks/useTokenPrices';

interface WalletInfoProps {
  wallet: Wallet;
  balances: TokenBalance;
  isLoading: boolean;
  onRefresh: () => void;
  chainId?: number;
}

const WalletInfoTailwind: React.FC<WalletInfoProps> = ({
  wallet,
  balances,
  isLoading,
  onRefresh,
  chainId = 8453
}) => {
  const { exportWallet } = usePrivy();
  const { wallets } = useWallets();
  const { getPriceForToken, isLoading: isPriceLoading } = useTokenPrices();
  
  // States for send token modal
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [selectedToken, setSelectedToken] = useState<'ETH' | 'USDC' | 'EURC'>('ETH');
  const [isSendingTx, setIsSendingTx] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  
  // State for QR scanner
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [scannedAddress, setScannedAddress] = useState<string | null>(null);
  
  // Get the actual wallet instance from Privy's useWallets hook
  const privyWallet = wallets?.find(w => w.address.toLowerCase() === wallet.address.toLowerCase());
  
  // Generate QR code URL using a public QR code service
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${wallet.address}`;
  
  // Get token logo URLs
  const ethLogoUrl = getTokenLogoUrl('ETH');
  const usdcLogoUrl = getTokenLogoUrl('USDC');
  const eurcLogoUrl = getTokenLogoUrl('EURC');
  
  // Network info
  const explorerUrl = chainId === 1 ? 'https://etherscan.io' : 'https://basescan.org';
  
  // Calculate USD values
  const ethPrice = getPriceForToken('ETH');
  const usdcPrice = getPriceForToken('USDC');
  const eurcPrice = getPriceForToken('EURC');
  
  // Debug: Log prices
  console.log('Token Prices from CoinGecko:', { 
    ETH: ethPrice.price, 
    USDC: usdcPrice.price, 
    EURC: eurcPrice.price,
    loading: isPriceLoading
  });
  
  const ethValueUsd = parseFloat(balances.ethBalance) * ethPrice.price;
  const usdcValueUsd = parseFloat(balances.uscBalance) * usdcPrice.price;
  const eurcValueUsd = parseFloat(balances.eurcBalance) * eurcPrice.price;
  const totalValueUsd = ethValueUsd + usdcValueUsd + eurcValueUsd;
  
  // Show loading or actual prices
  const displayPrice = (value: number, loading: boolean) => {
    if (loading) return '...';
    if (value === 0) return '$0.00';
    return formatUsd(value);
  };
  
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
  const openSendModal = (token: 'ETH' | 'USDC' | 'EURC') => {
    setSelectedToken(token);
    setIsSendModalOpen(true);
  };
  
  // Handle sending tokens
  const handleSendToken = async (recipient: string, amount: string) => {
    if (!privyWallet) {
      console.error("Wallet not found");
      return;
    }
    
    setIsSendingTx(true);
    setTxHash(null);
    
    try {
      // Get the provider from the wallet
      const provider = await privyWallet.getEthereumProvider();
      
      // Always use gas sponsorship with Biconomy paymaster when possible
      if (selectedToken === 'ETH') {
        // Request the provider to send a transaction with gas sponsorship metadata
        const value = parseUnits(amount, 18);
        const valueHex = `0x${value.toString(16)}`;
        
        const tx = await provider.request({
          method: 'eth_sendTransaction',
          params: [{
            from: wallet.address,
            to: recipient,
            value: valueHex,
            chainId: chainId,
            gasMode: 'SPONSORED' // Signal to use Biconomy sponsorship when available
          }]
        });
        
        setTxHash(tx as string);
        
      } else if (selectedToken === 'USDC') {
        // USDC contract
        const USDC_ADDRESS = chainId === 1 
          ? '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' 
          : '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
        
        // ERC20 transfer function ABI
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
        
        // Convert the amount to proper units (USDC has 6 decimals)
        const usdcAmount = parseUnits(amount, 6);
        
        // Encode the function call data using viem
        const data = encodeFunctionData({
          abi: transferAbi,
          functionName: 'transfer',
          args: [recipient as `0x${string}`, usdcAmount]
        });
        
        // Create the transaction
        const tx = await provider.request({
          method: 'eth_sendTransaction',
          params: [{
            from: wallet.address,
            to: USDC_ADDRESS,
            data: data,
            chainId: chainId,
            gasMode: 'SPONSORED' // Signal to use Biconomy sponsorship when available
          }]
        });
        
        setTxHash(tx as string);
      } else if (selectedToken === 'EURC') {
        // EURC contract
        const EURC_ADDRESS = chainId === 1
          ? '0x1aBaEA1f7C830bD89Acc67eC4af516284b1bC33c'
          : '0x60a3E35Cc302bFA44Cb288Bc5a4F316Fdb1adb42';
        
        // ERC20 transfer function ABI
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
        
        // Convert the amount to proper units (EURC has 6 decimals)
        const eurcAmount = parseUnits(amount, 6);
        
        // Encode the function call data using viem
        const data = encodeFunctionData({
          abi: transferAbi,
          functionName: 'transfer',
          args: [recipient as `0x${string}`, eurcAmount]
        });
        
        // Create the transaction
        const tx = await provider.request({
          method: 'eth_sendTransaction',
          params: [{
            from: wallet.address,
            to: EURC_ADDRESS,
            data: data,
            chainId: chainId,
            gasMode: 'SPONSORED' // Signal to use Biconomy sponsorship when available
          }]
        });
        
        setTxHash(tx as string);
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
    <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg shadow-lg mt-4">
      <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Your Wallet</h3>
      
      {/* Wallet Address Container */}
      <div className="bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 shadow p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-start">
          {/* QR Code Container */}
          <div className="flex flex-col items-center mb-6 md:mb-0 md:mr-6">
            <div className="bg-white p-2 rounded-lg shadow border border-gray-200">
              <img src={qrCodeUrl} alt="Wallet Address QR Code" className="w-36 h-36" />
            </div>
            <p className="text-xs text-gray-500 mt-2">Scan to view or send funds</p>
          </div>
          
          {/* Address Details */}
          <div className="w-full">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-lg font-medium text-gray-700 dark:text-gray-300">Wallet Address</h4>
              <button 
                onClick={handleExportWallet}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <span className="text-xs">🔑</span>
                Export Wallet
              </button>
            </div>
            
            <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md border border-gray-200 dark:border-gray-600 mb-3">
              <p className="font-mono text-sm break-all text-gray-800 dark:text-gray-200 select-all overflow-hidden truncate">
                {wallet.address}
              </p>
              <div className="flex gap-4 mt-2">
                <button 
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                  onClick={() => {
                    navigator.clipboard.writeText(wallet.address);
                  }}
                >
                  📋 Copy
                </button>
                <a 
                  href={`${explorerUrl}/address/${wallet.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                >
                  🔍 View
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Balances Section */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-lg font-medium text-gray-800 dark:text-white">Balances</h4>
          <div className="flex gap-2 flex-col sm:flex-row">
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
            >
              <span>🔄</span> Refresh
            </button>
            <button
              onClick={openQRScanner}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              <span>📷</span> Scan Wallet
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-8">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">Loading balances...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* ETH Balance */}
            <div className="bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 p-4 shadow-sm hover:shadow transition-shadow duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img src={ethLogoUrl} alt="ETH" className="w-10 h-10 rounded-full" />
                  <div>
                    <div className="font-medium text-gray-800 dark:text-gray-200">Ethereum</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">ETH</div>
                  </div>
                </div>
                <div className="flex-1 sm:text-right">
                  <div className="font-semibold text-lg text-gray-800 dark:text-white">
                    {formatTokenBalance(balances.ethBalance, 6)}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {displayPrice(ethValueUsd, isPriceLoading)}
                  </div>
                  <div className="text-xs text-gray-400 dark:text-gray-500">
                    @ {displayPrice(ethPrice.price, isPriceLoading)}
                  </div>
                </div>
                <button 
                  onClick={() => openSendModal('ETH')} 
                  className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
                >
                  Send
                </button>
              </div>
            </div>
            
            {/* USDC Balance */}
            <div className="bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 p-4 shadow-sm hover:shadow transition-shadow duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img src={usdcLogoUrl} alt="USDC" className="w-10 h-10 rounded-full" />
                  <div>
                    <div className="font-medium text-gray-800 dark:text-gray-200">USD Coin</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">USDC</div>
                  </div>
                </div>
                <div className="flex-1 sm:text-right">
                  <div className="font-semibold text-lg text-gray-800 dark:text-white">
                    {formatTokenBalance(balances.uscBalance, 6)}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {displayPrice(usdcValueUsd, isPriceLoading)}
                  </div>
                  <div className="text-xs text-gray-400 dark:text-gray-500">
                    @ {displayPrice(usdcPrice.price, isPriceLoading)}
                  </div>
                </div>
                <button 
                  onClick={() => openSendModal('USDC')} 
                  className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
                >
                  Send
                </button>
              </div>
            </div>
            
            {/* EURC Balance */}
            <div className="bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 p-4 shadow-sm hover:shadow transition-shadow duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img src={eurcLogoUrl} alt="EURC" className="w-10 h-10 rounded-full" />
                  <div>
                    <div className="font-medium text-gray-800 dark:text-gray-200">Euro Coin</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">EURC</div>
                  </div>
                </div>
                <div className="flex-1 sm:text-right">
                  <div className="font-semibold text-lg text-gray-800 dark:text-white">
                    {formatTokenBalance(balances.eurcBalance, 6)}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {displayPrice(eurcValueUsd, isPriceLoading)}
                  </div>
                  <div className="text-xs text-gray-400 dark:text-gray-500">
                    @ {displayPrice(eurcPrice.price, isPriceLoading)}
                  </div>
                </div>
                <button 
                  onClick={() => openSendModal('EURC')} 
                  className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
                >
                  Send
                </button>
              </div>
            </div>
            
            {/* Total Balance */}
            <div className="flex justify-between items-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="font-medium text-gray-700 dark:text-gray-300">Total Value</div>
              <div className="font-bold text-xl text-gray-800 dark:text-white">{formatUsd(totalValueUsd)}</div>
            </div>
          </div>
        )}
      </div>
      
      {/* Transaction Receipt */}
      {txHash && (
        <div className="mb-6 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800 overflow-hidden shadow-sm">
          <div className="flex items-center gap-3 p-4 bg-green-100 dark:bg-green-800/30 border-b border-green-200 dark:border-green-800">
            <div className="flex items-center justify-center w-6 h-6 bg-green-600 text-white rounded-full font-bold text-sm">✓</div>
            <h4 className="text-green-800 dark:text-green-400 font-medium">Transaction Sent</h4>
          </div>
          <div className="p-4">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Transaction Hash:</span>
              <code className="p-1.5 bg-gray-100 dark:bg-gray-700 rounded text-sm font-mono">
                {txHash.substring(0, 10)}...{txHash.substring(txHash.length - 8)}
              </code>
              <a 
                href={`${explorerUrl}/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
              >
                View on Explorer
              </a>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Your transaction has been submitted to the network. It may take a few moments to be confirmed.
            </p>
          </div>
        </div>
      )}
      
      {/* QR Scanner */}
      {isQRScannerOpen && (
        <QRScannerTailwind 
          onScan={handleQRScan} 
          onClose={() => setIsQRScannerOpen(false)} 
        />
      )}
      
      {/* Send Token Modal */}
      {isSendModalOpen && (
        <SendTokenModalTailwind
          onClose={() => setIsSendModalOpen(false)}
          onSend={handleSendToken}
          tokenType={selectedToken}
          balance={selectedToken === 'ETH' ? balances.ethBalance : selectedToken === 'USDC' ? balances.uscBalance : balances.eurcBalance}
          isSending={isSendingTx}
          txHash={txHash}
          initialRecipient={scannedAddress || ''}
        />
      )}
    </div>
  );
};

export default WalletInfoTailwind; 