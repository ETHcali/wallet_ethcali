# ETHcali Smart Contracts

Identity, faucet, and merchandise contracts for the ETHcali ecosystem on Base, Ethereum, and Unichain.

## Contracts

| Contract | Description |
|----------|-------------|
| **ZKPassportNFT** | Soulbound ERC721 — verified identity via ZKPassport |
| **FaucetManager** | Multi-vault ETH faucet with optional ZKPassport & token gating |
| **Swag1155** | ERC-1155 merchandise store with USDC payments & royalty distribution |

## Setup

```bash
npm install
cp .env.example .env   # Fill in your keys
```

### `.env` variables

```bash
PRIVATE_KEY=0x...

# Admins (set at deployment)
SWAG_ADMIN=0x...
FAUCET_ADMIN=0x...
ZK_PASSPORT_ADMIN=0x...
SWAG_TREASURY_ADDRESS=0x...

# RPC
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/YOUR_KEY
BASE_RPC_URL=https://base-mainnet.infura.io/v3/YOUR_KEY
UNICHAIN_RPC_URL=https://unichain-mainnet.infura.io/v3/YOUR_KEY

# Verification
ETHERSCAN_API_KEY=...
BASESCAN_API_KEY=...
UNICHAIN_API_KEY=...

# USDC (network-specific)
USDC_ADDRESS_ETH=0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48
USDC_ADDRESS_BASE=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
USDC_ADDRESS_UNI=0x078D782b760474a361dDA0AF3839290b0EF57AD6
```

## Commands

```bash
npm run compile          # Compile contracts
npm test                 # Run all 88 tests

npm run deploy:base      # Deploy to Base
npm run deploy:ethereum  # Deploy to Ethereum
npm run deploy:unichain  # Deploy to Unichain
npm run deploy:optimism  # Deploy to Optimism

npm run verify:base      # Verify on Basescan
npm run verify:ethereum  # Verify on Etherscan
npm run verify:unichain  # Verify on Uniscan
npm run verify:optimism  # Verify on Optimism Etherscan

npm run setup:frontend   # Generate ABIs & addresses for frontend
```

## Documentation

Per-contract API references and admin guide live in [`docs/`](docs/):

- [ZKPassportNFT Reference](docs/ZKPASSPORT_CONTRACT_REFERENCE.md)
- [FaucetManager Reference](docs/FAUCET_CONTRACT_REFERENCE.md)
- [Swag1155 Reference](docs/SWAG1155_CONTRACT_REFERENCE.md)
- [Security & Admin Guide](docs/SECURITY_ADMIN_GUIDE.md)

## Networks

| Network | Chain ID |
|---------|----------|
| Ethereum Mainnet | 1 |
| Base Mainnet | 8453 |
| Unichain Mainnet | 130 |
| Optimism Mainnet | 10 |

## License

MIT
