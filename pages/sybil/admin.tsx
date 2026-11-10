import { useState } from 'react';
import { useWallets } from '@privy-io/react-auth';
import Link from 'next/link';
import AdminShell from '../../components/admin/AdminShell';
import { AccessManager } from '../../components/admin/AccessManager';
import { CARD, FIELD, LABEL, Spinner, Tabs, buttonClass, useToast } from '../../components/admin/primitives';
import Loading from '../../components/shared/Loading';
import { HashChip } from '../../components/shared/HashChip';
import SwitchChainButton from '../../components/shared/SwitchChainButton';
import { ZKPassportMetadataAdmin } from '../../components/zkpassport/ZKPassportMetadataAdmin';
import { DEFAULT_CHAIN, explorerAddress } from '../../config/chains';
import { useRequireChain } from '../../hooks/useRequireChain';
import { useZKPassportAdmin, useZKPassportContractSettings } from '../../hooks/useZKPassportAdmin';
import { adminErrorMessage } from '../../utils/adminErrors';

type AdminTab = 'metadata' | 'settings' | 'holders' | 'access';

const TABS: Array<{ id: AdminTab; label: string }> = [
  { id: 'metadata', label: 'Metadata' },
  { id: 'settings', label: 'Settings' },
  { id: 'holders', label: 'Holders' },
  { id: 'access', label: 'Access' },
];

type SettingKey = 'verifier' | 'domain' | 'scope';

const SETTINGS: Array<{ key: SettingKey; label: string; hint: string; placeholder: string; mono: boolean }> = [
  { key: 'verifier', label: 'Verifier', hint: 'The contract that checks a ZKPassport proof before a mint.', placeholder: '0x… verifier address', mono: true },
  { key: 'domain', label: 'Domain', hint: 'The site a proof must have been generated for.', placeholder: 'app.ethcali.org', mono: false },
  { key: 'scope', label: 'Scope', hint: 'Separates these proofs from any other app using the same verifier.', placeholder: 'ethcali-verification', mono: false },
];

/**
 * One owner-only setting: its own field, button, pending flag and error, so
 * setting the domain never relabels the verifier button.
 */
function SettingRow({
  def,
  run,
  blocked,
}: {
  def: (typeof SETTINGS)[number];
  run: (value: string) => Promise<unknown>;
  blocked: string | null;
}) {
  const toast = useToast();
  const [value, setValue] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setPending(true);
    setError(null);
    try {
      await run(value.trim());
      setValue('');
      toast(`${def.label} updated on chain.`);
    } catch (e) {
      setError(adminErrorMessage(e));
    } finally {
      setPending(false);
    }
  };

  const why = blocked ?? (value.trim() ? null : `Enter a ${def.label.toLowerCase()}.`);

  return (
    <div className="border-t border-line-hairline pt-4 first:border-0 first:pt-0">
      <label className="block">
        <span className={LABEL}>{def.label}</span>
        <span className="mb-2 block text-xs text-content-faint">{def.hint}</span>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={def.placeholder}
            spellCheck={false}
            autoComplete="off"
            disabled={pending}
            className={`${FIELD} ${def.mono ? 'font-mono' : ''}`}
          />
          <button type="button" onClick={() => void submit()} disabled={pending || Boolean(why)} title={why ?? undefined} className={buttonClass('primary', 'shrink-0')}>
            {pending && <Spinner />}
            {pending ? 'Saving…' : `Set ${def.label.toLowerCase()}`}
          </button>
        </div>
      </label>
      {!pending && blocked && <p className="mt-1 text-[11px] text-content-faint">{blocked}</p>}
      {error && <p className="mt-1 text-xs text-signal-reverted">{error}</p>}
    </div>
  );
}

export default function IdentityAdminPage() {
  // Every read and write below is on Ethereum; the wallet is moved once, here.
  const chainId = DEFAULT_CHAIN.id;
  const zkpassport = DEFAULT_CHAIN.contracts.ZKPassportNFT;
  const chain = useRequireChain(chainId);

  const { ready } = useWallets();
  const { isOwner, owner, isLoading: isCheckingOwner, walletAddress } = useZKPassportAdmin(chainId);
  const { setVerifier, setDomain, setScope } = useZKPassportContractSettings(chainId);
  const [activeTab, setActiveTab] = useState<AdminTab>('metadata');

  const setters: Record<SettingKey, (value: string) => Promise<unknown>> = {
    verifier: setVerifier,
    domain: setDomain,
    scope: setScope,
  };
  const blocked = chain.ready ? null : `Switch your wallet to ${chain.chainName} first.`;

  if (!ready || isCheckingOwner) {
    return (
      <AdminShell active="identity" title="Identity">
        <Loading text="Reading the owner from ZKPassportNFT…" />
      </AdminShell>
    );
  }

  if (!isOwner) {
    return (
      <AdminShell active="identity" title="Identity">
        <div className={CARD}>
          <h2 className="font-semibold text-content-primary">Not the owner</h2>
          <dl className="mt-3 space-y-2 text-sm">
            {zkpassport && (
              <div className="flex flex-wrap items-center gap-2">
                <dt className="text-content-muted">Contract</dt>
                <dd><HashChip hash={zkpassport} kind="address" /></dd>
              </div>
            )}
            {owner && (
              <div className="flex flex-wrap items-center gap-2">
                <dt className="text-content-muted">Owner</dt>
                <dd><HashChip hash={owner} kind="address" /></dd>
              </div>
            )}
            {walletAddress && (
              <div className="flex flex-wrap items-center gap-2">
                <dt className="text-content-muted">Your wallet</dt>
                <dd><HashChip hash={walletAddress} kind="address" /></dd>
              </div>
            )}
          </dl>
          <p className="mt-3 text-sm text-content-muted">ZKPassportNFT has a single owner; only that wallet can change it.</p>
          <Link href="/admin/access" className={buttonClass('secondary', 'mt-4')}>
            See who holds what
          </Link>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell
      active="identity"
      title="Identity"
      subtitle="ZKPassportNFT on Ethereum: the soulbound proof of personhood. You are its owner."
    >
      {/* Rule 2: the network first. Reads work from anywhere; signing needs this chain. */}
      {!chain.ready && (
        <div className={`${CARD} mb-6 flex flex-wrap items-center justify-between gap-3`}>
          <p className="text-sm text-content-muted">Your wallet is on another network. Every action here signs on {chain.chainName}.</p>
          <SwitchChainButton chain={chain} />
        </div>
      )}

      <div className={`${CARD} mb-6 grid gap-3 text-sm sm:grid-cols-2`}>
        {zkpassport && (
          <div className="min-w-0">
            <p className={LABEL}>Contract</p>
            <HashChip hash={zkpassport} kind="address" />
          </div>
        )}
        {owner && (
          <div className="min-w-0">
            <p className={LABEL}>Owner</p>
            <HashChip hash={owner} kind="address" />
          </div>
        )}
      </div>

      <div className="mb-4">
        <Tabs label="Identity admin sections" tabs={TABS} value={activeTab} onChange={setActiveTab} />
      </div>

      {activeTab === 'metadata' && <ZKPassportMetadataAdmin chainId={chainId} />}

      {activeTab === 'settings' && (
        <div className={`${CARD} space-y-4`}>
          {SETTINGS.map((def) => (
            <SettingRow key={def.key} def={def} run={setters[def.key]} blocked={blocked} />
          ))}
        </div>
      )}

      {activeTab === 'holders' && (
        <div className={CARD}>
          <h2 className="font-semibold text-content-primary">Holders</h2>
          <p className="mt-1 text-sm text-content-muted">Every mint is an NFTMinted event on the contract; the explorer lists them all.</p>
          {zkpassport && (
            <a
              href={`${explorerAddress(chainId, zkpassport)}#events`}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClass('secondary', 'mt-4')}
            >
              Open the events on Etherscan
            </a>
          )}
        </div>
      )}

      {activeTab === 'access' && <AccessManager only={['identity']} />}
    </AdminShell>
  );
}
