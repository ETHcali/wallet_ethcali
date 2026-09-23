import { useState } from 'react';
import { useWallets } from '@privy-io/react-auth';
import AdminShell from '../../components/admin/AdminShell';
import SwitchChainButton from '../../components/shared/SwitchChainButton';
import { ZKPassportMetadataAdmin } from '../../components/zkpassport/ZKPassportMetadataAdmin';
import { DEFAULT_CHAIN, explorerAddress } from '../../config/chains';
import { useRequireChain } from '../../hooks/useRequireChain';
import { useZKPassportAdmin, useZKPassportContractSettings } from '../../hooks/useZKPassportAdmin';

type AdminTab = 'metadata' | 'ownership' | 'settings' | 'holders';

export default function IdentityAdminPage() {
  // Every read and write below is on Ethereum; the wallet is moved once, here.
  const chainId = DEFAULT_CHAIN.id;
  const zkpassport = DEFAULT_CHAIN.contracts.ZKPassportNFT;
  const chain = useRequireChain(chainId);

  const { ready } = useWallets();
  const { isOwner, owner, isLoading: isCheckingOwner, walletAddress } = useZKPassportAdmin(chainId);
  const { setVerifier, setDomain, setScope } = useZKPassportContractSettings(chainId);
  const [activeTab, setActiveTab] = useState<AdminTab>('metadata');
  const [settingsInput, setSettingsInput] = useState({ verifier: '', domain: '', scope: '' });
  const [settingsTxStatus, setSettingsTxStatus] = useState<string | null>(null);
  /** Which settings write is in flight, so each SET button owns its own pending state. */
  const [pendingSetting, setPendingSetting] = useState<'verifier' | 'domain' | 'scope' | null>(null);

  const runSetting = async (key: 'verifier' | 'domain' | 'scope', fn: () => Promise<unknown>) => {
    setPendingSetting(key);
    setSettingsTxStatus('pending...');
    try {
      await fn();
      setSettingsTxStatus('✓ done');
    } catch (e) {
      setSettingsTxStatus(`error: ${e instanceof Error ? e.message : 'unknown'}`);
    } finally {
      setPendingSetting(null);
    }
  };

  if (!ready || isCheckingOwner) {
    return (
      <AdminShell active="identity" title="Identity">
          <div className="flex items-center justify-center py-20">
            <div className="w-3 h-3 border-2 border-eth-blue border-t-transparent rounded-full animate-spin" />
            <span className="ml-3 text-eth-blue-text font-mono text-[10px] tracking-wider">VERIFYING...</span>
          </div>
        </AdminShell>
    );
  }

  if (!isOwner) {
    return (
      <AdminShell active="identity" title="Identity">
          <div className="flex flex-col items-center justify-center py-20">
            <div className="bg-black/60 border border-signal-reverted/30 rounded-control p-4 max-w-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-signal-reverted rounded-full"></div>
                <span className="text-[10px] text-signal-reverted font-mono tracking-wider">Access denied</span>
              </div>
              <div className="space-y-2 text-[10px] font-mono">
                <p className="text-content-faint">contract: <span className="text-content-faint">{zkpassport?.slice(0, 10)}…</span></p>
                <p className="text-content-faint">owner: <span className="text-eth-blue-text">{owner?.slice(0, 10)}…</span></p>
                <p className="text-content-faint">wallet: <span className="text-content-faint">{walletAddress?.slice(0, 10)}…</span></p>
              </div>
            </div>
          </div>
        </AdminShell>
    );
  }

  return (
    <AdminShell active="identity" title="Identity">
        {/* Reads work from anywhere; the wallet only has to be here to sign. */}
        {!chain.ready && (
          <div className="mb-6 max-w-sm">
            <p className="mb-2 text-xs text-content-muted">
              Your wallet is on another network; to sign anything below it has to be on {chain.chainName}.
            </p>
            <SwitchChainButton chain={chain} />
          </div>
        )}

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[9px] text-eth-blue-text font-mono bg-eth-blue/10 px-2 py-0.5 rounded-chip">OWNER</span>
          </div>
          <p className="text-content-faint font-mono text-[10px] tracking-widest uppercase">
            ZKPassport_NFT • METADATA_CONTROL
          </p>
        </div>

        {/* Contract Info */}
        <div className="grid grid-cols-2 gap-2 mb-6">
          <div className="bg-black/60 border border-line-hairline rounded-chip p-3">
            <p className="text-[9px] text-content-faint font-mono tracking-wider mb-1">CONTRACT</p>
            {zkpassport && (
              <a
                href={explorerAddress(chainId, zkpassport)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-mono text-eth-blue-text hover:text-eth-blue-text"
              >
                {zkpassport.slice(0, 8)}…{zkpassport.slice(-6)}
              </a>
            )}
          </div>
          <div className="bg-black/60 border border-line-hairline rounded-chip p-3">
            <p className="text-[9px] text-content-faint font-mono tracking-wider mb-1">OWNER</p>
            {owner && (
              <a
                href={explorerAddress(chainId, owner)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-mono text-eth-blue-text hover:text-eth-blue-text"
              >
                {owner.slice(0, 8)}…{owner.slice(-6)}
              </a>
            )}
          </div>
        </div>

        {/* Admin Functions Reference */}
        <div className="bg-black/40 border border-line-hairline rounded-chip p-3 mb-6">
          <p className="text-[9px] text-content-faint font-mono tracking-wider mb-2">Owner functions</p>
          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
            <div className="text-content-faint">
              <span className="text-eth-blue-text">setMetadata</span>(imageURI, desc, url, ipfs)
            </div>
            <div className="text-content-faint">
              <span className="text-eth-blue-text">transferOwnership</span>(newOwner)
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-4">
          {(['metadata', 'ownership', 'settings', 'holders'] as AdminTab[]).map((tab) => (
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
          {activeTab === 'metadata' && (
            <ZKPassportMetadataAdmin chainId={chainId} />
          )}

          {activeTab === 'ownership' && (
            <div className="space-y-4">
              <div className="bg-black/60 border border-line-hairline rounded-chip p-4">
                <p className="text-[9px] text-content-faint font-mono tracking-wider mb-3">Transfer ownership</p>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="0x... new owner address"
                      className="flex-1 bg-black/40 border border-line-hairline rounded-chip px-3 py-2 text-[10px] font-mono text-content-secondary placeholder-content-faint focus:border-eth-blue/50 focus:outline-none"
                    />
                    <button className="px-4 py-2 bg-signal-reverted/10 border border-signal-reverted/30 rounded-chip text-signal-reverted text-[10px] font-mono hover:bg-signal-reverted/20 transition">
                      TRANSFER
                    </button>
                  </div>
                  <div className="p-2 bg-signal-pending/10 border border-signal-pending/20 rounded-chip">
                    <p className="text-[9px] text-signal-pending font-mono">
                      This action is irreversible. The new owner will have full control.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-black/60 border border-line-hairline rounded-chip p-4">
                <p className="text-[9px] text-content-faint font-mono tracking-wider mb-3">Current status</p>
                <div className="space-y-2 text-[10px] font-mono">
                  <div className="flex justify-between">
                    <span className="text-content-faint">current_owner</span>
                    <span className="text-eth-blue-text">{owner}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-content-faint">your_wallet</span>
                    <span className={isOwner ? 'text-eth-blue-text' : 'text-content-muted'}>{walletAddress}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-content-faint">status</span>
                    <span className="text-eth-blue-text">OWNER</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-4">
              <div className="bg-black/60 border border-line-hairline rounded-chip p-4">
                <p className="text-[9px] text-content-faint font-mono tracking-wider mb-3">Contract settings</p>
                <div className="space-y-4">
                  {/* setVerifier */}
                  <div>
                    <p className="text-[9px] text-content-faint font-mono tracking-wider mb-1">Set verifier</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="0x... verifier address"
                        value={settingsInput.verifier}
                        onChange={(e) => setSettingsInput((s) => ({ ...s, verifier: e.target.value }))}
                        className="flex-1 bg-black/40 border border-line-hairline rounded-chip px-3 py-2 text-[10px] font-mono text-content-secondary placeholder-content-faint focus:border-eth-blue/50 focus:outline-none"
                      />
                      <button
                        onClick={() => runSetting('verifier', () => setVerifier(settingsInput.verifier))}
                        disabled={pendingSetting !== null || !chain.ready}
                        className="px-3 py-2 bg-eth-blue/20 text-eth-blue-text border border-eth-blue/40 rounded-chip text-[10px] font-mono hover:bg-eth-blue/30 disabled:opacity-50"
                      >
                        {pendingSetting === 'verifier' ? 'SETTING…' : 'SET'}
                      </button>
                    </div>
                  </div>

                  {/* setDomain */}
                  <div>
                    <p className="text-[9px] text-content-faint font-mono tracking-wider mb-1">Set domain</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. app.ethcali.org"
                        value={settingsInput.domain}
                        onChange={(e) => setSettingsInput((s) => ({ ...s, domain: e.target.value }))}
                        className="flex-1 bg-black/40 border border-line-hairline rounded-chip px-3 py-2 text-[10px] font-mono text-content-secondary placeholder-content-faint focus:border-eth-blue/50 focus:outline-none"
                      />
                      <button
                        onClick={() => runSetting('domain', () => setDomain(settingsInput.domain))}
                        disabled={pendingSetting !== null || !chain.ready}
                        className="px-3 py-2 bg-eth-blue/20 text-eth-blue-text border border-eth-blue/40 rounded-chip text-[10px] font-mono hover:bg-eth-blue/30 disabled:opacity-50"
                      >
                        {pendingSetting === 'domain' ? 'SETTING…' : 'SET'}
                      </button>
                    </div>
                  </div>

                  {/* setScope */}
                  <div>
                    <p className="text-[9px] text-content-faint font-mono tracking-wider mb-1">Set scope</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. ethcali-verification"
                        value={settingsInput.scope}
                        onChange={(e) => setSettingsInput((s) => ({ ...s, scope: e.target.value }))}
                        className="flex-1 bg-black/40 border border-line-hairline rounded-chip px-3 py-2 text-[10px] font-mono text-content-secondary placeholder-content-faint focus:border-eth-blue/50 focus:outline-none"
                      />
                      <button
                        onClick={() => runSetting('scope', () => setScope(settingsInput.scope))}
                        disabled={pendingSetting !== null || !chain.ready}
                        className="px-3 py-2 bg-eth-blue/20 text-eth-blue-text border border-eth-blue/40 rounded-chip text-[10px] font-mono hover:bg-eth-blue/30 disabled:opacity-50"
                      >
                        {pendingSetting === 'scope' ? 'SETTING…' : 'SET'}
                      </button>
                    </div>
                  </div>

                  {settingsTxStatus && (
                    <p className={`text-[10px] font-mono ${settingsTxStatus.startsWith('✓') ? 'text-signal-confirmed' : 'text-signal-pending'}`}>
                      {settingsTxStatus}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'holders' && (
            <div className="space-y-4">
              <div className="bg-black/60 border border-line-hairline rounded-chip p-4">
                <p className="text-[9px] text-content-faint font-mono tracking-wider mb-3">NFT holders</p>
                <p className="text-[10px] text-content-faint font-mono mb-3">
                  View all NFTMinted events on the block explorer for this contract.
                </p>
                {zkpassport && (
                  <a
                    href={`${explorerAddress(chainId, zkpassport)}#events`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-3 py-2 bg-eth-blue/20 text-eth-blue-text border border-eth-blue/40 rounded-chip text-[10px] font-mono hover:bg-eth-blue/30"
                  >
                    VIEW NFTMINTED EVENTS →
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {zkpassport && (
          <div className="mt-6 pt-4 border-t border-line-hairline">
            <div className="flex gap-2 text-[9px] font-mono text-content-faint">
              <a href={explorerAddress(chainId, zkpassport)} target="_blank" rel="noopener noreferrer" className="hover:text-eth-blue-text">
                VIEW_CONTRACT →
              </a>
            </div>
          </div>
        )}
      </AdminShell>
  );
}
