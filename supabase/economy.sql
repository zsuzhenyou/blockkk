-- Blockstorm cosmetic shop, wallet and daily match reward.
-- Run after schema.sql, social.sql and ranked.sql.

alter table public.profiles add column if not exists coins integer not null default 300 check (coins >= 0);
alter table public.profiles add column if not exists gems integer not null default 0 check (gems >= 0);
alter table public.profiles add column if not exists daily_match_completed_on date;

create table if not exists public.theme_catalog (
  theme_id text primary key,
  name text not null,
  price integer not null check (price >= 0),
  rarity text not null,
  sort_order integer not null default 0,
  available boolean not null default true
);

create table if not exists public.profile_themes (
  user_id uuid not null references public.profiles(id) on delete cascade,
  theme_id text not null references public.theme_catalog(theme_id),
  acquired_at timestamptz not null default now(),
  primary key (user_id,theme_id)
);

insert into public.theme_catalog(theme_id,name,price,rarity,sort_order) values
  ('neon','霓虹經典',0,'免費',1),
  ('arcade','街機糖果',0,'免費',2),
  ('ice','冰晶藍',400,'稀有',3),
  ('mono','黑白極簡',450,'稀有',4),
  ('sunset','落日餘暉',550,'史詩',5),
  ('forest','翡翠森林',550,'史詩',6),
  ('magma','熔岩核心',700,'傳說',7),
  ('royal','皇家星塵',800,'傳說',8)
on conflict(theme_id) do update set name=excluded.name,price=excluded.price,rarity=excluded.rarity,sort_order=excluded.sort_order,available=true;

insert into public.profile_themes(user_id,theme_id)
select p.id,t.theme_id from public.profiles p cross join (values('neon'),('arcade')) as t(theme_id)
on conflict do nothing;

-- Players keep any theme they were already using before the shop launched.
insert into public.profile_themes(user_id,theme_id)
select id,block_theme from public.profiles where block_theme in (select theme_id from public.theme_catalog)
on conflict do nothing;

create or replace function public.grant_starter_themes()
returns trigger language plpgsql security definer set search_path=''
as $$
begin
  insert into public.profile_themes(user_id,theme_id) values(new.id,'neon'),(new.id,'arcade') on conflict do nothing;
  return new;
end;
$$;

drop trigger if exists grant_starter_themes_after_profile on public.profiles;
create trigger grant_starter_themes_after_profile after insert on public.profiles
for each row execute function public.grant_starter_themes();

alter table public.theme_catalog enable row level security;
alter table public.profile_themes enable row level security;
revoke all on public.profile_themes from anon,authenticated;
revoke all on public.theme_catalog from anon;
grant select on public.theme_catalog to authenticated;
drop policy if exists "authenticated users read theme catalog" on public.theme_catalog;
create policy "authenticated users read theme catalog" on public.theme_catalog for select to authenticated using (available);

create or replace function public.get_shop_state()
returns jsonb language sql security definer set search_path='' stable
as $$
  select jsonb_build_object(
    'coins',p.coins,
    'gems',p.gems,
    'dailyCompleted',p.daily_match_completed_on=current_date,
    'owned',coalesce((select jsonb_agg(pt.theme_id order by tc.sort_order) from public.profile_themes pt join public.theme_catalog tc using(theme_id) where pt.user_id=p.id),'[]'::jsonb)
  ) from public.profiles p where p.id=auth.uid();
$$;

create or replace function public.buy_theme(p_theme_id text)
returns jsonb language plpgsql security definer set search_path=''
as $$
declare v_price integer;v_coins integer;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  select price into v_price from public.theme_catalog where theme_id=p_theme_id and available for update;
  if v_price is null then raise exception '找不到這個造型'; end if;
  if exists(select 1 from public.profile_themes where user_id=auth.uid() and theme_id=p_theme_id) then raise exception '你已經擁有這個造型'; end if;
  update public.profiles set coins=coins-v_price where id=auth.uid() and coins>=v_price returning coins into v_coins;
  if v_coins is null then raise exception '方塊幣不足'; end if;
  insert into public.profile_themes(user_id,theme_id) values(auth.uid(),p_theme_id);
  return public.get_shop_state();
end;
$$;

create or replace function public.complete_daily_match()
returns jsonb language plpgsql security definer set search_path=''
as $$
declare v_rewarded boolean:=false;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  update public.profiles set coins=coins+120,daily_match_completed_on=current_date
    where id=auth.uid() and daily_match_completed_on is distinct from current_date;
  v_rewarded:=found;
  return public.get_shop_state()||jsonb_build_object('rewarded',v_rewarded);
end;
$$;

create or replace function public.save_profile(p_avatar text,p_block_theme text)
returns jsonb language plpgsql security definer set search_path=''
as $$
declare v_profile public.profiles;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if p_avatar not in ('⚡','🔥','👾','🤖','🦊','💎') then raise exception '無效的頭像'; end if;
  if not exists(select 1 from public.profile_themes where user_id=auth.uid() and theme_id=p_block_theme) then raise exception '尚未擁有這個方塊造型'; end if;
  update public.profiles set avatar=p_avatar,block_theme=p_block_theme,last_seen_at=now()
    where id=auth.uid() returning * into v_profile;
  return jsonb_build_object('username',v_profile.username,'avatar',v_profile.avatar,'block_theme',v_profile.block_theme,'wins',v_profile.wins,'losses',v_profile.losses);
end;
$$;

revoke execute on function public.get_shop_state() from public,anon;
revoke execute on function public.buy_theme(text) from public,anon;
revoke execute on function public.complete_daily_match() from public,anon;
grant execute on function public.get_shop_state() to authenticated;
grant execute on function public.buy_theme(text) to authenticated;
grant execute on function public.complete_daily_match() to authenticated;

