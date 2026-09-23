import { NextResponse, type NextRequest } from 'next/server';

/**
 * Product URLs are lowercase. /swag/ETHCALI-CAP-PEPE-2026 (the SKU as it
 * appears on chain and in Supabase) redirects to /swag/ethcali-cap-pepe-2026,
 * the prerendered page. Done at the edge so no server render, and no Privy
 * import, happens for a miscased link. Query string (?pay=usdc&size=M and
 * utm_*) is preserved.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const lower = pathname.toLowerCase();
  if (lower !== pathname) {
    const url = request.nextUrl.clone();
    url.pathname = lower;
    return NextResponse.redirect(url, 308);
  }
  return NextResponse.next();
}

export const config = {
  matcher: '/swag/:sku',
};
