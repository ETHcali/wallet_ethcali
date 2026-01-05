import type { NextApiRequest, NextApiResponse } from 'next';
import { privateKeyToAccount } from 'viem/accounts';
import { ADDRESSES } from '../../frontend/contracts';

// Get sponsor contract address for chain
function getSponsorAddress(chainId: number): `0x${string}` {
  if (chainId === 130) {
    return ADDRESSES.unichain.addresses.SponsorContract as `0x${string}`;
  }
  return ADDRESSES.base.addresses.SponsorContract as `0x${string}`;
}

// EIP-712 domain - must match contract's domain exactly
const getMintRequestDomain = (chainId: number, verifyingContract: string) => ({
  name: 'ZKPassportSponsor',  // Must match contract's EIP712 name
  version: '1',
  chainId: chainId,
  verifyingContract: verifyingContract as `0x${string}`,
});

const mintRequestTypes = {
  MintRequest: [
    { name: 'to', type: 'address' },
    { name: 'uniqueIdentifier', type: 'string' },
    { name: 'faceMatchPassed', type: 'bool' },
    { name: 'personhoodVerified', type: 'bool' },
    { name: 'nonce', type: 'uint256' },
    { name: 'deadline', type: 'uint256' },
  ],
};

type ResponseData = {
  success: boolean;
  signature?: string;
  mintRequest?: {
    to: string;
    uniqueIdentifier: string;
    faceMatchPassed: boolean;
    personhoodVerified: boolean;
    nonce: string;
    deadline: string;
  };
  sponsorAddress?: string;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { userAddress, uniqueIdentifier, faceMatchPassed, personhoodVerified, chainId } = req.body;

  // Validate inputs
  if (!userAddress || typeof userAddress !== 'string') {
    return res.status(400).json({ success: false, error: 'Invalid user address' });
  }

  if (!uniqueIdentifier || typeof uniqueIdentifier !== 'string') {
    return res.status(400).json({ success: false, error: 'Invalid unique identifier' });
  }

  const signerPrivateKey = process.env.BACKEND_SIGNER_PRIVATE_KEY;

  if (!signerPrivateKey) {
    console.error('BACKEND_SIGNER_PRIVATE_KEY not configured');
    return res.status(500).json({ success: false, error: 'Server configuration error' });
  }

  try {
    const targetChainId = chainId || 8453;
    const sponsorAddress = getSponsorAddress(targetChainId);
    const account = privateKeyToAccount(signerPrivateKey as `0x${string}`);

    // Generate nonce and deadline
    const nonce = BigInt(Date.now());
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600); // 1 hour from now

    // Prepare mint request
    const mintRequest = {
      to: userAddress as `0x${string}`,
      uniqueIdentifier,
      faceMatchPassed: faceMatchPassed ?? true,
      personhoodVerified: personhoodVerified ?? true,
      nonce,
      deadline,
    };

    // Sign the typed data
    const domain = getMintRequestDomain(targetChainId, sponsorAddress);

    const signature = await account.signTypedData({
      domain,
      types: mintRequestTypes,
      primaryType: 'MintRequest',
      message: mintRequest,
    });

    console.log('Mint signature generated:', {
      userAddress: userAddress.substring(0, 10) + '...',
      chainId: targetChainId,
      sponsor: sponsorAddress,
      signer: account.address,
    });

    // Return signature and request data for user to submit transaction
    return res.status(200).json({
      success: true,
      signature,
      mintRequest: {
        to: mintRequest.to,
        uniqueIdentifier: mintRequest.uniqueIdentifier,
        faceMatchPassed: mintRequest.faceMatchPassed,
        personhoodVerified: mintRequest.personhoodVerified,
        nonce: nonce.toString(),
        deadline: deadline.toString(),
      },
      sponsorAddress,
    });

  } catch (error: any) {
    console.error('Error generating mint signature:', error);
    
    return res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to generate mint signature' 
    });
  }
}
