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
  - ZKPassportNFT: `0xa3f1150a8414b0383244e7c7936119e3e24d106d`
  - FaucetManager: `0x145d0d587bce7e390750cd67301e02478c51b48c`
  - Swag1155: `0xfc87358e017ec814fe94139af82e6f25b293d5b8`

- **Ethereum Mainnet** (Chain ID: 1)
  - ZKPassportNFT: `0x607003f188c49ed6e0553805734b9990393402df`
  - FaucetManager: `0x2940e286b41d279b61e484b98a08498e355e4778`
  - Swag1155: `0xd9663db045850171850fd1298a2176b329a67928`

- **Unichain Mainnet** (Chain ID: 130)
  - ZKPassportNFT: `0xc2ddade57815220833c31ecab6f6e9de9c69df09`
  - FaucetManager: `0xdf1be43ae0636ba6f9bc26f75ab6ba8d66a3ddc8`
  - Swag1155: `0x5811f284e340f6968bcffe2415e582e0eb429981`

- **Optimism Mainnet** (Chain ID: 10)
  - ZKPassportNFT: `0x607003f188c49ed6e0553805734b9990393402df`
  - FaucetManager: `0x2940e286b41d279b61e484b98a08498e355e4778`
  - Swag1155: `0xd9663db045850171850fd1298a2176b329a67928`

## Default Network

Default network: **Base Mainnet**
