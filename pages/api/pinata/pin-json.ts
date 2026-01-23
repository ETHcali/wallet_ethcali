import type { NextApiRequest, NextApiResponse } from 'next';
import PinataSDK from '@pinata/sdk';

import { logger } from '../../../utils/logger';
const PINATA_JWT = process.env.PINATA_JWT;

const pinata = PINATA_JWT
  ? new PinataSDK({ pinataJWTKey: PINATA_JWT })
  : null;

type ResponseData = { uri: string } | { error: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!pinata) {
    return res.status(500).json({ error: 'Missing PINATA_JWT server environment variable' });
  }

  const { metadata } = req.body || {};

  if (!metadata) {
    return res.status(400).json({ error: 'Metadata payload is required' });
  }

  try {
    const result = await pinata.pinJSONToIPFS(metadata, {
      pinataMetadata: {
        name: `swag1155-${Date.now()}`,
      },
    });

    return res.status(200).json({ uri: `ipfs://${result.IpfsHash}` });
  } catch (error) {
    logger.error('Pinata pinJSONToIPFS failed', error);
    return res.status(500).json({ error: 'Failed to pin metadata. See server logs for details.' });
  }
}
