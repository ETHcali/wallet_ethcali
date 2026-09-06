/**
 * useUserENS - Which `<label>.ethcali.eth` does this address hold?
 *
 * Layers, in order, per docs.ens.domains "resolution always starts on mainnet":
 *   1. A label we just registered — verified against the registry, not trusted.
 *   2. Mainnet primary name (reverse record). Only answers once ethcali.eth's
 *      resolver on L1 is the Durin L1Resolver, which it is not yet.
 *   3. The Base registry itself: Blockscout lists the registry tokens the address
 *      holds, then names(node) and addr(node) are re-read on-chain. The index
 *      only tells us where to look; the chain decides what is shown.
 *
 * There is deliberately no localStorage cache. A name can be transferred, and a
 * cached label would keep showing it to its old owner.
 */
import { useQuery } from '@tanstack/react-query';
import { createPublicClient, http, isAddressEqual } from 'viem';
import { base, mainnet } from 'viem/chains';
import L2RegistryABI from '../../frontend/abis/l2registry.json';
import { ENS_CONFIG, CHAIN_IDS, getRpcUrl } from '../../config/constants';
import { decodeDnsName, fullName, labelOf, subnameNode } from '../../utils/ens';
import { logger } from '../../utils/logger';

interface UserName {
  label: string;
  node: `0x${string}`;
}

interface UserENSResult {
  subdomain: string | null;
  fullName: string | null;
  node: `0x${string}` | null;
  isLoading: boolean;
  refetch: () => void;
}

function baseClient() {
  return createPublicClient({ chain: base, transport: http(getRpcUrl(CHAIN_IDS.BASE)) });
}

/** True when the registry says this node's address record is `address`. */
async function ownsNode(node: `0x${string}`, address: `0x${string}`): Promise<boolean> {
  const addr = (await baseClient().readContract({
    address: ENS_CONFIG.registry,
    abi: L2RegistryABI,
    functionName: 'addr',
    args: [node],
  })) as `0x${string}`;
  return isAddressEqual(addr, address);
}

async function lookup(address: `0x${string}`, knownLabel: string | null): Promise<UserName | null> {
  // 1. Just registered: verify, never assume.
  if (knownLabel) {
    const node = subnameNode(knownLabel);
    if (await ownsNode(node, address)) return { label: knownLabel, node };
  }

  // 2. Mainnet primary name.
  try {
    const name = await createPublicClient({
      chain: mainnet,
      transport: http(getRpcUrl(CHAIN_IDS.ETHEREUM)),
    }).getEnsName({ address });
    const label = labelOf(name);
    if (label) return { label, node: subnameNode(label) };
  } catch (err) {
    logger.debug('[useUserENS] Mainnet reverse lookup unavailable', err);
  }

  // 3. The Base registry, located through the index.
  const res = await fetch(`/api/ens/lookup?address=${address}`);
  if (!res.ok) throw new Error(`lookup ${res.status}`);
  const { nodes } = (await res.json()) as { nodes: `0x${string}`[] };
  const client = baseClient();
  for (const node of nodes) {
    const encoded = (await client.readContract({
      address: ENS_CONFIG.registry,
      abi: L2RegistryABI,
      functionName: 'names',
      args: [node],
    })) as `0x${string}`;
    const label = labelOf(decodeDnsName(encoded));
    if (label && (await ownsNode(node, address))) return { label, node };
  }
  return null;
}

export function useUserENS(address: string | undefined, knownLabel: string | null = null): UserENSResult {
  const query = useQuery({
    queryKey: ['ens-user-name', address, knownLabel],
    enabled: !!address,
    staleTime: 60_000,
    queryFn: () => lookup(address as `0x${string}`, knownLabel),
  });

  const found = query.data ?? null;
  return {
    subdomain: found?.label ?? null,
    fullName: found ? fullName(found.label) : null,
    node: found?.node ?? null,
    isLoading: query.isLoading,
    refetch: () => {
      query.refetch();
    },
  };
}
