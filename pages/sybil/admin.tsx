import { useState } from 'react';
import { useWallets } from '@privy-io/react-auth';
import Navigation from '../../components/Navigation';
import Layout from '../../components/shared/Layout';
import { ZKPassportMetadataAdmin } from '../../components/zkpassport/ZKPassportMetadataAdmin';
import { useSwagAddresses } from '../../utils/network';
import { useZKPassportAdmin } from '../../hooks/useZKPassportAdmin';

type AdminTab = 'metadata' | 'ownership';

export default function IdentityAdminPage() {
  const { chainId, zkpassport, explorerUrl } = useSwagAddresses();
  const { ready } = useWallets();
  const { isOwner, owner, isLoading: isCheckingOwner, walletAddress } = useZKPassportAdmin();
  const [activeTab, setActiveTab] = useState<AdminTab>('metadata');

  if (!ready || isCheckingOwner) {
    return (
      <div className="min-h-screen bg-gray-950">
        <Navigation currentChainId={chainId} />
        <Layout>
          <div className="flex items-center justify-center py-20">
            <div className="w-3 h-3 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            <span className="ml-3 text-purple-400 font-mono text-[10px] tracking-wider">VERIFYING...</span>
          </div>
        </Layout>
      </div>
    );
  }

  if (!isOwner) {
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
                <p className="text-gray-500">contract: <span className="text-gray-600">{zkpassport?.slice(0, 10)}...</span></p>
                <p className="text-gray-500">owner: <span className="text-purple-400">{owner?.slice(0, 10)}...</span></p>
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
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <h1 className="text-lg font-bold text-purple-400 font-mono tracking-wider">
              IDENTITY_ADMIN
            </h1>
            <span className="text-[9px] text-cyan-400 font-mono bg-cyan-500/10 px-2 py-0.5 rounded">OWNER</span>
          </div>
          <p className="text-gray-600 font-mono text-[10px] tracking-widest uppercase">
            ZKPASSPORT_NFT • METADATA_CONTROL
          </p>
        </div>

        {/* Contract Info */}
        <div className="grid grid-cols-2 gap-2 mb-6">
          <div className="bg-black/60 border border-gray-800 rounded p-3">
            <p className="text-[9px] text-gray-600 font-mono tracking-wider mb-1">CONTRACT</p>
            <a
              href={`${explorerUrl}/address/${zkpassport}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-mono text-cyan-400 hover:text-cyan-300"
            >
              {zkpassport?.slice(0, 8)}...{zkpassport?.slice(-6)}
            </a>
          </div>
          <div className="bg-black/60 border border-gray-800 rounded p-3">
            <p className="text-[9px] text-gray-600 font-mono tracking-wider mb-1">OWNER</p>
            <a
              href={`${explorerUrl}/address/${owner}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-mono text-purple-400 hover:text-purple-300"
            >
              {owner?.slice(0, 8)}...{owner?.slice(-6)}
            </a>
          </div>
        </div>

        {/* Admin Functions Reference */}
        <div className="bg-black/40 border border-gray-800 rounded p-3 mb-6">
          <p className="text-[9px] text-gray-500 font-mono tracking-wider mb-2">OWNER_FUNCTIONS</p>
          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
            <div className="text-gray-600">
              <span className="text-purple-400">setMetadata</span>(imageURI, desc, url, ipfs)
            </div>
            <div className="text-gray-600">
              <span className="text-purple-400">transferOwnership</span>(newOwner)
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-4">
          {(['metadata', 'ownership'] as AdminTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 text-[10px] font-mono rounded transition-all ${
                activeTab === tab
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40'
                  : 'text-gray-600 hover:text-gray-400 border border-transparent'
              }`}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="space-y-4">
          {activeTab === 'metadata' && (
            <ZKPassportMetadataAdmin />
          )}

          {activeTab === 'ownership' && (
            <div className="space-y-4">
              <div className="bg-black/60 border border-gray-800 rounded p-4">
                <p className="text-[9px] text-gray-500 font-mono tracking-wider mb-3">TRANSFER_OWNERSHIP</p>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="0x... new owner address"
                      className="flex-1 bg-black/40 border border-gray-700 rounded px-3 py-2 text-[10px] font-mono text-gray-300 placeholder-gray-600 focus:border-purple-500/50 focus:outline-none"
                    />
                    <button className="px-4 py-2 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-[10px] font-mono hover:bg-red-500/20 transition">
                      TRANSFER
                    </button>
                  </div>
                  <div className="p-2 bg-yellow-500/10 border border-yellow-500/20 rounded">
                    <p className="text-[9px] text-yellow-400 font-mono">
                      ⚠ WARNING: This action is irreversible. The new owner will have full control.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-black/60 border border-gray-800 rounded p-4">
                <p className="text-[9px] text-gray-500 font-mono tracking-wider mb-3">CURRENT_STATUS</p>
                <div className="space-y-2 text-[10px] font-mono">
                  <div className="flex justify-between">
                    <span className="text-gray-600">current_owner</span>
                    <span className="text-purple-400">{owner}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">your_wallet</span>
                    <span className={isOwner ? 'text-green-400' : 'text-gray-400'}>{walletAddress}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">status</span>
                    <span className="text-green-400">OWNER</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-800">
          <div className="flex gap-2 text-[9px] font-mono text-gray-700">
            <a href={`${explorerUrl}/address/${zkpassport}`} target="_blank" rel="noopener noreferrer" className="hover:text-purple-400">
              VIEW_CONTRACT →
            </a>
          </div>
        </div>
      </Layout>
    </div>
  );
}
