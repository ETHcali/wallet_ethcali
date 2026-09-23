/**
 * Reading the swag collection on Base from the server.
 *
 * The chain is the receipt. Before an order row is written the API re-reads
 * the transaction the client named and takes buyer, tokenId and quantity from
 * the collection's own log — never from the request body. These helpers do
 * that reading and nothing else: no writes, no signing.
 *
 * Both event shapes are pinned here `as const` rather than read from the
 * generated ABI, so viem types the decoded args and a regenerated ABI cannot
 * silently change what the server matches on. If the contract's events change,
 * this file is the one that has to change with them, loudly.
 */
import {
  createPublicClient,
  decodeEventLog,
  getAddress,
  http,
  isAddress,
  TransactionReceiptNotFoundError,
  type Address,
  type Hex,
} from 'viem';
import { base } from 'viem/chains';
import { CHAIN_IDS, getRpcUrl } from '../../config/constants';

/** Swag is Base-only. The wallet's chain is never consulted. */
export const SWAG_CHAIN_ID: number = CHAIN_IDS.BASE;

/**
 * ETHCALI-SWAG-2026, the Swag1155 clone on Base. Overridable through
 * SWAG_COLLECTION_ADDRESS for a staging collection; the default is the one
 * whose eip712Domain() was read on chain when this was written.
 */
const DEFAULT_COLLECTION = '0xA5C02Ee3029Ce7f0FdD147734D11905E3cA99479';

export function getSwagCollection(): Address {
  const raw = process.env.SWAG_COLLECTION_ADDRESS?.trim() || DEFAULT_COLLECTION;
  if (!isAddress(raw)) {
    throw new Error('SWAG_COLLECTION_ADDRESS is not a valid address');
  }
  return getAddress(raw);
}

export const SWAG_EVENTS_ABI = [
  {
    type: 'event',
    name: 'Purchased',
    anonymous: false,
    inputs: [
      { name: 'tokenId', type: 'uint256', indexed: true },
      { name: 'buyer', type: 'address', indexed: true },
      { name: 'quantity', type: 'uint256', indexed: false },
      { name: 'paymentToken', type: 'address', indexed: true },
      { name: 'paid', type: 'uint256', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'Claimed',
    anonymous: false,
    inputs: [
      { name: 'tokenId', type: 'uint256', indexed: true },
      { name: 'to', type: 'address', indexed: true },
      { name: 'quantity', type: 'uint256', indexed: false },
      { name: 'orderRef', type: 'bytes32', indexed: true },
    ],
  },
] as const;

function makeBaseClient() {
  return createPublicClient({ chain: base, transport: http(getRpcUrl(CHAIN_IDS.BASE)) });
}

// viem 1.x types a client by its chain; the plain `PublicClient` alias is not
// assignable from it, so the cache carries the inferred type.
let client: ReturnType<typeof makeBaseClient> | null = null;

export function getBaseClient() {
  if (!client) client = makeBaseClient();
  return client;
}

/** A receipt that cannot serve as proof, with the HTTP status the route should send. */
export class ReceiptError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message);
  }
}

const TX_HASH = /^0x[0-9a-fA-F]{64}$/;

export function isTxHash(value: unknown): value is Hex {
  return typeof value === 'string' && TX_HASH.test(value);
}

export interface PurchasedLog {
  tokenId: bigint;
  buyer: Address;
  quantity: bigint;
  paymentToken: Address;
  paid: bigint;
  logIndex: number;
}

export interface ClaimedLog {
  tokenId: bigint;
  to: Address;
  quantity: bigint;
  orderRef: Hex;
  logIndex: number;
}

/** The successful receipt for txHash, or a ReceiptError saying why not. */
async function successfulReceipt(txHash: Hex) {
  let receipt;
  try {
    receipt = await getBaseClient().getTransactionReceipt({ hash: txHash });
  } catch (e) {
    if (e instanceof TransactionReceiptNotFoundError) {
      throw new ReceiptError('Transaction not found on Base yet. Try again in a moment.', 404);
    }
    throw new ReceiptError('Could not read the transaction from Base', 502);
  }
  if (receipt.status !== 'success') {
    throw new ReceiptError('Transaction reverted. Nothing was bought.', 409);
  }
  return receipt;
}

/**
 * The logs in a receipt that the collection itself emitted. A log with the
 * right topic from any other address is somebody else's contract shouting the
 * same words, and is ignored.
 */
function collectionLogs(receipt: Awaited<ReturnType<typeof successfulReceipt>>) {
  const collection = getSwagCollection().toLowerCase();
  return receipt.logs.filter((log) => log.address.toLowerCase() === collection);
}

/**
 * The `Purchased` log the collection emitted in txHash, or null when the
 * transaction succeeded but was not a buy() on this collection.
 */
export async function findPurchased(txHash: Hex): Promise<PurchasedLog | null> {
  const receipt = await successfulReceipt(txHash);
  for (const log of collectionLogs(receipt)) {
    try {
      const decoded = decodeEventLog({
        abi: SWAG_EVENTS_ABI,
        eventName: 'Purchased',
        data: log.data,
        topics: log.topics,
      });
      return { ...decoded.args, logIndex: log.logIndex };
    } catch {
      // Not a Purchased log (TransferSingle, etc). Keep looking.
    }
  }
  return null;
}

/**
 * The `Claimed` log the collection emitted in txHash, or null when the
 * transaction succeeded but did not redeem a voucher on this collection.
 */
export async function findClaimed(txHash: Hex): Promise<ClaimedLog | null> {
  const receipt = await successfulReceipt(txHash);
  for (const log of collectionLogs(receipt)) {
    try {
      const decoded = decodeEventLog({
        abi: SWAG_EVENTS_ABI,
        eventName: 'Claimed',
        data: log.data,
        topics: log.topics,
      });
      return { ...decoded.args, logIndex: log.logIndex };
    } catch {
      // Not a Claimed log. Keep looking.
    }
  }
  return null;
}
