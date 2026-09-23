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
│   ├── swag/            # Merchandise store (Ethereum mainnet, USDC only)
│   │   ├── SwagCard.tsx          # One design: photo, USD + COP, both stocks, two buttons
│   │   ├── SwagCheckoutModal.tsx # Connect → Switch to Ethereum → Approve → Buy, then shipping
│   │   ├── ShippingForm.tsx      # POST /api/swag/orders after a confirmed buy
│   │   ├── HashChip.tsx          # 0x55C9…711d with copy + Basescan link
│   │   ├── AdminPrimitives.tsx   # TxButton (two flags), ChainGate, AddressForm
│   │   ├── AdminOrders.tsx       # /swag/admin › Orders: ship, deliver, cancel, cancel voucher on chain
│   │   ├── AdminStock.tsx        # /swag/admin › Stock: setVariant caps, setPaymentOption
│   │   └── AdminCollection.tsx   # /swag/admin › Collection: pause, treasury, roles
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
│   │   ├── client.ts             # SWAG, SWAG_CHAIN, the registry client for the collection's chain, USDC ABI, query keys
│   │   ├── useSwagCatalogue.ts   # Supabase anon read: products + the live collection's variant + Shopify variants
│   │   ├── useSwagOnchain.ts     # One multicall: remainingOnchain, getTokenPrice, canBuy, paused
│   │   ├── useBuySwag.ts         # Four-state USDC flow, two flags per step, sponsored
│   │   ├── useMySwag.ts          # balanceOfBatch + my orders
│   │   ├── useSwagOrders.ts      # GET/POST /api/swag/orders with the Privy token
│   │   ├── useSwagAdmin.ts       # /swag/admin: orders, summary, stock, collection state, useSwagAdminTx
│   │   ├── useTrm.ts             # One shared /api/fx/trm read
│   │   ├── useSwagLocale.ts      # es/en copy selection
│   │   ├── swagErrors.ts         # decodeErrorResult against the typed ABI → es/en copy
│   │   └── useSwagArtwork.ts     # Admin artwork pipeline
│   ├── ens/, donations/, content/
│   ├── useActiveWallet.ts
│   ├── useRequireChain.ts        # { ready, switching, switchTo } for a chain-pinned feature
│   ├── useAdminStatus.ts
│   ├── useBalances.ts
│   ├── useSwapQuote.ts
│   ├── useTokenPrices.ts
│   ├── useTokenTransfer.ts
│   ├── useUserNFTs.ts
│   ├── useZKPassportAdmin.ts
│   ├── useZKPassportNFT.ts
│   └── useZKPassportVerification.ts
│
├── lib/                 # Server-side integrations
│   ├── swag/
│   │   ├── onchain.ts      # SWAG_CHAIN_ID + the server's client: findPurchased / findClaimed logs
│   │   ├── orders.ts       # swag_orders reads/writes with the service role
│   │   ├── voucher.ts      # EIP-712 `Claim` signing (ETHCaliSwag v1), 7-day deadline
│   │   ├── requireUser.ts  # Privy token → DID → linked wallets and verified emails
│   │   └── requireSwagAdmin.ts  # requireUser + isAdmin() on the collection
│   ├── shopify.mjs         # client-credentials token, gql(), fetchTrm / copPrice / repriceDesign
│   ├── adminAuth.ts, supabase.ts, pinata.ts, lifi.ts, returnTo.ts
│
├── utils/               # Utility functions
│   ├── contracts.ts    # Contract interaction helpers
│   ├── explorer.ts     # Block explorer URLs
│   ├── tokenUtils.ts   # Token formatting
│   ├── ens.ts, donationErrors.ts
│   ├── zkpassport.ts   # ZKPassport utilities
│   └── logger.ts       # Logging utility
│
├── config/              # Configuration
│   ├── constants.ts    # App-wide constants, SWAG_COLLECTION, ENS_CONFIG, SWAG_SHOPIFY_STORE
│   └── chains.ts       # The chain registry: ETHEREUM (default) + ENS_CHAIN (Base, registrar only)
│
├── frontend/            # Contract bindings, synced from scs-ethcali (npm run sync:contracts)
│   ├── abis/           # ABI JSON + abis/swag.ts (typed `as const` Swag1155 ABI)
│   ├── addresses.json  # Per-network addresses
│   ├── contracts.ts    # `as const` CONTRACTS + ADDRESSES
│   ├── swag-collection.json  # The live ETHCALI-SWAG-2026 clone: chainId 1, address, usdc
│   └── CONTRACTS_SOURCE.json # { repo, commit, generatedAt } of the last sync
│
├── pages/               # Next.js pages
│   ├── api/
│   │   ├── swag/orders.ts, swag/claim.ts, swag/variants.ts
│   │   ├── swag/admin/orders/index.ts, swag/admin/orders/[id].ts, swag/admin/summary.ts
│   │   ├── shopify/webhook.ts     # orders/paid + refunds/create
│   │   ├── cron/swag-prices.ts    # daily Shopify re-price (vercel.json, 12:00 UTC)
│   │   ├── fx/trm.ts, indexer/sync.ts, pinata/, poap/, ens/, cms/, donations/
│   ├── index.tsx       # Landing page
│   ├── wallet.tsx      # Wallet page
│   ├── faucet.tsx      # Faucet page
│   ├── faucet/admin.tsx
│   ├── swag/index.tsx  # Public storefront
│   ├── swag/orders.tsx # My NFTs + my orders (signed in)
│   ├── swag/claim.tsx  # Claim a card order's NFT with the server-signed voucher
│   ├── swag/admin.tsx
│   ├── sybil/index.tsx
│   └── sybil/admin.tsx
│
├── types/               # TypeScript types
│   ├── index.ts
│   ├── faucet.ts
│   ├── swag.ts
│   ├── swag-orders.ts  # SwagOrder, ClaimVoucherFields, StoredVoucher
│   └── zkpassport.ts
│
├── scripts/             # sync-contracts, swag-pin, swag-seed-supabase, shopify-*, swag-voucher-selftest
│
└── docs/                # Documentation (see docs/README.md)
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
- RPC URLs: `config/chains.ts`
- Contract addresses: `frontend/addresses.json`
- Token addresses: `config/constants.ts`

### 3. Logging
- Environment-aware logging via `utils/logger.ts`
- Debug mode controlled by `NEXT_PUBLIC_DEBUG`
- Specialized loggers for different contexts (tx, contract, wallet, api)

## Smart Contracts

### Deployed Contracts

| Contract | Purpose | Network the app uses |
|----------|---------|----------------------|
| Swag1155 | ERC-1155 merchandise NFTs (clone `ETHCALI-SWAG-2026`, USDC only) | Ethereum mainnet (`0x5a1012486764c217a20B5D1b97508E1de83179E7`) |
| DonationVault + DonationReceipt1155 | Campaign donations in ETH/USDC, soulbound receipts | Ethereum mainnet |
| FaucetManager | Multi-vault ETH faucet | Ethereum mainnet |
| ZKPassportNFT | Soulbound identity NFTs | Ethereum mainnet |
| Durin L2Registrar / L2Registry | `<label>.ethcali.eth` subnames | Base — the one exception |

Other deployments in `frontend/addresses.json` (Base, Optimism, Unichain, Celo) are not offered by this app.

### Contract Addresses

Loaded from `frontend/addresses.json` (synced from scs-ethcali):
```json
{
  "ethereum": {
    "chainId": 1,
    "addresses": {
      "SwagFactory": "0x...",
      "FaucetManager": "0x...",
      "ZKPassportNFT": "0x..."
    }
  }
}
```

The Swag1155 collection is a clone created by `SwagFactory`, so it is not in
`addresses.json`; it lives in `frontend/swag-collection.json` (written by
`scripts/sync-contracts.mjs`, `SWAG_CHAIN=ethereum`) and is exposed as
`SWAG_COLLECTION` from `config/constants.ts`.

## Network Support

| Network | Chain ID | Role | Explorer |
|---------|----------|------|----------|
| Ethereum | 1 | The chain. Default, every feature. | etherscan.io |
| Base | 8453 | `ethcali.eth` registrar only; switched to lazily by the ENS claim | basescan.org |

There is no multi-chain UI. Adding a chain is a deliberate future change.

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
