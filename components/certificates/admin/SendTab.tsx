/**
 * Send — tell each minted person their certificate is out.
 *
 * Only minted certificates can be sent, and only once their credential page
 * is live (the email links to it; the notify route checks). The email names
 * the exact address(es) that sign in to see it. Revisar is a dry run, Prueba
 * goes to the operator's own inbox, Enviar stamps each row so a second click
 * sends nothing (NotifyPanel).
 */
import { useCallback, useState } from 'react';
import Link from 'next/link';
import Button from '../../shared/Button';
import NotifyPanel from '../NotifyPanel';
import { CERT_ROLES, credentialUrl } from '../../../lib/certificates/events';
import { openseaUrl } from '../../../lib/certificates/nft';
import { RoleChips, inScope, useSelection, who, type RoleScope } from './Selection';
import { useAdminApi } from './useAdminApi';
import type { AdminCertificate } from '../../../types/certificates';

function csv(rows: AdminCertificate[]): string {
  const cell = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const head = ['name', 'role', 'project', 'emails', 'credential_url', 'wallet', 'token_id', 'issued_tx', 'notified_at'];
  return [
    head.join(','),
    ...rows.map((r) =>
      [r.memberName, r.role, r.projectName ?? '', r.emails.join(' '), credentialUrl(r.credentialId), r.wallet ?? '', r.tokenId ?? '', r.issuedTx ?? '', r.notifiedAt ?? '']
        .map(cell)
        .join(',')
    ),
  ].join('\n');
}

export default function SendTab({ eventKey, rows, onChanged }: { eventKey: string; rows: AdminCertificate[]; onChanged: () => void }) {
  const api = useAdminApi();
  const [scope, setScope] = useState<RoleScope>(() => (rows.some((r) => r.role !== 'builder' && r.issuedTx && !r.notifiedAt) ? 'team' : 'builders'));
  const shown = rows.filter((r) => inScope(r, scope));
  const canPick = useCallback((r: AdminCertificate) => Boolean(r.issuedTx && !r.notifiedAt), []);
  const sel = useSelection(shown, canPick);
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState<string | null>(null);

  async function publish() {
    if (publishing) return;
    setPublishing(true);
    try {
      const p = await api<{ triggered: boolean; reason?: string }>('/api/certificates/admin/publish', { method: 'POST' });
      setPublished(p.triggered ? 'Site rebuild started; credential pages go live in a few minutes.' : p.reason ?? 'Not published');
    } catch (e) {
      setPublished(e instanceof Error ? e.message : 'Publish failed');
    } finally {
      setPublishing(false);
    }
  }

  function download() {
    const blob = new Blob([csv(shown)], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `certificates-${eventKey}-${scope}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  const minted = shown.filter((r) => r.issuedTx).length;
  const emailed = shown.filter((r) => r.notifiedAt).length;

  return (
    <>
      <RoleChips scope={scope} setScope={setScope} rows={rows} />

      <div className="mb-4 flex flex-wrap items-center gap-3 text-xs text-content-muted">
        <span>
          {minted} minted · {emailed} emailed · {minted - emailed} to send
        </span>
        <Button variant="secondary" size="small" onClick={publish} disabled={publishing}>
          {publishing ? 'Starting…' : 'Rebuild credential pages'}
        </Button>
        {published && <span>{published}</span>}
        <button type="button" onClick={download} className="min-h-tap rounded-control border border-line-hairline px-4 text-sm font-semibold text-content-secondary hover:text-content-primary sm:ml-auto">
          Export CSV ({shown.length})
        </button>
      </div>

      <NotifyPanel
        selected={sel.selected}
        onSent={() => {
          sel.clear();
          onChanged();
        }}
      />

      <div className="overflow-x-auto rounded-card border border-line-hairline">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="bg-surface-inset text-[11px] uppercase tracking-wide text-content-faint">
            <tr>
              <th className="px-3 py-2.5">
                <input type="checkbox" aria-label="Select everyone ready to send" {...sel.header} className="h-4 w-4 accent-eth-blue" />
              </th>
              <th className="px-3 py-2.5 font-semibold">Person</th>
              <th className="px-3 py-2.5 font-semibold">Signs in with</th>
              <th className="px-3 py-2.5 font-semibold">Certificate</th>
              <th className="px-3 py-2.5 font-semibold">Email</th>
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
                <td className="px-3 py-3 font-mono text-xs text-content-secondary">
                  {r.emails.map((e) => (
                    <p key={e}>{e}</p>
                  ))}
                </td>
                <td className="px-3 py-3 text-xs">
                  {r.issuedTx && r.tokenId ? (
                    <span className="flex flex-wrap gap-x-3">
                      <a href={openseaUrl(r.tokenId)} target="_blank" rel="noopener noreferrer" className="text-signal-confirmed hover:underline">
                        NFT #{r.tokenId}
                      </a>
                      <Link href={`/certificate/${r.credentialId}`} target="_blank" className="text-eth-blue-text hover:underline">
                        credential page
                      </Link>
                    </span>
                  ) : (
                    <span className="text-content-faint">Not minted yet: Mint tab</span>
                  )}
                </td>
                <td className="px-3 py-3 text-xs">
                  {r.notifiedAt ? (
                    <span className="text-content-muted" title={r.notifiedAt}>
                      Sent {new Date(r.notifiedAt).toLocaleDateString()}
                    </span>
                  ) : r.issuedTx ? (
                    <span className="text-signal-pending">To send</span>
                  ) : (
                    <span className="text-content-faint">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
