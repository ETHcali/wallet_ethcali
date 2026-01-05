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
│   ├── SponsorContract.json
│   └── FaucetVault.json
├── base/                  # Base Mainnet specific files
│   ├── contracts.json
│   ├── addresses.json
│   └── contracts.ts
└── unichain/              # Unichain Mainnet specific files
    ├── contracts.json
    ├── addresses.json
    └── contracts.ts
```

## Usage Examples

### Multi-Network (Recommended)

```typescript
import { getAddresses, getContracts, DEFAULT_NETWORK } from './contracts';
import ZKPassportNFT_ABI from './abis/ZKPassportNFT.json';

// Get addresses for a specific network
const baseAddresses = getAddresses('base');
const unichainAddresses = getAddresses('unichain');

// Use with ethers.js
const contract = new ethers.Contract(
  baseAddresses.addresses.ZKPassportNFT,
  ZKPassportNFT_ABI,
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
  const network = chainId === 8453 ? 'base' : chainId === 130 ? 'unichain' : 'base';
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

- **Unichain Mainnet** (Chain ID: 130)
- **Base Mainnet** (Chain ID: 8453)

## Default Network

Default network: **Unichain Mainnet**
