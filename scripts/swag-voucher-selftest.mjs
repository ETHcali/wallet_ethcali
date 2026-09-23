/**
 * Proves the voucher signing in lib/swag/voucher.ts matches the contract.
 *
 *   node scripts/swag-voucher-selftest.mjs                 # throwaway key
 *   node --env-file=.env scripts/swag-voucher-selftest.mjs # also checks the real signer
 *
 * The collection and its chain come from frontend/swag-collection.json — the
 * same file the app reads — or from SWAG_COLLECTION_ADDRESS + SWAG_CHAIN_ID
 * when both are set (a staging collection). The RPC is the chain's
 * NEXT_PUBLIC_*_RPC_URL, or a public endpoint.
 *
 * Three checks, none of which prints key material:
 *
 *   1. Sign a voucher with a throwaway key under the domain and type used by
 *      the server, recover the address from the signature, and require it to
 *      match. This is the same check signClaimVoucher() runs inline.
 *   2. Compute the EIP-712 digest locally and compare it with what the
 *      deployed collection's hashVoucher() returns for the same struct. This
 *      is the one that catches a drifted domain, a wrong chain id or a wrong
 *      primary type: the Solidity struct is ClaimVoucher, the EIP-712 type is
 *      Claim. The contract's own eip712Domain() is printed alongside.
 *   3. If SWAG_VOUCHER_SIGNER_KEY is set, derive its address, confirm it holds
 *      SIGNER_ROLE on the collection, and repeat check 1 with it.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createPublicClient, http, hashTypedData, keccak256, recoverTypedDataAddress, stringToHex } from 'viem';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';

const here = path.dirname(fileURLToPath(import.meta.url));
const collectionJson = JSON.parse(fs.readFileSync(path.join(here, '..', 'frontend', 'swag-collection.json'), 'utf8'));

const envAddress = process.env.SWAG_COLLECTION_ADDRESS?.trim();
const envChainId = process.env.SWAG_CHAIN_ID?.trim();
if ((envAddress && !envChainId) || (!envAddress && envChainId)) {
  console.error('Set both SWAG_COLLECTION_ADDRESS and SWAG_CHAIN_ID to test another collection, or neither.');
  process.exit(1);
}
const COLLECTION = envAddress || collectionJson.address;
const CHAIN_ID = Number(envChainId || collectionJson.chainId);

// Mirrors the env names config/chains.ts reads, plus a public fallback per chain.
const RPC_BY_CHAIN = {
  1: process.env.NEXT_PUBLIC_MAINNET_RPC_URL || 'https://ethereum-rpc.publicnode.com',
  8453: process.env.NEXT_PUBLIC_BASE_RPC_URL || 'https://mainnet.base.org',
};
const RPC = RPC_BY_CHAIN[CHAIN_ID];
if (!RPC) {
  console.error(`No RPC known for chain ${CHAIN_ID}`);
  process.exit(1);
}

// Must stay identical to lib/swag/voucher.ts.
const domain = { name: 'ETHCaliSwag', version: '1', chainId: CHAIN_ID, verifyingContract: COLLECTION };
const types = {
  Claim: [
    { name: 'tokenId', type: 'uint256' },
    { name: 'to', type: 'address' },
    { name: 'quantity', type: 'uint256' },
    { name: 'orderRef', type: 'bytes32' },
    { name: 'deadline', type: 'uint256' },
  ],
};

const abi = [
  {
    type: 'function',
    name: 'hashVoucher',
    stateMutability: 'view',
    inputs: [
      {
        name: 'voucher',
        type: 'tuple',
        components: [
          { name: 'tokenId', type: 'uint256' },
          { name: 'to', type: 'address' },
          { name: 'quantity', type: 'uint256' },
          { name: 'orderRef', type: 'bytes32' },
          { name: 'deadline', type: 'uint256' },
        ],
      },
    ],
    outputs: [{ name: '', type: 'bytes32' }],
  },
  {
    type: 'function',
    name: 'hasRole',
    stateMutability: 'view',
    inputs: [
      { name: 'role', type: 'bytes32' },
      { name: 'account', type: 'address' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    type: 'function',
    name: 'eip712Domain',
    stateMutability: 'view',
    inputs: [],
    outputs: [
      { name: 'fields', type: 'bytes1' },
      { name: 'name', type: 'string' },
      { name: 'version', type: 'string' },
      { name: 'chainId', type: 'uint256' },
      { name: 'verifyingContract', type: 'address' },
      { name: 'salt', type: 'bytes32' },
      { name: 'extensions', type: 'uint256[]' },
    ],
  },
];

let failed = false;
const check = (label, ok, detail = '') => {
  console.log(`${ok ? 'ok  ' : 'FAIL'}  ${label}${detail ? `  ${detail}` : ''}`);
  if (!ok) failed = true;
};

async function signAndRecover(account, message) {
  const signature = await account.signTypedData({ domain, types, primaryType: 'Claim', message });
  const recovered = await recoverTypedDataAddress({ domain, types, primaryType: 'Claim', message, signature });
  return recovered;
}

console.log(`collection ${COLLECTION} on chain ${CHAIN_ID} (${collectionJson.name}) via ${new URL(RPC).host}`);

const throwaway = privateKeyToAccount(generatePrivateKey());
const message = {
  tokenId: 1n,
  to: throwaway.address,
  quantity: 1n,
  orderRef: keccak256(stringToHex('gid://shopify/Order/1:1')),
  deadline: 1_800_000_000n,
};

// 1. sign → recover with a throwaway key
const recovered = await signAndRecover(throwaway, message);
check('throwaway sign/recover', recovered === throwaway.address, `recovered ${recovered}`);

// 2. local digest == contract hashVoucher(), and the contract's domain says the same chain
const client = createPublicClient({ transport: http(RPC) });
const [, domName, domVersion, domChainId, domContract] = await client.readContract({ address: COLLECTION, abi, functionName: 'eip712Domain' });
check(
  'contract eip712Domain matches',
  domName === domain.name && domVersion === domain.version && Number(domChainId) === CHAIN_ID && domContract.toLowerCase() === COLLECTION.toLowerCase(),
  `${domName} / ${domVersion} / chainId ${domChainId}`
);
const local = hashTypedData({ domain, types, primaryType: 'Claim', message });
const onchain = await client.readContract({ address: COLLECTION, abi, functionName: 'hashVoucher', args: [message] });
check(`local digest == hashVoucher() on chain ${CHAIN_ID}`, local === onchain, `${local.slice(0, 18)}…`);

// Control: the struct name would NOT match. If this ever passes, the contract changed.
const wrong = hashTypedData({ domain, types: { ClaimVoucher: types.Claim }, primaryType: 'ClaimVoucher', message });
check('primary type "ClaimVoucher" is rejected (control)', wrong !== onchain);

// 3. the real signer, when present
const key = process.env.SWAG_VOUCHER_SIGNER_KEY;
if (key) {
  const signer = privateKeyToAccount(key);
  const role = keccak256(stringToHex('SIGNER_ROLE'));
  const has = await client.readContract({ address: COLLECTION, abi, functionName: 'hasRole', args: [role, signer.address] });
  check('SWAG_VOUCHER_SIGNER_KEY holds SIGNER_ROLE', has, `signer ${signer.address}`);
  const rec = await signAndRecover(signer, { ...message, to: signer.address });
  check('real signer sign/recover', rec === signer.address);
} else {
  console.log('skip  SWAG_VOUCHER_SIGNER_KEY not set (run with --env-file=.env to check the real signer)');
}

process.exit(failed ? 1 : 0);
