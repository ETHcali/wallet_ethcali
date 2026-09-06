import { useState, useEffect } from 'react';
import { useWallets } from '@privy-io/react-auth';

import { useRouter } from 'next/router';
import AdminShell from '../../components/admin/AdminShell';
import { AdminProductList } from '../../components/swag/AdminProductList';
import { AdminMintedNFTs } from '../../components/swag/AdminMintedNFTs';
import { AdminManagement } from '../../components/swag/AdminManagement';
import { useSwagAddresses } from '../../utils/network';
import { useContractAdmin } from '../../hooks/useContractAdmin';
import { useContractSettings, useTokenIds } from '../../hooks/swag';
import { useAddPoapWhitelist, useRemovePoapWhitelist, fetchPoapHolders } from '../../hooks/swag/usePoapWhitelist';
import { useActiveCollections, useAllCollections, useSetCollectionActive } from '../../hooks/swag/useSwagFactory';

type TabId = 'products' | 'minted' | 'admins' | 'settings' | 'poap' | 'factory';

export default function SwagAdminPage() {
  const router = useRouter();
  const { chainId, swag1155, explorerUrl } = useSwagAddresses();
  const { ready } = useWallets();
  const { isAdmin, isLoading: isCheckingAdmin, walletAddress } = useContractAdmin();
  const { paymentToken, treasury, isLoading: isLoadingSettings } = useContractSettings(swag1155 || '', chainId);
  const { tokenIds } = useTokenIds(swag1155 || '', chainId);

  // POAP whitelist state
  const [poapTokenId, setPoapTokenId] = useState<number>(0);
  const [poapEventId, setPoapEventId] = useState<string>('');
  const [poapAddresses, setPoapAddresses] = useState<string[]>([]);
  const [poapFetchLoading, setPoapFetchLoading] = useState(false);
  const [poapFetchError, setPoapFetchError] = useState<string | null>(null);
  const { addPoapWhitelist, isLoading: poapAddLoading, txHash: poapAddHash, error: poapAddError } = useAddPoapWhitelist(swag1155 || '', chainId);
  const { removePoapWhitelist, isLoading: poapRemoveLoading, txHash: poapRemoveHash, error: poapRemoveError } = useRemovePoapWhitelist(swag1155 || '', chainId);

  // SwagFactory state
  const { data: activeCollections, isLoading: activeColLoading } = useActiveCollections(chainId);
  const { data: allCollections, isLoading: allColLoading } = useAllCollections(chainId);
  const { setCollectionActive, isLoading: setColLoading, txHash: setColHash, error: setColError, factoryAddress } = useSetCollectionActive(chainId);

  const handleFetchPoapHolders = async () => {
    const eventIdNum = parseInt(poapEventId, 10);
    if (!poapEventId || isNaN(eventIdNum)) { setPoapFetchError('Enter a valid POAP event ID'); return; }
    setPoapFetchLoading(true);
    setPoapFetchError(null);
    try {
      const addrs = await fetchPoapHolders(eventIdNum);
      setPoapAddresses(addrs);
    } catch (err) {
      setPoapFetchError(err instanceof Error ? err.message : 'Failed to fetch');
    } finally {
      setPoapFetchLoading(false);
    }
  };
  
  // Read URL parameters for NFT fulfillment
  const urlTokenId = router.query.tokenId as string | undefined;
  const urlOwner = router.query.owner as string | undefined;
  const urlChainId = router.query.chainId as string | undefined;
  
  // Determine initial tab - if URL params exist, start with 'minted' tab
  const [activeTab, setActiveTab] = useState<TabId>(
    urlTokenId && urlOwner ? 'minted' : 'products'
  );
  

  // When URL params change, switch to minted tab if needed
  useEffect(() => {
    if (urlTokenId && urlOwner && activeTab !== 'minted') {
      setActiveTab('minted');
    }
  }, [urlTokenId, urlOwner, activeTab]);

  if (!ready || isCheckingAdmin) {
    return (
      <AdminShell active="swag" title="Swag" chainId={chainId}>
          <div className="flex items-center justify-center py-20">
            <div className="w-3 h-3 border-2 border-eth-blue border-t-transparent rounded-full animate-spin" />
            <span className="ml-3 text-eth-blue-text font-mono text-[10px] tracking-wider">VERIFYING...</span>
          </div>
        </AdminShell>
    );
  }

  if (!isAdmin) {
    return (
      <AdminShell active="swag" title="Swag" chainId={chainId}>
          <div className="flex flex-col items-center justify-center py-20">
            <div className="bg-black/60 border border-signal-reverted/30 rounded-control p-4 max-w-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-signal-reverted rounded-full"></div>
                <span className="text-[10px] text-signal-reverted font-mono tracking-wider">Access denied</span>
              </div>
              <div className="space-y-2 text-[10px] font-mono">
                <p className="text-content-faint">contract: <span className="text-content-faint">{swag1155?.slice(0, 10)}...</span></p>
                <p className="text-content-faint">wallet: <span className="text-content-faint">{walletAddress?.slice(0, 10)}...</span></p>
              </div>
            </div>
          </div>
        </AdminShell>
    );
  }

  return (
    <AdminShell active="swag" title="Swag" chainId={chainId}>
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[9px] text-eth-blue-text font-mono bg-eth-blue/10 px-2 py-0.5 rounded-chip">ADMIN</span>
          </div>
          <p className="text-content-faint font-mono text-[10px] tracking-widest uppercase">
            ERC1155 • PRODUCT_MANAGEMENT
          </p>
        </div>

        {/* Contract Info */}
        <div className="grid grid-cols-2 gap-2 mb-6">
          <div className="bg-black/60 border border-line-hairline rounded-chip p-3">
            <p className="text-[9px] text-content-faint font-mono tracking-wider mb-1">CONTRACT</p>
            <a
              href={`${explorerUrl}/address/${swag1155}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-mono text-eth-blue-text hover:text-eth-blue-text"
            >
              {swag1155?.slice(0, 8)}...{swag1155?.slice(-6)}
            </a>
          </div>
          <div className="bg-black/60 border border-line-hairline rounded-chip p-3">
            <p className="text-[9px] text-content-faint font-mono tracking-wider mb-1">Your wallet</p>
            <span className="text-xs font-mono text-eth-blue-text">
              {walletAddress?.slice(0, 8)}...{walletAddress?.slice(-6)}
            </span>
          </div>
        </div>

        {/* Admin Functions Reference */}
        <div className="bg-black/40 border border-line-hairline rounded-chip p-3 mb-6">
          <p className="text-[9px] text-content-faint font-mono tracking-wider mb-2">Admin functions</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-[10px] font-mono">
            <div className="text-content-faint">
              <span className="text-eth-blue-text">addAdmin</span>(addr)
            </div>
            <div className="text-content-faint">
              <span className="text-eth-blue-text">removeAdmin</span>(addr)
            </div>
            <div className="text-content-faint">
              <span className="text-eth-blue-text">setVariant</span>(id, price, supply, active)
            </div>
            <div className="text-content-faint">
              <span className="text-eth-blue-text">setVariantWithURI</span>(id, ..., uri)
            </div>
            <div className="text-content-faint">
              <span className="text-eth-blue-text">addRoyalty</span>(id, addr, bps)
            </div>
            <div className="text-content-faint">
              <span className="text-eth-blue-text">markRedemptionFulfilled</span>(id, owner)
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-4 flex-wrap">
          {(['products', 'minted', 'admins', 'settings', 'poap', 'factory'] as TabId[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 text-[10px] font-mono rounded-chip transition-all ${
                activeTab === tab
                  ? 'bg-eth-blue/20 text-eth-blue-text border border-eth-blue/40'
                  : 'text-content-faint hover:text-content-muted border border-transparent'
              }`}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="space-y-4">
          {activeTab === 'products' && (
            <AdminProductList />
          )}

          {activeTab === 'minted' && (
            <AdminMintedNFTs 
              urlTokenId={urlTokenId ? BigInt(urlTokenId) : undefined}
              urlOwner={urlOwner}
              urlChainId={urlChainId ? parseInt(urlChainId, 10) : undefined}
            />
          )}

          {activeTab === 'admins' && (
            <AdminManagement />
          )}

          {activeTab === 'settings' && (            <div className="space-y-4">
              {/* Current Settings */}
              {!isLoadingSettings && (paymentToken || treasury) && (
                <div className="bg-black/60 border border-line-hairline rounded-chip p-4">
                  <p className="text-[9px] text-content-faint font-mono tracking-wider mb-3">Current settings</p>
                  <div className="space-y-2 text-[10px] font-mono">
                    {paymentToken && (
                      <div className="flex justify-between">
                        <span className="text-content-faint">Payment token</span>
                        <span className="text-eth-blue-text">{paymentToken.slice(0, 10)}...{paymentToken.slice(-8)}</span>
                      </div>
                    )}
                    {treasury && (
                      <div className="flex justify-between">
                        <span className="text-content-faint">TREASURY</span>
                        <span className="text-eth-blue-text">{treasury.slice(0, 10)}...{treasury.slice(-8)}</span>
                      </div>
                    )}
                    {treasury && (
                      <p className="text-[9px] text-content-faint font-mono mt-2">Treasury is set in constructor and cannot be changed</p>
                    )}
                  </div>
                </div>
              )}

              {/* Payment Token Info (read-only, set at deployment) */}
              <div className="bg-black/60 border border-line-hairline rounded-chip p-4">
                <p className="text-[9px] text-content-faint font-mono tracking-wider mb-3">Payment token</p>
                <div className="space-y-2 text-[10px] font-mono">
                  {paymentToken && (
                    <div className="flex justify-between">
                      <span className="text-content-faint">USDC</span>
                      <span className="text-eth-blue-text">{paymentToken}</span>
                    </div>
                  )}
                  <p className="text-[9px] text-content-faint font-mono">USDC address is set at deployment and cannot be changed</p>
                </div>
              </div>

              {/* Contract Info */}
              <div className="bg-black/60 border border-line-hairline rounded-chip p-4">
                <p className="text-[9px] text-content-faint font-mono tracking-wider mb-3">Contract info</p>
                <div className="space-y-2 text-[10px] font-mono">
                  <div className="flex justify-between">
                    <span className="text-content-faint">address</span>
                    <a
                      href={`${explorerUrl}/address/${swag1155}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-eth-blue-text hover:text-eth-blue-text"
                    >
                      {swag1155}
                    </a>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-content-faint">your_wallet</span>
                    <span className="text-content-muted">{walletAddress}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-content-faint">role</span>
                    <span className="text-eth-blue-text">ADMIN</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── POAP Whitelist Tab ── */}
          {activeTab === 'poap' && (
            <div className="space-y-4">
              {/* Token selector */}
              <div className="bg-black/60 border border-line-hairline rounded-chip p-4">
                <p className="text-[9px] text-content-faint font-mono tracking-wider mb-3">POAP whitelist</p>
                <p className="text-[10px] text-content-faint font-mono mb-4">
                  Fetch POAP holders and bulk-add them to a product&apos;s discount whitelist in one transaction.
                </p>

                <div className="space-y-3">
                  {/* Token ID */}
                  <div>
                    <label className="text-[9px] text-content-faint font-mono tracking-wider block mb-1">TOKEN_ID</label>
                    <select
                      value={poapTokenId}
                      onChange={(e) => setPoapTokenId(parseInt(e.target.value, 10))}
                      className="w-full bg-surface-slab border border-line-hairline rounded-chip px-3 py-2 text-[11px] font-mono text-content-secondary focus:border-eth-blue focus:outline-none"
                    >
                      {tokenIds && tokenIds.length > 0 ? (
                        tokenIds.map((id: number) => (
                          <option key={id} value={id}>Token #{id}</option>
                        ))
                      ) : (
                        <option value={0}>Token #0</option>
                      )}
                    </select>
                  </div>

                  {/* POAP Event ID + Fetch */}
                  <div>
                    <label className="text-[9px] text-content-faint font-mono tracking-wider block mb-1">POAP_EVENT_ID</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="e.g. 12345"
                        value={poapEventId}
                        onChange={(e) => { setPoapEventId(e.target.value); setPoapAddresses([]); setPoapFetchError(null); }}
                        className="flex-1 bg-surface-slab border border-line-hairline rounded-chip px-3 py-2 text-[11px] font-mono text-content-secondary focus:border-eth-blue focus:outline-none"
                      />
                      <button
                        onClick={handleFetchPoapHolders}
                        disabled={poapFetchLoading || !poapEventId}
                        className="px-3 py-2 bg-eth-blue/20 text-eth-blue-text border border-eth-blue/40 rounded-chip text-[10px] font-mono hover:bg-eth-blue/30 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {poapFetchLoading ? '...' : 'Fetch holders'}
                      </button>
                    </div>
                    {poapFetchError && <p className="text-signal-reverted text-[10px] font-mono mt-1">{poapFetchError}</p>}
                  </div>

                  {/* Addresses preview */}
                  {poapAddresses.length > 0 && (
                    <div className="bg-black/40 border border-line-hairline rounded-chip p-3">
                      <p className="text-[9px] text-content-faint font-mono tracking-wider mb-2">
                        FOUND {poapAddresses.length} HOLDER(S)
                      </p>
                      <div className="max-h-32 overflow-y-auto space-y-1">
                        {poapAddresses.map((addr, i) => (
                          <p key={i} className="text-[10px] font-mono text-content-faint">{addr}</p>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  {poapAddresses.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => addPoapWhitelist(poapTokenId, parseInt(poapEventId, 10), poapAddresses)}
                        disabled={poapAddLoading}
                        className="px-3 py-2 bg-eth-blue/20 text-eth-blue-text border border-eth-blue/40 rounded-chip text-[10px] font-mono hover:bg-eth-blue/30 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {poapAddLoading ? 'SENDING...' : `ADD ${poapAddresses.length} ADDRESS(ES)`}
                      </button>
                      <button
                        onClick={() => removePoapWhitelist(poapTokenId, parseInt(poapEventId, 10), poapAddresses)}
                        disabled={poapRemoveLoading}
                        className="px-3 py-2 bg-signal-reverted/20 text-signal-reverted border border-signal-reverted/40 rounded-chip text-[10px] font-mono hover:bg-signal-reverted/30 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {poapRemoveLoading ? 'SENDING...' : `REMOVE ${poapAddresses.length} ADDRESS(ES)`}
                      </button>
                    </div>
                  )}

                  {poapAddHash && (
                    <p className="text-[10px] font-mono text-signal-confirmed">
                      ✓ ADD tx: <a href={`${explorerUrl}/tx/${poapAddHash}`} target="_blank" rel="noopener noreferrer" className="underline">{poapAddHash.slice(0, 14)}...</a>
                    </p>
                  )}
                  {poapRemoveHash && (
                    <p className="text-[10px] font-mono text-signal-pending">
                      ✓ REMOVE tx: <a href={`${explorerUrl}/tx/${poapRemoveHash}`} target="_blank" rel="noopener noreferrer" className="underline">{poapRemoveHash.slice(0, 14)}...</a>
                    </p>
                  )}
                  {(poapAddError || poapRemoveError) && (
                    <p className="text-[10px] font-mono text-signal-reverted">{poapAddError || poapRemoveError}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── SwagFactory Tab ── */}
          {activeTab === 'factory' && (
            <div className="space-y-4">
              <div className="bg-black/60 border border-line-hairline rounded-chip p-4">
                <p className="text-[9px] text-content-faint font-mono tracking-wider mb-1">Swag factory</p>
                {factoryAddress ? (
                  <a
                    href={`${explorerUrl}/address/${factoryAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] font-mono text-eth-blue-text hover:text-eth-blue-text"
                  >
                    {factoryAddress}
                  </a>
                ) : (
                  <p className="text-[10px] font-mono text-content-faint">Not deployed on this chain</p>
                )}
              </div>

              {/* Active collections */}
              <div className="bg-black/60 border border-line-hairline rounded-chip p-4">
                <p className="text-[9px] text-content-faint font-mono tracking-wider mb-3">Active collections</p>
                {activeColLoading ? (
                  <p className="text-[10px] font-mono text-content-faint">Loading...</p>
                ) : activeCollections && activeCollections.length > 0 ? (
                  <div className="space-y-2">
                    {activeCollections.map((addr) => (
                      <div key={addr} className="flex items-center justify-between gap-2">
                        <a
                          href={`${explorerUrl}/address/${addr}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] font-mono text-eth-blue-text hover:text-eth-blue-text"
                        >
                          {addr.slice(0, 10)}...{addr.slice(-8)}
                        </a>
                        <button
                          onClick={() => setCollectionActive(addr, false)}
                          disabled={setColLoading}
                          className="px-2 py-1 bg-signal-reverted/20 text-signal-reverted border border-signal-reverted/40 rounded-chip text-[9px] font-mono hover:bg-signal-reverted/30 disabled:opacity-50"
                        >
                          DEACTIVATE
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[10px] font-mono text-content-faint">No active collections</p>
                )}
              </div>

              {/* All collections (inactive ones) */}
              {!allColLoading && allCollections && allCollections.length > (activeCollections?.length ?? 0) && (
                <div className="bg-black/60 border border-line-hairline rounded-chip p-4">
                  <p className="text-[9px] text-content-faint font-mono tracking-wider mb-3">Inactive collections</p>
                  <div className="space-y-2">
                    {allCollections
                      .filter((addr) => !(activeCollections ?? []).includes(addr))
                      .map((addr) => (
                        <div key={addr} className="flex items-center justify-between gap-2">
                          <a
                            href={`${explorerUrl}/address/${addr}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] font-mono text-content-faint hover:text-content-secondary"
                          >
                            {addr.slice(0, 10)}...{addr.slice(-8)}
                          </a>
                          <button
                            onClick={() => setCollectionActive(addr, true)}
                            disabled={setColLoading}
                            className="px-2 py-1 bg-eth-blue/20 text-eth-blue-text border border-eth-blue/40 rounded-chip text-[9px] font-mono hover:bg-eth-blue/30 disabled:opacity-50"
                          >
                            ACTIVATE
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {setColHash && (
                <p className="text-[10px] font-mono text-signal-confirmed">
                  ✓ tx: <a href={`${explorerUrl}/tx/${setColHash}`} target="_blank" rel="noopener noreferrer" className="underline">{setColHash.slice(0, 14)}...</a>
                </p>
              )}
              {setColError && (
                <p className="text-[10px] font-mono text-signal-reverted">{setColError}</p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-line-hairline">
          <div className="flex gap-2 text-[9px] font-mono text-content-faint">
            <a href={`${explorerUrl}/address/${swag1155}`} target="_blank" rel="noopener noreferrer" className="hover:text-eth-blue-text">
              VIEW_CONTRACT →
            </a>
          </div>
        </div>
      </AdminShell>
  );
}
