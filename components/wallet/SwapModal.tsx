import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { useSendTransaction } from '@privy-io/react-auth';
import { useSwapQuote } from '../../hooks/useSwapQuote';
import { getPopularTokens, parseTokenAmount, formatTokenAmount } from '../../lib/lifi';
import { logger } from '../../utils/logger';

interface SwapModalProps {
  onClose: () => void;
  userAddress: string;
  chainId: number;
  onSuccess?: () => void;
}

interface TokenOption {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
}

export default function SwapModal({ onClose, userAddress, chainId, onSuccess }: SwapModalProps) {
  const { sendTransaction } = useSendTransaction();

  // Token lists
  const tokens = useMemo(() => getPopularTokens(chainId), [chainId]);

  // Form state
  const [fromToken, setFromToken] = useState<TokenOption>(tokens[0]); // ETH
  const [toToken, setToToken] = useState<TokenOption>(tokens[1]); // USDC
  const [fromAmount, setFromAmount] = useState('');
  const [showFromTokenList, setShowFromTokenList] = useState(false);
  const [showToTokenList, setShowToTokenList] = useState(false);

  // Transaction state
  const [isSwapping, setIsSwapping] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Reset tokens when chain changes
  useEffect(() => {
    const newTokens = getPopularTokens(chainId);
    setFromToken(newTokens[0]);
    setToToken(newTokens[1]);
  }, [chainId]);

  // Calculate from amount in smallest unit
  const fromAmountWei = useMemo(() => {
    if (!fromAmount || isNaN(parseFloat(fromAmount))) return '';
    try {
      return parseTokenAmount(fromAmount, fromToken.decimals);
    } catch {
      return '';
    }
  }, [fromAmount, fromToken.decimals]);

  // Fetch quote
  const { quote, isLoading: isQuoteLoading, error: quoteError } = useSwapQuote({
    fromChain: chainId,
    toChain: chainId, // Same chain swap
    fromToken: fromToken.address,
    toToken: toToken.address,
    fromAmount: fromAmountWei,
    fromAddress: userAddress,
    enabled: !!fromAmountWei && fromAmountWei !== '0',
  });

  // Formatted output amount
  const toAmount = useMemo(() => {
    if (!quote?.estimate?.toAmount) return '';
    return formatTokenAmount(quote.estimate.toAmount, toToken.decimals);
  }, [quote, toToken.decimals]);

  // Swap from/to tokens
  const handleSwapDirection = () => {
    const tempToken = fromToken;
    setFromToken(toToken);
    setToToken(tempToken);
    setFromAmount('');
  };

  // Select token
  const handleSelectToken = (token: TokenOption, isFrom: boolean) => {
    if (isFrom) {
      // If selecting same as toToken, swap them
      if (token.address === toToken.address) {
        setToToken(fromToken);
      }
      setFromToken(token);
      setShowFromTokenList(false);
    } else {
      // If selecting same as fromToken, swap them
      if (token.address === fromToken.address) {
        setFromToken(toToken);
      }
      setToToken(token);
      setShowToTokenList(false);
    }
  };

  // Execute swap
  const handleSwap = async () => {
    if (!quote?.transactionRequest) {
      setError('No quote available');
      return;
    }

    setError(null);
    setIsSwapping(true);
    setTxHash(null);

    try {
      logger.tx('Executing swap', { chainId, status: 'pending' });

      const result = await sendTransaction(
        {
          to: quote.transactionRequest.to as `0x${string}`,
          data: quote.transactionRequest.data as `0x${string}`,
          value: BigInt(quote.transactionRequest.value || '0'),
          chainId,
        },
        { sponsor: true }
      );

      setTxHash(result.hash);
      logger.tx('Swap successful', { hash: result.hash, chainId, status: 'success' });

      // Callback after success
      if (onSuccess) {
        setTimeout(onSuccess, 2000);
      }
    } catch (err) {
      logger.error('Swap failed', err);
      setError(err instanceof Error ? err.message : 'Swap failed');
    } finally {
      setIsSwapping(false);
    }
  };

  // Get explorer URL
  const getExplorerUrl = (hash: string) => {
    switch (chainId) {
      case 1: return `https://etherscan.io/tx/${hash}`;
      case 10: return `https://optimism.etherscan.io/tx/${hash}`;
      case 8453: return `https://basescan.org/tx/${hash}`;
      default: return `https://basescan.org/tx/${hash}`;
    }
  };

  const canSwap = quote && !isQuoteLoading && !isSwapping && fromAmountWei && fromAmountWei !== '0';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-white">Swap</h2>
          <button
            onClick={onClose}
            disabled={isSwapping}
            className="text-slate-400 hover:text-white transition p-1"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 space-y-3">
          {/* From Token */}
          <div className="rounded-xl bg-slate-800 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400">You pay</span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={fromAmount}
                onChange={(e) => setFromAmount(e.target.value)}
                placeholder="0"
                className="flex-1 bg-transparent text-2xl font-medium text-white outline-none placeholder-slate-500"
                disabled={isSwapping}
              />
              <button
                onClick={() => setShowFromTokenList(!showFromTokenList)}
                disabled={isSwapping}
                className="flex items-center gap-2 rounded-full bg-slate-700 px-3 py-2 hover:bg-slate-600 transition"
              >
                {fromToken.logoURI && (
                  <Image src={fromToken.logoURI} alt={fromToken.symbol} width={24} height={24} className="rounded-full" unoptimized />
                )}
                <span className="font-medium text-white">{fromToken.symbol}</span>
                <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            {/* From Token Dropdown */}
            {showFromTokenList && (
              <div className="mt-3 rounded-lg bg-slate-700 p-2 max-h-48 overflow-y-auto">
                {tokens.map((token) => (
                  <button
                    key={token.address}
                    onClick={() => handleSelectToken(token, true)}
                    className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-slate-600 transition"
                  >
                    {token.logoURI && (
                      <Image src={token.logoURI} alt={token.symbol} width={28} height={28} className="rounded-full" unoptimized />
                    )}
                    <div className="text-left">
                      <p className="font-medium text-white">{token.symbol}</p>
                      <p className="text-xs text-slate-400">{token.name}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Swap Direction Button */}
          <div className="flex justify-center -my-1 relative z-10">
            <button
              onClick={handleSwapDirection}
              disabled={isSwapping}
              className="rounded-full bg-slate-700 border-4 border-slate-900 p-2 hover:bg-slate-600 transition"
            >
              <svg className="h-5 w-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            </button>
          </div>

          {/* To Token */}
          <div className="rounded-xl bg-slate-800 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400">You receive</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 text-2xl font-medium text-white">
                {isQuoteLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
                    <span className="text-slate-500 text-lg">Fetching...</span>
                  </div>
                ) : toAmount ? (
                  toAmount
                ) : (
                  <span className="text-slate-500">0</span>
                )}
              </div>
              <button
                onClick={() => setShowToTokenList(!showToTokenList)}
                disabled={isSwapping}
                className="flex items-center gap-2 rounded-full bg-slate-700 px-3 py-2 hover:bg-slate-600 transition"
              >
                {toToken.logoURI && (
                  <Image src={toToken.logoURI} alt={toToken.symbol} width={24} height={24} className="rounded-full" unoptimized />
                )}
                <span className="font-medium text-white">{toToken.symbol}</span>
                <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            {/* To Token Dropdown */}
            {showToTokenList && (
              <div className="mt-3 rounded-lg bg-slate-700 p-2 max-h-48 overflow-y-auto">
                {tokens.map((token) => (
                  <button
                    key={token.address}
                    onClick={() => handleSelectToken(token, false)}
                    className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-slate-600 transition"
                  >
                    {token.logoURI && (
                      <Image src={token.logoURI} alt={token.symbol} width={28} height={28} className="rounded-full" unoptimized />
                    )}
                    <div className="text-left">
                      <p className="font-medium text-white">{token.symbol}</p>
                      <p className="text-xs text-slate-400">{token.name}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quote Details */}
          {quote && (
            <div className="rounded-lg bg-slate-800/50 p-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Rate</span>
                <span className="text-white">
                  1 {fromToken.symbol} ≈ {(parseFloat(toAmount) / parseFloat(fromAmount)).toFixed(4)} {toToken.symbol}
                </span>
              </div>
              {quote.estimate?.gasCosts?.[0] && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Network fee</span>
                  <span className="text-white">
                    ~${parseFloat(quote.estimate.gasCosts[0].amountUSD || '0').toFixed(2)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Route</span>
                <span className="text-cyan-400">{quote.tool}</span>
              </div>
            </div>
          )}

          {/* Error */}
          {(error || quoteError) && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-3">
              <p className="text-sm text-red-400">{error || quoteError?.message}</p>
            </div>
          )}

          {/* Success */}
          {txHash && (
            <div className="rounded-lg bg-green-500/10 border border-green-500/30 p-3">
              <p className="text-sm text-green-400 mb-2">Swap submitted successfully!</p>
              <a
                href={getExplorerUrl(txHash)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-cyan-400 hover:text-cyan-300 underline"
              >
                View on Explorer →
              </a>
            </div>
          )}

          {/* Swap Button */}
          <button
            onClick={handleSwap}
            disabled={!canSwap}
            className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 py-4 font-semibold text-white shadow-lg shadow-cyan-500/20 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {isSwapping ? (
              <span className="flex items-center justify-center gap-2">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Swapping...
              </span>
            ) : !fromAmount || fromAmount === '0' ? (
              'Enter amount'
            ) : isQuoteLoading ? (
              'Getting quote...'
            ) : quoteError ? (
              'Unable to swap'
            ) : (
              'Swap'
            )}
          </button>

          {/* Powered by LiFi */}
          <p className="text-center text-xs text-slate-500">
            Powered by <a href="https://li.fi" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300">LI.FI</a>
          </p>
        </div>
      </div>
    </div>
  );
}
