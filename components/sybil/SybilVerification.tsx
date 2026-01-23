/**
 * SybilVerification - Main verification component using step components
 */
import React, { useEffect } from 'react';
import { useZKPassportVerification, VerificationStatus } from '../../hooks/useZKPassportVerification';
import {
  IdleStep,
  QRScanStep,
  ProcessingStep,
  VerifiedStep,
  MintingStep,
  MintedStep,
  ErrorStep,
} from './steps';

interface SybilVerificationProps {
  chainId: number;
  onMintSuccess?: () => void;
  onVerificationStatusChange?: (
    status: 'idle' | 'verified' | 'minting' | 'minted' | 'failed' | 'rejected' | 'duplicate',
    data?: {
      uniqueIdentifier?: string | null;
      faceMatchPassed?: boolean;
      personhoodVerified?: boolean;
    }
  ) => void;
}

const SybilVerification: React.FC<SybilVerificationProps> = ({
  chainId,
  onMintSuccess,
  onVerificationStatusChange,
}) => {
  const {
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
  } = useZKPassportVerification(chainId, onMintSuccess);

  // Notify parent of status changes
  useEffect(() => {
    const notifiableStatuses: VerificationStatus[] = [
      'idle',
      'verified',
      'minting',
      'minted',
      'failed',
      'rejected',
      'duplicate',
    ];

    if (onVerificationStatusChange && notifiableStatuses.includes(status)) {
      onVerificationStatusChange(
        status as 'idle' | 'verified' | 'minting' | 'minted' | 'failed' | 'rejected' | 'duplicate',
        {
          uniqueIdentifier,
          faceMatchPassed,
          personhoodVerified,
        }
      );
    }
  }, [status, uniqueIdentifier, faceMatchPassed, personhoodVerified, onVerificationStatusChange]);

  const renderStep = () => {
    switch (status) {
      case 'idle':
        return <IdleStep isClient={isClient} onStart={startVerification} />;

      case 'awaiting_scan':
        if (verificationUrl) {
          return <QRScanStep verificationUrl={verificationUrl} onCancel={resetVerification} />;
        }
        return null;

      case 'request_received':
      case 'generating_proof':
        return (
          <ProcessingStep
            requestReceived={requestReceived}
            generatingProof={generatingProof}
            proofsGenerated={proofsGenerated}
          />
        );

      case 'verified':
        if (uniqueIdentifier) {
          return (
            <VerifiedStep
              uniqueIdentifier={uniqueIdentifier}
              faceMatchPassed={faceMatchPassed}
              personhoodVerified={personhoodVerified}
              chainId={chainId}
              isMinting={isMinting}
              errorMessage={errorMessage}
              onMint={mintNFT}
              onReset={resetVerification}
            />
          );
        }
        return null;

      case 'minting':
        return <MintingStep />;

      case 'minted':
        if (mintTxHash) {
          return <MintedStep mintTxHash={mintTxHash} chainId={chainId} />;
        }
        return null;

      case 'duplicate':
      case 'failed':
      case 'rejected':
        return (
          <ErrorStep
            status={status}
            errorMessage={errorMessage}
            uniqueIdentifier={uniqueIdentifier}
            onReset={resetVerification}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-black/60 border border-cyan-500/30 rounded-lg p-4 space-y-4">
        {/* Minimal Header */}
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
          <h2 className="text-xs font-bold text-cyan-400 font-mono tracking-wider">VERIFY_IDENTITY</h2>
        </div>

        {renderStep()}
      </div>
    </div>
  );
};

export default SybilVerification;
