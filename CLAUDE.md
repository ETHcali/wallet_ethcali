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
- **Styling**: Tailwind CSS (dark theme: slate/cyan/pink palette)
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
- Dark theme: `bg-slate-900`, `border-slate-700`, `text-white`, accents `cyan-400`, `green-400`
- Modals use fixed overlay pattern with `bg-black/80 backdrop-blur-sm`

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
