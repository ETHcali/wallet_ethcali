/**
 * TokenList - Display all tokens in the wallet
 */
import React from 'react';
import TokenRow from './TokenRow';
import { getTokenLogoUrl } from '../../utils/tokenUtils';
import { useTokenPrices } from '../../hooks/useTokenPrices';

interface TokenData {
  symbol: string;
  name: string;
  balance: string;
}

interface TokenListProps {
  tokens: TokenData[];
}

const TOKEN_CONFIG: Record<string, { name: string }> = {
  ETH: { name: 'Ethereum' },
  USDC: { name: 'USD Coin' },
  USDT: { name: 'Tether USD' },
  EURC: { name: 'Euro Coin' },
};

const TokenList: React.FC<TokenListProps> = ({ tokens }) => {
  const { getPriceForToken } = useTokenPrices();

  return (
    <div className="token-list">
      {tokens.map((token) => {
        const price = getPriceForToken(token.symbol);
        const valueUsd = parseFloat(token.balance) * price.price;
        const config = TOKEN_CONFIG[token.symbol] || { name: token.symbol };

        return (
          <TokenRow
            key={token.symbol}
            symbol={token.symbol}
            name={config.name}
            balance={token.balance}
            valueUsd={valueUsd}
            logoUrl={getTokenLogoUrl(token.symbol)}
          />
        );
      })}

      <style jsx>{`
        .token-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
      `}</style>
    </div>
  );
};

export default TokenList;
