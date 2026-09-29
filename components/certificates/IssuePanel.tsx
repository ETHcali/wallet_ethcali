/**
 * Issue the selected certificates as NFTs, from an operator's wallet.
 *
 * One primary action at a time: sign in → hold ADMIN_ROLE → on Ethereum →
 * "Emitir". The role is read from the contract, not from any list: a wallet
 * without ADMIN_ROLE sees why, and the chain would refuse it anyway. The mint
 * is sponsored (Privy), then the server reads the receipt and records each
 * token (POST /api/certificates/admin/confirm) — the chain decides.
 */
import { useEffect, useState } from 'react';
import { usePrivy, useSendTransaction } from '@privy-io/react-auth';
import { encodeFunctionData, type Address } from 'viem';
import Button from '../shared/Button';
import SwitchChainButton from '../shared/SwitchChainButton';
import { useActiveWallet } from '../../hooks/useActiveWallet';
import { useRequireChain } from '../../hooks/useRequireChain';
import { publicClientFor, explorerTx } from '../../config/chains';
import { truncateAddress } from '../../utils/linkedAccounts';
import {
  CERT_ABI,
  CERT_ADDRESS,
  CERT_ADMIN_ROLE,
  CERT_CHAIN_ID,
  credentialToBytes32,
  etherscanContractUrl,
} from '../../lib/certificates/nft';
import type { AdminCertificate, IssueConfirmResponse } from '../../types/certificates';

type Step = 'checking' | 'signing' | 'confirming' | 'recording';

const STEP_LABEL: Record<Step, string> = {
  checking: 'Revisando en la cadena…',
  signing: 'Confirma en tu wallet…',
  confirming: 'Esperando el bloque…',
  recording: 'Registrando…',
};

/** Contract errors in words. A revert selector is not a message. */
function translate(e: unknown): string {
  const t = e instanceof Error ? `${e.name} ${e.message}` : String(e);
  if (/AlreadyIssued/.test(t)) return 'Uno de estos certificados ya está emitido. Recarga la lista.';
  if (/AccessControlUnauthorizedAccount/.test(t)) return 'Esta wallet no tiene ADMIN_ROLE en el contrato.';
  if (/BatchTooLarge/.test(t)) return 'Máximo 100 certificados por transacción.';
  if (/EmptyCid|EmptyCredential|ZeroAddress/.test(t)) return 'A un certificado le falta wallet o metadata.';
  if (/rejected|denied|cancel/i.test(t)) return 'Cancelado. No se envió nada.';
  return `No se pudo emitir. ${e instanceof Error ? e.message.split('\n')[0] : ''}`.trim();
}

export default function IssuePanel({
  selected,
  onIssued,
}: {
  selected: AdminCertificate[];
  onIssued: () => void;
}) {
  const { getAccessToken } = usePrivy();
  const { sendTransaction } = useSendTransaction();
  const { wallet } = useActiveWallet();
  const chain = useRequireChain(CERT_CHAIN_ID);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [step, setStep] = useState<Step | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ hash: string; count: number; verb?: string } | null>(null);

  const address = wallet?.address as Address | undefined;

  useEffect(() => {
    let live = true;
    setIsAdmin(null);
    if (!address) return;
    publicClientFor(CERT_CHAIN_ID)
      .readContract({ address: CERT_ADDRESS, abi: CERT_ABI, functionName: 'hasRole', args: [CERT_ADMIN_ROLE, address] })
      .then((v) => live && setIsAdmin(Boolean(v)))
      .catch(() => live && setIsAdmin(false));
    return () => {
      live = false;
    };
  }, [address]);

  const ready = selected.filter((r) => !r.issuedTx && r.wallet && r.metadataCid);
  // Already minted, selected to re-point their metadata (a corrected diploma).
  const minted = selected.filter((r) => r.issuedTx && r.tokenId && r.metadataCid);
  const blocked = selected.length - ready.length - minted.length;
  const [syncing, setSyncing] = useState<string | null>(null);

  /**
   * setTokenCid for each selected minted token whose on-chain tokenURI is not
   * ipfs://<metadata_cid> any more. One sponsored tx per token; the contract
   * emits ERC-4906 MetadataUpdate so marketplaces refetch.
   */
  async function syncMetadata() {
    if (step || syncing) return;
    setError(null);
    setResult(null);
    setSyncing('Revisando en la cadena…');
    let changed = 0;
    let last = '';
    try {
      const client = publicClientFor(CERT_CHAIN_ID);
      if (!chain.ready) {
        const switched = await chain.switchTo();
        if (!switched) throw new Error('Cambia tu wallet a Ethereum.');
      }
      for (const r of minted) {
        const uri = (await client.readContract({
          address: CERT_ADDRESS,
          abi: CERT_ABI,
          functionName: 'tokenURI',
          args: [BigInt(r.tokenId as string)],
        })) as string;
        if (uri === `ipfs://${r.metadataCid}`) continue;
        setSyncing(`Actualizando #${r.tokenId}…`);
        const data = encodeFunctionData({
          abi: CERT_ABI,
          functionName: 'setTokenCid',
          args: [BigInt(r.tokenId as string), r.metadataCid as string],
        });
        const { hash } = await sendTransaction({ to: CERT_ADDRESS, data, chainId: CERT_CHAIN_ID }, { sponsor: true });
        const receipt = await client.waitForTransactionReceipt({ hash });
        if (receipt.status !== 'success') throw new Error(`La actualización de #${r.tokenId} falló en la cadena.`);
        changed++;
        last = hash;
      }
      setResult({ hash: last, count: changed, verb: changed ? 'actualizado' : 'ya al día' });
    } catch (e) {
      setError(translate(e));
    } finally {
      setSyncing(null);
    }
  }

  async function issue() {
    if (step) return;
    setError(null);
    setResult(null);
    setStep('checking');
    try {
      const client = publicClientFor(CERT_CHAIN_ID);
      // Read the chain first: a credential already live would revert the batch.
      for (const r of ready) {
        const live = (await client.readContract({
          address: CERT_ADDRESS,
          abi: CERT_ABI,
          functionName: 'tokenOfCredential',
          args: [credentialToBytes32(r.credentialId)],
        })) as bigint;
        if (live !== 0n) throw new Error(`AlreadyIssued ${r.credentialId}`);
      }
      if (!chain.ready) {
        const switched = await chain.switchTo();
        if (!switched) throw new Error('Cambia tu wallet a Ethereum para emitir.');
      }

      const data = encodeFunctionData({
        abi: CERT_ABI,
        functionName: 'issue',
        args: [
          ready.map((r) => ({
            to: r.wallet as Address,
            credentialId: credentialToBytes32(r.credentialId),
            cid: r.metadataCid as string,
          })),
        ],
      });

      setStep('signing');
      const { hash } = await sendTransaction({ to: CERT_ADDRESS, data, chainId: CERT_CHAIN_ID }, { sponsor: true });

      setStep('confirming');
      const receipt = await client.waitForTransactionReceipt({ hash });
      if (receipt.status !== 'success') throw new Error('La transacción falló en la cadena.');

      setStep('recording');
      const token = await getAccessToken();
      const res = await fetch('/api/certificates/admin/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ txHash: hash }),
      });
      const body = (await res.json().catch(() => ({}))) as IssueConfirmResponse & { error?: string };
      if (!res.ok) throw new Error(body.error ?? `No se pudo registrar (${res.status}). La emisión sí ocurrió: ${hash}`);
      setResult({ hash, count: body.issued.length });
      onIssued();
    } catch (e) {
      setError(translate(e));
    } finally {
      // Always, so a rejected signature never locks the button.
      setStep(null);
    }
  }

  return (
    <div className="mb-4 rounded-card border border-line-hairline bg-surface-slab p-4 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-semibold text-content-primary">Emitir NFT</p>
          <p className="text-xs text-content-muted">
            <a href={etherscanContractUrl} target="_blank" rel="noopener noreferrer" className="font-mono text-eth-blue-text hover:underline">
              BuilderCertificate {truncateAddress(CERT_ADDRESS)}
            </a>{' '}
            · Ethereum · gas patrocinado
          </p>
        </div>

        {!address ? (
          <span className="text-xs text-content-muted">Inicia sesión para emitir.</span>
        ) : isAdmin === null ? (
          <span className="text-xs text-content-muted">Leyendo tu rol en el contrato…</span>
        ) : !isAdmin ? (
          <span className="text-xs text-signal-reverted">
            {truncateAddress(address)} no tiene ADMIN_ROLE en el contrato.
          </span>
        ) : !chain.ready ? (
          <SwitchChainButton chain={chain} />
        ) : (
          <div className="flex flex-wrap gap-2">
            {minted.length > 0 && (
              <Button variant="secondary" onClick={syncMetadata} disabled={Boolean(step) || Boolean(syncing)}>
                {syncing ?? `Actualizar metadata (${minted.length})`}
              </Button>
            )}
            <Button onClick={issue} disabled={Boolean(step) || Boolean(syncing) || ready.length === 0}>
              {step ? STEP_LABEL[step] : `Emitir ${ready.length} NFT${ready.length === 1 ? '' : 's'}`}
            </Button>
          </div>
        )}
      </div>

      {selected.length === 0 && <p className="mt-2 text-xs text-content-muted">Selecciona certificados en la tabla.</p>}
      {blocked > 0 && (
        <p className="mt-2 text-xs text-content-muted">
          {blocked} de los seleccionados no se incluyen: les falta wallet o metadata.
        </p>
      )}
      {error && <p className="mt-2 text-sm text-signal-reverted">{error}</p>}
      {result && (
        <p className="mt-2 text-sm text-signal-confirmed">
          {result.verb === 'ya al día'
            ? 'La metadata de los seleccionados ya estaba al día.'
            : `${result.count} ${result.verb ?? 'emitido'}${result.count === 1 ? '' : 's'}`}
          {result.hash && (
            <>
              {' '}·{' '}
              <a href={explorerTx(CERT_CHAIN_ID, result.hash)} target="_blank" rel="noopener noreferrer" className="underline">
                ver transacción
              </a>
            </>
          )}
        </p>
      )}
    </div>
  );
}
