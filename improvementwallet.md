 ---                                                                                                         
  Evaluation: External Wallet Support                                                                         
                                                                                                              
  Current State                                                                                               
  ┌──────────────────┬────────────────────────────────┐                                                       
  │      Aspect      │             Status             │                                                       
  ├──────────────────┼────────────────────────────────┤                                                       
  │ Login methods    │ Email + Passkey only           │                                                       
  ├──────────────────┼────────────────────────────────┤                                                       
  │ External wallets │ Not enabled                    │                                                       
  ├──────────────────┼────────────────────────────────┤                                                       
  │ Wallet selection │ Auto wallets[0] - no control   │                                                       
  ├──────────────────┼────────────────────────────────┤                                                       
  │ Session locking  │ None - reactive to Privy state │                                                       
  ├──────────────────┼────────────────────────────────┤                                                       
  │ Gas sponsorship  │ Privy-managed (embedded only)  │                                                       
  └──────────────────┴────────────────────────────────┘                                                       
  The Problem You're Experiencing                                                                             
                                                                                                              
  Even though external wallets aren't explicitly configured, Privy's useWallets() hook can detect externally  
  connected wallets (like MetaMask) if they're active in the browser. Since useActiveWallet() just returns    
  wallets[0], the app may unpredictably switch when:                                                          
  - User has MetaMask open                                                                                    
  - External wallet connects/disconnects                                                                      
  - Wallet array order changes                                                                                
                                                                                                              
  ---                                                                                                         
  Proposed Architecture                                                                                       
                                                                                                              
  Core Concept: Session-Locked Wallet                                                                         
                                                                                                              
  ┌─────────────────────────────────────────────────────────┐                                                 
  │                      LOGIN FLOW                          │                                                
  ├─────────────────────────────────────────────────────────┤                                                 
  │  User chooses:                                          │                                                 
  │  ┌──────────────┐  OR  ┌──────────────────────────┐    │                                                  
  │  │ Email/Passkey│      │ Connect External Wallet  │    │                                                  
  │  │ (Embedded)   │      │ (MetaMask, WalletConnect)│    │                                                  
  │  └──────────────┘      └──────────────────────────┘    │                                                  
  │           ↓                        ↓                    │                                                 
  │     Creates embedded         Uses external wallet       │                                                 
  │           ↓                        ↓                    │                                                 
  │  ┌─────────────────────────────────────────────────┐   │                                                  
  │  │   SESSION LOCK: Store wallet address in session │   │                                                  
  │  │   (localStorage + React Context)                │   │                                                  
  │  └─────────────────────────────────────────────────┘   │                                                  
  │                          ↓                              │                                                 
  │  ┌─────────────────────────────────────────────────┐   │                                                  
  │  │   App ONLY uses locked wallet, ignores others   │   │                                                  
  │  │   External wallet changes = NO AUTO-SWITCH      │   │                                                  
  │  │   To change wallet = MUST LOGOUT                │   │                                                  
  │  └─────────────────────────────────────────────────┘   │                                                  
  └─────────────────────────────────────────────────────────┘                                                 
                                                                                                              
  ---                                                                                                         
  Impact Analysis                                                                                             
                                                                                                              
  Gas Sponsorship Reality                                                                                     
  ┌───────────────────────────┬───────────────────────┬───────────────────┐                                   
  │        Wallet Type        │ Privy Gas Sponsorship │  User Experience  │                                   
  ├───────────────────────────┼───────────────────────┼───────────────────┤                                   
  │ Embedded (email/passkey)  │ ✅ Supported          │ Free transactions │                                   
  ├───────────────────────────┼───────────────────────┼───────────────────┤                                   
  │ External (MetaMask, etc.) │ ❌ Not supported      │ User pays gas     │                                   
  └───────────────────────────┴───────────────────────┴───────────────────┘                                   
  Important: Privy gas sponsorship only works with embedded wallets. External wallet users will need ETH for  
  gas.                                                                                                        
                                                                                                              
  UX Considerations                                                                                           
  ┌────────────────┬──────────────────┬───────────────────────┐                                               
  │    Scenario    │ Embedded Wallet  │    External Wallet    │                                               
  ├────────────────┼──────────────────┼───────────────────────┤                                               
  │ ENS Mint       │ Free (sponsored) │ User pays ~$0.05-0.50 │                                               
  ├────────────────┼──────────────────┼───────────────────────┤                                               
  │ Token Transfer │ Free (sponsored) │ User pays gas         │                                               
  ├────────────────┼──────────────────┼───────────────────────┤                                               
  │ NFT Redemption │ Free (sponsored) │ User pays gas         │                                               
  ├────────────────┼──────────────────┼───────────────────────┤                                               
  │ Faucet Claim   │ Free (sponsored) │ User pays gas         │                                               
  └────────────────┴──────────────────┴───────────────────────┘                                               
  ---                                                                                                         
  Implementation Plan                                                                                         
                                                                                                              
  Phase 1: Session Management Infrastructure                                                                  
                                                                                                              
  Create stores/walletSession.ts:                                                                             
  // Zustand store for wallet session locking                                                                 
  interface WalletSession {                                                                                   
    lockedAddress: string | null;                                                                             
    walletType: 'embedded' | 'external' | null;                                                               
    lockWallet: (address: string, type: 'embedded' | 'external') => void;                                     
    clearSession: () => void;                                                                                 
    isLocked: boolean;                                                                                        
  }                                                                                                           
                                                                                                              
  Update useActiveWallet.ts:                                                                                  
  // Respect session lock instead of auto-selecting wallets[0]                                                
  export function useActiveWallet() {                                                                         
    const { wallets, ready } = useWallets();                                                                  
    const { lockedAddress } = useWalletSession();                                                             
                                                                                                              
    const wallet = useMemo(() => {                                                                            
      if (lockedAddress) {                                                                                    
        // Find the locked wallet, return null if disconnected                                                
        return wallets.find(w => w.address === lockedAddress) || null;                                        
      }                                                                                                       
      return null; // No auto-selection without lock                                                          
    }, [wallets, lockedAddress]);                                                                             
                                                                                                              
    return { wallet, ... };                                                                                   
  }                                                                                                           
                                                                                                              
  Phase 2: Enable External Wallets in Privy                                                                   
                                                                                                              
  Update _app.tsx:                                                                                            
  <PrivyProvider                                                                                              
    config={{                                                                                                 
      loginMethods: ['email', 'passkey', 'wallet'], // Add 'wallet'                                           
      externalWallets: {                                                                                      
        coinbaseWallet: { connectionOptions: 'smartWalletOnly' },                                             
        walletConnect: { enabled: true },                                                                     
        metamask: { enabled: true },                                                                          
      },                                                                                                      
      // ... rest of config                                                                                   
    }}                                                                                                        
  >                                                                                                           
                                                                                                              
  Phase 3: Update Login Flow                                                                                  
                                                                                                              
  Modify login UI to show wallet type choice:                                                                 
  - Option A: Email/Passkey (embedded) - "Free transactions"                                                  
  - Option B: Connect Wallet (external) - "Use your own wallet"                                               
                                                                                                              
  On successful login:                                                                                        
  1. Lock the wallet address in session                                                                       
  2. Store wallet type for sponsorship awareness                                                              
  3. Redirect to wallet page                                                                                  
                                                                                                              
  Phase 4: Sponsorship-Aware UI                                                                               
                                                                                                              
  Show different UI based on wallet type:                                                                     
  // In components that show "GAS SPONSORED"                                                                  
  const { walletType } = useWalletSession();                                                                  
                                                                                                              
  {walletType === 'embedded' ? (                                                                              
    <span className="gas-badge">GAS SPONSORED</span>                                                          
  ) : (                                                                                                       
    <span className="gas-badge external">REQUIRES GAS</span>                                                  
  )}                                                                                                          
                                                                                                              
  Phase 5: Logout = Wallet Change                                                                             
                                                                                                              
  Enforce logout to change wallets:                                                                           
  - Remove wallet selector from UI                                                                            
  - "Change Wallet" button = triggers full logout                                                             
  - Clear session on logout                                                                                   
  - Re-authenticate to use different wallet                                                                   
                                                                                                              
  ---                                                                                                         
  Files to Create/Modify                                                                                      
  ┌────────────────────────────────┬────────┬────────────────────────────────┐                                
  │              File              │ Action │            Purpose             │                                
  ├────────────────────────────────┼────────┼────────────────────────────────┤                                
  │ stores/walletSession.ts        │ Create │ Session lock store             │                                
  ├────────────────────────────────┼────────┼────────────────────────────────┤                                
  │ hooks/useActiveWallet.ts       │ Modify │ Respect session lock           │                                
  ├────────────────────────────────┼────────┼────────────────────────────────┤                                
  │ pages/_app.tsx                 │ Modify │ Enable external wallets        │                                
  ├────────────────────────────────┼────────┼────────────────────────────────┤                                
  │ pages/index.tsx                │ Modify │ Updated login flow             │                                
  ├────────────────────────────────┼────────┼────────────────────────────────┤                                
  │ components/Navigation.tsx      │ Modify │ Show wallet type badge         │                                
  ├────────────────────────────────┼────────┼────────────────────────────────┤                                
  │ components/ens/ENSSection.tsx  │ Modify │ Conditional sponsorship badge  │                                
  ├────────────────────────────────┼────────┼────────────────────────────────┤                                
  │ components/shared/GasBadge.tsx │ Create │ Reusable sponsorship indicator │                                
  └────────────────────────────────┴────────┴────────────────────────────────┘                                
  ---                                                                                                         
  Questions Before Implementation                                                                             
                                                                                                              
  1. Login UI preference: Should users choose wallet type on a single screen, or should external wallet be a separate "Advanced" option?  Privy allows to set up the wallets. 
  
  We have a set up in the _app.tsx of, createOnLogin: 'users-without-wallets'. We have to just to enable the external wallet and dont create embeded to those logg ins.
  
                                                                             
  2. Disconnection handling: If an external wallet disconnects mid-session, should we:                        
                                                             
    - B) Auto-logout the user                                                                                                                            
  3. Sponsorship messaging: How prominently should we show that external wallets don't get sponsored          
  transactions?    

  Just a small messafe in the wallet info page.

  4. Migration: For existing users with embedded wallets, should they be able to "link" an external wallet    
  later, or always use one wallet type?                                        no, we are just creating embeded to users that log in with email and passskeys, the external wallets are a awalet to connect from the beinginig                               
        