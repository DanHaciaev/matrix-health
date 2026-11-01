-- =====================================================================
--  Ещё две категории: Agenyz и лечебные травы из Сучевицы.
--  Вместе с «Пептидами» получится три раздела каталога.
--
--  Запустите один раз в Supabase → SQL Editor. Повторный запуск безопасен:
--  если категория уже есть, она не перезаписывается.
--
--  На сайте категория появится, когда в ней будет хотя бы один опубликованный товар.
--  Порядок (sort) задаёт и место в списке, и цвет плитки на главной —
--  поменять можно в Админке → «Категории».
-- =====================================================================

insert into public.categories (slug, name, description, sort, translations) values
(
  'agenyz',
  'Agenyz',
  'Продукция Agenyz',
  4,
  '{"en":{"name":"Agenyz","description":"Agenyz products"},"ro":{"name":"Agenyz","description":"Produse Agenyz"}}'
),
(
  'herbs',
  'Лечебные травы',
  'Травы и сборы из Сучевицы',
  6,
  '{"en":{"name":"Medicinal herbs","description":"Herbs and blends from Sucevița"},"ro":{"name":"Plante medicinale","description":"Plante și ceaiuri din Sucevița"}}'
)
on conflict (slug) do nothing;

-- Проверка: должно быть три категории
select name, slug, sort from public.categories order by sort;
