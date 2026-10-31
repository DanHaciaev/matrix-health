-- =====================================================================
--  Переводы на английский и румынский.
--  Запустите ОДИН раз в Supabase → SQL Editor (повторный запуск безопасен).
--
--  Русский текст остаётся в обычных колонках (name, description…),
--  английский и румынский — в поле translations:
--  { "en": { "name": "...", "description": "..." }, "ro": { ... } }
-- =====================================================================

alter table public.products     add column if not exists translations jsonb not null default '{}'::jsonb;
alter table public.categories   add column if not exists translations jsonb not null default '{}'::jsonb;
alter table public.certificates add column if not exists translations jsonb not null default '{}'::jsonb;
alter table public.settings     add column if not exists translations jsonb not null default '{}'::jsonb;
