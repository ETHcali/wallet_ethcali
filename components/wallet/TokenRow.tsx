/**
 * TokenRow - Individual token display in the wallet
 */
import React from 'react';
import Image from 'next/image';
import { formatTokenBalance } from '../../utils/tokenUtils';

interface TokenRowProps {
  symbol: string;
  name: string;
  balance: string;
  valueUsd: number;
  logoUrl: string;
}

const TokenRow: React.FC<TokenRowProps> = ({
  symbol,
  name,
  balance,
  valueUsd,
  logoUrl,
}) => {
  const formatUsd = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  return (
    <div className="token-item">
      <div className="token-info">
        <Image
          src={logoUrl}
          alt={symbol}
          width={32}
          height={32}
          className="token-icon"
          unoptimized
        />
        <div className="token-details">
          <span className="token-name">{name}</span>
          <span className="token-symbol">{symbol}</span>
        </div>
      </div>
      <div className="token-balance">
        <div className="balance-amount">{formatTokenBalance(balance, 6)}</div>
        <div className="balance-usd">{formatUsd(valueUsd)}</div>
      </div>

      <style jsx>{`
        .token-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.875rem 1rem;
          background: rgba(17, 24, 39, 0.6);
          border-radius: 12px;
          border: 1px solid rgba(75, 85, 99, 0.2);
          transition: all 0.2s ease;
        }

        .token-item:hover {
          background: rgba(17, 24, 39, 0.8);
          border-color: rgba(75, 85, 99, 0.4);
        }

        .token-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .token-details {
          display: flex;
          flex-direction: column;
        }

        .token-name {
          font-size: 0.9rem;
          font-weight: 600;
          color: #f3f4f6;
        }

        .token-symbol {
          font-size: 0.75rem;
          color: #9ca3af;
          text-transform: uppercase;
        }

        .token-balance {
          text-align: right;
        }

        .balance-amount {
          font-size: 0.9rem;
          font-weight: 600;
          color: #f3f4f6;
          font-family: 'SF Mono', 'Menlo', monospace;
        }

        .balance-usd {
          font-size: 0.75rem;
          color: #9ca3af;
        }
      `}</style>
    </div>
  );
};

export default React.memo(TokenRow);
