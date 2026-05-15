-- Profile: maps auth.users → username
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  username text unique not null check (char_length(username) between 3 and 24),
  created_at timestamptz default now()
);

create table public.quizzes (
  id text primary key,
  user_id uuid not null references auth.users on delete cascade,
  title text,
  data jsonb not null,
  updated_at timestamptz default now()
);

create table public.folders (
  id text primary key,
  user_id uuid not null references auth.users on delete cascade,
  name text not null,
  quiz_ids text[] not null default '{}',
  created_at timestamptz default now()
);

create table public.sessions (
  user_id uuid not null references auth.users on delete cascade,
  quiz_id text not null,
  data jsonb not null,
  primary key (user_id, quiz_id)
);

create table public.results (
  user_id uuid not null references auth.users on delete cascade,
  quiz_id text not null,
  data jsonb not null,
  primary key (user_id, quiz_id)
);

-- Single-row-per-user preferences: bookmarks, orders, theme, etc.
create table public.user_prefs (
  user_id uuid primary key references auth.users on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now()
);

-- RLS: only owner can read/write own rows
alter table profiles    enable row level security;
alter table quizzes     enable row level security;
alter table folders     enable row level security;
alter table sessions    enable row level security;
alter table results     enable row level security;
alter table user_prefs  enable row level security;

create policy "own profile"   on profiles    for all using (id = auth.uid())      with check (id = auth.uid());
create policy "own quizzes"   on quizzes     for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own folders"   on folders     for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own sessions"  on sessions    for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own results"   on results     for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own prefs"     on user_prefs  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Trigger: auto-create profile row on signup
create function public.handle_new_user() returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, username)
  values (new.id, new.raw_user_meta_data->>'username');
  return new;
end; $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
