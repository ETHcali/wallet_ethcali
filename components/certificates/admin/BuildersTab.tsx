/**
 * Builders — the people who built at the event, one row per person per project.
 *
 * A hackathon roster usually arrives in bulk (Devfolio and Luma exports,
 * loaded by SQL, see docs/CERTIFICATES.md); a late or missing builder is
 * added here one at a time. Minting and emailing happen on Issue & send.
 */
import { useMemo, useState } from 'react';
import Link from 'next/link';
import AddParticipantPanel from '../AddParticipantPanel';
import { honorLabel, type CertEvent } from '../../../lib/certificates/events';
import { truncateAddress } from '../../../utils/linkedAccounts';
import { inputClass } from './useAdminApi';
import type { AdminCertificate } from '../../../types/certificates';

export default function BuildersTab({ ev, rows, onChanged }: { ev: CertEvent; rows: AdminCertificate[]; onChanged: () => void }) {
  const [search, setSearch] = useState('');
  const shown = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => [r.memberName, r.projectName ?? '', r.credentialId, ...r.emails].some((v) => v.toLowerCase().includes(q)));
  }, [rows, search]);
  const projects = new Set(rows.map((r) => r.projectSlug)).size;

  return (
    <>
      <AddParticipantPanel ev={ev} defaultRole="builder" onAdded={onChanged} />

      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, project, email…" className={`${inputClass} sm:max-w-sm`} />
        <p className="text-xs text-content-muted">
          {rows.length} builders · {projects} projects
        </p>
      </div>

      <div className="overflow-x-auto rounded-card border border-line-hairline">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-surface-inset text-[11px] uppercase tracking-wide text-content-faint">
            <tr>
              <th className="px-3 py-2.5 font-semibold">Builder</th>
              <th className="px-3 py-2.5 font-semibold">Project</th>
              <th className="px-3 py-2.5 font-semibold">Emails</th>
              <th className="px-3 py-2.5 font-semibold">Credential</th>
              <th className="px-3 py-2.5 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line-hairline">
            {shown.map((r) => (
              <tr key={r.id} className="bg-surface-slab align-top">
                <td className="px-3 py-3 font-medium text-content-primary">{r.memberName}</td>
                <td className="px-3 py-3">
                  <a href={`https://devfolio.co/projects/${r.projectSlug}`} target="_blank" rel="noopener noreferrer" className="text-content-primary hover:text-eth-blue-text">
                    {r.projectName}
                  </a>
                  {r.honors.map((h) => (
                    <p key={`${h.track}-${h.place}`} className="text-xs text-eth-blue-text">
                      {honorLabel(h, 'en')}
                    </p>
                  ))}
                </td>
                <td className="px-3 py-3 font-mono text-xs text-content-muted">
                  {r.emails.map((e) => (
                    <p key={e}>{e}</p>
                  ))}
                </td>
                <td className="px-3 py-3">
                  <Link href={`/certificate/${r.credentialId}`} className="font-mono text-xs text-eth-blue-text hover:underline">
                    {r.credentialId}
                  </Link>
                </td>
                <td className="px-3 py-3 text-xs">
                  {r.notifiedAt ? (
                    <span className="text-signal-confirmed">Emailed</span>
                  ) : r.issuedTx ? (
                    <span className="text-signal-confirmed">NFT #{r.tokenId}</span>
                  ) : r.wallet ? (
                    <span className="text-content-secondary">Wallet {truncateAddress(r.wallet)}</span>
                  ) : (
                    <span className="text-content-faint">Not claimed</span>
                  )}
                </td>
              </tr>
            ))}
            {shown.length === 0 && (
              <tr>
                <td colSpan={5} className="bg-surface-slab px-3 py-6 text-center text-sm text-content-muted">
                  {rows.length === 0 ? 'No builders on this event yet.' : 'Nobody matches.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
