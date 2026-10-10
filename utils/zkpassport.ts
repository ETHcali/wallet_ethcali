/**
 * ZKPassport personhood request, browser only.
 *
 * The query is built here, in full, rather than fetched as a dashboard policy:
 * ZKPassportNFT checks every part of it on chain and ZKPassport compares the
 * country list with the proof's list exactly, so app and contract must agree
 * byte for byte (scs-ethcali scripts/deploy-identity.ts holds the same values).
 * The dashboard policy `policy-1` on `ethcali.org` mirrors it; change all three
 * together.
 */

/** Registered in the ZKPassport dashboard; the contract checks it (verifyScopes). */
export const ZKPASSPORT_DOMAIN = 'ethcali.org';
/** The dashboard policy id; the contract checks it and it drives the nullifier. */
export const ZKPASSPORT_SCOPE = 'policy-1';
/**
 * Refused as nationality and as issuing country. Sorted: ZKPassport requires
 * the list in alphabetical order and the contract compares it exactly.
 */
export const ZKPASSPORT_EXCLUDED_COUNTRIES = [
  'AFG', 'BLR', 'CUB', 'IRN', 'MMR', 'PRK', 'RUS', 'SDN', 'SYR', 'VEN', 'YEM', 'ZWE',
] as const;

const getZKPassport = async () => {
  if (typeof window === 'undefined') {
    throw new Error('ZKPassport SDK can only be used in the browser');
  }
  const { ZKPassport } = await import('@zkpassport/sdk');
  // Explicit, not window.location: the app runs on app.ethcali.org while the
  // registered domain, and the one the contract checks, is ethcali.org.
  return new ZKPassport(ZKPASSPORT_DOMAIN);
};

/**
 * Request a proof the ZKPassportNFT on Ethereum will accept: adult, sanctions
 * (non-strict, matching SANCTIONS_STRICT = false), neither nationality nor
 * issuing country excluded, document type disclosed (passport vs ID card picks
 * the layout the contract decodes), bound to this wallet and to Ethereum.
 */
export const requestPersonhoodVerification = async (walletAddr: `0x${string}`) => {
  const zkPassport = await getZKPassport();

  const queryBuilder = await zkPassport.request({
    name: 'ETH CALI',
    logo: `${window.location.origin}/logo_eth_cali.png`,
    purpose: 'Prove you are a unique adult to get your ETH CALI identity NFT',
    scope: ZKPASSPORT_SCOPE,
    mode: 'compressed-evm',
  });

  const excluded = [...ZKPASSPORT_EXCLUDED_COUNTRIES];
  const request = queryBuilder
    .gte('age', 18)
    .sanctions()
    .out('nationality', excluded)
    .out('issuing_country', excluded)
    .disclose('document_type')
    .bind('user_address', walletAddr)
    .bind('chain', 'ethereum')
    .done();

  // The instance builds the contract's parameters from the proof afterwards.
  return { ...request, zkPassport };
};
