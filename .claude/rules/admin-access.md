---
paths:
  - "config/access.ts"
  - "lib/roles.ts"
  - "lib/adminAuth.ts"
  - "lib/certificates/requireCertAdmin.ts"
  - "hooks/useAdminStatus.ts"
  - "components/admin/AdminShell.tsx"
  - "lib/access.ts"
  - "lib/accessAbi.ts"
  - "pages/admin/access.tsx"
  - "pages/api/admin/access/**"
  - "components/admin/AccessManager.tsx"
  - "hooks/admin/**"
---

# Admin access (`/admin/access`)

## One reader, one gate per area

`lib/roles.ts` (`holdsRole`, `firstHolder`, `readAdminRoles`) is the one `hasRole` / `owner()`
reader, driven by `config/access.ts`. The admin menu (`useAdminRoles`) and the server gates
`requireAdmin` and `requireCertAdmin` both use it, and both check **every linked Privy
wallet**, not only the active one. A page that signs still checks the active wallet, because
that is the one the contract sees. An RPC failure on one wallet moves on to the next; it never
reads as "yes".

| Area | Menu shows it for | API gate |
|---|---|---|
| Access | any admin-level role (`isOperator`); fulfilment alone is not one | `requireUser` + `isOperator` (the matrix carries emails) |
| Donations | Vault ADMIN or DEFAULT | `requireAdmin` (Vault ADMIN) |
| Faucet / Identity | Faucet ADMIN or DEFAULT / ZK `owner()` | chain only |
| Swag | swag ADMIN or FULFILLMENT | `requireSwagStaff` / `requireSwagAdmin` / `requireSwagSuperAdmin` |
| Artwork | swag ADMIN | `requireSwagAdmin` (`/api/swag/variants`, `/api/pinata/pin-image`) |
| Site content | Vault ADMIN | `requireAdmin`; owner decision 2026-10-10: stays on the Vault |
| Team | Vault ADMIN or certificate ADMIN | `requireOperator` |
| Certificates | certificate ADMIN | `requireCertAdmin` |

A new area adds a flag to `AdminRoles`, a row here, and a gate that asks the contract the work
belongs to.

## The matrix

- `config/access.ts` names the contracts, roles, the seed operator (`SEED_OPERATORS`,
  `0x35b0…BC6B`, owner decision 2026-09-28) and known wallets. `lib/access.ts` builds the matrix:
  candidates from each contract's `RoleGranted` logs (Blockscout) plus seed and known wallets,
  then `hasRole` / `owner()` on chain decides. Emails come from Privy's lookup-by-wallet.
- `GET /api/admin/access` needs an admin-level role (not fulfilment alone); `POST …/resolve` (email → embedded wallet,
  creating it) needs a wallet that can grant somewhere.
- Every grant, revoke or transfer is a transaction from the connected wallet (`useAccessTx`),
  offered only when it holds DEFAULT_ADMIN_ROLE or is the owner; otherwise name who can sign.
- The swag `SIGNER_ROLE` (voucher signer `0x3977…62e6`) is listed but not grantable: it moves
  only through `addSigner` / `removeSigner` (DEFAULT_ADMIN_ROLE).
- Donations stop at ADMIN_ROLE for the seed: DEFAULT_ADMIN_ROLE on DonationVault and
  DonationReceipt1155 stays with the Safe.
- **RPC**: `publicClientFor` falls back configured → publicnode → Cloudflare on any HTTP or
  timeout failure (`resilient` in `config/chains.ts`). viem 1.x's own `fallback` treats a 525 as
  final, which once made every role read as "no role".
