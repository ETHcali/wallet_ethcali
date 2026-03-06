/**
 * useZKPassportVerification - Hook for managing ZKPassport verification flow
 *
 * Uses on-chain ZK proof verification (mode: "compressed-evm").
 * The proof is passed directly to the contract's mint(ProofVerificationParams, isIDCard) function.
 */
import { useState, useCallback, useEffect, useRef } from 'react';
import { useWallets, useSendTransaction } from '@privy-io/react-auth';
import { encodeFunctionData } from 'viem';
import {
  hasNFTByAddress,
  hasNFTByIdentifier,
  getContractAddresses,
} from '../utils/contracts';
import ZKPassportNFTABI from '../frontend/abis/ZKPassportNFT.json';

// Dynamic import for ZKPassport (browser-only)
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
  uniqueIdentifier: `0x${string}` | null;
  isOver18: boolean;
  nationality: string | null;
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

  // Refs hold cross-callback data without triggering re-renders
  const zkPassportRef = useRef<any>(null);
  const proofRef = useRef<any>(null);
  const verifierParamsRef = useRef<any>(null);
  const isIDCardRef = useRef<boolean>(false);

  const [isClient, setIsClient] = useState(false);
  const [status, setStatus] = useState<VerificationStatus>('idle');
  const [verificationUrl, setVerificationUrl] = useState<string | null>(null);
  const [uniqueIdentifier, setUniqueIdentifier] = useState<`0x${string}` | null>(null);
  const [isOver18, setIsOver18] = useState(false);
  const [nationality, setNationality] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [requestReceived, setRequestReceived] = useState(false);
  const [generatingProof, setGeneratingProof] = useState(false);
  const [proofsGenerated, setProofsGenerated] = useState(0);
  const [mintTxHash, setMintTxHash] = useState<string | null>(null);
  const [isMinting, setIsMinting] = useState(false);

  // Load ZKPassport SDK (browser-only)
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
    setIsOver18(false);
    setNationality(null);
    setErrorMessage(null);
    setRequestReceived(false);
    setGeneratingProof(false);
    setProofsGenerated(0);
    setMintTxHash(null);
    setIsMinting(false);
    zkPassportRef.current = null;
    proofRef.current = null;
    verifierParamsRef.current = null;
    isIDCardRef.current = false;
  }, []);

  const startVerification = useCallback(async () => {
    if (!isClient || !requestPersonhoodVerification) {
      setErrorMessage('Please wait for the page to load completely.');
      return;
    }
    if (!userWallet?.address) {
      setErrorMessage('Please connect your wallet first.');
      return;
    }

    setStatus('awaiting_scan');
    setErrorMessage(null);
    setRequestReceived(false);
    setGeneratingProof(false);
    setProofsGenerated(0);
    setUniqueIdentifier(null);
    setIsOver18(false);
    setNationality(null);
    proofRef.current = null;
    verifierParamsRef.current = null;

    try {
      const result = await requestPersonhoodVerification(userWallet.address);

      const {
        url,
        onRequestReceived,
        onGeneratingProof,
        onProofGenerated,
        onResult,
        onReject,
        onError,
        zkPassport,
      } = result;

      zkPassportRef.current = zkPassport;
      setVerificationUrl(url);

      onRequestReceived(() => {
        setRequestReceived(true);
        setStatus('request_received');
      });

      onGeneratingProof(() => {
        setGeneratingProof(true);
        setStatus('generating_proof');
      });

      // Capture the raw ProofResult — required for getSolidityVerifierParameters
      onProofGenerated((proof: any) => {
        proofRef.current = proof;
        setProofsGenerated((prev) => prev + 1);
      });

      onResult(async (resultData: any) => {
        const { verified, result: verificationResult } = resultData || {};

        if (!verified) {
          setStatus('failed');
          setErrorMessage('Verification failed. Please try again.');
          return;
        }

        // Build the solidity verifier params struct from the captured proof
        try {
          const devMode = process.env.NEXT_PUBLIC_ZK_DEV_MODE === 'true';
          verifierParamsRef.current = zkPassportRef.current?.getSolidityVerifierParameters({
            proof: proofRef.current,
            scope: 'ethcali-verification',
            devMode,
          });
        } catch (paramError: any) {
          setStatus('failed');
          setErrorMessage(`Failed to prepare proof for minting: ${paramError.message}`);
          return;
        }

        // Determine document type (passport vs national ID card)
        const docType = verificationResult?.document_type?.disclose?.result;
        isIDCardRef.current = docType !== 'passport';

        // Extract on-chain bytes32 scoped nullifier
        const uid = (verificationResult?.uniqueIdentifier || resultData?.uniqueIdentifier) as `0x${string}` | undefined;

        // Nationality (ISO alpha-3) and age from disclosed proof fields
        const nat: string | null = verificationResult?.nationality?.disclose?.result ?? null;
        const over18: boolean = verificationResult?.age?.gte?.result === true;

        setUniqueIdentifier(uid ?? null);
        setIsOver18(over18);
        setNationality(nat);

        if (uid) {
          try {
            const identifierHasNFT = await hasNFTByIdentifier(chainId, uid);
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
  }, [isClient, chainId, userWallet?.address]);

  const mintNFT = useCallback(async () => {
    if (!userWallet) {
      setErrorMessage('Wallet not connected. Please connect your wallet first.');
      return;
    }
    if (!verifierParamsRef.current) {
      setErrorMessage('Missing proof parameters. Please complete verification again.');
      return;
    }

    // Pre-flight duplicate checks
    if (uniqueIdentifier) {
      try {
        const identifierHasNFT = await hasNFTByIdentifier(chainId, uniqueIdentifier);
        if (identifierHasNFT) {
          setErrorMessage('This identity has already been used to mint an NFT.');
          setStatus('duplicate');
          return;
        }
      } catch {
        // Continue — contract enforces on-chain
      }
    }

    try {
      const addressHasNFT = await hasNFTByAddress(chainId, userWallet.address);
      if (addressHasNFT) {
        setErrorMessage('This address already has an NFT. Only one NFT per address is allowed.');
        setStatus('duplicate');
        return;
      }
    } catch {
      // Continue — contract enforces on-chain
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

      // New contract signature: mint(ProofVerificationParams params, bool isIDCard)
      const mintTxData = encodeFunctionData({
        abi: ZKPassportNFTABI,
        functionName: 'mint',
        args: [verifierParamsRef.current, isIDCardRef.current],
      });

      const result = await sendTransaction(
        {
          to: nftContractAddress as `0x${string}`,
          data: mintTxData,
          chainId,
        },
        { sponsor: true }
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
  }, [userWallet, uniqueIdentifier, chainId, sendTransaction, onMintSuccess]);

  return {
    status,
    verificationUrl,
    uniqueIdentifier,
    isOver18,
    nationality,
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
