export type SizeOption = 'S' | 'M' | 'L' | 'XL' | 'NA';
export type GenderOption = 'Male' | 'Female' | 'Unisex';

export interface ProductTraits {
  gender: GenderOption;
  color: string;
  style: string;
}

// Legacy - may be removed if not used
export interface ProductFormData {
  name: string;
  description: string;
  imageUri: string;
  price: number;
  totalSupply: number;
  traits: ProductTraits;
  sizes: SizeOption[];
}

export interface Swag1155MetadataAttribute {
  trait_type: 'Product' | 'Color' | 'Gender' | 'Style' | 'Size';
  value: string;
}

export interface Swag1155Metadata {
  name: string;
  description: string;
  image: string;
  attributes?: Swag1155MetadataAttribute[];
}

// Design-based architecture types
export interface DesignInfo {
  name: string;
  description: string;
  imageUrl: string;
  website: string;
  paymentToken: string;
  pricePerUnit: bigint;
  totalSupply: bigint;
  minted: bigint;
  active: boolean;
  gender: string;
  color: string;
  style: string;
}

export enum DiscountType {
  PERCENTAGE = 0,
  FIXED_AMOUNT = 1,
}

export interface DiscountConfig {
  smartContractEnabled: boolean;
  smartContractAddress: string;
  smartContractDiscount: bigint;
  poapEnabled: boolean;
  poapEventId: bigint;
  poapDiscount: bigint;
  discountType: DiscountType;
}

export enum RedemptionStatus {
  NotRedeemed = 0,
  PendingFulfillment = 1,
  Fulfilled = 2,
}
