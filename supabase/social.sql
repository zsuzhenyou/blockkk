-- Blockstorm social lobby migration: profiles, friends, invitations and records.

alter table public.profiles add column if not exists avatar text not null default '⚡';
alter table public.profiles add column if not exists block_theme text not null default 'neon';
alter table public.profiles add column if not exists last_seen_at timestamptz not null default now();

create table if not exists public.friendships (
  id uuid primary key default gen_random_uuid(),
  user_a uuid not null references public.profiles(id) on delete cascade,
  user_b uuid not null references public.profiles(id) on delete cascade,
  requested_by uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','accepted')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_a,user_b),
  check (user_a <> user_b)
);

create table if not exists public.battle_invites (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.profiles(id) on delete cascade,
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  room_code text not null check (char_length(room_code)=6),
  status text not null default 'pending' check (status in ('pending','accepted','declined','expired')),
  created_at timestamptz not null default now(),
  responded_at timestamptz
);

alter table public.friendships enable row level security;
alter table public.battle_invites enable row level security;
revoke all on public.friendships from anon, authenticated;
revoke all on public.battle_invites from anon, authenticated;

create or replace function public.save_profile(p_avatar text, p_block_theme text)
returns jsonb language plpgsql security definer set search_path=''
as $$
declare v_profile public.profiles;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if p_avatar not in ('⚡','🔥','👾','🤖','🦊','💎') then raise exception '無效的頭像'; end if;
  if p_block_theme not in ('neon','arcade','ice','mono') then raise exception '無效的方塊造型'; end if;
  update public.profiles set avatar=p_avatar,block_theme=p_block_theme,last_seen_at=now()
    where id=auth.uid() returning * into v_profile;
  return jsonb_build_object('username',v_profile.username,'avatar',v_profile.avatar,'block_theme',v_profile.block_theme,'wins',v_profile.wins,'losses',v_profile.losses);
end;
$$;

create or replace function public.send_friend_request(p_username text)
returns void language plpgsql security definer set search_path=''
as $$
declare v_target uuid; v_a uuid; v_b uuid;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  select id into v_target from public.profiles where lower(username)=lower(trim(p_username)) and id<>auth.uid() order by created_at desc limit 1;
  if v_target is null then raise exception '找不到這位玩家'; end if;
  if auth.uid()::text < v_target::text then v_a:=auth.uid();v_b:=v_target;else v_a:=v_target;v_b:=auth.uid();end if;
  insert into public.friendships(user_a,user_b,requested_by) values(v_a,v_b,auth.uid())
  on conflict(user_a,user_b) do update set requested_by=case when public.friendships.status='accepted' then public.friendships.requested_by else excluded.requested_by end,updated_at=now();
end;
$$;

create or replace function public.respond_friend_request(p_friendship_id uuid,p_accept boolean)
returns void language plpgsql security definer set search_path=''
as $$
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if p_accept then
    update public.friendships set status='accepted',updated_at=now() where id=p_friendship_id and status='pending' and requested_by<>auth.uid() and auth.uid() in (user_a,user_b);
  else
    delete from public.friendships where id=p_friendship_id and status='pending' and requested_by<>auth.uid() and auth.uid() in (user_a,user_b);
  end if;
  if not found then raise exception '好友邀請已失效'; end if;
end;
$$;

create or replace function public.send_battle_invite(p_friend_id uuid,p_room_code text)
returns void language plpgsql security definer set search_path=''
as $$
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if not exists(select 1 from public.friendships where status='accepted' and auth.uid() in(user_a,user_b) and p_friend_id in(user_a,user_b)) then raise exception '只能邀請好友'; end if;
  if not exists(select 1 from public.match_rooms where host_id=auth.uid() and code=upper(p_room_code) and status='waiting') then raise exception '房間已失效'; end if;
  update public.battle_invites set status='expired' where sender_id=auth.uid() and recipient_id=p_friend_id and status='pending';
  insert into public.battle_invites(sender_id,recipient_id,room_code) values(auth.uid(),p_friend_id,upper(p_room_code));
end;
$$;

create or replace function public.respond_battle_invite(p_invite_id uuid,p_accept boolean)
returns jsonb language plpgsql security definer set search_path=''
as $$
declare v_invite public.battle_invites;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  select * into v_invite from public.battle_invites where id=p_invite_id and recipient_id=auth.uid() and status='pending' and created_at>now()-interval '10 minutes' for update;
  if v_invite.id is null then raise exception '對戰邀請已失效'; end if;
  update public.battle_invites set status=case when p_accept then 'accepted' else 'declined' end,responded_at=now() where id=v_invite.id;
  return jsonb_build_object('room_code',case when p_accept then v_invite.room_code else null end);
end;
$$;

create or replace function public.record_match(p_won boolean)
returns void language plpgsql security definer set search_path=''
as $$
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  update public.profiles set wins=wins+case when p_won then 1 else 0 end,losses=losses+case when p_won then 0 else 1 end,last_seen_at=now() where id=auth.uid();
end;
$$;

create or replace function public.get_social_state()
returns jsonb language plpgsql security definer set search_path=''
as $$
declare v_profile jsonb;v_friends jsonb;v_requests jsonb;v_invites jsonb;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  update public.profiles set last_seen_at=now() where id=auth.uid();
  update public.battle_invites set status='expired' where status='pending' and created_at<now()-interval '10 minutes';
  select jsonb_build_object('username',username,'avatar',avatar,'block_theme',block_theme,'wins',wins,'losses',losses) into v_profile from public.profiles where id=auth.uid();
  select coalesce(jsonb_agg(jsonb_build_object('id',p.id,'username',p.username,'avatar',p.avatar,'block_theme',p.block_theme,'wins',p.wins,'losses',p.losses,'online',p.last_seen_at>now()-interval '20 seconds') order by p.username),'[]'::jsonb) into v_friends
    from public.friendships f join public.profiles p on p.id=case when f.user_a=auth.uid() then f.user_b else f.user_a end
    where f.status='accepted' and auth.uid() in(f.user_a,f.user_b);
  select coalesce(jsonb_agg(jsonb_build_object('friendship_id',f.id,'id',p.id,'username',p.username,'avatar',p.avatar) order by f.created_at),'[]'::jsonb) into v_requests
    from public.friendships f join public.profiles p on p.id=f.requested_by
    where f.status='pending' and f.requested_by<>auth.uid() and auth.uid() in(f.user_a,f.user_b);
  select coalesce(jsonb_agg(jsonb_build_object('id',i.id,'room_code',i.room_code,'sender_id',p.id,'username',p.username,'avatar',p.avatar) order by i.created_at desc),'[]'::jsonb) into v_invites
    from public.battle_invites i join public.profiles p on p.id=i.sender_id where i.recipient_id=auth.uid() and i.status='pending';
  return jsonb_build_object('profile',v_profile,'friends',v_friends,'requests',v_requests,'invites',v_invites);
end;
$$;

revoke execute on function public.save_profile(text,text) from public,anon;
revoke execute on function public.send_friend_request(text) from public,anon;
revoke execute on function public.respond_friend_request(uuid,boolean) from public,anon;
revoke execute on function public.send_battle_invite(uuid,text) from public,anon;
revoke execute on function public.respond_battle_invite(uuid,boolean) from public,anon;
revoke execute on function public.record_match(boolean) from public,anon;
revoke execute on function public.get_social_state() from public,anon;
grant execute on function public.save_profile(text,text) to authenticated;
grant execute on function public.send_friend_request(text) to authenticated;
grant execute on function public.respond_friend_request(uuid,boolean) to authenticated;
grant execute on function public.send_battle_invite(uuid,text) to authenticated;
grant execute on function public.respond_battle_invite(uuid,boolean) to authenticated;
grant execute on function public.record_match(boolean) to authenticated;
grant execute on function public.get_social_state() to authenticated;
