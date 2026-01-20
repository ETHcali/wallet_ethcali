import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { QRCodeSVG } from 'qrcode.react';
import { useWallets, useSendTransaction } from '@privy-io/react-auth';
import { encodeFunctionData, createPublicClient, http, decodeEventLog } from 'viem';
import {
  hasNFTByAddress,
  hasNFT,
  getContractAddresses,
  getExplorerUrl,
  getNetworkName,
  getTokenIdByAddress,
  getTokenData,
  getTokenURI,
} from '../../utils/contracts';
import { getChainRpc } from '../../config/networks';
import ZKPassportNFTABI from '../../frontend/abis/ZKPassportNFT.json';

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
  const { sendTransaction } = useSendTransaction();
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
  const [tokenId, setTokenId] = useState<bigint | null>(null);
  const [tokenData, setTokenData] = useState<{
    uniqueIdentifier: string;
    faceMatchPassed: boolean;
    personhoodVerified: boolean;
  } | null>(null);
  const [nftMetadata, setNftMetadata] = useState<any>(null);

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

  // Check if user already has NFT and fetch details
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
          
          // Fetch NFT details
          const fetchedTokenId = await getTokenIdByAddress(chainId, userWallet.address);
          if (fetchedTokenId) {
            setTokenId(fetchedTokenId);
            const [data, uri] = await Promise.all([
              getTokenData(chainId, fetchedTokenId),
              getTokenURI(chainId, fetchedTokenId),
            ]);
            setTokenData(data);
            if (uri) {
              try {
                if (uri.startsWith('data:application/json;base64,')) {
                  const base64Data = uri.split(',')[1];
                  const jsonData = JSON.parse(atob(base64Data));
                  setNftMetadata(jsonData);
                } else if (uri.startsWith('http')) {
                  const response = await fetch(uri);
                  const jsonData = await response.json();
                  setNftMetadata(jsonData);
                }
              } catch (err) {
                console.error('Error parsing metadata:', err);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error checking NFT ownership:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkNFTOwnership();
  }, [chainId, userWallet?.address]);

  // User clicks mint - direct mint with Privy sponsorship (no backend signature needed)
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

      // Step 2: Get contract address for direct minting
      const addresses = getContractAddresses(chainId);
      const nftContractAddress = addresses.ZKPassportNFT;
      
      console.log('Minting directly to NFT contract:', nftContractAddress);

      // Step 3: Prepare direct mint transaction data
      const mintTxData = encodeFunctionData({
        abi: ZKPassportNFTABI,
        functionName: 'mintWithVerification',
          args: [uniqueIdentifier, faceMatchPassed, personhoodVerified || true],
      });

      // Step 4: Send sponsored transaction directly to NFT contract
      console.log('Sending sponsored transaction...');
      const result = await sendTransaction(
        {
          to: nftContractAddress as `0x${string}`,
          data: mintTxData,
        },
        {
          sponsor: true, // Enable Privy's native gas sponsorship
        } as any // Type assertion for compatibility
      );

      console.log('Sponsored transaction sent:', result.hash);
      setMintTxHash(result.hash);
      setStatus('minted');
      setAlreadyHasNFT(true);
      
      // Fetch NFT details after minting
      try {
        // Wait for transaction receipt
        const rpcUrl = getChainRpc(chainId);
        const client = createPublicClient({
          transport: http(rpcUrl),
        });
        
        const receipt = await client.waitForTransactionReceipt({
          hash: result.hash as `0x${string}`,
        });
        
        // Extract tokenId from NFTMinted event
        const nftMintedEvent = receipt.logs.find((log: any) => {
          try {
            const decoded = decodeEventLog({
              abi: ZKPassportNFTABI as any,
              data: log.data,
              topics: log.topics,
            });
            return decoded.eventName === 'NFTMinted';
          } catch {
            return false;
          }
        });
        
        if (nftMintedEvent) {
          const decoded = decodeEventLog({
            abi: ZKPassportNFTABI as any,
            data: nftMintedEvent.data,
            topics: nftMintedEvent.topics,
          });
          const mintedTokenId = (decoded.args as any).tokenId as bigint;
          setTokenId(mintedTokenId);
          
          // Fetch token data and metadata
          const [data, uri] = await Promise.all([
            getTokenData(chainId, mintedTokenId),
            getTokenURI(chainId, mintedTokenId),
          ]);
          
          setTokenData(data);
          
          // Parse tokenURI if it's base64
          if (uri) {
            try {
              if (uri.startsWith('data:application/json;base64,')) {
                const base64Data = uri.split(',')[1];
                const jsonData = JSON.parse(atob(base64Data));
                setNftMetadata(jsonData);
              } else if (uri.startsWith('http')) {
                const response = await fetch(uri);
                const jsonData = await response.json();
                setNftMetadata(jsonData);
              }
            } catch (err) {
              console.error('Error parsing metadata:', err);
            }
          }
        } else {
          // Fallback: try to get tokenId by address
          const fetchedTokenId = await getTokenIdByAddress(chainId, userWallet.address);
          if (fetchedTokenId) {
            setTokenId(fetchedTokenId);
            const [data, uri] = await Promise.all([
              getTokenData(chainId, fetchedTokenId),
              getTokenURI(chainId, fetchedTokenId),
            ]);
            setTokenData(data);
            if (uri) {
              try {
                if (uri.startsWith('data:application/json;base64,')) {
                  const base64Data = uri.split(',')[1];
                  const jsonData = JSON.parse(atob(base64Data));
                  setNftMetadata(jsonData);
                } else if (uri.startsWith('http')) {
                  const response = await fetch(uri);
                  const jsonData = await response.json();
                  setNftMetadata(jsonData);
                }
              } catch (err) {
                console.error('Error parsing metadata:', err);
              }
            }
          }
        }
      } catch (err) {
        console.error('Error fetching NFT details:', err);
      }
      
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
    setTokenId(null);
    setTokenData(null);
    setNftMetadata(null);
  };

  // Helper function to get IPFS gateway URL
  const getIPFSImageUrl = (imageUrl: string): string => {
    if (!imageUrl) return '';
    if (imageUrl.startsWith('ipfs://')) {
      return `https://gateway.pinata.cloud/ipfs/${imageUrl.replace('ipfs://', '')}`;
    }
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    return imageUrl;
  };

  // NFT Card Component
  const renderNFTCard = () => {
    if (isLoading) {
      return (
        <div className="bg-black/60 border border-cyan-500/30 rounded-lg p-4">
          <div className="flex items-center justify-center gap-3">
            <div className="w-3 h-3 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-cyan-400 font-mono text-[10px] tracking-wider">LOADING...</span>
          </div>
        </div>
      );
    }

    if (alreadyHasNFT && (tokenId || tokenData || nftMetadata)) {
      return (
        <div className="bg-black/60 border border-green-500/40 rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-3 h-3 bg-green-500 rounded-full shadow-lg shadow-green-500/50"></div>
            <div>
              <h2 className="text-sm font-bold text-green-400 font-mono tracking-wide">VERIFIED</h2>
              <p className="text-gray-600 text-[10px] font-mono">{getNetworkName(chainId).toUpperCase()}</p>
            </div>
          </div>

          {/* NFT Image if available */}
          {nftMetadata?.image && (
            <div className="mb-3 rounded-lg overflow-hidden border border-cyan-500/20 relative aspect-square">
              <Image 
                src={getIPFSImageUrl(nftMetadata.image)} 
                alt="ZKPassport NFT" 
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 400px"
                unoptimized={nftMetadata.image.startsWith('ipfs://')}
              />
            </div>
          )}

          {/* NFT Name */}
          {nftMetadata?.name && (
            <div className="mb-2">
              <h3 className="text-sm font-bold text-cyan-400 font-mono">{nftMetadata.name}</h3>
            </div>
          )}

          {/* NFT Description */}
          {nftMetadata?.description && (
            <div className="mb-2">
              <p className="text-[10px] text-gray-500 font-mono">{nftMetadata.description}</p>
            </div>
          )}

          {/* NFT Details */}
          {(tokenId || tokenData) && (
            <div className="space-y-1.5 text-[10px] font-mono">
              {tokenId && (
                <div className="flex justify-between py-1 border-b border-gray-800">
                  <span className="text-gray-600">token_id</span>
                  <span className="text-cyan-400">#{tokenId.toString()}</span>
                </div>
              )}
              {tokenData && (
                <>
                  <div className="flex justify-between py-1 border-b border-gray-800">
                    <span className="text-gray-600">uid</span>
                    <span className="text-cyan-400">{maskIdentifier(tokenData.uniqueIdentifier)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-800">
                    <span className="text-gray-600">face_match</span>
                    <span className={tokenData.faceMatchPassed ? 'text-green-400' : 'text-gray-600'}>
                      {tokenData.faceMatchPassed ? 'PASS' : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-gray-600">personhood</span>
                    <span className={tokenData.personhoodVerified ? 'text-green-400' : 'text-gray-600'}>
                      {tokenData.personhoodVerified ? 'VERIFIED' : 'FALSE'}
                    </span>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Attributes from metadata */}
          {nftMetadata?.attributes && nftMetadata.attributes.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-800">
              <div className="text-[9px] text-gray-600 font-mono mb-2 tracking-wider">ATTRIBUTES</div>
              <div className="flex flex-wrap gap-1.5">
                {nftMetadata.attributes.map((attr: any, idx: number) => (
                  <div 
                    key={idx}
                    className="px-2 py-1 bg-gray-900/50 border border-gray-800 rounded text-[9px] font-mono"
                  >
                    <span className="text-gray-500">{attr.trait_type}:</span>{' '}
                    <span className="text-cyan-400">{attr.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Link
            href="/faucet"
            className="block w-full py-2.5 bg-green-500/20 hover:bg-green-500/30 border border-green-500/40 rounded text-green-400 font-mono text-xs font-bold text-center transition-all"
          >
            CLAIM_FAUCET →
          </Link>
        </div>
      );
    }

    // No NFT - Show placeholder card
    return (
      <div className="bg-black/60 border border-gray-700/40 rounded-lg p-4 space-y-3">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
          <div>
            <h2 className="text-sm font-bold text-gray-400 font-mono tracking-wide">NO_VERIFICATION</h2>
            <p className="text-gray-600 text-[10px] font-mono">{getNetworkName(chainId).toUpperCase()}</p>
          </div>
        </div>

        <div className="text-center py-8">
          <div className="text-gray-600 text-[10px] font-mono mb-4">
            VERIFY YOUR IDENTITY TO MINT YOUR ZKPASSPORT NFT
          </div>
          <div className="text-gray-700 text-[9px] font-mono">
            • PRIVACY_FIRST • NO_KYC • SOULBOUND
          </div>
        </div>
      </div>
    );
  };


  return (
    <div className="space-y-4">
      {/* NFT Card - Always shown at top */}
      {renderNFTCard()}

      {/* Verification Flow - Only show if no NFT */}
      {!alreadyHasNFT && (
        <div className="bg-black/60 border border-cyan-500/30 rounded-lg p-4 space-y-4">
          {/* Minimal Header */}
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
            <h2 className="text-xs font-bold text-cyan-400 font-mono tracking-wider">VERIFY_IDENTITY</h2>
          </div>

      {/* Idle State */}
      {status === 'idle' && (
        <div className="space-y-3">
          {/* Compact Steps */}
          <div className="grid grid-cols-4 gap-1 text-[9px] font-mono text-gray-500">
            <div className="text-center p-2 bg-gray-900/50 rounded">
              <div className="text-cyan-500 text-lg mb-1">1</div>
              <span>SCAN</span>
            </div>
            <div className="text-center p-2 bg-gray-900/50 rounded">
              <div className="text-cyan-500 text-lg mb-1">2</div>
              <span>NFC</span>
            </div>
            <div className="text-center p-2 bg-gray-900/50 rounded">
              <div className="text-cyan-500 text-lg mb-1">3</div>
              <span>FACE</span>
            </div>
            <div className="text-center p-2 bg-gray-900/50 rounded">
              <div className="text-cyan-500 text-lg mb-1">4</div>
              <span>MINT</span>
            </div>
          </div>

          <button
            onClick={startVerification}
            disabled={!isClient}
            className="w-full py-3 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 rounded text-cyan-400 font-mono font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {!isClient ? 'INIT...' : 'START →'}
          </button>
        </div>
      )}

      {/* QR Code */}
      {status === 'awaiting_scan' && verificationUrl && (
        <div className="space-y-3">
          <div className="bg-black/40 rounded p-4 text-center">
            <p className="text-[10px] text-gray-500 font-mono mb-3 tracking-wider">SCAN_QR</p>
            <div className="bg-white p-3 rounded inline-block">
              <QRCodeSVG
                value={verificationUrl}
                size={160}
                level="H"
                includeMargin={false}
              />
            </div>
            <div className="flex items-center justify-center gap-2 mt-3">
              <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse"></div>
              <span className="text-[10px] text-gray-600 font-mono">WAITING...</span>
            </div>
            <a
              href={verificationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-cyan-500/70 hover:text-cyan-400 font-mono mt-2 block"
            >
              open_app →
            </a>
          </div>

          <button
            onClick={resetVerification}
            className="w-full py-2 bg-gray-900/50 hover:bg-gray-800 border border-gray-700 rounded text-gray-500 font-mono text-[10px]"
          >
            CANCEL
          </button>
        </div>
      )}

      {/* Progress States */}
      {(['request_received', 'generating_proof'].includes(status)) && (
        <div className="bg-black/40 rounded p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-[10px] text-cyan-400 font-mono tracking-wider">PROCESSING</span>
          </div>
          <div className="space-y-2 text-[10px] font-mono">
            <div className="flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full ${requestReceived ? 'bg-green-500' : 'bg-gray-600'}`}></div>
              <span className={requestReceived ? 'text-green-400' : 'text-gray-600'}>REQUEST</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full ${generatingProof ? 'bg-cyan-500 animate-pulse' : 'bg-gray-600'}`}></div>
              <span className={generatingProof ? 'text-cyan-400' : 'text-gray-600'}>
                PROOF {proofsGenerated > 0 && `[${proofsGenerated}/4]`}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Verified - Show NFT Preview & Mint Button */}
      {status === 'verified' && uniqueIdentifier && (
        <div className="space-y-3">
          {/* Success Badge */}
          <div className="flex items-center gap-2 p-2 bg-green-500/10 border border-green-500/30 rounded">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-[10px] text-green-400 font-mono tracking-wider">VERIFIED</span>
          </div>

          {/* NFT Preview - Compact */}
          <div className="bg-gradient-to-br from-purple-900/30 to-cyan-900/30 border border-purple-500/20 rounded p-3">
            <div className="text-[10px] text-gray-500 font-mono mb-2 tracking-wider">NFT_TRAITS</div>

            <div className="space-y-1.5 text-[11px] font-mono">
              <div className="flex justify-between items-center py-1.5 border-b border-gray-800">
                <span className="text-gray-500">uid</span>
                <span className="text-cyan-400">{maskIdentifier(uniqueIdentifier)}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-gray-800">
                <span className="text-gray-500">face</span>
                <span className={faceMatchPassed ? 'text-green-400' : 'text-gray-600'}>
                  {faceMatchPassed ? 'PASS' : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5">
                <span className="text-gray-500">human</span>
                <span className={personhoodVerified ? 'text-green-400' : 'text-gray-600'}>
                  {personhoodVerified ? 'TRUE' : 'FALSE'}
                </span>
              </div>
            </div>

            <div className="mt-2 pt-2 border-t border-gray-800">
              <span className="text-[9px] text-gray-600 font-mono">
                {getNetworkName(chainId).toUpperCase()} • SOULBOUND
              </span>
            </div>
          </div>

          {/* Error */}
          {errorMessage && (
            <div className="text-[10px] text-red-400 font-mono p-2 bg-red-500/10 border border-red-500/20 rounded">
              {errorMessage}
            </div>
          )}

          {/* Mint Button */}
          <button
            onClick={mintNFT}
            disabled={isMinting}
            className="w-full py-3 bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 rounded text-green-400 font-mono font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isMinting ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-3 h-3 border-2 border-green-400 border-t-transparent rounded-full animate-spin"></div>
                MINTING...
              </span>
            ) : (
              'MINT →'
            )}
          </button>

          <button
            onClick={resetVerification}
            disabled={isMinting}
            className="w-full py-2 text-[10px] text-gray-600 hover:text-gray-400 font-mono disabled:opacity-50"
          >
            RESTART
          </button>
        </div>
      )}

      {/* Minting */}
      {status === 'minting' && (
        <div className="bg-black/40 rounded p-4 text-center">
          <div className="flex items-center justify-center gap-3">
            <div className="w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-[10px] text-cyan-400 font-mono tracking-wider">MINTING...</span>
          </div>
          <p className="text-[9px] text-gray-600 font-mono mt-2">CONFIRM_TX</p>
        </div>
      )}

      {/* Minted Success - Show NFT Details */}
      {status === 'minted' && (
        <div className="space-y-3">
          <div className="bg-green-500/10 border border-green-500/30 rounded p-3">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 bg-green-500 rounded-full shadow-lg shadow-green-500/50"></div>
              <span className="text-[10px] text-green-400 font-mono tracking-wider">MINTED</span>
            </div>

            {/* NFT Image if available */}
            {nftMetadata?.image && (
              <div className="mb-3 rounded-lg overflow-hidden border border-cyan-500/20 relative aspect-square">
                <Image 
                  src={getIPFSImageUrl(nftMetadata.image)} 
                  alt="ZKPassport NFT" 
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 400px"
                  unoptimized={nftMetadata.image.startsWith('ipfs://')}
                />
              </div>
            )}

            {/* NFT Name */}
            {nftMetadata?.name && (
              <div className="mb-2">
                <h3 className="text-sm font-bold text-cyan-400 font-mono">{nftMetadata.name}</h3>
              </div>
            )}

            {/* NFT Details */}
            <div className="space-y-1.5 text-[10px] font-mono mb-3">
              {tokenId && (
                <div className="flex justify-between py-1 border-b border-gray-800">
                  <span className="text-gray-600">token_id</span>
                  <span className="text-cyan-400">#{tokenId.toString()}</span>
                </div>
              )}
              <div className="flex justify-between py-1 border-b border-gray-800">
                <span className="text-gray-600">uid</span>
                <span className="text-cyan-400">
                  {tokenData?.uniqueIdentifier 
                    ? maskIdentifier(tokenData.uniqueIdentifier) 
                    : uniqueIdentifier 
                      ? maskIdentifier(uniqueIdentifier) 
                      : '***'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-800">
                <span className="text-gray-600">face_match</span>
                <span className={tokenData?.faceMatchPassed ? 'text-green-400' : 'text-gray-600'}>
                  {tokenData?.faceMatchPassed ? 'PASS' : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-800">
                <span className="text-gray-600">personhood</span>
                <span className={tokenData?.personhoodVerified ? 'text-green-400' : 'text-gray-600'}>
                  {tokenData?.personhoodVerified ? 'VERIFIED' : 'FALSE'}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-600">status</span>
                <span className="text-green-400">SOULBOUND</span>
              </div>
            </div>

            {/* Attributes from metadata */}
            {nftMetadata?.attributes && nftMetadata.attributes.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-800">
                <div className="text-[9px] text-gray-600 font-mono mb-2 tracking-wider">ATTRIBUTES</div>
                <div className="flex flex-wrap gap-1.5">
                  {nftMetadata.attributes.map((attr: any, idx: number) => (
                    <div 
                      key={idx}
                      className="px-2 py-1 bg-gray-900/50 border border-gray-800 rounded text-[9px] font-mono"
                    >
                      <span className="text-gray-500">{attr.trait_type}:</span>{' '}
                      <span className="text-cyan-400">{attr.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Transaction Link */}
            {mintTxHash && (
              <div className="mt-3 pt-3 border-t border-gray-800">
                <a
                  href={getExplorerUrl(chainId, mintTxHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[9px] text-gray-500 hover:text-cyan-400 font-mono"
                >
                  tx: {mintTxHash.slice(0, 10)}...{mintTxHash.slice(-6)} →
                </a>
              </div>
            )}

            {/* Network Info */}
            <div className="mt-2 pt-2 border-t border-gray-800">
              <span className="text-[9px] text-gray-600 font-mono">
                {getNetworkName(chainId).toUpperCase()} • SOULBOUND • NON_TRANSFERABLE
              </span>
            </div>
          </div>

          <Link
            href="/faucet"
            className="block w-full py-2.5 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 rounded text-cyan-400 font-mono text-xs font-bold text-center transition-all"
          >
            CLAIM_FAUCET →
          </Link>
        </div>
      )}

      {/* Duplicate */}
      {status === 'duplicate' && (
        <div className="space-y-3">
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded p-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-[10px] text-yellow-400 font-mono tracking-wider">DUPLICATE</span>
            </div>
            <p className="text-[10px] text-yellow-400/70 font-mono">
              {uniqueIdentifier && `ID: ${maskIdentifier(uniqueIdentifier)}`}
            </p>
          </div>
          <button
            onClick={resetVerification}
            className="w-full py-2 text-[10px] text-gray-500 hover:text-gray-400 font-mono"
          >
            RETRY
          </button>
        </div>
      )}

      {/* Failed/Rejected */}
      {(['failed', 'rejected'].includes(status)) && (
        <div className="space-y-3">
          <div className="bg-red-500/10 border border-red-500/30 rounded p-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-[10px] text-red-400 font-mono tracking-wider">
                {status === 'rejected' ? 'REJECTED' : 'ERROR'}
              </span>
            </div>
            {errorMessage && (
              <p className="text-[9px] text-red-400/70 font-mono">{errorMessage}</p>
            )}
          </div>
          <button
            onClick={resetVerification}
            className="w-full py-2.5 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 rounded text-cyan-400 font-mono text-[10px] font-bold transition-all"
          >
            RETRY →
          </button>
        </div>
      )}
        </div>
      )}
    </div>
  );
};

export default SybilVerification;
