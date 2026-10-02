-- Blockstorm ranked matchmaking, seven tiers and leaderboards.
-- Run after schema.sql and social.sql.

alter table public.profiles add column if not exists rating integer not null default 1000 check (rating >= 0);
alter table public.profiles add column if not exists ranked_wins integer not null default 0 check (ranked_wins >= 0);
alter table public.profiles add column if not exists ranked_losses integer not null default 0 check (ranked_losses >= 0);
alter table public.match_rooms add column if not exists match_mode text not null default 'normal' check (match_mode in ('normal','ranked','private'));
alter table public.matchmaking_queue add column if not exists match_mode text not null default 'normal' check (match_mode in ('normal','ranked'));

create or replace function public.find_match_mode(p_peer_id text, p_mode text default 'normal')
returns jsonb
language plpgsql
security definer set search_path = ''
as $$
declare
  v_opponent public.matchmaking_queue;
  v_room public.match_rooms;
  v_mode text := case when p_mode = 'ranked' then 'ranked' else 'normal' end;
  v_rating integer;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  perform pg_advisory_xact_lock(24102027);
  select rating into v_rating from public.profiles where id = auth.uid();
  delete from public.matchmaking_queue where created_at < now() - interval '2 minutes';
  delete from public.matchmaking_queue where user_id = auth.uid();

  select q.* into v_opponent
  from public.matchmaking_queue q join public.profiles p on p.id = q.user_id
  where q.user_id <> auth.uid() and q.match_mode = v_mode
    and (v_mode = 'normal' or abs(p.rating - v_rating) <= 350)
  order by case when v_mode = 'ranked' then abs(p.rating - v_rating) else 0 end, q.created_at
  limit 1 for update of q skip locked;

  if v_opponent.user_id is null then
    insert into public.matchmaking_queue (user_id, peer_id, match_mode) values (auth.uid(), p_peer_id, v_mode)
      on conflict (user_id) do update set peer_id=excluded.peer_id,match_mode=excluded.match_mode,created_at=now();
    return jsonb_build_object('state','waiting','match_mode',v_mode);
  end if;

  insert into public.match_rooms (code,host_id,guest_id,host_peer_id,guest_peer_id,status,is_private,match_mode)
  values (upper(substr(replace(gen_random_uuid()::text,'-',''),1,6)),v_opponent.user_id,auth.uid(),v_opponent.peer_id,p_peer_id,'playing',false,v_mode)
  returning * into v_room;
  delete from public.matchmaking_queue where user_id in (auth.uid(),v_opponent.user_id);
  return jsonb_build_object('state','matched','room_id',v_room.id,'code',v_room.code,'host_id',v_room.host_id,'guest_id',v_room.guest_id,
    'host_peer_id',v_room.host_peer_id,'guest_peer_id',v_room.guest_peer_id,'is_private',false,'match_mode',v_mode);
end;
$$;

create or replace function public.get_match_status()
returns jsonb
language plpgsql
security definer set search_path = ''
stable
as $$
declare v_room public.match_rooms; v_opponent_name text;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  select * into v_room from public.match_rooms
    where (host_id=auth.uid() or guest_id=auth.uid()) and status in ('waiting','playing')
    order by created_at desc limit 1;
  if v_room.id is null then return jsonb_build_object('state','waiting'); end if;
  select username into v_opponent_name from public.profiles
    where id=case when v_room.host_id=auth.uid() then v_room.guest_id else v_room.host_id end;
  return jsonb_build_object('state',case when v_room.status='playing' then 'matched' else 'waiting' end,
    'room_id',v_room.id,'code',v_room.code,'host_id',v_room.host_id,'guest_id',v_room.guest_id,
    'host_peer_id',v_room.host_peer_id,'guest_peer_id',v_room.guest_peer_id,'opponent_name',v_opponent_name,
    'is_private',v_room.is_private,'match_mode',v_room.match_mode);
end;
$$;

create or replace function public.record_match_result(p_won boolean, p_ranked boolean default false)
returns jsonb
language plpgsql
security definer set search_path = ''
as $$
declare v_profile public.profiles; v_delta integer := 0;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if p_ranked then v_delta := case when p_won then 25 else -20 end; end if;
  update public.profiles set
    wins=wins+case when p_won then 1 else 0 end,
    losses=losses+case when p_won then 0 else 1 end,
    ranked_wins=ranked_wins+case when p_ranked and p_won then 1 else 0 end,
    ranked_losses=ranked_losses+case when p_ranked and not p_won then 1 else 0 end,
    rating=greatest(0,rating+v_delta),last_seen_at=now()
  where id=auth.uid() returning * into v_profile;
  return jsonb_build_object('wins',v_profile.wins,'losses',v_profile.losses,'rating',v_profile.rating,
    'ranked_wins',v_profile.ranked_wins,'ranked_losses',v_profile.ranked_losses,'rating_change',v_delta);
end;
$$;

create or replace function public.get_leaderboards()
returns jsonb
language plpgsql
security definer set search_path = ''
stable
as $$
declare v_global jsonb; v_friends jsonb;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  select coalesce(jsonb_agg(to_jsonb(x)),'[]'::jsonb) into v_global from (
    select id,username,avatar,block_theme,rating,wins,losses,ranked_wins,ranked_losses from public.profiles order by rating desc,ranked_wins desc,created_at limit 50
  ) x;
  select coalesce(jsonb_agg(to_jsonb(x)),'[]'::jsonb) into v_friends from (
    select p.id,p.username,p.avatar,p.block_theme,p.rating,p.wins,p.losses,p.ranked_wins,p.ranked_losses
    from public.profiles p where p.id=auth.uid() or exists(
      select 1 from public.friendships f where f.status='accepted' and auth.uid() in(f.user_a,f.user_b) and p.id in(f.user_a,f.user_b)
    ) order by p.rating desc,p.ranked_wins desc limit 50
  ) x;
  return jsonb_build_object('global',v_global,'friends',v_friends);
end;
$$;

create or replace function public.get_social_state()
returns jsonb
language plpgsql
security definer set search_path = ''
as $$
declare v_profile jsonb;v_friends jsonb;v_requests jsonb;v_invites jsonb;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  update public.profiles set last_seen_at=now() where id=auth.uid();
  update public.battle_invites set status='expired' where status='pending' and created_at<now()-interval '10 minutes';
  select jsonb_build_object('username',username,'avatar',avatar,'block_theme',block_theme,'wins',wins,'losses',losses,'rating',rating,'ranked_wins',ranked_wins,'ranked_losses',ranked_losses) into v_profile from public.profiles where id=auth.uid();
  select coalesce(jsonb_agg(jsonb_build_object('id',p.id,'username',p.username,'avatar',p.avatar,'block_theme',p.block_theme,'wins',p.wins,'losses',p.losses,'rating',p.rating,'online',p.last_seen_at>now()-interval '20 seconds') order by p.username),'[]'::jsonb) into v_friends
    from public.friendships f join public.profiles p on p.id=case when f.user_a=auth.uid() then f.user_b else f.user_a end where f.status='accepted' and auth.uid() in(f.user_a,f.user_b);
  select coalesce(jsonb_agg(jsonb_build_object('friendship_id',f.id,'id',p.id,'username',p.username,'avatar',p.avatar) order by f.created_at),'[]'::jsonb) into v_requests
    from public.friendships f join public.profiles p on p.id=f.requested_by where f.status='pending' and f.requested_by<>auth.uid() and auth.uid() in(f.user_a,f.user_b);
  select coalesce(jsonb_agg(jsonb_build_object('id',i.id,'room_code',i.room_code,'sender_id',i.sender_id,'username',p.username,'avatar',p.avatar) order by i.created_at desc),'[]'::jsonb) into v_invites
    from public.battle_invites i join public.profiles p on p.id=i.sender_id where i.recipient_id=auth.uid() and i.status='pending';
  return jsonb_build_object('profile',v_profile,'friends',v_friends,'requests',v_requests,'invites',v_invites);
end;
$$;

revoke execute on function public.find_match_mode(text,text) from public,anon;
revoke execute on function public.record_match_result(boolean,boolean) from public,anon;
revoke execute on function public.get_leaderboards() from public,anon;
grant execute on function public.find_match_mode(text,text) to authenticated;
grant execute on function public.record_match_result(boolean,boolean) to authenticated;
grant execute on function public.get_leaderboards() to authenticated;
