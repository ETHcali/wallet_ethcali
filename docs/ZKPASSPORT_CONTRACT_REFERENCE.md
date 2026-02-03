# ZKPassportNFT Contract Reference

**Complete API reference** for the ZKPassportNFT soulbound ERC721 contract.

**Contract**: `contracts/ZKPassportNFT.sol`
**Version**: 2.0 (with IPFS Image Support)
**Last Updated**: January 2026

---

## Table of Contents

1. [Overview](#overview)
2. [Data Structures](#data-structures)
3. [State Variables](#state-variables)
4. [Admin Functions](#admin-functions)
5. [User Functions](#user-functions)
6. [View Functions](#view-functions)
7. [Events](#events)
8. [Error Messages](#error-messages)
9. [Frontend Integration](#frontend-integration)

---

## Overview

ZKPassportNFT is a **soulbound** (non-transferable) ERC721 NFT that represents ZKPassport verification. It provides:

- **Anti-sybil protection** - One NFT per unique identity
- **Privacy-preserving** - Uses ZK proofs for verification
- **Customizable metadata** - IPFS image or on-chain SVG
- **Verification traits** - Face match, personhood status stored on-chain

### Key Features

| Feature | Description |
|---------|-------------|
| **Soulbound** | NFTs cannot be transferred after minting |
| **One per address** | Each wallet can only have one NFT |
| **One per identifier** | Each ZKPassport ID can only mint once |
| **Flexible image** | Admin can set IPFS image or use on-chain SVG |
| **On-chain traits** | Verification results stored as NFT attributes |

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

### VerificationData

Stores pending verification approvals from backend.

```solidity
struct VerificationData {
    address userAddress;        // Wallet that completed verification
    bool faceMatchPassed;       // Face matching result
    bool personhoodVerified;    // Personhood verification result
    bool isApproved;            // Whether approval is active
}
```

### TokenData

Stores minted NFT verification data.

```solidity
struct TokenData {
    string uniqueIdentifier;    // ZKPassport unique ID (hashed)
    bool faceMatchPassed;       // Face match result
    bool personhoodVerified;    // Personhood result
}
```

**Frontend usage:**
```typescript
interface TokenData {
  uniqueIdentifier: string;
  faceMatchPassed: boolean;
  personhoodVerified: boolean;
}

// Check if fully verified
const isFullyVerified = data.faceMatchPassed && data.personhoodVerified;
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
| `approvedVerifications` | `mapping(string => VerificationData)` | Pending verifications |

### Private Mappings

| Variable | Type | Description |
|----------|------|-------------|
| `_usedIdentifiers` | `mapping(string => bool)` | Track used ZKPassport IDs |
| `_hasNFT` | `mapping(address => bool)` | Track addresses with NFT |
| `_tokenData` | `mapping(uint256 => TokenData)` | Token verification data |
| `_tokenIdCounter` | `uint256` | Next token ID |

---

## Admin Functions

### setImageURI

Set the IPFS image URI for all NFTs.

```solidity
function setImageURI(string memory imageURI) external onlyOwner
```

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `imageURI` | `string` | IPFS URI for image | `ipfs://QmXyz...` |

**Frontend:**
```typescript
await writeContract({
  address: zkPassportNFT,
  abi: ZKPassportNFTABI,
  functionName: 'setImageURI',
  args: ['ipfs://QmYourImageHash...'],
});
```

---

### setDescription

Set the description for all NFTs.

```solidity
function setDescription(string memory description) external onlyOwner
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `description` | `string` | NFT description text |

**Requirements:**
- Description cannot be empty

---

### setExternalURL

Set the external URL displayed on marketplaces.

```solidity
function setExternalURL(string memory externalURL) external onlyOwner
```

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `externalURL` | `string` | Website URL | `https://ethcali.com` |

---

### setUseIPFSImage

Toggle between IPFS image and on-chain SVG.

```solidity
function setUseIPFSImage(bool useIPFS) external onlyOwner
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `useIPFS` | `bool` | `true` = IPFS, `false` = on-chain SVG |

**Requirements:**
- If `useIPFS` is true, `nftImageURI` must be set first

---

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

| Parameter | Type | Description |
|-----------|------|-------------|
| `imageURI` | `string` | IPFS image URI |
| `description` | `string` | NFT description |
| `externalURL` | `string` | External website URL |
| `useIPFS` | `bool` | Whether to use IPFS image |

**Frontend:**
```typescript
await writeContract({
  address: zkPassportNFT,
  abi: ZKPassportNFTABI,
  functionName: 'setMetadata',
  args: [
    'ipfs://QmImageHash...',
    'ZKPassport Verification - Proof of unique personhood for ETHCALI ecosystem.',
    'https://ethcali.com',
    true, // Use IPFS image
  ],
});
```

---

### approveVerification

Backend approves a verification for minting (legacy flow).

```solidity
function approveVerification(
    string memory uniqueIdentifier,
    address userAddress,
    bool faceMatchPassed,
    bool personhoodVerified
) external onlyOwner
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `uniqueIdentifier` | `string` | ZKPassport unique ID |
| `userAddress` | `address` | Wallet that verified |
| `faceMatchPassed` | `bool` | Face match result |
| `personhoodVerified` | `bool` | Personhood result |

**Requirements:**
- Identifier not already used
- Address doesn't already have NFT
- Not already approved

**Emits:** `VerificationApproved(uniqueIdentifier, userAddress, faceMatchPassed, personhoodVerified)`

---

## User Functions

### mintWithVerification

Self-mint NFT with ZKPassport verification data (recommended).

```solidity
function mintWithVerification(
    string memory uniqueIdentifier,
    bool faceMatchPassed,
    bool personhoodVerified
) external
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `uniqueIdentifier` | `string` | ZKPassport unique ID |
| `faceMatchPassed` | `bool` | Face match result from proof |
| `personhoodVerified` | `bool` | Personhood result from proof |

**Requirements:**
- Identifier not empty
- Identifier not already used
- Caller doesn't already have NFT

**Emits:** `NFTMinted(to, tokenId, uniqueIdentifier, faceMatchPassed, personhoodVerified)`

**Frontend:**
```typescript
await writeContract({
  address: zkPassportNFT,
  abi: ZKPassportNFTABI,
  functionName: 'mintWithVerification',
  args: [
    'zkp_unique_id_hash_123',
    true,  // faceMatchPassed
    true,  // personhoodVerified
  ],
});
```

---

### mint

Legacy mint using pre-approved verification.

```solidity
function mint(string memory uniqueIdentifier) external
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `uniqueIdentifier` | `string` | Pre-approved ZKPassport ID |

**Requirements:**
- Must be pre-approved via `approveVerification()`
- Caller must match approved address

---

## View Functions

### hasNFT

Check if a ZKPassport identifier has been used.

```solidity
function hasNFT(string memory uniqueIdentifier) external view returns (bool)
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `uniqueIdentifier` | `string` | ZKPassport ID to check |

**Returns:** `bool` - true if identifier already used

---

### hasNFTByAddress

Check if an address owns an NFT.

```solidity
function hasNFTByAddress(address user) external view returns (bool)
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `user` | `address` | Address to check |

**Returns:** `bool` - true if address has NFT

**Frontend:**
```typescript
const { data: hasNFT } = useReadContract({
  address: zkPassportNFT,
  abi: ZKPassportNFTABI,
  functionName: 'hasNFTByAddress',
  args: [userAddress],
});

if (!hasNFT) {
  // Show mint button
}
```

---

### getTokenData

Get verification data for a token.

```solidity
function getTokenData(uint256 tokenId) external view returns (TokenData memory)
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `tokenId` | `uint256` | Token ID |

**Returns:** `TokenData` struct

**Frontend:**
```typescript
const { data: tokenData } = useReadContract({
  address: zkPassportNFT,
  abi: ZKPassportNFTABI,
  functionName: 'getTokenData',
  args: [tokenId],
});

// tokenData = { uniqueIdentifier, faceMatchPassed, personhoodVerified }
```

---

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

### balanceOf (inherited)

Check NFT balance for an address.

```solidity
function balanceOf(address owner) public view returns (uint256)
```

**Note:** Will always return 0 or 1 (one NFT per address max)

---

### ownerOf (inherited)

Get owner of a token.

```solidity
function ownerOf(uint256 tokenId) public view returns (address)
```

---

## Events

| Event | Parameters | When Emitted |
|-------|------------|--------------|
| `NFTMinted` | `to`, `tokenId`, `uniqueIdentifier`, `faceMatchPassed`, `personhoodVerified` | NFT minted |
| `VerificationApproved` | `uniqueIdentifier`, `userAddress`, `faceMatchPassed`, `personhoodVerified` | Backend approves |
| `MetadataUpdated` | `imageURI`, `description`, `externalURL`, `useIPFS` | Admin updates metadata |

**Event Listening:**
```typescript
useWatchContractEvent({
  address: zkPassportNFT,
  abi: ZKPassportNFTABI,
  eventName: 'NFTMinted',
  onLogs(logs) {
    logs.forEach((log) => {
      const { to, tokenId, faceMatchPassed, personhoodVerified } = log.args;
      console.log(`NFT #${tokenId} minted to ${to}`);
    });
  },
});
```

---

## Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| `"ZKPassportNFT: empty identifier"` | Empty string passed | Provide valid identifier |
| `"ZKPassportNFT: invalid address"` | Zero address | Provide valid address |
| `"ZKPassportNFT: identifier already used"` | ID already minted | Use different identifier |
| `"ZKPassportNFT: address already has NFT"` | Wallet has NFT | One per address |
| `"ZKPassportNFT: already approved"` | Double approval | Already pending |
| `"ZKPassportNFT: verification not approved"` | No pre-approval | Use `mintWithVerification` instead |
| `"ZKPassportNFT: not authorized for this verification"` | Wrong wallet | Must match approved address |
| `"ZKPassportNFT: soulbound token - transfers not allowed"` | Tried to transfer | NFTs are soulbound |
| `"ZKPassportNFT: empty description"` | Empty description | Provide description text |
| `"ZKPassportNFT: set image URI first"` | Enable IPFS without URI | Set image URI first |

---

## Frontend Integration

### Complete Mint Flow

```typescript
import { useWriteContract, useReadContract, useAccount } from 'wagmi';

function MintZKPassportNFT() {
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();

  // Check if user already has NFT
  const { data: hasNFT } = useReadContract({
    address: ZKPASSPORT_ADDRESS,
    abi: ZKPassportNFTABI,
    functionName: 'hasNFTByAddress',
    args: [address],
  });

  const handleMint = async (verificationData: {
    uniqueIdentifier: string;
    faceMatchPassed: boolean;
    personhoodVerified: boolean;
  }) => {
    if (hasNFT) {
      alert('You already have a ZKPassport NFT');
      return;
    }

    await writeContractAsync({
      address: ZKPASSPORT_ADDRESS,
      abi: ZKPassportNFTABI,
      functionName: 'mintWithVerification',
      args: [
        verificationData.uniqueIdentifier,
        verificationData.faceMatchPassed,
        verificationData.personhoodVerified,
      ],
    });

    alert('NFT minted successfully!');
  };

  if (hasNFT) {
    return <p>You have a ZKPassport NFT</p>;
  }

  return (
    <button onClick={() => handleMint(zkPassportResult)}>
      Mint ZKPassport NFT
    </button>
  );
}
```

### Admin Setup Metadata

```typescript
async function setupNFTMetadata() {
  // Upload image to IPFS first (via Pinata, etc.)
  const imageURI = 'ipfs://QmYourImageHash...';

  await writeContractAsync({
    address: ZKPASSPORT_ADDRESS,
    abi: ZKPassportNFTABI,
    functionName: 'setMetadata',
    args: [
      imageURI,
      'ZKPassport Verification NFT - Your proof of unique personhood in the ETHCALI ecosystem. This soulbound token grants access to faucets, swag purchases, and community benefits.',
      'https://ethcali.com',
      true, // Use IPFS image
    ],
  });
}
```

### Check Eligibility for Other Contracts

```typescript
// Used by FaucetManager, Swag1155, etc.
async function checkZKPassportEligibility(userAddress: string): Promise<boolean> {
  const hasNFT = await readContract({
    address: ZKPASSPORT_ADDRESS,
    abi: ZKPassportNFTABI,
    functionName: 'hasNFTByAddress',
    args: [userAddress],
  });

  return hasNFT;
}
```

---

## NFT Metadata Example

When `useIPFSImage = true`:

```json
{
  "name": "ZKPassport Verification #42",
  "description": "ZKPassport Verification NFT - Your proof of unique personhood...",
  "image": "ipfs://QmYourImageHash...",
  "external_url": "https://ethcali.com",
  "attributes": [
    { "trait_type": "Face Match", "value": "Passed" },
    { "trait_type": "Personhood", "value": "Verified" },
    { "trait_type": "Verification Status", "value": "Fully Verified" },
    { "trait_type": "Token ID", "value": "42" }
  ]
}
```

When `useIPFSImage = false` (on-chain SVG):

```json
{
  "name": "ZKPassport Verification #42",
  "description": "...",
  "image": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL...",
  "attributes": [...]
}
```

---

## Quick Reference

### Verification Flow
```
1. User completes ZKPassport verification (app/widget)
2. Backend validates proof, returns: { uniqueIdentifier, faceMatchPassed, personhoodVerified }
3. User calls mintWithVerification() with results
4. NFT minted, user can now access gated contracts
```

### Soulbound Behavior
- NFTs cannot be transferred (reverts on any transfer attempt)
- Can only be minted, never burned by user
- One NFT per wallet address
- One NFT per ZKPassport identifier
