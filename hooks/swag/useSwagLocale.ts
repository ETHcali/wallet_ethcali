/**
 * Which language the swag copy renders in.
 *
 * The wallet app has no routing-level i18n, so this is the smallest honest
 * version: English on the server and first paint (what the rest of the app
 * speaks), Spanish after mount for a Spanish-language browser. Product names
 * and error copy come in both; the other language rides along in a `title`
 * attribute so nothing is lost either way.
 */
import { useEffect, useState } from 'react';
import type { SwagProduct } from '../../types/swag';

export type SwagLocale = 'es' | 'en';

export function useSwagLocale(): SwagLocale {
  const [locale, setLocale] = useState<SwagLocale>('en');

  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.language?.toLowerCase().startsWith('es')) {
      setLocale('es');
    }
  }, []);

  return locale;
}

export function productName(product: SwagProduct, locale: SwagLocale): string {
  return locale === 'es' ? product.name_es : product.name_en;
}

export function productDescription(product: SwagProduct, locale: SwagLocale): string {
  return locale === 'es' ? product.description_es : product.description_en;
}

/** The name in the *other* language, for the title attribute. */
export function productAltName(product: SwagProduct, locale: SwagLocale): string {
  return locale === 'es' ? product.name_en : product.name_es;
}
