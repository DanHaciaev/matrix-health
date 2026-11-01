-- =====================================================================
--  Фильтры каталога, которые редактируются в админке:
--  «Назначение» (purpose) и «Форма выпуска» (form).
--
--  Запустите один раз в Supabase → SQL Editor ПОСЛЕ schema.sql и i18n.sql.
--  Повторный запуск безопасен: существующие варианты не перезаписываются.
-- =====================================================================

create table if not exists public.filter_options (
  id           uuid primary key default gen_random_uuid(),
  kind         text not null check (kind in ('purpose', 'form')),
  slug         text not null check (slug ~ '^[a-z0-9-]+$'),
  name         text not null,                               -- название на русском
  translations jsonb not null default '{}'::jsonb,          -- { "en": { "name": "…" }, "ro": { "name": "…" } }
  sort         int not null default 0,
  is_visible   boolean not null default true,               -- показывать в фильтрах каталога
  created_at   timestamptz not null default now(),
  unique (kind, slug)
);

alter table public.filter_options enable row level security;

drop policy if exists "filter options read" on public.filter_options;
create policy "filter options read" on public.filter_options
  for select using (true);

drop policy if exists "filter options admin" on public.filter_options;
create policy "filter options admin" on public.filter_options
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Форма выпуска больше не ограничена пятью вариантами — список теперь в filter_options
alter table public.products drop constraint if exists products_form_check;

-- Варианты, которые раньше были зашиты в код
insert into public.filter_options (kind, slug, name, translations, sort) values
  ('purpose', 'immunity',     'Иммунитет',          '{"en":{"name":"Immunity"},"ro":{"name":"Imunitate"}}', 1),
  ('purpose', 'skin-joints',  'Кожа и суставы',     '{"en":{"name":"Skin and joints"},"ro":{"name":"Piele și articulații"}}', 2),
  ('purpose', 'energy-sleep', 'Энергия и сон',      '{"en":{"name":"Energy and sleep"},"ro":{"name":"Energie și somn"}}', 3),
  ('purpose', 'recovery',     'Восстановление',     '{"en":{"name":"Recovery"},"ro":{"name":"Recuperare"}}', 4),
  ('purpose', 'heart',        'Сердце и сосуды',    '{"en":{"name":"Heart and blood vessels"},"ro":{"name":"Inimă și vase"}}', 5),
  ('purpose', 'metabolism',   'Метаболизм и вес',   '{"en":{"name":"Metabolism and weight"},"ro":{"name":"Metabolism și greutate"}}', 6),
  ('form',    'tablets',      'Таблетки',           '{"en":{"name":"Tablets"},"ro":{"name":"Comprimate"}}', 1),
  ('form',    'capsules',     'Капсулы',            '{"en":{"name":"Capsules"},"ro":{"name":"Capsule"}}', 2),
  ('form',    'vials',        'Флаконы',            '{"en":{"name":"Vials"},"ro":{"name":"Flacoane"}}', 3),
  ('form',    'powder',       'Порошок',            '{"en":{"name":"Powder"},"ro":{"name":"Pulbere"}}', 4),
  ('form',    'liquid',       'Жидкость',           '{"en":{"name":"Liquid"},"ro":{"name":"Lichid"}}', 5)
on conflict (kind, slug) do nothing;

-- Проверка: должно быть 6 назначений и 5 форм
select kind, count(*) from public.filter_options group by kind;
