export interface TokenData {
  uniqueIdentifier: string;
  faceMatchPassed: boolean;
  personhoodVerified: boolean;
}

export interface NFTData {
  tokenId: bigint;
  tokenData: TokenData;
  tokenURI: string;
}

export interface ZKPassportVerificationResult {
  uniqueIdentifier: string;
  faceMatchPassed: boolean;
  personhoodVerified: boolean;
}
