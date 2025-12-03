# ETH Cali Wallet.

A secure and easy-to-use Ethereum wallet application built with Next.js and Privy for authentication. This wallet allows users to access web3 easily with gas fees sponsored by ETH CALI, supporting multiple tokens on the Optimism network.

## 🌟 Features

### 🔐 **Easy Authentication**
- Login with email via Privy
- Automatic embedded wallet creation
- ZKPassport personhood verification (scan QR with passport)
- Export private keys functionality

### 💰 **Multi-Token Support**
- **ETH**: Native Ethereum on Base
- **USDC**: USD Coin (Native Circle USDC)
- **EURC**: Euro Coin (Circle's EUR stablecoin)

### 🚀 **Advanced Features**
- Real-time balance fetching from Optimism blockchain
- Gas-sponsored transactions via Biconomy
- QR code scanning for easy address input
- Transaction history with Etherscan integration
- Responsive design with dark/light mode support
- Beautiful modern UI with TailwindCSS

### 🔗 **Network Support**
- Base Mainnet (Chain ID: 8453)
- Ethereum Mainnet (Chain ID: 1)
- BaseScan integration
- Real-time price data from CoinGecko

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ETHcali/ethcaliwallet.git
   cd ethcaliwallet
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   Create a `.env.local` file with your configuration:
   ```env
   NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id
   NEXT_PUBLIC_BICONOMY_API_KEY=your_biconomy_api_key
   NEXT_PUBLIC_BICONOMY_PAYMASTER_URL=your_paymaster_url
   NEXT_PUBLIC_BICONOMY_PAYMASTER_ID=your_paymaster_id
   NEXT_PUBLIC_BICONOMY_BUNDLER_URL=your_bundler_url
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

```
ethcaliwallet/
├── components/
│   ├── shared/           # Reusable UI components
│   └── wallet/           # Wallet-specific components
├── pages/
│   ├── api/             # Backend API endpoints
│   ├── index.tsx        # Landing page
│   └── simple-wallet.tsx # Main wallet interface
├── hooks/               # Custom React hooks
│   ├── useTokenBalances.ts
│   └── useTokenPrices.ts
├── utils/               # Utility functions
│   ├── api.ts
│   ├── tokenUtils.ts
│   └── zkpassport.ts    # ZKPassport KYC integration
├── types/               # TypeScript definitions
├── lib/                 # Core library functions
├── public/              # Static assets
└── styles/              # CSS and styling
```

## 💳 Supported Tokens

| Token | Contract Address | Decimals | Network |
|-------|------------------|----------|---------|
| **ETH** | Native | 18 | Base |
| **USDC** | `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` | 6 | Base |
| **EURC** | `0x60a3E35Cc302bFA44Cb288Bc5a4F316Fdb1adb42` | 6 | Base |
| **EURC** | `0x1aBaEA1f7C830bD89Acc67eC4af516284b1bC33c` | 6 | Ethereum |

## 🔧 Key Technologies

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: TailwindCSS with dark mode support
- **Authentication**: Privy (Email)
- **Personhood**: ZKPassport SDK with QR scanning
- **Blockchain**: Viem, Base Network
- **Gas Sponsorship**: Biconomy Account Abstraction
- **Deployment**: Vercel

## 🚀 Deployment

### Vercel Deployment

1. **Connect to Vercel:**
   ```bash
   npm install -g vercel
   vercel link
   ```

2. **Set Environment Variables** in Vercel Dashboard:
   - `NEXT_PUBLIC_PRIVY_APP_ID`
   - `NEXT_PUBLIC_BICONOMY_API_KEY`
   - `NEXT_PUBLIC_BICONOMY_PAYMASTER_URL`
   - `NEXT_PUBLIC_BICONOMY_PAYMASTER_ID`
   - `NEXT_PUBLIC_BICONOMY_BUNDLER_URL`

3. **Deploy:**
   ```bash
   vercel --prod
   ```

### Live Demo
🌐 **[papayapp.vercel.app](https://papayapp.vercel.app)**

## 🔐 Security Features

- **Embedded Wallets**: Secure key management via Privy
- **Account Abstraction**: Gas sponsorship for seamless UX
- **Contract Verification**: All token contracts verified on Etherscan
- **Secure Transactions**: Proper ABI encoding and validation

## 🛠️ Development Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm start           # Start production server

# Code Quality
npm run lint        # Run ESLint
npm run type-check  # TypeScript type checking
```

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

- **GitHub**: [https://github.com/ETHcali/ethcaliwallet](https://github.com/ETHcali/ethcaliwallet)
- **Live Demo**: [https://papayapp.vercel.app](https://papayapp.vercel.app)
- **ETH CALI**: [Learn more about ETH CALI](https://ethcali.org)

## 💡 About ETH CALI

This wallet is proudly sponsored by ETH CALI, making web3 accessible to everyone through gas-free transactions and easy-to-use interfaces.

---

**Built with ❤️ by the ETH CALI community** 
