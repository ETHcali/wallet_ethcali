/**
 * NFTGrid - Display collectibles/NFTs in a grid
 */
import React from 'react';
import Link from 'next/link';
import { NFTCard } from './NFTCard';
import Loading from '../shared/Loading';
import type { UserNFT } from '../../hooks/useUserNFTs';

interface NFTGridProps {
  nfts: UserNFT[];
  isLoading: boolean;
  onRefetch: () => void;
  onRedeemSuccess?: () => void;
}

const NFTGrid: React.FC<NFTGridProps> = ({
  nfts,
  isLoading,
  onRefetch,
  onRedeemSuccess,
}) => {
  if (isLoading) {
    return (
      <div className="collectibles-loading">
        <Loading size="small" text="Loading collectibles..." />
        <style jsx>{`
          .collectibles-loading {
            display: flex;
            justify-content: center;
            padding: 2rem;
          }
        `}</style>
      </div>
    );
  }

  if (nfts.length === 0) {
    return (
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

        <style jsx>{`
          .collectibles-empty {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 2.5rem 1rem;
            text-align: center;
          }

          .empty-icon {
            color: #4b5563;
            margin-bottom: 1rem;
          }

          .collectibles-empty h4 {
            font-size: 1rem;
            font-weight: 600;
            color: #f3f4f6;
            margin: 0 0 0.5rem;
          }

          .collectibles-empty p {
            font-size: 0.85rem;
            color: #9ca3af;
            margin: 0 0 1.25rem;
          }

          :global(.browse-swag-link) {
            display: inline-block;
            padding: 0.625rem 1.25rem;
            background: linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(139, 92, 246, 0.2));
            border: 1px solid rgba(6, 182, 212, 0.3);
            border-radius: 8px;
            color: #06b6d4;
            font-size: 0.85rem;
            font-weight: 500;
            text-decoration: none;
            transition: all 0.2s ease;
          }

          :global(.browse-swag-link:hover) {
            background: linear-gradient(135deg, rgba(6, 182, 212, 0.3), rgba(139, 92, 246, 0.3));
            border-color: rgba(6, 182, 212, 0.5);
            transform: translateY(-1px);
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="collectibles-container">
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
              if (onRedeemSuccess) {
                onRedeemSuccess();
              }
              setTimeout(() => {
                onRefetch();
              }, 2000);
            }}
          />
        ))}
      </div>

      <style jsx>{`
        .collectibles-container {
          padding: 0;
        }

        .collectibles-summary {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          background: rgba(17, 24, 39, 0.6);
          border-radius: 8px;
          margin-bottom: 1rem;
        }

        .summary-label {
          font-size: 0.8rem;
          color: #9ca3af;
        }

        .summary-value {
          font-size: 0.9rem;
          font-weight: 600;
          color: #06b6d4;
        }

        .nfts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          gap: 0.75rem;
        }

        @media (max-width: 400px) {
          .nfts-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default NFTGrid;
