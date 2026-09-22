-- Aevum account sync. Run once in the Supabase SQL editor.
-- Every row belongs to one user, and row-level security limits each signed-in
-- user to their own rows.

create table if not exists public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.checkins (
  user_id uuid not null references auth.users (id) on delete cascade,
  day date not null,
  data jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, day)
);

alter table public.profiles enable row level security;
alter table public.checkins enable row level security;

drop policy if exists "Users manage their own profile" on public.profiles;
create policy "Users manage their own profile" on public.profiles
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users manage their own check-ins" on public.checkins;
create policy "Users manage their own check-ins" on public.checkins
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- Lets a signed-in user delete their own account; profile and check-ins
-- cascade with it.
create or replace function public.delete_my_account()
returns void
language sql
security definer
set search_path = ''
as $$
  delete from auth.users where id = (select auth.uid());
$$;

revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
