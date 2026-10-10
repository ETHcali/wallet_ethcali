# ZKPassportNFT — reference

Source: `../scs-ethcali/contracts/ZKPassportNFT.sol` (interfaces in `contracts/interfaces/IZKPassport.sol`).
Rewritten 2026-10-10 for the policy-enforcing build (scs-ethcali PR #7).

A soulbound ERC-721: one per wallet, one per person. A ZKPassport proof is verified **on chain**
by ZKPassport's root verifier, and the contract enforces the same policy the app requests. A
client that asks for a weaker proof still cannot mint. `FaucetManager` gates every claim on
`hasNFTByAddress`.

## The policy (must match in three places)

| | Value |
|---|---|
| Domain | `ethcali.org` (registered in the ZKPassport dashboard; the app passes it explicitly) |
| Scope | `policy-1` (the dashboard policy id; drives the nullifier) |
| Age | ≥ 18 (`MIN_AGE`) |
| Sanctions | non-strict (`SANCTIONS_STRICT = false`); `isStrict` must match the proof's mode |
| Nationality and issuing country | not in `AFG BLR CUB IRN MMR PRK RUS SDN SYR VEN YEM ZWE` |
| Proof | devMode off, `validityPeriodInSeconds == 604800`, bound to `msg.sender` and `block.chainid` |

The three places are: the contract (`scripts/deploy-identity.ts` constants, then
`setDomain` / `setScope` / `setExcludedCountries`), the app (`utils/zkpassport.ts`), and the
ZKPassport dashboard policy. **The country list must be sorted alphabetically and identical
everywhere**: ZKPassport compares it with the proof's list exactly. `/sybil/admin` → Settings shows
the contract's values beside the app's and flags any difference.

## Mint

`mint(ProofVerificationParams params, bool isIDCard)`. The checks run in this order, and each
failure reverts with a `ZKPassportNFT: …` reason:

1. `address already has NFT`
2. `dev mode proof` and `invalid validity period`, read from `params.serviceConfig`
3. `verifier.verify(params)`, which yields `proof verification failed`, and then `identifier already used`
4. `helper.verifyScopes(publicInputs, domain, scope)`, which yields `invalid domain or scope`
5. Bound data: `sender address mismatch` and `chain id mismatch`
6. `under minimum age`, `nationality not allowed` and `issuing country not allowed`. The two
   country checks are skipped only if the owner set an empty list.
7. `helper.enforceSanctionsRoot(block.timestamp, SANCTIONS_STRICT, …)`, which reverts with the helper's reason

State is written only after every check passes. A refused mint consumes neither the identifier
nor the address. `canMint(address) → (bool, string)` mirrors the checks that need no proof.

`isIDCard` picks the document layout the helper decodes. The app derives it from the disclosed
`document_type`. The policy proves nationality without disclosing it, so `TokenData.nationality`
is empty and `isOver18` is always true.

## Owner powers (`Ownable`; hold in a multisig)

- `setDomain` and `setScope`. A new scope opens a new nullifier space, so one person could mint again from another address.
- `setExcludedCountries` takes a list that is sorted, unique, uppercase alpha-3 and at most 64
  entries, and emits `ExcludedCountriesUpdated`.
- Metadata: `setMetadata`, `setImageURI`, `setDescription`, `setExternalURL` and `setUseIPFSImage`.
- **The verifier is immutable.** It is a constructor argument with no setter, because an owner who
  could repoint it could mint to anyone and drain the faucet.

## Views

`hasNFTByAddress(address)`, `hasNFTByIdentifier(bytes32)`, `getTokenData(tokenId)`, `canMint(address)`,
`domain()`, `scope()`, `excludedCountries()`, `zkPassportVerifier()`, `MIN_AGE`,
`VALIDITY_PERIOD_SECONDS` and `SANCTIONS_STRICT`.

## The app (`utils/zkpassport.ts`, `hooks/useZKPassportVerification.ts`)

- `new ZKPassport('ethcali.org')`, `request({ scope: 'policy-1', mode: 'compressed-evm' })`, then:
  `.gte('age', 18).sanctions().out('nationality', list).out('issuing_country', list)`
  `.disclose('document_type').bind('user_address', wallet).bind('chain', 'ethereum')`.
- From `onResult`'s `proofs`, take the proof whose name starts with `outer_evm`, then call
  `getSolidityVerifierParameters({ proof, domain, scope, devMode: false })`.
- The client-side `verified` flag is advisory; the contract verifies. The mint waits for the
  receipt, and a relay error is checked against `hasNFTByAddress` before it is shown.

## Deployments

| Chain | Address | State |
|---|---|---|
| Ethereum | `0x607003f188c49ed6e0553805734b9990393402df` | **January build**: no proof mint, never minted. Replaced by `deploy:identity:ethereum`. |
| Base, Optimism, Unichain | see `../scs-ethcali/deployments/` | Previous build. The ZKPassport verifier exists only on Ethereum and Base. Not used by the app. |
