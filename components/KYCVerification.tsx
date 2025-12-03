import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import Button from './shared/Button';

// Dynamic imports for client-side only
let requestPersonhoodVerification: any;
let checkUniqueIdentifier: any;
let registerUniqueIdentifier: any;

interface KYCVerificationProps {
  onVerificationComplete?: (verified: boolean, data?: any) => void;
  userEmail?: string;
}

export default function KYCVerification({ 
  onVerificationComplete,
  userEmail
}: KYCVerificationProps) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationUrl, setVerificationUrl] = useState<string | null>(null);
  
  // Progress states
  const [requestReceived, setRequestReceived] = useState(false);
  const [generatingProof, setGeneratingProof] = useState(false);
  const [proofsGenerated, setProofsGenerated] = useState<number>(0);
  
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'awaiting_scan' | 'request_received' | 'generating_proof' | 'success' | 'failed' | 'duplicate' | 'rejected'>('idle');
  const [uniqueIdentifier, setUniqueIdentifier] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Load ZKPassport functions only on client-side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsClient(true);
      import('../utils/zkpassport').then((module) => {
        requestPersonhoodVerification = module.requestPersonhoodVerification;
        checkUniqueIdentifier = module.checkUniqueIdentifier;
        registerUniqueIdentifier = module.registerUniqueIdentifier;
      });
    }
  }, []);

  const startVerification = async () => {
    if (!isClient) {
      setErrorMessage('Please wait for the page to load completely.');
      return;
    }
    
    setIsVerifying(true);
    setVerificationStatus('awaiting_scan');
    setErrorMessage(null);
    setRequestReceived(false);
    setGeneratingProof(false);
    setProofsGenerated(0);
    
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
      
      // Event: User scanned QR code
      onRequestReceived(() => {
        setRequestReceived(true);
        setVerificationStatus('request_received');
      });
      
      // Event: Proof generation started
      onGeneratingProof(() => {
        setGeneratingProof(true);
        setVerificationStatus('generating_proof');
      });
      
      // Event: Individual proof generated
      onProofGenerated(() => {
        setProofsGenerated(prev => prev + 1);
      });
      
      // Event: Verification complete
      onResult(async ({ verified, uniqueIdentifier: uid }) => {
        setIsVerifying(false);
        
        if (!verified) {
          setVerificationStatus('failed');
          setErrorMessage('Verification failed. Please try again.');
          if (onVerificationComplete) onVerificationComplete(false);
          return;
        }
        
        setUniqueIdentifier(uid || null);
        
        if (uid) {
          const isRegistered = await checkUniqueIdentifier(uid);
          
          if (isRegistered) {
            setVerificationStatus('duplicate');
            setErrorMessage('This identity is already registered.');
            if (onVerificationComplete) {
              onVerificationComplete(false, { duplicate: true, uniqueIdentifier: uid });
            }
          } else {
            const registered = await registerUniqueIdentifier(uid, userEmail);
            
            if (registered) {
              setVerificationStatus('success');
              if (onVerificationComplete) {
                onVerificationComplete(true, { uniqueIdentifier: uid });
              }
            } else {
              setVerificationStatus('failed');
              setErrorMessage('Failed to register. Please try again.');
              if (onVerificationComplete) onVerificationComplete(false);
            }
          }
        }
      });
      
      // Event: User rejected
      onReject(() => {
        setIsVerifying(false);
        setVerificationStatus('rejected');
        setErrorMessage('Verification was rejected.');
        if (onVerificationComplete) onVerificationComplete(false);
      });
      
      // Event: Error
      onError((error: any) => {
        setIsVerifying(false);
        setVerificationStatus('failed');
        setErrorMessage(`Error: ${error.message || error}`);
        if (onVerificationComplete) onVerificationComplete(false);
      });
      
    } catch (error) {
      setIsVerifying(false);
      setVerificationStatus('failed');
      setErrorMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      if (onVerificationComplete) onVerificationComplete(false);
    }
  };

  const resetVerification = () => {
    setVerificationStatus('idle');
    setVerificationUrl(null);
    setUniqueIdentifier(null);
    setErrorMessage(null);
    setRequestReceived(false);
    setGeneratingProof(false);
    setProofsGenerated(0);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <div className="flex items-center mb-4">
        <span className="text-2xl mr-3">🛡️</span>
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
          Personhood Verification
        </h3>
      </div>
      
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        Verify you're a unique person using your passport. One account per person, complete privacy.
      </p>

      {verificationStatus === 'idle' && (
        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="text-sm text-blue-800 dark:text-blue-300">
              <p className="font-medium mb-2">Quick steps:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Click "Start Verification"</li>
                <li>Scan QR code with ZKPassport app</li>
                <li>Scan passport and complete face match</li>
                <li>Done! (~10 seconds)</li>
              </ol>
            </div>
          </div>
          
          <Button 
            onClick={startVerification}
            variant="primary"
            size="large"
            disabled={!isClient}
          >
            {!isClient ? 'Loading...' : 'Start Verification'}
          </Button>
        </div>
      )}

      {(['awaiting_scan', 'request_received', 'generating_proof'].includes(verificationStatus)) && (
        <div className="space-y-4">
          {/* QR Code */}
          {verificationUrl && verificationStatus === 'awaiting_scan' && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border-2 border-blue-500 text-center">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
                Scan with ZKPassport App
              </h3>
              
              <div className="bg-white p-4 rounded-lg inline-block mb-4">
                <QRCodeSVG 
                  value={verificationUrl} 
                  size={256}
                  level="H"
                  includeMargin={true}
                />
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Scan with ZKPassport app on your phone
              </p>
              
              <a 
                href={verificationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:underline"
              >
                Don't have the app? Click here
              </a>
            </div>
          )}
          
          {/* Progress */}
          {(requestReceived || generatingProof) && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className={requestReceived ? 'text-green-600' : 'text-gray-400'}>
                    {requestReceived ? '✓' : '○'}
                  </span>
                  <span className={requestReceived ? 'text-green-600' : 'text-gray-600'}>
                    Request received
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className={generatingProof ? 'text-green-600' : 'text-gray-400'}>
                    {generatingProof ? '✓' : '○'}
                  </span>
                  <span className={generatingProof ? 'text-green-600' : 'text-gray-600'}>
                    Generating proofs {proofsGenerated > 0 && `(${proofsGenerated}/4)`}
                  </span>
                </div>
              </div>
              
              {generatingProof && (
                <div className="flex items-center justify-center mt-4 text-gray-600 dark:text-gray-400">
                  <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-3"></div>
                  <span className="text-sm">Verifying... (~10 seconds)</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {verificationStatus === 'success' && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-center mb-3">
            <span className="text-2xl mr-2">✅</span>
            <h4 className="text-green-800 dark:text-green-300 font-semibold">
              Verified!
            </h4>
          </div>
          <p className="text-green-700 dark:text-green-400">
            Your personhood has been verified. You're registered as a unique person.
          </p>
        </div>
      )}

      {verificationStatus === 'duplicate' && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-center mb-3">
            <span className="text-2xl mr-2">⚠️</span>
            <h4 className="text-yellow-800 dark:text-yellow-300 font-semibold">
              Already Registered
            </h4>
          </div>
          <p className="text-yellow-700 dark:text-yellow-400">
            This passport is already registered. Each person can only register once.
          </p>
        </div>
      )}

      {verificationStatus === 'rejected' && (
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
          <div className="flex items-center mb-3">
            <span className="text-2xl mr-2">🚫</span>
            <h4 className="text-orange-800 dark:text-orange-300 font-semibold">
              Rejected
            </h4>
          </div>
          <p className="text-orange-700 dark:text-orange-400 mb-4">
            You rejected the verification request.
          </p>
          <Button onClick={resetVerification} variant="primary" size="medium">
            Try Again
          </Button>
        </div>
      )}

      {verificationStatus === 'failed' && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center mb-3">
            <span className="text-2xl mr-2">❌</span>
            <h4 className="text-red-800 dark:text-red-300 font-semibold">
              Failed
            </h4>
          </div>
          <p className="text-red-700 dark:text-red-400 mb-4">
            {errorMessage || 'Verification failed. Please try again.'}
          </p>
          <Button onClick={resetVerification} variant="primary" size="medium">
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
}

