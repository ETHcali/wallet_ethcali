/**
 * BuilderCertificate — the soulbound NFT behind every builder certificate.
 *
 * Browser-safe. The address and ABI come from the generated frontend/ (npm run
 * sync:contracts), never typed by hand. One contract on Ethereum mainnet
 * serves every event; what differs per certificate lives in its IPFS metadata.
 */
import { getAddress, hexToString, stringToHex, type Address, type Hex } from 'viem';
import addresses from '../../frontend/addresses.json';
import BuilderCertificateAbi from '../../frontend/abis/BuilderCertificate.json';
import { ETHEREUM } from '../../config/chains';

export const CERT_CHAIN_ID = ETHEREUM.id;
export const CERT_ADDRESS: Address = getAddress(
  (addresses as Record<string, { addresses: Record<string, string> }>).ethereum.addresses.BuilderCertificate
);
export const CERT_ABI = BuilderCertificateAbi as readonly unknown[];

/** keccak256("ADMIN_ROLE"), as the contract defines it. */
export const CERT_ADMIN_ROLE: Hex = '0xa49807205ce4d355092ef5a8a18f56e8913cf4a201fbe287825b095693c21775';

/** The credential id as the contract stores it: ASCII, right-padded to bytes32. */
export const credentialToBytes32 = (credentialId: string): Hex => stringToHex(credentialId, { size: 32 });
export const bytes32ToCredential = (b: Hex): string => hexToString(b, { size: 32 }).replace(/\0+$/, '');

/** Public gateway for the few images a page shows; tokenURI itself stays ipfs://. */
const GATEWAY = 'https://gateway.pinata.cloud/ipfs';
export const ipfsHttp = (cid: string) => `${GATEWAY}/${cid}`;

export const openseaUrl = (tokenId: string | number) =>
  `https://opensea.io/assets/ethereum/${CERT_ADDRESS}/${tokenId}`;
export const etherscanTokenUrl = (tokenId: string | number) =>
  `https://etherscan.io/nft/${CERT_ADDRESS}/${tokenId}`;
export const etherscanContractUrl = `https://etherscan.io/address/${CERT_ADDRESS}`;
