// Wallet types
export interface Wallet {
  address: string;
  chainId?: number;
  provider?: any;
  walletClientType?: string;
}

// Balance types
export interface TokenBalance {
  ethBalance: string;
  uscBalance: string;
  eurcBalance: string;
  usdtBalance?: string;
  papayosBalance?: string;
}

