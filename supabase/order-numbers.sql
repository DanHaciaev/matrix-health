-- =====================================================================
--  Номера заказов и заявок вида 0001, 0002, …
--
--  Сам номер (number) — число: ведущие нули число хранить не может.
--  Поэтому рядом добавляется поле code — его база заполняет сама: 1 → «0001»
--  (после 9999 — просто 10000, 10001 …). На сайте и в админке номер показывается так же.
--
--  Запустите один раз в Supabase → SQL Editor ПОСЛЕ schema.sql и services.sql.
-- =====================================================================

alter table public.orders
  add column if not exists code text generated always as (
    case when number < 10000 then lpad(number::text, 4, '0') else number::text end
  ) stored;

alter table public.service_requests
  add column if not exists code text generated always as (
    case when number < 10000 then lpad(number::text, 4, '0') else number::text end
  ) stored;

-- ---------------------------------------------------------------------
--  Счёт с 0001.
--  Тестовые заказы и заявки лучше удалить, иначе их номера (1001 и выше)
--  останутся в списке рядом с настоящими. Удаление необратимо —
--  уберите «--» перед двумя строками delete, только если в базе одни тесты.
--  Остатки товаров удаление не возвращает — поправьте их в Админке → «Товары».
-- ---------------------------------------------------------------------

-- delete from public.orders;
-- delete from public.service_requests;

alter table public.orders alter column number restart with 1;
alter table public.service_requests alter column number restart with 1;

-- Проверка: последние заказы и их коды
select number, code, customer_name, created_at from public.orders order by created_at desc limit 5;
