-- The certificate email: when each builder was told their NFT is out.
--
-- Issuing mints the token and records it on the row (confirm route); telling
-- the builder is a second, deliberate step — POST /api/certificates/admin/notify
-- sends one email per certificate, with the diploma attached and the links
-- to the credential page and the token, and stamps notified_at here. The
-- stamp is what stops a second click from sending twice, and Resend's
-- idempotency key (certificate-issued/<credential_id>) covers the 24h after a
-- send whose stamp never landed.
--
-- Only an issued certificate can be notified: the email names the token.

alter table public.builder_certificates
  add column notified_at timestamptz;

alter table public.builder_certificates
  add constraint builder_certificates_notified_needs_issue check (notified_at is null or issued_tx is not null);
