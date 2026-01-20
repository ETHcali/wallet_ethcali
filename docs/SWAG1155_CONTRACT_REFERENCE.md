# Swag1155 Contract Reference

**Complete API reference** for frontend integration with the Swag1155 ERC-1155 smart contract.

**Contract**: `contracts/Swag1155.sol`
**Version**: 2.1 (with Redemption Flow)
**Last Updated**: January 2026

---

## Table of Contents

1. [Overview](#overview)
2. [UI Components Map](#ui-components-map)
3. [Data Structures](#data-structures)
4. [State Variables](#state-variables)
5. [Admin Functions](#admin-functions)
6. [User Functions](#user-functions)
7. [View Functions](#view-functions)
8. [Events](#events)
9. [Error Messages](#error-messages)
10. [Frontend Integration Examples](#frontend-integration-examples)

---

## Overview

Swag1155 is an ERC-1155 multi-token contract for managing physical merchandise (swag) with:
- **USDC payments** (6 decimals)
- **Role-based access** (DEFAULT_ADMIN_ROLE, ADMIN_ROLE)
- **Per-token metadata** (IPFS URIs)
- **Physical redemption tracking** (3-state flow)

### Role Hierarchy

| Role | Can Do | Granted By |
|------|--------|------------|
| `DEFAULT_ADMIN_ROLE` | Add/remove admins, set treasury, set USDC | Contract deployer |
| `ADMIN_ROLE` | Create products, set variants, mark fulfillment | DEFAULT_ADMIN_ROLE |

---

## UI Components Map

### Admin Dashboard

```
┌─────────────────────────────────────────────────────────────────┐
│                     ADMIN - SWAG MANAGEMENT                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ [+ Create Product]  ←── setVariantWithURI()             │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ PRODUCT: ETH Cali Tee - Black                           │    │
│  │ Price: $25 | Stock: 45/100 | Active: Yes                │    │
│  │                                                          │    │
│  │ [Edit Price]   [Edit Stock]   [Toggle Active]           │    │
│  │      ↓              ↓              ↓                    │    │
│  │ setVariant()   setVariant()   setVariant()              │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ PENDING REDEMPTIONS                                      │    │
│  │ ┌─────────────────────────────────────────────────────┐ │    │
│  │ │ Token #1001 | Owner: 0x123... | Requested: Jan 15   │ │    │
│  │ │ Shipping: John Doe, 123 Main St...                  │ │    │
│  │ │ [Mark Shipped]  ←── markFulfilled()                 │ │    │
│  │ └─────────────────────────────────────────────────────┘ │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### User Store

```
┌─────────────────────────────────────────────────────────────────┐
│                        SWAG STORE                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │ [Product Image] │  │ [Product Image] │  │ [Product Image] │  │
│  │ ETH Cali Tee    │  │ ETH Cali Hoodie │  │ ETH Cali Cap    │  │
│  │ $25.00          │  │ $50.00          │  │ $20.00          │  │
│  │ 55 left         │  │ SOLD OUT        │  │ 12 left         │  │
│  │                 │  │                 │  │                 │  │
│  │ Size: [S][M][L] │  │                 │  │ Size: [One]     │  │
│  │ Qty:  [1]       │  │                 │  │ Qty:  [1]       │  │
│  │                 │  │                 │  │                 │  │
│  │ [Buy Now]       │  │ [Notify Me]     │  │ [Buy Now]       │  │
│  │     ↓           │  │                 │  │     ↓           │  │
│  │ approve() +     │  │                 │  │ approve() +     │  │
│  │ buy()           │  │                 │  │ buy()           │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### User - My NFTs & Redemption

```
┌─────────────────────────────────────────────────────────────────┐
│                         MY SWAG NFTs                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ ETH Cali Tee - Black - Size M                           │    │
│  │ Token ID: #1001                                          │    │
│  │ Status: Not Redeemed                                     │    │
│  │                                                          │    │
│  │ [Redeem Physical Item]  ←── redeem()                    │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ ETH Cali Cap - One Size                                  │    │
│  │ Token ID: #2005                                          │    │
│  │ Status: Awaiting Shipment                                │    │
│  │                                                          │    │
│  │ [Pending...]  (disabled)                                │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ ETH Cali Hoodie - Black - Size L                        │    │
│  │ Token ID: #3003                                          │    │
│  │ Status: Shipped                                          │    │
│  │                                                          │    │
│  │ [Shipped!]  (badge)                                     │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Button-to-Function Mapping

| UI Button | Contract Function | Who Can Use | Parameters |
|-----------|-------------------|-------------|------------|
| **[Create Product]** | `setVariantWithURI()` | Admin | tokenId, price, maxSupply, active, uri |
| **[Edit Price]** | `setVariant()` | Admin | tokenId, newPrice, maxSupply, active |
| **[Edit Stock]** | `setVariant()` | Admin | tokenId, price, newMaxSupply, active |
| **[Toggle Active]** | `setVariant()` | Admin | tokenId, price, maxSupply, !active |
| **[Mark Shipped]** | `markFulfilled()` | Admin | tokenId, ownerAddress |
| **[Buy Now]** | `approve()` + `buy()` | User | tokenId, quantity |
| **[Redeem Physical]** | `redeem()` | User | tokenId |

---

## Data Structures

### Variant

Stores product variant information (price, supply, status).

```solidity
struct Variant {
    uint256 price;      // USDC price in base units (6 decimals)
    uint256 maxSupply;  // Maximum available stock
    uint256 minted;     // Already sold/minted count
    bool active;        // Whether variant is available for purchase
}
```

**Frontend usage:**
```typescript
interface Variant {
  price: bigint;      // e.g., 25000000n = 25 USDC
  maxSupply: bigint;  // e.g., 100n
  minted: bigint;     // e.g., 45n
  active: boolean;    // e.g., true
}

// Calculate available stock
const available = Number(variant.maxSupply - variant.minted);

// Convert price to display
const priceUSD = Number(variant.price) / 1e6; // 25.00
```

---

### RedemptionStatus

Tracks physical item claim status.

```solidity
enum RedemptionStatus {
    NotRedeemed,        // 0 - User hasn't claimed yet
    PendingFulfillment, // 1 - User claimed, waiting for shipment
    Fulfilled           // 2 - Admin verified shipment complete
}
```

**Frontend usage:**
```typescript
enum RedemptionStatus {
  NotRedeemed = 0,
  PendingFulfillment = 1,
  Fulfilled = 2,
}

const statusLabels: Record<RedemptionStatus, string> = {
  [RedemptionStatus.NotRedeemed]: 'Not Redeemed',
  [RedemptionStatus.PendingFulfillment]: 'Awaiting Shipment',
  [RedemptionStatus.Fulfilled]: 'Shipped',
};
```

---

## State Variables

### Public Variables

| Variable | Type | Description | Frontend Read |
|----------|------|-------------|---------------|
| `usdc` | `address` | USDC token contract address | `useReadContract({ functionName: 'usdc' })` |
| `treasury` | `address` | Address receiving USDC payments | `useReadContract({ functionName: 'treasury' })` |
| `variants` | `mapping(uint256 => Variant)` | Product variant data by tokenId | `useReadContract({ functionName: 'variants', args: [tokenId] })` |
| `redemptions` | `mapping(uint256 => mapping(address => RedemptionStatus))` | Redemption status by tokenId and owner | `useReadContract({ functionName: 'redemptions', args: [tokenId, owner] })` |

### Role Constants

| Constant | Value | Description |
|----------|-------|-------------|
| `DEFAULT_ADMIN_ROLE` | `0x00` | Super admin role (can manage admins) |
| `ADMIN_ROLE` | `keccak256("ADMIN_ROLE")` | Product admin role |

---

## Admin Functions

### addAdmin

Grants ADMIN_ROLE to a new address.

```solidity
function addAdmin(address admin) external onlyRole(DEFAULT_ADMIN_ROLE)
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `admin` | `address` | Address to grant admin role |

**Requirements:**
- Caller must have `DEFAULT_ADMIN_ROLE`
- `admin` cannot be zero address

**Emits:** `AdminAdded(address indexed admin)`

**Frontend:**
```typescript
await writeContract({
  address: swag1155,
  abi: Swag1155ABI,
  functionName: 'addAdmin',
  args: ['0x1234...'],
});
```

---

### removeAdmin

Revokes ADMIN_ROLE from an address.

```solidity
function removeAdmin(address admin) external onlyRole(DEFAULT_ADMIN_ROLE)
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `admin` | `address` | Address to revoke admin role |

**Requirements:**
- Caller must have `DEFAULT_ADMIN_ROLE`

**Emits:** `AdminRemoved(address indexed admin)`

---

### setTreasury

Updates the treasury address receiving USDC payments.

```solidity
function setTreasury(address newTreasury) external onlyRole(DEFAULT_ADMIN_ROLE)
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `newTreasury` | `address` | New treasury wallet address |

**Requirements:**
- Caller must have `DEFAULT_ADMIN_ROLE`
- `newTreasury` cannot be zero address

**Emits:** `TreasuryUpdated(address indexed newTreasury)`

---

### setUSDC

Updates the USDC token contract address.

```solidity
function setUSDC(address newUSDC) external onlyRole(DEFAULT_ADMIN_ROLE)
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `newUSDC` | `address` | New USDC token contract address |

**Requirements:**
- Caller must have `DEFAULT_ADMIN_ROLE`
- `newUSDC` cannot be zero address

**Emits:** `USDCUpdated(address indexed newUSDC)`

---

### setVariant

Creates or updates a product variant.

```solidity
function setVariant(
    uint256 tokenId,
    uint256 price,
    uint256 maxSupply,
    bool active
) external onlyRole(ADMIN_ROLE)
```

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `tokenId` | `uint256` | Unique identifier for this variant | `1001` (product 100, size S) |
| `price` | `uint256` | Price in USDC base units (6 decimals) | `25000000` = 25 USDC |
| `maxSupply` | `uint256` | Maximum available stock | `50` |
| `active` | `bool` | Whether available for purchase | `true` |

**Requirements:**
- Caller must have `ADMIN_ROLE`
- `maxSupply` must be >= current `minted` count

**Emits:** `VariantUpdated(uint256 indexed tokenId, uint256 price, uint256 maxSupply, bool active)`

**Frontend:**
```typescript
// Create a new variant
await writeContract({
  address: swag1155,
  abi: Swag1155ABI,
  functionName: 'setVariant',
  args: [
    1001n,              // tokenId
    25000000n,          // price (25 USDC)
    50n,                // maxSupply
    true,               // active
  ],
});

// Deactivate a variant
await writeContract({
  address: swag1155,
  abi: Swag1155ABI,
  functionName: 'setVariant',
  args: [1001n, 25000000n, 50n, false], // active = false
});

// Increase supply
await writeContract({
  address: swag1155,
  abi: Swag1155ABI,
  functionName: 'setVariant',
  args: [1001n, 25000000n, 100n, true], // maxSupply increased to 100
});
```

---

### setVariantWithURI

Creates or updates a variant with a per-token metadata URI.

```solidity
function setVariantWithURI(
    uint256 tokenId,
    uint256 price,
    uint256 maxSupply,
    bool active,
    string memory tokenURI
) external onlyRole(ADMIN_ROLE)
```

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `tokenId` | `uint256` | Unique identifier for this variant | `1001` |
| `price` | `uint256` | Price in USDC base units | `25000000` |
| `maxSupply` | `uint256` | Maximum available stock | `50` |
| `active` | `bool` | Whether available for purchase | `true` |
| `tokenURI` | `string` | IPFS URI for token metadata | `ipfs://QmXyz.../metadata.json` |

**Requirements:**
- Caller must have `ADMIN_ROLE`
- `maxSupply` must be >= current `minted` count
- `tokenURI` cannot be empty

**Emits:**
- `VariantUpdated(uint256 indexed tokenId, uint256 price, uint256 maxSupply, bool active)`
- `VariantURISet(uint256 indexed tokenId, string uri)`

**Frontend:**
```typescript
// Create variant with IPFS metadata
const metadataUri = 'ipfs://QmXyz123.../metadata.json';

await writeContract({
  address: swag1155,
  abi: Swag1155ABI,
  functionName: 'setVariantWithURI',
  args: [
    1001n,              // tokenId
    25000000n,          // price
    50n,                // maxSupply
    true,               // active
    metadataUri,        // tokenURI
  ],
});
```

---

### setBaseURI

Updates the base URI for token metadata (fallback when per-token URI not set).

```solidity
function setBaseURI(string memory newURI) external onlyRole(ADMIN_ROLE)
```

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `newURI` | `string` | New base URI | `ipfs://QmBaseUri/` |

**Requirements:**
- Caller must have `ADMIN_ROLE`

---

### markFulfilled

Marks a redemption as fulfilled after admin verifies shipment.

```solidity
function markFulfilled(uint256 tokenId, address owner) external onlyRole(ADMIN_ROLE)
```

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `tokenId` | `uint256` | Token being redeemed | `1001` |
| `owner` | `address` | Address that requested redemption | `0xUser...` |

**Requirements:**
- Caller must have `ADMIN_ROLE`
- Redemption status must be `PendingFulfillment`

**Emits:** `RedemptionFulfilled(address indexed owner, uint256 indexed tokenId, address indexed admin)`

**Frontend:**
```typescript
await writeContract({
  address: swag1155,
  abi: Swag1155ABI,
  functionName: 'markFulfilled',
  args: [
    1001n,                                    // tokenId
    '0xUserAddress...',                       // owner
  ],
});
```

---

## User Functions

### buy

Purchase a single variant with USDC.

```solidity
function buy(uint256 tokenId, uint256 quantity) external nonReentrant
```

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `tokenId` | `uint256` | Variant to purchase | `1001` |
| `quantity` | `uint256` | Number of units to buy | `2` |

**Requirements:**
- `quantity` must be > 0
- Variant must be `active`
- Sufficient supply: `minted + quantity <= maxSupply`
- User must have approved USDC: `price * quantity`

**Emits:** `Purchased(address indexed buyer, uint256 indexed tokenId, uint256 quantity, uint256 unitPrice, uint256 totalPrice)`

**Frontend:**
```typescript
// Step 1: Approve USDC
const totalPrice = variant.price * quantity;
await writeContract({
  address: usdcAddress,
  abi: ERC20ABI,
  functionName: 'approve',
  args: [swag1155, totalPrice],
});

// Step 2: Buy
await writeContract({
  address: swag1155,
  abi: Swag1155ABI,
  functionName: 'buy',
  args: [1001n, 2n], // tokenId, quantity
});
```

---

### buyBatch

Purchase multiple variants in a single transaction.

```solidity
function buyBatch(
    uint256[] calldata tokenIds,
    uint256[] calldata quantities
) external nonReentrant
```

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `tokenIds` | `uint256[]` | Array of variant IDs | `[1001, 1002, 1003]` |
| `quantities` | `uint256[]` | Array of quantities per variant | `[1, 2, 1]` |

**Requirements:**
- Arrays must have same length
- Arrays cannot be empty
- Each quantity must be > 0
- Each variant must be `active`
- Sufficient supply for each variant
- User must have approved total USDC

**Emits:** `PurchasedBatch(address indexed buyer, uint256[] tokenIds, uint256[] quantities, uint256 totalPrice)`

**Frontend:**
```typescript
// Calculate total price
const tokenIds = [1001n, 1002n, 1003n];
const quantities = [1n, 2n, 1n];
let totalPrice = 0n;
for (let i = 0; i < tokenIds.length; i++) {
  const variant = await getVariant(tokenIds[i]);
  totalPrice += variant.price * quantities[i];
}

// Approve total
await writeContract({
  address: usdcAddress,
  abi: ERC20ABI,
  functionName: 'approve',
  args: [swag1155, totalPrice],
});

// Buy batch
await writeContract({
  address: swag1155,
  abi: Swag1155ABI,
  functionName: 'buyBatch',
  args: [tokenIds, quantities],
});
```

---

### redeem

Request redemption of physical item for owned NFT.

```solidity
function redeem(uint256 tokenId) external
```

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `tokenId` | `uint256` | Token to redeem | `1001` |

**Requirements:**
- Caller must own at least 1 of the tokenId (`balanceOf(msg.sender, tokenId) > 0`)
- Redemption status must be `NotRedeemed`

**Emits:** `RedemptionRequested(address indexed owner, uint256 indexed tokenId)`

**State Change:** `redemptions[tokenId][msg.sender] = PendingFulfillment`

**Frontend:**
```typescript
await writeContract({
  address: swag1155,
  abi: Swag1155ABI,
  functionName: 'redeem',
  args: [1001n],
});

// After success, prompt user for shipping address (off-chain)
```

---

## View Functions

### isAdmin

Check if an address has ADMIN_ROLE.

```solidity
function isAdmin(address account) external view returns (bool)
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `account` | `address` | Address to check |

**Returns:** `bool` - true if address has ADMIN_ROLE

**Frontend:**
```typescript
const { data: isAdmin } = useReadContract({
  address: swag1155,
  abi: Swag1155ABI,
  functionName: 'isAdmin',
  args: [address],
});
```

---

### isSuperAdmin

Check if an address has DEFAULT_ADMIN_ROLE.

```solidity
function isSuperAdmin(address account) external view returns (bool)
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `account` | `address` | Address to check |

**Returns:** `bool` - true if address has DEFAULT_ADMIN_ROLE

---

### getVariant

Get full variant information.

```solidity
function getVariant(uint256 tokenId) external view returns (Variant memory)
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `tokenId` | `uint256` | Variant ID to query |

**Returns:** `Variant` struct with price, maxSupply, minted, active

**Frontend:**
```typescript
const { data: variant } = useReadContract({
  address: swag1155,
  abi: Swag1155ABI,
  functionName: 'getVariant',
  args: [1001n],
});

// variant = { price: 25000000n, maxSupply: 50n, minted: 10n, active: true }
```

---

### remaining

Get available stock for a variant.

```solidity
function remaining(uint256 tokenId) public view returns (uint256)
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `tokenId` | `uint256` | Variant ID to query |

**Returns:** `uint256` - Available units (maxSupply - minted)

**Frontend:**
```typescript
const { data: available } = useReadContract({
  address: swag1155,
  abi: Swag1155ABI,
  functionName: 'remaining',
  args: [1001n],
});
// available = 40n
```

---

### listTokenIds

Get all known token IDs.

```solidity
function listTokenIds() external view returns (uint256[] memory)
```

**Returns:** `uint256[]` - Array of all token IDs that have been created

**Frontend:**
```typescript
const { data: tokenIds } = useReadContract({
  address: swag1155,
  abi: Swag1155ABI,
  functionName: 'listTokenIds',
});
// tokenIds = [1001n, 1002n, 1003n, 1004n, ...]
```

---

### uri

Get metadata URI for a token.

```solidity
function uri(uint256 tokenId) public view override returns (string memory)
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `tokenId` | `uint256` | Token ID to query |

**Returns:** `string` - IPFS URI (per-token if set, otherwise baseURI)

**Frontend:**
```typescript
const { data: metadataUri } = useReadContract({
  address: swag1155,
  abi: Swag1155ABI,
  functionName: 'uri',
  args: [1001n],
});
// metadataUri = "ipfs://QmXyz.../metadata.json"

// Fetch metadata
const gatewayUrl = metadataUri.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/');
const metadata = await fetch(gatewayUrl).then(r => r.json());
```

---

### getRedemptionStatus

Get redemption status for a specific owner and token.

```solidity
function getRedemptionStatus(uint256 tokenId, address owner) external view returns (RedemptionStatus)
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `tokenId` | `uint256` | Token ID to query |
| `owner` | `address` | Owner address to query |

**Returns:** `RedemptionStatus` (0, 1, or 2)

**Frontend:**
```typescript
const { data: status } = useReadContract({
  address: swag1155,
  abi: Swag1155ABI,
  functionName: 'getRedemptionStatus',
  args: [1001n, userAddress],
});
// status = 0 (NotRedeemed), 1 (PendingFulfillment), or 2 (Fulfilled)
```

---

### balanceOf (inherited from ERC1155)

Get token balance for an address.

```solidity
function balanceOf(address account, uint256 id) public view returns (uint256)
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `account` | `address` | Owner address |
| `id` | `uint256` | Token ID |

**Returns:** `uint256` - Number of tokens owned

**Frontend:**
```typescript
const { data: balance } = useReadContract({
  address: swag1155,
  abi: Swag1155ABI,
  functionName: 'balanceOf',
  args: [userAddress, 1001n],
});
// balance = 2n (user owns 2 of this token)
```

---

## Events

### Purchase Events

| Event | Parameters | When Emitted |
|-------|------------|--------------|
| `Purchased` | `buyer`, `tokenId`, `quantity`, `unitPrice`, `totalPrice` | Single purchase via `buy()` |
| `PurchasedBatch` | `buyer`, `tokenIds[]`, `quantities[]`, `totalPrice` | Batch purchase via `buyBatch()` |

### Admin Events

| Event | Parameters | When Emitted |
|-------|------------|--------------|
| `VariantUpdated` | `tokenId`, `price`, `maxSupply`, `active` | `setVariant()` or `setVariantWithURI()` |
| `VariantURISet` | `tokenId`, `uri` | `setVariantWithURI()` |
| `TreasuryUpdated` | `newTreasury` | `setTreasury()` |
| `USDCUpdated` | `newUSDC` | `setUSDC()` |
| `AdminAdded` | `admin` | `addAdmin()` |
| `AdminRemoved` | `admin` | `removeAdmin()` |

### Redemption Events

| Event | Parameters | When Emitted |
|-------|------------|--------------|
| `RedemptionRequested` | `owner`, `tokenId` | User calls `redeem()` |
| `RedemptionFulfilled` | `owner`, `tokenId`, `admin` | Admin calls `markFulfilled()` |

**Frontend Event Listening:**
```typescript
import { useWatchContractEvent } from 'wagmi';

// Listen for purchases
useWatchContractEvent({
  address: swag1155,
  abi: Swag1155ABI,
  eventName: 'Purchased',
  onLogs(logs) {
    logs.forEach((log) => {
      const { buyer, tokenId, quantity, totalPrice } = log.args;
      console.log(`${buyer} bought ${quantity} of token ${tokenId} for ${totalPrice}`);
    });
  },
});

// Listen for redemption requests (useful for backend)
useWatchContractEvent({
  address: swag1155,
  abi: Swag1155ABI,
  eventName: 'RedemptionRequested',
  onLogs(logs) {
    logs.forEach((log) => {
      const { owner, tokenId } = log.args;
      // Trigger shipping address collection
    });
  },
});
```

---

## Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| `"invalid USDC"` | Zero address passed for USDC | Provide valid USDC contract address |
| `"invalid treasury"` | Zero address passed for treasury | Provide valid treasury address |
| `"invalid address"` | Zero address passed for admin | Provide valid admin address |
| `"maxSupply < minted"` | Trying to set maxSupply below already minted | Set maxSupply >= current minted count |
| `"invalid URI"` | Empty string passed for tokenURI | Provide valid IPFS URI |
| `"invalid quantity"` | Quantity is 0 | Provide quantity > 0 |
| `"variant inactive"` | Trying to buy inactive variant | Admin must activate variant first |
| `"exceeds supply"` | Not enough stock | Reduce quantity or wait for restock |
| `"length mismatch"` | tokenIds and quantities arrays differ in length | Ensure arrays have same length |
| `"empty batch"` | Empty arrays passed to buyBatch | Provide at least one item |
| `"not owner"` | Trying to redeem without owning NFT | User must own the token |
| `"already redeemed"` | Trying to redeem twice | NFT already redeemed |
| `"not pending"` | Admin trying to fulfill non-pending redemption | Status must be PendingFulfillment |

---

## Frontend Integration Examples

### Complete Purchase Flow

```typescript
import { useWriteContract, useReadContract, useAccount } from 'wagmi';

function PurchaseButton({ tokenId, quantity }: { tokenId: bigint; quantity: number }) {
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();

  // Get variant info
  const { data: variant } = useReadContract({
    address: SWAG1155_ADDRESS,
    abi: Swag1155ABI,
    functionName: 'getVariant',
    args: [tokenId],
  });

  const handlePurchase = async () => {
    if (!variant) return;

    const totalPrice = variant.price * BigInt(quantity);

    // 1. Approve USDC
    await writeContractAsync({
      address: USDC_ADDRESS,
      abi: ERC20ABI,
      functionName: 'approve',
      args: [SWAG1155_ADDRESS, totalPrice],
    });

    // 2. Buy
    await writeContractAsync({
      address: SWAG1155_ADDRESS,
      abi: Swag1155ABI,
      functionName: 'buy',
      args: [tokenId, BigInt(quantity)],
    });

    alert('Purchase successful!');
  };

  return (
    <button onClick={handlePurchase} disabled={!variant?.active}>
      Buy {quantity} for ${variant ? Number(variant.price * BigInt(quantity)) / 1e6 : 0}
    </button>
  );
}
```

### Complete Redemption Flow

```typescript
function RedemptionFlow({ tokenId }: { tokenId: bigint }) {
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();

  // Check ownership
  const { data: balance } = useReadContract({
    address: SWAG1155_ADDRESS,
    abi: Swag1155ABI,
    functionName: 'balanceOf',
    args: [address, tokenId],
  });

  // Check redemption status
  const { data: status } = useReadContract({
    address: SWAG1155_ADDRESS,
    abi: Swag1155ABI,
    functionName: 'getRedemptionStatus',
    args: [tokenId, address],
  });

  const canRedeem = balance && balance > 0n && status === 0;

  const handleRedeem = async () => {
    // 1. Call redeem on contract
    await writeContractAsync({
      address: SWAG1155_ADDRESS,
      abi: Swag1155ABI,
      functionName: 'redeem',
      args: [tokenId],
    });

    // 2. Collect shipping (off-chain)
    const shipping = await collectShippingAddress();

    // 3. Send to backend
    await fetch('/api/shipping', {
      method: 'POST',
      body: JSON.stringify({ tokenId: tokenId.toString(), wallet: address, shipping }),
    });
  };

  if (status === 2) return <span>Shipped</span>;
  if (status === 1) return <span>Awaiting Shipment</span>;
  if (!canRedeem) return <span>Cannot Redeem</span>;

  return <button onClick={handleRedeem}>Redeem Physical Item</button>;
}
```

### Admin Fulfillment

```typescript
function AdminFulfillment({ tokenId, owner }: { tokenId: bigint; owner: string }) {
  const { writeContractAsync } = useWriteContract();

  const handleFulfill = async () => {
    await writeContractAsync({
      address: SWAG1155_ADDRESS,
      abi: Swag1155ABI,
      functionName: 'markFulfilled',
      args: [tokenId, owner],
    });

    // Update backend
    await fetch('/api/admin/fulfillment', {
      method: 'POST',
      body: JSON.stringify({ tokenId: tokenId.toString(), owner }),
    });
  };

  return <button onClick={handleFulfill}>Mark as Shipped</button>;
}
```

---

## Quick Reference Card

### TokenId Convention
```
tokenId = baseId * 10 + sizeOffset

Size Offsets:
  S  = 1  →  tokenId 1001 = product 100, size S
  M  = 2  →  tokenId 1002 = product 100, size M
  L  = 3  →  tokenId 1003 = product 100, size L
  XL = 4  →  tokenId 1004 = product 100, size XL
  NA = 5  →  tokenId 1005 = product 100, one size
```

### Price Conversion
```typescript
// USDC has 6 decimals
const toBaseUnits = (usd: number) => BigInt(Math.round(usd * 1e6));
const toDisplay = (baseUnits: bigint) => Number(baseUnits) / 1e6;

// Examples:
toBaseUnits(25.50)  // → 25500000n
toDisplay(25500000n) // → 25.5
```

### Redemption States
```
0 = NotRedeemed        → User can call redeem()
1 = PendingFulfillment → Waiting for admin to verify shipment
2 = Fulfilled          → Shipment complete
```
