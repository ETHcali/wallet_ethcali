/**
 * Certificates admin — who built at each event, and where their certificate is.
 *
 * The participant history: every builder, every email they used (Devfolio and
 * Luma), whether they checked in, whether they claimed and to which wallet,
 * and whether the NFT is out. Read-only; /api/certificates/admin re-checks
 * ADMIN_ROLE on chain, and the menu entry hiding is presentation only.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { usePrivy } from '@privy-io/react-auth';
import { useQuery } from '@tanstack/react-query';
import AdminShell from '../../components/admin/AdminShell';
import IssuePanel from '../../components/certificates/IssuePanel';
import NotifyPanel from '../../components/certificates/NotifyPanel';
import AddParticipantPanel from '../../components/certificates/AddParticipantPanel';
import TeamPanel from '../../components/certificates/TeamPanel';
import Loading from '../../components/shared/Loading';
import { CheckIcon } from '../../components/shared/icons';
import { DEFAULT_CHAIN, explorerAddress, explorerTx } from '../../config/chains';
import { truncateAddress } from '../../utils/linkedAccounts';
import { CERT_EVENTS, CERT_ROLES, credentialUrl, honorLabel } from '../../lib/certificates/events';
import { openseaUrl } from '../../lib/certificates/nft';
import type { AdminCertificate, AdminCertificatesResponse } from '../../types/certificates';

type Filter = 'all' | 'unclaimed' | 'claimed' | 'issued' | 'unsent';

function csv(rows: AdminCertificate[]): string {
  const cell = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const head = ['event', 'role', 'project', 'name', 'emails', 'checked_in_at', 'prizes', 'credential_id', 'credential_url', 'wallet', 'claimed_at', 'issued_tx', 'token_id', 'notified_at'];
  const body = rows.map((r) =>
    [
      r.event,
      r.role,
      r.projectName ?? '',
      r.memberName,
      r.emails.join(' '),
      r.checkedInAt ?? '',
      r.honors.map((h) => honorLabel(h, 'en')).join(' / '),
      r.credentialId,
      credentialUrl(r.credentialId),
      r.wallet ?? '',
      r.claimedAt ?? '',
      r.issuedTx ?? '',
      r.tokenId ?? '',
      r.notifiedAt ?? '',
    ].map(cell).join(',')
  );
  return [head.join(','), ...body].join('\n');
}

export default function CertificatesAdmin() {
  const { ready, authenticated, getAccessToken } = usePrivy();
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');
  const [picked, setPicked] = useState<Set<number>>(new Set());

  const query = useQuery({
    queryKey: ['certificates-admin'],
    enabled: ready && authenticated,
    queryFn: async () => {
      const token = await getAccessToken();
      if (!token) throw new Error('Not signed in');
      const res = await fetch('/api/certificates/admin', { headers: { Authorization: `Bearer ${token}` } });
      const body = (await res.json().catch(() => ({}))) as AdminCertificatesResponse & { error?: string };
      if (!res.ok) throw new Error(body.error ?? `Request failed (${res.status})`);
      return body.certificates;
    },
  });

  const all = useMemo(() => query.data ?? [], [query.data]);
  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return all.filter((r) => {
      if (filter === 'unclaimed' && r.wallet) return false;
      if (filter === 'claimed' && (!r.wallet || r.issuedTx)) return false;
      if (filter === 'issued' && !r.issuedTx) return false;
      if (filter === 'unsent' && (!r.issuedTx || r.notifiedAt)) return false;
      if (!q) return true;
      return [r.memberName, r.projectName ?? '', r.role, r.credentialId, ...r.emails].some((v) => v.toLowerCase().includes(q));
    });
  }, [all, filter, search]);

  // Select all: every row in the current filter that can be selected at all
  // (has a wallet and pinned metadata). Rows outside the filter keep their state.
  const selectable = useMemo(() => rows.filter((r) => r.wallet && r.metadataCid), [rows]);
  const allPicked = selectable.length > 0 && selectable.every((r) => picked.has(r.id));
  const somePicked = !allPicked && selectable.some((r) => picked.has(r.id));
  const allRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (allRef.current) allRef.current.indeterminate = somePicked;
  }, [somePicked]);
  function toggleAll() {
    setPicked((prev) => {
      const next = new Set(prev);
      for (const r of selectable) {
        if (allPicked) next.delete(r.id);
        else next.add(r.id);
      }
      return next;
    });
  }

  const stats = {
    people: all.length,
    projects: new Set(all.filter((r) => r.projectSlug).map((r) => `${r.event}/${r.projectSlug}`)).size,
    team: all.filter((r) => r.role !== 'builder').length,
    checkedIn: all.filter((r) => r.checkedInAt).length,
    claimed: all.filter((r) => r.wallet).length,
    issued: all.filter((r) => r.issuedTx).length,
    emailed: all.filter((r) => r.notifiedAt).length,
  };

  function download() {
    const blob = new Blob([csv(rows)], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `certificates-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <AdminShell
      active="certificates"
      title="Certificates"
      subtitle="Everyone who built at an event: their emails, check-in, claim and NFT."
    >
      <Head>
        <title>Certificates · Admin · ETH Cali</title>
      </Head>

      {!ready || query.isLoading ? (
        <Loading text="Loading participants…" />
      ) : query.isError ? (
        <div className="rounded-card border border-line-hairline bg-surface-slab p-5 text-sm text-signal-reverted">
          {(query.error as Error).message}
        </div>
      ) : (
        <>
          <dl className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
            {(
              [
                ['Builders', stats.people],
                ['Projects', stats.projects],
                ['Team', stats.team],
                ['Checked in', stats.checkedIn],
                ['Wallet chosen', stats.claimed],
                ['NFT issued', stats.issued],
                ['Emailed', stats.emailed],
              ] as const
            ).map(([label, value]) => (
              <div key={label} className="rounded-card border border-line-hairline bg-surface-slab p-4">
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-content-faint">{label}</dt>
                <dd className="mt-1 text-2xl font-bold text-content-primary">{value}</dd>
              </div>
            ))}
          </dl>

          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, project, email, credential…"
              className="w-full rounded-control border border-line-hairline bg-surface-inset px-3 py-2.5 text-sm text-content-primary placeholder-content-faint focus:border-eth-blue focus:outline-none sm:max-w-sm"
            />
            <div className="flex gap-1">
              {(['all', 'unclaimed', 'claimed', 'issued', 'unsent'] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  aria-pressed={filter === f}
                  className={`min-h-tap rounded-control px-3 text-xs font-semibold capitalize ${
                    filter === f ? 'bg-surface-inset text-content-primary' : 'text-content-muted hover:text-content-primary'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3 sm:ml-auto">
              {picked.size > 0 && (
                <button
                  type="button"
                  onClick={() => setPicked(new Set())}
                  className="min-h-tap rounded-control px-3 text-xs font-semibold text-content-muted hover:text-content-primary"
                >
                  {picked.size} selected · clear
                </button>
              )}
              <button
                type="button"
                onClick={download}
                className="min-h-tap rounded-control border border-line-hairline px-4 text-sm font-semibold text-content-secondary hover:text-content-primary"
              >
                Export CSV ({rows.length})
              </button>
            </div>
          </div>

          <TeamPanel onAdded={() => void query.refetch()} />
          <AddParticipantPanel onAdded={() => void query.refetch()} />
          <IssuePanel
            selected={all.filter((r) => picked.has(r.id))}
            onIssued={() => {
              setPicked(new Set());
              void query.refetch();
            }}
          />
          <NotifyPanel
            selected={all.filter((r) => picked.has(r.id))}
            onSent={() => {
              setPicked(new Set());
              void query.refetch();
            }}
          />

          <div className="overflow-x-auto rounded-card border border-line-hairline">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-surface-inset text-[11px] uppercase tracking-wide text-content-faint">
                <tr>
                  <th className="px-3 py-2.5 font-semibold">
                    <input
                      ref={allRef}
                      type="checkbox"
                      aria-label={allPicked ? 'Deseleccionar todos' : `Seleccionar los ${selectable.length} de esta vista`}
                      title={allPicked ? 'Deseleccionar todos' : `Seleccionar los ${selectable.length} de esta vista`}
                      disabled={selectable.length === 0}
                      checked={allPicked}
                      onChange={toggleAll}
                      className="h-4 w-4 accent-eth-blue"
                    />
                  </th>
                  <th className="px-3 py-2.5 font-semibold">Builder</th>
                  <th className="px-3 py-2.5 font-semibold">Project</th>
                  <th className="px-3 py-2.5 font-semibold">Emails</th>
                  <th className="px-3 py-2.5 font-semibold">Check-in</th>
                  <th className="px-3 py-2.5 font-semibold">Credential</th>
                  <th className="px-3 py-2.5 font-semibold">Wallet / NFT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line-hairline">
                {rows.map((r) => (
                  <tr key={r.id} className="bg-surface-slab align-top">
                    <td className="px-3 py-3">
                      <input
                        type="checkbox"
                        aria-label={`Seleccionar ${r.memberName}`}
                        disabled={!r.wallet || !r.metadataCid}
                        checked={picked.has(r.id)}
                        onChange={(e) =>
                          setPicked((prev) => {
                            const next = new Set(prev);
                            if (e.target.checked) next.add(r.id);
                            else next.delete(r.id);
                            return next;
                          })
                        }
                        className="h-4 w-4 accent-eth-blue"
                      />
                    </td>
                    <td className="px-3 py-3">
                      <p className="font-medium text-content-primary">{r.memberName}</p>
                      <p className="text-xs text-content-faint">{CERT_EVENTS[r.event]?.credentialName ?? r.event}</p>
                    </td>
                    <td className="px-3 py-3">
                      {r.projectSlug && r.projectName ? (
                        <a
                          href={`https://devfolio.co/projects/${r.projectSlug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-content-primary hover:text-eth-blue-text"
                        >
                          {r.projectName}
                        </a>
                      ) : (
                        <span className="rounded-chip bg-surface-inset px-2 py-0.5 text-xs font-semibold text-content-secondary">
                          {CERT_ROLES[r.role].label.en}
                        </span>
                      )}
                      {r.honors.map((h) => (
                        <p key={`${h.track}-${h.place}`} className="text-xs text-eth-blue-text">
                          {honorLabel(h, 'en')}
                        </p>
                      ))}
                    </td>
                    <td className="px-3 py-3 text-xs">
                      {r.emails.map((e) => (
                        <p key={e} className={e === r.email ? 'text-content-secondary' : 'text-content-muted'}>
                          {e}
                        </p>
                      ))}
                    </td>
                    <td className="px-3 py-3 text-xs">
                      {r.checkedInAt ? (
                        <span className="inline-flex items-center gap-1 text-signal-confirmed">
                          <CheckIcon className="h-3.5 w-3.5" />
                          {new Date(r.checkedInAt).toLocaleDateString()}
                        </span>
                      ) : (
                        <span className="text-content-faint">—</span>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <Link href={`/certificate/${r.credentialId}`} className="font-mono text-xs text-eth-blue-text hover:underline">
                        {r.credentialId}
                      </Link>
                    </td>
                    <td className="px-3 py-3 text-xs">
                      {r.wallet ? (
                        <a
                          href={explorerAddress(DEFAULT_CHAIN.id, r.wallet)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-eth-blue-text hover:underline"
                        >
                          {truncateAddress(r.wallet)}
                        </a>
                      ) : (
                        <span className="text-content-faint">Not claimed</span>
                      )}
                      {r.issuedTx && r.tokenId ? (
                        <span className="mt-1 block">
                          <a href={openseaUrl(r.tokenId)} target="_blank" rel="noopener noreferrer" className="text-signal-confirmed hover:underline">
                            NFT #{r.tokenId} ↗
                          </a>{' '}
                          ·{' '}
                          <a href={explorerTx(DEFAULT_CHAIN.id, r.issuedTx)} target="_blank" rel="noopener noreferrer" className="text-content-muted hover:underline">
                            tx
                          </a>
                          {' · '}
                          {r.notifiedAt ? (
                            <span className="text-content-muted" title={r.notifiedAt}>
                              emailed {new Date(r.notifiedAt).toLocaleDateString()}
                            </span>
                          ) : (
                            <span className="text-content-faint">email pending</span>
                          )}
                        </span>
                      ) : (
                        <span className="mt-1 block text-content-faint">
                          {r.metadataCid ? `Listo para emitir · token #${r.plannedTokenId ?? '?'}` : 'Sin metadata'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </AdminShell>
  );
}
