-- Whitmore Kane claims portal.
-- All access goes through server routes using the service role.
-- RLS is on with no policies, so the anon key cannot read or write these tables.

create table if not exists claims (
  id              uuid primary key default gen_random_uuid(),
  claim_code      text not null unique,             -- printed on the outreach letter
  respondent_name text not null,                    -- e.g. ZDJ WOODSIDE 52 LLC
  respondent_zip  text,                             -- second factor to unlock the claim
  amount          numeric(12,2) not null,           -- credit shown to the owner
  agency_label    text not null default 'a New York City agency',
  -- Withheld until the authorization is signed:
  summons_numbers text[] not null default '{}',
  agency_name     text,                             -- e.g. OATH Hearings Division
  property_address text,
  fee_pct         numeric(5,2) not null default 15.00,
  status          text not null default 'sent'
                  check (status in ('sent','viewed','signed','info_submitted','filed','paid','closed','declined')),
  viewed_at       timestamptz,
  created_at      timestamptz not null default now()
);

create table if not exists authorizations (
  id                uuid primary key default gen_random_uuid(),
  claim_id          uuid not null references claims(id) on delete cascade,
  agreement_version text not null,
  agreement_sha256  text not null,
  signer_name       text not null,
  signer_title      text,
  signer_email      text not null,
  typed_signature   text not null,
  ip                text,
  user_agent        text,
  signed_at         timestamptz not null default now()
);

create table if not exists claimant_info (
  claim_id          uuid primary key references claims(id) on delete cascade,
  entity_name       text not null,
  contact_name      text not null,
  contact_title     text,
  phone             text,
  email             text not null,
  mailing_address   text not null,                  -- where the refund check goes
  paid_by_respondent boolean,                       -- refund is payable to the original payer
  payer_name        text,
  notes             text,
  submitted_at      timestamptz not null default now()
);

create table if not exists documents (
  id           uuid primary key default gen_random_uuid(),
  claim_id     uuid not null references claims(id) on delete cascade,
  kind         text not null check (kind in ('photo_id','proof_of_payment','authority','other')),
  storage_path text not null,
  file_name    text,
  uploaded_at  timestamptz not null default now()
);

alter table claims         enable row level security;
alter table authorizations enable row level security;
alter table claimant_info  enable row level security;
alter table documents      enable row level security;
grant select, insert, update, delete on claims, authorizations, claimant_info, documents to service_role;
revoke all on claims, authorizations, claimant_info, documents from anon, authenticated;

-- Private bucket: files are only reachable through short-lived signed URLs.
insert into storage.buckets (id, name, public)
values ('claim-docs', 'claim-docs', false)
on conflict (id) do update set public = false;

-- Per-violation claims and payment tracking (applied 2026-11-24).
alter table claims
  add column if not exists violation_number text,
  add column if not exists penalty_imposed numeric(12,2),
  add column if not exists amount_paid numeric(12,2),
  add column if not exists respondent_address text,
  add column if not exists filed_at timestamptz,
  add column if not exists admin_notes text;
create unique index if not exists claims_violation_number_key on claims (violation_number) where violation_number is not null;

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  claim_id uuid not null references claims(id) on delete cascade,
  kind text not null check (kind in ('refund_received','offset_applied','fee_invoiced','fee_paid','fee_waived')),
  amount numeric(12,2) not null,
  occurred_on date not null default current_date,
  method text,
  reference text,
  notes text,
  created_at timestamptz not null default now()
);
alter table payments enable row level security;
revoke all on payments from anon, authenticated;
grant select, insert, update, delete on payments to service_role;

create or replace view claim_ledger with (security_invoker = true) as
select c.id as claim_id,
  coalesce(sum(p.amount) filter (where p.kind = 'refund_received'), 0) as refunded,
  coalesce(sum(p.amount) filter (where p.kind = 'offset_applied'), 0) as offset,
  coalesce(sum(p.amount) filter (where p.kind = 'fee_invoiced'), 0) as fee_invoiced,
  coalesce(sum(p.amount) filter (where p.kind = 'fee_paid'), 0) as fee_paid,
  coalesce(sum(p.amount) filter (where p.kind = 'fee_waived'), 0) as fee_waived
from claims c left join payments p on p.claim_id = c.id
group by c.id;
revoke all on claim_ledger from anon, authenticated;
grant select on claim_ledger to service_role;

-- Not callable through the public API.
revoke execute on function public.rls_auto_enable() from anon, authenticated, public;

-- 2026-11-25: refund tracker (/sushi). Claim codes only when requested; tracked rows start as 'found'.
alter table public.claims alter column claim_code drop not null;
alter table public.claims alter column amount drop not null;
alter table public.claims
  add column if not exists violation_date date,
  add column if not exists refund_reason text,
  add column if not exists filed_by text,
  add column if not exists check_issued_on date,
  add column if not exists check_number text,
  add column if not exists check_amount numeric,
  add column if not exists check_received_on date,
  add column if not exists check_forwarded_on date;
alter table public.claims drop constraint claims_status_check;
alter table public.claims add constraint claims_status_check check (status = any (array['found','sent','viewed','signed','info_submitted','filed','paid','closed','declined']));
alter table public.documents drop constraint documents_kind_check;
alter table public.documents add constraint documents_kind_check check (kind = any (array['photo_id','proof_of_payment','authority','other','ppu1','refund_check','agency_letter']));

-- 2026-11-25: e-signature hardening.
alter table public.authorizations
  add column if not exists agreement_text text,
  add column if not exists esign_consent_at timestamptz,
  add column if not exists esign_disclosure_version text,
  add column if not exists email_verified_at timestamptz,
  add column if not exists copy_emailed_at timestamptz;
alter table public.claims
  add column if not exists refund_request_ua text,
  add column if not exists refund_request_pdf_path text,
  add column if not exists refund_request_sha256 text,
  add column if not exists refund_request_copy_emailed_at timestamptz;
create table if not exists public.email_codes (
  id uuid primary key default gen_random_uuid(),
  claim_id uuid not null references public.claims(id) on delete cascade,
  email text not null, code_hash text not null, expires_at timestamptz not null,
  attempts int not null default 0, verified_at timestamptz, created_at timestamptz not null default now()
);
create index if not exists email_codes_claim_idx on public.email_codes(claim_id, created_at desc);
alter table public.email_codes enable row level security;
revoke all on public.email_codes from anon, authenticated;
grant select, insert, update, delete on public.email_codes to service_role;
