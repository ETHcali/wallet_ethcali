ETH Cali Wallet - Comprehensive Codebase Cleanup & Refactoring Plan
Executive Summary
This plan outlines an aggressive, complete overhaul of the ETH Cali Wallet codebase focusing on:

Code quality & maintainability - Breaking down 9 files over 350 lines each
Eliminating duplication - Removing 600KB+ of duplicate contract files
Standardization - Moving hardcoded values to .env and constants
Type safety - Gradually enabling TypeScript strict mode
Clean architecture - Component decomposition and proper separation of concerns

Current Issues:

WalletInfo.tsx: 1,372 lines (should be ~200)
SendTokenModal.tsx: 797 lines (should be ~250)
600KB of duplicate contract files across 3 folders
Hardcoded values in 27+ files
102 console.log statements in production
TypeScript strict mode disabled
Unused dependencies (wagmi, polyfills)

Expected Outcomes:

85% reduction in component sizes
100% elimination of duplicate code
Full TypeScript strict mode compliance
Comprehensive .env.example with all configuration
Clean, maintainable codebase ready for future development


Phase 1: Foundation & Configuration
Objective
Establish configuration infrastructure and remove dead code before refactoring.
1.1 Create Centralized Constants
New file: /config/constants.ts
Create a single source of truth for all constants:
typescriptexport const CHAIN_IDS = {
  BASE: 8453,
  ETHEREUM: 1,
  OPTIMISM: 10,
  UNICHAIN: 130,
} as const;

export const DEFAULT_CHAIN_ID = Number(process.env.NEXT_PUBLIC_DEFAULT_CHAIN_ID) || CHAIN_IDS.BASE;

export const ADMIN_ADDRESS = process.env.NEXT_PUBLIC_ADMIN_ADDRESS || '0x3B89Ad8CC39900778aBCdcc22bc83cAC031A415B';

export const EXPLORER_URLS = {
  [CHAIN_IDS.BASE]: 'https://basescan.org',
  [CHAIN_IDS.ETHEREUM]: 'https://etherscan.io',
  [CHAIN_IDS.OPTIMISM]: 'https://optimistic.etherscan.io',
  [CHAIN_IDS.UNICHAIN]: 'https://unichain.blockscout.com',
} as const;

export const NETWORK_NAMES = {
  [CHAIN_IDS.BASE]: 'Base',
  [CHAIN_IDS.ETHEREUM]: 'Ethereum',
  [CHAIN_IDS.OPTIMISM]: 'Optimism',
  [CHAIN_IDS.UNICHAIN]: 'Unichain',
} as const;

export const TIMEOUTS = {
  IPFS_FETCH: 10000,
  QUERY_STALE: 60000,
  DEBOUNCE_INPUT: 300,
} as const;

export const TOKEN_DECIMALS = {
  ETH: 18,
  USDC: 6,
  USDT: 6,
  EURC: 6,
} as const;
Purpose: Eliminate magic numbers and hardcoded values scattered throughout codebase.
1.2 Create Comprehensive .env.example
New file: .env.example
Document all environment variables with detailed comments:
bash# =============================================================================
# ETH CALI WALLET - Environment Configuration
# =============================================================================

# -----------------------------------------------------------------------------
# REQUIRED - Privy Authentication
# -----------------------------------------------------------------------------
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id_here
PRIVY_APP_SECRET=your_privy_app_secret_here

# -----------------------------------------------------------------------------
# REQUIRED - Admin Configuration
# -----------------------------------------------------------------------------
NEXT_PUBLIC_ADMIN_ADDRESS=0x3B89Ad8CC39900778aBCdcc22bc83cAC031A415B

# -----------------------------------------------------------------------------
# REQUIRED - IPFS/Pinata (for NFT metadata)
# -----------------------------------------------------------------------------
PINATA_JWT=your_pinata_jwt_token
PINATA_GATEWAY=https://gateway.pinata.cloud/ipfs
NEXT_PUBLIC_PINATA_GATEWAY=https://gateway.pinata.cloud/ipfs

# -----------------------------------------------------------------------------
# OPTIONAL - Network Configuration
# -----------------------------------------------------------------------------
NEXT_PUBLIC_DEFAULT_CHAIN_ID=8453  # 8453=Base, 1=Ethereum, 10=Optimism, 130=Unichain

# RPC Endpoints (optional - defaults provided)
NEXT_PUBLIC_BASE_RPC_URL=https://mainnet.base.org
NEXT_PUBLIC_MAINNET_RPC_URL=https://eth.llamarpc.com
NEXT_PUBLIC_OPTIMISM_RPC_URL=https://mainnet.optimism.io
NEXT_PUBLIC_UNICHAIN_RPC_URL=https://rpc.unichain.org

# -----------------------------------------------------------------------------
# OPTIONAL - Token Address Overrides
# -----------------------------------------------------------------------------
NEXT_PUBLIC_USDC_BASE=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
NEXT_PUBLIC_USDT_BASE=0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2
NEXT_PUBLIC_EURC_BASE=0x60a3E35Cc302bFA44Cb288Bc5a4F316Fdb1adb42

# [Additional token addresses for Ethereum, Optimism, Unichain...]

# -----------------------------------------------------------------------------
# DEVELOPMENT - Debugging
# -----------------------------------------------------------------------------
NEXT_PUBLIC_DEBUG=false  # Enable verbose logging

# =============================================================================
# Note: Contract addresses are loaded from frontend/addresses.json
# Gas sponsorship is configured in Privy Dashboard
# =============================================================================
1.3 Remove Dead Code & Unused Dependencies
Files to DELETE:

/config/wagmi.ts - Never imported, unused
/components/NetworkSwitcher.tsx - Never used
/lib/walletService.ts - Mock functions only
/pages/api/create-wallet.ts - Dead API endpoint
/pages/api/wallet-balance.ts - Dead API endpoint
/custom.d.ts - Types for non-existent packages
/frontend/base/ folder - 196KB duplicate (contracts already in frontend/contracts.ts)
/frontend/ethereum/ folder - 196KB duplicate
/frontend/unichain/ folder - 196KB duplicate

Total space saved: ~600KB
Dependencies to remove from package.json:
json{
  "remove": [
    "wagmi",
    "buffer",
    "crypto-browserify",
    "stream-browserify",
    "process",
    "util"
  ]
}
Update next.config.js:

Remove Biconomy environment variables (lines 42-45, unused)
Keep webpack topLevelAwait but remove polyfill references

1.4 Enhance ESLint Configuration
Update .eslintrc.json:
json{
  "extends": [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended"
  ],
  "rules": {
    "no-console": ["warn", { "allow": ["error", "warn"] }],
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-unused-vars": ["warn", {
      "argsIgnorePattern": "^_",
      "varsIgnorePattern": "^_"
    }],
    "import/order": ["warn", {
      "groups": [
        "builtin",
        "external",
        "internal",
        ["parent", "sibling"],
        "index"
      ],
      "pathGroups": [
        {
          "pattern": "@/components/**",
          "group": "internal"
        },
        {
          "pattern": "@/lib/**",
          "group": "internal"
        },
        {
          "pattern": "@/utils/**",
          "group": "internal"
        },
        {
          "pattern": "@/hooks/**",
          "group": "internal"
        }
      ],
      "newlines-between": "always"
    }]
  }
}
1.5 Consolidate Network Configuration
Major refactor: /config/networks.ts
Merge functionality from utils/network.ts and parts of utils/contracts.ts into a single network configuration file:
typescriptimport { CHAIN_IDS, EXPLORER_URLS, NETWORK_NAMES } from './constants';
import type { Chain } from 'viem';

export interface NetworkConfig {
  id: number;
  name: string;
  shortName: string;
  explorerUrl: string;
  rpcUrl: string;
  contracts: {
    swag1155: string;
    faucetManager: string;
    zkpassport: string;
  };
  tokens: {
    USDC: string;
    USDT: string;
    EURC: string;
  };
  viemChain: Chain;
}

export function getNetworkConfig(chainId: number): NetworkConfig;
export function getExplorerUrl(chainId: number, hash: string, type: 'tx' | 'address'): string;
export function getViemChain(chainId: number): Chain;
export function getSupportedNetworks(): NetworkConfig[];
Purpose: Single source of truth for all network-related data.

Phase 2: Utility Layer Consolidation
Objective
Create a clean, DRY utility layer with no duplication.
2.1 Create Explorer Utilities
New file: /utils/explorer.ts
Consolidate all explorer URL logic (currently duplicated in 4+ files):
typescriptimport { EXPLORER_URLS, CHAIN_IDS } from '@/config/constants';

export function getExplorerUrl(chainId: number): string;
export function getTxUrl(chainId: number, hash: string): string;
export function getAddressUrl(chainId: number, address: string): string;
export function getTokenUrl(chainId: number, tokenAddress: string): string;
export function getBlockUrl(chainId: number, blockNumber: number): string;
Files to update (remove duplicated switch statements):

components/wallet/WalletInfo.tsx:81-94
components/wallet/SendTokenModal.tsx:31-44
components/faucet/FaucetClaim.tsx
utils/contracts.ts (remove getExplorerUrl and getAddressExplorerUrl)

2.2 Refactor Contract Utilities
Major refactor: /utils/contracts.ts
Current: 461 lines with duplicated network logic
Target: ~200 lines with clean separation
Changes:

Remove explorer URL functions → moved to /utils/explorer.ts
Remove network name functions → use /config/networks.ts
Remove duplicate chain config logic
Import constants from /config/constants.ts
Use unified network config from /config/networks.ts
Replace all as any casts with proper types

New clean structure:
typescriptimport { getNetworkConfig } from '@/config/networks';

export function getPublicClient(chainId: number): PublicClient;
export function getContractAddresses(chainId: number);
export function getContractABI(contractName: ContractName);

export async function readContract<T>(params: ReadContractParams): Promise<T>;

// Namespace for contract-specific helpers
export namespace ZKPassport {
  export async function hasNFT(chainId: number, address: string): Promise<boolean>;
  export async function getTokenData(chainId: number, tokenId: bigint);
}

export namespace Faucet {
  export async function getBalance(chainId: number): Promise<string>;
  export async function canUserClaim(chainId: number, vaultId: bigint, user: string);
}
2.3 Delete Redundant Network Utilities
DELETE: /utils/network.ts (entire file, 195 lines)
This file duplicates functionality now in:

/config/networks.ts (network configurations)
/config/constants.ts (explorer URLs, chain IDs)
/frontend/contracts.ts (contract addresses)

Migration steps:

Move useSwagAddresses hook to new /hooks/useNetworkConfig.ts
Update all imports to use /config/networks.ts instead
Delete the file

2.4 Unify QR Scanner Components
Current state: Two nearly identical QR scanner components with 90% overlap:

components/wallet/QRScanner.tsx (240 lines)
components/swag/AdminQRScanner.tsx (303 lines)

Solution: Refactor into generic component
Update: /components/shared/QRScanner.tsx
typescriptinterface QRScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
  title?: string;
  description?: string;
  validator?: (data: string) => { valid: boolean; error?: string };
  theme?: 'cyan' | 'amber';  // Support both color schemes
  showScanCount?: boolean;
}

export default function QRScanner(props: QRScannerProps) {
  // Generic QR scanning logic
  // Configurable theme and validation
}
Then DELETE: /components/swag/AdminQRScanner.tsx
Update imports in:

components/wallet/WalletInfo.tsx
components/swag/AdminMintedNFTs.tsx


Phase 3: Component Decomposition
Objective
Break down massive components into manageable, single-responsibility pieces.
3.1 WalletInfo.tsx Decomposition
Current: 1,372 lines - MASSIVE monolithic component
Target: ~200 lines - orchestrator component using composition
Analysis:

Lines 1-100: Imports, setup, state (9+ useState hooks)
Lines 100-400: Token transfer logic (ETH and ERC20)
Lines 400-600: Transaction handling and validation
Lines 600-800: QR code scanning
Lines 800-1000: NFT display logic
Lines 1000-1200: Token list rendering
Lines 1200-1372: Multiple modal components

New Architecture:
Main component: /components/wallet/WalletInfo.tsx (~200 lines)
typescriptexport default function WalletInfo(props: WalletInfoProps) {
  const { tokens, isLoading } = useTokenBalances(chainId, address);
  const { nfts } = useUserNFTs(chainId, address);
  const walletActions = useWalletActions(wallet, chainId);

  return (
    <div>
      <WalletHeader wallet={wallet} onRefresh={onRefresh} />
      <NetworkBadge chainId={chainId} />
      <WalletActions
        onSend={handleSend}
        onReceive={handleReceive}
        onFund={handleFund}
      />

      <Tabs value={activeTab} onChange={setActiveTab}>
        <TabPanel value="tokens">
          <TokenList tokens={tokens} onSendToken={handleSendToken} />
        </TabPanel>
        <TabPanel value="collectibles">
          <NFTGrid nfts={nfts} />
        </TabPanel>
      </Tabs>

      <SendTokenModal {...sendModalProps} />
      <ReceiveModal {...receiveModalProps} />
    </div>
  );
}
New components to CREATE:

/components/wallet/WalletHeader.tsx (~80 lines)

Wallet address display with copy button
Export wallet functionality
Refresh button
Total balance display


/components/wallet/WalletActions.tsx (~100 lines)

Send, Receive, Fund buttons
Button state management
Fund wallet with Apple/Google Pay integration


/components/wallet/TokenList.tsx (~150 lines)

Display all tokens (ETH, USDC, USDT, EURC)
Token balances and USD values
Send button per token
Loading and empty states


/components/wallet/TokenRow.tsx (~80 lines)

Individual token display
Token logo, symbol, balance
USD value calculation
Send button


/components/wallet/NFTGrid.tsx (~100 lines)

Grid layout for NFTs
Loading state
Empty state
Uses existing NFTCard component


/components/shared/NetworkBadge.tsx (~50 lines)

Display current network name and logo
Color-coded by network



New hooks to CREATE:

/hooks/useWalletActions.ts (~200 lines)

typescript   export function useWalletActions(wallet: Wallet, chainId: number) {
     const handleSendToken = async (recipient, amount, token) => { ... };
     const handleFundWallet = async () => { ... };
     const handleExportWallet = async () => { ... };

     return {
       handleSendToken,
       handleFundWallet,
       handleExportWallet,
       isSending,
       txHash,
     };
   }

/hooks/useTokenTransfer.ts (~250 lines)

typescript   export function useTokenTransfer() {
     const sendETH = async (params: SendETHParams) => { ... };
     const sendERC20 = async (params: SendERC20Params) => { ... };

     return { sendETH, sendERC20, isLoading, error };
   }
Result: 1,372 lines → 200 line orchestrator + 6 components + 2 hooks (85% size reduction)
3.2 SendTokenModal.tsx Decomposition
Current: 797 lines - Large modal with multiple concerns
Target: ~250 lines - orchestrator with sub-components
Analysis:

Lines 1-150: State management, validation
Lines 150-300: QR scanning integration
Lines 300-500: Form inputs
Lines 500-700: Token selection UI
Lines 700-797: Submit handling and UI

New Architecture:
Main modal: /components/wallet/SendTokenModal.tsx (~250 lines)
typescriptexport default function SendTokenModal(props: SendTokenModalProps) {
  const validation = useSendTokenValidation();
  const { sendToken } = useTokenTransfer();

  return (
    <Modal open={isOpen} onClose={onClose}>
      <ModalHeader title="Send Tokens" />

      <RecipientInput
        value={recipient}
        onChange={setRecipient}
        error={validation.recipientError}
        onScanQR={() => setShowScanner(true)}
      />

      <TokenSelector
        tokens={availableTokens}
        selected={selectedToken}
        onChange={setSelectedToken}
      />

      <AmountInput
        value={amount}
        onChange={setAmount}
        error={validation.amountError}
        maxAmount={selectedToken.balance}
      />

      <TransactionSummary
        recipient={recipient}
        amount={amount}
        token={selectedToken}
      />

      <SendButton
        onSend={handleSend}
        disabled={!validation.isValid}
        isLoading={isSending}
      />

      {showScanner && <QRScanner onScan={handleScan} onClose={() => setShowScanner(false)} />}
    </Modal>
  );
}
New components to CREATE:

/components/wallet/send/RecipientInput.tsx (~100 lines)

Address input field with validation
QR scan button
Address validation feedback
ENS support placeholder


/components/wallet/send/TokenSelector.tsx (~120 lines)

Dropdown to select token
Display token logo, symbol, balance
Disable unavailable tokens


/components/wallet/send/AmountInput.tsx (~100 lines)

Amount input with real-time validation
Max button (use full balance)
USD value preview
Balance display


/components/wallet/send/TransactionSummary.tsx (~80 lines)

Review transaction details
Estimated gas (if not sponsored)
Total amount



New hook to CREATE:

/hooks/useSendTokenValidation.ts (~150 lines)

typescript   export function useSendTokenValidation(params: ValidationParams) {
     // Real-time validation for recipient address
     // Amount validation (sufficient balance, positive, etc.)
     // Returns validation errors and isValid state
   }
Result: 797 lines → 250 line orchestrator + 4 components + 1 hook (69% size reduction)
3.3 useFaucetAdmin.ts Decomposition
Current: 631 lines - 8 hooks bundled in one file
Target: 5 separate hook files (~100-150 lines each)
Split into:

/hooks/faucet/useFaucetManagerAdmin.ts (~80 lines)

Admin permission checks only
useIsFaucetAdmin


/hooks/faucet/useVaults.ts (~120 lines)

useAllVaults
useActiveVaults
useVaultById


/hooks/faucet/useVaultMutations.ts (~150 lines)

useCreateVault
useUpdateVault
useDepositVault
useWithdrawVault


/hooks/faucet/useVaultWhitelist.ts (~100 lines)

useVaultWhitelist
useAddToWhitelist
useRemoveFromWhitelist


/hooks/faucet/useVaultClaims.ts (~100 lines)

useCanUserClaim
useClaimInfo
useUserClaims



Files to UPDATE imports:

components/faucet/FaucetAdmin.tsx
components/faucet/FaucetClaim.tsx
components/faucet/VaultWhitelistManager.tsx
components/faucet/CreateVaultForm.tsx

3.4 useSwagAdmin.ts Decomposition
Current: 546 lines - Multiple admin hooks bundled
Target: 4 separate hook files (~100-150 lines each)
Split into:

/hooks/swag/useVariants.ts (~120 lines)

useAllVariants
useVariantById


/hooks/swag/useVariantMutations.ts (~150 lines)

useCreateVariant
useUpdateVariant
useToggleVariantActive


/hooks/swag/useMintedNFTs.ts (~120 lines)

useAllMintedNFTs
useMintedNFTsByToken
useMintedNFTsByOwner


/hooks/swag/useNFTFulfillment.ts (~100 lines)

useFulfillNFT
useRedemptionStatus



3.5 SybilVerification.tsx Decomposition
Current: 583 lines - Monolithic verification flow
Target: ~200 lines orchestrator + 6 step components
New Architecture:
Main: /components/sybil/SybilVerification.tsx (~200 lines)
typescriptexport default function SybilVerification() {
  const { step, nextStep, prevStep } = useVerificationFlow();

  return (
    <VerificationContainer>
      <VerificationStepper currentStep={step} totalSteps={5} />

      {step === 'consent' && <ConsentStep onNext={nextStep} />}
      {step === 'document' && <DocumentScanStep onComplete={nextStep} onBack={prevStep} />}
      {step === 'selfie' && <SelfieStep onComplete={nextStep} onBack={prevStep} />}
      {step === 'verify' && <VerificationStep onComplete={nextStep} />}
      {step === 'complete' && <CompletionStep />}
    </VerificationContainer>
  );
}
New components to CREATE:

/components/sybil/VerificationStepper.tsx (~80 lines)
/components/sybil/ConsentStep.tsx (~100 lines)
/components/sybil/DocumentScanStep.tsx (~120 lines)
/components/sybil/SelfieStep.tsx (~100 lines)
/components/sybil/VerificationStep.tsx (~100 lines)
/components/sybil/CompletionStep.tsx (~80 lines)

New hook to CREATE:

/hooks/useZKPassportVerification.ts (~200 lines)

typescript   export function useZKPassportVerification() {
     const startVerification = async () => { ... };
     const submitProof = async () => { ... };
     const mintNFT = async () => { ... };

     return { startVerification, submitProof, mintNFT, status, error };
   }
3.6 Additional Large Components
FaucetClaim.tsx (429 lines → ~250 lines)
Split into:

Main component with vault list (~150 lines)
/components/faucet/VaultCard.tsx (~100 lines) - Individual vault display
/components/faucet/ClaimButton.tsx (~80 lines) - Claim logic and button

AdminMintedNFTs.tsx (452 lines → ~200 lines)
Split into:

Main component with filters/pagination (~150 lines)
/components/swag/admin/NFTFilters.tsx (~100 lines)
/components/swag/admin/NFTTable.tsx (~120 lines)
Use shared QRScanner component

AdminNFTFulfillmentModal.tsx (397 lines → ~200 lines)
Split into:

Main modal (~120 lines)
/components/swag/admin/FulfillmentForm.tsx (~100 lines)
/components/swag/admin/ShippingInfo.tsx (~80 lines)

FaucetAdmin.tsx (390 lines → ~200 lines)
Split into:

Main component with tabs (~120 lines)
/components/faucet/admin/VaultManagementTab.tsx (~100 lines)
/components/faucet/admin/DepositWithdrawTab.tsx (~80 lines)


Phase 4: TypeScript Strict Mode Migration
Objective
Gradually enable TypeScript strict mode without breaking the build.
4.1 Preparation - Update tsconfig.json Incrementally
Step 1: Enable noImplicitAny first
json{
  "compilerOptions": {
    "strict": false,
    "noImplicitAny": true,  // ← Start here
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
Fix all implicit any errors before proceeding.
4.2 Fix any Types Throughout Codebase
Priority order:

Config & Constants (already type-safe)

/config/constants.ts
/config/networks.ts


Utils (many as any casts)

/utils/contracts.ts - Replace 15+ as any casts with proper types
/utils/tokenUtils.ts - Type all functions
/utils/explorer.ts - Full type coverage


Hooks (need return types)

All hooks in /hooks/ - Add proper return types
Use TypeScript generics for contract reads
Type all React Query results


Components (event handlers, state)

Add proper prop types (no optional chaining without null checks)
Type all event handlers
Type all state variables



4.3 Enable strictNullChecks
After fixing any types, enable:
json{
  "strictNullChecks": true
}
Required changes:

Add null checks before accessing nested properties
Use optional chaining ?. consistently
Add default values for potentially undefined vars
Fix all "possibly undefined" errors

Priority files:

components/wallet/WalletInfo.tsx - Many nested property accesses
components/wallet/SendTokenModal.tsx - Token selection can be null
All hooks returning data from queries

4.4 Enable Full Strict Mode
Final step:
json{
  "strict": true
}
Also update next.config.js:
javascript{
  typescript: {
    ignoreBuildErrors: false  // Re-enable build checks
  }
}
Run npm run build and fix any remaining errors.

Phase 5: Error Handling & Code Quality
Objective
Add proper error handling and polish the codebase.
5.1 Create Error Boundary Components
New: /components/shared/ErrorBoundary.tsx
typescriptexport class ErrorBoundary extends React.Component<Props, State> {
  // Catch React render errors
  // Display fallback UI
  // Log errors appropriately
}
New: /components/shared/QueryErrorBoundary.tsx
typescriptexport function QueryErrorBoundary({ children }) {
  // Handle React Query errors gracefully
  // Show retry button
}
5.2 Centralized Error Handling
New: /utils/errorHandling.ts
typescriptexport function handleContractError(error: unknown): UserFriendlyError;
export function handleNetworkError(error: unknown): UserFriendlyError;
export function logError(error: unknown, context: ErrorContext): void;

export const ERROR_MESSAGES = {
  USER_REJECTED: 'Transaction was rejected',
  INSUFFICIENT_FUNDS: 'Insufficient funds for transaction',
  NETWORK_ERROR: 'Network connection error',
  // ... more user-friendly messages
};
Update all hooks to use centralized error handling.
5.3 Replace Console Logs with Logger
New: /utils/logger.ts
typescriptconst isDev = process.env.NODE_ENV === 'development';
const DEBUG = process.env.NEXT_PUBLIC_DEBUG === 'true';

export const logger = {
  debug: (message: string, data?: any) => {
    if (isDev && DEBUG) console.log(`[DEBUG] ${message}`, data);
  },
  info: (message: string, data?: any) => {
    if (isDev) console.info(`[INFO] ${message}`, data);
  },
  warn: (message: string, data?: any) => {
    console.warn(`[WARN] ${message}`, data);
  },
  error: (message: string, error?: any) => {
    console.error(`[ERROR] ${message}`, error);
    // TODO: Send to error tracking service
  },
};
Replace all 102 console.log statements:

Search and replace throughout codebase
Use logger.debug() for debug logs
Use logger.error() for errors with context

5.4 Add JSDoc Documentation
Add comprehensive JSDoc comments to all public functions:
typescript/**
 * Fetches all active faucet vaults for the specified chain
 * @param chainId - The blockchain network ID
 * @returns Array of active vault configurations
 * @throws {ContractError} If contract read fails
 * @example
 * const vaults = await useActiveVaults(8453);
 */
Priority:

All utility functions in /utils/
All exported hooks in /hooks/
All public component prop interfaces

5.5 Performance Optimizations
Add React.memo to pure components:

TokenRow.tsx
NFTCard.tsx
VaultCard.tsx
All display-only components

Optimize re-renders:

Use useCallback for event handlers passed to children
Use useMemo for expensive calculations
Proper React Query cache keys


Phase 6: Documentation & Final Polish
Objective
Document the refactored architecture and create developer guides.
6.1 Update Project Documentation
Update /README.md with:

Project structure overview
Getting started guide
Environment setup
Development workflow

Create /docs/ARCHITECTURE.md:

System architecture overview
Component hierarchy
Data flow diagrams
Hook dependency graph
Smart contract integration

Create /docs/REFACTORING.md:

Summary of all changes made
Migration guide for developers
Breaking changes list (if any)
Before/after comparisons

6.2 Create Component Style Guide
New: /docs/COMPONENT_GUIDELINES.md
Document:

Component size limits (max 300 lines)
Hook size limits (max 150 lines)
File organization patterns
Naming conventions
Import ordering
When to create new components vs. extending existing


Implementation Order & Checklist
Week 1: Foundation (Phase 1)

 Create /config/constants.ts
 Create .env.example
 Update .eslintrc.json
 Consolidate /config/networks.ts
 Delete dead code files (wagmi.ts, NetworkSwitcher.tsx, etc.)
 Delete /frontend/base/, /frontend/ethereum/, /frontend/unichain/ (600KB saved)
 Remove unused dependencies from package.json
 Update next.config.js (remove Biconomy)
 Run npm install and verify build still works

Week 2: Utilities (Phase 2)

 Create /utils/explorer.ts
 Refactor /utils/contracts.ts (461 → ~200 lines)
 Delete /utils/network.ts
 Create /hooks/useNetworkConfig.ts
 Refactor QR scanner to /components/shared/QRScanner.tsx
 Delete /components/swag/AdminQRScanner.tsx
 Update all imports throughout codebase
 Test all utility functions

Week 3: Component Decomposition Part 1 (Phase 3.1-3.2)

 Decompose WalletInfo.tsx (1,372 → 200 lines)

 Create WalletHeader.tsx
 Create WalletActions.tsx
 Create TokenList.tsx
 Create TokenRow.tsx
 Create NFTGrid.tsx
 Create NetworkBadge.tsx
 Create useWalletActions.ts hook
 Create useTokenTransfer.ts hook


 Decompose SendTokenModal.tsx (797 → 250 lines)

 Create RecipientInput.tsx
 Create TokenSelector.tsx
 Create AmountInput.tsx
 Create TransactionSummary.tsx
 Create useSendTokenValidation.ts hook


 Test wallet functionality thoroughly

Week 4: Component Decomposition Part 2 (Phase 3.3-3.6)

 Split useFaucetAdmin.ts into 5 separate hooks
 Split useSwagAdmin.ts into 4 separate hooks
 Decompose SybilVerification.tsx + create 6 step components
 Decompose FaucetClaim.tsx
 Decompose AdminMintedNFTs.tsx
 Decompose AdminNFTFulfillmentModal.tsx
 Decompose FaucetAdmin.tsx
 Update all imports
 Test all features (faucet, swag, verification)

Week 5: TypeScript Strict Mode (Phase 4)

 Enable noImplicitAny in tsconfig.json
 Fix any types in config & utils
 Fix any types in hooks
 Fix any types in components
 Enable strictNullChecks
 Add null checks throughout codebase
 Enable full strict mode
 Set ignoreBuildErrors: false in next.config.js
 Fix all remaining TypeScript errors
 Run npm run build successfully

Week 6: Error Handling & Polish (Phase 5)

 Create ErrorBoundary components
 Create /utils/errorHandling.ts
 Update all hooks with centralized error handling
 Create /utils/logger.ts
 Replace all 102 console.log statements
 Add JSDoc comments to all utilities
 Add JSDoc comments to all hooks
 Add React.memo to pure components
 Optimize re-renders with useCallback/useMemo
 Run performance audit

Week 7: Documentation (Phase 6)

 Update README.md
 Create /docs/ARCHITECTURE.md
 Create /docs/REFACTORING.md
 Create /docs/COMPONENT_GUIDELINES.md
 Document all environment variables
 Create developer onboarding guide
 Final end-to-end testing


Testing Strategy
Regression Testing Checklist
After each phase, verify:
Core Wallet Features:

 User can connect wallet (Privy)
 User can see token balances (ETH, USDC, USDT, EURC)
 User can send ETH
 User can send ERC20 tokens
 User can receive tokens (QR code display)
 User can view NFTs
 Wallet export functionality works

Faucet Features:

 User can view available vaults
 User can claim from faucet
 Admin can create new vaults
 Admin can deposit/withdraw ETH
 Admin can manage whitelist

Swag Store Features:

 User can view products
 User can redeem products
 Admin can create variants
 Admin can fulfill orders
 Admin can view minted NFTs

ZKPassport Features:

 User can start verification
 Verification flow completes
 NFT minting works after verification
 Admin can view verifications

Network Features:

 Can switch networks
 All features work on Base
 All features work on Ethereum
 All features work on Optimism
 All features work on Unichain
 Gas sponsorship works (Privy)

Unit Testing Recommendations
Consider adding tests for:

All utility functions in /utils/
All custom hooks in /hooks/
Critical components (SendTokenModal, WalletInfo)
Error handling logic


Success Metrics
Code Quality Improvements
Before:

WalletInfo.tsx: 1,372 lines
SendTokenModal.tsx: 797 lines
useFaucetAdmin.ts: 631 lines
useSwagAdmin.ts: 546 lines
SybilVerification.tsx: 583 lines
Total duplicate code: ~600KB (contract files)
Console.log statements: 102
TypeScript strict: false
ESLint rules: minimal

After:

WalletInfo.tsx: ~200 lines (85% reduction)
SendTokenModal.tsx: ~250 lines (69% reduction)
useFaucetAdmin: Split into 5 hooks (~100 lines each)
useSwagAdmin: Split into 4 hooks (~100 lines each)
SybilVerification: ~200 lines (66% reduction)
Duplicate code: 0KB (100% eliminated)
Console.log statements: 0 (replaced with logger)
TypeScript strict: true (full type safety)
ESLint rules: 8+ with import ordering

Developer Experience

Component Reusability: 25+ new reusable components
Type Safety: Full TypeScript strict mode coverage
Code Navigation: Clear file structure, easy to find code
Testing: Smaller components = easier to test
Onboarding: Better documentation and structure
Maintenance: Clear separation of concerns


Risk Mitigation
High-Risk Changes & Mitigation Strategies

Deleting contract folders (Phase 1)

Risk: Breaking imports across the app
Mitigation: Search all imports first, update in bulk, test thoroughly before committing


WalletInfo decomposition (Phase 3.1)

Risk: Breaking core wallet functionality
Mitigation: Create new components alongside old, test extensively, keep old component as backup until verified


Enabling strictNullChecks (Phase 4.3)

Risk: Runtime errors if null checks are missing
Mitigation: Add comprehensive null checks before enabling, test each component individually



Rollback Strategy

Create git branch for each phase
Tag stable points (after Phase 1, 2, 3, etc.)
Keep old components temporarily with .old.tsx extension during transition
Document all breaking changes
Maintain feature parity throughout refactoring


Post-Refactoring Guidelines
Development Standards

Component Size Limit: Max 300 lines per component
Hook Size Limit: Max 150 lines per hook
No Magic Numbers: All values in constants
No Duplication: Use shared utilities
Type Safety: No any types without justification
Error Handling: All async operations must handle errors
Documentation: JSDoc for all public APIs
Logging: Use logger utility, not console.log

Code Review Checklist

 Component under 300 lines?
 No console.log (use logger)?
 No hardcoded values?
 Proper TypeScript types (no any)?
 Error handling present?
 Props interface documented?
 Tested locally on multiple networks?
 No code duplication?


Summary
This comprehensive refactoring plan will transform the ETH Cali Wallet codebase into a maintainable, type-safe, well-structured application. The aggressive approach will:

Reduce complexity by breaking down massive files
Eliminate duplication (600KB+ of duplicate code)
Standardize configuration (move hardcoded values to .env)
Improve type safety (enable TypeScript strict mode)
Enhance code quality (proper error handling, logging, documentation)
Boost developer experience (clear structure, better tooling)

The phased approach ensures we can test thoroughly at each stage and roll back if needed, while the comprehensive testing strategy ensures no functionality is lost during the refactoring process.