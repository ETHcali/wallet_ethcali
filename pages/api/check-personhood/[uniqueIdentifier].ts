import type { NextApiRequest, NextApiResponse } from 'next';

type ResponseData = {
  registered: boolean;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ registered: false, error: 'Method not allowed' });
  }

  const { uniqueIdentifier } = req.query;

  if (!uniqueIdentifier || typeof uniqueIdentifier !== 'string') {
    return res.status(400).json({ registered: false, error: 'Invalid unique identifier' });
  }

  try {
    // TODO: Replace with actual database check
    // Example: const user = await db.users.findOne({ uniqueIdentifier });
    // return res.status(200).json({ registered: !!user });
    
    return res.status(200).json({ registered: false });
  } catch (error) {
    console.error('Error checking unique identifier:', error);
    return res.status(500).json({ registered: false, error: 'Internal server error' });
  }
}

