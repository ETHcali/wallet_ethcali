import { useState, useEffect } from 'react';
import { useWallets } from '@privy-io/react-auth';

import { useRouter } from 'next/router';
import Navigation from '../../components/Navigation';
import Layout from '../../components/shared/Layout';
import { AdminProductList } from '../../components/swag/AdminProductList';
import { AdminMintedNFTs } from '../../components/swag/AdminMintedNFTs';
import { AdminManagement } from '../../components/swag/AdminManagement';
import { useSwagAddresses } from '../../utils/network';
import { useContractAdmin } from '../../hooks/useContractAdmin';
import { useContractSettings } from '../../hooks/swag';

type TabId = 'products' | 'minted' | 'admins' | 'settings';

export default function SwagAdminPage() {
  const router = useRouter();
  const { chainId, swag1155, explorerUrl } = useSwagAddresses();
  const { ready } = useWallets();
  const { isAdmin, isLoading: isCheckingAdmin, walletAddress } = useContractAdmin();
  const { paymentToken, treasury, isLoading: isLoadingSettings } = useContractSettings(swag1155 || '', chainId);
  
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
      <div className="min-h-screen bg-gray-950">
        <Navigation currentChainId={chainId} />
        <Layout>
          <div className="flex items-center justify-center py-20">
            <div className="w-3 h-3 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
            <span className="ml-3 text-pink-400 font-mono text-[10px] tracking-wider">VERIFYING...</span>
          </div>
        </Layout>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-950">
        <Navigation currentChainId={chainId} />
        <Layout>
          <div className="flex flex-col items-center justify-center py-20">
            <div className="bg-black/60 border border-red-500/30 rounded-lg p-4 max-w-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-[10px] text-red-400 font-mono tracking-wider">ACCESS_DENIED</span>
              </div>
              <div className="space-y-2 text-[10px] font-mono">
                <p className="text-gray-500">contract: <span className="text-gray-600">{swag1155?.slice(0, 10)}...</span></p>
                <p className="text-gray-500">wallet: <span className="text-gray-600">{walletAddress?.slice(0, 10)}...</span></p>
              </div>
            </div>
          </div>
        </Layout>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <Navigation currentChainId={chainId} />
      <Layout>
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
            <h1 className="text-lg font-bold text-pink-400 font-mono tracking-wider">
              SWAG_ADMIN
            </h1>
            <span className="text-[9px] text-green-400 font-mono bg-green-500/10 px-2 py-0.5 rounded">ADMIN</span>
          </div>
          <p className="text-gray-600 font-mono text-[10px] tracking-widest uppercase">
            ERC1155 • PRODUCT_MANAGEMENT
          </p>
        </div>

        {/* Contract Info */}
        <div className="grid grid-cols-2 gap-2 mb-6">
          <div className="bg-black/60 border border-gray-800 rounded p-3">
            <p className="text-[9px] text-gray-600 font-mono tracking-wider mb-1">CONTRACT</p>
            <a
              href={`${explorerUrl}/address/${swag1155}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-mono text-cyan-400 hover:text-cyan-300"
            >
              {swag1155?.slice(0, 8)}...{swag1155?.slice(-6)}
            </a>
          </div>
          <div className="bg-black/60 border border-gray-800 rounded p-3">
            <p className="text-[9px] text-gray-600 font-mono tracking-wider mb-1">YOUR_WALLET</p>
            <span className="text-xs font-mono text-green-400">
              {walletAddress?.slice(0, 8)}...{walletAddress?.slice(-6)}
            </span>
          </div>
        </div>

        {/* Admin Functions Reference */}
        <div className="bg-black/40 border border-gray-800 rounded p-3 mb-6">
          <p className="text-[9px] text-gray-500 font-mono tracking-wider mb-2">ADMIN_FUNCTIONS</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-[10px] font-mono">
            <div className="text-gray-600">
              <span className="text-pink-400">addAdmin</span>(addr)
            </div>
            <div className="text-gray-600">
              <span className="text-pink-400">removeAdmin</span>(addr)
            </div>
            <div className="text-gray-600">
              <span className="text-pink-400">setVariant</span>(id, price, supply, active)
            </div>
            <div className="text-gray-600">
              <span className="text-pink-400">setVariantWithURI</span>(id, ..., uri)
            </div>
            <div className="text-gray-600">
              <span className="text-pink-400">addRoyalty</span>(id, addr, bps)
            </div>
            <div className="text-gray-600">
              <span className="text-pink-400">markRedemptionFulfilled</span>(id, owner)
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-4 flex-wrap">
          {(['products', 'minted', 'admins', 'settings'] as TabId[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 text-[10px] font-mono rounded transition-all ${
                activeTab === tab
                  ? 'bg-pink-500/20 text-pink-400 border border-pink-500/40'
                  : 'text-gray-600 hover:text-gray-400 border border-transparent'
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

          {activeTab === 'settings' && (
            <div className="space-y-4">
              {/* Current Settings */}
              {!isLoadingSettings && (paymentToken || treasury) && (
                <div className="bg-black/60 border border-gray-800 rounded p-4">
                  <p className="text-[9px] text-gray-500 font-mono tracking-wider mb-3">CURRENT_SETTINGS</p>
                  <div className="space-y-2 text-[10px] font-mono">
                    {paymentToken && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">PAYMENT_TOKEN</span>
                        <span className="text-cyan-400">{paymentToken.slice(0, 10)}...{paymentToken.slice(-8)}</span>
                      </div>
                    )}
                    {treasury && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">TREASURY</span>
                        <span className="text-cyan-400">{treasury.slice(0, 10)}...{treasury.slice(-8)}</span>
                      </div>
                    )}
                    {treasury && (
                      <p className="text-[9px] text-gray-600 font-mono mt-2">Treasury is set in constructor and cannot be changed</p>
                    )}
                  </div>
                </div>
              )}

              {/* Payment Token Info (read-only, set at deployment) */}
              <div className="bg-black/60 border border-gray-800 rounded p-4">
                <p className="text-[9px] text-gray-500 font-mono tracking-wider mb-3">PAYMENT_TOKEN</p>
                <div className="space-y-2 text-[10px] font-mono">
                  {paymentToken && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">USDC</span>
                      <span className="text-cyan-400">{paymentToken}</span>
                    </div>
                  )}
                  <p className="text-[9px] text-gray-600 font-mono">USDC address is set at deployment and cannot be changed</p>
                </div>
              </div>

              {/* Contract Info */}
              <div className="bg-black/60 border border-gray-800 rounded p-4">
                <p className="text-[9px] text-gray-500 font-mono tracking-wider mb-3">CONTRACT_INFO</p>
                <div className="space-y-2 text-[10px] font-mono">
                  <div className="flex justify-between">
                    <span className="text-gray-600">address</span>
                    <a
                      href={`${explorerUrl}/address/${swag1155}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 hover:text-cyan-300"
                    >
                      {swag1155}
                    </a>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">your_wallet</span>
                    <span className="text-gray-400">{walletAddress}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">role</span>
                    <span className="text-green-400">ADMIN</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-800">
          <div className="flex gap-2 text-[9px] font-mono text-gray-700">
            <a href={`${explorerUrl}/address/${swag1155}`} target="_blank" rel="noopener noreferrer" className="hover:text-pink-400">
              VIEW_CONTRACT →
            </a>
          </div>
        </div>
      </Layout>
    </div>
  );
}
