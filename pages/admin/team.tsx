/**
 * Team — the master list of the people behind ETH Cali.
 *
 * One editor per person, in two parts that live in two tables on purpose:
 * the public profile (team_members, the about page on ethcali.org) and the
 * private contact (team_member_contacts: emails, Telegram, wallet — never on
 * the site). Certificates pick people from here, per event.
 *
 * Every write goes to /api/admin/team, which checks ADMIN_ROLE on the site or
 * the certificates contract; this page's visibility is presentation only.
 */
import { useMemo, useState } from 'react';
import Head from 'next/head';
import { usePrivy } from '@privy-io/react-auth';
import { useQuery } from '@tanstack/react-query';
import AdminShell from '../../components/admin/AdminShell';
import Loading from '../../components/shared/Loading';
import Button from '../../components/shared/Button';
import { truncateAddress } from '../../utils/linkedAccounts';
import type { TeamContact, TeamMasterMember, TeamMasterResponse, TeamProfile, TeamSaveBody, TeamSaveResponse } from '../../types/team';

const input =
  'w-full rounded-control border border-line-hairline bg-surface-inset px-3 py-2 text-sm text-content-primary placeholder-content-faint focus:border-eth-blue focus:outline-none';

type Draft = { profile: Partial<TeamProfile>; contact: { email: string; extra: string; telegram: string; wallet: string } };

const empty = (): Draft => ({
  profile: { name: '', slug: '', status: '', role_es: '', role_en: '', since: '', image_path: '', linkedin_url: '', twitter_url: '', github_url: '', sort_order: 100, is_published: false },
  contact: { email: '', extra: '', telegram: '', wallet: '' },
});

const fromMember = (m: TeamMasterMember): Draft => ({
  profile: { ...m.profile },
  contact: {
    email: m.contact?.email ?? '',
    extra: (m.contact?.emails ?? []).filter((e) => e !== m.contact?.email).join(', '),
    telegram: m.contact?.telegram ?? '',
    wallet: m.contact?.wallet ?? '',
  },
});

const slugify = (name: string) =>
  name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="block text-xs text-content-muted">
      {label}
      <div className="mt-1">{children}</div>
      {hint && <p className="mt-0.5 text-[11px] text-content-faint">{hint}</p>}
    </label>
  );
}

function Editor({ member, onDone }: { member: TeamMasterMember | null; onDone: (saved: boolean) => void }) {
  const { getAccessToken } = usePrivy();
  const creating = member === null;
  const [d, setD] = useState<Draft>(() => (member ? fromMember(member) : empty()));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const p = (k: keyof TeamProfile, v: unknown) => setD((x) => ({ ...x, profile: { ...x.profile, [k]: v } }));
  const c = (k: keyof Draft['contact'], v: string) => setD((x) => ({ ...x, contact: { ...x.contact, [k]: v } }));

  async function save() {
    if (saving) return;
    setSaving(true);
    setError(null);
    try {
      const contact: Partial<TeamContact> = {
        email: d.contact.email.trim() || null,
        emails: d.contact.extra.split(/[,\s]+/).map((e) => e.trim()).filter(Boolean),
        telegram: d.contact.telegram.trim() || null,
        wallet: d.contact.wallet.trim() || null,
      };
      const body: TeamSaveBody = creating ? { profile: d.profile, contact } : { id: member!.profile.id, profile: d.profile, contact };
      const token = await getAccessToken();
      const res = await fetch('/api/admin/team', {
        method: creating ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      const out = (await res.json().catch(() => ({}))) as TeamSaveResponse & { error?: string };
      if (!res.ok) throw new Error(out.error ?? `Could not save (${res.status})`);
      onDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save');
    } finally {
      setSaving(false);
    }
  }

  const v = (k: keyof TeamProfile) => (d.profile[k] ?? '') as string;

  return (
    <div className="mb-5 rounded-card border border-line-brand/40 bg-surface-slab p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-content-primary">{creating ? 'New team member' : d.profile.name}</h2>
        <button type="button" onClick={() => onDone(false)} className="text-sm text-content-muted hover:text-content-primary">
          Close
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section>
          <p className="mb-1 text-sm font-semibold text-content-primary">Public profile</p>
          <p className="mb-3 text-xs text-content-muted">Shown on the ethcali.org about page when published.</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Full name">
              <input
                className={input}
                value={v('name')}
                onChange={(e) => {
                  p('name', e.target.value);
                  if (creating) p('slug', slugify(e.target.value));
                }}
              />
            </Field>
            <Field label="Slug" hint={creating ? 'The URL fragment; fixed once saved.' : 'Fixed: it is the public URL fragment.'}>
              <input className={`${input} font-mono`} value={v('slug')} disabled={!creating} onChange={(e) => p('slug', e.target.value)} />
            </Field>
            <Field label="Status" hint="Founder, Core, Elite, Volunteer, Former Core…">
              <input className={input} value={v('status')} onChange={(e) => p('status', e.target.value)} />
            </Field>
            <Field label="Since">
              <input type="date" className={input} value={v('since')} onChange={(e) => p('since', e.target.value)} />
            </Field>
            <Field label="Rol (ES)">
              <input className={input} value={v('role_es')} onChange={(e) => p('role_es', e.target.value)} />
            </Field>
            <Field label="Role (EN)">
              <input className={input} value={v('role_en')} onChange={(e) => p('role_en', e.target.value)} />
            </Field>
            <Field label="LinkedIn">
              <input className={input} value={v('linkedin_url')} placeholder="https://www.linkedin.com/in/…" onChange={(e) => p('linkedin_url', e.target.value)} />
            </Field>
            <Field label="X / Twitter">
              <input className={input} value={v('twitter_url')} placeholder="https://x.com/…" onChange={(e) => p('twitter_url', e.target.value)} />
            </Field>
            <Field label="GitHub">
              <input className={input} value={v('github_url')} placeholder="https://github.com/…" onChange={(e) => p('github_url', e.target.value)} />
            </Field>
            <Field label="Photo path" hint="Path on ethcali.org, e.g. /team/ana.jpg">
              <input className={input} value={v('image_path')} onChange={(e) => p('image_path', e.target.value)} />
            </Field>
            <Field label="Order">
              <input type="number" className={input} value={String(d.profile.sort_order ?? 0)} onChange={(e) => p('sort_order', Number(e.target.value))} />
            </Field>
            <label className="flex items-center gap-2 self-end pb-2 text-sm text-content-secondary">
              <input type="checkbox" checked={Boolean(d.profile.is_published)} onChange={(e) => p('is_published', e.target.checked)} className="h-4 w-4 accent-eth-blue" />
              Published on ethcali.org
            </label>
          </div>
        </section>

        <section>
          <p className="mb-1 text-sm font-semibold text-content-primary">Private contact</p>
          <p className="mb-3 text-xs text-content-muted">Only operators see this. Certificates go to these emails.</p>
          <div className="grid gap-3">
            <Field label="Email" hint="Primary: certificates, sign-in to their ETH Cali wallet.">
              <input className={`${input} font-mono`} value={d.contact.email} onChange={(e) => c('email', e.target.value)} />
            </Field>
            <Field label="Other emails" hint="Separate with commas. Any of them signs them in to see a certificate.">
              <input className={`${input} font-mono`} value={d.contact.extra} onChange={(e) => c('extra', e.target.value)} />
            </Field>
            <Field label="Telegram">
              <input className={input} value={d.contact.telegram} placeholder="@handle" onChange={(e) => c('telegram', e.target.value)} />
            </Field>
            <Field label="Wallet they gave us" hint="For reference. Certificates use their ETH Cali wallet unless changed per certificate.">
              <input className={`${input} font-mono`} value={d.contact.wallet} placeholder="0x…" onChange={(e) => c('wallet', e.target.value)} />
            </Field>
          </div>
        </section>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Button onClick={save} disabled={saving}>
          {saving ? 'Saving…' : creating ? 'Add to the team' : 'Save'}
        </Button>
        {error && <p className="text-sm text-signal-reverted">{error}</p>}
        {!creating && <DeleteMember member={member!} onDeleted={() => onDone(true)} />}
      </div>
    </div>
  );
}

/**
 * Remove someone from the team for good: the about page and the private
 * contact. Two steps on the page, typing the name to confirm — no browser
 * dialog. Hiding them (unpublish) is the reversible option and is said so.
 */
function DeleteMember({ member, onDeleted }: { member: TeamMasterMember; onDeleted: () => void }) {
  const { getAccessToken } = usePrivy();
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const name = member.profile.name;

  async function remove() {
    if (busy || typed.trim() !== name) return;
    setBusy(true);
    setError(null);
    try {
      const token = await getAccessToken();
      const res = await fetch(`/api/admin/team?id=${member.profile.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(body.error ?? `Could not delete (${res.status})`);
      onDeleted();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not delete');
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="min-h-tap px-2 text-sm font-semibold text-signal-reverted hover:underline sm:ml-auto">
        Delete from the team
      </button>
    );
  }
  return (
    <div className="w-full rounded-control border border-signal-reverted/40 bg-signal-reverted/10 p-4 text-sm">
      <p className="font-semibold text-signal-reverted">Delete {name} for good?</p>
      <p className="mt-1 text-xs text-content-secondary">
        They disappear from ethcali.org&apos;s about page on its next refresh, and their private contact is erased. Any certificate they hold stays:
        it is a token in their wallet. To take them off the site but keep the record, untick &quot;Published&quot; and save instead.
      </p>
      <label className="mt-3 block text-xs text-content-muted">
        Type their name to confirm
        <input value={typed} onChange={(e) => setTyped(e.target.value)} placeholder={name} className={`mt-1 ${input} sm:max-w-xs`} />
      </label>
      <div className="mt-3 flex items-center gap-3">
        <Button variant="destructive" size="small" onClick={remove} disabled={busy || typed.trim() !== name}>
          {busy ? 'Deleting…' : 'Delete'}
        </Button>
        <button type="button" onClick={() => setOpen(false)} className="text-sm text-content-muted hover:text-content-primary">
          Cancel
        </button>
        {error && <span className="text-sm text-signal-reverted">{error}</span>}
      </div>
    </div>
  );
}

export default function TeamAdmin() {
  const { ready, authenticated, getAccessToken } = usePrivy();
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<TeamMasterMember | null | undefined>(undefined);

  const query = useQuery({
    queryKey: ['admin-team'],
    enabled: ready && authenticated,
    queryFn: async () => {
      const token = await getAccessToken();
      const res = await fetch('/api/admin/team', { headers: { Authorization: `Bearer ${token}` } });
      const body = (await res.json().catch(() => ({}))) as TeamMasterResponse & { error?: string };
      if (!res.ok) throw new Error(body.error ?? `Request failed (${res.status})`);
      return body.team;
    },
  });

  const team = useMemo(() => query.data ?? [], [query.data]);
  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return team;
    return team.filter((m) =>
      [m.profile.name, m.profile.status ?? '', m.contact?.email ?? '', ...(m.contact?.emails ?? []), m.contact?.telegram ?? ''].some((v) =>
        v.toLowerCase().includes(q)
      )
    );
  }, [team, search]);
  const missingEmail = team.filter((m) => !m.contact?.email).length;

  return (
    <AdminShell active="team" title="Team" subtitle="Everyone behind ETH Cali: their public profile on ethcali.org and how to reach them.">
      <Head>
        <title>Team · Admin · ETH Cali</title>
      </Head>

      {editing !== undefined && (
        <Editor
          key={editing?.profile.id ?? 'new'}
          member={editing}
          onDone={(saved) => {
            setEditing(undefined);
            if (saved) void query.refetch();
          }}
        />
      )}

      {!ready || query.isLoading ? (
        <Loading text="Loading the team…" />
      ) : query.isError ? (
        <div className="rounded-card border border-line-hairline bg-surface-slab p-5 text-sm text-signal-reverted">{(query.error as Error).message}</div>
      ) : (
        <>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, status, email, Telegram…"
              className={`${input} sm:max-w-sm`}
            />
            <p className="text-xs text-content-muted">
              {team.length} people · {team.filter((m) => m.profile.is_published).length} on the site
              {missingEmail > 0 && <span className="text-signal-pending"> · {missingEmail} without an email</span>}
            </p>
            <div className="sm:ml-auto">
              <Button size="small" onClick={() => setEditing(null)}>
                New member
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-card border border-line-hairline">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="bg-surface-inset text-[11px] uppercase tracking-wide text-content-faint">
                <tr>
                  <th className="px-3 py-2.5 font-semibold">Member</th>
                  <th className="px-3 py-2.5 font-semibold">On the site</th>
                  <th className="px-3 py-2.5 font-semibold">Email (private)</th>
                  <th className="px-3 py-2.5 font-semibold">Telegram</th>
                  <th className="px-3 py-2.5 font-semibold">Wallet</th>
                  <th className="px-3 py-2.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-line-hairline">
                {rows.map((m) => (
                  <tr key={m.profile.id} className="bg-surface-slab align-top">
                    <td className="px-3 py-3">
                      <p className="font-medium text-content-primary">{m.profile.name}</p>
                      <p className="text-xs text-content-faint">{m.profile.status ?? '—'}</p>
                    </td>
                    <td className="px-3 py-3 text-xs">
                      {m.profile.is_published ? (
                        <span className="text-signal-confirmed">Published</span>
                      ) : (
                        <span className="text-content-faint">Hidden</span>
                      )}
                      {m.profile.linkedin_url && (
                        <a href={m.profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="ml-2 text-eth-blue-text hover:underline">
                          LinkedIn
                        </a>
                      )}
                    </td>
                    <td className="px-3 py-3 font-mono text-xs">
                      {m.contact?.email ? (
                        <>
                          <p className="text-content-secondary">{m.contact.email}</p>
                          {m.contact.emails.filter((e) => e !== m.contact?.email).map((e) => (
                            <p key={e} className="text-content-faint">{e}</p>
                          ))}
                        </>
                      ) : (
                        <span className="font-sans text-signal-pending">missing</span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-xs text-content-secondary">{m.contact?.telegram ?? <span className="text-content-faint">—</span>}</td>
                    <td className="px-3 py-3 font-mono text-xs text-content-secondary">
                      {m.contact?.wallet ? truncateAddress(m.contact.wallet) : <span className="font-sans text-content-faint">—</span>}
                    </td>
                    <td className="px-3 py-3 text-right">
                      <button type="button" onClick={() => setEditing(m)} className="min-h-tap px-2 text-sm font-semibold text-eth-blue-text hover:underline">
                        Edit
                      </button>
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
