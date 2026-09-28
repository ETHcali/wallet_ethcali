/**
 * Shipping zones: the flat price per parcel a USDC buyer is quoted, per zone.
 *
 * A change applies to the next quote. Orders already placed keep the price
 * their signed quote carries. Colombia resolves by city — a city listed in a
 * zone wins, otherwise the country's catch-all (the zone with no cities).
 * International zones stay off until a carrier account exists for them.
 */
import { useState } from 'react';
import { formatCop, useSwagAdminShipping, usePatchShippingZone, useTrm } from '../../hooks/swag';
import type { SwagAdminShippingZone } from '../../types/swag-orders';
import { CARD, FIELD, LABEL, Pill, Spinner, buttonClass } from './AdminPrimitives';

function ZoneCard({ zone }: { zone: SwagAdminShippingZone }) {
  const patch = usePatchShippingZone();
  const { rate } = useTrm();
  const [price, setPrice] = useState(String(zone.priceUsd));
  const [etaMin, setEtaMin] = useState(String(zone.etaMinDays));
  const [etaMax, setEtaMax] = useState(String(zone.etaMaxDays));
  const [cities, setCities] = useState(zone.cities.join(', '));
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const priceNum = Number(price);
  const invalid =
    !Number.isFinite(priceNum) || priceNum <= 0
      ? 'Price must be above 0.'
      : !Number.isInteger(Number(etaMin)) || !Number.isInteger(Number(etaMax)) || Number(etaMin) > Number(etaMax)
        ? 'Days must be whole numbers, minimum ≤ maximum.'
        : null;

  const run = async (setFlag: (v: boolean) => void, body: Parameters<typeof patch.mutateAsync>[0]) => {
    setFlag(true);
    setError(null);
    setSaved(false);
    try {
      await patch.mutateAsync(body);
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save.');
    } finally {
      setFlag(false);
    }
  };

  const save = () =>
    run(setSaving, {
      code: zone.code,
      priceUsd: priceNum,
      etaMinDays: Number(etaMin),
      etaMaxDays: Number(etaMax),
      ...(zone.cities.length > 0 || cities.trim() ? { cities: cities.split(',').map((c) => c.trim()).filter(Boolean) } : {}),
    });

  return (
    <li className={CARD}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-content-primary">{zone.labelEs}</p>
          <p className="mt-1 font-mono text-xs text-content-muted">{zone.code} · {zone.countries.join(' ')}</p>
        </div>
        <div className="flex items-center gap-2">
          <Pill tone={zone.active ? 'confirmed' : 'muted'}>{zone.active ? 'On' : 'Off'}</Pill>
          <button type="button" onClick={() => void run(setToggling, { code: zone.code, active: !zone.active })} disabled={toggling || saving} className={buttonClass('secondary')}>
            {toggling && <Spinner />}
            {toggling ? 'Saving…' : zone.active ? 'Turn off' : 'Turn on'}
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <label className="block">
          <span className={LABEL}>Price (USD)</span>
          <input type="number" min="0.01" step="0.01" inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} className={`${FIELD} font-mono`} disabled={saving} />
          {rate && Number.isFinite(priceNum) && priceNum > 0 && <span className="mt-1 block font-mono text-[11px] text-content-faint">≈ {formatCop(priceNum * rate)}</span>}
        </label>
        <label className="block">
          <span className={LABEL}>Transit, min days</span>
          <input type="number" min="0" step="1" value={etaMin} onChange={(e) => setEtaMin(e.target.value)} className={`${FIELD} font-mono`} disabled={saving} />
        </label>
        <label className="block">
          <span className={LABEL}>Transit, max days</span>
          <input type="number" min="0" step="1" value={etaMax} onChange={(e) => setEtaMax(e.target.value)} className={`${FIELD} font-mono`} disabled={saving} />
        </label>
        {(zone.cities.length > 0 || zone.countries.includes('CO')) && (
          <label className="block sm:col-span-3">
            <span className={LABEL}>Cities (comma-separated; empty = every other city in {zone.countries.join(', ')})</span>
            <textarea value={cities} onChange={(e) => setCities(e.target.value)} className={`${FIELD} min-h-[72px]`} disabled={saving} spellCheck={false} />
          </label>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button type="button" onClick={() => void save()} disabled={saving || toggling || Boolean(invalid)} className={buttonClass('primary')}>
          {saving && <Spinner />}
          {saving ? 'Saving…' : 'Save'}
        </button>
        {invalid && <span className="text-xs text-content-muted">{invalid}</span>}
        {saved && !error && <span className="text-xs text-signal-confirmed">Saved. New quotes use it now.</span>}
        {error && <span className="text-xs text-signal-reverted">{error}</span>}
      </div>
    </li>
  );
}

export function AdminShipping() {
  const query = useSwagAdminShipping();
  if (query.isLoading) return <p className="text-sm text-content-faint">Loading zones…</p>;
  if (query.error) return <p className="text-sm text-signal-reverted">{query.error.message}</p>;
  return (
    <div className="space-y-4">
      <p className="text-sm text-content-muted">
        Flat price per parcel, paid in USDC as its own line at checkout. Replace the starting prices with real carrier
        quotes. A change applies to new quotes only.
      </p>
      <ul className="space-y-3">
        {(query.data?.zones ?? []).map((z) => <ZoneCard key={`${z.code}:${z.updatedAt}`} zone={z} />)}
      </ul>
    </div>
  );
}
