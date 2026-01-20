Running node:test tests

[dotenv@17.2.3] injecting env (0) from .env -- tip: 📡 add observability to secrets: https://dotenvx.com/ops
  FaucetManager
    ✔ Should deploy with correct NFT contract
    ✔ Should grant deployer admin roles
    ✔ Should create a non-returnable vault
    ✔ Should create a returnable vault
    ✔ Should reject vault with empty name
    ✔ Should reject vault with zero claim amount
    ✔ Should allow admin to deposit ETH (195ms)
    ✔ Should allow admin to withdraw ETH
    ✔ Should allow ZKPassport holder to claim
    ✔ Should prevent double claims from same user
    ✔ Should allow user to claim from multiple vaults
    ✔ Should prevent claim without ZKPassport NFT
    ✔ Should prevent claim from inactive vault
    ✔ Should create a whitelisted vault
    ✔ Should prevent non-whitelisted user from claiming
    ✔ Should allow whitelisted user to claim
    ✔ Should add batch of users to whitelist
    ✔ Should remove user from whitelist
    ✔ Should toggle whitelist on vault
    ✔ Should report whitelist status in canUserClaim
    ✔ Should allow user to return funds
    ✔ Should prevent return on non-returnable vault
    ✔ Should prevent return without claiming first
    ✔ Should prevent double returns
    ✔ Should allow super admin to add new admin
    ✔ Should allow super admin to remove admin
    ✔ Should prevent non-super-admin from adding admin
    ✔ Should return all vaults
    ✔ Should check if user can claim

[dotenv@17.2.3] injecting env (0) from .env -- tip: 🛠️  run anywhere with `dotenvx run -- yourcommand`
  FaucetVault
    ✔ Should deploy with correct initial values
    ✔ Should allow owner to deposit ETH
    ✔ Should allow NFT holder to claim ETH
    ✔ Should prevent second claim from same address
    ✔ Should prevent non-NFT holder from claiming
    ✔ Should prevent claim when vault has insufficient balance
    ✔ Should allow owner to update claim amount
    ✔ Should prevent non-owner from updating claim amount
    ✔ Should allow owner to withdraw ETH (81ms)
    ✔ Should prevent non-owner from withdrawing
    ✔ Should allow owner to pause contract
    ✔ Should allow owner to update NFT contract
    ✔ Should reject invalid claim amount update

[dotenv@17.2.3] injecting env (0) from .env -- tip: 🔐 prevent building .env in docker: https://dotenvx.com/prebuild
  Integration Tests
    ✔ Should complete full flow: verify -> mint -> claim (103ms)
    ✔ Should handle multiple users with different verification results (99ms)
    ✔ Should prevent duplicate mints and claims
    ✔ Should verify simplified two-contract system (78ms)

[dotenv@17.2.3] injecting env (0) from .env -- tip: 🔄 add secrets lifecycle management: https://dotenvx.com/ops
  Swag1155
    ✔ Initial configuration set correctly
    ✔ Admin can upsert variant and users can buy
    ✔ Enforces supply limits and active status
    ✔ Batch purchase works with single payment
    ✔ Reverts on zero quantity and length mismatch
    ✔ Admin can set variant with per-token URI
    ✔ Per-token URI overrides baseURI
    ✔ User can redeem their NFT
    ✔ User cannot redeem if they don't own the NFT
    ✔ User cannot redeem same token twice
    ✔ Admin can mark redemption as fulfilled
    ✔ Non-admin cannot mark as fulfilled
    ✔ Cannot mark as fulfilled if not pending
    ✔ Full redemption flow: buy -> redeem -> fulfill

[dotenv@17.2.3] injecting env (0) from .env -- tip: 🔑 add access controls to secrets: https://dotenvx.com/ops
  ZKPassportNFT
    ✔ Should deploy with correct name and symbol
    ✔ Should allow user to mint with approved verification (257ms)
    ✔ Should prevent user from minting without approval
    ✔ Should allow user to self-verify and mint directly
    ✔ Should prevent unauthorized user from minting approved verification
    ✔ Should prevent duplicate self-verification with same identifier
    ✔ Should prevent self-verification if address already has NFT
    ✔ Should reject self-verification with empty identifier
    ✔ Should prevent duplicate uniqueIdentifier
    ✔ Should prevent multiple NFTs per address
    ✔ Should return correct token data
    ✔ Should check if identifier has been used
    ✔ Should check if address has NFT
    ✔ Should generate token URI
    ✔ Should prevent transfers (soulbound)
    ✔ Should reject invalid recipient address
    ✔ Should reject empty uniqueIdentifier


77 passing (77 nodejs)