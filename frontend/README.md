# Frontend Contract Integration

This directory contains contract ABIs and addresses for frontend integration across multiple networks.

## Structure

```
frontend/
├── contracts.json       # Multi-network config (all networks)
├── addresses.json       # All network addresses (single source of truth)
├── contracts.ts         # TypeScript exports (multi-network)
└── abis/               # Shared ABIs (same for all networks)
    ├── ZKPassportNFT.json
    ├── FaucetManager.json
    ├── Swag1155.json
    └── ERC20.json
```

## Usage Examples

### Multi-Network (Recommended)

```typescript
import { ADDRESSES, getAddresses } from './contracts';
import ZKPassportNFT_ABI from './abis/ZKPassportNFT.json';
import FaucetManager_ABI from './abis/FaucetManager.json';

// Get addresses for a specific network
const baseAddresses = getAddresses('base');
const ethereumAddresses = getAddresses('ethereum');
const unichainAddresses = getAddresses('unichain');

// Use with viem
import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';

const client = createPublicClient({ chain: base, transport: http() });

const nftBalance = await client.readContract({
  address: baseAddresses.addresses.ZKPassportNFT as `0x${string}`,
  abi: ZKPassportNFT_ABI,
  functionName: 'balanceOf',
  args: [userAddress],
});
```

### Using Network Utilities

```typescript
import { getChainConfig } from '@/utils/network';

// Get all config for a chain
const config = getChainConfig(8453); // Base

console.log(config.swag1155);       // Swag1155 address
console.log(config.faucetManager);  // FaucetManager address
console.log(config.zkpassport);     // ZKPassportNFT address
console.log(config.explorerUrl);    // Block explorer URL
```

### React Hook Integration

```typescript
import { useSwagAddresses } from '@/utils/network';

function MyComponent() {
  const { swag1155, faucetManager, zkpassport, chainId } = useSwagAddresses();

  // Addresses automatically update when user switches chains
  return <div>Current chain: {chainId}</div>;
}
```

## Deployed Networks

### Base Mainnet (Chain ID: 8453)
| Contract | Address |
|----------|---------|
| ZKPassportNFT | `0x9f0da2f66a0aa01bf4469a257f75fab088130b40` |
| FaucetManager | `0xbd532043af9f2e8090ad9b1fa14e45a5aaaef102` |
| Swag1155 | `0x9c2944f38156f6dfc922a825eba727a38895958e` |

### Ethereum Mainnet (Chain ID: 1)
| Contract | Address |
|----------|---------|
| ZKPassportNFT | `0x94b9f649f8825d5d797e37d04dfc66d612750b10` |
| FaucetManager | `0xb24295ffc0bd22b0b173b73a0ff5b42564986fd1` |
| Swag1155 | `0xeb27e63799ec91fb81617629b7f98d26af3f9686` |

### Unichain Mainnet (Chain ID: 130)
| Contract | Address |
|----------|---------|
| ZKPassportNFT | `0x12b5d5796556f0202fa241085409e2b357450d70` |
| FaucetManager | `0x246a2b1d53384e2972272a0f6bd017ecafdb3063` |
| Swag1155 | `0x71fdedc946fe8177a36216300fd5f3cb5d887587` |

## Updating Addresses

Contract addresses are stored in `addresses.json`. To update:

1. Deploy contracts using your deployment scripts
2. Update `addresses.json` with new addresses
3. Commit the changes to version control

**Important**: Do NOT hardcode addresses in `.env` files. Always use `addresses.json` as the single source of truth.

## Default Network

Default network: **Base Mainnet** (configurable via `NEXT_PUBLIC_DEFAULT_CHAIN_ID`)
