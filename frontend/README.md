# Frontend Contract Integration

This directory contains contract ABIs and addresses for frontend integration across multiple networks.

## Structure

```
frontend/
├── contracts.json          # Multi-network config (all networks)
├── addresses.json          # All network addresses
├── contracts.ts           # TypeScript exports (multi-network)
├── abis/                  # Shared ABIs (same for all networks)
│   ├── ZKPassportNFT.json
│   ├── FaucetManager.json
│   └── Swag1155.json
├── base/                  # Base Mainnet specific files
│   ├── contracts.json
│   ├── addresses.json
│   └── contracts.ts
├── ethereum/                  # Ethereum Mainnet specific files
│   ├── contracts.json
│   ├── addresses.json
│   └── contracts.ts
├── unichain/                  # Unichain Mainnet specific files
│   ├── contracts.json
│   ├── addresses.json
│   └── contracts.ts
├── optimism/                  # Optimism Mainnet specific files
│   ├── contracts.json
│   ├── addresses.json
│   └── contracts.ts
```

## Usage Examples

### Multi-Network (Recommended)

```typescript
import { getAddresses, getContracts, DEFAULT_NETWORK } from './contracts';
import ZKPassportNFT_ABI from './abis/ZKPassportNFT.json';
import FaucetManager_ABI from './abis/FaucetManager.json';

// Get addresses for a specific network
const baseAddresses = getAddresses('base');
const ethereumAddresses = getAddresses('ethereum');
const unichainAddresses = getAddresses('unichain');

// Use with ethers.js
const nftContract = new ethers.Contract(
  baseAddresses.addresses.ZKPassportNFT,
  ZKPassportNFT_ABI,
  signer
);

const faucetContract = new ethers.Contract(
  baseAddresses.addresses.FaucetManager,
  FaucetManager_ABI,
  signer
);
```

### Single Network

```typescript
// Import from network-specific directory
import { ADDRESSES } from './base/contracts';
import ZKPassportNFT_ABI from './abis/ZKPassportNFT.json';

const contract = new ethers.Contract(ADDRESSES.ZKPassportNFT, ZKPassportNFT_ABI, signer);
```

### React with Wagmi (Multi-Chain)

```typescript
import { useContractRead } from 'wagmi';
import { getAddresses } from './contracts';
import ZKPassportNFT_ABI from './abis/ZKPassportNFT.json';

function MyComponent({ chainId }: { chainId: number }) {
  const network = chainId === 8453 ? 'base' : chainId === 1 ? 'ethereum' : chainId === 130 ? 'unichain' : chainId === 10 ? 'optimism' : 'base';
  const addresses = getAddresses(network);

  const { data } = useContractRead({
    address: addresses.addresses.ZKPassportNFT,
    abi: ZKPassportNFT_ABI,
    functionName: 'totalSupply',
  });

  return <div>Total Supply: {data?.toString()}</div>;
}
```

## Deployed Networks

- **Base Mainnet** (Chain ID: 8453)
  - ZKPassportNFT: `0x458eb490bf5f56b6ada8605c56bcef3510d83ec8`
  - FaucetManager: `0xbd7d12722008a6c2f89e3906a964cc2290131a92`
  - Swag1155: `0xd4218995da2e92323d33a6e38adc8ef3a671b456`

- **Ethereum Mainnet** (Chain ID: 1)
  - ZKPassportNFT: `0x607003f188c49ed6e0553805734b9990393402df`
  - FaucetManager: `0x2940e286b41d279b61e484b98a08498e355e4778`
  - Swag1155: `0xd9663db045850171850fd1298a2176b329a67928`

- **Unichain Mainnet** (Chain ID: 130)
  - ZKPassportNFT: `0x0499924492348159aa281385ace43539689e158b`
  - FaucetManager: `0xf32e10560673668ee849c44596d74502493c7fb1`
  - Swag1155: `0xb76a448715e3986a3a060e79598e9ffb78e792f6`

- **Optimism Mainnet** (Chain ID: 10)
  - ZKPassportNFT: `0x25b43ce10ffd04cb90123d7582e6b5100b27f9cb`
  - FaucetManager: `0x76235436cbd3f2ff12cc3610f2643654211efb3d`
  - Swag1155: `0x9df46e1c221f8b067343f9b760f5cb2c4757fe2d`

## Default Network

Default network: **Base Mainnet**
