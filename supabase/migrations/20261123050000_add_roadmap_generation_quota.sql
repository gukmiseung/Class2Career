begin;

create table if not exists public.c2c_roadmap_usage (
  user_id uuid primary key references auth.users (id) on delete cascade,
  window_started_at timestamptz not null,
  request_count integer not null check (request_count between 1 and 8)
);

alter table public.c2c_roadmap_usage enable row level security;
revoke all on table public.c2c_roadmap_usage from public, anon, authenticated;

create or replace function public.c2c_consume_roadmap_quota()
returns boolean
language sql
security definer
set search_path = ''
as $$
  with consumed as (
    insert into public.c2c_roadmap_usage as usage (user_id, window_started_at, request_count)
    select auth.uid(), statement_timestamp(), 1
    where auth.uid() is not null
    on conflict (user_id) do update
    set window_started_at = case
          when usage.window_started_at <= excluded.window_started_at - interval '1 hour'
          then excluded.window_started_at else usage.window_started_at end,
        request_count = case
          when usage.window_started_at <= excluded.window_started_at - interval '1 hour'
          then 1 else usage.request_count + 1 end
    where usage.request_count < 8
       or usage.window_started_at <= excluded.window_started_at - interval '1 hour'
    returning 1
  )
  select exists (select 1 from consumed);
$$;

revoke all on function public.c2c_consume_roadmap_quota() from public, anon, authenticated;
grant execute on function public.c2c_consume_roadmap_quota() to authenticated;

commit;
