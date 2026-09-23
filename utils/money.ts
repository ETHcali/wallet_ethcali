/**
 * The two fiat formats the app prints, and nowhere else.
 *
 *   formatUsd(10)      → "US$10"
 *   formatUsd(13.5)    → "US$13.50"
 *   formatCop(32087)   → "≈ COP 32.000"
 *
 * Dollars carry cents only when there are cents, and are spelled "US$" because
 * pesos sit beside them. Pesos are rounded to the thousand the way ethcali.org
 * and the card checkout price them (see pages/api/cron/swag-prices.ts), grouped
 * es-CO with a dot, and marked "≈": a peso figure here is always a conversion.
 */

/** Group digits with `sep`, always — es-CO in ICU skips the dot below 10.000. */
function group(integer: number, sep: string): string {
  return Math.trunc(Math.abs(integer)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, sep);
}

interface UsdOptions {
  /** Always print cents (balances), even on a round number. */
  cents?: boolean;
}

export function formatUsd(value: number, { cents = false }: UsdOptions = {}): string {
  const rounded = Math.round(value * 100) / 100;
  const whole = Number.isInteger(rounded);
  const sign = rounded < 0 ? '−' : '';
  const intPart = group(rounded, ',');
  const fraction = cents || !whole ? `.${Math.round((Math.abs(rounded) % 1) * 100).toString().padStart(2, '0')}` : '';
  return `${sign}US$${intPart}${fraction}`;
}

interface CopOptions {
  /** Drop the leading "≈" where the context already says it is a conversion. */
  approx?: boolean;
}

export function formatCop(value: number, { approx = true }: CopOptions = {}): string {
  const thousands = Math.round(value / 1000) * 1000;
  return `${approx ? '≈ ' : ''}COP ${group(thousands, '.')}`;
}
