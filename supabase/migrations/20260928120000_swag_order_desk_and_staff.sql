-- The order desk, phase 3: a production step, and a team you can name.
--
-- 1. in_production. Merch is printed on demand, in a weekly batch: orders
--    paid before Tuesday 12:00 (Bogotá) are printed Tuesday–Wednesday and
--    handed to the carrier on Thursday. "Paid" alone cannot tell the buyer
--    their shirt is on the press, and it cannot tell the packer which rows
--    are already in this week's batch. The path becomes
--
--      paid → in_production → shipped → delivered
--      paid → shipped                        (a unit already in stock, an event handover)
--      cancelled from paid, in_production or shipped
--
-- 2. swag_staff. Who works the desk, by name. Access is still decided on
--    chain and nowhere else: ADMIN_ROLE (prices, caps, pause, vouchers, and
--    everything below) or FULFILLMENT_ROLE (orders, addresses, batch, print
--    sheet, marking shipped) on the collection, granted by DEFAULT_ADMIN_ROLE.
--    This table holds the label and the email that make a role readable —
--    "Ana, packing" rather than 0x51c4… — and the grant transaction. A row
--    here with no role on chain is a person who cannot open the desk.

-- ── 1. in_production ────────────────────────────────────────────────────────

alter table public.swag_orders drop constraint swag_orders_status_known;
alter table public.swag_orders add constraint swag_orders_status_known
  check (status in ('paid', 'in_production', 'shipped', 'delivered', 'cancelled'));

create or replace function public.swag_orders_guard_status()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if new.status = old.status then
    return new;
  end if;

  if (old.status = 'paid'          and new.status in ('in_production', 'shipped', 'cancelled'))
  or (old.status = 'in_production' and new.status in ('shipped', 'cancelled'))
  or (old.status = 'shipped'       and new.status in ('delivered', 'cancelled'))
  then
    return new;
  end if;

  raise exception 'swag_orders %: % → % is not an allowed transition', old.id, old.status, new.status
    using errcode = 'check_violation';
end;
$$;
comment on function public.swag_orders_guard_status() is
  'Enforces paid → in_production → shipped → delivered (paid → shipped allowed), with cancelled reachable from paid, in_production or shipped. delivered and cancelled are terminal.';

comment on column public.swag_orders.status is
  'paid → in_production → shipped → delivered (paid → shipped allowed), or cancelled from any open state. swag_orders_guard_status refuses every other move.';

-- The batch query: open orders created before a cutoff, oldest first.
create index swag_orders_open_created_idx
  on public.swag_orders (created_at)
  where status in ('paid', 'in_production');

-- ── 2. swag_staff ───────────────────────────────────────────────────────────

create table public.swag_staff (
  -- The wallet the role is granted to, lowercase. For someone added by email
  -- this is the Privy embedded wallet created for that email.
  address        text primary key,
  role           text not null,
  label          text not null,
  email          text,
  privy_did      text,
  -- The DEFAULT_ADMIN wallet that granted it, and the grant transaction.
  granted_by     text not null,
  grant_tx_hash  text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),

  constraint swag_staff_role_known check (role in ('admin', 'fulfilment')),
  constraint swag_staff_address_lowercase_hex check (address ~ '^0x[0-9a-f]{40}$'),
  constraint swag_staff_granted_by_lowercase_hex check (granted_by ~ '^0x[0-9a-f]{40}$'),
  constraint swag_staff_grant_tx_hash_shape check (grant_tx_hash is null or grant_tx_hash ~ '^0x[0-9a-f]{64}$'),
  constraint swag_staff_email_shape
    check (email is null or email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'),
  constraint swag_staff_label_length check (char_length(label) between 1 and 80)
);

comment on table public.swag_staff is
  'DISPLAY REGISTRY ONLY — CONFERS ZERO AUTHORITY. Names the wallets that hold ADMIN_ROLE or FULFILLMENT_ROLE on the swag collection. The collection is the only authority; pages/api/swag/admin/staff writes a row only after reading the role on chain. No client access.';
comment on column public.swag_staff.role is
  'admin = ADMIN_ROLE, fulfilment = FULFILLMENT_ROLE on the collection, as granted at the time the row was written. Re-read from the chain before it is shown.';
comment on column public.swag_staff.email is
  'The email the person signs in with, when they were added by email. Their Privy embedded wallet is `address`.';

create trigger swag_staff_touch_updated_at
  before update on public.swag_staff
  for each row execute function public.touch_updated_at();

-- Same posture as swag_orders: enabled, forced, no policy. Only the service
-- role behind requireSwagSuperAdmin reads or writes it.
alter table public.swag_staff enable row level security;
alter table public.swag_staff force row level security;
revoke all on public.swag_staff from anon, authenticated;
