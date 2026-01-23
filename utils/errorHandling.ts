/**
 * Centralized error handling utilities for the ETH Cali Wallet
 * Provides user-friendly error messages and consistent error processing
 */

export interface UserFriendlyError {
  message: string;
  code: string;
  details?: string;
  recoverable: boolean;
}

export interface ErrorContext {
  component?: string;
  action?: string;
  chainId?: number;
  address?: string;
  transactionHash?: string;
  additionalData?: Record<string, unknown>;
}

/**
 * Common error codes and their user-friendly messages
 */
export const ERROR_MESSAGES: Record<string, string> = {
  // User actions
  USER_REJECTED: 'Transaction was cancelled',
  USER_DENIED: 'Request was denied by the user',

  // Wallet errors
  INSUFFICIENT_FUNDS: 'Insufficient funds for this transaction',
  INSUFFICIENT_GAS: 'Not enough gas to complete the transaction',
  WALLET_NOT_CONNECTED: 'Please connect your wallet first',
  WALLET_LOCKED: 'Your wallet is locked. Please unlock it to continue',

  // Network errors
  NETWORK_ERROR: 'Network connection error. Please check your internet connection',
  NETWORK_TIMEOUT: 'Request timed out. Please try again',
  CHAIN_MISMATCH: 'Please switch to the correct network',
  RPC_ERROR: 'Error communicating with the blockchain',

  // Contract errors
  CONTRACT_ERROR: 'Smart contract error',
  EXECUTION_REVERTED: 'Transaction would fail. Please check your inputs',
  NONCE_TOO_LOW: 'Transaction nonce is too low. Please try again',
  REPLACEMENT_UNDERPRICED: 'Gas price too low to replace the pending transaction',

  // Token errors
  INVALID_ADDRESS: 'Invalid wallet address',
  INVALID_AMOUNT: 'Invalid amount entered',
  AMOUNT_TOO_LOW: 'Amount is too low',
  AMOUNT_TOO_HIGH: 'Amount exceeds your balance',

  // Faucet errors
  ALREADY_CLAIMED: 'You have already claimed from this faucet',
  NOT_WHITELISTED: 'You are not whitelisted for this vault',
  VAULT_EMPTY: 'This vault is currently empty',
  CLAIM_COOLDOWN: 'Please wait before claiming again',

  // SWAG errors
  PRODUCT_UNAVAILABLE: 'This product is currently unavailable',
  ALREADY_REDEEMED: 'This NFT has already been redeemed',
  INVALID_SIGNATURE: 'Invalid signature for redemption',

  // ZKPassport errors
  VERIFICATION_FAILED: 'Identity verification failed',
  ALREADY_VERIFIED: 'You have already been verified',
  PROOF_INVALID: 'The provided proof is invalid',

  // Generic errors
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again',
  TIMEOUT: 'Operation timed out. Please try again',
  RATE_LIMITED: 'Too many requests. Please wait a moment',
};

/**
 * Known error patterns and their mappings to error codes
 */
const ERROR_PATTERNS: Array<{ pattern: RegExp; code: string }> = [
  { pattern: /user rejected/i, code: 'USER_REJECTED' },
  { pattern: /user denied/i, code: 'USER_DENIED' },
  { pattern: /insufficient funds/i, code: 'INSUFFICIENT_FUNDS' },
  { pattern: /insufficient balance/i, code: 'INSUFFICIENT_FUNDS' },
  { pattern: /gas too low/i, code: 'INSUFFICIENT_GAS' },
  { pattern: /out of gas/i, code: 'INSUFFICIENT_GAS' },
  { pattern: /network/i, code: 'NETWORK_ERROR' },
  { pattern: /timeout/i, code: 'NETWORK_TIMEOUT' },
  { pattern: /chain.*mismatch/i, code: 'CHAIN_MISMATCH' },
  { pattern: /wrong.*network/i, code: 'CHAIN_MISMATCH' },
  { pattern: /execution reverted/i, code: 'EXECUTION_REVERTED' },
  { pattern: /nonce too low/i, code: 'NONCE_TOO_LOW' },
  { pattern: /replacement.*underpriced/i, code: 'REPLACEMENT_UNDERPRICED' },
  { pattern: /invalid address/i, code: 'INVALID_ADDRESS' },
  { pattern: /already claimed/i, code: 'ALREADY_CLAIMED' },
  { pattern: /not whitelisted/i, code: 'NOT_WHITELISTED' },
  { pattern: /whitelist/i, code: 'NOT_WHITELISTED' },
  { pattern: /cooldown/i, code: 'CLAIM_COOLDOWN' },
  { pattern: /already redeemed/i, code: 'ALREADY_REDEEMED' },
  { pattern: /invalid signature/i, code: 'INVALID_SIGNATURE' },
  { pattern: /verification failed/i, code: 'VERIFICATION_FAILED' },
  { pattern: /already verified/i, code: 'ALREADY_VERIFIED' },
  { pattern: /proof.*invalid/i, code: 'PROOF_INVALID' },
  { pattern: /rate.*limit/i, code: 'RATE_LIMITED' },
];

/**
 * Extract error message from various error formats
 */
function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  if (typeof error === 'object' && error !== null) {
    const errorObj = error as Record<string, unknown>;

    // Check common error message properties
    if (typeof errorObj.message === 'string') {
      return errorObj.message;
    }
    if (typeof errorObj.reason === 'string') {
      return errorObj.reason;
    }
    if (typeof errorObj.error === 'string') {
      return errorObj.error;
    }
    if (
      typeof errorObj.error === 'object' &&
      errorObj.error !== null &&
      typeof (errorObj.error as Record<string, unknown>).message === 'string'
    ) {
      return (errorObj.error as Record<string, unknown>).message as string;
    }
    // Viem/ethers error format
    if (typeof errorObj.shortMessage === 'string') {
      return errorObj.shortMessage;
    }
  }

  return 'Unknown error';
}

/**
 * Identify error code from error message
 */
function identifyErrorCode(message: string): string {
  for (const { pattern, code } of ERROR_PATTERNS) {
    if (pattern.test(message)) {
      return code;
    }
  }
  return 'UNKNOWN_ERROR';
}

/**
 * Determine if an error is recoverable (user can retry)
 */
function isRecoverableError(code: string): boolean {
  const nonRecoverableErrors = [
    'ALREADY_CLAIMED',
    'NOT_WHITELISTED',
    'ALREADY_REDEEMED',
    'ALREADY_VERIFIED',
  ];
  return !nonRecoverableErrors.includes(code);
}

/**
 * Handle contract errors and return user-friendly error messages
 */
export function handleContractError(error: unknown): UserFriendlyError {
  const rawMessage = extractErrorMessage(error);
  const code = identifyErrorCode(rawMessage);
  const message = ERROR_MESSAGES[code] || ERROR_MESSAGES.UNKNOWN_ERROR;

  return {
    message,
    code,
    details: process.env.NODE_ENV === 'development' ? rawMessage : undefined,
    recoverable: isRecoverableError(code),
  };
}

/**
 * Handle network errors and return user-friendly error messages
 */
export function handleNetworkError(error: unknown): UserFriendlyError {
  const rawMessage = extractErrorMessage(error);

  if (rawMessage.toLowerCase().includes('timeout')) {
    return {
      message: ERROR_MESSAGES.NETWORK_TIMEOUT,
      code: 'NETWORK_TIMEOUT',
      recoverable: true,
    };
  }

  if (rawMessage.toLowerCase().includes('fetch')) {
    return {
      message: ERROR_MESSAGES.NETWORK_ERROR,
      code: 'NETWORK_ERROR',
      recoverable: true,
    };
  }

  return {
    message: ERROR_MESSAGES.NETWORK_ERROR,
    code: 'NETWORK_ERROR',
    details: process.env.NODE_ENV === 'development' ? rawMessage : undefined,
    recoverable: true,
  };
}

/**
 * Handle wallet-related errors
 */
export function handleWalletError(error: unknown): UserFriendlyError {
  const rawMessage = extractErrorMessage(error);
  const code = identifyErrorCode(rawMessage);

  // Special handling for user rejection
  if (code === 'USER_REJECTED' || code === 'USER_DENIED') {
    return {
      message: ERROR_MESSAGES.USER_REJECTED,
      code: 'USER_REJECTED',
      recoverable: true,
    };
  }

  const message = ERROR_MESSAGES[code] || ERROR_MESSAGES.UNKNOWN_ERROR;

  return {
    message,
    code,
    details: process.env.NODE_ENV === 'development' ? rawMessage : undefined,
    recoverable: isRecoverableError(code),
  };
}

/**
 * Generic error handler that attempts to categorize the error
 */
export function handleError(error: unknown): UserFriendlyError {
  const rawMessage = extractErrorMessage(error);
  const code = identifyErrorCode(rawMessage);
  const message = ERROR_MESSAGES[code] || ERROR_MESSAGES.UNKNOWN_ERROR;

  return {
    message,
    code,
    details: process.env.NODE_ENV === 'development' ? rawMessage : undefined,
    recoverable: isRecoverableError(code),
  };
}

/**
 * Log error with context for debugging
 */
export function logError(error: unknown, context?: ErrorContext): void {
  if (process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_DEBUG === 'true') {
    const errorInfo = handleError(error);
    console.error('[Error]', {
      ...errorInfo,
      context,
      originalError: error,
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Create a typed error with code for consistent error handling
 */
export class AppError extends Error {
  code: string;
  recoverable: boolean;

  constructor(code: string, message?: string) {
    super(message || ERROR_MESSAGES[code] || ERROR_MESSAGES.UNKNOWN_ERROR);
    this.name = 'AppError';
    this.code = code;
    this.recoverable = isRecoverableError(code);
  }
}
