-- Additional Blockstorm block themes and refined board backgrounds.
-- Run after progression.sql.

insert into public.theme_catalog(theme_id,name,price,rarity,sort_order) values
  ('pearl','奶霜珍珠',600,'史詩',9),
  ('sakura','櫻花和菓',650,'史詩',10),
  ('ocean','深海微光',700,'史詩',11),
  ('lavender','薰衣草霧',750,'傳說',12),
  ('copper','赤銅工坊',850,'傳說',13),
  ('mint','薄荷玻璃',650,'史詩',14)
on conflict(theme_id) do update set name=excluded.name,price=excluded.price,rarity=excluded.rarity,sort_order=excluded.sort_order,available=true;

insert into public.background_catalog(background_id,name,price,rarity,sort_order) values
  ('linen','亞麻棋盤',400,'稀有',8),
  ('paperGarden','紙境庭園',550,'史詩',9),
  ('rainWindow','雨夜窗景',650,'史詩',10),
  ('dune','暮色沙丘',700,'史詩',11),
  ('moonLake','月下靜湖',850,'傳說',12)
on conflict(background_id) do update set name=excluded.name,price=excluded.price,rarity=excluded.rarity,sort_order=excluded.sort_order,available=true;
