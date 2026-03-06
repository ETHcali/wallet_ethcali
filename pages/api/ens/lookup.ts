// pages/api/ens/lookup.ts
// Proxies OpenSea MCP NFT lookup for ENS subdomains
import type { NextApiRequest, NextApiResponse } from 'next';

const OPENSEA_API_URL = 'https://api.opensea.io/api/v2/chain/base/account';
const OPENSEA_API_KEY = process.env.OPENSEA_API_KEY;
const L2_REGISTRY_ADDRESS = '0x7103595fc32b4072b775e9f6b438921c8cf532ed';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { address } = req.query;
  if (!address || typeof address !== 'string') {
    return res.status(400).json({ error: 'Missing address' });
  }
  try {
    const url = `${OPENSEA_API_URL}/${address}/nfts?limit=50&contract_address=${L2_REGISTRY_ADDRESS}`;
    const response = await fetch(url, {
      headers: {
        'x-api-key': OPENSEA_API_KEY || '',
        'accept': 'application/json',
      },
    });
    if (!response.ok) {
      return res.status(response.status).json({ error: 'OpenSea API error' });
    }
    const data = await response.json();
    // Find the NFT with the correct contract and extract the subdomain name
    const nft = (data.nfts || []).find((nft: any) => nft.contract === L2_REGISTRY_ADDRESS);
    const name = nft?.name || null;
    return res.status(200).json({ name, nft });
  } catch (error) {
    return res.status(500).json({ error: 'Internal error', details: (error as Error).message });
  }
}
