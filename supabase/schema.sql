-- ============================================================================
-- Aevum — account data schema
--
-- Paste the whole file into the Supabase SQL editor and run it. It is
-- idempotent: running it again on an existing project changes nothing and
-- destroys nothing.
--
-- The account itself lives in Supabase Auth (auth.users): email, hashed
-- password, confirmation state, timestamps. Never copy those here. Every
-- table below hangs off auth.users(id) and is protected by row-level
-- security, so a signed-in user can reach their own rows and nobody else's.
-- ============================================================================

-- ─── Profile ────────────────────────────────────────────────────────────────
-- One row per user: goals, body, training week, conditions, units.
create table if not exists public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

-- ─── Daily check-ins ────────────────────────────────────────────────────────
-- One row per user per day. `data` holds sleep, energy, soreness, stress,
-- weight, the peptides logged with amounts and injection sites, side effects,
-- and any red-flag symptoms.
create table if not exists public.checkins (
  user_id uuid not null references auth.users (id) on delete cascade,
  day date not null,
  data jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, day)
);

-- History reads newest-first, so index that way.
create index if not exists checkins_user_day_idx
  on public.checkins (user_id, day desc);

-- ─── Aevum AI conversations ─────────────────────────────────────────────────
-- Chat history, kept in Aevum's own database rather than at the model
-- provider. Deleting a conversation removes its messages with it.
create table if not exists public.ai_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ai_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.ai_conversations (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  -- The structured answer, so cards re-render without calling the model again.
  answer jsonb,
  created_at timestamptz not null default now()
);

create index if not exists ai_conversations_user_idx
  on public.ai_conversations (user_id, updated_at desc);

create index if not exists ai_messages_conversation_idx
  on public.ai_messages (conversation_id, created_at);

-- ─── Row-level security ─────────────────────────────────────────────────────
-- Without this, any signed-in user could read every other user's health data.
alter table public.profiles          enable row level security;
alter table public.checkins          enable row level security;
alter table public.ai_conversations  enable row level security;
alter table public.ai_messages       enable row level security;

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

drop policy if exists "Users manage their own conversations" on public.ai_conversations;
create policy "Users manage their own conversations" on public.ai_conversations
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users manage their own messages" on public.ai_messages;
create policy "Users manage their own messages" on public.ai_messages
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- ─── Keep updated_at honest ─────────────────────────────────────────────────
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_touch on public.profiles;
create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();

drop trigger if exists checkins_touch on public.checkins;
create trigger checkins_touch before update on public.checkins
  for each row execute function public.touch_updated_at();

drop trigger if exists ai_conversations_touch on public.ai_conversations;
create trigger ai_conversations_touch before update on public.ai_conversations
  for each row execute function public.touch_updated_at();

-- ─── Deleting your data ─────────────────────────────────────────────────────
-- Account deletion. Profile, check-ins and AI history cascade with the user.
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

-- Clearing AI history on its own, without deleting the account.
create or replace function public.delete_my_ai_history()
returns void
language sql
security definer
set search_path = ''
as $$
  delete from public.ai_conversations where user_id = (select auth.uid());
$$;

revoke all on function public.delete_my_ai_history() from public, anon;
grant execute on function public.delete_my_ai_history() to authenticated;

-- Clearing logged check-ins, keeping the account and profile.
create or replace function public.delete_my_checkins()
returns void
language sql
security definer
set search_path = ''
as $$
  delete from public.checkins where user_id = (select auth.uid());
$$;

revoke all on function public.delete_my_checkins() from public, anon;
grant execute on function public.delete_my_checkins() to authenticated;
