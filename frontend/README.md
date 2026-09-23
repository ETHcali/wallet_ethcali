# `frontend/` — generated contract bindings

Everything in this directory except this file is written by

```bash
npm run sync:contracts        # scripts/sync-contracts.mjs
```

from the sibling checkout `../scs-ethcali/frontend` (the contracts repo,
`github.com/ETHcali/scs-ethcali`). **Never hand-edit these files.** Re-run the
sync after the contracts repo changes and commit the result; the copies are
committed so Vercel can build without the sibling checkout.

| File | What it is | Who reads it |
|------|------------|--------------|
| `abis/*.json` | Every ABI the contracts repo exports, as bare arrays. `ERC20.json`, `l2registar.json` and `l2registry.json` live only here and are left alone by the sync. | hooks, `utils/contracts.ts`, `pages/api/**` |
| `abis/swag.ts` | `swag1155Abi` as a typed `as const` array, derived from `abis/Swag1155.json`. This is what lets viem type-check every swag call. | `hooks/swag/**`, `hooks/useUserNFTs.ts`, `hooks/useAdminStatus.ts` |
| `addresses.json` | Per-network deployed addresses: `{ base, ethereum, optimism, unichain, celo } → { chainId, addresses: { ZKPassportNFT?, FaucetManager?, SwagFactory?, DonationVault?, DonationReceipt1155? } }`. | **`config/chains.ts`** — the one chain registry derives each chain's `contracts` and `features` from this file |
| `swag-collection.json` | The live `Swag1155` clone (`ETHCALI-SWAG-2026`): `{ name, chainId, address, factory, usdc, deployedAt }`, read from `scs-ethcali/deployments/<SWAG_CHAIN>-latest.json` (`ethereum` by default). The one place the swag chain is chosen. | `config/chains.ts` (`contracts.Swag1155`), `config/constants.ts` (`SWAG_COLLECTION`), `lib/swag/onchain.ts`, the swag scripts |
| `contracts.ts`, `contracts.json`, `<network>/` | The contracts repo's own multi-network bundle (`CONTRACTS` with inlined ABIs, `ADDRESSES`, `getAddresses()`), copied verbatim. Nothing in the wallet imports it any more; it is kept because the sync copies it and because it is the shape other consumers of the contracts repo expect. | — |
| `CONTRACTS_SOURCE.json` | `{ repo, commit, generatedAt }` so a stale copy can be traced to the commit it came from. | humans |

## Which contract is on which chain

Do not keep a list here — it goes stale. `addresses.json` is the list, and
`config/chains.ts` turns the `ethereum` entry into `ETHEREUM.contracts`, which
every page reads (`DEFAULT_CHAIN.contracts.FaucetManager`, and so on). The app
offers Ethereum only; other networks in this file are not used. To see what
the file says today:

```bash
node -e "const a=require('./frontend/addresses.json');for(const k in a)console.log(a[k].chainId,k,Object.keys(a[k].addresses).join(', '))"
```

## Reading a contract from the app

```ts
import { getChain, publicClientFor } from '../config/chains';
import FaucetManagerABI from '../frontend/abis/FaucetManager.json';

const chain = getChain(chainId);                 // undefined for an unsupported id — no fallback
const address = chain?.contracts.FaucetManager;   // undefined where it is not deployed
if (chain && address) {
  await publicClientFor(chain.id).readContract({ address, abi: FaucetManagerABI, functionName: 'paused' });
}
```

The chain id is always explicit. Nothing reads "the wallet's chain"; the wallet
is moved by `hooks/useRequireChain.ts` right before a transaction is signed.
