/**
 * Translate a failed swag transaction into a sentence a buyer can act on.
 *
 * Swag1155 reverts with custom errors, so a raw failure is a selector like
 * `0x2c5211c6`. The revert data is decoded against the typed ABI, which also
 * means an error the contract no longer declares stops compiling here rather
 * than silently falling through to the generic message.
 *
 * Copy is status-first and comes in both languages.
 */
import { decodeErrorResult, formatUnits, type Hex } from 'viem';
import { swag1155Abi } from '../../frontend/abis/swag';
import { SWAG } from './client';
import type { SwagLocale } from './useSwagLocale';

type Copy = Record<SwagLocale, string>;

type SwagErrorName = Extract<(typeof swag1155Abi)[number], { type: 'error' }>['name'];

/** Every custom error a buyer or claimer can plausibly hit, by ABI name. */
const CONTRACT_ERRORS: Partial<Record<SwagErrorName, (args: readonly unknown[]) => Copy>> = {
  SoldOut: (args) => {
    const remaining = typeof args[1] === 'bigint' ? args[1] : 0n;
    return remaining > 0n
      ? {
          es: `No alcanza. Quedan ${remaining.toString()} de este diseño en la cadena.`,
          en: `Not enough left. ${remaining.toString()} of this design remain on chain.`,
        }
      : {
          es: 'Agotado en la cadena. Todavía puedes pagar con tarjeta.',
          en: 'Sold out on chain. You can still pay with card.',
        };
  },
  PaymentTokenNotAccepted: () => ({
    es: 'Este diseño solo se vende en USDC en Base.',
    en: 'This design is only sold in USDC on Base.',
  }),
  VariantNotActive: () => ({
    es: 'Este diseño no está a la venta en este momento.',
    en: 'This design is not on sale right now.',
  }),
  VariantNotFound: () => ({
    es: 'Este diseño no existe en la colección.',
    en: 'This design does not exist in the collection.',
  }),
  ZeroQuantity: () => ({
    es: 'Elige al menos una unidad.',
    en: 'Choose at least one unit.',
  }),
  EnforcedPause: () => ({
    es: 'La tienda está en pausa. Intenta de nuevo en un momento.',
    en: 'The store is paused. Please try again shortly.',
  }),
  EthNotAccepted: () => ({
    es: 'No envíes ETH con un pago en USDC.',
    en: 'Do not send ETH with a USDC payment.',
  }),
  IncorrectEthAmount: () => ({
    es: 'El monto enviado no coincide con el precio.',
    en: 'The amount sent did not match the price.',
  }),
  SafeERC20FailedOperation: () => ({
    es: 'USDC rechazó la transferencia. Revisa tu saldo y la aprobación.',
    en: 'USDC rejected the transfer. Check your balance and the approval.',
  }),
  VoucherAlreadyClaimed: () => ({
    es: 'Este pedido ya fue reclamado.',
    en: 'This order has already been claimed.',
  }),
  VoucherExpired: () => ({
    es: 'El vale venció. Pide uno nuevo desde tus pedidos.',
    en: 'The voucher expired. Request a new one from your orders.',
  }),
  InvalidSignature: () => ({
    es: 'El vale no es válido. Pide uno nuevo desde tus pedidos.',
    en: 'The voucher is not valid. Request a new one from your orders.',
  }),
  InvalidRecipient: () => ({
    es: 'La dirección de destino no es válida.',
    en: 'The recipient address is not valid.',
  }),
  AccessControlUnauthorizedAccount: () => ({
    es: 'Esta billetera no tiene permiso para hacer eso.',
    en: 'This wallet is not authorised to do that.',
  }),
  ReentrancyGuardReentrantCall: () => ({
    es: 'La transacción se rechazó. Intenta de nuevo.',
    en: 'The transaction was rejected. Please try again.',
  }),
};

/** Wallet, RPC and USDC (revert-string) failures, matched on message text. */
const WALLET_PATTERNS: Array<[RegExp, Copy]> = [
  [
    /user rejected|user denied|rejected the request|user cancelled/i,
    { es: 'Cancelaste la transacción. Nada salió de tu billetera.', en: 'You cancelled the transaction. Nothing left your wallet.' },
  ],
  [
    /transfer amount exceeds balance|insufficient balance/i,
    { es: 'No tienes suficiente USDC para este pago.', en: 'Not enough USDC for this payment.' },
  ],
  [
    /exceeds allowance|insufficient allowance/i,
    { es: 'Primero aprueba el USDC, luego compra.', en: 'Approve the USDC first, then buy.' },
  ],
  [
    /insufficient funds/i,
    { es: 'No hay saldo para cubrir el gas.', en: 'Not enough balance to cover gas.' },
  ],
  [
    /nonce too low|already known/i,
    { es: 'Esa transacción ya fue enviada.', en: 'That transaction was already submitted.' },
  ],
  [
    /network|fetch failed|timeout|timed out/i,
    { es: 'Problema de red con la cadena. Intenta de nuevo.', en: 'Network problem reaching the chain. Please retry.' },
  ],
];

const GENERIC: Copy = {
  es: 'La transacción no se completó. Intenta de nuevo.',
  en: 'The transaction could not be completed. Please try again.',
};

const SELECTOR_WITH_ARGS = /(0x[0-9a-fA-F]{8}(?:[0-9a-fA-F]{64})*)\b/;

/**
 * Dig the revert data out of whatever shape the wallet or viem threw.
 * viem nests it under `cause` (several levels deep); Privy and injected
 * wallets put it on `data`, `error.data` or only in the message.
 */
function findRevertData(error: unknown, depth = 0): Hex | null {
  if (!error || typeof error !== 'object' || depth > 6) return null;
  const e = error as Record<string, unknown>;

  for (const key of ['data', 'raw']) {
    const value = e[key];
    if (typeof value === 'string' && /^0x[0-9a-fA-F]{8}/.test(value)) return value as Hex;
    if (value && typeof value === 'object') {
      const inner = (value as Record<string, unknown>).data;
      if (typeof inner === 'string' && /^0x[0-9a-fA-F]{8}/.test(inner)) return inner as Hex;
    }
  }

  for (const key of ['cause', 'error', 'originalError', 'info']) {
    const found = findRevertData(e[key], depth + 1);
    if (found) return found;
  }

  const message = typeof e.message === 'string' ? e.message : '';
  const match = message.match(SELECTOR_WITH_ARGS);
  return match ? (match[1] as Hex) : null;
}

function errorText(error: unknown): string {
  if (error instanceof Error) {
    const short = (error as { shortMessage?: string }).shortMessage ?? '';
    const details = (error as { details?: string }).details ?? '';
    return `${error.message} ${short} ${details}`;
  }
  return String(error ?? '');
}

export function translateSwagError(error: unknown, locale: SwagLocale): string {
  if (!error) return GENERIC[locale];

  const data = findRevertData(error);
  if (data) {
    try {
      const decoded = decodeErrorResult({ abi: swag1155Abi, data });
      const copy = CONTRACT_ERRORS[decoded.errorName as SwagErrorName];
      if (copy) return copy(decoded.args ?? [])[locale];
    } catch {
      // Not one of ours (USDC reverts with a string, for instance). Fall through.
    }
  }

  const text = errorText(error);

  // viem also names the error in its message when it can decode it itself.
  for (const [name, copy] of Object.entries(CONTRACT_ERRORS)) {
    if (copy && text.includes(name)) return copy([])[locale];
  }

  for (const [pattern, copy] of WALLET_PATTERNS) {
    if (pattern.test(text)) return copy[locale];
  }

  return GENERIC[locale];
}

/** `canBuy()` returns a lowercase reason string; make it a sentence. */
export function describeBlockedReason(reason: string, locale: SwagLocale): string {
  const r = reason.toLowerCase();
  if (r.includes('paused')) return CONTRACT_ERRORS.EnforcedPause!([])[locale];
  if (r.includes('sold out') || r.includes('remaining') || r.includes('cap')) {
    return CONTRACT_ERRORS.SoldOut!([0n, 0n])[locale];
  }
  if (r.includes('not active')) return CONTRACT_ERRORS.VariantNotActive!([])[locale];
  if (r.includes('token') && r.includes('accept')) return CONTRACT_ERRORS.PaymentTokenNotAccepted!([])[locale];
  const trimmed = reason.trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() + trimmed.slice(1) : GENERIC[locale];
}

/** "25.00 USDC" from base units, always with USDC's own decimals. */
export function formatUsdc(amount: bigint): string {
  const units = Number(formatUnits(amount, SWAG.usdcDecimals));
  return `${units.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDC`;
}
