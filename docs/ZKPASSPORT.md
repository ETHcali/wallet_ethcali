# ZKPassportNFT Complete Reference & Integration Guide

**Complete reference and integration guide** for the ZKPassportNFT soulbound ERC721 contract.

**Contract**: `contracts/ZKPassportNFT.sol`  
**Version**: 3.1 (Enhanced View Functions)  
**Last Updated**: January 2026

---

## Table of Contents

### Part I: Contract Reference
1. [Overview](#overview)
2. [Data Structures](#data-structures)
3. [State Variables](#state-variables)
4. [Admin Functions](#admin-functions)
5. [User Functions](#user-functions)
6. [View Functions](#view-functions)
7. [Events](#events)
8. [Error Messages](#error-messages)

### Part II: Frontend Integration
9. [Initial Setup](#initial-setup)
10. [Type Definitions](#type-definitions)
11. [Hooks & Components](#hooks--components)
12. [Mint Flow](#mint-flow)
13. [Display NFT Card](#display-nft-card)
14. [Admin Management](#admin-management)
15. [Integration with Other Contracts](#integration-with-other-contracts)
16. [Testing Checklist](#testing-checklist)

---

# Part I: Contract Reference

## Overview

ZKPassportNFT is a **soulbound** (non-transferable) ERC721 NFT that represents ZKPassport verification. It provides:

- **Anti-sybil protection** - One NFT per unique identity
- **Privacy-preserving** - Uses ZK proofs for verification
- **Customizable metadata** - IPFS image or on-chain SVG
- **Verification traits** - Face match, personhood status stored on-chain
- **Simplified minting** - Single mint function requiring ZKPassport verification results

### Key Features

| Feature | Description |
|---------|-------------|
| **Soulbound** | NFTs cannot be transferred after minting |
| **One per address** | Each wallet can only have one NFT |
| **One per identifier** | Each ZKPassport ID can only mint once |
| **Flexible image** | Admin can set IPFS image or use on-chain SVG |
| **On-chain traits** | Verification results stored as NFT attributes |
| **Complete view function** | `getNFTDataByOwner()` returns all NFT data in one call |

### Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   ZKPassport    │ ──▶ │  Backend/Proof   │ ──▶ │  ZKPassportNFT  │
│   (User App)    │     │   Verification   │     │   (Contract)    │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                                                         │
                                                         ▼
                                                 ┌───────────────┐
                                                 │ FaucetManager │
                                                 │ Swag1155      │
                                                 │ (Gated Access)│
                                                 └───────────────┘
```

---

## Data Structures

### TokenData

Stores minted NFT verification data.

```solidity
struct TokenData {
    string uniqueIdentifier;    // ZKPassport unique ID
    bool faceMatchPassed;       // Face match result
    bool personhoodVerified;    // Personhood result
}
```

---

## State Variables

### Public Variables

| Variable | Type | Description |
|----------|------|-------------|
| `nftImageURI` | `string` | IPFS URI for NFT image |
| `nftDescription` | `string` | Description for all NFTs |
| `nftExternalURL` | `string` | External website URL |
| `useIPFSImage` | `bool` | If true, use IPFS; if false, use SVG |

### Private Mappings

| Variable | Type | Description |
|----------|------|-------------|
| `usedIdentifiers` | `mapping(string => bool)` | Track used ZKPassport IDs |
| `ownerHasNFT` | `mapping(address => bool)` | Track addresses with NFT |
| `ownerToTokenId` | `mapping(address => uint256)` | Map address to token ID |
| `tokenData` | `mapping(uint256 => TokenData)` | Token verification data |
| `nextTokenId` | `uint256` | Next token ID to mint |

---

## Admin Functions

### setImageURI

Set the IPFS image URI for all NFTs.

```solidity
function setImageURI(string memory imageURI) external onlyOwner
```

### setDescription

Set the description for all NFTs.

```solidity
function setDescription(string memory description) external onlyOwner
```

**Requirements:**
- Description cannot be empty

### setExternalURL

Set the external URL displayed on marketplaces.

```solidity
function setExternalURL(string memory externalURL) external onlyOwner
```

### setUseIPFSImage

Toggle between IPFS image and on-chain SVG.

```solidity
function setUseIPFSImage(bool useIPFS) external onlyOwner
```

**Requirements:**
- If `useIPFS` is true, `nftImageURI` must be set first

### setMetadata

Set all metadata configuration at once.

```solidity
function setMetadata(
    string memory imageURI,
    string memory description,
    string memory externalURL,
    bool useIPFS
) external onlyOwner
```

---

## User Functions

### mint

Mint NFT with ZKPassport verification results. This is the **only** way to mint.

```solidity
function mint(
    string memory uniqueIdentifier,
    bool faceMatchPassed,
    bool personhoodVerified
) external
```

**Parameters:**
- `uniqueIdentifier` - ZKPassport unique ID
- `faceMatchPassed` - Face match result from proof
- `personhoodVerified` - Personhood result from proof

**Requirements:**
- Identifier not empty
- Identifier not already used
- Caller doesn't already have NFT

**Emits:** `NFTMinted(to, tokenId, uniqueIdentifier, faceMatchPassed, personhoodVerified)`

---

## View Functions

### hasNFT

Check if a ZKPassport identifier has been used.

```solidity
function hasNFT(string memory uniqueIdentifier) external view returns (bool)
```

### hasNFTByAddress

Check if an address owns an NFT.

```solidity
function hasNFTByAddress(address user) external view returns (bool)
```

### getTokenIdByOwner

Get the token ID owned by an address.

```solidity
function getTokenIdByOwner(address owner) external view returns (uint256)
```

**Requirements:**
- Address must have an NFT (reverts if not)

### getNFTDataByOwner

Get complete NFT data for an address (all info needed for frontend card display).

```solidity
function getNFTDataByOwner(address owner) external view returns (
    uint256 tokenId,
    TokenData memory tokenDataResult,
    string memory tokenURIResult
)
```

**Returns:**
- `tokenId` - The token ID
- `tokenDataResult` - The token data struct (uniqueIdentifier, faceMatchPassed, personhoodVerified)
- `tokenURIResult` - The token URI (metadata JSON)

**Requirements:**
- Address must have an NFT (reverts if not)

### getTokenData

Get verification data for a token.

```solidity
function getTokenData(uint256 tokenId) external view returns (TokenData memory)
```

### tokenURI

Get the full metadata URI for a token.

```solidity
function tokenURI(uint256 tokenId) public view returns (string memory)
```

**Returns:** Base64-encoded JSON metadata with:
- `name`: "ZKPassport Verification #X"
- `description`: Admin-set description
- `image`: IPFS URI or base64 SVG
- `external_url`: Admin-set URL (if set)
- `attributes`: Face Match, Personhood, Verification Status, Token ID

---

## Events

| Event | Parameters | When Emitted |
|-------|------------|--------------|
| `NFTMinted` | `to`, `tokenId`, `uniqueIdentifier`, `faceMatchPassed`, `personhoodVerified` | NFT minted |
| `MetadataUpdated` | `imageURI`, `description`, `externalURL`, `useIPFS` | Admin updates metadata |

---

## Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| `"ZKPassportNFT: empty identifier"` | Empty string passed | Provide valid identifier |
| `"ZKPassportNFT: identifier already used"` | ID already minted | Use different identifier |
| `"ZKPassportNFT: address already has NFT"` | Wallet has NFT | One per address |
| `"ZKPassportNFT: address does not have NFT"` | Address has no NFT | Mint first |
| `"ZKPassportNFT: soulbound token - transfers not allowed"` | Tried to transfer | NFTs are soulbound |
| `"ZKPassportNFT: empty description"` | Empty description | Provide description text |
| `"ZKPassportNFT: set image URI first"` | Enable IPFS without URI | Set image URI first |
| `"ZKPassportNFT: token does not exist"` | Invalid token ID | Use valid token ID |

---

# Part II: Frontend Integration

## Initial Setup

### 1. Install Dependencies

```bash
npm install wagmi viem @tanstack/react-query
```

### 2. Environment Configuration

Create `.env.local`:

```bash
VITE_ZKPASSPORT_NFT_ADDRESS_BASE=0x...
VITE_ZKPASSPORT_NFT_ADDRESS_ETHEREUM=0x...
VITE_ZKPASSPORT_NFT_ADDRESS_UNICHAIN=0x...
```

### 3. Get Contract ABI

```bash
npx hardhat run scripts/setup-frontend.ts
```

---

## Type Definitions

Create `src/types/zkpassport.ts`:

```typescript
export interface TokenData {
  uniqueIdentifier: string;
  faceMatchPassed: boolean;
  personhoodVerified: boolean;
}

export interface NFTData {
  tokenId: bigint;
  tokenData: TokenData;
  tokenURI: string;
}

export interface ZKPassportVerificationResult {
  uniqueIdentifier: string;
  faceMatchPassed: boolean;
  personhoodVerified: boolean;
}
```

---

## Hooks & Components

### ZKPassport NFT Hook

Create `src/hooks/useZKPassportNFT.ts`:

```typescript
import { useReadContract, useWriteContract, useAccount } from 'wagmi';
import ZKPassportNFTABI from '../abis/ZKPassportNFT.json';
import { NFTData, TokenData } from '../types/zkpassport';

const ZKPASSPORT_NFT_ADDRESS = import.meta.env.VITE_ZKPASSPORT_NFT_ADDRESS_BASE;

export function useZKPassportNFT() {
  const { address } = useAccount();

  // Check if user has NFT
  const { data: hasNFT, isLoading: isChecking } = useReadContract({
    address: ZKPASSPORT_NFT_ADDRESS as `0x${string}`,
    abi: ZKPassportNFTABI,
    functionName: 'hasNFTByAddress',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  // Get complete NFT data if user has one
  const { data: nftData, isLoading: isLoadingData, refetch } = useReadContract({
    address: ZKPASSPORT_NFT_ADDRESS as `0x${string}`,
    abi: ZKPassportNFTABI,
    functionName: 'getNFTDataByOwner',
    args: address ? [address] : undefined,
    query: { enabled: !!address && hasNFT === true },
  });

  const { writeContractAsync, isPending: isMinting } = useWriteContract();

  const mint = async (verificationResult: {
    uniqueIdentifier: string;
    faceMatchPassed: boolean;
    personhoodVerified: boolean;
  }) => {
    return writeContractAsync({
      address: ZKPASSPORT_NFT_ADDRESS as `0x${string}`,
      abi: ZKPassportNFTABI,
      functionName: 'mint',
      args: [
        verificationResult.uniqueIdentifier,
        verificationResult.faceMatchPassed,
        verificationResult.personhoodVerified,
      ],
    });
  };

  return {
    hasNFT: hasNFT || false,
    isChecking,
    nftData: nftData ? {
      tokenId: nftData[0] as bigint,
      tokenData: nftData[1] as TokenData,
      tokenURI: nftData[2] as string,
    } : null,
    isLoadingData,
    mint,
    isMinting,
    refetch,
  };
}
```

### ZKPassport Verification Hook

Create `src/hooks/useZKPassportVerification.ts`:

```typescript
import { useState } from 'react';
import { ZKPassportVerificationResult } from '../types/zkpassport';

export function useZKPassportVerification() {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<ZKPassportVerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const verifyAndMint = async () => {
    setIsVerifying(true);
    setError(null);

    try {
      // 1. Initiate ZKPassport verification (via widget or SDK)
      const zkPassportResult = await window.zkPassport?.verify();

      if (!zkPassportResult) {
        throw new Error('ZKPassport verification failed');
      }

      // 2. Optionally verify on backend
      const backendVerify = await fetch('/api/verify-zkpassport', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(zkPassportResult),
      });

      if (!backendVerify.ok) {
        throw new Error('Backend verification failed');
      }

      const verified = await backendVerify.json();

      setVerificationResult({
        uniqueIdentifier: verified.uniqueIdentifier,
        faceMatchPassed: verified.faceMatchPassed,
        personhoodVerified: verified.personhoodVerified,
      });

      return verified;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Verification failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsVerifying(false);
    }
  };

  return {
    verifyAndMint,
    isVerifying,
    verificationResult,
    error,
  };
}
```

---

## Mint Flow

### Mint Component

Create `src/components/zkpassport/MintZKPassportNFT.tsx`:

```typescript
import React from 'react';
import { useAccount } from 'wagmi';
import { useZKPassportNFT } from '../../hooks/useZKPassportNFT';
import { useZKPassportVerification } from '../../hooks/useZKPassportVerification';

export function MintZKPassportNFT() {
  const { address, isConnected } = useAccount();
  const { hasNFT, isChecking, mint, isMinting, refetch } = useZKPassportNFT();
  const { verifyAndMint, isVerifying, error } = useZKPassportVerification();

  const handleMint = async () => {
    if (!isConnected) {
      alert('Connect wallet to mint');
      return;
    }

    if (hasNFT) {
      alert('You already have a ZKPassport NFT');
      return;
    }

    try {
      // Step 1: Verify with ZKPassport
      const verificationResult = await verifyAndMint();

      // Step 2: Mint NFT with verification results
      await mint(verificationResult);

      // Step 3: Refresh NFT data
      await refetch();

      alert('✅ ZKPassport NFT minted successfully!');
    } catch (err) {
      console.error('Mint failed:', err);
      alert('Mint failed: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  if (!isConnected) {
    return <div>Connect your wallet to mint a ZKPassport NFT</div>;
  }

  if (isChecking) {
    return <div>Checking NFT status...</div>;
  }

  if (hasNFT) {
    return <div>✅ You already have a ZKPassport NFT</div>;
  }

  return (
    <div>
      <h2>Get Your ZKPassport NFT</h2>
      <p>Verify your identity to receive a soulbound NFT that grants access to ETHcali services.</p>

      {error && <div className="error">{error}</div>}

      <button
        onClick={handleMint}
        disabled={isVerifying || isMinting}
      >
        {isVerifying && 'Verifying with ZKPassport...'}
        {isMinting && 'Minting NFT...'}
        {!isVerifying && !isMinting && 'Mint ZKPassport NFT'}
      </button>
    </div>
  );
}
```

---

## Display NFT Card

### NFT Card Component

Create `src/components/zkpassport/ZKPassportNFTCard.tsx`:

```typescript
import React from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { useZKPassportNFT } from '../../hooks/useZKPassportNFT';
import ZKPassportNFTABI from '../../abis/ZKPassportNFT.json';
import { TokenData } from '../../types/zkpassport';

const ZKPASSPORT_NFT_ADDRESS = import.meta.env.VITE_ZKPASSPORT_NFT_ADDRESS_BASE;

export function ZKPassportNFTCard({ userAddress }: { userAddress?: string }) {
  const { address: currentUser } = useAccount();
  const address = userAddress || currentUser;
  
  const { nftData, isLoading, hasNFT } = useZKPassportNFT();

  // For viewing other users' NFTs
  const { data: otherUserNFT } = useReadContract({
    address: ZKPASSPORT_NFT_ADDRESS as `0x${string}`,
    abi: ZKPassportNFTABI,
    functionName: 'getNFTDataByOwner',
    args: userAddress ? [userAddress] : undefined,
    query: { enabled: !!userAddress && userAddress !== currentUser },
  });

  const displayData = userAddress && userAddress !== currentUser 
    ? (otherUserNFT ? {
        tokenId: otherUserNFT[0] as bigint,
        tokenData: otherUserNFT[1] as TokenData,
        tokenURI: otherUserNFT[2] as string,
      } : null)
    : nftData;

  if (isLoading) {
    return <div>Loading NFT...</div>;
  }

  if (!displayData || !hasNFT) {
    return <div>No ZKPassport NFT found</div>;
  }

  const { tokenId, tokenData, tokenURI } = displayData;
  const isFullyVerified = tokenData.faceMatchPassed && tokenData.personhoodVerified;

  // Parse token URI to get image
  const metadata = parseTokenURI(tokenURI);
  const imageUrl = metadata.image?.startsWith('ipfs://')
    ? metadata.image.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/')
    : metadata.image;

  return (
    <div className="zkpassport-card">
      <div className="card-header">
        <h3>ZKPassport Verification #{tokenId.toString()}</h3>
        {isFullyVerified && <span className="verified-badge">✓ Fully Verified</span>}
      </div>

      <div className="card-image">
        <img src={imageUrl} alt="ZKPassport NFT" />
      </div>

      <div className="card-body">
        <p className="description">{metadata.description}</p>

        <div className="verification-traits">
          <div className="trait">
            <span className="trait-label">Face Match:</span>
            <span className={`trait-value ${tokenData.faceMatchPassed ? 'passed' : 'failed'}`}>
              {tokenData.faceMatchPassed ? '✓ Passed' : '✗ Failed'}
            </span>
          </div>

          <div className="trait">
            <span className="trait-label">Personhood:</span>
            <span className={`trait-value ${tokenData.personhoodVerified ? 'verified' : 'not-verified'}`}>
              {tokenData.personhoodVerified ? '✓ Verified' : '✗ Not Verified'}
            </span>
          </div>

          <div className="trait">
            <span className="trait-label">Status:</span>
            <span className={`trait-value ${isFullyVerified ? 'fully-verified' : 'partial'}`}>
              {isFullyVerified ? 'Fully Verified' : 'Partial Verification'}
            </span>
          </div>
        </div>

        <div className="card-footer">
          <p className="identifier">ID: {tokenData.uniqueIdentifier.slice(0, 8)}...</p>
          <p className="note">This is a soulbound NFT and cannot be transferred.</p>
        </div>
      </div>
    </div>
  );
}

// Helper to parse token URI
function parseTokenURI(tokenURI: string) {
  try {
    if (tokenURI.startsWith('data:application/json;base64,')) {
      const base64 = tokenURI.split(',')[1];
      const json = JSON.parse(atob(base64));
      return json;
    }
    return JSON.parse(tokenURI);
  } catch {
    return { image: '', description: '', attributes: [] };
  }
}
```

---

## Admin Management

### Admin Hook

Create `src/hooks/useZKPassportAdmin.ts`:

```typescript
import { useWriteContract, useReadContract } from 'wagmi';
import ZKPassportNFTABI from '../abis/ZKPassportNFT.json';

const ZKPASSPORT_NFT_ADDRESS = import.meta.env.VITE_ZKPASSPORT_NFT_ADDRESS_BASE;

export function useZKPassportAdmin() {
  const { writeContractAsync } = useWriteContract();

  // Get current metadata
  const { data: imageURI } = useReadContract({
    address: ZKPASSPORT_NFT_ADDRESS as `0x${string}`,
    abi: ZKPassportNFTABI,
    functionName: 'nftImageURI',
  });

  const { data: description } = useReadContract({
    address: ZKPASSPORT_NFT_ADDRESS as `0x${string}`,
    abi: ZKPassportNFTABI,
    functionName: 'nftDescription',
  });

  const { data: externalURL } = useReadContract({
    address: ZKPASSPORT_NFT_ADDRESS as `0x${string}`,
    abi: ZKPassportNFTABI,
    functionName: 'nftExternalURL',
  });

  const { data: useIPFSImage } = useReadContract({
    address: ZKPASSPORT_NFT_ADDRESS as `0x${string}`,
    abi: ZKPassportNFTABI,
    functionName: 'useIPFSImage',
  });

  const setMetadata = async (
    imageURI: string,
    description: string,
    externalURL: string,
    useIPFS: boolean
  ) => {
    return writeContractAsync({
      address: ZKPASSPORT_NFT_ADDRESS as `0x${string}`,
      abi: ZKPassportNFTABI,
      functionName: 'setMetadata',
      args: [imageURI, description, externalURL, useIPFS],
    });
  };

  return {
    currentMetadata: {
      imageURI: imageURI as string,
      description: description as string,
      externalURL: externalURL as string,
      useIPFSImage: useIPFSImage as boolean,
    },
    setMetadata,
  };
}
```

---

## Integration with Other Contracts

### Eligibility Hook

Create `src/hooks/useZKPassportEligibility.ts`:

```typescript
import { useReadContract, useAccount } from 'wagmi';
import ZKPassportNFTABI from '../abis/ZKPassportNFT.json';

const ZKPASSPORT_NFT_ADDRESS = import.meta.env.VITE_ZKPASSPORT_NFT_ADDRESS_BASE;

export function useZKPassportEligibility(userAddress?: string) {
  const { address: currentUser } = useAccount();
  const address = userAddress || currentUser;

  const { data: hasNFT, isLoading } = useReadContract({
    address: ZKPASSPORT_NFT_ADDRESS as `0x${string}`,
    abi: ZKPassportNFTABI,
    functionName: 'hasNFTByAddress',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  return {
    isEligible: hasNFT || false,
    isLoading,
  };
}
```

### Usage Example

```typescript
import { useZKPassportEligibility } from '../hooks/useZKPassportEligibility';

function FaucetAccessButton() {
  const { isEligible, isLoading } = useZKPassportEligibility();

  if (isLoading) return <button disabled>Checking eligibility...</button>;
  
  if (!isEligible) {
    return (
      <div>
        <p>You need a ZKPassport NFT to access the faucet.</p>
        <Link to="/zkpassport">Get ZKPassport NFT</Link>
      </div>
    );
  }

  return <button>Claim from Faucet</button>;
}
```

---

## Testing Checklist

- [ ] User can verify with ZKPassport
- [ ] User can mint NFT after verification
- [ ] User cannot mint twice with same address
- [ ] User cannot mint twice with same identifier
- [ ] NFT card displays correctly with all data
- [ ] Admin can update metadata (image, description, URL)
- [ ] Admin can toggle IPFS vs SVG image
- [ ] Eligibility check works for gated contracts
- [ ] Error messages display correctly
- [ ] Soulbound behavior prevents transfers

---

## Support & Questions

- **Contract Source**: `contracts/ZKPassportNFT.sol`
- **Tests**: `test/ZKPassportNFT.test.ts`