import type { NextApiRequest, NextApiResponse } from 'next';

type HoldersResponse = {
  addresses: string[];
};

type ErrorResponse = {
  error: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<HoldersResponse | ErrorResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { eventId } = req.query;

  if (!eventId || typeof eventId !== 'string') {
    return res.status(400).json({ error: 'eventId query param required' });
  }

  const apiKey = process.env.POAP_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'POAP_API_KEY not configured on server' });
  }

  try {
    const response = await fetch(
      `https://api.poap.tech/event/${eventId}/poaps?limit=300&offset=0`,
      {
        headers: {
          'x-api-key': apiKey,
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({ error: `POAP API error: ${text}` });
    }

    const data = await response.json();
    // data.tokens is an array of POAP token objects; owner.id is the holder address
    const addresses: string[] = (data.tokens || [])
      .map((t: { owner?: { id?: string } }) => t.owner?.id)
      .filter((addr: string | undefined): addr is string => Boolean(addr));

    return res.status(200).json({ addresses });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
}
