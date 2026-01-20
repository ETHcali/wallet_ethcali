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
│  ├── deposit()           - Add ETH to vault                 │
│  ├── withdraw()          - Remove ETH from vault            │
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
│  └── markFulfilled()     - Confirm shipment                 │
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

# Super Admin - Has full control, can add/remove other admins
# SECURITY: Use a multisig or hardware wallet
SUPER_ADMIN_ADDRESS=0x...

# ZKPassportNFT owner (can be same as super admin)
ZKPASSPORT_OWNER_ADDRESS=0x...

# FaucetManager admin (can be same as super admin)
FAUCET_ADMIN_ADDRESS=0x...

# Treasury wallet for Swag1155 USDC payments
SWAG_TREASURY_ADDRESS=0x...

# Optional: NFT metadata (can be set post-deployment)
NFT_IMAGE_URI=ipfs://...
NFT_DESCRIPTION=Your description
NFT_EXTERNAL_URL=https://yoursite.com
```

### Deployment Command

```bash
# Deploy to Base mainnet
npx hardhat run scripts/deploy-all.ts --network base

# Deploy to testnet first
npx hardhat run scripts/deploy-all.ts --network sepolia
```

### What Happens During Deployment

1. **ZKPassportNFT**: Deploys, then transfers ownership to `ZKPASSPORT_OWNER_ADDRESS`
2. **FaucetManager**: Deploys, grants roles to `FAUCET_ADMIN_ADDRESS`
3. **Swag1155**: Deploys with `SWAG_TREASURY_ADDRESS`, grants roles to `SUPER_ADMIN_ADDRESS`

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
| Create product | Swag1155 | `setVariantWithURI()` | ADMIN_ROLE |
| Pause | FaucetManager | `pause()` | ADMIN_ROLE |
