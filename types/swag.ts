export type SizeOption = 'S' | 'M' | 'L' | 'XL' | 'NA';
export type GenderOption = 'Male' | 'Female' | 'Unisex';

export interface ProductTraits {
  gender: GenderOption;
  color: string;
  style: string;
}

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

export enum DiscountType {
  Percentage = 0,
  Fixed = 1,
}

export interface PoapDiscount {
  eventId: bigint;
  discountBps: bigint;
  active: boolean;
}

export interface HolderDiscount {
  token: string;
  discountType: DiscountType;
  value: bigint;
  active: boolean;
}

export interface Variant {
  price: bigint;
  maxSupply: bigint;
  minted: bigint;
  active: boolean;
}

export interface RoyaltyInfo {
  recipient: string;
  percentage: bigint;
}

export enum RedemptionStatus {
  NotRedeemed = 0,
  PendingFulfillment = 1,
  Fulfilled = 2,
}
