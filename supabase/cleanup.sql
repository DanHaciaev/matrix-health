-- =====================================================================
--  Очистка базы от старых (стартовых) данных.
--  Оставляет только 15 пептидов из peptides.sql — всё остальное удаляется НАВСЕГДА.
--
--  Порядок: сначала peptides.sql, потом этот файл.
--  После запуска: Админка → Настройки → «Обновить сайт».
-- =====================================================================

-- 1. Сертификаты, не относящиеся к 15 пептидам (все старые — к демо-товарам)
delete from public.certificates c
 where c.product_id is null
    or not exists (
      select 1 from public.products p
       where p.id = c.product_id
         and p.slug = any (array[
           'glow', 'ss-31', 'bpc-157-tb-500', 'ipamorelin', '5-amino-1mq', 'thymosin-alpha-1',
           'retatrutide', 'tirzepatide', 'cagrilintide', 'mots-c', 'nad-plus', 'oxytocin',
           'selank', 'epitalon', 'ghk-cu'
         ])
    );

-- 2. Все остальные товары. Их варианты (дозировки) удалятся автоматически.
--    В старых заказах позиции сохранятся с названием и ценой, но без ссылки на товар.
delete from public.products
 where slug <> all (array[
   'glow', 'ss-31', 'bpc-157-tb-500', 'ipamorelin', '5-amino-1mq', 'thymosin-alpha-1',
   'retatrutide', 'tirzepatide', 'cagrilintide', 'mots-c', 'nad-plus', 'oxytocin',
   'selank', 'epitalon', 'ghk-cu'
 ]);

-- 3. Категории, кроме «Пептиды»
delete from public.categories
 where slug <> 'peptides';

update public.categories
   set name = 'Пептиды', description = 'Лиофилизаты во флаконах', sort = 1
 where slug = 'peptides';

-- 4. Слоган из старого стартового наполнения (если вы его ещё не меняли)
update public.settings
   set tagline = 'Пептиды с документами лаборатории к каждой партии'
 where id = 1
   and tagline = 'Пептиды, БАДы и таблетки с документами на каждую партию';

-- 5. ЗАКАЗЫ. По умолчанию НЕ удаляются — среди них могут быть настоящие.
--    Если там только тестовые заказы, уберите «--» в строке ниже.
-- delete from public.orders;

-- Проверка: должно остаться 15 товаров в одной категории
select c.name as category, count(p.id) as products
  from public.categories c
  left join public.products p on p.category_id = c.id
 group by c.name;

-- Фото и PDF старых товаров (если загружались) остаются в Supabase → Storage → media.
-- Их можно удалить там вручную: папки products/ и certificates/.
