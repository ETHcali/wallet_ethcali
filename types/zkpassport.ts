export interface TokenData {
  uniqueIdentifier: `0x${string}`;
  personhoodVerified: boolean; // always true — contract only mints with valid ZK proof
  isOver18: boolean;
  nationality: string;
}

export interface NFTData {
  tokenId: bigint;
  tokenData: TokenData;
  tokenURI: string;
}

export interface ZKPassportVerificationResult {
  uniqueIdentifier: `0x${string}`;
  isOver18: boolean;
  nationality: string;
}
