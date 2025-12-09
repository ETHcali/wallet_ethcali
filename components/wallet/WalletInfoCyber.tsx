import React, { useState } from 'react';
import { Wallet, TokenBalance } from '../../types/index';
import { getTokenLogoUrl, formatTokenBalance } from '../../utils/tokenUtils';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import SendTokenModalTailwind from './SendTokenModalTailwind';
import QRScannerTailwind from './QRScannerTailwind';
import { parseUnits, encodeFunctionData } from 'viem';
import { useTokenPrices } from '../../hooks/useTokenPrices';
import NetworkSwitcher from '../NetworkSwitcher';

interface WalletInfoProps {
  wallet: Wallet;
  balances: TokenBalance;
  isLoading: boolean;
  onRefresh: () => void;
  chainId?: number;
  onChainChange?: (chainId: number) => void;
}

const WalletInfoCyber: React.FC<WalletInfoProps> = ({
  wallet,
  balances,
  isLoading,
  onRefresh,
  chainId = 8453,
  onChainChange
}) => {
  const { exportWallet } = usePrivy();
  const { wallets } = useWallets();
  const { getPriceForToken, isLoading: isPriceLoading } = useTokenPrices();
  
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [selectedToken, setSelectedToken] = useState<'ETH' | 'USDC' | 'EURC'>('ETH');
  const [isSendingTx, setIsSendingTx] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [scannedAddress, setScannedAddress] = useState<string | null>(null);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [showNetworks, setShowNetworks] = useState(false);
  
  const privyWallet = wallets?.find(w => w.address.toLowerCase() === wallet.address.toLowerCase());
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${wallet.address}`;
  
  const ethLogoUrl = getTokenLogoUrl('ETH');
  const usdcLogoUrl = getTokenLogoUrl('USDC');
  const eurcLogoUrl = getTokenLogoUrl('EURC');
  
  const explorerUrl = chainId === 1 ? 'https://etherscan.io' : 'https://basescan.org';
  
  // Get real prices from CoinGecko
  const ethPrice = getPriceForToken('ETH');
  const usdcPrice = getPriceForToken('USDC');
  const eurcPrice = getPriceForToken('EURC');
  
  console.log('💰 Live Prices from CoinGecko:', { 
    ETH: `$${ethPrice.price.toFixed(2)}`,
    USDC: `$${usdcPrice.price.toFixed(4)}`,
    EURC: `$${eurcPrice.price.toFixed(4)}`
  });
  
  const ethValueUsd = parseFloat(balances.ethBalance || '0') * ethPrice.price;
  const usdcValueUsd = parseFloat(balances.uscBalance || '0') * usdcPrice.price;
  const eurcValueUsd = parseFloat(balances.eurcBalance || '0') * eurcPrice.price;
  const totalValueUsd = ethValueUsd + usdcValueUsd + eurcValueUsd;
  
  const formatUsd = (value: number) => {
    if (isNaN(value) || !isFinite(value)) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const handleExportWallet = async () => {
    try {
      await exportWallet({ address: wallet.address });
    } catch (error) {
      console.error("Error exporting wallet:", error);
    }
  };

  const openSendModal = (token: 'ETH' | 'USDC' | 'EURC') => {
    setSelectedToken(token);
    setIsSendModalOpen(true);
    setTxHash(null);
  };

  const handleSendToken = async (recipient: string, amount: string) => {
    if (!privyWallet) {
      alert('Wallet not ready');
      return;
    }

    setIsSendingTx(true);
    setTxHash(null);

    try {
      // Get the provider from the wallet
      const provider = await privyWallet.getEthereumProvider();
      
      if (selectedToken === 'ETH') {
        const value = parseUnits(amount, 18);
        const valueHex = `0x${value.toString(16)}`;
        const tx = await provider.request({
          method: 'eth_sendTransaction',
          params: [{
            from: wallet.address,
            to: recipient,
            value: valueHex,
            chainId: chainId,
            gasMode: 'SPONSORED'
          }]
        });
        setTxHash(tx as string);
      } else if (selectedToken === 'USDC') {
        const USDC_ADDRESS = chainId === 1 
          ? '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' 
          : '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
        
        const transferAbi = [{
          constant: false,
          inputs: [
            { name: '_to', type: 'address' },
            { name: '_value', type: 'uint256' }
          ],
          name: 'transfer',
          outputs: [{ name: '', type: 'bool' }],
          type: 'function'
        }] as const;
        
        const usdcAmount = parseUnits(amount, 6);
        const data = encodeFunctionData({
          abi: transferAbi,
          functionName: 'transfer',
          args: [recipient as `0x${string}`, usdcAmount]
        });
        
        const tx = await provider.request({
          method: 'eth_sendTransaction',
          params: [{
            from: wallet.address,
            to: USDC_ADDRESS,
            data: data,
            chainId: chainId,
            gasMode: 'SPONSORED'
          }]
        });
        setTxHash(tx as string);
      } else if (selectedToken === 'EURC') {
        const EURC_ADDRESS = chainId === 1
          ? '0x1aBaEA1f7C830bD89Acc67eC4af516284b1bC33c'
          : '0x60a3E35Cc302bFA44Cb288Bc5a4F316Fdb1adb42';
        
        const transferAbi = [{
          constant: false,
          inputs: [
            { name: '_to', type: 'address' },
            { name: '_value', type: 'uint256' }
          ],
          name: 'transfer',
          outputs: [{ name: '', type: 'bool' }],
          type: 'function'
        }] as const;
        
        const eurcAmount = parseUnits(amount, 6);
        const data = encodeFunctionData({
          abi: transferAbi,
          functionName: 'transfer',
          args: [recipient as `0x${string}`, eurcAmount]
        });
        
        const tx = await provider.request({
          method: 'eth_sendTransaction',
          params: [{
            from: wallet.address,
            to: EURC_ADDRESS,
            data: data,
            chainId: chainId,
            gasMode: 'SPONSORED'
          }]
        });
        setTxHash(tx as string);
      }
      
      setTimeout(() => {
        onRefresh();
      }, 2000);
      
    } catch (error) {
      console.error('Transaction error:', error);
      alert(`Transaction failed: ${error.message || error}`);
    } finally {
      setIsSendingTx(false);
    }
  };

  return (
    <div className="relative bg-gradient-to-br from-gray-900 via-black to-gray-900 p-1 rounded-2xl shadow-2xl">
      {/* Cyber glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 rounded-2xl blur-xl"></div>
      
      <div className="relative bg-black p-6 rounded-2xl border border-cyan-500/30">
        {/* Header */}
        <div className="flex flex-col gap-3 mb-6">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent font-mono">
              WALLET_INTERFACE
            </h3>
            <div className="flex items-center gap-2">
              <button 
                onClick={onRefresh}
                disabled={isLoading}
                className="px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/50 rounded-lg text-cyan-400 text-sm font-mono transition-all"
              >
                {isLoading ? '⟳' : '↻'} SYNC
              </button>
            </div>
          </div>

          {/* Chain switcher + Export keys */}
          <div className="p-3 bg-gray-900/60 border border-cyan-500/30 rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowNetworks(!showNetworks)}
                  className="px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/50 rounded-lg text-cyan-300 text-xs font-mono transition-all"
                >
                  {showNetworks ? '▲ CHAINS' : '▼ CHAINS'}
                </button>
                <span className="text-xs text-gray-400 font-mono">Current: {chainId === 1 ? 'Ethereum' : chainId === 8453 ? 'Base' : chainId === 10 ? 'Optimism' : chainId}</span>
              </div>
              <button
                onClick={handleExportWallet}
                className="px-3 py-1.5 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 hover:from-cyan-500/30 hover:to-purple-500/30 border border-cyan-500/50 rounded-lg text-cyan-300 text-xs font-mono font-bold transition-all"
              >
                🔐 EXPORT_KEYS
              </button>
            </div>
            {showNetworks && (
              <div className="mt-3">
                <NetworkSwitcher
                  currentChainId={chainId}
                  onNetworkChange={(id) => {
                    if (onChainChange) onChainChange(id);
                    setShowNetworks(false);
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Address Display */}
        <div className="mb-6 p-4 bg-gray-900/50 border border-purple-500/30 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-mono mb-1">ADDRESS</p>
              <p className="text-cyan-400 font-mono text-sm">
                <a
                  href={`${explorerUrl}/address/${wallet.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  {formatAddress(wallet.address)}
                </a>
              </p>
              <p className="text-[11px] text-gray-500 font-mono">
                <a
                  href={`${explorerUrl}/address/${wallet.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  {wallet.address}
                </a>
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => navigator.clipboard.writeText(wallet.address)}
                className="px-3 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/50 rounded text-purple-400 text-xs font-mono"
              >
                COPY
              </button>
              <button
                onClick={() => setIsQRScannerOpen(true)}
                className="px-3 py-1.5 bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/50 rounded text-pink-400 text-xs font-mono"
              >
                SCAN_QR
              </button>
              <button
                onClick={() => setIsQRModalOpen(true)}
                className="px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/50 rounded text-cyan-400 text-xs font-mono"
              >
                QR
              </button>
            </div>
          </div>
        </div>

        {/* Total Balance - Cyber Style */}
        <div className="mb-6 p-6 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-500/50 rounded-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl"></div>
          <p className="text-xs text-gray-400 font-mono mb-2">TOTAL_BALANCE</p>
          <p className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent font-mono">
            {formatUsd(totalValueUsd)}
          </p>
          {isPriceLoading && (
            <p className="text-xs text-cyan-400 font-mono mt-2 animate-pulse">FETCHING LIVE PRICES...</p>
          )}
        </div>

        {/* Token List - Cyber Grid */}
        <div className="space-y-3 mb-6">
          {/* ETH */}
          <div className="group p-4 bg-gray-900/50 hover:bg-gray-900/70 border border-cyan-500/20 hover:border-cyan-500/50 rounded-xl transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full border-2 border-cyan-500/50 p-0.5">
                  <img src={ethLogoUrl} alt="ETH" className="w-full h-full rounded-full" />
                </div>
                <div>
                  <p className="font-mono text-cyan-400 font-bold">ETH</p>
                  <p className="text-xs text-gray-500 font-mono">Ethereum</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-mono text-white font-bold">{formatTokenBalance(balances.ethBalance, 6)}</p>
                <p className="text-sm text-cyan-400 font-mono">{formatUsd(ethValueUsd)}</p>
                <p className="text-xs text-gray-500 font-mono">@ {formatUsd(ethPrice.price)}</p>
              </div>
              <button
                onClick={() => openSendModal('ETH')}
                className="ml-4 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 rounded-lg text-cyan-400 font-mono text-sm transition-all"
              >
                SEND
              </button>
            </div>
          </div>

          {/* USDC */}
          <div className="group p-4 bg-gray-900/50 hover:bg-gray-900/70 border border-purple-500/20 hover:border-purple-500/50 rounded-xl transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full border-2 border-purple-500/50 p-0.5">
                  <img src={usdcLogoUrl} alt="USDC" className="w-full h-full rounded-full" />
                </div>
                <div>
                  <p className="font-mono text-purple-400 font-bold">USDC</p>
                  <p className="text-xs text-gray-500 font-mono">USD Coin</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-mono text-white font-bold">{formatTokenBalance(balances.uscBalance, 6)}</p>
                <p className="text-sm text-purple-400 font-mono">{formatUsd(usdcValueUsd)}</p>
                <p className="text-xs text-gray-500 font-mono">@ {formatUsd(usdcPrice.price)}</p>
              </div>
              <button
                onClick={() => openSendModal('USDC')}
                className="ml-4 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/50 rounded-lg text-purple-400 font-mono text-sm transition-all"
              >
                SEND
              </button>
            </div>
          </div>

          {/* EURC */}
          <div className="group p-4 bg-gray-900/50 hover:bg-gray-900/70 border border-pink-500/20 hover:border-pink-500/50 rounded-xl transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full border-2 border-pink-500/50 p-0.5">
                  <img src={eurcLogoUrl} alt="EURC" className="w-full h-full rounded-full" />
                </div>
                <div>
                  <p className="font-mono text-pink-400 font-bold">EURC</p>
                  <p className="text-xs text-gray-500 font-mono">Euro Coin</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-mono text-white font-bold">{formatTokenBalance(balances.eurcBalance, 6)}</p>
                <p className="text-sm text-pink-400 font-mono">{formatUsd(eurcValueUsd)}</p>
                <p className="text-xs text-gray-500 font-mono">@ {formatUsd(eurcPrice.price)}</p>
              </div>
              <button
                onClick={() => openSendModal('EURC')}
                className="ml-4 px-4 py-2 bg-pink-500/20 hover:bg-pink-500/30 border border-pink-500/50 rounded-lg text-pink-400 font-mono text-sm transition-all"
              >
                SEND
              </button>
            </div>
          </div>
        </div>

        {/* Transaction Success */}
        {txHash && (
          <div className="mt-4 p-4 bg-green-500/10 border border-green-500/50 rounded-xl">
            <p className="text-green-400 font-mono text-sm mb-2">✓ TX_SUCCESS</p>
            <a 
              href={`${explorerUrl}/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-green-400 font-mono hover:underline break-all"
            >
              {txHash}
            </a>
          </div>
        )}
      </div>

      {/* Modals */}
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

      {isQRScannerOpen && (
        <QRScannerTailwind
          onClose={() => setIsQRScannerOpen(false)}
          onScan={(address) => {
            setScannedAddress(address);
            setIsQRScannerOpen(false);
            setIsSendModalOpen(true);
          }}
        />
      )}

      {/* QR Modal */}
      {isQRModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="relative w-80 max-w-sm bg-gray-900 border border-cyan-500/40 rounded-2xl p-6 shadow-2xl">
            <button
              onClick={() => setIsQRModalOpen(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-white text-xl"
              aria-label="Close QR modal"
            >
              ×
            </button>
            <p className="text-xs text-gray-400 font-mono mb-3 text-center">WALLET_QR_CODE</p>
            <div className="flex justify-center">
              <div className="p-3 bg-white rounded-xl shadow-2xl border-2 border-cyan-500/30">
                <img 
                  src={qrCodeUrl} 
                  alt="Wallet QR Code" 
                  className="w-56 h-56"
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 font-mono mt-3 text-center">
              Scan to receive funds
            </p>
            <button
              onClick={() => navigator.clipboard.writeText(wallet.address)}
              className="mt-4 w-full px-4 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/50 rounded-lg text-cyan-400 text-xs font-mono transition-all"
            >
              COPY_ADDRESS
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletInfoCyber;


