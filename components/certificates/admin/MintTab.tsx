/**
 * Mint — from a person on the list to a token in their wallet, in two steps.
 *
 *   1. Prepare: reserve the token id, render the diploma, pin the PNG, the
 *      PDF and the metadata (POST /api/certificates/admin/prepare, one row
 *      per call, in table order so ids come out consecutive), then rebuild
 *      the site so each new credential page exists (…/publish).
 *   2. Mint: IssuePanel, from an operator wallet with ADMIN_ROLE, sponsored.
 *
 * Builders and team are separate views of the same list. Sending the email
 * is the Send tab, on purpose: check the tokens before anyone hears of them.
 */
import { useCallback, useState } from 'react';
import Link from 'next/link';
import Button from '../../shared/Button';
import IssuePanel from '../IssuePanel';
import { CERT_ROLES } from '../../../lib/certificates/events';
import { ipfsHttp, openseaUrl } from '../../../lib/certificates/nft';
import { truncateAddress } from '../../../utils/linkedAccounts';
import { RoleChips, inScope, useSelection, who, type RoleScope } from './Selection';
import { useAdminApi } from './useAdminApi';
import type { AdminCertificate } from '../../../types/certificates';

interface PublishResponse {
  triggered: boolean;
  reason?: string;
}

export default function MintTab({ rows, onChanged }: { rows: AdminCertificate[]; onChanged: () => void }) {
  const api = useAdminApi();
  const [scope, setScope] = useState<RoleScope>(() => (rows.some((r) => r.role !== 'builder' && !r.issuedTx) ? 'team' : 'builders'));
  const shown = rows.filter((r) => inScope(r, scope)).sort((a, b) => Number(a.plannedTokenId ?? 1e9) - Number(b.plannedTokenId ?? 1e9) || a.memberName.localeCompare(b.memberName));
  const canPick = useCallback((r: AdminCertificate) => Boolean(r.wallet), []);
  const sel = useSelection(shown, canPick);

  const toPrepare = sel.selected.filter((r) => r.wallet && !r.issuedTx && !r.metadataCid);
  const [progress, setProgress] = useState<string | null>(null);
  const [log, setLog] = useState<{ ok: boolean; text: string }[]>([]);

  async function prepare() {
    if (progress || toPrepare.length === 0) return;
    setLog([]);
    const out: { ok: boolean; text: string }[] = [];
    let i = 0;
    for (const r of toPrepare) {
      i++;
      setProgress(`Preparing ${i} of ${toPrepare.length}: ${r.memberName}…`);
      try {
        const p = await api<{ plannedTokenId: string }>('/api/certificates/admin/prepare', { method: 'POST', body: { credentialId: r.credentialId } });
        out.push({ ok: true, text: `${r.memberName} · token #${p.plannedTokenId} · diploma and metadata pinned` });
      } catch (e) {
        out.push({ ok: false, text: `${r.memberName} · ${e instanceof Error ? e.message : 'failed'}` });
        setLog([...out]);
        break; // ids are consecutive: stop at the first failure rather than leave a gap behind it.
      }
      setLog([...out]);
    }
    if (out.some((l) => l.ok)) {
      setProgress('Publishing the credential pages…');
      try {
        const p = await api<PublishResponse>('/api/certificates/admin/publish', { method: 'POST' });
        out.push({ ok: p.triggered, text: p.triggered ? 'Site rebuild started: the new credential pages go live in a few minutes.' : p.reason ?? 'Not published' });
      } catch (e) {
        out.push({ ok: false, text: e instanceof Error ? e.message : 'Publish failed' });
      }
      setLog([...out]);
    }
    setProgress(null);
    sel.clear();
    onChanged();
  }

  // Prepared but not recorded as minted: the chain may know better (a relay error after a landed mint).
  const unrecorded = shown.filter((r) => r.metadataCid && !r.issuedTx);
  const [checking, setChecking] = useState(false);
  const [checked, setChecked] = useState<string | null>(null);
  async function checkChain() {
    if (checking || unrecorded.length === 0) return;
    setChecking(true);
    setChecked(null);
    try {
      const out = await api<{ recorded: unknown[]; skipped: unknown[] }>('/api/certificates/admin/sync', {
        method: 'POST',
        body: { credentialIds: unrecorded.map((r) => r.credentialId) },
      });
      setChecked(out.recorded.length ? `${out.recorded.length} minted on chain, now recorded.` : 'Nothing minted on chain that is not already recorded.');
      if (out.recorded.length) onChanged();
    } catch (e) {
      setChecked(e instanceof Error ? e.message : 'Could not read the chain');
    } finally {
      setChecking(false);
    }
  }

  const counts = {
    total: shown.length,
    wallet: shown.filter((r) => r.wallet).length,
    prepared: shown.filter((r) => r.metadataCid).length,
    minted: shown.filter((r) => r.issuedTx).length,
  };

  return (
    <>
      <RoleChips scope={scope} setScope={setScope} rows={rows} />

      <dl className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {(
          [
            ['People', counts.total],
            ['Wallet', counts.wallet],
            ['Diploma prepared', counts.prepared],
            ['Minted', counts.minted],
          ] as const
        ).map(([k, v]) => (
          <div key={k} className="rounded-card border border-line-hairline bg-surface-slab p-3">
            <dt className="text-[11px] font-semibold uppercase tracking-wide text-content-faint">{k}</dt>
            <dd className="mt-0.5 text-xl font-bold text-content-primary">{v}</dd>
          </div>
        ))}
      </dl>

      <div className="mb-4 rounded-card border border-line-hairline bg-surface-slab p-4 text-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-semibold text-content-primary">1 · Prepare diplomas</p>
            <p className="text-xs text-content-muted">
              Reserves each token id, renders the diploma, pins the image, PDF and metadata to IPFS, then rebuilds the site so their credential
              pages exist.
            </p>
          </div>
          <Button size="small" onClick={prepare} disabled={Boolean(progress) || toPrepare.length === 0}>
            {progress ?? `Prepare ${toPrepare.length} diploma${toPrepare.length === 1 ? '' : 's'}`}
          </Button>
        </div>
        {log.length > 0 && (
          <div className="mt-2 space-y-0.5 text-xs">
            {log.map((l, i) => (
              <p key={i} className={l.ok ? 'text-signal-confirmed' : 'text-signal-reverted'}>
                {l.text}
              </p>
            ))}
          </div>
        )}
      </div>

      <IssuePanel
        selected={sel.selected}
        onIssued={() => {
          sel.clear();
          onChanged();
        }}
      />

      <div className="overflow-x-auto rounded-card border border-line-hairline">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="bg-surface-inset text-[11px] uppercase tracking-wide text-content-faint">
            <tr>
              <th className="px-3 py-2.5">
                <input type="checkbox" aria-label="Select all in this view" {...sel.header} className="h-4 w-4 accent-eth-blue" />
              </th>
              <th className="px-3 py-2.5 font-semibold">Person</th>
              <th className="px-3 py-2.5 font-semibold">Wallet</th>
              <th className="px-3 py-2.5 font-semibold">Diploma &amp; metadata</th>
              <th className="px-3 py-2.5 font-semibold">NFT</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line-hairline">
            {shown.map((r) => (
              <tr key={r.id} className="bg-surface-slab align-top">
                <td className="px-3 py-3">
                  <input
                    type="checkbox"
                    aria-label={`Select ${r.memberName}`}
                    disabled={!canPick(r)}
                    checked={sel.picked.has(r.id)}
                    onChange={(e) => sel.toggle(r.id, e.target.checked)}
                    className="h-4 w-4 accent-eth-blue"
                  />
                </td>
                <td className="px-3 py-3">
                  <p className="font-medium text-content-primary">{r.memberName}</p>
                  <p className="text-xs text-content-faint">{who(r, CERT_ROLES[r.role].label.en)}</p>
                </td>
                <td className="px-3 py-3 font-mono text-xs">
                  {r.wallet ? <span className="text-content-secondary">{truncateAddress(r.wallet)}</span> : <span className="font-sans text-signal-pending">needs a wallet</span>}
                </td>
                <td className="px-3 py-3 text-xs">
                  {r.metadataCid ? (
                    <span className="flex flex-wrap gap-x-3 gap-y-0.5">
                      <span className="text-signal-confirmed">Token #{r.plannedTokenId}</span>
                      {r.imageCid && (
                        <a href={ipfsHttp(r.imageCid)} target="_blank" rel="noopener noreferrer" className="text-eth-blue-text hover:underline">
                          image
                        </a>
                      )}
                      <a href={ipfsHttp(r.metadataCid)} target="_blank" rel="noopener noreferrer" className="text-eth-blue-text hover:underline">
                        metadata
                      </a>
                      <Link href={`/certificate/${r.credentialId}`} target="_blank" className="text-eth-blue-text hover:underline">
                        page
                      </Link>
                    </span>
                  ) : (
                    <span className="text-content-faint">Not prepared</span>
                  )}
                </td>
                <td className="px-3 py-3 text-xs">
                  {r.issuedTx && r.tokenId ? (
                    <a href={openseaUrl(r.tokenId)} target="_blank" rel="noopener noreferrer" className="text-signal-confirmed hover:underline">
                      Minted #{r.tokenId} ↗
                    </a>
                  ) : (
                    <span className="text-content-faint">—</span>
                  )}
                </td>
              </tr>
            ))}
            {shown.length === 0 && (
              <tr>
                <td colSpan={5} className="bg-surface-slab px-3 py-6 text-center text-sm text-content-muted">
                  Nobody here yet. Add people on the {scope === 'team' ? 'Team' : 'Builders'} tab.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-content-faint">
        <span>Token ids are minted in order: prepare and mint people in the order shown, from the next id.</span>
        {unrecorded.length > 0 && (
          <Button variant="secondary" size="small" onClick={checkChain} disabled={checking}>
            {checking ? 'Reading the chain…' : `Check chain for ${unrecorded.length} prepared`}
          </Button>
        )}
        {checked && <span className="text-content-muted">{checked}</span>}
      </div>
    </>
  );
}
