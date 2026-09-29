-- Builder certificates are NFTs now: BuilderCertificate on Ethereum mainnet,
-- 0x0499924492348159aa281385ace43539689e158b (soulbound ERC-721, issued by
-- ETH Cali operators). This records, per certificate, what was pinned to IPFS
-- and which token it became.
--
--   image_cid     the diploma PNG — the NFT's `image`
--   pdf_cid       the diploma PDF, byte-for-byte the app's download
--   metadata_cid  the ERC-721 JSON; tokenURI is ipfs://<metadata_cid>
--   token_id      set with issued_tx once the mint lands; the chain decides,
--                 this remembers where
--
-- The chain is the source of truth: a row claiming a token is re-verifiable
-- against tokenOfCredential(credential_id) and ownerOf(token_id).

alter table public.builder_certificates
  add column image_cid    text,
  add column pdf_cid      text,
  add column metadata_cid text,
  add column token_id     bigint;

alter table public.builder_certificates
  add constraint builder_certificates_token_id_positive check (token_id is null or token_id > 0),
  add constraint builder_certificates_token_unique unique (token_id),
  -- A token and the transaction that minted it arrive together or not at all.
  add constraint builder_certificates_issued_pair check ((token_id is null) = (issued_tx is null)),
  -- Nothing can be minted before its metadata is pinned.
  add constraint builder_certificates_issued_needs_metadata check (issued_tx is null or metadata_cid is not null);
