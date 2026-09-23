/**
 * /swag/claim — turn a Shopify order into the NFT it paid for.
 *
 * Signed-in only. The list comes from GET /api/swag/orders, which matches the
 * caller's Privy-verified emails against what Shopify collected at checkout;
 * nothing on this page decides who owns what. Each claim is three steps and
 * the button owns every one of them:
 *
 *   1. POST /api/swag/claim { orderId }     the server signs a voucher
 *   2. claim(voucher, signature) on Base     sponsored, via Privy
 *   3. POST /api/swag/claim { orderId, txHash }   the server reads the Claimed
 *                                                 log and records the tx
 *
 * Swag is Base-only: the chain id is fixed on the transaction, never read from
 * the wallet.
 */
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { usePrivy, useSendTransaction } from '@privy-io/react-auth';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createPublicClient, encodeFunctionData, http } from 'viem';
import { base } from 'viem/chains';
import Navigation from '../../components/Navigation';
import Layout from '../../components/shared/Layout';
import Loading from '../../components/shared/Loading';
import Button from '../../components/shared/Button';
import { ArrowRightIcon, CheckIcon } from '../../components/shared/icons';
import Swag1155ABI from '../../frontend/abis/Swag1155.json';
import { CHAIN_IDS, getRpcUrl } from '../../config/constants';
import { getTxUrl } from '../../utils/explorer';
import type {
  ClaimConfirmResponse,
  ClaimIssueResponse,
  SwagOrderView,
  SwagOrdersResponse,
} from '../../types/swag-orders';

const BASE = CHAIN_IDS.BASE;
/** Product photos live on the website; imagePath is a path under its public/. */
const SITE_ASSETS = 'https://ethcali.org';

type Step = 'signing' | 'sending' | 'confirming';

/**
 * The contract's custom errors, in words. A revert selector is not a message.
 * Matched by name because that is what viem and Privy surface in the error
 * text when a sponsored transaction fails simulation.
 */
function translateClaimError(e: unknown): string {
  const text = e instanceof Error ? `${e.name} ${e.message}` : String(e);
  if (/VoucherExpired/.test(text)) return 'Claim failed. The voucher expired — press Claim again for a new one.';
  if (/VoucherAlreadyClaimed/.test(text)) return 'Nothing to do. This order was already claimed or was cancelled.';
  if (/SoldOut/.test(text)) return 'Claim failed. No units are left for this design. Contact the team.';
  if (/InvalidSignature/.test(text)) return 'Claim failed. The voucher was not accepted. Contact the team.';
  if (/VariantNotActive|VariantNotFound/.test(text)) return 'Claim failed. This design is not claimable right now.';
  if (/EnforcedPause/.test(text)) return 'Claim failed. The collection is paused.';
  if (/rejected|denied|cancel/i.test(text)) return 'Cancelled. Nothing was sent.';
  return 'Claim failed. Nothing left your wallet.';
}

async function api<T>(path: string, token: string, body?: unknown): Promise<T> {
  const res = await fetch(path, {
    method: body ? 'POST' : 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) throw new Error(json.error ?? `Request failed (${res.status})`);
  return json;
}

const STEP_LABEL: Record<Step, string> = {
  signing: 'Preparing voucher…',
  sending: 'Confirm in your wallet…',
  confirming: 'Confirming on Base…',
};

export default function SwagClaimPage() {
  const router = useRouter();
  const { ready, authenticated, user, getAccessToken } = usePrivy();
  const { sendTransaction } = useSendTransaction();
  const queryClient = useQueryClient();

  // Every button owns its own pending state; nothing here is shared.
  const [pending, setPending] = useState<Record<number, Step>>({});
  const [errors, setErrors] = useState<Record<number, string>>({});
  const [minted, setMinted] = useState<Record<number, string>>({});

  useEffect(() => {
    if (ready && !authenticated) {
      // With the destination attached, and `replace` so Back does not bounce.
      router.replace(`/?next=${encodeURIComponent('/swag/claim')}`);
    }
  }, [ready, authenticated, router]);

  const ordersQuery = useQuery({
    queryKey: ['swag-orders', user?.id],
    enabled: ready && authenticated,
    queryFn: async () => {
      const token = await getAccessToken();
      if (!token) throw new Error('Not signed in');
      const { orders } = await api<SwagOrdersResponse>('/api/swag/orders', token);
      return orders;
    },
  });

  const claim = useCallback(
    async (order: SwagOrderView) => {
      const id = order.id;
      setErrors((prev) => ({ ...prev, [id]: '' }));
      setPending((prev) => ({ ...prev, [id]: 'signing' }));
      try {
        const token = await getAccessToken();
        if (!token) throw new Error('Not signed in');

        const issued = await api<ClaimIssueResponse>('/api/swag/claim', token, { orderId: id });

        const data = encodeFunctionData({
          abi: Swag1155ABI,
          functionName: 'claim',
          args: [
            {
              tokenId: BigInt(issued.voucher.tokenId),
              to: issued.voucher.to,
              quantity: BigInt(issued.voucher.quantity),
              orderRef: issued.voucher.orderRef,
              deadline: BigInt(issued.voucher.deadline),
            },
            issued.signature,
          ],
        });

        setPending((prev) => ({ ...prev, [id]: 'sending' }));
        const { hash } = await sendTransaction(
          { to: issued.collection, data, chainId: issued.chainId },
          { sponsor: true }
        );

        setPending((prev) => ({ ...prev, [id]: 'confirming' }));
        const client = createPublicClient({ chain: base, transport: http(getRpcUrl(BASE)) });
        const receipt = await client.waitForTransactionReceipt({ hash });
        if (receipt.status !== 'success') throw new Error('Transaction reverted');

        const confirmed = await api<ClaimConfirmResponse>('/api/swag/claim', token, {
          orderId: id,
          txHash: hash,
        });
        setMinted((prev) => ({ ...prev, [id]: confirmed.claimTxHash }));
        queryClient.invalidateQueries({ queryKey: ['swag-orders'] });
      } catch (e) {
        setErrors((prev) => ({ ...prev, [id]: translateClaimError(e) }));
      } finally {
        // Always. A rejected wallet prompt must not lock the button.
        setPending((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
      }
    },
    [getAccessToken, sendTransaction, queryClient]
  );

  if (!ready) return <Loading fullScreen text="Loading…" />;
  if (!authenticated) return <Loading fullScreen text="Redirecting…" />;

  const orders = ordersQuery.data ?? [];
  const claimable = orders.filter((o) => o.claimable && !minted[o.id]);
  const claimed = orders.filter((o) => o.channel === 'shopify' && (o.claimTxHash || minted[o.id]));

  return (
    <div className="min-h-screen bg-surface-void">
      <Navigation />
      <Layout>
        <div className="mb-8">
          <p className="mb-1 font-mono text-xs font-semibold uppercase tracking-widest text-eth-blue-text">
            Swag · Base
          </p>
          <h1 className="text-3xl font-bold text-content-primary sm:text-4xl">Claim your swag NFT</h1>
          <p className="mt-2 text-sm text-content-muted">
            Orders paid by card on the ETH Cali store, matched to the email you signed in with.
            Each one mints once, to your wallet, gas covered.
          </p>
        </div>

        {ordersQuery.isLoading && <Loading text="Looking up your orders…" />}

        {ordersQuery.isError && (
          <div className="rounded-card border border-line-hairline bg-surface-slab p-6 text-sm text-signal-reverted">
            Could not load your orders. {(ordersQuery.error as Error).message}
          </div>
        )}

        {ordersQuery.isSuccess && claimable.length === 0 && claimed.length === 0 && (
          <div className="rounded-card border border-line-hairline bg-surface-slab p-10 text-center">
            <p className="text-lg font-medium text-content-secondary">Nothing to claim yet</p>
            <p className="mt-2 text-sm text-content-muted">
              Card orders appear here once Shopify marks them paid. If you paid with a different
              email, sign in with that one.
            </p>
          </div>
        )}

        {claimable.length > 0 && (
          <section className="mb-10">
            <h2 className="mb-4 text-lg font-semibold text-content-primary">Ready to claim</h2>
            <ul className="space-y-4">
              {claimable.map((order) => {
                const step = pending[order.id];
                const error = errors[order.id];
                return (
                  <li
                    key={order.id}
                    className="flex flex-col gap-4 rounded-card border border-line-hairline bg-surface-slab p-4 sm:flex-row sm:items-center"
                  >
                    <OrderArt order={order} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-content-primary">{order.product.nameEn}</p>
                      <p className="mt-0.5 font-mono text-xs text-content-muted">
                        {order.product.sku}
                        {order.size ? ` · ${order.size}` : ''}
                        {order.quantity > 1 ? ` · ×${order.quantity}` : ''}
                      </p>
                      <p className="mt-1 text-xs text-content-faint">
                        Paid {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                      {error && <p className="mt-2 text-sm text-signal-reverted">{error}</p>}
                    </div>
                    <Button onClick={() => claim(order)} disabled={Boolean(step)} className="sm:w-48">
                      {step ? STEP_LABEL[step] : 'Claim'}
                      {!step && <ArrowRightIcon className="h-4 w-4" />}
                    </Button>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {claimed.length > 0 && (
          <section>
            <h2 className="mb-4 text-lg font-semibold text-content-primary">Claimed</h2>
            <ul className="space-y-3">
              {claimed.map((order) => {
                const hash = minted[order.id] ?? order.claimTxHash ?? '';
                return (
                  <li
                    key={order.id}
                    className="flex items-center gap-4 rounded-card border border-line-hairline bg-surface-slab p-4"
                  >
                    <OrderArt order={order} small />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-content-primary">{order.product.nameEn}</p>
                      <p className="font-mono text-xs text-content-muted">
                        {order.product.sku}
                        {order.size ? ` · ${order.size}` : ''}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-signal-confirmed">
                      <CheckIcon className="h-4 w-4" />
                      Minted
                    </span>
                    {hash && (
                      <a
                        href={getTxUrl(BASE, hash)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-xs text-eth-blue-text hover:underline"
                      >
                        {hash.slice(0, 6)}…{hash.slice(-4)}
                      </a>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        )}
      </Layout>
    </div>
  );
}

function OrderArt({ order, small = false }: { order: SwagOrderView; small?: boolean }) {
  const size = small ? 'h-12 w-12' : 'h-20 w-20';
  if (!order.product.imagePath) {
    return <div className={`${size} shrink-0 rounded-chip bg-surface-inset`} aria-hidden />;
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element -- remote host not in next.config images
    <img
      src={`${SITE_ASSETS}/${order.product.imagePath}`}
      alt={order.product.nameEn}
      className={`${size} shrink-0 rounded-chip bg-surface-inset object-cover`}
    />
  );
}
