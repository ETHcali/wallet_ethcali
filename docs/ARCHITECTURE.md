# ETH Cali Wallet - Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           ETH CALI WALLET                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │    Wallet    │  │    Faucet    │  │   Identity   │  │     Swag     │ │
│  │   /wallet    │  │   /faucet    │  │    /sybil    │  │    /swag     │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘ │
│         │                 │                 │                 │          │
│  ┌──────┴─────────────────┴─────────────────┴─────────────────┴───────┐ │
│  │                        Custom React Hooks                          │ │
│  │  useTokenBalances, useFaucetAdmin, useZKPassportNFT, useSwagStore │ │
│  └────────────────────────────────┬───────────────────────────────────┘ │
│                                   │                                      │
│  ┌────────────────────────────────┴───────────────────────────────────┐ │
│  │                          Utility Layer                              │ │
│  │       contracts.ts, network.ts, explorer.ts, logger.ts            │ │
│  └────────────────────────────────┬───────────────────────────────────┘ │
│                                   │                                      │
│  ┌────────────────────────────────┴───────────────────────────────────┐ │
│  │                       Configuration Layer                           │ │
│  │              constants.ts, networks.ts, addresses.json              │ │
│  └────────────────────────────────┬───────────────────────────────────┘ │
│                                   │                                      │
└───────────────────────────────────┼──────────────────────────────────────┘
                                    │
         ┌──────────────────────────┼──────────────────────────┐
         │                          │                          │
         ▼                          ▼                          ▼
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│      Privy      │      │      Viem       │      │   Smart         │
│  (Auth + Gas    │      │  (Blockchain    │      │   Contracts     │
│   Sponsorship)  │      │   Interaction)  │      │                 │
└─────────────────┘      └─────────────────┘      └─────────────────┘
```

## Directory Structure

```
wallet_ethcali/
├── components/           # React components
│   ├── shared/          # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Layout.tsx
│   │   ├── Loading.tsx
│   │   ├── ErrorBoundary.tsx
│   │   └── QRScanner.tsx
│   ├── wallet/          # Wallet module components
│   │   ├── WalletInfo.tsx
│   │   ├── SendTokenModal.tsx
│   │   ├── ReceiveModal.tsx
│   │   ├── QRScanner.tsx
│   │   ├── NFTCard.tsx
│   │   ├── NFTGrid.tsx
│   │   └── NFTQRModal.tsx
│   ├── faucet/          # Faucet module components
│   │   ├── FaucetClaim.tsx
│   │   ├── FaucetAdmin.tsx
│   │   ├── VaultList.tsx
│   │   ├── CreateVaultForm.tsx
│   │   ├── VaultDepositWithdraw.tsx
│   │   ├── VaultEditModal.tsx
│   │   └── VaultWhitelistManager.tsx
│   ├── sybil/           # Identity verification components
│   │   ├── SybilVerification.tsx
│   │   ├── NFTCard.tsx
│   │   └── steps/       # Verification step sub-components
│   ├── swag/            # Merchandise store components
│   │   ├── ProductCard.tsx
│   │   ├── AdminProductList.tsx
│   │   ├── AdminProductEditModal.tsx
│   │   ├── AdminManagement.tsx
│   │   ├── AdminMintedNFTs.tsx
│   │   ├── AdminNFTFulfillmentModal.tsx
│   │   └── AdminQRScanner.tsx
│   ├── ens/             # ENS integration
│   │   └── ENSSection.tsx
│   └── Navigation.tsx   # Main navigation
│
├── hooks/               # Custom React hooks
│   ├── faucet/         # Faucet-specific hooks
│   │   ├── index.ts
│   │   ├── useFaucetManagerAdmin.ts
│   │   ├── useVaults.ts
│   │   ├── useVaultMutations.ts
│   │   └── useVaultWhitelist.ts
│   ├── swag/           # Swag-specific hooks
│   │   ├── index.ts
│   │   ├── useVariantQueries.ts
│   │   ├── useVariantMutations.ts
│   │   ├── useRoyalties.ts
│   │   ├── useDiscounts.ts
│   │   ├── useMintedNFTs.ts
│   │   └── useNFTFulfillment.ts
│   ├── ens/            # ENS hooks
│   ├── useActiveWallet.ts
│   ├── useContractAdmin.ts
│   ├── useFaucetAdmin.ts
│   ├── useRedemption.ts
│   ├── useSwagStore.ts
│   ├── useTokenBalances.ts
│   ├── useTokenPrices.ts
│   ├── useTokenTransfer.ts
│   ├── useUserNFTs.ts
│   ├── useZKPassportAdmin.ts
│   ├── useZKPassportNFT.ts
│   └── useZKPassportVerification.ts
│
├── utils/               # Utility functions
│   ├── contracts.ts    # Contract interaction helpers
│   ├── network.ts      # Network configuration
│   ├── explorer.ts     # Block explorer URLs
│   ├── tokenUtils.ts   # Token formatting
│   ├── tokenGeneration.ts # Token generation utilities
│   ├── zkpassport.ts   # ZKPassport utilities
│   └── logger.ts       # Logging utility
│
├── config/              # Configuration
│   ├── constants.ts    # App-wide constants
│   └── networks.ts     # Network/chain configs
│
├── frontend/            # Contract integration
│   ├── abis/           # Smart contract ABIs
│   ├── addresses.json  # Contract addresses
│   └── contracts.ts    # Contract exports
│
├── pages/               # Next.js pages
│   ├── api/            # API routes
│   ├── index.tsx       # Landing page
│   ├── wallet.tsx      # Wallet page
│   ├── faucet.tsx      # Faucet page
│   ├── faucet/admin.tsx
│   ├── swag/index.tsx
│   ├── swag/admin.tsx
│   ├── sybil/index.tsx
│   └── sybil/admin.tsx
│
├── types/               # TypeScript types
│   ├── index.ts
│   ├── faucet.ts
│   ├── swag.ts
│   └── zkpassport.ts
│
└── docs/                # Documentation
```

## Data Flow

### 1. Authentication Flow

```
User → Privy Login → Embedded Wallet Created → useActiveWallet hook
                  ↓
         External Wallet → Connected via Privy → useWallets hook
```

### 2. Transaction Flow (Gas Sponsored)

```
User Action → Component → Hook → Privy sendTransaction()
                                        ↓
                              Privy Gas Sponsorship (TEE)
                                        ↓
                              Blockchain Transaction
```

### 3. Contract Read Flow

```
Component → Hook → useQuery (React Query)
                        ↓
                  viem publicClient.readContract()
                        ↓
                  RPC Provider → Blockchain
```

## Key Patterns

### 1. Hooks Pattern
All blockchain interactions go through custom hooks:
- Encapsulate React Query caching
- Handle loading/error states
- Provide refetch capabilities

### 2. Configuration Centralization
Single source of truth for:
- Chain IDs: `config/constants.ts`
- RPC URLs: `config/networks.ts`
- Contract addresses: `frontend/addresses.json`
- Token addresses: `config/constants.ts`

### 3. Logging
- Environment-aware logging via `utils/logger.ts`
- Debug mode controlled by `NEXT_PUBLIC_DEBUG`
- Specialized loggers for different contexts (tx, contract, wallet, api)

## Smart Contracts

### Deployed Contracts

| Contract | Purpose | Networks |
|----------|---------|----------|
| Swag1155 | ERC-1155 merchandise NFTs | Base, Ethereum, Unichain |
| FaucetManager | Multi-vault ETH faucet | Base, Ethereum, Unichain |
| ZKPassportNFT | Soulbound identity NFTs | Base, Ethereum, Unichain |

### Contract Addresses

Loaded from `frontend/addresses.json`:
```json
{
  "base": {
    "chainId": 8453,
    "addresses": {
      "Swag1155": "0x...",
      "FaucetManager": "0x...",
      "ZKPassportNFT": "0x..."
    }
  }
}
```

## Network Support

| Network | Chain ID | Gas Sponsorship | Explorer |
|---------|----------|-----------------|----------|
| Base | 8453 | Yes | basescan.org |
| Ethereum | 1 | Yes | etherscan.io |
| Optimism | 10 | Yes | optimistic.etherscan.io |
| Unichain | 130 | Yes | unichain.blockscout.com |

## External Dependencies

### Authentication & Wallets
- **Privy**: Authentication, embedded wallets, gas sponsorship

### Blockchain
- **Viem**: Low-level blockchain interactions
- **React Query**: Data fetching and caching

### Storage
- **Pinata**: IPFS pinning for NFT metadata

### UI
- **TailwindCSS**: Styling
- **Next.js**: React framework

## Security Considerations

1. **Private Keys**: Managed by Privy's secure infrastructure
2. **Gas Sponsorship**: Executed in Trusted Execution Environment (TEE)
3. **Admin Access**: Controlled via smart contract roles
4. **API Routes**: Server-side secrets never exposed to client
