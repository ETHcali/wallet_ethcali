import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useWallets } from '@privy-io/react-auth';
import { encodeFunctionData } from 'viem';
import {
  hasNFTByAddress,
  hasNFT,
  getContractAddresses,
  getExplorerUrl,
  getNetworkName,
} from '../../utils/contracts';
import SponsorContractABI from '../../frontend/abis/SponsorContract.json';

// Dynamic imports for ZKPassport (client-side only)
let requestPersonhoodVerification: any;

interface SybilVerificationProps {
  chainId: number;
  onMintSuccess?: () => void;
}

type VerificationStatus = 
  | 'idle'
  | 'awaiting_scan'
  | 'request_received'
  | 'generating_proof'
  | 'verified'
  | 'minting'
  | 'minted'
  | 'failed'
  | 'rejected'
  | 'duplicate';

interface MintData {
  signature: string;
  mintRequest: {
    to: string;
    uniqueIdentifier: string;
    faceMatchPassed: boolean;
    personhoodVerified: boolean;
    nonce: string;
    deadline: string;
  };
  sponsorAddress: string;
}

// Helper to mask unique identifier for privacy
const maskIdentifier = (uid: string): string => {
  if (!uid || uid.length < 12) return '***';
  return `${uid.slice(0, 6)}...${uid.slice(-4)}`;
};

const SybilVerification: React.FC<SybilVerificationProps> = ({ chainId, onMintSuccess }) => {
  const { wallets } = useWallets();
  const userWallet = wallets?.[0];

  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Verification state
  const [status, setStatus] = useState<VerificationStatus>('idle');
  const [verificationUrl, setVerificationUrl] = useState<string | null>(null);
  const [uniqueIdentifier, setUniqueIdentifier] = useState<string | null>(null);
  const [faceMatchPassed, setFaceMatchPassed] = useState(false);
  const [personhoodVerified, setPersonhoodVerified] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Progress tracking
  const [requestReceived, setRequestReceived] = useState(false);
  const [generatingProof, setGeneratingProof] = useState(false);
  const [proofsGenerated, setProofsGenerated] = useState(0);
  
  // NFT state
  const [alreadyHasNFT, setAlreadyHasNFT] = useState(false);
  const [mintTxHash, setMintTxHash] = useState<string | null>(null);
  const [isMinting, setIsMinting] = useState(false);

  const addresses = getContractAddresses(chainId);

  // Load ZKPassport SDK and check NFT ownership
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsClient(true);
      import('../../utils/zkpassport').then((module) => {
        requestPersonhoodVerification = module.requestPersonhoodVerification;
      });
    }
  }, []);

  // Check if user already has NFT
  useEffect(() => {
    const checkNFTOwnership = async () => {
      if (!userWallet?.address) {
        setIsLoading(false);
        return;
      }

      try {
        const hasToken = await hasNFTByAddress(chainId, userWallet.address);
        setAlreadyHasNFT(hasToken);
        if (hasToken) {
          setStatus('minted');
        }
      } catch (error) {
        console.error('Error checking NFT ownership:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkNFTOwnership();
  }, [chainId, userWallet?.address]);

  // User clicks mint - gets signature from backend and submits transaction
  const mintNFT = async () => {
    // Check what's missing and show specific error
    if (!userWallet) {
      setErrorMessage('Wallet not connected. Please connect your wallet first.');
      return;
    }
    if (!uniqueIdentifier) {
      setErrorMessage('Missing unique identifier from verification. Please verify again.');
      console.error('Mint failed - uniqueIdentifier is:', uniqueIdentifier);
      return;
    }

    setIsMinting(true);
    setStatus('minting');
    setErrorMessage(null);

    try {
      // Step 1: Ensure wallet is on the correct chain
      const currentChainId = userWallet.chainId;
      if (currentChainId && Number(currentChainId.replace('eip155:', '')) !== chainId) {
        await userWallet.switchChain(chainId);
      }

      // Step 2: Get signature from backend
      console.log('Getting signature from backend...');
      const response = await fetch('/api/mint-nft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userAddress: userWallet.address,
          uniqueIdentifier,
          faceMatchPassed,
          personhoodVerified: true,
          chainId,
        }),
      });

      const data = await response.json();
      console.log('Backend response:', data);

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to get mint signature from backend');
      }

      const mintData = data as MintData;

      // Step 3: Get provider and prepare transaction
      const provider = await userWallet.getEthereumProvider();
      
      // Prepare the mint request struct
      const mintRequest = {
        to: mintData.mintRequest.to as `0x${string}`,
        uniqueIdentifier: mintData.mintRequest.uniqueIdentifier,
        faceMatchPassed: mintData.mintRequest.faceMatchPassed,
        personhoodVerified: mintData.mintRequest.personhoodVerified,
        nonce: BigInt(mintData.mintRequest.nonce),
        deadline: BigInt(mintData.mintRequest.deadline),
      };

      // Encode the function call using the actual ABI
      const txData = encodeFunctionData({
        abi: SponsorContractABI,
        functionName: 'sponsorMint',
        args: [mintRequest, mintData.signature as `0x${string}`],
      });

      // Step 4: Send transaction via user's wallet
      console.log('Sending transaction...');
      const txHash = await provider.request({
        method: 'eth_sendTransaction',
        params: [{
          from: userWallet.address,
          to: mintData.sponsorAddress,
          data: txData,
        }],
      });

      console.log('Transaction sent:', txHash);
      setMintTxHash(txHash as string);
      setStatus('minted');
      setAlreadyHasNFT(true);
      onMintSuccess?.();

    } catch (error: any) {
      console.error('Mint error:', error);
      setStatus('verified'); // Go back to verified state so user can retry
      setErrorMessage(error.message || 'Failed to mint NFT. Please try again.');
    } finally {
      setIsMinting(false);
    }
  };

  const startVerification = async () => {
    if (!isClient || !requestPersonhoodVerification) {
      setErrorMessage('Please wait for the page to load completely.');
      return;
    }

    setStatus('awaiting_scan');
    setErrorMessage(null);
    setRequestReceived(false);
    setGeneratingProof(false);
    setProofsGenerated(0);
    setUniqueIdentifier(null);
    setFaceMatchPassed(false);
    setPersonhoodVerified(false);

    try {
      const result = await requestPersonhoodVerification();
      
      const {
        url,
        onRequestReceived,
        onGeneratingProof,
        onProofGenerated,
        onResult,
        onReject,
        onError,
      } = result;

      setVerificationUrl(url);

      onRequestReceived(() => {
        setRequestReceived(true);
        setStatus('request_received');
      });

      onGeneratingProof(() => {
        setGeneratingProof(true);
        setStatus('generating_proof');
      });

      onProofGenerated(() => {
        setProofsGenerated(prev => prev + 1);
      });

      // Verification complete - show results and let user mint
      onResult(async (resultData: any) => {
        // Log the full result to understand the structure
        console.log('ZKPassport full result:', JSON.stringify(resultData, null, 2));
        
        const { verified, uniqueIdentifier: uid, result: verificationResult } = resultData || {};
        
        // Try to extract unique identifier from multiple possible locations
        const extractedUid = uid 
          || verificationResult?.uniqueIdentifier 
          || resultData?.result?.uniqueIdentifier
          || resultData?.uniqueId
          || resultData?.id;
        
        console.log('Extracted data:', { verified, extractedUid, verificationResult });
        
        if (!verified) {
          setStatus('failed');
          setErrorMessage('Verification failed. Please try again.');
          return;
        }

        // Extract face match result from various possible locations
        const faceMatch = verificationResult?.facematch?.passed 
          ?? verificationResult?.faceMatch?.passed
          ?? resultData?.facematch?.passed
          ?? true;

        // Set verification results
        setUniqueIdentifier(extractedUid || null);
        setFaceMatchPassed(faceMatch);
        setPersonhoodVerified(true);

        if (extractedUid) {
          // Check if this identifier already has an NFT
          try {
            const identifierHasNFT = await hasNFT(chainId, extractedUid);
            
            if (identifierHasNFT) {
              setStatus('duplicate');
              setErrorMessage('This identity already has an NFT on this network.');
            } else {
              // Show verified state - user can now mint
              setStatus('verified');
            }
          } catch (err) {
            console.error('Error checking existing NFT:', err);
            // Still show verified state even if check fails
            setStatus('verified');
          }
        } else {
          setStatus('failed');
          setErrorMessage(`No unique identifier found in verification response. Check console for full response.`);
        }
      });

      onReject(() => {
        setStatus('rejected');
        setErrorMessage('Verification was rejected by user.');
      });

      onError((error: any) => {
        setStatus('failed');
        setErrorMessage(`Verification error: ${error.message || error}`);
      });

    } catch (error: any) {
      setStatus('failed');
      setErrorMessage(`Error starting verification: ${error.message || 'Unknown error'}`);
    }
  };

  const resetVerification = () => {
    setStatus('idle');
    setVerificationUrl(null);
    setUniqueIdentifier(null);
    setFaceMatchPassed(false);
    setPersonhoodVerified(false);
    setErrorMessage(null);
    setRequestReceived(false);
    setGeneratingProof(false);
    setProofsGenerated(0);
    setMintTxHash(null);
    setIsMinting(false);
  };

  if (isLoading) {
    return (
      <div className="bg-gray-900 border border-cyan-500/30 rounded-xl p-6">
        <div className="flex items-center justify-center gap-3">
          <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-cyan-400 font-mono text-sm">CHECKING_NFT_STATUS...</span>
        </div>
      </div>
    );
  }

  // Already has NFT
  if (alreadyHasNFT && status === 'minted' && !mintTxHash) {
    return (
      <div className="bg-gray-900 border border-green-500/30 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <span className="text-4xl">✅</span>
          <div>
            <h2 className="text-xl font-bold text-green-400 font-mono">VERIFIED_HUMAN</h2>
            <p className="text-gray-500 text-sm font-mono">You have a ZKPassport NFT on {getNetworkName(chainId)}</p>
          </div>
        </div>

        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
          <p className="text-green-400 font-mono text-sm">
            Your soulbound NFT proves you're a unique verified human. You can now claim from the faucet!
          </p>
        </div>

        <a
          href="/faucet"
          className="block w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 rounded-lg text-white font-mono font-bold text-center transition-all"
        >
          GO_TO_FAUCET →
        </a>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-cyan-500/30 rounded-xl p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <span className="text-3xl">🛡️</span>
        <div>
          <h2 className="text-xl font-bold text-cyan-400 font-mono">SYBIL_VERIFICATION</h2>
          <p className="text-gray-500 text-sm font-mono">Prove you're a unique human</p>
        </div>
      </div>

      {/* Idle State */}
      {status === 'idle' && (
        <div className="space-y-4">
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <p className="text-sm text-blue-400 font-mono font-bold mb-2">HOW_IT_WORKS:</p>
            <ol className="list-decimal list-inside space-y-1 text-xs text-blue-300 font-mono">
              <li>Click "Start Verification"</li>
              <li>Scan QR code with ZKPassport app</li>
              <li>Scan your passport NFC chip</li>
              <li>Complete face verification</li>
              <li>Review your NFT traits and mint!</li>
            </ol>
          </div>

          <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
            <p className="text-sm text-purple-400 font-mono font-bold mb-2">🎨 NFT_TRAITS:</p>
            <ul className="space-y-1 text-xs text-purple-300 font-mono">
              <li>• <span className="text-purple-400">Unique ID</span> - Your anonymous identity hash</li>
              <li>• <span className="text-purple-400">Face Match</span> - Biometric verification status</li>
              <li>• <span className="text-purple-400">Personhood</span> - Proof you're a real human</li>
            </ul>
          </div>

          <button
            onClick={startVerification}
            disabled={!isClient}
            className="w-full py-4 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 rounded-lg text-white font-mono font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {!isClient ? 'LOADING...' : 'START_VERIFICATION'}
          </button>
        </div>
      )}

      {/* QR Code */}
      {status === 'awaiting_scan' && verificationUrl && (
        <div className="space-y-4">
          <div className="bg-gray-800 rounded-lg p-6 text-center">
            <p className="text-cyan-400 font-mono text-sm mb-4">SCAN_WITH_ZKPASSPORT_APP</p>
            <div className="bg-white p-4 rounded-lg inline-block">
              <QRCodeSVG 
                value={verificationUrl} 
                size={200}
                level="H"
                includeMargin={true}
              />
            </div>
            <p className="text-xs text-gray-500 font-mono mt-4">
              Waiting for scan...
            </p>
            <a 
              href={verificationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-cyan-400 hover:underline font-mono mt-2 block"
            >
              Open in ZKPassport app
            </a>
          </div>
          
          <button
            onClick={resetVerification}
            className="w-full py-2 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg text-gray-400 font-mono text-sm"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Progress States */}
      {(['request_received', 'generating_proof'].includes(status)) && (
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className={requestReceived ? 'text-green-400' : 'text-gray-500'}>
                {requestReceived ? '✓' : '○'}
              </span>
              <span className={`text-sm font-mono ${requestReceived ? 'text-green-400' : 'text-gray-400'}`}>
                Request received
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className={generatingProof ? 'text-green-400' : 'text-gray-500'}>
                {generatingProof ? '✓' : '○'}
              </span>
              <span className={`text-sm font-mono ${generatingProof ? 'text-green-400' : 'text-gray-400'}`}>
                Generating proofs {proofsGenerated > 0 && `(${proofsGenerated}/4)`}
              </span>
            </div>
          </div>

          {generatingProof && (
            <div className="flex items-center justify-center mt-4 gap-3">
              <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-cyan-400 font-mono text-sm">Verifying...</span>
            </div>
          )}
        </div>
      )}

      {/* Verified - Show NFT Preview & Mint Button */}
      {status === 'verified' && uniqueIdentifier && (
        <div className="space-y-4">
          {/* Success Banner */}
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">✓</span>
              <h3 className="text-green-400 font-mono font-bold">VERIFICATION_COMPLETE!</h3>
            </div>
            <p className="text-green-300 font-mono text-sm">
              Your identity has been verified. Review your NFT traits below and mint!
            </p>
          </div>

          {/* NFT Preview Card */}
          <div className="bg-gradient-to-br from-purple-900/50 to-cyan-900/50 border border-purple-500/30 rounded-xl p-5">
            <div className="text-center mb-4">
              <span className="text-5xl">🪪</span>
              <h3 className="text-xl font-bold text-white font-mono mt-2">ZKPassport NFT</h3>
              <p className="text-gray-400 text-xs font-mono">Soulbound Identity Token</p>
            </div>

            {/* NFT Traits */}
            <div className="space-y-3 bg-black/30 rounded-lg p-4">
              <p className="text-xs text-gray-500 font-mono uppercase tracking-wider mb-3">NFT Traits (On-Chain Metadata)</p>
              
              <div className="flex justify-between items-center py-2 border-b border-gray-700">
                <span className="text-gray-400 font-mono text-sm">Unique ID</span>
                <span className="text-cyan-400 font-mono text-sm font-bold">
                  {maskIdentifier(uniqueIdentifier)}
                </span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-gray-700">
                <span className="text-gray-400 font-mono text-sm">Face Match</span>
                <span className={`font-mono text-sm font-bold ${faceMatchPassed ? 'text-green-400' : 'text-yellow-400'}`}>
                  {faceMatchPassed ? '✓ PASSED' : '○ NOT VERIFIED'}
                </span>
              </div>
              
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-400 font-mono text-sm">Personhood</span>
                <span className={`font-mono text-sm font-bold ${personhoodVerified ? 'text-green-400' : 'text-yellow-400'}`}>
                  {personhoodVerified ? '✓ VERIFIED' : '○ NOT VERIFIED'}
                </span>
              </div>
            </div>

            {/* Network Badge */}
            <div className="mt-4 text-center">
              <span className="inline-block px-3 py-1 bg-cyan-500/20 border border-cyan-500/30 rounded-full text-cyan-400 font-mono text-xs">
                {getNetworkName(chainId).toUpperCase()} NETWORK
              </span>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
              <p className="text-red-400 font-mono text-xs">{errorMessage}</p>
            </div>
          )}

          {/* Gas Notice */}
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
            <p className="text-yellow-400 font-mono text-xs">
              ⛽ A small amount of ETH is required for the mint transaction gas fee.
            </p>
          </div>

          {/* Mint Button */}
          <button
            onClick={mintNFT}
            disabled={isMinting}
            className="w-full py-4 bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-600 hover:to-cyan-600 rounded-lg text-white font-mono font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isMinting ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                MINTING...
              </span>
            ) : (
              '🎨 MINT_MY_NFT'
            )}
          </button>

          <button
            onClick={resetVerification}
            disabled={isMinting}
            className="w-full py-2 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg text-gray-400 font-mono text-sm disabled:opacity-50"
          >
            Start Over
          </button>
        </div>
      )}

      {/* Minting */}
      {status === 'minting' && (
        <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-6 text-center">
          <div className="w-12 h-12 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-cyan-400 font-mono font-bold">MINTING_NFT...</p>
          <p className="text-xs text-gray-500 font-mono mt-2">
            Confirm the transaction in your wallet
          </p>
        </div>
      )}

      {/* Minted Success */}
      {status === 'minted' && mintTxHash && (
        <div className="space-y-4">
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-3xl">🎉</span>
              <h3 className="text-green-400 font-mono font-bold">NFT_MINTED!</h3>
            </div>
            <p className="text-green-300 font-mono text-sm mb-3">
              You are now a verified human with a soulbound ZKPassport NFT!
            </p>
            
            {/* Show final traits */}
            <div className="bg-black/20 rounded-lg p-3 mb-3">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-gray-400">Unique ID:</span>
                <span className="text-cyan-400">{uniqueIdentifier ? maskIdentifier(uniqueIdentifier) : '***'}</span>
              </div>
              <div className="flex justify-between text-xs font-mono mt-1">
                <span className="text-gray-400">Face Match:</span>
                <span className="text-green-400">{faceMatchPassed ? 'Passed' : 'N/A'}</span>
              </div>
              <div className="flex justify-between text-xs font-mono mt-1">
                <span className="text-gray-400">Personhood:</span>
                <span className="text-green-400">Verified</span>
              </div>
            </div>

            <a
              href={getExplorerUrl(chainId, mintTxHash)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-green-400 font-mono hover:underline break-all"
            >
              View transaction →
            </a>
          </div>

          <a
            href="/faucet"
            className="block w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 rounded-lg text-white font-mono font-bold text-center transition-all"
          >
            CLAIM_FROM_FAUCET →
          </a>
        </div>
      )}

      {/* Duplicate */}
      {status === 'duplicate' && (
        <div className="space-y-4">
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">⚠️</span>
              <h3 className="text-yellow-400 font-mono font-bold">ALREADY_REGISTERED</h3>
            </div>
            <p className="text-yellow-300 font-mono text-sm">
              {errorMessage || 'This identity already has an NFT on this network.'}
            </p>
            {uniqueIdentifier && (
              <p className="text-yellow-400/60 font-mono text-xs mt-2">
                ID: {maskIdentifier(uniqueIdentifier)}
              </p>
            )}
          </div>

          <button
            onClick={resetVerification}
            className="w-full py-2 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg text-gray-300 font-mono text-sm transition-all"
          >
            TRY_AGAIN
          </button>
        </div>
      )}

      {/* Failed/Rejected */}
      {(['failed', 'rejected'].includes(status)) && (
        <div className="space-y-4">
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">❌</span>
              <h3 className="text-red-400 font-mono font-bold">
                {status === 'rejected' ? 'REJECTED' : 'FAILED'}
              </h3>
            </div>
            <p className="text-red-300 font-mono text-sm">
              {errorMessage || 'Something went wrong.'}
            </p>
          </div>

          <button
            onClick={resetVerification}
            className="w-full py-3 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 rounded-lg text-cyan-400 font-mono font-bold transition-all"
          >
            TRY_AGAIN
          </button>
        </div>
      )}
    </div>
  );
};

export default SybilVerification;
