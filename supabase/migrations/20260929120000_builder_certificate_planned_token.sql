-- The token id each certificate will mint as, reserved before it is minted.
--
-- The diploma carries its own proof — a QR to etherscan.io/nft/<contract>/<id>
-- and the token id printed on it — and the diploma is pinned to IPFS before
-- the mint points at it. BuilderCertificate assigns ids in order
-- (totalIssued + 1, then +1 per item of an issue() batch), so the id is known
-- in advance as long as certificates are minted in planned order. The admin
-- Emitir button checks that on chain and refuses a batch that would land any
-- certificate on an id other than its planned one.
--
-- token_id, once set by the confirm route, must equal the plan.

alter table public.builder_certificates
  add column planned_token_id bigint;

alter table public.builder_certificates
  add constraint builder_certificates_planned_positive check (planned_token_id is null or planned_token_id > 0),
  add constraint builder_certificates_planned_unique unique (planned_token_id),
  add constraint builder_certificates_minted_as_planned check (token_id is null or token_id = planned_token_id);
