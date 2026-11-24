-- Whitmore Kane & Associates claims portal.
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
revoke all on claims, authorizations, claimant_info, documents from anon, authenticated;

-- Private bucket: files are only reachable through short-lived signed URLs.
insert into storage.buckets (id, name, public)
values ('claim-docs', 'claim-docs', false)
on conflict (id) do update set public = false;
