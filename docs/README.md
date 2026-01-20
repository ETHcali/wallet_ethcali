# ETHCALI Smart Contracts Documentation

**Complete documentation hub** for all ETHCALI smart contracts and frontend integration.

**Last Updated**: January 2026

---

## Contract Overview

| Contract | Purpose | Documentation |
|----------|---------|---------------|
| **ZKPassportNFT** | Soulbound identity NFT for anti-sybil | [ZKPASSPORT_CONTRACT_REFERENCE.md](./ZKPASSPORT_CONTRACT_REFERENCE.md) |
| **FaucetManager** | Multi-vault ETH faucet system | [FAUCET_CONTRACT_REFERENCE.md](./FAUCET_CONTRACT_REFERENCE.md) |
| **Swag1155** | ERC-1155 merchandise with USDC payments | [SWAG1155_CONTRACT_REFERENCE.md](./SWAG1155_CONTRACT_REFERENCE.md) |

### Security & Admin

| Document | Description |
|----------|-------------|
| **Security Guide** | [SECURITY_ADMIN_GUIDE.md](./SECURITY_ADMIN_GUIDE.md) - Admin roles, treasury management, emergency procedures |

---

## System Architecture

```
                                    ┌─────────────────────┐
                                    │    ZKPassportNFT    │
                                    │  (Identity Layer)   │
                                    │                     │
                                    │ - Soulbound NFT     │
                                    │ - One per person    │
                                    │ - ZK verification   │
                                    └──────────┬──────────┘
                                               │
                           ┌───────────────────┼───────────────────┐
                           │                   │                   │
                           ▼                   ▼                   ▼
              ┌─────────────────────┐ ┌─────────────────┐ ┌─────────────────┐
              │   FaucetManager     │ │    Swag1155     │ │  Future Gated   │
              │  (ETH Distribution) │ │  (Merchandise)  │ │   Contracts     │
              │                     │ │                 │ │                 │
              │ - Multiple vaults   │ │ - ERC-1155 NFTs │ │ - Voting        │
              │ - Returnable types  │ │ - USDC payments │ │ - Airdrops      │
              │ - Good actor track  │ │ - Redemption    │ │ - Events        │
              └─────────────────────┘ └─────────────────┘ └─────────────────┘
```

---

## Quick Start by Role

### For Frontend Developers

1. **Start with ZKPassport** - Users need identity first
   - [ZKPassport Frontend Integration](./ZKPASSPORT_CONTRACT_REFERENCE.md#frontend-integration)

2. **Implement Faucet UI** - Let users claim ETH
   - [Faucet UI Components Map](./FAUCET_CONTRACT_REFERENCE.md#ui-components-map)
   - [Faucet React Hooks](./FAUCET_CONTRACT_REFERENCE.md#frontend-components)

3. **Build Swag Store** - Merchandise with NFT redemption
   - [Swag Frontend Guide](../SWAG1155_FRONTEND.md)
   - [Swag Contract Reference](./SWAG1155_CONTRACT_REFERENCE.md)

### For Smart Contract Developers

1. **Contracts Location**: `/contracts/`
   - `ZKPassportNFT.sol` - Identity NFT
   - `FaucetManager.sol` - Multi-vault faucet
   - `Swag1155.sol` - Merchandise NFTs

2. **Run Tests**:
   ```bash
   npx hardhat test
   ```

3. **Deploy**:
   ```bash
   npx hardhat run scripts/deploy.ts --network base
   ```

### For Admins

| Task | Contract | Function | Doc Link |
|------|----------|----------|----------|
| Set NFT image | ZKPassportNFT | `setMetadata()` | [Link](./ZKPASSPORT_CONTRACT_REFERENCE.md#setmetadata) |
| Create faucet | FaucetManager | `createVault()` | [Link](./FAUCET_CONTRACT_REFERENCE.md#createvault) |
| Fund faucet | FaucetManager | `deposit()` | [Link](./FAUCET_CONTRACT_REFERENCE.md#deposit) |
| Create swag | Swag1155 | `setVariantWithURI()` | [Link](./SWAG1155_CONTRACT_REFERENCE.md#setvariantwithuri) |
| Mark shipped | Swag1155 | `markFulfilled()` | [Link](./SWAG1155_CONTRACT_REFERENCE.md#markfulfilled) |

---

## User Flows

### 1. Identity Verification Flow

```
┌──────────┐     ┌──────────────┐     ┌─────────────────┐     ┌────────────┐
│  User    │ ──▶ │  ZKPassport  │ ──▶ │ mintWithVerif() │ ──▶ │  Has NFT   │
│  (App)   │     │  Verification│     │   (Contract)    │     │  (Access)  │
└──────────┘     └──────────────┘     └─────────────────┘     └────────────┘
```

### 2. Faucet Claim Flow

```
┌──────────┐     ┌──────────────┐     ┌─────────────────┐     ┌────────────┐
│  User    │ ──▶ │ Has ZKPassport│ ──▶ │  claim(vaultId) │ ──▶ │ Receives   │
│          │     │     NFT?     │     │                 │     │    ETH     │
└──────────┘     └──────────────┘     └─────────────────┘     └────────────┘
                       │
                       │ (Returnable vault)
                       ▼
               ┌──────────────┐     ┌────────────┐
               │ returnFunds()│ ──▶ │ Good Actor │
               │              │     │   Badge    │
               └──────────────┘     └────────────┘
```

### 3. Swag Purchase & Redemption Flow

```
┌──────────┐     ┌──────────────┐     ┌─────────────────┐     ┌────────────┐
│  User    │ ──▶ │ Approve USDC │ ──▶ │   buy(tokenId)  │ ──▶ │  Owns NFT  │
│          │     │              │     │                 │     │            │
└──────────┘     └──────────────┘     └─────────────────┘     └────────────┘
                                                                    │
                                                                    ▼
┌──────────┐     ┌──────────────┐     ┌─────────────────┐     ┌────────────┐
│  Admin   │ ◀── │ Ships item   │ ◀── │ Shipping form   │ ◀── │  redeem()  │
│          │     │              │     │   (backend)     │     │            │
└──────────┘     └──────────────┘     └─────────────────┘     └────────────┘
      │
      ▼
┌──────────────┐     ┌────────────┐
│markFulfilled()│ ──▶ │  Shipped!  │
│              │     │            │
└──────────────┘     └────────────┘
```

---

## Contract Addresses

### Testnet (Base Sepolia)

| Contract | Address |
|----------|---------|
| ZKPassportNFT | `0x...` |
| FaucetManager | `0x...` |
| Swag1155 | `0x...` |
| USDC (Test) | `0x...` |

### Mainnet (Base)

| Contract | Address |
|----------|---------|
| ZKPassportNFT | `0x...` |
| FaucetManager | `0x...` |
| Swag1155 | `0x...` |
| USDC | `0x833589fCD6eDb6E08f4c7C32D4f71b1566469C5d` |

> **Note**: Update addresses after deployment

---

## Button-to-Function Quick Reference

### ZKPassportNFT

| Button | Function | User Type |
|--------|----------|-----------|
| [Mint NFT] | `mintWithVerification()` | User |
| [Set Image] | `setImageURI()` | Admin |
| [Set Metadata] | `setMetadata()` | Admin |

### FaucetManager

| Button | Function | User Type |
|--------|----------|-----------|
| [Create Vault] | `createVault()` | Admin |
| [Edit Vault] | `updateVault()` | Admin |
| [Deposit] | `deposit()` | Admin |
| [Withdraw] | `withdraw()` | Admin |
| [Claim ETH] | `claim()` | User |
| [Return Funds] | `returnFunds()` | User |

### Swag1155

| Button | Function | User Type |
|--------|----------|-----------|
| [Create Product] | `setVariantWithURI()` | Admin |
| [Edit Quantity] | `setVariant()` | Admin |
| [Buy] | `buy()` | User |
| [Redeem] | `redeem()` | User |
| [Mark Shipped] | `markFulfilled()` | Admin |

---

## Environment Variables

```bash
# Contract Addresses
VITE_ZKPASSPORT_ADDRESS=0x...
VITE_FAUCET_MANAGER_ADDRESS=0x...
VITE_SWAG1155_ADDRESS=0x...

# USDC Addresses
VITE_USDC_ADDRESS_BASE=0x833589fCD6eDb6E08f4c7C32D4f71b1566469C5d

# IPFS/Pinata
VITE_PINATA_JWT=your_jwt
VITE_PINATA_GATEWAY=https://gateway.pinata.cloud/ipfs

# Network
VITE_DEFAULT_NETWORK=base
```

---

## Related Documents

| Document | Description |
|----------|-------------|
| [SWAG1155_FRONTEND.md](../SWAG1155_FRONTEND.md) | Complete frontend implementation guide for swag store |
| [README.md](../README.md) | Project overview and setup |

---

## Support

- **GitHub Issues**: [Report issues](https://github.com/ethcali/faucet-ethcali/issues)
- **Contract Source**: `/contracts/` directory
