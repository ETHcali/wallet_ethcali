import type { NextApiRequest, NextApiResponse } from 'next';

import { logger } from '../../../utils/logger';
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

type ResponseData = { uri: string; gateway: string } | { error: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const PINATA_JWT = process.env.PINATA_JWT;
  const PINATA_GATEWAY = process.env.PINATA_GATEWAY || 'https://gateway.pinata.cloud';

  if (!PINATA_JWT) {
    return res.status(500).json({ error: 'Missing PINATA_JWT server environment variable' });
  }

  const { file, fileName } = req.body || {};

  if (!file) {
    return res.status(400).json({ error: 'File data is required (base64)' });
  }

  try {
    // Convert base64 to buffer
    const base64Data = file.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    
    // Create form data for Pinata
    const formData = new FormData();
    const blob = new Blob([buffer], { type: 'image/png' });
    formData.append('file', blob, fileName || `swag-image-${Date.now()}.png`);
    
    // Pin to IPFS via Pinata
    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PINATA_JWT}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error('Pinata upload failed:', errorText);
      return res.status(500).json({ error: 'Failed to upload to IPFS' });
    }

    const result = await response.json();
    const ipfsHash = result.IpfsHash;

    return res.status(200).json({ 
      uri: `ipfs://${ipfsHash}`,
      gateway: `${PINATA_GATEWAY}/ipfs/${ipfsHash}`,
    });
  } catch (error) {
    logger.error('Image upload failed', error);
    return res.status(500).json({ error: 'Failed to upload image. See server logs for details.' });
  }
}
