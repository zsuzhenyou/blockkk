-- Blockstorm account, private-room and quick-match backend.
-- Run once in Supabase Dashboard → SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null check (char_length(username) between 2 and 18),
  wins integer not null default 0 check (wins >= 0),
  losses integer not null default 0 check (losses >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.match_rooms (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (char_length(code) = 6),
  host_id uuid not null references public.profiles(id) on delete cascade,
  guest_id uuid references public.profiles(id) on delete set null,
  host_peer_id text not null,
  guest_peer_id text,
  status text not null default 'waiting' check (status in ('waiting', 'playing', 'finished', 'cancelled')),
  is_private boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.matchmaking_queue (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  peer_id text not null,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.match_rooms enable row level security;
alter table public.matchmaking_queue enable row level security;

drop policy if exists "authenticated users read profiles" on public.profiles;
create policy "authenticated users read profiles" on public.profiles
  for select to authenticated using (true);

drop policy if exists "users update own profile" on public.profiles;
create policy "users update own profile" on public.profiles
  for update to authenticated using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

drop policy if exists "players read own rooms" on public.match_rooms;
create policy "players read own rooms" on public.match_rooms
  for select to authenticated
  using ((select auth.uid()) = host_id or (select auth.uid()) = guest_id);

revoke all on public.matchmaking_queue from anon, authenticated;
grant select on public.profiles to authenticated;
grant update (username) on public.profiles to authenticated;
grant select on public.match_rooms to authenticated;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    left(coalesce(nullif(trim(new.raw_user_meta_data ->> 'username'), ''), split_part(new.email, '@', 1)), 18)
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.create_private_room(p_peer_id text)
returns jsonb
language plpgsql
security definer set search_path = ''
as $$
declare
  v_room public.match_rooms;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if nullif(trim(p_peer_id), '') is null then raise exception 'Peer ID required'; end if;

  delete from public.matchmaking_queue where user_id = auth.uid();
  update public.match_rooms set status = 'cancelled', updated_at = now()
    where host_id = auth.uid() and status = 'waiting';

  insert into public.match_rooms (code, host_id, host_peer_id, is_private)
  values (upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6)), auth.uid(), p_peer_id, true)
  returning * into v_room;

  return jsonb_build_object('state','waiting','room_id',v_room.id,'code',v_room.code,
    'host_id',v_room.host_id,'host_peer_id',v_room.host_peer_id,'is_private',true);
end;
$$;

create or replace function public.join_private_room(p_code text, p_peer_id text)
returns jsonb
language plpgsql
security definer set search_path = ''
as $$
declare
  v_room public.match_rooms;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;

  select * into v_room from public.match_rooms
    where code = upper(trim(p_code)) and status = 'waiting' and is_private = true
      and host_id <> auth.uid()
    order by created_at desc limit 1 for update skip locked;

  if v_room.id is null then raise exception '找不到可加入的房間'; end if;

  update public.match_rooms set guest_id = auth.uid(), guest_peer_id = p_peer_id,
    status = 'playing', updated_at = now() where id = v_room.id returning * into v_room;

  return jsonb_build_object('state','matched','room_id',v_room.id,'code',v_room.code,
    'host_id',v_room.host_id,'guest_id',v_room.guest_id,
    'host_peer_id',v_room.host_peer_id,'guest_peer_id',v_room.guest_peer_id,'is_private',true);
end;
$$;

create or replace function public.find_match(p_peer_id text)
returns jsonb
language plpgsql
security definer set search_path = ''
as $$
declare
  v_opponent public.matchmaking_queue;
  v_room public.match_rooms;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  perform pg_advisory_xact_lock(24102026);

  delete from public.matchmaking_queue where created_at < now() - interval '2 minutes';
  delete from public.matchmaking_queue where user_id = auth.uid();

  select * into v_opponent from public.matchmaking_queue
    where user_id <> auth.uid() order by created_at asc limit 1 for update skip locked;

  if v_opponent.user_id is null then
    insert into public.matchmaking_queue (user_id, peer_id) values (auth.uid(), p_peer_id)
      on conflict (user_id) do update set peer_id = excluded.peer_id, created_at = now();
    return jsonb_build_object('state','waiting');
  end if;

  insert into public.match_rooms (code, host_id, guest_id, host_peer_id, guest_peer_id, status, is_private)
  values (upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6)),
    v_opponent.user_id, auth.uid(), v_opponent.peer_id, p_peer_id, 'playing', false)
  returning * into v_room;

  delete from public.matchmaking_queue where user_id in (auth.uid(), v_opponent.user_id);
  return jsonb_build_object('state','matched','room_id',v_room.id,'code',v_room.code,
    'host_id',v_room.host_id,'guest_id',v_room.guest_id,
    'host_peer_id',v_room.host_peer_id,'guest_peer_id',v_room.guest_peer_id,'is_private',false);
end;
$$;

create or replace function public.get_match_status()
returns jsonb
language plpgsql
security definer set search_path = ''
stable
as $$
declare
  v_room public.match_rooms;
  v_opponent_name text;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  select * into v_room from public.match_rooms
    where (host_id = auth.uid() or guest_id = auth.uid()) and status in ('waiting','playing')
    order by created_at desc limit 1;
  if v_room.id is null then return jsonb_build_object('state','waiting'); end if;

  select username into v_opponent_name from public.profiles
    where id = case when v_room.host_id = auth.uid() then v_room.guest_id else v_room.host_id end;

  return jsonb_build_object('state',case when v_room.status='playing' then 'matched' else 'waiting' end,
    'room_id',v_room.id,'code',v_room.code,'host_id',v_room.host_id,'guest_id',v_room.guest_id,
    'host_peer_id',v_room.host_peer_id,'guest_peer_id',v_room.guest_peer_id,
    'opponent_name',v_opponent_name,'is_private',v_room.is_private);
end;
$$;

create or replace function public.leave_online(p_room_id uuid default null)
returns void
language plpgsql
security definer set search_path = ''
as $$
begin
  if auth.uid() is null then return; end if;
  delete from public.matchmaking_queue where user_id = auth.uid();
  update public.match_rooms set status = case when status='waiting' then 'cancelled' else 'finished' end,
    updated_at = now()
    where (p_room_id is null or id = p_room_id)
      and (host_id = auth.uid() or guest_id = auth.uid()) and status in ('waiting','playing');
end;
$$;

revoke execute on function public.create_private_room(text) from public, anon;
revoke execute on function public.join_private_room(text, text) from public, anon;
revoke execute on function public.find_match(text) from public, anon;
revoke execute on function public.get_match_status() from public, anon;
revoke execute on function public.leave_online(uuid) from public, anon;
grant execute on function public.create_private_room(text) to authenticated;
grant execute on function public.join_private_room(text, text) to authenticated;
grant execute on function public.find_match(text) to authenticated;
grant execute on function public.get_match_status() to authenticated;
grant execute on function public.leave_online(uuid) to authenticated;
