# FaucetManager Contract Reference

**Complete API reference** for the FaucetManager multi-vault contract with frontend integration guide.

**Contract**: `contracts/FaucetManager.sol`
**Version**: 1.0
**Last Updated**: January 2026

---

## Table of Contents

1. [Overview](#overview)
2. [UI Components Map](#ui-components-map)
3. [Data Structures](#data-structures)
4. [Admin Functions](#admin-functions)
5. [User Functions](#user-functions)
6. [View Functions](#view-functions)
7. [Events](#events)
8. [Error Messages](#error-messages)
9. [Frontend Components](#frontend-components)
10. [Complete Code Examples](#complete-code-examples)

---

## Overview

FaucetManager is a **multi-vault faucet system** that allows admins to create and manage multiple ETH faucets for different purposes (hackathons, staking, grants).

### Key Features

| Feature | Description |
|---------|-------------|
| **Multiple Vaults** | Create unlimited vaults for different events/purposes |
| **Returnable Vaults** | Some vaults expect ETH to be returned (hackathon deposits) |
| **Non-Returnable** | Other vaults are gifts/grants (no return expected) |
| **Anti-Sybil** | All claims require ZKPassport NFT |
| **Per-Vault Tracking** | Users can claim from multiple vaults (1 claim per vault) |
| **Good Actor Tracking** | Track users who return funds |

### Vault Types

```
┌─────────────────────────────────────────────────────────────────┐
│                        VAULT TYPES                               │
├─────────────────────────────────┬───────────────────────────────┤
│        NonReturnable (0)        │        Returnable (1)         │
├─────────────────────────────────┼───────────────────────────────┤
│ - Grants                        │ - Hackathon deposits          │
│ - Gifts                         │ - Staking requirements        │
│ - Rewards                       │ - Temporary loans             │
│ - No return expected            │ - User returns after event    │
│ - One-way claim                 │ - Tracked as "good actor"     │
└─────────────────────────────────┴───────────────────────────────┘
```

---

## UI Components Map

### Admin Dashboard

```
┌─────────────────────────────────────────────────────────────────┐
│                     ADMIN DASHBOARD                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ [+ Create New Vault]  ←── createVault()                 │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ VAULT: ETHGlobal Online 2026                            │    │
│  │ Type: Returnable | Balance: 10 ETH | Claims: 45         │    │
│  │                                                          │    │
│  │ [Edit]        [Deposit]       [Withdraw]    [Toggle]    │    │
│  │    ↓              ↓               ↓            ↓        │    │
│  │ updateVault() deposit()     withdraw()   updateVault()  │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ VAULT: Community Grants                                  │    │
│  │ Type: Non-Returnable | Balance: 5 ETH | Claims: 120     │    │
│  │ ...                                                      │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### User Interface

```
┌─────────────────────────────────────────────────────────────────┐
│                     USER FAUCET PAGE                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ ETHGlobal Online 2026                                    │    │
│  │ "Get ETH for hackathon participation"                    │    │
│  │ Claim: 0.1 ETH | Available: 10 ETH                       │    │
│  │ Type: Returnable (please return after event)             │    │
│  │                                                          │    │
│  │ [Claim ETH]  ←── claim(vaultId)                         │    │
│  │                                                          │    │
│  │ Status: Claimed 0.1 ETH on Jan 15                       │    │
│  │ [Return Funds]  ←── returnFunds(vaultId)                │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ Community Grants                                         │    │
│  │ "Free ETH for verified community members"                │    │
│  │ Claim: 0.05 ETH | Available: 5 ETH                       │    │
│  │ Type: Non-Returnable (it's yours to keep!)               │    │
│  │                                                          │    │
│  │ [Claim ETH]  ←── claim(vaultId)                         │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ YOUR STATS                                               │    │
│  │ Total Claimed: 0.15 ETH from 2 vaults                    │    │
│  │ Times Returned: 1 (Good Actor!)  ←── getReturnCount()   │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Button-to-Function Mapping

| UI Button | Contract Function | Who Can Use | Parameters |
|-----------|-------------------|-------------|------------|
| **[Create Vault]** | `createVault()` | Admin | name, description, claimAmount, vaultType |
| **[Edit Vault]** | `updateVault()` | Admin | vaultId, name, description, claimAmount, active |
| **[Deposit]** | `deposit()` | Admin | vaultId + ETH value |
| **[Withdraw]** | `withdraw()` | Admin | vaultId, amount |
| **[Toggle Active]** | `updateVault()` | Admin | vaultId, ..., active |
| **[Claim ETH]** | `claim()` | User | vaultId |
| **[Return Funds]** | `returnFunds()` | User | vaultId + ETH value |

---

## Data Structures

### Vault

```solidity
struct Vault {
    string name;            // Display name
    string description;     // Purpose description
    uint256 claimAmount;    // ETH per claim (wei)
    uint256 balance;        // Current ETH balance
    uint256 totalClaimed;   // Total ETH distributed
    uint256 totalReturned;  // Total ETH returned
    VaultType vaultType;    // 0=NonReturnable, 1=Returnable
    bool active;            // Accept claims?
    uint256 createdAt;      // Creation timestamp
}
```

**Frontend Type:**
```typescript
interface Vault {
  name: string;
  description: string;
  claimAmount: bigint;      // wei
  balance: bigint;          // wei
  totalClaimed: bigint;     // wei
  totalReturned: bigint;    // wei
  vaultType: 0 | 1;         // 0=NonReturnable, 1=Returnable
  active: boolean;
  createdAt: bigint;        // timestamp
}

// Helper to format ETH
const formatEth = (wei: bigint) => Number(wei) / 1e18;
```

### ClaimInfo

```solidity
struct ClaimInfo {
    bool hasClaimed;        // Has user claimed?
    uint256 claimedAmount;  // Amount claimed (wei)
    uint256 claimedAt;      // Claim timestamp
    bool hasReturned;       // Has user returned? (Returnable only)
    uint256 returnedAmount; // Amount returned (wei)
    uint256 returnedAt;     // Return timestamp
}
```

**Frontend Type:**
```typescript
interface ClaimInfo {
  hasClaimed: boolean;
  claimedAmount: bigint;
  claimedAt: bigint;
  hasReturned: boolean;
  returnedAmount: bigint;
  returnedAt: bigint;
}
```

### VaultType Enum

```solidity
enum VaultType {
    NonReturnable,  // 0 - User keeps ETH
    Returnable      // 1 - User expected to return
}
```

---

## Admin Functions

### createVault

**UI: [+ Create New Vault] button**

Creates a new faucet vault.

```solidity
function createVault(
    string memory name,
    string memory description,
    uint256 claimAmount,
    VaultType vaultType
) external onlyRole(ADMIN_ROLE) returns (uint256 vaultId)
```

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `name` | `string` | Vault display name | `"ETHGlobal Online 2026"` |
| `description` | `string` | Purpose description | `"ETH for hackathon participation"` |
| `claimAmount` | `uint256` | ETH per claim in wei | `100000000000000000` (0.1 ETH) |
| `vaultType` | `VaultType` | 0=NonReturnable, 1=Returnable | `1` |

**Returns:** `vaultId` - The ID of the created vault

**Emits:** `VaultCreated(vaultId, name, vaultType, claimAmount)`

**Frontend:**
```typescript
// Create Vault Button Handler
const handleCreateVault = async () => {
  const claimAmountWei = parseEther(claimAmount); // e.g., "0.1"

  const tx = await writeContractAsync({
    address: FAUCET_MANAGER,
    abi: FaucetManagerABI,
    functionName: 'createVault',
    args: [
      'ETHGlobal Online 2026',
      'Get ETH for hackathon participation. Please return after the event.',
      claimAmountWei,
      1, // Returnable
    ],
  });

  // Get vaultId from event
  const receipt = await waitForTransactionReceipt({ hash: tx });
  // Parse VaultCreated event for vaultId
};
```

---

### updateVault

**UI: [Edit] button on vault card**

Update vault configuration.

```solidity
function updateVault(
    uint256 vaultId,
    string memory name,
    string memory description,
    uint256 claimAmount,
    bool active
) external onlyRole(ADMIN_ROLE)
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `vaultId` | `uint256` | Vault ID to update |
| `name` | `string` | New name |
| `description` | `string` | New description |
| `claimAmount` | `uint256` | New claim amount (wei) |
| `active` | `bool` | Enable/disable claims |

**Emits:** `VaultUpdated(vaultId, name, description, claimAmount, active)`

**Frontend:**
```typescript
// Edit Vault Button Handler
const handleUpdateVault = async (vaultId: number) => {
  await writeContractAsync({
    address: FAUCET_MANAGER,
    abi: FaucetManagerABI,
    functionName: 'updateVault',
    args: [
      BigInt(vaultId),
      editForm.name,
      editForm.description,
      parseEther(editForm.claimAmount),
      editForm.active,
    ],
  });
};

// Toggle Active Button Handler
const handleToggleActive = async (vaultId: number, currentActive: boolean) => {
  const vault = await getVault(vaultId);
  await writeContractAsync({
    address: FAUCET_MANAGER,
    abi: FaucetManagerABI,
    functionName: 'updateVault',
    args: [
      BigInt(vaultId),
      vault.name,
      vault.description,
      vault.claimAmount,
      !currentActive, // Toggle
    ],
  });
};
```

---

### deposit

**UI: [Deposit] button on vault card**

Add ETH to a vault.

```solidity
function deposit(uint256 vaultId) external payable onlyRole(ADMIN_ROLE)
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `vaultId` | `uint256` | Vault ID to deposit to |
| `msg.value` | `uint256` | ETH amount to deposit |

**Emits:** `VaultDeposit(vaultId, depositor, amount)`

**Frontend:**
```typescript
// Deposit Button Handler
const handleDeposit = async (vaultId: number, ethAmount: string) => {
  await writeContractAsync({
    address: FAUCET_MANAGER,
    abi: FaucetManagerABI,
    functionName: 'deposit',
    args: [BigInt(vaultId)],
    value: parseEther(ethAmount), // e.g., "5" for 5 ETH
  });
};
```

---

### withdraw

**UI: [Withdraw] button on vault card**

Withdraw ETH from a vault.

```solidity
function withdraw(uint256 vaultId, uint256 amount) external onlyRole(ADMIN_ROLE)
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `vaultId` | `uint256` | Vault ID to withdraw from |
| `amount` | `uint256` | Amount to withdraw (wei) |

**Emits:** `VaultWithdraw(vaultId, to, amount)`

**Frontend:**
```typescript
// Withdraw Button Handler
const handleWithdraw = async (vaultId: number, ethAmount: string) => {
  await writeContractAsync({
    address: FAUCET_MANAGER,
    abi: FaucetManagerABI,
    functionName: 'withdraw',
    args: [BigInt(vaultId), parseEther(ethAmount)],
  });
};
```

---

### addAdmin / removeAdmin

**UI: Admin management section**

```solidity
function addAdmin(address admin) external onlyRole(DEFAULT_ADMIN_ROLE)
function removeAdmin(address admin) external onlyRole(DEFAULT_ADMIN_ROLE)
```

---

### pause / unpause

**UI: Emergency controls**

```solidity
function pause() external onlyRole(ADMIN_ROLE)
function unpause() external onlyRole(ADMIN_ROLE)
```

---

## User Functions

### claim

**UI: [Claim ETH] button on vault card**

Claim ETH from a vault (one-time per vault).

```solidity
function claim(uint256 vaultId) external nonReentrant whenNotPaused
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `vaultId` | `uint256` | Vault ID to claim from |

**Requirements:**
- Vault must exist and be active
- Vault must have sufficient balance
- User must not have already claimed from this vault
- User must own ZKPassport NFT

**Emits:** `Claimed(vaultId, user, amount)`

**Frontend:**
```typescript
// Claim Button Handler
const handleClaim = async (vaultId: number) => {
  // Check eligibility first
  const [canClaim, reason] = await readContract({
    address: FAUCET_MANAGER,
    abi: FaucetManagerABI,
    functionName: 'canUserClaim',
    args: [BigInt(vaultId), address],
  });

  if (!canClaim) {
    alert(`Cannot claim: ${reason}`);
    return;
  }

  await writeContractAsync({
    address: FAUCET_MANAGER,
    abi: FaucetManagerABI,
    functionName: 'claim',
    args: [BigInt(vaultId)],
  });

  alert('ETH claimed successfully!');
};
```

---

### returnFunds

**UI: [Return Funds] button (only for Returnable vaults)**

Return ETH to a returnable vault.

```solidity
function returnFunds(uint256 vaultId) external payable nonReentrant whenNotPaused
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `vaultId` | `uint256` | Vault ID to return to |
| `msg.value` | `uint256` | ETH amount to return |

**Requirements:**
- Vault must be Returnable type
- User must have claimed from this vault
- User must not have already returned
- Must send ETH with transaction

**Emits:** `Returned(vaultId, user, amount)`

**Side Effect:** Increments user's `returnCount` (good actor tracking)

**Frontend:**
```typescript
// Return Funds Button Handler
const handleReturn = async (vaultId: number, claimInfo: ClaimInfo) => {
  if (claimInfo.hasReturned) {
    alert('Already returned funds');
    return;
  }

  // Return the same amount that was claimed
  const returnAmount = claimInfo.claimedAmount;

  await writeContractAsync({
    address: FAUCET_MANAGER,
    abi: FaucetManagerABI,
    functionName: 'returnFunds',
    args: [BigInt(vaultId)],
    value: returnAmount,
  });

  alert('Thank you for returning! You are now marked as a Good Actor.');
};
```

---

## View Functions

### getVault

**UI: Display vault details**

```solidity
function getVault(uint256 vaultId) external view returns (Vault memory)
```

**Frontend:**
```typescript
const { data: vault } = useReadContract({
  address: FAUCET_MANAGER,
  abi: FaucetManagerABI,
  functionName: 'getVault',
  args: [BigInt(vaultId)],
});
```

---

### getAllVaults

**UI: List all vaults (admin view)**

```solidity
function getAllVaults() external view returns (Vault[] memory)
```

**Frontend:**
```typescript
const { data: allVaults } = useReadContract({
  address: FAUCET_MANAGER,
  abi: FaucetManagerABI,
  functionName: 'getAllVaults',
});
```

---

### getActiveVaults

**UI: List active vaults (user view)**

```solidity
function getActiveVaults() external view returns (uint256[] memory ids, Vault[] memory vaults)
```

**Frontend:**
```typescript
const { data } = useReadContract({
  address: FAUCET_MANAGER,
  abi: FaucetManagerABI,
  functionName: 'getActiveVaults',
});

const [vaultIds, vaults] = data || [[], []];
```

---

### getClaimInfo

**UI: Show user's claim status for a vault**

```solidity
function getClaimInfo(uint256 vaultId, address user) external view returns (ClaimInfo memory)
```

**Frontend:**
```typescript
const { data: claimInfo } = useReadContract({
  address: FAUCET_MANAGER,
  abi: FaucetManagerABI,
  functionName: 'getClaimInfo',
  args: [BigInt(vaultId), userAddress],
});

// Display status
if (claimInfo.hasClaimed) {
  const claimedDate = new Date(Number(claimInfo.claimedAt) * 1000);
  return `Claimed ${formatEther(claimInfo.claimedAmount)} ETH on ${claimedDate}`;
}
```

---

### canUserClaim

**UI: Enable/disable Claim button**

```solidity
function canUserClaim(uint256 vaultId, address user) external view returns (bool canClaim, string memory reason)
```

**Frontend:**
```typescript
const { data } = useReadContract({
  address: FAUCET_MANAGER,
  abi: FaucetManagerABI,
  functionName: 'canUserClaim',
  args: [BigInt(vaultId), userAddress],
});

const [canClaim, reason] = data || [false, ''];

// Use for button state
<button disabled={!canClaim} title={reason}>
  {canClaim ? 'Claim ETH' : reason}
</button>
```

---

### getUserClaims

**UI: User's claims dashboard**

```solidity
function getUserClaims(address user) external view returns (uint256[] memory vaultIds, ClaimInfo[] memory claimInfos)
```

**Frontend:**
```typescript
const { data } = useReadContract({
  address: FAUCET_MANAGER,
  abi: FaucetManagerABI,
  functionName: 'getUserClaims',
  args: [userAddress],
});

const [vaultIds, claimInfos] = data || [[], []];

// Calculate total claimed
const totalClaimed = claimInfos.reduce((sum, info) =>
  sum + (info.hasClaimed ? info.claimedAmount : 0n), 0n
);
```

---

### getReturnCount

**UI: Good actor badge**

```solidity
function getReturnCount(address user) external view returns (uint256)
```

**Frontend:**
```typescript
const { data: returnCount } = useReadContract({
  address: FAUCET_MANAGER,
  abi: FaucetManagerABI,
  functionName: 'getReturnCount',
  args: [userAddress],
});

// Display badge
{returnCount > 0 && (
  <Badge>Good Actor ({returnCount} returns)</Badge>
)}
```

---

### isAdmin / isSuperAdmin

**UI: Show/hide admin controls**

```solidity
function isAdmin(address account) external view returns (bool)
function isSuperAdmin(address account) external view returns (bool)
```

**Frontend:**
```typescript
const { data: isAdmin } = useReadContract({
  address: FAUCET_MANAGER,
  abi: FaucetManagerABI,
  functionName: 'isAdmin',
  args: [address],
});

// Conditionally render admin UI
{isAdmin && <AdminDashboard />}
```

---

## Events

| Event | Parameters | UI Update |
|-------|------------|-----------|
| `VaultCreated` | `vaultId`, `name`, `vaultType`, `claimAmount` | Add vault to list |
| `VaultUpdated` | `vaultId`, `name`, `description`, `claimAmount`, `active` | Update vault card |
| `VaultDeposit` | `vaultId`, `depositor`, `amount` | Update balance display |
| `VaultWithdraw` | `vaultId`, `to`, `amount` | Update balance display |
| `Claimed` | `vaultId`, `user`, `amount` | Show success, update stats |
| `Returned` | `vaultId`, `user`, `amount` | Show badge, update stats |

**Event Listening:**
```typescript
// Listen for claims (e.g., for notifications)
useWatchContractEvent({
  address: FAUCET_MANAGER,
  abi: FaucetManagerABI,
  eventName: 'Claimed',
  onLogs(logs) {
    logs.forEach((log) => {
      const { vaultId, user, amount } = log.args;
      toast.success(`${user} claimed ${formatEther(amount)} ETH!`);
    });
  },
});
```

---

## Error Messages

| Error | Cause | UI Message |
|-------|-------|------------|
| `"FaucetManager: vault does not exist"` | Invalid vaultId | "Vault not found" |
| `"FaucetManager: empty name"` | Name is empty | "Please enter a vault name" |
| `"FaucetManager: claim amount must be > 0"` | Zero claim amount | "Claim amount must be greater than 0" |
| `"FaucetManager: must send ETH"` | No ETH sent with deposit | "Please enter amount to deposit" |
| `"FaucetManager: insufficient balance"` | Vault low on funds | "Vault is empty, please try later" |
| `"FaucetManager: vault not active"` | Vault paused | "This faucet is currently closed" |
| `"FaucetManager: already claimed from this vault"` | Double claim | "You've already claimed from this vault" |
| `"FaucetManager: must own ZKPassport NFT"` | No ZKPassport | "Please verify with ZKPassport first" |
| `"FaucetManager: vault is not returnable"` | Wrong vault type | "This vault doesn't accept returns" |
| `"FaucetManager: must claim first"` | Return without claim | "You haven't claimed from this vault" |
| `"FaucetManager: already returned"` | Double return | "You've already returned funds" |

---

## Frontend Components

### React Hooks

```typescript
// hooks/useFaucetManager.ts

import { useReadContract, useWriteContract } from 'wagmi';
import { parseEther, formatEther } from 'viem';

// Get all active vaults for users
export function useActiveVaults() {
  const { data, isLoading, refetch } = useReadContract({
    address: FAUCET_MANAGER,
    abi: FaucetManagerABI,
    functionName: 'getActiveVaults',
  });

  const [vaultIds, vaults] = data || [[], []];

  return {
    vaults: vaultIds.map((id, i) => ({ id, ...vaults[i] })),
    isLoading,
    refetch,
  };
}

// Check if user can claim from a specific vault
export function useCanClaim(vaultId: number, userAddress?: string) {
  const { data } = useReadContract({
    address: FAUCET_MANAGER,
    abi: FaucetManagerABI,
    functionName: 'canUserClaim',
    args: [BigInt(vaultId), userAddress],
    query: { enabled: !!userAddress },
  });

  const [canClaim, reason] = data || [false, ''];
  return { canClaim, reason };
}

// Get user's claim info for a vault
export function useClaimInfo(vaultId: number, userAddress?: string) {
  return useReadContract({
    address: FAUCET_MANAGER,
    abi: FaucetManagerABI,
    functionName: 'getClaimInfo',
    args: [BigInt(vaultId), userAddress],
    query: { enabled: !!userAddress },
  });
}

// Claim hook
export function useClaim() {
  const { writeContractAsync, isPending, error } = useWriteContract();

  const claim = async (vaultId: number) => {
    return writeContractAsync({
      address: FAUCET_MANAGER,
      abi: FaucetManagerABI,
      functionName: 'claim',
      args: [BigInt(vaultId)],
    });
  };

  return { claim, isPending, error };
}

// Return funds hook
export function useReturnFunds() {
  const { writeContractAsync, isPending, error } = useWriteContract();

  const returnFunds = async (vaultId: number, amount: bigint) => {
    return writeContractAsync({
      address: FAUCET_MANAGER,
      abi: FaucetManagerABI,
      functionName: 'returnFunds',
      args: [BigInt(vaultId)],
      value: amount,
    });
  };

  return { returnFunds, isPending, error };
}

// Admin: Create vault hook
export function useCreateVault() {
  const { writeContractAsync, isPending, error } = useWriteContract();

  const createVault = async (
    name: string,
    description: string,
    claimAmountEth: string,
    vaultType: 0 | 1
  ) => {
    return writeContractAsync({
      address: FAUCET_MANAGER,
      abi: FaucetManagerABI,
      functionName: 'createVault',
      args: [name, description, parseEther(claimAmountEth), vaultType],
    });
  };

  return { createVault, isPending, error };
}

// Admin: Deposit hook
export function useDeposit() {
  const { writeContractAsync, isPending, error } = useWriteContract();

  const deposit = async (vaultId: number, amountEth: string) => {
    return writeContractAsync({
      address: FAUCET_MANAGER,
      abi: FaucetManagerABI,
      functionName: 'deposit',
      args: [BigInt(vaultId)],
      value: parseEther(amountEth),
    });
  };

  return { deposit, isPending, error };
}
```

---

## Complete Code Examples

### VaultCard Component

```typescript
// components/VaultCard.tsx

import { useAccount } from 'wagmi';
import { formatEther } from 'viem';
import { useCanClaim, useClaimInfo, useClaim, useReturnFunds } from '../hooks/useFaucetManager';

interface VaultCardProps {
  vaultId: number;
  vault: Vault;
}

export function VaultCard({ vaultId, vault }: VaultCardProps) {
  const { address } = useAccount();
  const { canClaim, reason } = useCanClaim(vaultId, address);
  const { data: claimInfo } = useClaimInfo(vaultId, address);
  const { claim, isPending: isClaiming } = useClaim();
  const { returnFunds, isPending: isReturning } = useReturnFunds();

  const isReturnable = vault.vaultType === 1;
  const hasClaimed = claimInfo?.hasClaimed;
  const hasReturned = claimInfo?.hasReturned;

  const handleClaim = async () => {
    try {
      await claim(vaultId);
      alert('ETH claimed successfully!');
    } catch (err) {
      alert('Claim failed');
    }
  };

  const handleReturn = async () => {
    if (!claimInfo) return;
    try {
      await returnFunds(vaultId, claimInfo.claimedAmount);
      alert('Thank you for returning!');
    } catch (err) {
      alert('Return failed');
    }
  };

  return (
    <div className="vault-card">
      <h3>{vault.name}</h3>
      <p>{vault.description}</p>

      <div className="vault-stats">
        <span>Claim: {formatEther(vault.claimAmount)} ETH</span>
        <span>Available: {formatEther(vault.balance)} ETH</span>
        <span>Type: {isReturnable ? 'Returnable' : 'Non-Returnable'}</span>
      </div>

      {/* Claim Status */}
      {hasClaimed && (
        <div className="claim-status">
          Claimed {formatEther(claimInfo.claimedAmount)} ETH
          on {new Date(Number(claimInfo.claimedAt) * 1000).toLocaleDateString()}
        </div>
      )}

      {/* Buttons */}
      <div className="vault-actions">
        {!hasClaimed ? (
          <button
            onClick={handleClaim}
            disabled={!canClaim || isClaiming}
            title={!canClaim ? reason : ''}
          >
            {isClaiming ? 'Claiming...' : 'Claim ETH'}
          </button>
        ) : isReturnable && !hasReturned ? (
          <button onClick={handleReturn} disabled={isReturning}>
            {isReturning ? 'Returning...' : 'Return Funds'}
          </button>
        ) : hasReturned ? (
          <span className="badge">Returned - Thank you!</span>
        ) : null}
      </div>
    </div>
  );
}
```

### Admin Create Vault Form

```typescript
// components/AdminCreateVault.tsx

import { useState } from 'react';
import { useCreateVault } from '../hooks/useFaucetManager';

export function AdminCreateVault() {
  const { createVault, isPending } = useCreateVault();
  const [form, setForm] = useState({
    name: '',
    description: '',
    claimAmount: '0.1',
    vaultType: 1 as 0 | 1,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createVault(
        form.name,
        form.description,
        form.claimAmount,
        form.vaultType
      );
      alert('Vault created!');
      setForm({ name: '', description: '', claimAmount: '0.1', vaultType: 1 });
    } catch (err) {
      alert('Failed to create vault');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="create-vault-form">
      <h2>Create New Vault</h2>

      <label>
        Vault Name
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="ETHGlobal Online 2026"
          required
        />
      </label>

      <label>
        Description
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Purpose of this faucet..."
          required
        />
      </label>

      <label>
        Claim Amount (ETH)
        <input
          type="number"
          step="0.01"
          value={form.claimAmount}
          onChange={(e) => setForm({ ...form, claimAmount: e.target.value })}
          required
        />
      </label>

      <label>
        Vault Type
        <select
          value={form.vaultType}
          onChange={(e) => setForm({ ...form, vaultType: Number(e.target.value) as 0 | 1 })}
        >
          <option value={0}>Non-Returnable (grants, gifts)</option>
          <option value={1}>Returnable (hackathons, staking)</option>
        </select>
      </label>

      <button type="submit" disabled={isPending}>
        {isPending ? 'Creating...' : 'Create Vault'}
      </button>
    </form>
  );
}
```

---

## Quick Reference

### Claim Flow
```
1. User views active vaults (getActiveVaults)
2. Check eligibility (canUserClaim) → enable/disable button
3. User clicks [Claim ETH] → claim(vaultId)
4. Success → update UI, show claimed status
```

### Return Flow (Returnable vaults only)
```
1. User has claimed → show [Return Funds] button
2. User clicks [Return Funds] → returnFunds(vaultId) with ETH
3. Success → increment returnCount, show "Good Actor" badge
```

### Admin Flow
```
1. Create vault → createVault(name, desc, amount, type)
2. Fund vault → deposit(vaultId) with ETH
3. Monitor → getVault(vaultId) for stats
4. Withdraw → withdraw(vaultId, amount)
5. Pause/Resume → updateVault(..., active)
```
