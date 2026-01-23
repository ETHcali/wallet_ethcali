/**
 * useZKPassportVerification - Hook for managing ZKPassport verification flow
 */
import { useState, useCallback, useEffect } from 'react';
import { useWallets, useSendTransaction } from '@privy-io/react-auth';
import { encodeFunctionData } from 'viem';
import {
  hasNFTByAddress,
  hasNFT,
  getContractAddresses,
} from '../utils/contracts';
import ZKPassportNFTABI from '../frontend/abis/ZKPassportNFT.json';

// Dynamic import for ZKPassport
let requestPersonhoodVerification: any;

export type VerificationStatus =
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

export interface VerificationState {
  status: VerificationStatus;
  verificationUrl: string | null;
  uniqueIdentifier: string | null;
  faceMatchPassed: boolean;
  personhoodVerified: boolean;
  errorMessage: string | null;
  requestReceived: boolean;
  generatingProof: boolean;
  proofsGenerated: number;
  mintTxHash: string | null;
  isMinting: boolean;
  isClient: boolean;
}

export interface UseZKPassportVerificationResult extends VerificationState {
  startVerification: () => Promise<void>;
  mintNFT: () => Promise<void>;
  resetVerification: () => void;
}

export function useZKPassportVerification(chainId: number, onMintSuccess?: () => void): UseZKPassportVerificationResult {
  const { wallets } = useWallets();
  const { sendTransaction } = useSendTransaction();
  const userWallet = wallets?.[0];

  const [isClient, setIsClient] = useState(false);
  const [status, setStatus] = useState<VerificationStatus>('idle');
  const [verificationUrl, setVerificationUrl] = useState<string | null>(null);
  const [uniqueIdentifier, setUniqueIdentifier] = useState<string | null>(null);
  const [faceMatchPassed, setFaceMatchPassed] = useState(false);
  const [personhoodVerified, setPersonhoodVerified] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [requestReceived, setRequestReceived] = useState(false);
  const [generatingProof, setGeneratingProof] = useState(false);
  const [proofsGenerated, setProofsGenerated] = useState(0);
  const [mintTxHash, setMintTxHash] = useState<string | null>(null);
  const [isMinting, setIsMinting] = useState(false);

  // Load ZKPassport SDK
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsClient(true);
      import('../utils/zkpassport').then((module) => {
        requestPersonhoodVerification = module.requestPersonhoodVerification;
      });
    }
  }, []);

  const resetVerification = useCallback(() => {
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
  }, []);

  const startVerification = useCallback(async () => {
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
        setProofsGenerated((prev) => prev + 1);
      });

      onResult(async (resultData: any) => {
        const { verified, uniqueIdentifier: uid, result: verificationResult } = resultData || {};

        const extractedUid =
          uid ||
          verificationResult?.uniqueIdentifier ||
          resultData?.result?.uniqueIdentifier ||
          resultData?.uniqueId ||
          resultData?.id;

        if (!verified) {
          setStatus('failed');
          setErrorMessage('Verification failed. Please try again.');
          return;
        }

        const faceMatch =
          verificationResult?.facematch?.passed ??
          verificationResult?.faceMatch?.passed ??
          resultData?.facematch?.passed ??
          true;

        setUniqueIdentifier(extractedUid || null);
        setFaceMatchPassed(faceMatch);
        setPersonhoodVerified(true);

        if (extractedUid) {
          try {
            const identifierHasNFT = await hasNFT(chainId, extractedUid);

            if (identifierHasNFT) {
              setStatus('duplicate');
              setErrorMessage('This identity already has an NFT on this network.');
            } else {
              setStatus('verified');
            }
          } catch {
            setStatus('verified');
          }
        } else {
          setStatus('failed');
          setErrorMessage('No unique identifier found in verification response.');
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
  }, [isClient, chainId]);

  const mintNFT = useCallback(async () => {
    if (!userWallet) {
      setErrorMessage('Wallet not connected. Please connect your wallet first.');
      return;
    }
    if (!uniqueIdentifier) {
      setErrorMessage('Missing unique identifier from verification. Please verify again.');
      return;
    }

    try {
      const identifierHasNFT = await hasNFT(chainId, uniqueIdentifier);
      if (identifierHasNFT) {
        setErrorMessage('This unique identifier has already been used to mint an NFT.');
        setStatus('duplicate');
        return;
      }
    } catch {
      // Continue - contract will enforce
    }

    try {
      const addressHasNFT = await hasNFTByAddress(chainId, userWallet.address);
      if (addressHasNFT) {
        setErrorMessage('This address already has an NFT. Only one NFT per address is allowed.');
        setStatus('duplicate');
        return;
      }
    } catch {
      // Continue - contract will enforce
    }

    setIsMinting(true);
    setStatus('minting');
    setErrorMessage(null);

    try {
      const currentChainId = userWallet.chainId;
      if (currentChainId && Number(currentChainId.replace('eip155:', '')) !== chainId) {
        await userWallet.switchChain(chainId);
      }

      const addresses = getContractAddresses(chainId);
      const nftContractAddress = addresses.ZKPassportNFT;

      const mintTxData = encodeFunctionData({
        abi: ZKPassportNFTABI,
        functionName: 'mint',
        args: [uniqueIdentifier, faceMatchPassed, personhoodVerified || true],
      });

      const result = await sendTransaction(
        {
          to: nftContractAddress as `0x${string}`,
          data: mintTxData,
        },
        {
          sponsor: true,
        } as any
      );

      setMintTxHash(result.hash);
      setStatus('minted');
      onMintSuccess?.();
    } catch (error: any) {
      setStatus('verified');
      setErrorMessage(error.message || 'Failed to mint NFT. Please try again.');
    } finally {
      setIsMinting(false);
    }
  }, [userWallet, uniqueIdentifier, faceMatchPassed, personhoodVerified, chainId, sendTransaction, onMintSuccess]);

  return {
    status,
    verificationUrl,
    uniqueIdentifier,
    faceMatchPassed,
    personhoodVerified,
    errorMessage,
    requestReceived,
    generatingProof,
    proofsGenerated,
    mintTxHash,
    isMinting,
    isClient,
    startVerification,
    mintNFT,
    resetVerification,
  };
}
