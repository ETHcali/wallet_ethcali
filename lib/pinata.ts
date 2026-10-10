const DEFAULT_GATEWAY = process.env.NEXT_PUBLIC_PINATA_GATEWAY || process.env.PINATA_GATEWAY || 'https://gateway.pinata.cloud/ipfs';

export function getIPFSGatewayUrl(ipfsUri: string): string {
  if (!ipfsUri) return '';
  if (ipfsUri.startsWith('http')) return ipfsUri;
  return ipfsUri.replace('ipfs://', `${DEFAULT_GATEWAY.replace(/\/$/, '')}/`);
}
