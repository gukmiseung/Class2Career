begin;

create table public.c2c_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  name text not null check (btrim(name) <> ''),
  department text not null,
  grade text not null,
  goal text not null default '',
  introduction text not null default '' check (char_length(introduction) <= 300),
  avatar text not null default '' check (
    avatar = '' or (
      octet_length(avatar) <= 2796300
      and avatar ~ '^data:image/[a-zA-Z0-9.+-]+;base64,'
    )
  )
);

alter table public.c2c_profiles enable row level security;

revoke all on table public.c2c_profiles from public, anon, authenticated;
grant select, insert, update on table public.c2c_profiles to authenticated;

create policy "Users can view their own profile"
  on public.c2c_profiles for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can insert their own profile"
  on public.c2c_profiles for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own profile"
  on public.c2c_profiles for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

commit;
