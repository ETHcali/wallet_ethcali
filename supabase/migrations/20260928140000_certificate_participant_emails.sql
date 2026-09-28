-- Builder certificates: a participant is every email they used, not one.
--
-- Half the Cali builders registered on Luma with a different address from the
-- one on their Devfolio team — university accounts, a second Gmail, .es
-- instead of .com. A certificate keyed to one email means someone who signs in
-- with the other sees nothing. So each row carries all of a person's known
-- addresses, and a claim matches any of them.
--
-- `email` stays: it is the primary address (Devfolio's where there is one,
-- else Luma's), the one the diploma email is addressed to first. `emails`
-- always contains it — the check below makes that an invariant, not a habit.
--
-- `checked_in_at` is Luma's check-in time, kept as history: who was in the
-- room. It decides nothing; a builder who shipped without checking in still
-- gets their certificate.

alter table public.builder_certificates
  add column emails        text[] not null default '{}',
  add column checked_in_at timestamptz;

update public.builder_certificates set emails = array[email] where emails = '{}';

alter table public.builder_certificates
  add constraint builder_certificates_emails_has_primary check (email = any (emails)),
  -- Compared against Privy's lowercased emails, so stored lowercase.
  add constraint builder_certificates_emails_lower
    check (array_to_string(emails, ',') = lower(array_to_string(emails, ',')));

-- The claim is `emails && <caller's verified emails>`.
create index builder_certificates_emails_idx on public.builder_certificates using gin (emails);
