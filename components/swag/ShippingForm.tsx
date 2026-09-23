import { useState } from 'react';
import type { SwagShipping, SwagSize } from '../../types/swag';
import { useCreateSwagOrder } from '../../hooks/swag';

interface ShippingFormProps {
  txHash: string;
  size: SwagSize | null;
  quantity: number;
  onSaved: () => void;
}

const EMPTY: SwagShipping = {
  name: '',
  phone: '',
  address1: '',
  address2: '',
  city: '',
  region: '',
  country: 'CO',
  notes: '',
};

const FIELD =
  'w-full rounded-control border border-line-strong bg-surface-inset px-3 py-3 text-sm text-content-primary placeholder:text-content-faint focus:border-line-brand focus:outline-none';

const LABEL = 'mb-1 block text-xs font-semibold text-content-secondary';

/**
 * Where to send it. Posted with the tx hash; the server reads the Purchased
 * log from the receipt and ties the row to the buyer, so nothing typed here
 * can claim a purchase that did not happen.
 */
export function ShippingForm({ txHash, size, quantity, onSaved }: ShippingFormProps) {
  const [form, setForm] = useState<SwagShipping>(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const create = useCreateSwagOrder();

  const set = (key: keyof SwagShipping) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const missing = !form.name.trim() || !form.phone.trim() || !form.address1.trim() || !form.city.trim() || !form.region.trim() || !form.country.trim();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await create.mutateAsync({
        txHash,
        size,
        quantity,
        shipping: {
          ...form,
          country: form.country.trim().toUpperCase(),
          address2: form.address2?.trim() || undefined,
          notes: form.notes?.trim() || undefined,
        },
      });
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save the order.');
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <div>
        <label className={LABEL} htmlFor="ship-name">Full name</label>
        <input id="ship-name" className={FIELD} value={form.name} onChange={set('name')} autoComplete="name" required />
      </div>
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
        <input id="ship-country" className={`${FIELD} font-mono uppercase`} value={form.country} onChange={set('country')} autoComplete="country" maxLength={2} required />
      </div>
      <div>
        <label className={LABEL} htmlFor="ship-notes">Notes for the courier (optional)</label>
        <textarea id="ship-notes" className={`${FIELD} min-h-[72px]`} value={form.notes ?? ''} onChange={set('notes')} />
      </div>

      {size && (
        <p className="text-xs text-content-muted">
          Size <span className="font-mono text-content-primary">{size}</span> · quantity{' '}
          <span className="font-mono text-content-primary">{quantity}</span>
        </p>
      )}

      {error && (
        <p role="alert" className="rounded-chip border border-signal-reverted/30 bg-signal-reverted/10 px-3 py-2 text-sm text-signal-reverted">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={missing || create.isPending}
        className="flex min-h-tap w-full items-center justify-center rounded-control bg-eth-blue px-6 text-[15px] font-semibold text-on-brand transition-colors hover:bg-eth-blue-lift disabled:cursor-not-allowed disabled:bg-surface-ridge disabled:text-content-faint"
      >
        {create.isPending ? 'Saving…' : 'Save shipping details'}
      </button>
    </form>
  );
}
