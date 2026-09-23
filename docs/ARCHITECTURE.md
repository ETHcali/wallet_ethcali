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
│  │  useTokenBalances, useFaucetAdmin, useZKPassportNFT, useBuySwag   │ │
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
│   ├── swag/            # Merchandise store (Base only, USDC only)
│   │   ├── SwagCard.tsx          # One design: photo, USD + COP, both stocks, two buttons
│   │   ├── SwagCheckoutModal.tsx # Connect → Switch to Base → Approve → Buy, then shipping
│   │   ├── ShippingForm.tsx      # POST /api/swag/orders after a confirmed buy
│   │   ├── HashChip.tsx          # 0x55C9…711d with copy + Basescan link
│   │   └── AdminManagement.tsx
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
│   │   ├── client.ts             # Base public client, USDC ABI, query keys
│   │   ├── useSwagCatalogue.ts   # Supabase anon read: products + Base variant + Shopify variants
│   │   ├── useSwagOnchain.ts     # One multicall: remainingOnchain, getTokenPrice, canBuy, paused
│   │   ├── useBuySwag.ts         # Four-state USDC flow, two flags per step, sponsored
│   │   ├── useMySwag.ts          # balanceOfBatch + my orders
│   │   ├── useSwagOrders.ts      # GET/POST /api/swag/orders with the Privy token
│   │   ├── useTrm.ts             # One shared /api/fx/trm read
│   │   ├── useSwagLocale.ts      # es/en copy selection
│   │   ├── swagErrors.ts         # decodeErrorResult against the typed ABI → es/en copy
│   │   └── useSwagArtwork.ts     # Admin artwork pipeline
│   ├── ens/            # ENS hooks
│   ├── useActiveWallet.ts
│   ├── useRequireChain.ts        # { ready, switching, switchTo } for a chain-pinned feature
│   ├── useContractAdmin.ts
│   ├── useFaucetAdmin.ts
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
│   ├── zkpassport.ts   # ZKPassport utilities
│   └── logger.ts       # Logging utility
│
├── config/              # Configuration
│   ├── constants.ts    # App-wide constants
│   └── networks.ts     # Network/chain configs
│
├── frontend/            # Contract bindings, synced from scs-ethcali (npm run sync:contracts)
│   ├── abis/           # ABI JSON + abis/swag.ts (typed `as const` Swag1155 ABI)
│   ├── addresses.json  # Per-network addresses
│   ├── contracts.ts    # `as const` CONTRACTS + ADDRESSES
│   ├── swag-collection.json  # The live ETHCALI-SWAG-2026 clone on Base
│   └── CONTRACTS_SOURCE.json # { repo, commit, generatedAt } of the last sync
│
├── pages/               # Next.js pages
│   ├── api/            # API routes
│   ├── index.tsx       # Landing page
│   ├── wallet.tsx      # Wallet page
│   ├── faucet.tsx      # Faucet page
│   ├── faucet/admin.tsx
│   ├── swag/index.tsx  # Public storefront
│   ├── swag/orders.tsx # My NFTs + my orders (signed in)
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
| Swag1155 | ERC-1155 merchandise NFTs (clone `ETHCALI-SWAG-2026`, USDC only) | Base only |
| FaucetManager | Multi-vault ETH faucet | Base, Ethereum, Unichain |
| ZKPassportNFT | Soulbound identity NFTs | Base, Ethereum, Unichain |

### Contract Addresses

Loaded from `frontend/addresses.json` (synced from scs-ethcali):
```json
{
  "base": {
    "chainId": 8453,
    "addresses": {
      "SwagFactory": "0x...",
      "FaucetManager": "0x...",
      "ZKPassportNFT": "0x..."
    }
  }
}
```

The Swag1155 collection is a clone created by `SwagFactory`, so it is not in
`addresses.json`; it lives in `frontend/swag-collection.json` and is exposed as
`SWAG_COLLECTION_BASE` from `config/constants.ts`.

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
