/**
 * Pinning to IPFS through Pinata — server-only (PINATA_JWT).
 *
 * The admin routes call these after their own ADMIN_ROLE check; nothing here
 * checks who is asking. Returns bare CIDs: callers store ipfs://<cid>, never a
 * gateway URL, because the CID is permanent and a gateway is a vendor.
 */
export class PinError extends Error {}

function jwt(): string {
  const token = process.env.PINATA_JWT;
  if (!token) throw new PinError('Pinata is not configured on the server');
  return token;
}

export async function pinFile(bytes: Uint8Array, fileName: string, mime: string): Promise<string> {
  const form = new FormData();
  form.append('file', new Blob([new Uint8Array(bytes)], { type: mime }), fileName);
  form.append('pinataMetadata', JSON.stringify({ name: fileName }));
  const res = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
    method: 'POST',
    headers: { Authorization: `Bearer ${jwt()}` },
    body: form,
  });
  const body = (await res.json().catch(() => ({}))) as { IpfsHash?: string };
  if (!res.ok || !body.IpfsHash) throw new PinError(`Pinata refused ${fileName} (${res.status})`);
  return body.IpfsHash;
}

export async function pinJson(json: unknown, name: string): Promise<string> {
  const res = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
    method: 'POST',
    headers: { Authorization: `Bearer ${jwt()}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ pinataContent: json, pinataMetadata: { name }, pinataOptions: { cidVersion: 1 } }),
  });
  const body = (await res.json().catch(() => ({}))) as { IpfsHash?: string };
  if (!res.ok || !body.IpfsHash) throw new PinError(`Pinata refused ${name} (${res.status})`);
  return body.IpfsHash;
}
