-- The view inherited Supabase's default "grant all on tables to anon,
-- authenticated" because it was created after the revoke in the previous
-- migration. Strip it back to SELECT, matching every other object.
revoke all on public.donation_feed from anon, authenticated;
grant select on public.donation_feed to anon, authenticated;
