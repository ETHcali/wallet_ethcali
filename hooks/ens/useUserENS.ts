/**
 * useUserENS - Hook for querying user's ENS subdomain from on-chain events
 */
import { useState, useEffect } from 'react';
import { createPublicClient, http, parseAbiItem } from 'viem';
import { base } from 'viem/chains';
import { ENS_REGISTRAR_ADDRESSES, ENS_CONFIG, CHAIN_IDS, getRpcUrl } from '../../config/constants';
import { logger } from '../../utils/logger';

interface UserENSResult {
  subdomain: string | null;
  fullName: string | null;
  isLoading: boolean;
  refetch: () => void;
}

export function useUserENS(address: string | undefined): UserENSResult {
  const [subdomain, setSubdomain] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchTrigger, setFetchTrigger] = useState(0);

  useEffect(() => {
    if (!address) {
      setSubdomain(null);
      return;
    }

    const fetchUserENS = async () => {
      setIsLoading(true);
      try {
        const client = createPublicClient({
          chain: base,
          transport: http(getRpcUrl(CHAIN_IDS.BASE)),
        });

        const registrarAddress = ENS_REGISTRAR_ADDRESSES[CHAIN_IDS.BASE];
        if (!registrarAddress) {
          logger.error('[useUserENS] No registrar address for Base');
          setSubdomain(null);
          return;
        }

        // Query NameRegistered events for this owner
        const logs = await client.getLogs({
          address: registrarAddress as `0x${string}`,
          event: parseAbiItem('event NameRegistered(string indexed label, address indexed owner)'),
          args: {
            owner: address as `0x${string}`,
          },
          fromBlock: 'earliest',
          toBlock: 'latest',
        });

        if (logs.length > 0) {
          // Get the most recent registration (last event)
          const latestLog = logs[logs.length - 1];
          // The label is indexed so we get the hash, but we stored the actual label in the event
          // For indexed string, we get the keccak256 hash. We need to decode from the raw data.
          // Actually, looking at the ABI again - indexed strings give us the hash.
          // We need a different approach - either use a subgraph or store locally after mint.

          // Alternative: Check if there's non-indexed data we can use
          // For now, let's try to get the label from the transaction input data
          const txHash = latestLog.transactionHash;
          if (txHash) {
            const tx = await client.getTransaction({ hash: txHash });
            if (tx && tx.input) {
              // Decode the register function call to get the label
              // register(string label, address owner)
              // Function selector is first 4 bytes, then we have the encoded params
              try {
                // Skip function selector (4 bytes = 8 hex chars + '0x')
                const inputData = tx.input.slice(10);
                // First param is offset to string (32 bytes)
                // Second param is address (32 bytes)
                // Then string length (32 bytes) followed by string data
                const stringOffset = parseInt(inputData.slice(0, 64), 16);
                const stringLengthHex = inputData.slice(stringOffset * 2, stringOffset * 2 + 64);
                const stringLength = parseInt(stringLengthHex, 16);
                const stringDataHex = inputData.slice(stringOffset * 2 + 64, stringOffset * 2 + 64 + stringLength * 2);
                const label = Buffer.from(stringDataHex, 'hex').toString('utf8');

                setSubdomain(label);
                logger.info('[useUserENS] Found subdomain', { label, address });
                return;
              } catch (decodeError) {
                logger.error('[useUserENS] Failed to decode label from tx', decodeError);
              }
            }
          }
        }

        setSubdomain(null);
      } catch (error) {
        logger.error('[useUserENS] Query failed', error);
        setSubdomain(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserENS();
  }, [address, fetchTrigger]);

  const refetch = () => setFetchTrigger(prev => prev + 1);

  return {
    subdomain,
    fullName: subdomain ? `${subdomain}.${ENS_CONFIG.parentName}` : null,
    isLoading,
    refetch,
  };
}
