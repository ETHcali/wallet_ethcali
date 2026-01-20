import { useState, useMemo } from 'react';
import { useAllMintedNFTs, useMarkFulfilled, MintedNFT, RedemptionStatus } from '../../hooks/useSwagAdmin';
import { getIPFSGatewayUrl } from '../../lib/pinata';
import { useSwagAddresses } from '../../utils/network';

type FilterStatus = 'all' | 'pending' | 'fulfilled' | 'not-redeemed';

const statusLabels: Record<RedemptionStatus, string> = {
  [RedemptionStatus.NotRedeemed]: 'Not Redeemed',
  [RedemptionStatus.PendingFulfillment]: 'Pending Fulfillment',
  [RedemptionStatus.Fulfilled]: 'Fulfilled',
};

const statusColors: Record<RedemptionStatus, string> = {
  [RedemptionStatus.NotRedeemed]: 'bg-slate-500/10 text-slate-400',
  [RedemptionStatus.PendingFulfillment]: 'bg-yellow-500/10 text-yellow-400',
  [RedemptionStatus.Fulfilled]: 'bg-green-500/10 text-green-400',
};

export function AdminMintedNFTs() {
  const { mintedNFTs, isLoading, error, refetch } = useAllMintedNFTs();
  const { markFulfilled, canMarkFulfilled } = useMarkFulfilled();
  const { explorerUrl } = useSwagAddresses();

  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [searchOwner, setSearchOwner] = useState('');
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  const filteredNFTs = useMemo(() => {
    return mintedNFTs.filter((nft) => {
      // Status filter
      if (filterStatus === 'pending' && nft.redemptionStatus !== RedemptionStatus.PendingFulfillment) {
        return false;
      }
      if (filterStatus === 'fulfilled' && nft.redemptionStatus !== RedemptionStatus.Fulfilled) {
        return false;
      }
      if (filterStatus === 'not-redeemed' && nft.redemptionStatus !== RedemptionStatus.NotRedeemed) {
        return false;
      }

      // Owner search filter
      if (searchOwner && !nft.owner.toLowerCase().includes(searchOwner.toLowerCase())) {
        return false;
      }

      return true;
    });
  }, [mintedNFTs, filterStatus, searchOwner]);

  const handleMarkFulfilled = async (nft: MintedNFT) => {
    const key = `${nft.tokenId.toString()}-${nft.owner}`;
    setProcessingIds((prev) => new Set(prev).add(key));

    try {
      await markFulfilled(nft.tokenId, nft.owner);
      refetch();
    } catch (err) {
      console.error('Failed to mark fulfilled:', err);
      alert(err instanceof Error ? err.message : 'Failed to mark as fulfilled');
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <div className="flex items-center justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
          <span className="ml-3 text-slate-400">Loading minted NFTs...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-6">
        <p className="text-red-300">Error loading minted NFTs: {error}</p>
        <button
          onClick={() => refetch()}
          className="mt-3 text-sm text-cyan-400 hover:text-cyan-300"
        >
          Retry
        </button>
      </div>
    );
  }

  const pendingCount = mintedNFTs.filter((n) => n.redemptionStatus === RedemptionStatus.PendingFulfillment).length;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white">Minted NFTs</h2>
          <p className="text-sm text-slate-500">
            {mintedNFTs.length} total NFTs minted
            {pendingCount > 0 && (
              <span className="ml-2 text-yellow-400">({pendingCount} pending fulfillment)</span>
            )}
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="text-sm text-cyan-400 hover:text-cyan-300 transition"
        >
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex flex-wrap gap-2">
          {(['all', 'pending', 'fulfilled', 'not-redeemed'] as FilterStatus[]).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                filterStatus === status
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                  : 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-600'
              }`}
            >
              {status === 'all' && 'All'}
              {status === 'pending' && 'Pending'}
              {status === 'fulfilled' && 'Fulfilled'}
              {status === 'not-redeemed' && 'Not Redeemed'}
            </button>
          ))}
        </div>
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by owner address..."
            value={searchOwner}
            onChange={(e) => setSearchOwner(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
          />
        </div>
      </div>

      {filteredNFTs.length === 0 ? (
        <div className="py-8 text-center text-slate-500">
          No NFTs found matching your filters.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-700 text-xs uppercase tracking-wider text-slate-500">
                <th className="px-4 py-3">Token</th>
                <th className="px-4 py-3">Owner</th>
                <th className="px-4 py-3">Balance</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredNFTs.map((nft) => {
                const key = `${nft.tokenId.toString()}-${nft.owner}`;
                const isProcessing = processingIds.has(key);

                return (
                  <tr key={key} className="hover:bg-slate-800/50 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {nft.metadata?.image && (
                          <img
                            src={getIPFSGatewayUrl(nft.metadata.image)}
                            alt={nft.metadata?.name || 'NFT'}
                            className="h-10 w-10 rounded-lg object-cover border border-slate-700"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                        )}
                        <div>
                          <p className="text-white font-medium text-sm">
                            {nft.metadata?.name || `Token ${nft.tokenId.toString().slice(-6)}`}
                          </p>
                          <span className="font-mono text-xs text-slate-500">
                            #{nft.tokenId.toString().slice(-8)}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <a
                        href={`${explorerUrl}/address/${nft.owner}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-sm text-cyan-400 hover:text-cyan-300 transition"
                      >
                        {truncateAddress(nft.owner)}
                      </a>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-white">{nft.balance}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${statusColors[nft.redemptionStatus]}`}>
                        {statusLabels[nft.redemptionStatus]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {nft.redemptionStatus === RedemptionStatus.PendingFulfillment && (
                        <button
                          onClick={() => handleMarkFulfilled(nft)}
                          disabled={isProcessing || !canMarkFulfilled}
                          className="rounded-lg bg-green-500/10 border border-green-500/30 px-3 py-1.5 text-xs font-medium text-green-400 hover:bg-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                          {isProcessing ? (
                            <span className="flex items-center gap-1">
                              <div className="h-3 w-3 animate-spin rounded-full border border-green-400 border-t-transparent" />
                              Processing...
                            </span>
                          ) : (
                            'Mark Fulfilled'
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
