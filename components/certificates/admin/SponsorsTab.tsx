/**
 * Sponsors — the logos along the bottom of an event's diploma, in order.
 *
 * Picked from ethcali.org's partners (Site content owns their names, links
 * and site logos). What a diploma needs that the site does not is a print
 * logo: the artwork as it reads on white paper. A partner without one is
 * listed but skipped on the diploma until a PNG is uploaded here, which pins
 * it to IPFS and stores ipfs://<cid> on the partner — every later event
 * reuses it.
 */
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Button from '../../shared/Button';
import { PinnedWarning } from './EventTab';
import { useAdminApi, inputClass, logoUrl, siteLogoUrl } from './useAdminApi';
import type { CertSponsorsResponse, PartnerForCerts } from '../../../types/certificates';

type Item = { partnerId: number; printHeight: number };

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(new Error('Could not read the file'));
    r.readAsDataURL(file);
  });
}

function UploadPrintLogo({ partner, onUploaded }: { partner: PartnerForCerts; onUploaded: () => void }) {
  const api = useAdminApi();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return (
    <span className="inline-flex items-center gap-2">
      <label className={`cursor-pointer text-xs font-semibold text-eth-blue-text hover:underline ${busy ? 'pointer-events-none opacity-60' : ''}`}>
        {busy ? 'Pinning…' : partner.printLogoPath ? 'Replace print logo' : 'Upload print logo (PNG)'}
        <input
          type="file"
          accept="image/png"
          className="sr-only"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            e.target.value = '';
            if (!file || busy) return;
            setBusy(true);
            setError(null);
            try {
              await api('/api/certificates/admin/sponsors', { method: 'POST', body: { partnerId: partner.id, file: await readAsDataUrl(file) } });
              onUploaded();
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Upload failed');
            } finally {
              setBusy(false);
            }
          }}
        />
      </label>
      {error && <span className="text-xs text-signal-reverted">{error}</span>}
    </span>
  );
}

export default function SponsorsTab({ eventKey, pinned, onChanged }: { eventKey: string; pinned: number; onChanged: () => void }) {
  const api = useAdminApi();
  const query = useQuery({
    queryKey: ['cert-sponsors', eventKey],
    queryFn: () => api<CertSponsorsResponse>(`/api/certificates/admin/sponsors?event=${encodeURIComponent(eventKey)}`),
  });
  const [items, setItems] = useState<Item[]>([]);
  const [dirty, setDirty] = useState(false);
  const [add, setAdd] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (query.data && !dirty) setItems(query.data.sponsors);
  }, [query.data, dirty]);

  const partners = new Map((query.data?.partners ?? []).map((p) => [p.id, p]));
  const change = (next: Item[]) => {
    setItems(next);
    setDirty(true);
    setSaved(false);
  };
  const move = (i: number, by: number) => {
    const next = [...items];
    const [x] = next.splice(i, 1);
    next.splice(i + by, 0, x);
    change(next);
  };

  async function save() {
    if (saving) return;
    setSaving(true);
    setError(null);
    try {
      await api('/api/certificates/admin/sponsors', { method: 'PUT', body: { event: eventKey, sponsors: items } });
      setDirty(false);
      setSaved(true);
      void query.refetch();
      onChanged();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save');
    } finally {
      setSaving(false);
    }
  }

  if (query.isLoading) return <p className="text-sm text-content-muted">Loading sponsors…</p>;
  if (query.isError) return <p className="text-sm text-signal-reverted">{(query.error as Error).message}</p>;

  const available = (query.data?.partners ?? []).filter((p) => !items.some((i) => i.partnerId === p.id));

  return (
    <div className="rounded-card border border-line-hairline bg-surface-slab p-5">
      <p className="text-sm font-semibold text-content-primary">On the diploma, left to right</p>
      <p className="mb-4 text-xs text-content-muted">
        Partners come from Site content. Each needs a print logo, the PNG as it reads on white paper; height evens out a square mark against a wide
        wordmark.
      </p>
      <PinnedWarning pinned={pinned} />

      <ol className="divide-y divide-line-hairline rounded-card border border-line-hairline">
        {items.map((it, i) => {
          const p = partners.get(it.partnerId);
          const print = logoUrl(p?.printLogoPath ?? null);
          return (
            <li key={it.partnerId} className="flex flex-wrap items-center gap-4 p-3">
              <span className="w-5 text-center text-xs text-content-faint">{i + 1}</span>
              <div className="flex h-12 w-36 items-center justify-center rounded bg-white px-2">
                {print ? (
                  // eslint-disable-next-line @next/next/no-img-element -- app file or IPFS gateway
                  <img src={print} alt={`${p?.name} print logo`} style={{ height: Math.min(40, it.printHeight) }} className="w-auto object-contain" />
                ) : (
                  <span className="text-[11px] font-semibold text-signal-reverted">no print logo</span>
                )}
              </div>
              <div className="min-w-[160px] flex-1">
                <p className="text-sm font-medium text-content-primary">{p?.name ?? `Partner ${it.partnerId}`}</p>
                {p && (
                  <UploadPrintLogo
                    partner={p}
                    onUploaded={() => {
                      void query.refetch();
                      onChanged();
                    }}
                  />
                )}
              </div>
              <label className="flex items-center gap-2 text-xs text-content-muted">
                Height
                <input
                  type="number"
                  min={10}
                  max={60}
                  value={it.printHeight}
                  onChange={(e) => change(items.map((x, j) => (j === i ? { ...x, printHeight: Number(e.target.value) } : x)))}
                  className={`${inputClass} w-20`}
                />
              </label>
              <div className="flex gap-1">
                <button type="button" disabled={i === 0} onClick={() => move(i, -1)} className="min-h-tap px-2 text-sm text-content-muted hover:text-content-primary disabled:opacity-30" aria-label="Move earlier">
                  ↑
                </button>
                <button type="button" disabled={i === items.length - 1} onClick={() => move(i, 1)} className="min-h-tap px-2 text-sm text-content-muted hover:text-content-primary disabled:opacity-30" aria-label="Move later">
                  ↓
                </button>
                <button type="button" onClick={() => change(items.filter((_, j) => j !== i))} className="min-h-tap px-2 text-sm text-signal-reverted hover:underline">
                  Remove
                </button>
              </div>
            </li>
          );
        })}
        {items.length === 0 && <li className="p-4 text-sm text-content-muted">No sponsors: the diploma prints none.</li>}
      </ol>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <select value={add} onChange={(e) => setAdd(e.target.value)} className={`${inputClass} sm:max-w-sm`} aria-label="Add a partner">
          <option value="">Add a partner…</option>
          {available.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} · {p.kind}
              {p.printLogoPath ? '' : ' · no print logo yet'}
            </option>
          ))}
        </select>
        <Button
          variant="secondary"
          size="small"
          disabled={!add}
          onClick={() => {
            change([...items, { partnerId: Number(add), printHeight: 30 }]);
            setAdd('');
          }}
        >
          Add
        </Button>
        <div className="flex items-center gap-3 sm:ml-auto">
          {saved && <span className="text-sm text-signal-confirmed">Saved.</span>}
          {error && <span className="text-sm text-signal-reverted">{error}</span>}
          <Button onClick={save} disabled={saving || !dirty}>
            {saving ? 'Saving…' : 'Save sponsors'}
          </Button>
        </div>
      </div>

      {items.length > 0 && (
        <details className="mt-5">
          <summary className="cursor-pointer text-xs text-content-muted">Site logos of the partners on the list</summary>
          <div className="mt-3 flex flex-wrap gap-3 rounded-card bg-surface-void p-3">
            {items.map((it) => {
              const p = partners.get(it.partnerId);
              const src = siteLogoUrl(p?.logoPath ?? null);
              return src ? (
                // eslint-disable-next-line @next/next/no-img-element -- ethcali.org artwork
                <img key={it.partnerId} src={src} alt={p?.name ?? ''} className="h-8 w-auto" />
              ) : null;
            })}
          </div>
        </details>
      )}
    </div>
  );
}
