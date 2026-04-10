alter table if exists public.course_certificate_issuances
  add column if not exists trust_record_id text,
  add column if not exists trust_status text,
  add column if not exists xrpl_transaction_hash text,
  add column if not exists xrpl_token_id text,
  add column if not exists xrpl_ledger_index text,
  add column if not exists anchor_uri text;

create index if not exists idx_course_certificate_issuances_trust_record_id
  on public.course_certificate_issuances (trust_record_id);

create index if not exists idx_course_certificate_issuances_trust_status
  on public.course_certificate_issuances (trust_status);
