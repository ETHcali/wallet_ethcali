/**
 * ZKPassport - Personhood Verification
 * Client-side only implementation
 */

import { logger } from './logger';
// Dynamic import to avoid SSR issues
const getZKPassportSDK = async () => {
  if (typeof window === 'undefined') {
    throw new Error('ZKPassport SDK can only be used in the browser');
  }
  const { ZKPassport } = await import('@zkpassport/sdk');
  return ZKPassport;
};

// Initialize ZKPassport (auto-detects domain in browser)
const getZKPassportInstance = async () => {
  const ZKPassport = await getZKPassportSDK();
  return new ZKPassport(); // Auto-detects domain from window.location
};

/**
 * Request personhood verification using ZK proofs suitable for on-chain minting.
 * Requires mode "compressed-evm" for on-chain proof generation.
 * Scope must match the deployed contract's scope value: "ethcali-verification".
 * @param walletAddr - The connected wallet address to bind to the proof
 */
export const requestPersonhoodVerification = async (walletAddr: `0x${string}` | string) => {
  const zkPassport = await getZKPassportInstance();

  const queryBuilder = await zkPassport.request({
    name: "ETH CALI Wallet",
    logo: "/logo_eth_cali.png",
    purpose: "Prove your personhood to access ETH CALI",
    scope: "ethcali-verification",
    mode: "compressed-evm",
  } as any);

  const {
    url,
    requestId,
    onRequestReceived,
    onGeneratingProof,
    onProofGenerated,
    onResult,
    onReject,
    onError,
  } = queryBuilder
    .gte("age", 18)
    .disclose("nationality")
    .disclose("document_type")
    .bind("user_address", walletAddr as `0x${string}`)
    .done();

  return {
    url,
    requestId,
    onRequestReceived,
    onGeneratingProof,
    onProofGenerated,
    onResult,
    onReject,
    onError,
    // Return instance so the hook can call getSolidityVerifierParameters
    zkPassport,
  };
};

/**
 * Check if unique identifier is already registered
 */
export const checkUniqueIdentifier = async (uniqueIdentifier: string): Promise<boolean> => {
  try {
    const response = await fetch(`/api/check-personhood/${uniqueIdentifier}`);
    const data = await response.json();
    return data.registered || false;
  } catch (error) {
    logger.error('Error checking unique identifier:', error);
    return false;
  }
};

/**
 * Register unique identifier
 */
export const registerUniqueIdentifier = async (uniqueIdentifier: string, email?: string): Promise<boolean> => {
  try {
    const response = await fetch('/api/register-personhood', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uniqueIdentifier, email }),
    });
    const data = await response.json();
    return data.success || false;
  } catch (error) {
    logger.error('Error registering unique identifier:', error);
    return false;
  }
};
