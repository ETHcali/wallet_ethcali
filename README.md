# ETH Cali Wallet

A secure and easy-to-use Ethereum wallet application built with Next.js and Privy for authentication. This wallet allows users to access web3 easily with **native gas sponsorship by Privy**, supporting multiple tokens across Base, Ethereum, Optimism, and Unichain networks.

## 🌟 Features

### 🔐 **Easy Authentication**
- Login with email or passkey via Privy
- Automatic embedded wallet creation
- External wallet connection support
- ZKPassport personhood verification (scan QR with passport)
- Export private keys functionality

### 💰 **Multi-Token Support**
- **ETH**: Native Ethereum on all supported networks
- **USDC**: USD Coin (Native Circle USDC)
- **EURC**: Euro Coin (Circle's EUR stablecoin)

### 🚀 **Advanced Features**
- Real-time balance fetching from multiple networks
- **Privy native gas sponsorship** for all transactions
- QR code scanning for easy address input
- Transaction history with block explorer integration
- Responsive design with dark mode UI
- Beautiful modern UI with TailwindCSS
- **Universal transaction sponsorship** (NFTs, transfers, faucet claims, swag purchases)
- Multi-vault faucet system with admin controls
- ERC-1155 merchandise store with USDC payments
- IPFS integration via Pinata for NFT metadata

### 🔗 **Network Support**
- **Base Mainnet** (Chain ID: 8453) - Primary network with gas sponsorship
- **Ethereum Mainnet** (Chain ID: 1) - Gas sponsorship enabled
- **Optimism** (Chain ID: 10) - Gas sponsorship enabled  
- **Unichain** (Chain ID: 130) - Gas sponsorship enabled
- BaseScan, Etherscan, Optimistic Etherscan, and Blockscout explorer integration
- Real-time price data from CoinGecko API

## 🚀 Quick Start

### Prerequisites
- Node.js 24.x
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ETHcali/eth-cali-wallet.git
   cd eth-cali-wallet
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   Copy `env.example` to `.env.local` and configure:
   ```env
   # Required: Privy Configuration
   NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id
   PRIVY_APP_SECRET=your_privy_app_secret
   
   # Optional: Custom RPC Endpoints
   NEXT_PUBLIC_BASE_RPC_URL=https://mainnet.base.org
   NEXT_PUBLIC_MAINNET_RPC_URL=https://eth.llamarpc.com
   NEXT_PUBLIC_OPTIMISM_RPC_URL=https://mainnet.optimism.io
   NEXT_PUBLIC_UNICHAIN_RPC_URL=https://rpc.unichain.org
   
   # Optional: Pinata IPFS Configuration (for NFT metadata)
   PINATA_JWT=your_pinata_jwt_here
   PINATA_GATEWAY=https://gateway.pinata.cloud/ipfs
   NEXT_PUBLIC_PINATA_GATEWAY=https://gateway.pinata.cloud/ipfs
   
   # Optional: Admin Configuration
   NEXT_PUBLIC_ADMIN_ADDRESS=0x...
   ```

   **Note**: 
   - Gas sponsorship is configured through the [Privy Dashboard](https://dashboard.privy.io). Enable gas sponsorship and add credits for supported networks.
   - Contract addresses are loaded from `frontend/addresses.json` (auto-generated from deployments).

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

```
eth-cali-wallet/
├── components/
│   ├── shared/              # Reusable UI components (Layout, Button, Loading)
│   ├── wallet/              # Wallet-specific components (WalletInfo, SendTokenModal, QRScanner)
│   ├── faucet/              # Faucet functionality components (FaucetClaim, VaultList, Admin)
│   ├── sybil/               # ZKPassport verification components (SybilVerification)
│   ├── swag/                # Merchandise store components (ProductCard, ProductGroup, Admin)
│   ├── zkpassport/          # ZKPassport admin components
│   ├── Navigation.tsx       # Main navigation component
│   └── NetworkSwitcher.tsx  # Network switching component
├── pages/
│   ├── api/                 # Backend API endpoints
│   │   ├── check-personhood/    # Personhood verification API
│   │   ├── create-wallet.ts     # Wallet creation endpoint
│   │   ├── pinata/              # IPFS pinning endpoints
│   │   ├── register-personhood.ts
│   │   └── wallet-balance.ts
│   ├── index.tsx            # Landing page + Dashboard
│   ├── wallet.tsx           # Wallet interface
│   ├── faucet.tsx           # ETH faucet for verified users
│   ├── faucet/admin.tsx     # Faucet admin panel
│   ├── sybil/index.tsx      # ZKPassport sybil-resistance verification
│   ├── sybil/admin.tsx      # ZKPassport admin panel
│   ├── swag/index.tsx       # Merchandise store
│   └── swag/admin.tsx       # Swag store admin panel
├── hooks/                   # Custom React hooks
│   ├── useTokenBalances.ts  # Token balance fetching
│   ├── useTokenPrices.ts    # CoinGecko price fetching
│   ├── useActiveWallet.ts   # Active wallet management
│   ├── useSwagStore.ts      # Swag store state management
│   ├── useFaucetAdmin.ts    # Faucet admin operations
│   ├── useSwagAdmin.ts      # Swag admin operations
│   └── useZKPassportAdmin.ts # ZKPassport admin operations
├── utils/                   # Utility functions
│   ├── contracts.ts         # Smart contract interactions
│   ├── tokenUtils.ts        # Token formatting utilities
│   ├── network.ts           # Network configuration
│   ├── zkpassport.ts        # ZKPassport KYC integration
│   └── tokenGeneration.ts   # Token generation utilities
├── config/                  # Configuration files
│   ├── networks.ts          # Network definitions and token configs
│   └── wagmi.ts             # Wagmi configuration
├── lib/                     # Library integrations
│   ├── pinata.ts            # Pinata IPFS client
│   └── walletService.ts     # Wallet service utilities
├── types/                   # TypeScript definitions
│   ├── index.ts             # General types
│   ├── faucet.ts           # Faucet types
│   └── swag.ts             # Swag types
├── frontend/                # Contract ABIs and addresses
│   ├── abis/               # Smart contract ABIs
│   │   ├── ERC20.json
│   │   ├── FaucetManager.json
│   │   ├── FaucetVault.json
│   │   ├── Swag1155.json
│   │   └── ZKPassportNFT.json
│   ├── addresses.json      # Contract addresses by network
│   └── [network]/          # Network-specific contract configs
├── docs/                    # Documentation
│   ├── FAUCET_CONTRACT_REFERENCE.md
│   ├── SWAG1155_CONTRACT_REFERENCE.md
│   ├── ZKPASSPORT_CONTRACT_REFERENCE.md
│   └── SECURITY_ADMIN_GUIDE.md
├── public/                  # Static assets
│   ├── chains/             # Network logos
│   ├── images/            # Token images
│   └── infraused/         # Infrastructure partner logos
└── styles/                  # CSS and styling
    └── globals.css          # Global styles
```

## 💳 Supported Tokens

| Token | Contract Address | Decimals | Network |
|-------|------------------|----------|---------|
| **ETH** | Native | 18 | Base, Ethereum, Optimism, Unichain |
| **USDC** | `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` | 6 | Base |
| **USDC** | `0x7F5c764cBc14f9669B88837ca1490cCa17c31607` | 6 | Optimism |
| **USDC** | `0x078D782b760474a361dDA0AF3839290b0EF57AD6` | 6 | Unichain |
| **USDC** | `0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48` | 6 | Ethereum |
| **EURC** | `0x60a3E35Cc302bFA44Cb288Bc5a4F316Fdb1adb42` | 6 | Base |
| **EURC** | `0x1aBaEA1f7C830bD89Acc67eC4af516284b1bC33c` | 6 | Ethereum |

**🎯 All token transfers are gas-sponsored across supported networks!**

## 📋 Application Flow

### **1. Landing & Authentication** (`/` - index.tsx)
- Clean landing page with ETH CALI branding
- One-click authentication via Privy (email, passkey, or external wallet)
- Auto-redirect to wallet after authentication
- Features showcase and infrastructure partners

### **2. Main Modules**

**💳 Wallet Module** (`/wallet` - wallet.tsx)
- View token balances across multiple networks (ETH, USDC, EURC)
- Send tokens with gas sponsorship
- QR code scanner for easy address input
- Real-time balance updates
- Quick access to other services (Faucet, Identity, Swag)

**🚀 Faucet Module** (`/faucet` - faucet.tsx)  
- Multi-vault ETH faucet system
- Verified users only (requires ZKPassport NFT)
- One claim per vault
- Gas-sponsored claiming process
- Admin panel at `/faucet/admin` for vault management

**🔒 Identity Verification** (`/sybil` - sybil/index.tsx)
- ZKPassport identity verification using passport NFC
- Mint soulbound NFT proving unique personhood
- Zero-knowledge proof generation (face match + document verification)
- Gas-sponsored NFT minting
- Admin panel at `/sybil/admin` for metadata management

**🛍️ Swag Store** (`/swag` - swag/index.tsx)
- ERC-1155 merchandise store
- Purchase with USDC
- Product variants grouped by base product
- IPFS-hosted metadata and images
- Admin panel at `/swag/admin` for product management

### **3. User Journey**
1. **Connect**: User logs in with email, passkey, or external wallet
2. **Verify**: Complete ZKPassport verification to prove unique identity  
3. **Mint**: Receive soulbound NFT as proof of sybil-resistance
4. **Claim**: Access ETH faucet with verified identity
5. **Shop**: Browse and purchase ETH CALI merchandise
6. **Transact**: Send tokens with zero gas fees across networks

## 🛠️ Tech Stack

- **Framework**: Next.js 14.x with TypeScript
- **Styling**: TailwindCSS with dark mode support  
- **Authentication**: Privy (Email, Passkey, External Wallets)
- **Gas Sponsorship**: Privy Native Gas Sponsorship with TEE
- **Personhood**: ZKPassport SDK with QR scanning
- **Blockchain**: Viem, Wagmi, Multi-network support (Base, Ethereum, Optimism, Unichain)
- **State Management**: Zustand, React Query (TanStack Query)
- **IPFS**: Pinata for NFT metadata storage
- **Price Data**: CoinGecko API
- **Deployment**: Vercel

## 🚀 Deployment

### Vercel Deployment

1. **Connect to Vercel:**
   ```bash
   npm install -g vercel
   vercel link
   ```

2. **Set Environment Variables** in Vercel Dashboard:
- `NEXT_PUBLIC_PRIVY_APP_ID` (required)
- `PRIVY_APP_SECRET` (required, server-side only)
- `PINATA_JWT` (optional, for NFT metadata)
- `NEXT_PUBLIC_PINATA_GATEWAY` (optional)
- `NEXT_PUBLIC_ADMIN_ADDRESS` (optional, for admin features)
- Custom RPC URLs (optional, for better performance)

**Gas Sponsorship Setup:**
- Enable gas sponsorship in [Privy Dashboard](https://dashboard.privy.io)
- Configure supported networks (Base, Ethereum, Optimism, Unichain)
- Add sponsorship credits to your account balance

3. **Deploy:**
   ```bash
   vercel --prod
   ```

### Live Demo
🌐 **[wallet.ethcali.org](https://wallet.ethcali.org)**

## 🔐 Security Features

- **TEE Execution**: Trusted Execution Environment for secure sponsorship
- **Embedded Wallets**: Secure key management via Privy
- **Universal Gas Sponsorship**: Privy's native sponsorship infrastructure
- **Multi-Network Security**: Secure transactions across multiple blockchains
- **Contract Verification**: All token contracts verified on block explorers

## 🛠️ Development Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm start           # Start production server

# Code Quality
npm run lint        # Run ESLint

# Cleanup
npm run clean       # Remove node_modules, package-lock.json, and .next
npm run clean:cache # Remove .next cache only
npm run clean:install # Clean and reinstall dependencies
npm run clean:build   # Clean, install, and build
npm run rebuild       # Clear cache and rebuild
```

## 📚 API Endpoints

The application includes several API endpoints for backend functionality:

- `POST /api/create-wallet` - Create embedded wallet
- `GET /api/wallet-balance` - Get wallet balance
- `POST /api/register-personhood` - Register personhood verification
- `GET /api/check-personhood/[uniqueIdentifier]` - Check personhood status
- `POST /api/pinata/pin-image` - Pin image to IPFS via Pinata
- `POST /api/pinata/pin-json` - Pin JSON metadata to IPFS via Pinata

## 📖 Documentation

Comprehensive documentation is available in the `docs/` directory:

- [Faucet Contract Reference](./docs/FAUCET_CONTRACT_REFERENCE.md) - Complete FaucetManager API
- [Swag1155 Contract Reference](./docs/SWAG1155_CONTRACT_REFERENCE.md) - Merchandise store contract
- [ZKPassport Contract Reference](./docs/ZKPASSPORT_CONTRACT_REFERENCE.md) - Identity NFT contract
- [Security & Admin Guide](./docs/SECURITY_ADMIN_GUIDE.md) - Admin roles and security procedures
- [Frontend Integration Guide](./docs/SWAG1155_FRONTEND.md) - Frontend integration examples

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

ISC License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **GitHub**: [https://github.com/ETHcali/eth-cali-wallet](https://github.com/ETHcali/eth-cali-wallet)
- **Live Demo**: [https://wallet.ethcali.org](https://wallet.ethcali.org)
- **ETH CALI**: [Learn more about ETH CALI](https://ethcali.org)

## 💡 About ETH CALI

This wallet is proudly sponsored by ETH CALI, making web3 accessible to everyone through gas-free transactions and easy-to-use interfaces.

---

**Built with ❤️ by the ETH CALI community** 
