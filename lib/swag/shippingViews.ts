/** swag_shipping_zones rows → the shape the storefront and the admin read. */
import type { ShippingZoneRow } from './shipping';
import type { SwagShippingZoneView } from '../../types/swag-orders';

export function toZoneView(z: ShippingZoneRow): SwagShippingZoneView {
  return {
    code: z.code,
    labelEs: z.label_es,
    labelEn: z.label_en,
    countries: z.countries,
    priceUsd: Number(z.price_usd),
    etaMinDays: z.eta_min_days,
    etaMaxDays: z.eta_max_days,
  };
}
