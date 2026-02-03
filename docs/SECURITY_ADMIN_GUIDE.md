# Security & Admin Management Guide

**Complete guide** for managing admin roles, treasury addresses, and security configuration across all ETHCALI contracts.

**Last Updated**: January 2026

---

## Table of Contents

1. [Overview](#overview)
2. [Role Hierarchy](#role-hierarchy)
3. [Initial Deployment (.env)](#initial-deployment-env)
4. [Post-Deployment Admin Functions](#post-deployment-admin-functions)
5. [Security Best Practices](#security-best-practices)
6. [Emergency Procedures](#emergency-procedures)

---

## Overview

### Access Control Model

| Contract | Model | Super Admin | Regular Admin |
|----------|-------|-------------|---------------|
| **ZKPassportNFT** | Ownable | Owner (single) | N/A |
| **FaucetManager** | AccessControl | DEFAULT_ADMIN_ROLE | ADMIN_ROLE |
| **Swag1155** | AccessControl | DEFAULT_ADMIN_ROLE | ADMIN_ROLE |

### Key Differences

```
OWNABLE (ZKPassportNFT):
├── Single owner
├── Can transfer ownership
└── All admin functions require owner

ACCESS CONTROL (FaucetManager, Swag1155):
├── Multiple admins possible
├── Two-tier hierarchy (Super Admin + Admin)
├── Super Admin can add/remove other admins
└── Admin can perform daily operations
```

---

## Role Hierarchy

### ZKPassportNFT

```
┌─────────────────────────────────────────────────────────────┐
│                    ZKPassportNFT                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  OWNER (single address)                                      │
│  ├── setMetadata()       - Configure NFT image/description  │
│  ├── setImageURI()       - Set IPFS image                   │
│  ├── setDescription()    - Set description                  │
│  ├── setExternalURL()    - Set website link                 │
│  ├── setUseIPFSImage()   - Toggle IPFS vs SVG               │
│  ├── approveVerification() - Pre-approve mints              │
│  └── transferOwnership() - Change owner                     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### FaucetManager

```
┌─────────────────────────────────────────────────────────────┐
│                    FaucetManager                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  DEFAULT_ADMIN_ROLE (Super Admin)                           │
│  ├── addAdmin()          - Grant ADMIN_ROLE                 │
│  ├── removeAdmin()       - Revoke ADMIN_ROLE                │
│  ├── setNFTContract()    - Change ZKPassport address        │
│  ├── grantRole()         - Grant any role                   │
│  └── revokeRole()        - Revoke any role                  │
│                                                              │
│  ADMIN_ROLE (Operations)                                     │
│  ├── createVault()       - Create new faucet                │
│  ├── updateVault()       - Edit vault settings              │
│  ├── updateVaultGating() - Update vault ZKPassport/token gating │
│  ├── deposit()           - Add ETH to vault                 │
│  ├── withdraw()          - Remove ETH from vault            │
│  ├── addToWhitelist()    - Add address to vault whitelist   │
│  ├── removeFromWhitelist() - Remove address from whitelist  │
│  ├── addBatchToWhitelist() - Batch add to whitelist         │
│  ├── removeBatchFromWhitelist() - Batch remove from whitelist │
│  ├── pause()             - Emergency pause                  │
│  └── unpause()           - Resume operations                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Swag1155

```
┌─────────────────────────────────────────────────────────────┐
│                      Swag1155                                │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  DEFAULT_ADMIN_ROLE (Super Admin)                           │
│  ├── addAdmin()          - Grant ADMIN_ROLE                 │
│  ├── removeAdmin()       - Revoke ADMIN_ROLE                │
│  ├── setTreasury()       - Change treasury wallet           │
│  ├── setUSDC()           - Change USDC contract             │
│  ├── grantRole()         - Grant any role                   │
│  └── revokeRole()        - Revoke any role                  │
│                                                              │
│  ADMIN_ROLE (Operations)                                     │
│  ├── setVariant()        - Create/edit products             │
│  ├── setVariantWithURI() - Create with metadata             │
│  ├── setBaseURI()        - Set default metadata URI         │
│  ├── addRoyalty()        - Add royalty recipient for a product │
│  ├── clearRoyalties()    - Remove all royalties for a product │
│  ├── markFulfilled()     - Confirm shipment                 │
│  ├── addPoapDiscount()   - Add POAP-based discount          │
│  ├── removePoapDiscount() - Remove POAP discount            │
│  ├── addHolderDiscount() - Add token holder discount        │
│  └── removeHolderDiscount() - Remove holder discount        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Initial Deployment (.env)

### Required Environment Variables

```bash
# ============================================================
# ADMIN & TREASURY CONFIGURATION
# ============================================================

# Contract Admins
SWAG_ADMIN=0x...          # Admin for Swag1155 (can manage products, royalties, admins)
FAUCET_ADMIN=0x...        # Admin for FaucetManager (can manage vaults, admins)
ZK_PASSPORT_ADMIN=0x...   # Owner for ZKPassportNFT (can manage metadata)

# Treasury
SWAG_TREASURY_ADDRESS=0x...  # Receives USDC payments (remainder after royalties)

# POAP Contract (required for Swag1155)
POAP_CONTRACT_ADDRESS=0x...  # POAP contract address (immutable after deployment)

# Optional: NFT metadata (can be set post-deployment)
NFT_IMAGE_URI=ipfs://...
NFT_DESCRIPTION=Your description
NFT_EXTERNAL_URL=https://yoursite.com
```

### Deployment Command

```bash
# Deploy to Base mainnet
npx hardhat run scripts/deploy-all.ts --network base

# Deploy to Ethereum mainnet
npx hardhat run scripts/deploy-all.ts --network ethereum

# Deploy to Optimism mainnet
npx hardhat run scripts/deploy-all.ts --network optimism

# Deploy to Unichain mainnet
npx hardhat run scripts/deploy-all.ts --network unichain

# Deploy to testnet first
npx hardhat run scripts/deploy-all.ts --network sepolia
```

### Supported Networks

- **Base** (Chain ID: 8453)
- **Ethereum** (Chain ID: 1)
- **Optimism** (Chain ID: 10)
- **Unichain** (Chain ID: 130)
- **Sepolia** (Chain ID: 11155111) - Testnet

### What Happens During Deployment

1. **ZKPassportNFT**: Deploys, then transfers ownership to `ZK_PASSPORT_ADMIN`
2. **FaucetManager**: Deploys, grants admin roles to `FAUCET_ADMIN`
3. **Swag1155**: Deploys with `SWAG_TREASURY_ADDRESS` and `POAP_CONTRACT_ADDRESS` (5th constructor parameter), grants admin roles to `SWAG_ADMIN`

---

## Post-Deployment Admin Functions

### ZKPassportNFT - Change Owner

```typescript
// Transfer ownership to new address
await zkPassportNFT.write.transferOwnership([
  '0xNewOwnerAddress...'
]);
```

**Warning**: This is irreversible. The old owner loses all access.

---

### FaucetManager - Manage Admins

```typescript
// Add a new admin
await faucetManager.write.addAdmin(['0xNewAdmin...']);

// Remove an admin
await faucetManager.write.removeAdmin(['0xOldAdmin...']);

// Check if address is admin
const isAdmin = await faucetManager.read.isAdmin(['0xAddress...']);

// Check if address is super admin
const isSuperAdmin = await faucetManager.read.isSuperAdmin(['0xAddress...']);
```

### FaucetManager - Change ZKPassport Contract

```typescript
// Update ZKPassport NFT contract (super admin only)
await faucetManager.write.setNFTContract(['0xNewZKPassport...']);
```

---

### Swag1155 - Manage Admins

```typescript
// Add a new admin
await swag1155.write.addAdmin(['0xNewAdmin...']);

// Remove an admin
await swag1155.write.removeAdmin(['0xOldAdmin...']);

// Check roles
const isAdmin = await swag1155.read.isAdmin(['0xAddress...']);
const isSuperAdmin = await swag1155.read.isSuperAdmin(['0xAddress...']);
```

### Swag1155 - Change Treasury

```typescript
// Change treasury address (super admin only)
await swag1155.write.setTreasury(['0xNewTreasury...']);

// Get current treasury
const treasury = await swag1155.read.treasury();
```

### Swag1155 - Change USDC Contract

```typescript
// Change USDC contract (super admin only)
await swag1155.write.setUSDC(['0xNewUSDC...']);

// Get current USDC
const usdc = await swag1155.read.usdc();
```

### Swag1155 - Manage POAP Discounts

```typescript
// Add POAP-based discount (admin only)
// Parameters: tokenId, eventId, discountBps (basis points, e.g., 1000 = 10%)
await swag1155.write.addPoapDiscount([
  tokenId,        // Product token ID
  eventId,        // POAP event ID
  1000n           // 10% discount (1000 basis points)
]);

// Remove POAP discount by index (admin only)
await swag1155.write.removePoapDiscount([
  tokenId,        // Product token ID
  index           // Index in the discount array
]);

// Get POAP discounts for a product
const discounts = await swag1155.read.getPoapDiscounts([tokenId]);
```

**Security Note**: POAP contract address is set at deployment and cannot be changed.

### Swag1155 - Manage Holder Discounts

```typescript
// Add token holder discount (admin only)
// Parameters: tokenId, token, discountType, value
await swag1155.write.addHolderDiscount([
  tokenId,        // Product token ID
  '0xToken...',   // Token contract address
  0,              // Discount type: 0=ERC721, 1=ERC1155, 2=ERC20
  1000n           // Discount value (basis points for ERC721/1155, threshold for ERC20)
]);

// Remove holder discount by index (admin only)
await swag1155.write.removeHolderDiscount([
  tokenId,        // Product token ID
  index           // Index in the discount array
]);

// Get holder discounts for a product
const discounts = await swag1155.read.getHolderDiscounts([tokenId]);
```

**Discount Types**:
- `0` - ERC721: Holder gets discount (value in basis points)
- `1` - ERC1155: Holder gets discount (value in basis points)
- `2` - ERC20: Holder with balance >= value gets discount

---

## Security Best Practices

### 1. Use Multisig for Super Admin

```
Recommended: Gnosis Safe multisig

Setup:
- 3-of-5 signers minimum
- Include team members from different locations
- Hardware wallet required for each signer
```

### 2. Role Separation

```
Recommended Role Distribution:

SUPER_ADMIN (Multisig):
├── Can add/remove admins
├── Can change treasury/USDC
└── Rarely used, high security

ADMIN (Individual wallets):
├── Daily operations
├── Create vaults/products
└── Mark shipments
```

### 3. Monitor Admin Actions

All admin actions emit events:

```solidity
// FaucetManager events
event VaultCreated(uint256 indexed vaultId, ...);
event VaultUpdated(uint256 indexed vaultId, ...);

// Swag1155 events
event VariantUpdated(uint256 indexed tokenId, ...);
event AdminAdded(address indexed admin);
event AdminRemoved(address indexed admin);
event TreasuryUpdated(address indexed newTreasury);
```

Set up event monitoring with:
- The Graph indexer
- Tenderly alerts
- Custom webhook listener

### 4. Treasury Security

```
DO:
✅ Use a dedicated treasury wallet (not personal)
✅ Consider a multisig for treasury
✅ Regularly withdraw to cold storage
✅ Monitor incoming transactions

DON'T:
❌ Use treasury wallet for other purposes
❌ Share treasury private key
❌ Keep large amounts in hot wallet
```

### 5. Discount Security

**CRITICAL**: Discounts are additive and can stack to 100% (free product).

```
DISCOUNT STACKING BEHAVIOR:
- Multiple POAP discounts add together
- Multiple holder discounts add together
- POAP + holder discounts add together
- Total discount can reach 10000 bps (100% = FREE)

ADMIN RESPONSIBILITIES:
✅ Calculate total possible discount before adding new ones
✅ Monitor discount combinations per product
✅ Consider maximum discount caps in your business logic
✅ Review discount configurations regularly

IMMUTABLE SETTINGS:
⚠️  POAP contract address is set at deployment
⚠️  Cannot change POAP contract after deployment
⚠️  Must redeploy contract to use different POAP contract

DISCOUNT SCOPE:
- All discounts are per-product (tokenId)
- Different products can have different discount rules
- Discounts apply to all buyers meeting criteria
```

**Example Scenario**:
```typescript
// Product #1 has:
// - POAP discount: 2000 bps (20%)
// - Holder discount 1: 3000 bps (30%)
// - Holder discount 2: 2000 bps (20%)
//
// A user with all three qualifications gets:
// Total: 7000 bps (70% off)
//
// If admin adds another 3000 bps discount:
// Total: 10000 bps (100% off = FREE)
```

---

## Emergency Procedures

### 1. Pause Contracts

```typescript
// FaucetManager - pause all claims
await faucetManager.write.pause();

// To resume
await faucetManager.write.unpause();
```

**Note**: Swag1155 doesn't have pause. To stop sales, deactivate all variants:

```typescript
// Deactivate a product
await swag1155.write.setVariant([
  tokenId,
  currentPrice,
  currentMaxSupply,
  false  // active = false
]);
```

### 2. Compromised Admin Key

```
IMMEDIATE ACTIONS:

1. Remove compromised admin (from another admin):
   await contract.write.removeAdmin(['0xCompromised...']);

2. If super admin compromised:
   - Cannot directly recover
   - Deploy new contract
   - Migrate data/users

PREVENTION:
- Use hardware wallets
- Enable 2FA on all accounts
- Regular security audits
```

### 3. Wrong Treasury Address

```typescript
// Fix immediately (super admin only)
await swag1155.write.setTreasury(['0xCorrectTreasury...']);

// Funds already sent to wrong address cannot be recovered on-chain
// Contact the wrong recipient off-chain
```

### 4. Upgrade Path

Contracts are NOT upgradeable. To upgrade:

1. Deploy new contract
2. Transfer admin roles
3. Update frontend to use new address
4. Migrate user data if needed
5. Consider keeping old contract read-only for historical data

---

## Quick Reference

### Check Current Configuration

```typescript
// ZKPassportNFT
const owner = await zkPassportNFT.read.owner();
const imageURI = await zkPassportNFT.read.nftImageURI();
const description = await zkPassportNFT.read.nftDescription();

// FaucetManager
const nftContract = await faucetManager.read.nftContract();
const isAdmin = await faucetManager.read.isAdmin([address]);

// Swag1155
const treasury = await swag1155.read.treasury();
const usdc = await swag1155.read.usdc();
const isAdmin = await swag1155.read.isAdmin([address]);
```

### Role Constants

```typescript
// AccessControl role identifiers
const DEFAULT_ADMIN_ROLE = '0x0000000000000000000000000000000000000000000000000000000000000000';
const ADMIN_ROLE = keccak256(toBytes('ADMIN_ROLE'));
```

### Common Operations Checklist

| Operation | Contract | Function | Role Required |
|-----------|----------|----------|---------------|
| Add admin | FaucetManager | `addAdmin()` | DEFAULT_ADMIN_ROLE |
| Add admin | Swag1155 | `addAdmin()` | DEFAULT_ADMIN_ROLE |
| Change treasury | Swag1155 | `setTreasury()` | DEFAULT_ADMIN_ROLE |
| Change owner | ZKPassportNFT | `transferOwnership()` | Owner |
| Create vault | FaucetManager | `createVault()` | ADMIN_ROLE |
| Update vault gating | FaucetManager | `updateVaultGating()` | ADMIN_ROLE |
| Create product | Swag1155 | `setVariantWithURI()` | ADMIN_ROLE |
| Add royalty | Swag1155 | `addRoyalty()` | ADMIN_ROLE |
| Clear royalties | Swag1155 | `clearRoyalties()` | ADMIN_ROLE |
| Add POAP discount | Swag1155 | `addPoapDiscount()` | ADMIN_ROLE |
| Remove POAP discount | Swag1155 | `removePoapDiscount()` | ADMIN_ROLE |
| Add holder discount | Swag1155 | `addHolderDiscount()` | ADMIN_ROLE |
| Remove holder discount | Swag1155 | `removeHolderDiscount()` | ADMIN_ROLE |
| Pause | FaucetManager | `pause()` | ADMIN_ROLE |
