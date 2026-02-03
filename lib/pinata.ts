import { Swag1155Metadata } from '../types/swag';

const DEFAULT_GATEWAY = process.env.NEXT_PUBLIC_PINATA_GATEWAY || process.env.PINATA_GATEWAY || 'https://gateway.pinata.cloud/ipfs';

export async function pinMetadataToIPFS(metadata: Swag1155Metadata): Promise<string> {
  const response = await fetch('/api/pinata/pin-json', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ metadata }),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Failed to pin metadata to Pinata');
  }

  const payload = await response.json();
  return payload.uri as string;
}

export async function pinImageToIPFS(base64: string, fileName?: string): Promise<string> {
  const response = await fetch('/api/pinata/pin-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ file: base64, fileName }),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Failed to pin image to IPFS');
  }

  const payload = await response.json();
  return payload.uri as string;
}

export function getIPFSGatewayUrl(ipfsUri: string): string {
  if (!ipfsUri) return '';
  if (ipfsUri.startsWith('http')) return ipfsUri;
  return ipfsUri.replace('ipfs://', `${DEFAULT_GATEWAY.replace(/\/$/, '')}/`);
}
