---
paths:
  - "config/access.ts"
  - "lib/access.ts"
  - "lib/accessAbi.ts"
  - "pages/admin/access.tsx"
  - "pages/api/admin/access/**"
  - "components/admin/AccessManager.tsx"
  - "hooks/admin/**"
---

# Admin access (`/admin/access`)

- `config/access.ts` names the contracts, roles, the seed operator (`SEED_OPERATORS`,
  `0x35b0…BC6B`, owner decision 2026-09-28) and known wallets. `lib/access.ts` builds the matrix:
  candidates from each contract's `RoleGranted` logs (Blockscout) plus seed and known wallets,
  then `hasRole` / `owner()` on chain decides. Emails come from Privy's lookup-by-wallet.
- `GET /api/admin/access` needs any admin role; `POST …/resolve` (email → embedded wallet,
  creating it) needs a wallet that can grant somewhere.
- Every grant, revoke or transfer is a transaction from the connected wallet (`useAccessTx`),
  offered only when it holds DEFAULT_ADMIN_ROLE or is the owner; otherwise name who can sign.
- Donations stop at ADMIN_ROLE for the seed: DEFAULT_ADMIN_ROLE on DonationVault and
  DonationReceipt1155 stays with the Safe.
- **RPC**: `publicClientFor` falls back configured → publicnode → Cloudflare on any HTTP or
  timeout failure (`resilient` in `config/chains.ts`). viem 1.x's own `fallback` treats a 525 as
  final, which once made every role read as "no role".
