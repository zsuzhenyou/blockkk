-- Blockstorm missions, achievements and battle-board cosmetics.
-- Run after economy.sql.

alter table public.profiles add column if not exists battle_background text not null default 'void';
alter table public.profiles add column if not exists total_matches integer not null default 0;
alter table public.profiles add column if not exists total_wins integer not null default 0;
alter table public.profiles add column if not exists total_lines integer not null default 0;
alter table public.profiles add column if not exists total_score bigint not null default 0;
alter table public.profiles add column if not exists best_score integer not null default 0;
alter table public.profiles add column if not exists best_combo integer not null default 0;
alter table public.profiles add column if not exists total_tetrises integer not null default 0;
alter table public.profiles add column if not exists perfect_clears integer not null default 0;
alter table public.profiles add column if not exists daily_progress_on date;
alter table public.profiles add column if not exists daily_matches integer not null default 0;
alter table public.profiles add column if not exists daily_wins integer not null default 0;
alter table public.profiles add column if not exists daily_lines integer not null default 0;
alter table public.profiles add column if not exists daily_score bigint not null default 0;

create table if not exists public.background_catalog (
  background_id text primary key,
  name text not null,
  price integer not null check (price >= 0),
  rarity text not null,
  sort_order integer not null default 0,
  available boolean not null default true
);

create table if not exists public.profile_backgrounds (
  user_id uuid not null references public.profiles(id) on delete cascade,
  background_id text not null references public.background_catalog(background_id),
  acquired_at timestamptz not null default now(),
  primary key (user_id, background_id)
);

create table if not exists public.task_claims (
  user_id uuid not null references public.profiles(id) on delete cascade,
  task_id text not null,
  period_key text not null,
  claimed_at timestamptz not null default now(),
  primary key (user_id, task_id, period_key)
);

insert into public.background_catalog(background_id,name,price,rarity,sort_order) values
  ('void','深空競技場',0,'免費',1),
  ('aurora','極光脈衝',450,'稀有',2),
  ('glacier','冰晶宮殿',600,'史詩',3),
  ('sunsetCity','暮色都市',650,'史詩',4),
  ('forestRuins','翡翠遺跡',650,'史詩',5),
  ('magmaCore','熔岩地心',800,'傳說',6),
  ('royalNebula','皇家星雲',950,'傳說',7)
on conflict(background_id) do update set name=excluded.name,price=excluded.price,rarity=excluded.rarity,sort_order=excluded.sort_order,available=true;

insert into public.profile_backgrounds(user_id,background_id)
select id,'void' from public.profiles on conflict do nothing;

create or replace function public.grant_starter_themes()
returns trigger language plpgsql security definer set search_path=''
as $$
begin
  insert into public.profile_themes(user_id,theme_id) values(new.id,'neon'),(new.id,'arcade') on conflict do nothing;
  insert into public.profile_backgrounds(user_id,background_id) values(new.id,'void') on conflict do nothing;
  return new;
end;
$$;

alter table public.background_catalog enable row level security;
alter table public.profile_backgrounds enable row level security;
alter table public.task_claims enable row level security;
revoke all on public.profile_backgrounds from anon,authenticated;
revoke all on public.task_claims from anon,authenticated;
revoke all on public.background_catalog from anon;
grant select on public.background_catalog to authenticated;
drop policy if exists "authenticated users read background catalog" on public.background_catalog;
create policy "authenticated users read background catalog" on public.background_catalog for select to authenticated using (available);

create or replace function public.get_shop_state()
returns jsonb language sql security definer set search_path='' stable
as $$
  select jsonb_build_object(
    'coins',p.coins,
    'gems',p.gems,
    'owned',coalesce((select jsonb_agg(pt.theme_id order by tc.sort_order) from public.profile_themes pt join public.theme_catalog tc using(theme_id) where pt.user_id=p.id),'[]'::jsonb),
    'ownedBackgrounds',coalesce((select jsonb_agg(pb.background_id order by bc.sort_order) from public.profile_backgrounds pb join public.background_catalog bc using(background_id) where pb.user_id=p.id),'[]'::jsonb)
  ) from public.profiles p where p.id=auth.uid();
$$;

create or replace function public.buy_background(p_background_id text)
returns jsonb language plpgsql security definer set search_path=''
as $$
declare v_price integer;v_coins integer;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  select price into v_price from public.background_catalog where background_id=p_background_id and available for update;
  if v_price is null then raise exception '找不到這個背板'; end if;
  if exists(select 1 from public.profile_backgrounds where user_id=auth.uid() and background_id=p_background_id) then raise exception '你已經擁有這個背板'; end if;
  update public.profiles set coins=coins-v_price where id=auth.uid() and coins>=v_price returning coins into v_coins;
  if v_coins is null then raise exception '方塊幣不足'; end if;
  insert into public.profile_backgrounds(user_id,background_id) values(auth.uid(),p_background_id);
  return public.get_shop_state();
end;
$$;

create or replace function public.get_progression_state()
returns jsonb language sql security definer set search_path='' stable
as $$
  select jsonb_build_object(
    'progress',jsonb_build_object(
      'daily_matches',case when p.daily_progress_on=(now() at time zone 'Asia/Taipei')::date then p.daily_matches else 0 end,
      'daily_wins',case when p.daily_progress_on=(now() at time zone 'Asia/Taipei')::date then p.daily_wins else 0 end,
      'daily_lines',case when p.daily_progress_on=(now() at time zone 'Asia/Taipei')::date then p.daily_lines else 0 end,
      'daily_score',case when p.daily_progress_on=(now() at time zone 'Asia/Taipei')::date then p.daily_score else 0 end,
      'total_matches',p.total_matches,'total_wins',p.total_wins,'total_lines',p.total_lines,'total_score',p.total_score,
      'best_score',p.best_score,'best_combo',p.best_combo,'total_tetrises',p.total_tetrises,'perfect_clears',p.perfect_clears
    ),
    'claims',coalesce((select jsonb_agg(c.task_id) from public.task_claims c where c.user_id=p.id and (c.period_key='once' or c.period_key=((now() at time zone 'Asia/Taipei')::date)::text)),'[]'::jsonb),
    'wallet',jsonb_build_object('coins',p.coins,'gems',p.gems)
  ) from public.profiles p where p.id=auth.uid();
$$;

create or replace function public.record_game_progress(
  p_score integer,p_lines integer,p_best_combo integer,p_tetrises integer,p_perfect_clears integer,p_won boolean,p_mode text
)
returns jsonb language plpgsql security definer set search_path=''
as $$
declare v_today date:=(now() at time zone 'Asia/Taipei')::date;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if p_mode not in ('ai','online') then raise exception '不支援的遊戲模式'; end if;
  update public.profiles set
    total_matches=total_matches+1,total_wins=total_wins+(case when p_won then 1 else 0 end),
    total_lines=total_lines+greatest(0,p_lines),total_score=total_score+greatest(0,p_score),
    best_score=greatest(best_score,greatest(0,p_score)),best_combo=greatest(best_combo,greatest(0,p_best_combo)),
    total_tetrises=total_tetrises+greatest(0,p_tetrises),perfect_clears=perfect_clears+greatest(0,p_perfect_clears),
    daily_matches=case when daily_progress_on=v_today then daily_matches+1 else 1 end,
    daily_wins=case when daily_progress_on=v_today then daily_wins+(case when p_won then 1 else 0 end) else (case when p_won then 1 else 0 end) end,
    daily_lines=case when daily_progress_on=v_today then daily_lines+greatest(0,p_lines) else greatest(0,p_lines) end,
    daily_score=case when daily_progress_on=v_today then daily_score+greatest(0,p_score) else greatest(0,p_score) end,
    daily_progress_on=v_today
  where id=auth.uid();
  return public.get_progression_state();
end;
$$;

create or replace function public.claim_task(p_task_id text)
returns jsonb language plpgsql security definer set search_path=''
as $$
declare
  p public.profiles;v_today date:=(now() at time zone 'Asia/Taipei')::date;v_period text:='once';
  v_progress bigint:=0;v_target bigint:=0;v_coins integer:=0;v_gems integer:=0;v_inserted integer:=0;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  select * into p from public.profiles where id=auth.uid() for update;
  if p_task_id='daily_match' then v_period:=v_today::text;v_progress:=case when p.daily_progress_on=v_today then p.daily_matches else 0 end;v_target:=1;v_coins:=80;
  elsif p_task_id='daily_lines' then v_period:=v_today::text;v_progress:=case when p.daily_progress_on=v_today then p.daily_lines else 0 end;v_target:=10;v_coins:=100;
  elsif p_task_id='daily_score' then v_period:=v_today::text;v_progress:=case when p.daily_progress_on=v_today then p.daily_score else 0 end;v_target:=5000;v_coins:=120;
  elsif p_task_id='daily_win' then v_period:=v_today::text;v_progress:=case when p.daily_progress_on=v_today then p.daily_wins else 0 end;v_target:=1;v_gems:=2;
  elsif p_task_id='main_first' then v_progress:=p.total_matches;v_target:=1;v_coins:=150;
  elsif p_task_id='main_lines_100' then v_progress:=p.total_lines;v_target:=100;v_coins:=400;
  elsif p_task_id='main_score_100k' then v_progress:=p.total_score;v_target:=100000;v_coins:=600;v_gems:=5;
  elsif p_task_id='main_wins_10' then v_progress:=p.total_wins;v_target:=10;v_coins:=800;v_gems:=8;
  elsif p_task_id='ach_score_10k' then v_progress:=p.best_score;v_target:=10000;v_coins:=200;v_gems:=3;
  elsif p_task_id='ach_score_50k' then v_progress:=p.best_score;v_target:=50000;v_coins:=500;v_gems:=8;
  elsif p_task_id='ach_combo_3' then v_progress:=p.best_combo;v_target:=3;v_coins:=200;v_gems:=3;
  elsif p_task_id='ach_combo_5' then v_progress:=p.best_combo;v_target:=5;v_coins:=400;v_gems:=6;
  elsif p_task_id='ach_tetris_5' then v_progress:=p.total_tetrises;v_target:=5;v_coins:=300;v_gems:=5;
  elsif p_task_id='ach_perfect' then v_progress:=p.perfect_clears;v_target:=1;v_coins:=500;v_gems:=10;
  else raise exception '找不到這個任務';end if;
  if v_progress<v_target then raise exception '任務尚未完成';end if;
  insert into public.task_claims(user_id,task_id,period_key) values(auth.uid(),p_task_id,v_period) on conflict do nothing;
  get diagnostics v_inserted=row_count;
  if v_inserted=0 then raise exception '獎勵已經領取';end if;
  update public.profiles set coins=coins+v_coins,gems=gems+v_gems where id=auth.uid();
  return jsonb_build_object('progression',public.get_progression_state(),'shop',public.get_shop_state());
end;
$$;

drop function if exists public.save_profile(text,text);
create or replace function public.save_profile(p_avatar text,p_block_theme text,p_battle_background text)
returns jsonb language plpgsql security definer set search_path=''
as $$
declare v_profile public.profiles;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if p_avatar not in ('⚡','🔥','👾','🤖','🦊','💎') then raise exception '無效的頭像'; end if;
  if not exists(select 1 from public.profile_themes where user_id=auth.uid() and theme_id=p_block_theme) then raise exception '尚未擁有這個方塊造型'; end if;
  if not exists(select 1 from public.profile_backgrounds where user_id=auth.uid() and background_id=p_battle_background) then raise exception '尚未擁有這個遊戲背板'; end if;
  update public.profiles set avatar=p_avatar,block_theme=p_block_theme,battle_background=p_battle_background,last_seen_at=now()
    where id=auth.uid() returning * into v_profile;
  return jsonb_build_object('username',v_profile.username,'avatar',v_profile.avatar,'block_theme',v_profile.block_theme,'battle_background',v_profile.battle_background,'wins',v_profile.wins,'losses',v_profile.losses);
end;
$$;

revoke execute on function public.buy_background(text) from public,anon;
revoke execute on function public.get_progression_state() from public,anon;
revoke execute on function public.record_game_progress(integer,integer,integer,integer,integer,boolean,text) from public,anon;
revoke execute on function public.claim_task(text) from public,anon;
revoke execute on function public.save_profile(text,text,text) from public,anon;
grant execute on function public.buy_background(text) to authenticated;
grant execute on function public.get_progression_state() to authenticated;
grant execute on function public.record_game_progress(integer,integer,integer,integer,integer,boolean,text) to authenticated;
grant execute on function public.claim_task(text) to authenticated;
grant execute on function public.save_profile(text,text,text) to authenticated;
