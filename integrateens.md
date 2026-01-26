Improved Implementation Plan                                                                                                            
                                                                                                                                          
  Phase 1: Configuration (Follow Existing Patterns)                                                                                       
                                                                                                                                          
  1.1 Add ENS constants to config/constants.ts:                                                                                           
  // =============================================================================                                                        
  // ENS CONFIGURATION                                                                                                                    
  // =============================================================================                                                        
  export const ENS_CONFIG = {                                                                                                             
    parentName: 'ethcali.eth',                                                                                                            
    chainId: CHAIN_IDS.BASE,                                                                                                              
  } as const;                                                                                                                             
                                                                                                                                          
  export const ENS_REGISTRAR_ADDRESSES: Partial<Record<ChainId, string>> = {                                                              
    [CHAIN_IDS.BASE]: '0x7103595fc32b4072b775e9f6b438921c8cf532ed',                                                                       
  } as const;                                                                                                                             
                                                                                                                                          
  1.2 No changes needed to _app.tsx                                                                                                       
  Your Privy config already works - embedded wallets support all chains.                                                                  
                                                                                                                                          
  ---                                                                                                                                     
  Phase 2: Hooks (Match Your Codebase Style)                                                                                              
                                                                                                                                          
  2.1 hooks/ens/useENSAvailability.ts:                                                                                                    
  import { useState, useEffect } from 'react';                                                                                            
  import { createPublicClient, http } from 'viem';                                                                                        
  import { base } from 'viem/chains';                                                                                                     
  import L2RegistrarABI from '../../frontend/abis/l2registar.json';                                                                       
  import { ENS_REGISTRAR_ADDRESSES, CHAIN_IDS, getRpcUrl } from '../config/constants';                                                    
  import { logger } from '../utils/logger';                                                                                               
                                                                                                                                          
  export function useENSAvailability(label: string) {                                                                                     
    const [isAvailable, setIsAvailable] = useState<boolean | null>(null);                                                                 
    const [isLoading, setIsLoading] = useState(false);                                                                                    
                                                                                                                                          
    useEffect(() => {                                                                                                                     
      if (!label || label.length === 0) {                                                                                                 
        setIsAvailable(null);                                                                                                             
        return;                                                                                                                           
      }                                                                                                                                   
                                                                                                                                          
      const checkAvailability = async () => {                                                                                             
        setIsLoading(true);                                                                                                               
        try {                                                                                                                             
          const client = createPublicClient({                                                                                             
            chain: base,                                                                                                                  
            transport: http(getRpcUrl(CHAIN_IDS.BASE)),                                                                                   
          });                                                                                                                             
                                                                                                                                          
          const available = await client.readContract({                                                                                   
            address: ENS_REGISTRAR_ADDRESSES[CHAIN_IDS.BASE] as `0x${string}`,                                                            
            abi: L2RegistrarABI,                                                                                                          
            functionName: 'available',                                                                                                    
            args: [label],                                                                                                                
          });                                                                                                                             
                                                                                                                                          
          setIsAvailable(available as boolean);                                                                                           
        } catch (error) {                                                                                                                 
          logger.error('[useENSAvailability] Check failed', error);                                                                       
          setIsAvailable(null);                                                                                                           
        } finally {                                                                                                                       
          setIsLoading(false);                                                                                                            
        }                                                                                                                                 
      };                                                                                                                                  
                                                                                                                                          
      // Debounce the check                                                                                                               
      const timeout = setTimeout(checkAvailability, 300);                                                                                 
      return () => clearTimeout(timeout);                                                                                                 
    }, [label]);                                                                                                                          
                                                                                                                                          
    return { isAvailable, isLoading };                                                                                                    
  }                                                                                                                                       
                                                                                                                                          
  2.2 hooks/ens/useENSMint.ts:                                                                                                            
  import { useState, useCallback } from 'react';                                                                                          
  import { useSendTransaction } from '@privy-io/react-auth';                                                                              
  import { encodeFunctionData } from 'viem';                                                                                              
  import L2RegistrarABI from '../../frontend/abis/l2registar.json';                                                                       
  import { ENS_REGISTRAR_ADDRESSES, CHAIN_IDS } from '../config/constants';                                                               
  import { logger } from '../utils/logger';                                                                                               
                                                                                                                                          
  export function useENSMint() {                                                                                                          
    const { sendTransaction } = useSendTransaction();                                                                                     
    const [isPending, setIsPending] = useState(false);                                                                                    
    const [isSuccess, setIsSuccess] = useState(false);                                                                                    
    const [hash, setHash] = useState<string | null>(null);                                                                                
    const [error, setError] = useState<Error | null>(null);                                                                               
                                                                                                                                          
    const mintSubdomain = useCallback(async (label: string, owner: string) => {                                                           
      setIsPending(true);                                                                                                                 
      setIsSuccess(false);                                                                                                                
      setError(null);                                                                                                                     
      setHash(null);                                                                                                                      
                                                                                                                                          
      try {                                                                                                                               
        const data = encodeFunctionData({                                                                                                 
          abi: L2RegistrarABI,                                                                                                            
          functionName: 'register',                                                                                                       
          args: [label, owner as `0x${string}`],                                                                                          
        });                                                                                                                               
                                                                                                                                          
        logger.info('[useENSMint] Minting subdomain', { label, owner });                                                                  
                                                                                                                                          
        const result = await sendTransaction({                                                                                            
          to: ENS_REGISTRAR_ADDRESSES[CHAIN_IDS.BASE] as `0x${string}`,                                                                   
          data,                                                                                                                           
          chainId: CHAIN_IDS.BASE,                                                                                                        
        });                                                                                                                               
                                                                                                                                          
        setHash(result.hash);                                                                                                             
        setIsSuccess(true);                                                                                                               
        logger.info('[useENSMint] Success', { hash: result.hash });                                                                       
                                                                                                                                          
        return result.hash;                                                                                                               
      } catch (err) {                                                                                                                     
        const error = err instanceof Error ? err : new Error('Mint failed');                                                              
        logger.error('[useENSMint] Failed', error);                                                                                       
        setError(error);                                                                                                                  
        throw error;                                                                                                                      
      } finally {                                                                                                                         
        setIsPending(false);                                                                                                              
      }                                                                                                                                   
    }, [sendTransaction]);                                                                                                                
                                                                                                                                          
    const reset = useCallback(() => {                                                                                                     
      setIsPending(false);                                                                                                                
      setIsSuccess(false);                                                                                                                
      setHash(null);                                                                                                                      
      setError(null);                                                                                                                     
    }, []);                                                                                                                               
                                                                                                                                          
    return { mintSubdomain, isPending, isSuccess, hash, error, reset };                                                                   
  }                                                                                                                                       
                                                                                                                                          
  ---                                                                                                                                     
  Phase 3: Components & Pages                                                                                                             
                                                                                                                                          
  The component structure in your plan is good, just remove 'use client' and use the hooks I defined above.                               
                                                                                                                                          
  ---                                                                                                                                     
  Phase 4: User's ENS Display                                                                                                             
                                                                                                                                          
  For showing the user's minted subdomain, you have two options:                                                                          
                                                                                                                                          
  Option A: Check on-chain if user owns a subdomain                                                                                       
  Query the L2Registry to see if the user's address has a registered name.                                                                
                                                                                                                                          
  Option B: Store in local state after minting                                                                                            
  After successful mint, store {address: subdomain} in localStorage or Zustand.                                                           
                                                                                                                                          
  I recommend Option A for reliability.                                                                                                   
                                                                                                                                          
  ---                                                                                                                                     
  Updated Checklist                                                                                                                       
  ┌───────────────────────────────────────────────┬────────────┬─────────────────────────────────────────┐                                
  │                     Task                      │   Status   │                  Notes                  │                                
  ├───────────────────────────────────────────────┼────────────┼─────────────────────────────────────────┤                                
  │ Update config/constants.ts                    │ Required   │ Add ENS_CONFIG, ENS_REGISTRAR_ADDRESSES │                                
  ├───────────────────────────────────────────────┼────────────┼─────────────────────────────────────────┤                                
  │ Import ABI from frontend/abis/l2registar.json │ Required   │ Don't duplicate                         │                                
  ├───────────────────────────────────────────────┼────────────┼─────────────────────────────────────────┤                                
  │ Create hooks/ens/useENSAvailability.ts        │ Required   │ Use viem publicClient                   │                                
  ├───────────────────────────────────────────────┼────────────┼─────────────────────────────────────────┤                                
  │ Create hooks/ens/useENSMint.ts                │ Required   │ Use Privy's useSendTransaction          │                                
  ├───────────────────────────────────────────────┼────────────┼─────────────────────────────────────────┤                                
  │ Create components/ens/ENSMint.tsx             │ Required   │ Remove 'use client'                     │                                
  ├───────────────────────────────────────────────┼────────────┼─────────────────────────────────────────┤                                
  │ Create pages/ens.tsx                          │ Required   │ Follow wallet.tsx pattern               │                                
  ├───────────────────────────────────────────────┼────────────┼─────────────────────────────────────────┤                                
  │ Update Navigation with ENS link               │ Required   │ Add to navItems array                   │                                
  ├───────────────────────────────────────────────┼────────────┼─────────────────────────────────────────┤                                
  │ Enable Privy gas sponsorship for Base         │ Required   │ Dashboard config                        │                                
  ├───────────────────────────────────────────────┼────────────┼─────────────────────────────────────────┤                                
  │ Update _app.tsx                               │ Not needed │ Already works                           │                                
  └───────────────────────────────────────────────┴────────────┴─────────────────────────────────────────┘                                
  ---                                                                                                                           
  Questions Before Implementation                                                                                                         
                                                                                                                                          
  1. User's subdomain display: Should we query the L2Registry on-chain, or would you prefer storing minted names locally?    query onchain by te moment    


  2. Multiple subdomains: Can a user mint multiple subdomains, or one per address? 1 per address


  3. Name validation: Any specific rules beyond alphanumeric + hyphens? (min/max length?) none, just if is available.htere is a function to read called available in the contract.



  4. Integration location: Should ENS minting be a separate /ens page, or integrated into the wallet page directly? integrated in the wallet apage as a componenet