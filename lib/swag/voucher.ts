/**
 * Claim vouchers — the backend's signature that lets a Shopify buyer mint.
 *
 * The contract's rule (Swag1155.claim): an EIP-712 signature over the struct
 * below, from a SIGNER_ROLE holder, redeemable once per orderRef, before the
 * deadline. Everything the signature covers is decided here on the server:
 * tokenId from the catalogue row, `to` from the caller's Privy-linked wallets,
 * quantity from the Shopify line item, orderRef from the Shopify ids. The
 * client contributes nothing but the choice of wallet.
 *
 * Two names that are easy to confuse. The Solidity struct is `ClaimVoucher`;
 * the EIP-712 type it is hashed under is `Claim` — CLAIM_TYPEHASH in the
 * contract is keccak256("Claim(uint256 tokenId,address to,uint256 quantity,
 * bytes32 orderRef,uint256 deadline)"). Signing under the struct's name
 * produces a signature the contract rejects as InvalidSignature. The primary
 * type here is `Claim`, and scripts/swag-voucher-selftest.mjs proves the
 * local digest equals the contract's hashVoucher() on the deployed collection.
 *
 * The key lives in SWAG_VOUCHER_SIGNER_KEY and is never logged, returned or
 * compared in the clear. Rotating it means granting SIGNER_ROLE to the new
 * address on the collection first, then swapping the env var.
 */
import { privateKeyToAccount, type PrivateKeyAccount } from 'viem/accounts';
import {
  hashTypedData,
  keccak256,
  recoverTypedDataAddress,
  stringToHex,
  type Address,
  type Hex,
} from 'viem';
import { getSwagCollection, SWAG_CHAIN_ID } from './onchain';
import type { ClaimVoucherFields, StoredVoucher } from '../../types/swag-orders';

/** Field order is part of the hash. It matches the contract's CLAIM_TYPEHASH. */
export const CLAIM_TYPES = {
  Claim: [
    { name: 'tokenId', type: 'uint256' },
    { name: 'to', type: 'address' },
    { name: 'quantity', type: 'uint256' },
    { name: 'orderRef', type: 'bytes32' },
    { name: 'deadline', type: 'uint256' },
  ],
} as const;

/** EIP712("ETHCaliSwag", "1") in the constructor; chain id and contract from frontend/swag-collection.json. */
export function claimDomain(collection: Address = getSwagCollection()) {
  return {
    name: 'ETHCaliSwag',
    version: '1',
    chainId: SWAG_CHAIN_ID,
    verifyingContract: collection,
  } as const;
}

/** A voucher is good for a week. Long enough to find a wallet, short enough to bound a refund. */
export const VOUCHER_TTL_SECONDS = 7 * 24 * 60 * 60;

/** The struct with real integers, as viem hashes it. */
export interface ClaimVoucherMessage {
  tokenId: bigint;
  to: Address;
  quantity: bigint;
  orderRef: Hex;
  deadline: bigint;
}

/**
 * The claim key for a Shopify line item: keccak256 of the UTF-8 string
 * `<order gid>:<line item id>`. Deterministic, so a replayed webhook or a
 * re-issued voucher lands on the same orderRef and the contract's
 * orderClaimed[] makes the second mint impossible.
 */
export function orderRefFor(shopifyOrderGid: string, lineItemId: string | number): Hex {
  return keccak256(stringToHex(`${shopifyOrderGid}:${lineItemId}`));
}

const PRIVATE_KEY = /^0x[0-9a-fA-F]{64}$/;

function signerAccount(): PrivateKeyAccount {
  const key = process.env.SWAG_VOUCHER_SIGNER_KEY;
  if (!key || !PRIVATE_KEY.test(key)) {
    // Say that it is missing or malformed, never what it is.
    throw new Error('SWAG_VOUCHER_SIGNER_KEY is missing or not a 32-byte hex key');
  }
  return privateKeyToAccount(key as Hex);
}

/** The address that must hold SIGNER_ROLE on the collection. Safe to log. */
export function voucherSignerAddress(): Address {
  return signerAccount().address;
}

export function toVoucherMessage(fields: ClaimVoucherFields): ClaimVoucherMessage {
  return {
    tokenId: BigInt(fields.tokenId),
    to: fields.to,
    quantity: BigInt(fields.quantity),
    orderRef: fields.orderRef,
    deadline: BigInt(fields.deadline),
  };
}

export function toVoucherFields(message: ClaimVoucherMessage): ClaimVoucherFields {
  return {
    tokenId: message.tokenId.toString(),
    to: message.to,
    quantity: message.quantity.toString(),
    orderRef: message.orderRef,
    deadline: message.deadline.toString(),
  };
}

/** The digest the contract's hashVoucher() returns for the same struct. */
export function hashClaimVoucher(message: ClaimVoucherMessage, collection?: Address): Hex {
  return hashTypedData({
    domain: claimDomain(collection),
    types: CLAIM_TYPES,
    primaryType: 'Claim',
    message,
  });
}

export interface SignedVoucher {
  voucher: ClaimVoucherFields;
  signature: Hex;
  signer: Address;
}

/**
 * Sign a voucher with the server key.
 *
 * Before returning, the signature is checked by recovering the address from
 * it the way the contract will (`ECDSA.recover(_hashVoucher(voucher), sig)`).
 * A mismatch means the domain or the type here has drifted from the contract,
 * and the right outcome is a server error now rather than an InvalidSignature
 * revert on the buyer's sponsored transaction later.
 */
export async function signClaimVoucher(input: {
  tokenId: bigint;
  to: Address;
  quantity: bigint;
  orderRef: Hex;
  deadline: bigint;
}): Promise<SignedVoucher> {
  const account = signerAccount();
  const domain = claimDomain();
  const message: ClaimVoucherMessage = { ...input };

  const signature = await account.signTypedData({
    domain,
    types: CLAIM_TYPES,
    primaryType: 'Claim',
    message,
  });

  const recovered = await recoverTypedDataAddress({
    domain,
    types: CLAIM_TYPES,
    primaryType: 'Claim',
    message,
    signature,
  });
  if (recovered.toLowerCase() !== account.address.toLowerCase()) {
    throw new Error('Voucher self-check failed: recovered signer does not match');
  }

  return { voucher: toVoucherFields(message), signature, signer: account.address };
}

/** Who signed a stored voucher. For audit and for the confirm step's sanity check. */
export async function recoverVoucherSigner(stored: StoredVoucher): Promise<Address> {
  return recoverTypedDataAddress({
    domain: claimDomain(),
    types: CLAIM_TYPES,
    primaryType: 'Claim',
    message: toVoucherMessage(stored.voucher),
    signature: stored.signature,
  });
}
