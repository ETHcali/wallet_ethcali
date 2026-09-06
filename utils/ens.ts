import { namehash } from 'viem';
import { ENS_CONFIG } from '../config/constants';

/**
 * The Durin L2Registry stores names DNS-encoded (ENSIP-10 / RFC 1035):
 * length-prefixed labels ending in a zero byte, e.g.
 * 0x0c"adminethcali"07"ethcali"03"eth"00 → "adminethcali.ethcali.eth".
 */
export function decodeDnsName(hex: string): string {
  const bytes = Buffer.from(hex.replace(/^0x/, ''), 'hex');
  const labels: string[] = [];
  let i = 0;
  while (i < bytes.length) {
    const len = bytes[i];
    if (len === 0) break;
    labels.push(bytes.subarray(i + 1, i + 1 + len).toString('utf8'));
    i += 1 + len;
  }
  return labels.join('.');
}

export function fullName(label: string): string {
  return `${label}.${ENS_CONFIG.parentName}`;
}

/** Node (namehash) of `<label>.ethcali.eth`; also the registry's ERC-721 token id. */
export function subnameNode(label: string): `0x${string}` {
  return namehash(fullName(label));
}

/** "adminethcali.ethcali.eth" → "adminethcali"; anything else → null. */
export function labelOf(name: string | null | undefined): string | null {
  if (!name) return null;
  const suffix = `.${ENS_CONFIG.parentName}`;
  if (!name.endsWith(suffix)) return null;
  const label = name.slice(0, -suffix.length);
  return label && !label.includes('.') ? label : null;
}
