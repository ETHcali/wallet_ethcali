# Swag1155 Frontend Integration Guide - Complete Implementation

**Production-Ready implementation guide** for the Swag1155 ERC-1155 contract frontend. This is your complete reference for building the admin panel and user store.

**Version**: 2.1 - Complete Implementation with Redemption Flow
**Last Updated**: January 2026
**Frameworks**: React 18+ with Wagmi v2 + Viem + TanStack Query

---

## Table of Contents

1. [Overview & Architecture](#overview--architecture)
2. [Initial Setup](#initial-setup)
3. [Admin: Product Creation System](#admin-product-creation-system)
4. [User: Store & Purchasing System](#user-store--purchasing-system)
5. [Production Components](#production-components)
6. [Advanced: Cart & Batch Operations](#advanced-cart--batch-operations)
7. [Redemption: Physical Swag Claim Flow](#redemption-physical-swag-claim-flow)
8. [Error Handling & State Management](#error-handling--state-management)
9. [Contract Integration Reference](#contract-integration-reference)
10. [Testing Checklist](#testing-checklist)
11. [Troubleshooting Guide](#troubleshooting-guide)

---

## Overview & Architecture

### What is Swag1155?

Swag1155 is an ERC-1155 smart contract managing product variants with USDC payments:

- **Products**: Admin creates dynamically (e.g., "Black Tee")
- **Variants**: Each product has multiple sizes = separate token IDs
- **Pricing**: Each variant has its own price in USDC (6 decimals)
- **Supply**: Splits across sizes automatically
- **Metadata**: Per-token IPFS URIs with image + traits

### Key Concepts

| Term | Meaning | Example |
|------|---------|---------|
| **TokenId** | Unique ID = product + size | `1001` (product 100, size S) |
| **BaseId** | Product identifier | `100` |
| **Size Offset** | S=1, M=2, L=3, XL=4, NA=5 | Formula: `tokenId = baseId * 10 + offset` |
| **Metadata URI** | IPFS JSON location | `ipfs://QmXXX...` |
| **Image URI** | IPFS image location | `ipfs://QmYYY...` |
| **Supply** | Max mintable per variant | `5` (e.g., 20 total ÷ 4 sizes) |
| **Price** | Cost in USDC base units | `25000000` = 25 USDC |
| **RedemptionStatus** | NFT claim state | `0=NotRedeemed`, `1=PendingFulfillment`, `2=Fulfilled` |

### Responsibilities

| Layer | Admin | User | Contract |
|-------|-------|------|----------|
| **Image Upload** | ✓ | ✗ | ✗ |
| **Metadata JSON** | ✓ (generated) | ✗ | ✗ |
| **IPFS Pinning** | ✓ (via frontend) | ✗ | ✗ |
| **Contract Calls** | ✓ (setVariantWithURI) | ✓ (buy) | ✓ (stores data) |
| **USDC Approval** | ✗ | ✓ | ✓ (transfers) |
| **NFT Minting** | ✗ | ✓ | ✓ |
| **Redemption Request** | ✗ | ✓ (redeem) | ✓ (tracks status) |
| **Shipping Collection** | ✗ | ✓ (off-chain) | ✗ |
| **Fulfillment Verify** | ✓ (markFulfilled) | ✗ | ✓ (updates status) |

---

## Initial Setup

### 1. Get Contract Addresses & ABI

From the smart contract repository:

```bash
npx hardhat run scripts/setup-frontend.ts
```

This generates in `frontend/` directory:
- `contracts.json` - Multi-network config
- `addresses.json` - All addresses
- `contracts.ts` - TypeScript exports
- `abis/Swag1155.json` - Contract ABI

### 2. Install Dependencies

```bash
npm install wagmi viem @tanstack/react-query @tanstack/react-query-devtools
npm install @pinata/sdk zustand
npm install ethers  # For contract interaction utilities
```

### 3. Environment Configuration

Create `.env.local`:

```bash
# Contract Addresses (per network)
VITE_SWAG1155_ADDRESS_BASE=0x...
VITE_SWAG1155_ADDRESS_ETHEREUM=0x...
VITE_SWAG1155_ADDRESS_UNICHAIN=0x...

# USDC Addresses (6 decimals, network-specific)
VITE_USDC_ADDRESS_BASE=0x833589fCD6eDb6E08f4c7C32D4f71b1566469C5d
VITE_USDC_ADDRESS_ETHEREUM=0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48
VITE_USDC_ADDRESS_UNICHAIN=0x5a1b40E9B1c89b2B72D0c7c1b45C07e9e6d55dCd

# IPFS/Pinata
VITE_PINATA_JWT=your_jwt_token
VITE_PINATA_GATEWAY=https://gateway.pinata.cloud/ipfs

# Optional
VITE_DEFAULT_NETWORK=base
```

### 4. Wagmi Configuration

Create `src/config/wagmi.ts`:

```typescript
import { createConfig, http } from 'wagmi';
import { base, mainnet, defineChain } from 'wagmi/chains';

const unichain = defineChain({
  id: 130,
  name: 'Unichain Mainnet',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://unichain-mainnet.infura.io/v3/YOUR_KEY'] },
  },
  blockExplorers: {
    default: { name: 'Blockscout', url: 'https://explorer.unichain.org' },
  },
});

export const wagmiConfig = createConfig({
  chains: [base, mainnet, unichain],
  transports: {
    [base.id]: http(),
    [mainnet.id]: http(),
    [unichain.id]: http(),
  },
});
```

### 5. Network Utilities

Create `src/utils/network.ts`:

```typescript
import { useChainId } from 'wagmi';

const CHAIN_CONFIGS = {
  8453: { name: 'Base', swag1155: import.meta.env.VITE_SWAG1155_ADDRESS_BASE, usdc: import.meta.env.VITE_USDC_ADDRESS_BASE },
  1: { name: 'Ethereum', swag1155: import.meta.env.VITE_SWAG1155_ADDRESS_ETHEREUM, usdc: import.meta.env.VITE_USDC_ADDRESS_ETHEREUM },
  130: { name: 'Unichain', swag1155: import.meta.env.VITE_SWAG1155_ADDRESS_UNICHAIN, usdc: import.meta.env.VITE_USDC_ADDRESS_UNICHAIN },
};

export function getChainConfig(chainId: number) {
  return CHAIN_CONFIGS[chainId as keyof typeof CHAIN_CONFIGS];
}

export function useSwagAddresses() {
  const chainId = useChainId();
  const config = getChainConfig(chainId);
  return { swag1155: config?.swag1155 || '', usdc: config?.usdc || '', chainId };
}

export function getSupportedNetworks() {
  return [
    { id: 8453, name: 'Base', label: 'base' },
    { id: 1, name: 'Ethereum', label: 'ethereum' },
    { id: 130, name: 'Unichain', label: 'unichain' },
  ];
}
```

---

## Admin: Product Creation System

Complete system for admins to create products dynamically.

### Step 1: Type Definitions

Create `src/types/product.ts`:

```typescript
export type Size = 'S' | 'M' | 'L' | 'XL' | 'NA';
export type Gender = 'Male' | 'Female';

export interface ProductTraits {
  gender: Gender;
  color: string;
  style: string;
}

export interface ProductFormData {
  name: string;
  description: string;
  imageUri: string;
  price: number; // Decimal USDC (e.g., 25.50)
  totalSupply: number;
  traits: ProductTraits;
  sizes: Size[];
}

export interface Swag1155Metadata {
  name: string;
  description: string;
  image: string;
  attributes: Array<{
    trait_type: 'Product' | 'Color' | 'Gender' | 'Style' | 'Size';
    value: string;
  }>;
}

// Redemption status enum (mirrors contract)
export enum RedemptionStatus {
  NotRedeemed = 0,
  PendingFulfillment = 1,
  Fulfilled = 2,
}

export interface RedemptionInfo {
  tokenId: bigint;
  owner: string;
  status: RedemptionStatus;
}
```

### Step 2: IPFS Service

Create `src/services/pinata.ts`:

```typescript
import { PinataSDK } from '@pinata/sdk';

const pinata = new PinataSDK({
  pinataJwt: import.meta.env.VITE_PINATA_JWT,
});

export async function uploadImageToPinata(file: File): Promise<string> {
  const res = await pinata.pinFileToIPFS(file, {
    pinataMetadata: {
      name: file.name,
      keyvalues: { type: 'swag-image', uploadedAt: new Date().toISOString() },
    },
  });
  return `ipfs://${res.IpfsHash}`;
}

export async function pinMetadataToIPFS(metadata: any): Promise<string> {
  const res = await pinata.pinJSONToIPFS(metadata, {
    pinataMetadata: {
      name: `swag-metadata-${Date.now()}`,
      keyvalues: { type: 'swag-metadata' },
    },
  });
  return `ipfs://${res.IpfsHash}`;
}

export function getIPFSGatewayUrl(ipfsUri: string): string {
  return ipfsUri.replace('ipfs://', `${import.meta.env.VITE_PINATA_GATEWAY}/`);
}
```

### Step 3: TokenId & Metadata Generation

Create `src/utils/tokenGeneration.ts`:

```typescript
import { ProductFormData, Swag1155Metadata, Size } from '../types/product';

const SIZE_TO_OFFSET: Record<Size, number> = { S: 1, M: 2, L: 3, XL: 4, NA: 5 };
const OFFSET_TO_SIZE: Record<number, Size> = { 1: 'S', 2: 'M', 3: 'L', 4: 'XL', 5: 'NA' };

export function generateTokenId(baseId: number, size: Size): bigint {
  return BigInt(baseId * 10 + SIZE_TO_OFFSET[size]);
}

export function parseTokenId(tokenId: bigint): { baseId: number; size: Size } {
  const id = Number(tokenId);
  return {
    baseId: Math.floor(id / 10),
    size: OFFSET_TO_SIZE[id % 10] || 'NA',
  };
}

export function generateMetadata(product: ProductFormData, size: Size): Swag1155Metadata {
  const sizeLabel = size === 'NA' ? 'One Size' : size;
  return {
    name: `${product.name} - ${product.traits.color} - ${product.traits.gender} - ${sizeLabel}`,
    description: product.description,
    image: product.imageUri,
    attributes: [
      { trait_type: 'Product', value: product.name },
      { trait_type: 'Color', value: product.traits.color },
      { trait_type: 'Gender', value: product.traits.gender },
      { trait_type: 'Style', value: product.traits.style },
      { trait_type: 'Size', value: sizeLabel },
    ],
  };
}

export function priceToBaseUnits(decimalPrice: number): bigint {
  return BigInt(Math.round(decimalPrice * 1e6));
}

export function baseUnitsToPrice(baseUnits: bigint): number {
  return Number(baseUnits) / 1e6;
}

export function calculateSupplyPerSize(totalSupply: number, sizes: Size[]): number {
  return Math.floor(totalSupply / sizes.length);
}
```

### Step 4: Admin Hook

Create `src/hooks/useProductCreation.ts`:

```typescript
import { useState } from 'react';
import { useWriteContract } from 'wagmi';
import Swag1155ABI from '../abis/Swag1155.json';
import { useSwagAddresses } from '../utils/network';
import { ProductFormData } from '../types/product';
import { uploadImageToPinata, pinMetadataToIPFS } from '../services/pinata';
import { generateTokenId, generateMetadata, calculateSupplyPerSize, priceToBaseUnits } from '../utils/tokenGeneration';

export function useProductCreation() {
  const { swag1155 } = useSwagAddresses();
  const [state, setState] = useState({
    isLoading: false,
    error: null as string | null,
    progress: 0,
    currentStep: 'idle' as 'idle' | 'uploading-image' | 'creating-variants' | 'complete',
  });

  const { writeContractAsync } = useWriteContract();

  const createProduct = async (product: ProductFormData, imageFile?: File) => {
    try {
      setState({ isLoading: true, error: null, progress: 0, currentStep: 'uploading-image' });

      let imageUri = product.imageUri;
      if (imageFile) {
        imageUri = await uploadImageToPinata(imageFile);
        setState((prev) => ({ ...prev, progress: 20 }));
      }

      setState((prev) => ({ ...prev, currentStep: 'creating-variants' }));

      const supplyPerSize = calculateSupplyPerSize(product.totalSupply, product.sizes);
      const priceBaseUnits = priceToBaseUnits(product.price);
      const baseId = Date.now() % 1000000;

      for (let i = 0; i < product.sizes.length; i++) {
        const size = product.sizes[i];
        const tokenId = generateTokenId(baseId, size);
        const metadata = generateMetadata({ ...product, imageUri }, size);
        const metadataUri = await pinMetadataToIPFS(metadata);

        await writeContractAsync({
          address: swag1155,
          abi: Swag1155ABI,
          functionName: 'setVariantWithURI',
          args: [tokenId, priceBaseUnits, BigInt(supplyPerSize), true, metadataUri],
        });

        setState((prev) => ({
          ...prev,
          progress: 20 + ((i + 1) / product.sizes.length) * 80,
        }));
      }

      setState({ isLoading: false, error: null, progress: 100, currentStep: 'complete' });
      return { success: true, baseId };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState({ isLoading: false, error: errorMessage, progress: 0, currentStep: 'idle' });
      throw error;
    }
  };

  return { createProduct, ...state };
}
```

### Step 5: Admin Form Component

Create `src/components/AdminProductForm.tsx`:

```typescript
import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { useProductCreation } from '../hooks/useProductCreation';
import { ProductFormData, Size, Gender } from '../types/product';
import './AdminProductForm.css';

const AVAILABLE_SIZES: Size[] = ['S', 'M', 'L', 'XL', 'NA'];
const AVAILABLE_GENDERS: Gender[] = ['Male', 'Female'];

export function AdminProductForm() {
  const { address, isConnected } = useAccount();
  const { createProduct, isLoading, error, progress, currentStep } = useProductCreation();

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [form, setForm] = useState<ProductFormData>({
    name: '',
    description: '',
    imageUri: '',
    price: 0,
    totalSupply: 0,
    traits: { gender: 'Male', color: '', style: '' },
    sizes: [],
  });

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (event) => setImagePreview(event.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const toggleSize = (size: Size) => {
    setForm((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size) ? prev.sizes.filter((s) => s !== size) : [...prev.sizes, size],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.sizes.length) {
      alert('Select at least one size');
      return;
    }

    if (!imageFile && !form.imageUri) {
      alert('Upload an image or provide IPFS URI');
      return;
    }

    try {
      const result = await createProduct(form, imageFile || undefined);
      alert(`✅ Product created! Base ID: ${result.baseId}`);
      setForm({
        name: '',
        description: '',
        imageUri: '',
        price: 0,
        totalSupply: 0,
        traits: { gender: 'Male', color: '', style: '' },
        sizes: [],
      });
      setImageFile(null);
      setImagePreview('');
    } catch (err) {
      console.error('Product creation failed:', err);
    }
  };

  if (!isConnected) {
    return <div className="alert alert-warning">Connect wallet to create products</div>;
  }

  const supplyPerSize = form.sizes.length > 0 ? Math.floor(form.totalSupply / form.sizes.length) : 0;

  return (
    <form onSubmit={handleSubmit} className="admin-product-form">
      <h2>Create Swag Product</h2>

      {/* Image Upload */}
      <div className="form-group">
        <label>Product Image *</label>
        <input type="file" accept="image/*" onChange={handleImageSelect} disabled={isLoading} />
        {imagePreview && (
          <div className="image-preview">
            <img src={imagePreview} alt="Preview" width={150} />
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="form-group">
        <label>Product Name *</label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="e.g., ETH Cali Tee"
          disabled={isLoading}
          required
        />
      </div>

      <div className="form-group">
        <label>Description *</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Describe your product..."
          disabled={isLoading}
          required
          rows={3}
        />
      </div>

      {/* Pricing */}
      <div className="form-row">
        <div className="form-group">
          <label>Price (USDC) *</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) })}
            placeholder="e.g., 25.50"
            disabled={isLoading}
            required
          />
        </div>

        <div className="form-group">
          <label>Total Supply *</label>
          <input
            type="number"
            min="1"
            value={form.totalSupply}
            onChange={(e) => setForm({ ...form, totalSupply: parseInt(e.target.value) })}
            placeholder="e.g., 20"
            disabled={isLoading}
            required
          />
        </div>
      </div>

      {/* Traits */}
      <div className="form-group">
        <label>Traits</label>

        <div className="form-row">
          <select
            value={form.traits.gender}
            onChange={(e) =>
              setForm({
                ...form,
                traits: { ...form.traits, gender: e.target.value as Gender },
              })
            }
            disabled={isLoading}
          >
            {AVAILABLE_GENDERS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>

          <input
            type="text"
            value={form.traits.color}
            onChange={(e) => setForm({ ...form, traits: { ...form.traits, color: e.target.value } })}
            placeholder="Color"
            disabled={isLoading}
          />

          <input
            type="text"
            value={form.traits.style}
            onChange={(e) => setForm({ ...form, traits: { ...form.traits, style: e.target.value } })}
            placeholder="Style"
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Sizes */}
      <div className="form-group">
        <label>Sizes *</label>
        <div className="size-selector">
          {AVAILABLE_SIZES.map((size) => (
            <button
              key={size}
              type="button"
              className={`size-btn ${form.sizes.includes(size) ? 'active' : ''}`}
              onClick={() => toggleSize(size)}
              disabled={isLoading}
            >
              {size}
            </button>
          ))}
        </div>
        {supplyPerSize > 0 && <p className="info">Supply per size: {supplyPerSize} units</p>}
      </div>

      {/* Status */}
      {currentStep !== 'idle' && (
        <div className="status-section">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <p>
            {currentStep === 'uploading-image' && '⏳ Uploading image...'}
            {currentStep === 'creating-variants' && '⏳ Creating variants...'}
            {currentStep === 'complete' && '✅ Product created!'}
          </p>
        </div>
      )}

      {error && <div className="alert alert-error">{error}</div>}

      <button type="submit" disabled={isLoading} className="btn btn-primary btn-block">
        {isLoading ? `${progress}% - Creating...` : 'Create Product'}
      </button>
    </form>
  );
}
```

---

## User: Store & Purchasing System

Complete store implementation for users to browse and purchase.

### Step 1: Data Fetching Hooks

Create `src/hooks/useSwagStore.ts`:

```typescript
import { useQuery } from '@tanstack/react-query';
import { useReadContract, useWriteContract } from 'wagmi';
import Swag1155ABI from '../abis/Swag1155.json';
import ERC20ABI from '../abis/ERC20.json';
import { useSwagAddresses } from '../utils/network';
import { baseUnitsToPrice, getIPFSGatewayUrl } from '../utils/tokenGeneration';

export function useVariant(tokenId: bigint) {
  const { swag1155 } = useSwagAddresses();

  const { data, isLoading, error } = useReadContract({
    address: swag1155,
    abi: Swag1155ABI,
    functionName: 'variants',
    args: [tokenId],
  });

  return {
    price: data ? baseUnitsToPrice(BigInt(data[0])) : 0,
    maxSupply: data ? Number(data[1]) : 0,
    minted: data ? Number(data[2]) : 0,
    available: data ? Number(data[1]) - Number(data[2]) : 0,
    active: data ? data[3] : false,
    isLoading,
    error: error?.message || null,
  };
}

export function useVariantUri(tokenId: bigint) {
  const { swag1155 } = useSwagAddresses();

  const { data: uri, isLoading, error } = useReadContract({
    address: swag1155,
    abi: Swag1155ABI,
    functionName: 'uri',
    args: [tokenId],
  });

  return {
    uri: uri || '',
    gatewayUrl: uri ? getIPFSGatewayUrl(uri) : '',
    isLoading,
    error: error?.message || null,
  };
}

export function useVariantMetadata(tokenId: bigint) {
  const { uri, gatewayUrl, isLoading: isUriLoading } = useVariantUri(tokenId);

  const { data, isLoading, error } = useQuery({
    queryKey: ['variant-metadata', tokenId],
    queryFn: async () => {
      if (!gatewayUrl) return null;
      const res = await fetch(gatewayUrl);
      if (!res.ok) throw new Error('Failed to fetch metadata');
      return res.json();
    },
    enabled: !!gatewayUrl,
  });

  return { metadata: data, isLoading: isUriLoading || isLoading, error: error?.message || null };
}

export function useBuyNFT() {
  const { swag1155, usdc } = useSwagAddresses();
  const { writeContractAsync: writeSwag1155 } = useWriteContract();
  const { writeContractAsync: writeUsdc } = useWriteContract();

  const mutate = async (tokenId: bigint, quantity: bigint, price: number) => {
    const totalPrice = BigInt(Math.round(price * quantity * 1e6));

    // Approve USDC
    await writeUsdc({
      address: usdc,
      abi: ERC20ABI,
      functionName: 'approve',
      args: [swag1155, totalPrice],
    });

    // Buy
    return writeSwag1155({
      address: swag1155,
      abi: Swag1155ABI,
      functionName: 'buy',
      args: [tokenId, quantity],
    });
  };

  return { mutate };
}
```

### Step 2: Product Card Component

Create `src/components/ProductCard.tsx`:

```typescript
import React, { useState } from 'react';
import { useVariant, useVariantMetadata, useBuyNFT } from '../hooks/useSwagStore';
import { getIPFSGatewayUrl } from '../services/pinata';
import './ProductCard.css';

interface ProductCardProps {
  tokenId: bigint;
  size: string;
}

export function ProductCard({ tokenId, size }: ProductCardProps) {
  const [quantity, setQuantity] = useState(1);
  const variant = useVariant(tokenId);
  const { metadata } = useVariantMetadata(tokenId);
  const { mutate: buyNFT } = useBuyNFT();
  const [isPending, setIsPending] = useState(false);

  if (variant.isLoading) return <div className="product-card loading">Loading...</div>;
  if (!metadata) return <div className="product-card error">Product not found</div>;

  const imageUrl = getIPFSGatewayUrl(metadata.image);

  const handleBuy = async () => {
    if (!variant.active) {
      alert('Product unavailable');
      return;
    }
    if (quantity > variant.available) {
      alert(`Only ${variant.available} available`);
      return;
    }

    try {
      setIsPending(true);
      await buyNFT(tokenId, BigInt(quantity), variant.price);
      alert('✅ Purchase successful!');
      setQuantity(1);
    } catch (error) {
      alert('Purchase failed');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="product-card">
      <div className="product-image">
        <img src={imageUrl} alt={metadata.name} />
      </div>
      <div className="product-info">
        <h3>{metadata.name}</h3>
        <p className="description">{metadata.description}</p>
        <div className="traits">
          {metadata.attributes.map((attr: any) => (
            <span key={attr.trait_type} className="trait">
              {attr.trait_type}: {attr.value}
            </span>
          ))}
        </div>
        <p className="price">${variant.price.toFixed(2)}</p>
        <p className={`availability ${variant.available > 0 ? 'in-stock' : 'sold-out'}`}>
          {variant.available > 0 ? `${variant.available} in stock` : 'Sold out'}
        </p>
        {variant.available > 0 && (
          <div className="purchase">
            <input
              type="number"
              min="1"
              max={variant.available}
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              disabled={isPending}
            />
            <button onClick={handleBuy} disabled={isPending || !variant.active}>
              {isPending ? 'Buying...' : 'Buy'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## Production Components

### 1. Admin Dashboard Layout

Create `src/pages/AdminDashboard.tsx`:

```typescript
import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { AdminProductForm } from '../components/AdminProductForm';
import { ProductsList } from '../components/ProductsList';
import './AdminDashboard.css';

export function AdminDashboard() {
  const { address, isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState<'create' | 'list'>('create');
  const ADMIN_ADDRESS = '0x1fd2A56907B1db9B29c2D8F0037b6D4E104f5711'; // From env

  if (!isConnected) {
    return <div className="alert">Connect your wallet to access admin panel</div>;
  }

  if (address?.toLowerCase() !== ADMIN_ADDRESS.toLowerCase()) {
    return <div className="alert">Only admin can access this page</div>;
  }

  return (
    <div className="admin-dashboard">
      <h1>Swag Admin Panel</h1>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'create' ? 'active' : ''}`}
          onClick={() => setActiveTab('create')}
        >
          Create Product
        </button>
        <button
          className={`tab ${activeTab === 'list' ? 'active' : ''}`}
          onClick={() => setActiveTab('list')}
        >
          Manage Products
        </button>
      </div>

      {activeTab === 'create' && <AdminProductForm />}
      {activeTab === 'list' && <ProductsList />}
    </div>
  );
}
```

### 2. Store Page

Create `src/pages/StorePage.tsx`:

```typescript
import React, { useState } from 'react';
import { ProductCard } from '../components/ProductCard';
import './StorePage.css';

export function StorePage() {
  // In production, fetch products from blockchain or API
  const [filters, setFilters] = useState({
    color: '',
    size: '',
  });

  const products = [
    // Example: Fetch from contract or API
    { tokenId: BigInt(1001), size: 'S' },
    { tokenId: BigInt(1002), size: 'M' },
  ];

  return (
    <div className="store-page">
      <h1>ETH Cali Swag Store</h1>

      <div className="store-layout">
        <aside className="filters">
          <h3>Filters</h3>
          {/* Filter controls */}
        </aside>

        <main className="products">
          <div className="products-grid">
            {products.map(({ tokenId, size }) => (
              <ProductCard key={`${tokenId}-${size}`} tokenId={tokenId} size={size} />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
```

---

## Redemption: Physical Swag Claim Flow

Complete system for users to redeem physical merchandise with their NFT, and admins to verify fulfillment.

### Redemption Flow Overview

```
┌─────────────────┐     ┌──────────────────────┐     ┌─────────────┐
│  NotRedeemed    │ ──▶ │  PendingFulfillment  │ ──▶ │  Fulfilled  │
│  (User owns NFT)│     │  (Claim requested)   │     │  (Shipped)  │
└─────────────────┘     └──────────────────────┘     └─────────────┘
                                │                          │
                         User: redeem()           Admin: markFulfilled()
                         + Backend collects        (verifies shipment)
                           shipping address
```

### Step 1: Redemption Hooks

Create `src/hooks/useRedemption.ts`:

```typescript
import { useReadContract, useWriteContract } from 'wagmi';
import { useAccount } from 'wagmi';
import Swag1155ABI from '../abis/Swag1155.json';
import { useSwagAddresses } from '../utils/network';
import { RedemptionStatus } from '../types/product';

// Get redemption status for a user's NFT
export function useRedemptionStatus(tokenId: bigint, owner?: string) {
  const { swag1155 } = useSwagAddresses();
  const { address } = useAccount();
  const ownerAddress = owner || address;

  const { data, isLoading, error, refetch } = useReadContract({
    address: swag1155,
    abi: Swag1155ABI,
    functionName: 'getRedemptionStatus',
    args: [tokenId, ownerAddress],
    query: { enabled: !!ownerAddress },
  });

  return {
    status: (data as number) ?? RedemptionStatus.NotRedeemed,
    statusLabel: getStatusLabel(data as number),
    isLoading,
    error: error?.message || null,
    refetch,
  };
}

// User requests redemption
export function useRedeem() {
  const { swag1155 } = useSwagAddresses();
  const { writeContractAsync, isPending, error } = useWriteContract();

  const redeem = async (tokenId: bigint) => {
    return writeContractAsync({
      address: swag1155,
      abi: Swag1155ABI,
      functionName: 'redeem',
      args: [tokenId],
    });
  };

  return { redeem, isPending, error: error?.message || null };
}

// Admin marks redemption as fulfilled
export function useMarkFulfilled() {
  const { swag1155 } = useSwagAddresses();
  const { writeContractAsync, isPending, error } = useWriteContract();

  const markFulfilled = async (tokenId: bigint, owner: string) => {
    return writeContractAsync({
      address: swag1155,
      abi: Swag1155ABI,
      functionName: 'markFulfilled',
      args: [tokenId, owner],
    });
  };

  return { markFulfilled, isPending, error: error?.message || null };
}

// Helper to get human-readable status
function getStatusLabel(status: number): string {
  switch (status) {
    case RedemptionStatus.NotRedeemed:
      return 'Not Redeemed';
    case RedemptionStatus.PendingFulfillment:
      return 'Pending Fulfillment';
    case RedemptionStatus.Fulfilled:
      return 'Fulfilled';
    default:
      return 'Unknown';
  }
}
```

### Step 2: User Redemption Component

Create `src/components/RedeemButton.tsx`:

```typescript
import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { useRedemptionStatus, useRedeem } from '../hooks/useRedemption';
import { RedemptionStatus } from '../types/product';
import './RedeemButton.css';

interface RedeemButtonProps {
  tokenId: bigint;
  onRedeemSuccess?: () => void;
}

export function RedeemButton({ tokenId, onRedeemSuccess }: RedeemButtonProps) {
  const { address, isConnected } = useAccount();
  const { status, statusLabel, refetch } = useRedemptionStatus(tokenId);
  const { redeem, isPending, error } = useRedeem();
  const [showShippingModal, setShowShippingModal] = useState(false);

  if (!isConnected) {
    return <button disabled>Connect Wallet</button>;
  }

  const handleRedeem = async () => {
    try {
      await redeem(tokenId);
      setShowShippingModal(true); // Prompt user to submit shipping info
      refetch();
      onRedeemSuccess?.();
    } catch (err) {
      console.error('Redemption failed:', err);
    }
  };

  // Already fulfilled
  if (status === RedemptionStatus.Fulfilled) {
    return (
      <div className="redemption-status fulfilled">
        <span className="status-icon">✅</span>
        <span>Shipped</span>
      </div>
    );
  }

  // Pending fulfillment
  if (status === RedemptionStatus.PendingFulfillment) {
    return (
      <div className="redemption-status pending">
        <span className="status-icon">📦</span>
        <span>Awaiting Shipment</span>
      </div>
    );
  }

  // Not redeemed - show redeem button
  return (
    <>
      <button
        onClick={handleRedeem}
        disabled={isPending}
        className="btn btn-redeem"
      >
        {isPending ? 'Redeeming...' : 'Redeem Physical Item'}
      </button>

      {error && <p className="error">{error}</p>}

      {showShippingModal && (
        <ShippingModal
          tokenId={tokenId}
          onClose={() => setShowShippingModal(false)}
        />
      )}
    </>
  );
}

// Modal to collect shipping address (sends to backend)
function ShippingModal({ tokenId, onClose }: { tokenId: bigint; onClose: () => void }) {
  const { address } = useAccount();
  const [form, setForm] = useState({
    name: '',
    street: '',
    city: '',
    country: '',
    postalCode: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Send to your backend API (not on-chain - sensitive data)
      await fetch('/api/shipping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tokenId: tokenId.toString(),
          wallet: address,
          shipping: form,
        }),
      });

      alert('✅ Shipping info submitted! You will receive your item soon.');
      onClose();
    } catch (err) {
      alert('Failed to submit shipping info');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Enter Shipping Address</h3>
        <p className="info">Your NFT has been marked for redemption. Please provide your shipping details.</p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Full Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Street Address"
            value={form.street}
            onChange={(e) => setForm({ ...form, street: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="City"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Country"
            value={form.country}
            onChange={(e) => setForm({ ...form, country: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Postal Code"
            value={form.postalCode}
            onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
            required
          />

          <div className="modal-actions">
            <button type="button" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

### Step 3: Admin Fulfillment Dashboard

Create `src/components/AdminRedemptions.tsx`:

```typescript
import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { useMarkFulfilled } from '../hooks/useRedemption';
import './AdminRedemptions.css';

interface PendingRedemption {
  tokenId: bigint;
  owner: string;
  productName: string;
  requestedAt: string;
  shippingInfo?: {
    name: string;
    street: string;
    city: string;
    country: string;
    postalCode: string;
  };
}

export function AdminRedemptions() {
  const { address } = useAccount();
  const { markFulfilled, isPending } = useMarkFulfilled();
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Fetch pending redemptions from backend
  // In production: useQuery to fetch from your API
  const [redemptions, setRedemptions] = useState<PendingRedemption[]>([]);

  const handleMarkFulfilled = async (redemption: PendingRedemption) => {
    const key = `${redemption.tokenId}-${redemption.owner}`;
    setProcessingId(key);

    try {
      await markFulfilled(redemption.tokenId, redemption.owner);

      // Update backend status
      await fetch('/api/admin/fulfillment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tokenId: redemption.tokenId.toString(),
          owner: redemption.owner,
          fulfilledBy: address,
        }),
      });

      // Remove from list
      setRedemptions((prev) =>
        prev.filter((r) => !(r.tokenId === redemption.tokenId && r.owner === redemption.owner))
      );

      alert('✅ Marked as fulfilled!');
    } catch (err) {
      alert('Failed to mark as fulfilled');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="admin-redemptions">
      <h2>Pending Redemptions</h2>

      {redemptions.length === 0 ? (
        <p className="empty">No pending redemptions</p>
      ) : (
        <table className="redemptions-table">
          <thead>
            <tr>
              <th>Token ID</th>
              <th>Product</th>
              <th>Owner</th>
              <th>Shipping</th>
              <th>Requested</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {redemptions.map((r) => {
              const key = `${r.tokenId}-${r.owner}`;
              const isProcessing = processingId === key;

              return (
                <tr key={key}>
                  <td>{r.tokenId.toString()}</td>
                  <td>{r.productName}</td>
                  <td className="address">{r.owner.slice(0, 6)}...{r.owner.slice(-4)}</td>
                  <td>
                    {r.shippingInfo ? (
                      <details>
                        <summary>View</summary>
                        <div className="shipping-details">
                          <p>{r.shippingInfo.name}</p>
                          <p>{r.shippingInfo.street}</p>
                          <p>{r.shippingInfo.city}, {r.shippingInfo.postalCode}</p>
                          <p>{r.shippingInfo.country}</p>
                        </div>
                      </details>
                    ) : (
                      <span className="warning">Missing</span>
                    )}
                  </td>
                  <td>{r.requestedAt}</td>
                  <td>
                    <button
                      onClick={() => handleMarkFulfilled(r)}
                      disabled={isProcessing || isPending}
                      className="btn btn-fulfill"
                    >
                      {isProcessing ? 'Processing...' : 'Mark Shipped'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
```

### Step 4: Update Admin Dashboard

Add redemption tab to `AdminDashboard.tsx`:

```typescript
import { AdminRedemptions } from '../components/AdminRedemptions';

// In the tabs section:
<button
  className={`tab ${activeTab === 'redemptions' ? 'active' : ''}`}
  onClick={() => setActiveTab('redemptions')}
>
  Redemptions
</button>

// In the content section:
{activeTab === 'redemptions' && <AdminRedemptions />}
```

### Step 5: Listen to Redemption Events

Create `src/hooks/useRedemptionEvents.ts`:

```typescript
import { useWatchContractEvent } from 'wagmi';
import Swag1155ABI from '../abis/Swag1155.json';
import { useSwagAddresses } from '../utils/network';

export function useRedemptionEvents(onRedemptionRequested?: (owner: string, tokenId: bigint) => void) {
  const { swag1155 } = useSwagAddresses();

  useWatchContractEvent({
    address: swag1155,
    abi: Swag1155ABI,
    eventName: 'RedemptionRequested',
    onLogs(logs) {
      logs.forEach((log) => {
        const { owner, tokenId } = log.args as { owner: string; tokenId: bigint };
        console.log(`Redemption requested: ${owner} for token ${tokenId}`);
        onRedemptionRequested?.(owner, tokenId);
      });
    },
  });
}

export function useFulfillmentEvents(onFulfilled?: (owner: string, tokenId: bigint, admin: string) => void) {
  const { swag1155 } = useSwagAddresses();

  useWatchContractEvent({
    address: swag1155,
    abi: Swag1155ABI,
    eventName: 'RedemptionFulfilled',
    onLogs(logs) {
      logs.forEach((log) => {
        const { owner, tokenId, admin } = log.args as { owner: string; tokenId: bigint; admin: string };
        console.log(`Redemption fulfilled: ${owner} for token ${tokenId} by ${admin}`);
        onFulfilled?.(owner, tokenId, admin);
      });
    },
  });
}
```

---

## Error Handling & State Management

### Error Boundary Component

Create `src/components/ErrorBoundary.tsx`:

```typescript
import React, { ReactNode } from 'react';

export class ErrorBoundary extends React.Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-fallback">
          <h2>Something went wrong</h2>
          <p>{this.state.error?.message}</p>
          <button onClick={() => window.location.reload()}>Reload</button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

---

## Contract Integration Reference

### Swag1155 ABI Functions

```typescript
// Admin - Create variant with per-token URI
function setVariantWithURI(
  uint256 tokenId,
  uint256 price,
  uint256 maxSupply,
  bool active,
  string memory tokenURI
) external onlyRole(ADMIN_ROLE)

// User - Buy single
function buy(uint256 tokenId, uint256 quantity) external

// User - Buy batch
function buyBatch(
  uint256[] calldata tokenIds,
  uint256[] calldata quantities
) external

// View - Get variant info
function variants(uint256 tokenId) external view returns (
  uint256 price,
  uint256 maxSupply,
  uint256 minted,
  bool active
)

// View - Get metadata URI
function uri(uint256 tokenId) external view returns (string memory)

// ---------- Redemption Functions ----------

// User - Request redemption for physical swag
function redeem(uint256 tokenId) external
// Requires: caller owns NFT, status == NotRedeemed
// Emits: RedemptionRequested(owner, tokenId)

// Admin - Mark redemption as fulfilled after verifying shipment
function markFulfilled(uint256 tokenId, address owner) external onlyRole(ADMIN_ROLE)
// Requires: status == PendingFulfillment
// Emits: RedemptionFulfilled(owner, tokenId, admin)

// View - Get redemption status
function getRedemptionStatus(uint256 tokenId, address owner) external view returns (RedemptionStatus)
// Returns: 0 = NotRedeemed, 1 = PendingFulfillment, 2 = Fulfilled

// Public mapping - Direct status lookup
mapping(uint256 => mapping(address => RedemptionStatus)) public redemptions;
```

### Redemption Events

```typescript
event RedemptionRequested(address indexed owner, uint256 indexed tokenId);
event RedemptionFulfilled(address indexed owner, uint256 indexed tokenId, address indexed admin);
```

---

## Testing Checklist

### Product Creation (Admin)
- [ ] Admin can upload image to IPFS
- [ ] Admin can create product with all sizes
- [ ] Product variants appear on blockchain within seconds

### Store & Purchasing (User)
- [ ] User can browse store with filters
- [ ] User can approve USDC
- [ ] User can purchase single NFT
- [ ] User can purchase multiple variants (batch)
- [ ] NFT appears in wallet after purchase
- [ ] Metadata displays correctly on OpenSea/explorers
- [ ] Supply decreases after purchase
- [ ] Out-of-stock products show disabled state

### Redemption Flow
- [ ] User can see "Redeem Physical Item" button on owned NFT
- [ ] User can call `redeem()` successfully
- [ ] Status changes to "Pending Fulfillment" after redemption
- [ ] Shipping modal appears after successful redemption
- [ ] Shipping info is sent to backend API
- [ ] Admin can view pending redemptions list
- [ ] Admin can see shipping details for each redemption
- [ ] Admin can call `markFulfilled()` successfully
- [ ] Status changes to "Fulfilled" after admin confirms
- [ ] User sees "Shipped" status on their NFT
- [ ] RedemptionRequested event is emitted correctly
- [ ] RedemptionFulfilled event is emitted correctly
- [ ] User cannot redeem same NFT twice (blocked by contract)

### General
- [ ] Error messages display helpful text
- [ ] Works on Base, Ethereum, Unichain

---

## Troubleshooting Guide

### Purchase Issues

| Issue | Solution |
|-------|----------|
| "Insufficient USDC" | User needs USDC on the network (check balance in wallet) |
| "Approval failed" | User must first approve USDC to Swag1155 contract |
| "Variant inactive" | Admin hasn't set `active: true` for the product |
| "Exceeds supply" | Variant sold out; admin can create new product |
| "Metadata not loading" | Check IPFS gateway URL; try different gateway |
| "Contract address invalid" | Check `.env.local` has correct address for current network |
| "Image upload stuck" | Check Pinata JWT is valid; network connection stable |
| "NFT not appearing in wallet" | Wait 30 seconds; refresh wallet; check correct network |
| "Wrong network" | Ensure wallet is on Base/Ethereum/Unichain |

### Redemption Issues

| Issue | Solution |
|-------|----------|
| "not owner" | User must own the NFT to redeem; check balanceOf |
| "already redeemed" | NFT already redeemed; status is PendingFulfillment or Fulfilled |
| "not pending" | Admin can only mark as fulfilled if status is PendingFulfillment |
| Redeem button not showing | Check user owns NFT; check redemption status isn't already redeemed |
| Shipping modal not appearing | Check redeem() transaction succeeded; check state update |
| Shipping API failed | Check backend `/api/shipping` endpoint is running |
| Admin can't see redemptions | Check backend API returns pending redemptions; check admin role |
| markFulfilled failed | Ensure caller has ADMIN_ROLE; ensure status is PendingFulfillment |

---

## Key Implementation Patterns

### Price Conversion
```typescript
// Decimal → Base Units (store in contract)
const baseUnits = BigInt(Math.round(25.50 * 1e6)); // 25500000

// Base Units → Decimal (display to user)
const decimal = Number(baseUnits) / 1e6; // 25.50
```

### TokenId Generation
```typescript
// Format: baseId * 10 + sizeOffset
const tokenId = BigInt(100 * 10 + 1); // 1001 (product 100, size S)

// Reverse
const baseId = Number(tokenId) / 10;
const sizeOffset = Number(tokenId) % 10;
```

### IPFS URLs
```typescript
// Store in contract/metadata as:
ipfs://Qm...

// Display in browser with gateway:
https://gateway.pinata.cloud/ipfs/Qm...
```

### Redemption Status Check
```typescript
import { RedemptionStatus } from '../types/product';

// Check if user can redeem
const canRedeem = (status: RedemptionStatus, ownsNFT: boolean): boolean => {
  return ownsNFT && status === RedemptionStatus.NotRedeemed;
};

// Get status display
const getStatusDisplay = (status: RedemptionStatus) => {
  switch (status) {
    case RedemptionStatus.NotRedeemed:
      return { label: 'Not Redeemed', icon: '🎁', color: 'gray' };
    case RedemptionStatus.PendingFulfillment:
      return { label: 'Awaiting Shipment', icon: '📦', color: 'yellow' };
    case RedemptionStatus.Fulfilled:
      return { label: 'Shipped', icon: '✅', color: 'green' };
  }
};
```

### Backend API Endpoints (Required)
```typescript
// POST /api/shipping - User submits shipping info
{
  tokenId: string;
  wallet: string;
  shipping: {
    name: string;
    street: string;
    city: string;
    country: string;
    postalCode: string;
  };
}

// GET /api/admin/redemptions - Admin fetches pending redemptions
// Returns: PendingRedemption[]

// POST /api/admin/fulfillment - Admin marks as fulfilled
{
  tokenId: string;
  owner: string;
  fulfilledBy: string;
}
```

---

## Next Steps for Frontend Team

1. **Setup Environment**: Copy `.env.local` template, fill in addresses
2. **Implement Admin**: Create ProductForm + ProductsList
3. **Implement Store**: Create ProductCard + StorePage
4. **Implement Redemption**: Create RedeemButton + ShippingModal + AdminRedemptions
5. **Setup Backend**: Create `/api/shipping` and `/api/admin/redemptions` endpoints
6. **Connect Wallet**: Integrate your wallet solution (Privy, Rainbow, etc.)
7. **Testing**: Test all flows on testnet (Base Sepolia, etc.)
8. **Deployment**: Deploy frontend to Vercel/Netlify
9. **Go Live**: Deploy on mainnet with real contract addresses

---

## Support & Questions

- **Contract API Reference**: Check [docs/SWAG1155_CONTRACT_REFERENCE.md](docs/SWAG1155_CONTRACT_REFERENCE.md) - Full documentation of all functions, parameters, and UI mapping
- **All Contract Docs**: See [docs/README.md](docs/README.md) - Hub for all contract documentation
- **Contract Issues**: Check [SWAG1155_DEPLOYMENT.md](SWAG1155_DEPLOYMENT.md)
- **Backend Integration**: See [SWAG1155_IMPLEMENTATION_SUMMARY.md](SWAG1155_IMPLEMENTATION_SUMMARY.md)
- **Contract Source**: [contracts/Swag1155.sol](contracts/Swag1155.sol)
