create table if not exists public.course_certificate_issuances (
  certificate_id text primary key,
  course_id text not null,
  student_actor_id text not null,
  amount numeric(12,2) not null default 0,
  currency text not null default 'USD',
  status text not null default 'issued',
  issued_at timestamptz not null default timezone('utc', now()),
  verification_url text not null
);

create unique index if not exists course_certificate_issuances_course_student_idx
  on public.course_certificate_issuances (course_id, student_actor_id);
