import { useState } from 'react';
import type { SwagShipping } from '../../types/swag';
import { useShippingZones } from '../../hooks/swag';

interface ShippingFormProps {
  initial?: SwagShipping | null;
  submitLabel: string;
  pendingLabel: string;
  pending: boolean;
  onSubmit: (shipping: SwagShipping) => void;
}

const EMPTY: SwagShipping = {
  name: '',
  phone: '',
  address1: '',
  address2: '',
  city: '',
  region: '',
  country: 'CO',
  document: '',
  notes: '',
};

const COUNTRY_NAMES: Record<string, string> = { CO: 'Colombia' };

const FIELD =
  'w-full rounded-control border border-line-strong bg-surface-inset px-3 py-3 text-base text-content-primary placeholder:text-content-faint focus:border-line-brand focus:outline-none md:text-sm';

const LABEL = 'mb-1 block text-xs font-semibold text-content-secondary';

/**
 * Where to send it. Only collects the address; the checkout turns it into a
 * signed shipping quote before anything is paid, so the buyer sees the
 * shipping cost as its own line first. Countries come from the active
 * shipping zones — the store does not offer an address it cannot quote.
 */
export function ShippingForm({ initial, submitLabel, pendingLabel, pending, onSubmit }: ShippingFormProps) {
  const [form, setForm] = useState<SwagShipping>(initial ?? EMPTY);
  const zones = useShippingZones();
  const countries = Array.from(new Set((zones.data?.zones ?? []).flatMap((z) => z.countries))).sort();

  const set = (key: keyof SwagShipping) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const documentDigits = (form.document ?? '').replace(/[^0-9]/g, '');
  const needsDocument = form.country === 'CO';
  const missing =
    !form.name.trim() || !form.phone.trim() || !form.address1.trim() || !form.city.trim() || !form.region.trim() || !form.country.trim() ||
    (needsDocument && !/^[0-9]{5,12}$/.test(documentDigits));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...form,
      name: form.name.trim(),
      phone: form.phone.trim(),
      address1: form.address1.trim(),
      city: form.city.trim(),
      region: form.region.trim(),
      country: form.country.trim().toUpperCase(),
      address2: form.address2?.trim() || undefined,
      document: documentDigits || undefined,
      notes: form.notes?.trim() || undefined,
    });
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <div>
        <label className={LABEL} htmlFor="ship-name">Full name</label>
        <input id="ship-name" className={FIELD} value={form.name} onChange={set('name')} autoComplete="name" required />
      </div>
      {needsDocument && (
        <div>
          <label className={LABEL} htmlFor="ship-document">Cédula or NIT (the carrier requires it)</label>
          <input id="ship-document" className={`${FIELD} font-mono`} value={form.document ?? ''} onChange={set('document')} inputMode="numeric" autoComplete="off" required />
        </div>
      )}
      <div>
        <label className={LABEL} htmlFor="ship-phone">Phone (WhatsApp)</label>
        <input id="ship-phone" className={FIELD} value={form.phone} onChange={set('phone')} autoComplete="tel" inputMode="tel" required />
      </div>
      <div>
        <label className={LABEL} htmlFor="ship-address1">Address</label>
        <input id="ship-address1" className={FIELD} value={form.address1} onChange={set('address1')} autoComplete="address-line1" required />
      </div>
      <div>
        <label className={LABEL} htmlFor="ship-address2">Apartment, unit, tower (optional)</label>
        <input id="ship-address2" className={FIELD} value={form.address2 ?? ''} onChange={set('address2')} autoComplete="address-line2" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={LABEL} htmlFor="ship-city">City</label>
          <input id="ship-city" className={FIELD} value={form.city} onChange={set('city')} autoComplete="address-level2" required />
        </div>
        <div>
          <label className={LABEL} htmlFor="ship-region">Department / state</label>
          <input id="ship-region" className={FIELD} value={form.region} onChange={set('region')} autoComplete="address-level1" required />
        </div>
      </div>
      <div>
        <label className={LABEL} htmlFor="ship-country">Country</label>
        <select id="ship-country" className={`${FIELD} appearance-none`} value={form.country} onChange={set('country')} autoComplete="country" required>
          {(countries.length > 0 ? countries : ['CO']).map((c) => (
            <option key={c} value={c}>{COUNTRY_NAMES[c] ?? c}</option>
          ))}
        </select>
        {countries.length <= 1 && <p className="mt-1 text-xs text-content-faint">We ship within Colombia for now.</p>}
      </div>
      <div>
        <label className={LABEL} htmlFor="ship-notes">Notes for the courier (optional)</label>
        <textarea id="ship-notes" className={`${FIELD} min-h-[72px]`} value={form.notes ?? ''} onChange={set('notes')} />
      </div>

      <button
        type="submit"
        disabled={missing || pending}
        className="flex min-h-tap w-full items-center justify-center rounded-control bg-eth-blue px-6 text-[15px] font-semibold text-on-brand transition-colors hover:bg-eth-blue-lift disabled:cursor-not-allowed disabled:bg-surface-ridge disabled:text-content-faint"
      >
        {pending ? pendingLabel : submitLabel}
      </button>
    </form>
  );
}
