# ETH Cali Wallet — Project Conventions

## Build Verification (MANDATORY)

After **every** code change, run:

```bash
npm run typecheck
```

This runs `tsc --noEmit`. Fix all new TypeScript errors before considering any task complete. The tsconfig has `strict`, `noUnusedLocals`, and `noUnusedParameters` enabled — no unused variables or imports are allowed.

## Tech Stack

- **Framework**: Next.js 16 (Pages Router, Turbopack)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS on the `@ethcali/design-tokens` preset (dark-only, see Branding below)
- **Auth & Wallets**: Privy (`@privy-io/react-auth`)
- **Blockchain**: viem (not ethers for new code)
- **State/Data**: TanStack React Query for server state, Zustand for client state
- **Contracts**: ABIs in `frontend/abis/`, addresses in `frontend/addresses.json`

## Project Structure

```
pages/           → Next.js pages (routes)
components/      → React components grouped by domain (faucet/, swag/, wallet/, etc.)
hooks/           → Custom hooks, grouped by domain (faucet/, swag/)
types/           → TypeScript interfaces and enums
config/          → Network config, constants
utils/           → Utility functions
frontend/abis/   → Contract ABI JSON files
frontend/        → Contract addresses, generated contract bindings
lib/             → External service integrations (Pinata, etc.)
docs/            → Contract reference documentation
```

## Coding Patterns

### Contract Interactions

- **Reads**: Use `useQuery` + `createPublicClient` + `client.readContract()`
- **Writes**: Use `useSendTransaction` from Privy + `encodeFunctionData` from viem
- **Gas**: Always use `{ sponsor: true }` for sendTransaction
- **Query invalidation**: Invalidate relevant query keys after mutations

### Hook Structure

Each domain (faucet, swag) has:
- `hooks/{domain}/index.ts` — barrel export (keep updated when adding/removing hooks)
- Query hooks (read from chain)
- Mutation hooks (write to chain)

### Components

- Use Tailwind classes directly, no CSS modules
- Colours, radii and type come only from the token preset (see Branding). Never a raw hex or a Tailwind palette colour (`slate-*`, `cyan-*`, `green-*`) in a component.
- Modals use fixed overlay pattern with `bg-black/80 backdrop-blur-sm`
- Icons are inline stroke SVG from `components/shared/icons.tsx`. No emoji, no icon fonts.

## Rules

1. **No dead code**: Delete unused files, imports, variables, and types. Do not leave commented-out code or `// removed` markers.
2. **No dead exports**: If a hook or type is removed, update the barrel `index.ts` file.
3. **ABI files are generated**: Never hand-edit files in `frontend/abis/`. They come from contract compilation.
4. **Contract reference docs**: When contract functions change, check `docs/` references are still accurate.
5. **Keep user-facing and admin flows separate**: Admin components use admin hooks; user-facing components (ProductCard, FaucetClaim) use their own hooks.
6. **Prefer editing over creating**: Modify existing files rather than creating new ones, unless adding a genuinely new module.
7. **NEVER run `npm audit fix --force`**: It blindly upgrades major versions and breaks the app. Vulnerabilities from transitive deps are handled via `overrides` in package.json. Only upgrade direct dependencies manually after verifying compatibility.
8. **Pin direct dependencies**: Use exact versions (no `^`) for `next`, `react`, `react-dom`. Use `^` only for packages where minor updates are safe.

## Contract Architecture

### FaucetManager
- Multi-vault ETH faucet with optional ZKPassport + token gating
- Vault CRUD: `createVault`, `updateVault`, `updateVaultGating`
- User flow: `claim`, `returnFunds`

### Swag1155
- ERC-1155 multi-token for physical merchandise
- Variant-based: `listTokenIds`, `getVariant`, `setVariant`, `setVariantWithURI`
- Royalties: `addRoyalty`, `clearRoyalties`, `getRoyalties`, `totalRoyaltyBps`
- User flow: `buy`, `buyBatch`, `redeem`
- Payments in USDC (6 decimals), automatic royalty splits

## Branding

The visual system is `@ethcali/design-tokens` (github.com/ETHcali/design-tokens, pinned to
`#v1`). `tokens.css` is imported once in `pages/_app.tsx`; `tailwind.config.js` only loads
the preset and extends nothing. The rules, from `branding_repo/` in the workspace root:

| Need | Use |
|------|-----|
| Page / card / input / raised control | `bg-surface-void` / `-slab` / `-inset` / `-ridge` |
| Text ramp | `text-content-primary` / `-secondary` / `-muted` / `-faint` |
| Dividers, control borders, focused borders | `border-line-hairline` / `-strong` / `-brand` |
| The one brand colour (filled CTAs, active nav) | `bg-eth-blue`, hover `bg-eth-blue-lift`, links and mono data `text-eth-blue-text`, tints `bg-eth-blue-wash` |
| Confirmed / pending / reverted | `signal-confirmed` / `signal-pending` / `signal-reverted` — **only** for on-chain state, never decoration |
| Radii | `rounded-chip` (8) / `rounded-control` (14, buttons and inputs) / `rounded-card` (20) |
| Touch target | `min-h-tap` (48px) on every onchain button |

- Sarun Pro for anything a human wrote, `font-mono` (JetBrains Mono) for anything a chain
  produced: addresses, hashes, amounts, chain names, uppercase labels.
- Sarun Pro has no 600; the preset maps `font-semibold` to 700. Do not "fix" it.
- Fixed-alpha tokens (`eth-blue-wash`, `eth-blue-ring`, `line-*`) take no `/opacity` modifier.
- No drop shadows, no hue gradients, no hover lift. The only gradient is ultramarine to
  transparent at 16% or less; the only glow is the emphasis card.
- Copy is sentence case. Status first on errors ("Transfer failed. Nothing left your wallet.").
  Addresses truncate with a real ellipsis: `0x55C9…711d`.
- `styles/globals.css` keeps its `:root` block on purpose: `html, body` read the page colour
  from it. It points at the tokens and must not redefine `--text-secondary`, which the token
  file already owns.

## ENS subnames (`<label>.ethcali.eth`)

Minted on Base through the Durin registrar; the registry is an ERC-721 whose token id is the
name's node. Addresses live in `ENS_CONFIG` (`config/constants.ts`) and were verified on-chain;
the registrar/registry pair was previously mixed up in the lookup route, so re-verify rather
than copy.

- Validate with `normalize` from `viem/ens` (ENSIP-15) before `available()` or `register()`.
- Resolution order (`hooks/ens/useUserENS.ts`): mainnet primary name first, then the Base
  registry located through Blockscout and re-read on-chain (`names(node)`, `addr(node)`).
  Blockscout is an index; the registry decides what is shown. No localStorage cache.
- Mainnet resolution of these names is **not live**: `ethcali.eth` still points at the ENS
  PublicResolver, not the Durin L1Resolver, so `getEnsName`/`getEnsAddress` return nothing
  for them until the Safe changes the resolver. The code path exists and needs no change
  when that happens.
- viem here is 1.x, which has no `toCoinType` / ENSIP-19 L2 primary-name support. Upgrading
  to viem 2 is what unlocks `getEnsName({ coinType })` per docs.ens.domains.
