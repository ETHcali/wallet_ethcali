/**
 * PortfolioHero - Total balance display with gradient styling
 */
import React from 'react';

interface PortfolioHeroProps {
  totalValueUsd: number;
  children?: React.ReactNode;
}

const PortfolioHero: React.FC<PortfolioHeroProps> = ({ totalValueUsd, children }) => {
  const formatUsd = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  return (
    <div className="portfolio-hero">
      <div className="portfolio-value-section">
        <span className="portfolio-label">Total Balance</span>
        <div className="portfolio-amount">{formatUsd(totalValueUsd)}</div>
      </div>
      {children}

      <style jsx>{`
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

        @media (max-width: 400px) {
          .portfolio-hero {
            padding: 1.25rem 1rem;
          }

          .portfolio-amount {
            font-size: 1.875rem;
          }
        }
      `}</style>
    </div>
  );
};

export default PortfolioHero;
