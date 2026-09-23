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
      uniqueIdentifier?: `0x${string}` | null;
      isOver18?: boolean;
      nationality?: string | null;
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
    chain,
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
          isOver18,
          nationality,
        }
      );
    }
  }, [status, uniqueIdentifier, isOver18, nationality, onVerificationStatusChange]);

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
              isOver18={isOver18}
              nationality={nationality}
              chain={chain}
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
    <section className="rounded-card border border-line-hairline bg-surface-slab p-5" aria-labelledby="verify-title">
      <h2 id="verify-title" className="text-lg font-bold text-content-primary">Verify with your passport</h2>
      <p className="mb-4 mt-1 text-sm text-content-muted">
        Prove you are a unique person without sharing who you are. No KYC, nothing leaves your phone.
      </p>
      {renderStep()}
    </section>
  );
};

export default SybilVerification;
