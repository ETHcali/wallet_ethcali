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
 * Request personhood verification
 * Returns unique identifier without revealing personal data
 */
export const requestPersonhoodVerification = async () => {
  const zkPassport = await getZKPassportInstance();

  const queryBuilder = await zkPassport.request({
    name: "ETH CALI Wallet",
    logo: "/logo_eth_cali.png",
    purpose: "Prove your personhood",
    scope: "personhood",
  });

  const {
    url,
    requestId,
    onRequestReceived,
    onGeneratingProof,
    onProofGenerated,
    onResult,
    onReject,
    onError,
  } = queryBuilder.facematch("strict").done();

  return {
    url,
    requestId,
    onRequestReceived,
    onGeneratingProof,
    onProofGenerated,
    onResult,
    onReject,
    onError,
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
