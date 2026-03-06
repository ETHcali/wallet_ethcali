# ZKPassportNFT Contract Reference

**Complete API reference** for the ZKPassportNFT soulbound ERC721 contract.

**Contract**: `contracts/ZKPassportNFT.sol`  
**Interfaces**: `contracts/interfaces/IZKPassport.sol`  
**Version**: 3.0 (On-Chain ZK Proof Verification)  
**Last Updated**: March 2026

---

## Table of Contents

1. [Overview](#overview)
2. [Data Structures](#data-structures)
3. [State Variables](#state-variables)
4. [Admin Functions](#admin-functions)
5. [Mint Function](#mint-function)
6. [View Functions](#view-functions)
7. [Events](#events)
8. [Error Messages](#error-messages)
9. [Frontend Integration](#frontend-integration)

---

## Overview

ZKPassportNFT is a **soulbound** (non-transferable) ERC721 NFT that represents a cryptographically verified ZKPassport identity. Unlike self-reported approaches, the ZK proof is **verified on-chain** by the ZKPassport verifier contract — no one can fake their age, nationality, or personhood.

### Key Features

| Feature | Description |
|---------|-------------|
| **On-chain ZK verification** | Proof verified by `IZKPassportVerifier` — no trust in user-supplied values |
| **Soulbound** | NFTs cannot be transferred after minting |
| **One per address** | Each wallet can only hold one NFT |
| **One per passport** | Each ZKPassport unique identifier can only mint once |
| **Verified traits** | Personhood, Age 18+, and Nationality stored from the proof |

### Supported Networks

The ZKPassport verifier (`0x1D000001000EFD9a6371f4d90bB8920D5431c0D8`) is currently deployed on:

| Network | Chain ID | Verifier Live |
|---------|----------|---------------|
| Ethereum Mainnet | 1 | ✅ |
| Base Mainnet | 8453 | ✅ |
| Unichain Mainnet | 130 | ⏳ (owner can update via `setVerifier`) |
| Optimism Mainnet | 10 | ⏳ (owner can update via `setVerifier`) |

### Architecture

```
┌─────────────────────┐
│  ZKPassport SDK     │  Frontend builds query:
│  (Frontend)         │  .gte("age", 18)
│                     │  .disclose("nationality")
│                     │  .bind("user_address", addr)
│                     │  .bind("chain", "base")
│                     │  .done()  → generates proof
└────────┬────────────┘
         │  ProofVerificationParams
         ▼
┌─────────────────────┐     ┌─────────────────────────────┐
│  ZKPassportNFT      │────▶│  IZKPassportVerifier        │
│  mint(params,       │     │  0x1D000001000EFD9a...       │
│    isIDCard)        │◀────│  verify(params)             │
└─────────────────────┘     │  → verified, uniqueId,      │
         │                  │    IZKPassportHelper         │
         │                  └─────────────────────────────┘
         │  Stores: uniqueIdentifier (bytes32)
         │          personhoodVerified (always true)
         │          isOver18 (from helper)
         │          nationality (from helper)
         ▼
┌─────────────────────┐
│  FaucetManager      │
│  Swag1155           │  hasNFTByAddress(user) → bool
│  (Gated Access)     │
└─────────────────────┘
```

---

## Data Structures

### TokenData

Stores verified identity data for a minted NFT. All fields come from the on-chain proof, not from user input.

```solidity
struct TokenData {
    bytes32 uniqueIdentifier;   // Scoped nullifier returned by the verifier
    bool    personhoodVerified; // Always true for minted tokens
    bool    isOver18;           // From helper.isAgeAboveOrEqual(18, ...)
    string  nationality;        // From helper.getDisclosedData(...).nationality
}
```

**Frontend usage:**
```typescript
interface TokenData {
  uniqueIdentifier:  `0x${string}`; // bytes32 hex
  personhoodVerified: boolean;
  isOver18:          boolean;
  nationality:       string;        // ISO alpha-3 (e.g. "USA", "FRA")
}
```

### ZKPassport Proof Structs (from `IZKPassport.sol`)

These are passed into `mint()` and produced by the ZKPassport SDK — your frontend does not construct them manually.

```solidity
struct ProofVerificationParams {
    bytes32               version;
    ProofVerificationData proofVerificationData; // { vkeyHash, proof, publicInputs }
    bytes                 committedInputs;
    ServiceConfig         serviceConfig;         // { validityPeriod, domain, scope, devMode }
}
```

---

## State Variables

### Public Variables

| Variable | Type | Description |
|----------|------|-------------|
| `zkPassportVerifier` | `IZKPassportVerifier` | Active verifier contract (owner-updatable) |
| `ZKPASSPORT_VERIFIER_ADDRESS` | `address constant` | `0x1D000001000EFD9a6371f4d90bB8920D5431c0D8` |
| `domain` | `string` | SDK domain — must match the query (e.g. `"ethcali.com"`) |
| `scope` | `string` | SDK scope — must match the query (e.g. `"ethcali-verification"`) |
| `nftImageURI` | `string` | IPFS URI for NFT image |
| `nftDescription` | `string` | Description for all NFTs |
| `nftExternalURL` | `string` | External website URL |
| `useIPFSImage` | `bool` | `true` = IPFS image, `false` = on-chain SVG |

### Private Mappings

| Variable | Type | Description |
|----------|------|-------------|
| `_usedIdentifiers` | `mapping(bytes32 => bool)` | Tracks used scoped nullifiers |
| `_hasNFT` | `mapping(address => bool)` | Tracks addresses that hold an NFT |
| `_tokenData` | `mapping(uint256 => TokenData)` | Per-token verified data |
| `_tokenIdCounter` | `uint256` | Auto-incremented token ID |

---

## Admin Functions

### setVerifier

Update the ZKPassport verifier address (e.g. when a new network is supported).

```solidity
function setVerifier(address verifierAddress) external onlyOwner
```

**Emits:** `VerifierUpdated(newVerifier)`

---

### setDomain

Update the domain that must match the SDK query.

```solidity
function setDomain(string memory _domain) external onlyOwner
```

---

### setScope

Update the scope that must match the SDK query.

```solidity
function setScope(string memory _scope) external onlyOwner
```

---

### setImageURI / setDescription / setExternalURL / setUseIPFSImage / setMetadata

Standard NFT metadata setters — identical to previous versions.

```solidity
function setMetadata(string imageURI, string description, string externalURL, bool useIPFS) external onlyOwner
```

**Emits:** `MetadataUpdated(imageURI, description, externalURL, useIPFS)`

---

## Mint Function

### mint

Mint a ZKPassport NFT by submitting a ZK proof. The proof is verified on-chain — all claimed values are cryptographically proven.

```solidity
function mint(ProofVerificationParams calldata params, bool isIDCard) external
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `params` | `ProofVerificationParams` | Proof bundle from `zkPassport.getSolidityVerifierParameters()` |
| `isIDCard` | `bool` | `true` for ID card / residence permit; `false` for passport |

**On-chain checks performed:**
1. Caller does not already have an NFT
2. `zkPassportVerifier.verify(params)` returns `verified = true`
3. Scoped nullifier not already used
4. `helper.verifyScopes(...)` matches `domain` and `scope`
5. `helper.getBoundData(...).senderAddress == msg.sender`
6. `helper.getBoundData(...).chainId == block.chainid`

**Emits:** `NFTMinted(to, tokenId, uniqueIdentifier, isOver18, nationality)`

---

## View Functions

### hasNFTByAddress

```solidity
function hasNFTByAddress(address user) external view returns (bool)
```

Returns `true` if the address holds an NFT. Used by `FaucetManager` and `Swag1155` for gating.

---

### hasNFTByIdentifier

```solidity
function hasNFTByIdentifier(bytes32 uniqueIdentifier) external view returns (bool)
```

Returns `true` if a scoped nullifier (bytes32) has already been used to mint.

---

### getTokenData

```solidity
function getTokenData(uint256 tokenId) external view returns (TokenData memory)
```

Returns the verified data stored for a token.

---

### tokenURI (inherited)

Returns Base64-encoded JSON metadata with attributes: Personhood, Age 18+, Nationality, Verification Status, Token ID.

---

### balanceOf / ownerOf (inherited)

Standard ERC721. `balanceOf` always returns 0 or 1 (one NFT per address).

---

## Events

| Event | Parameters | When Emitted |
|-------|------------|--------------|
| `NFTMinted` | `to`, `tokenId`, `uniqueIdentifier` (bytes32), `isOver18`, `nationality` | NFT minted |
| `MetadataUpdated` | `imageURI`, `description`, `externalURL`, `useIPFS` | Admin updates metadata |
| `VerifierUpdated` | `newVerifier` | Owner updates verifier address |

---

## Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| `"ZKPassportNFT: address already has NFT"` | Wallet already holds an NFT | One per address |
| `"ZKPassportNFT: proof verification failed"` | Verifier returned `verified = false` | Valid ZKPassport proof required |
| `"ZKPassportNFT: identifier already used"` | Scoped nullifier already minted | One mint per passport |
| `"ZKPassportNFT: invalid domain or scope"` | Proof not for this app/scope | SDK query must use matching domain + scope |
| `"ZKPassportNFT: sender address mismatch"` | Proof bound to a different address | Proof must be generated for the calling wallet |
| `"ZKPassportNFT: chain id mismatch"` | Proof bound to a different chain | Proof must be bound to the current chain |
| `"ZKPassportNFT: invalid verifier address"` | Zero address passed to `setVerifier` | Provide a valid contract address |
| `"ZKPassportNFT: soulbound token - transfers not allowed"` | Attempted transfer | NFTs are non-transferable |
| `"ZKPassportNFT: token does not exist"` | Invalid tokenId in `getTokenData` | Query an existing token |
| `"ZKPassportNFT: empty description"` | Empty string in `setDescription` | Provide a description |
| `"ZKPassportNFT: set image URI first"` | `setUseIPFSImage(true)` without URI | Call `setImageURI` first |

---

## Frontend Integration

### Complete Mint Flow

The SDK query must request **age ≥ 18**, **nationality disclosure**, **personhood** (just by calling `.done()`), and **bind the proof** to the caller's address and chain. The result feeds directly into `mint()`.

```typescript
import { ZKPassport } from "@zkpassport/sdk";
import { useWriteContract, useReadContract, useAccount, useChainId } from "wagmi";
import { createWalletClient, http, custom } from "viem";

async function mintZKPassportNFT(walletProvider: any) {
  const zkPassport = new ZKPassport("ethcali.com");

  const queryBuilder = await zkPassport.request({
    name: "ETHcali",
    logo: "https://ethcali.com/logo.png",
    purpose: "Prove your identity to access ETHcali contracts",
    scope: "ethcali-verification",
    // Required for on-chain verification
    mode: "compressed-evm",
  });

  let proof: any;

  const { url, onProofGenerated, onResult } = queryBuilder
    .gte("age", 18)               // proves age ≥ 18 → isOver18
    .disclose("nationality")      // reveals nationality string
    .bind("user_address", userAddress)
    .bind("chain", "base")        // or "ethereum"
    .done();

  // Capture the proof when generated
  onProofGenerated((proofResult) => {
    proof = proofResult;
  });

  onResult(async ({ verified, result }) => {
    if (!verified) return;

    // Build the params the contract needs
    const verifierParams = zkPassport.getSolidityVerifierParameters({
      proof,
      scope: "ethcali-verification",
      devMode: false,
    });

    // isIDCard = true for ID cards / residence permits, false for passports
    const isIDCard = result.document_type?.disclose?.result !== "passport";

    // Single contract call — all verification happens on-chain
    await walletClient.writeContract({
      address: ZKPASSPORT_NFT_ADDRESS,
      abi: ZKPassportNFTABI,
      functionName: "mint",
      args: [verifierParams, isIDCard],
    });
  });

  // Open the ZKPassport verification URL for the user
  window.open(url);
}
```

### Check Eligibility

```typescript
// Used by FaucetManager, Swag1155, etc.
const { data: hasNFT } = useReadContract({
  address: ZKPASSPORT_NFT_ADDRESS,
  abi: ZKPassportNFTABI,
  functionName: "hasNFTByAddress",
  args: [userAddress],
});

if (!hasNFT) {
  // Show mint button
}
```

### Read Token Data

```typescript
const { data: tokenData } = useReadContract({
  address: ZKPASSPORT_NFT_ADDRESS,
  abi: ZKPassportNFTABI,
  functionName: "getTokenData",
  args: [tokenId],
});

// tokenData.personhoodVerified → true (always, cryptographically proven)
// tokenData.isOver18           → true/false
// tokenData.nationality        → "USA", "MEX", etc. (ISO alpha-3 / MRZ format)
// tokenData.uniqueIdentifier   → bytes32 scoped nullifier
```

---

## NFT Metadata Example

```json
{
  "name": "ZKPassport Verification #0",
  "description": "ZKPassport Verification NFT - Cryptographic proof of identity enabling access to ETHCALI Smart Contracts.",
  "image": "data:image/svg+xml;base64,...",
  "attributes": [
    { "trait_type": "Personhood",           "value": "Verified" },
    { "trait_type": "Age 18+",              "value": "Yes" },
    { "trait_type": "Nationality",          "value": "USA" },
    { "trait_type": "Verification Status",  "value": "Fully Verified" },
    { "trait_type": "Token ID",             "value": "0" }
  ]
}
```

---

## Quick Reference

### Verification Flow
```
1. Frontend calls ZKPassport SDK:
      queryBuilder
        .gte("age", 18)
        .disclose("nationality")
        .bind("user_address", wallet)
        .bind("chain", "base")
        .done()

2. User scans QR / completes verification in ZKPassport app
   → SDK returns ProofVerificationParams via getSolidityVerifierParameters()

3. Frontend calls: ZKPassportNFT.mint(params, isIDCard)
   → Contract verifies proof on-chain via IZKPassportVerifier
   → Stores uniqueIdentifier, personhoodVerified=true, isOver18, nationality
   → Mints soulbound NFT to caller
```

### Soulbound Behavior
- NFTs cannot be transferred (reverts on any transfer attempt)
- One NFT per wallet address
- One NFT per ZKPassport identity (scoped nullifier)
- Metadata is frozen at mint time (stored via `_setTokenURI`)

### Constructor Parameters
```solidity
constructor(
    string name,          // e.g. "ZKPassport Verification"
    string symbol,        // e.g. "ZKPASS"
    address initialOwner, // ZK_PASSPORT_ADMIN from .env
    string domain,        // e.g. "ethcali.com"
    string scope          // e.g. "ethcali-verification"
)
```

