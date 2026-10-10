# Role alignment — October 2026

Transactions that bring the live roles in line with `SEED_OPERATORS` in `config/access.ts`.
Ethereum mainnet. Roles read on chain 2026-10-10. Each step names the only key that can sign it.
`/admin/access` offers steps 1 and 3 as buttons to a wallet that holds the granting role; the
calldata is here for signing from a Safe or a hardware wallet.

```
ADMIN_ROLE         0xa49807205ce4d355092ef5a8a18f56e8913cf4a201fbe287825b095693c21775
DEFAULT_ADMIN_ROLE 0x0000000000000000000000000000000000000000000000000000000000000000
seed               0x35b0c64CeDC2fD1a7298984CBa5C7E402970BC6B
ops key            0x3B89Ad8cC39900778aBCdcc22bc83cAC031A415b
deployer           0x3c9204b25966591749450fb233d58E850E7c1f9F
```

## 1. Seed gets DEFAULT_ADMIN_ROLE on the swag collection

- **Signed by:** the ops key `0x3B89…415B`, the only holder.
- **Contract:** `0x5a1012486764c217a20B5D1b97508E1de83179E7`, `grantRole(DEFAULT_ADMIN_ROLE, seed)`
- **Calldata:** `0x2f2ff15d000000000000000000000000000000000000000000000000000000000000000000000000000000000000000035b0c64cedc2fd1a7298984cba5c7e402970bc6b`

## 2. Seed becomes owner of ZKPassportNFT

- **Signed by:** the deployer `0x3C92…1f9F`, the current owner.
- **Contract:** `0x607003f188c49ed6e0553805734b9990393402df`, `transferOwnership(seed)`
- **Calldata:** `0xf2fde38b00000000000000000000000035b0c64cedc2fd1a7298984cba5c7e402970bc6b`
- **Warning:** this is plain `Ownable` (one step, no `acceptOwnership`). The transfer is final the
  moment it lands, so check the address byte for byte.

## 3. Optional: ops key gets ADMIN_ROLE on BuilderCertificate and FaucetManager

Do this only if the ops key should run certificates and the faucet day to day. The seed holds
both today.

- **Signed by:** the seed, which holds DEFAULT_ADMIN_ROLE on both contracts.
- **Contracts:** `0x0499924492348159aA281385aCe43539689e158B` and
  `0x2940e286b41d279b61e484b98a08498e355e4778`, `grantRole(ADMIN_ROLE, ops)`
- **Calldata (both):** `0x2f2ff15da49807205ce4d355092ef5a8a18f56e8913cf4a201fbe287825b095693c217750000000000000000000000003b89ad8cc39900778abcdcc22bc83cac031a415b`

## 4. Retire the deployer — only after 1 and 2 are confirmed on chain

- **Signed by:** the seed (DEFAULT_ADMIN_ROLE on both contracts).
- **FaucetManager `0x2940…4778`:**
  - `revokeRole(ADMIN_ROLE, deployer)`:
    `0xd547741fa49807205ce4d355092ef5a8a18f56e8913cf4a201fbe287825b095693c217750000000000000000000000003c9204b25966591749450fb233d58e850e7c1f9f`
  - then `revokeRole(DEFAULT_ADMIN_ROLE, deployer)`:
    `0xd547741f00000000000000000000000000000000000000000000000000000000000000000000000000000000000000003c9204b25966591749450fb233d58e850e7c1f9f`
- **BuilderCertificate `0x0499…158B`:** `revokeRole(ADMIN_ROLE, deployer)`, the same ADMIN calldata
  as the Faucet revoke above.

After step 4 the seed is the only DEFAULT_ADMIN_ROLE holder on the Faucet and on
BuilderCertificate. A lost seed key would then freeze role changes on both. Consider granting
DEFAULT_ADMIN_ROLE to the Safe on both before revoking.

## Check

Open `/admin/access`. The seed banner on the Overview should read "Access in place", and the
deployer should drop out of every list.
