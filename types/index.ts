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
  papayosBalance?: string;
}

// Network types
export interface Network {
  id: number;
  name: string;
  shortName: string;
  icon: string;
  explorerUrl: string;
  rpcUrl: string;
  testnet: boolean;
  color: string;
}

// User types
export interface UserInfo {
  id: string;
  email?: {
    address: string;
    verified: boolean;
  };
  phone?: {
    number: string;
    verified: boolean;
  };
}

// API response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface WalletResponse {
  userId: string;
  walletAddress: string;
}

export interface BalanceResponse {
  address: string;
  balances: TokenBalance;
} 