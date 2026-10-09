---
paths:
  - "components/ens/**"
  - "hooks/ens/**"
  - "pages/api/ens/**"
---

# ENS subnames (`<label>.ethcali.eth`)

- Minted on **Base** through the Durin registrar — the one action this Ethereum-only app signs
  on another chain. `ENSSection` calls `useRequireChain(ENS_CONFIG.chainId)` inside the claim
  button and says so under it.
- Addresses live in `ENS_CONFIG` (`config/constants.ts`). The registrar/registry pair was once
  mixed up: re-verify on chain rather than copy.
- Validate with `normalize` from `viem/ens` before `available()` or `register()`.
- Resolution (`hooks/ens/useUserENS.ts`): mainnet primary name first, then the Base registry via
  Blockscout, re-read on chain (`names`, `addr`). Blockscout is an index; the registry decides.
- Mainnet resolution is **not live**: `ethcali.eth` still points at the PublicResolver, not the
  Durin L1Resolver, until the Safe changes it. The code path needs no change when it does.
- viem here is 1.x: no `toCoinType` / ENSIP-19. viem 2 is what unlocks `getEnsName({ coinType })`.
