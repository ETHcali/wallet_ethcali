// Lists the ethcali.eth registry tokens (ERC-721 on Base) an address holds, via
// Blockscout. Blockscout is an index, not the truth: the client re-reads
// names(node) and addr(node) from the registry before showing anything.
import type { NextApiRequest, NextApiResponse } from 'next';
import { isAddress } from 'viem';
import { ENS_CONFIG } from '../../../config/constants';

const BLOCKSCOUT_BASE = 'https://base.blockscout.com/api/v2';

interface BlockscoutNftItem {
  id: string;
  token: { address_hash?: string; address?: string };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { address } = req.query;
  if (!address || typeof address !== 'string' || !isAddress(address)) {
    return res.status(400).json({ error: 'Missing or invalid address' });
  }
  try {
    const response = await fetch(`${BLOCKSCOUT_BASE}/addresses/${address}/nft?type=ERC-721`, {
      headers: { accept: 'application/json' },
      // An address with a huge NFT history can take Blockscout many seconds; the
      // profile page should not hang on it. On timeout the client shows the claim form.
      signal: AbortSignal.timeout(8_000),
    });
    // Blockscout answers 404 for an address it has never seen; that is "no names".
    if (response.status === 404) {
      return res.status(200).json({ nodes: [] });
    }
    if (!response.ok) {
      return res.status(502).json({ error: 'Index unavailable' });
    }
    const data = (await response.json()) as { items?: BlockscoutNftItem[] };
    const registry = ENS_CONFIG.registry.toLowerCase();
    const nodes = (data.items ?? [])
      .filter((item) => (item.token.address_hash ?? item.token.address ?? '').toLowerCase() === registry)
      // Token id is the node as a decimal string; hand back the bytes32 the registry expects.
      .map((item) => `0x${BigInt(item.id).toString(16).padStart(64, '0')}`);
    res.setHeader('Cache-Control', 'private, max-age=15');
    return res.status(200).json({ nodes });
  } catch (error) {
    return res.status(500).json({ error: 'Lookup failed', details: (error as Error).message });
  }
}
