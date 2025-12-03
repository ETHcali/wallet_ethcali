import type { NextApiRequest, NextApiResponse } from 'next';

type ResponseData = {
  success: boolean;
  message?: string;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { uniqueIdentifier, email } = req.body;

  if (!uniqueIdentifier || typeof uniqueIdentifier !== 'string') {
    return res.status(400).json({ success: false, error: 'Invalid unique identifier' });
  }

  try {
    // TODO: Replace with actual database insert
    // Example: await db.users.create({ uniqueIdentifier, email, verifiedAt: new Date() });
    
    console.log('Registering personhood:', {
      uniqueIdentifier: uniqueIdentifier.substring(0, 20) + '...',
      email,
      timestamp: new Date().toISOString(),
    });
    
    return res.status(200).json({ success: true, message: 'Successfully registered' });
  } catch (error) {
    console.error('Error registering unique identifier:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

