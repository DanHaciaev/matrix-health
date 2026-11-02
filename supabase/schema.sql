-- =====================================================================
--  Схема базы данных магазина.
--  Запустите целиком в Supabase → SQL Editor → New query → Run.
--  Скрипт можно запускать повторно: он ничего не удаляет.
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
--  Таблицы
-- ---------------------------------------------------------------------

create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name        text not null,
  description text,
  sort        int  not null default 0,
  translations jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);

create table if not exists public.products (
  id                uuid primary key default gen_random_uuid(),
  slug              text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name              text not null,
  category_id       uuid references public.categories (id) on delete set null,
  form              text not null default 'capsules',   -- slug из filter_options (kind = 'form'), см. filters.sql
  purposes          text[] not null default '{}',
  pack              text,            -- «Флакон · 5 мг», «90 капсул»
  unit_label        text,            -- «за 1 флакон»
  short_description text,
  description       text,
  usage             text,
  warning           text,
  composition       jsonb not null default '[]'::jsonb,  -- [{ "name": "", "amount": "" }]
  specs             jsonb not null default '[]'::jsonb,  -- [{ "label": "", "value": "" }]
  sku               text,
  batch             text,
  price             numeric(10, 2) not null default 0 check (price >= 0),
  old_price         numeric(10, 2) check (old_price is null or old_price >= 0),
  stock             int not null default 0 check (stock >= 0),
  is_new            boolean not null default false,
  is_popular        boolean not null default false,
  is_published      boolean not null default true,
  images            text[] not null default '{}',
  sort              int not null default 0,
  translations      jsonb not null default '{}'::jsonb,   -- переводы текстов: { en: {...}, ro: {...} }
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists products_category_idx on public.products (category_id);

create table if not exists public.product_variants (
  id         uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  label      text not null,                 -- «5 мг», «Набор 3 шт»
  price      numeric(10, 2) not null check (price >= 0),
  stock      int not null default 0 check (stock >= 0),
  sort       int not null default 0
);

create index if not exists product_variants_product_idx on public.product_variants (product_id);

create table if not exists public.certificates (
  id           uuid primary key default gen_random_uuid(),
  product_id   uuid references public.products (id) on delete set null,
  title        text not null,
  doc_type     text not null default 'COA',   -- COA, HPLC, Соответствие, Другое
  batch        text,
  issued_at    date,
  lab          text,
  file_url     text,
  is_published boolean not null default true,
  translations jsonb not null default '{}'::jsonb,   -- переводы названия
  created_at   timestamptz not null default now()
);

create index if not exists certificates_product_idx on public.certificates (product_id);

create table if not exists public.orders (
  id              uuid primary key default gen_random_uuid(),
  number          bigint generated always as identity (start with 1) unique,
  code            text generated always as (case when number < 10000 then lpad(number::text, 4, '0') else number::text end) stored,  -- «0001»
  status          text not null default 'new'
                  check (status in ('new', 'confirmed', 'shipped', 'done', 'cancelled')),
  customer_name   text not null,
  phone           text not null,
  email           text,
  delivery_method text not null default 'courier'
                  check (delivery_method in ('courier', 'pickup', 'post')),
  city            text,
  address         text,
  payment_method  text not null default 'cash'
                  check (payment_method in ('cash', 'card', 'transfer')),
  comment         text,
  subtotal        numeric(10, 2) not null default 0,
  delivery_cost   numeric(10, 2) not null default 0,
  total           numeric(10, 2) not null default 0,
  admin_note      text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists orders_status_idx on public.orders (status);
create index if not exists orders_created_idx on public.orders (created_at desc);

create table if not exists public.order_items (
  id            uuid primary key default gen_random_uuid(),
  order_id      uuid not null references public.orders (id) on delete cascade,
  product_id    uuid references public.products (id) on delete set null,
  variant_id    uuid references public.product_variants (id) on delete set null,
  name          text not null,
  variant_label text,
  price         numeric(10, 2) not null,
  qty           int not null check (qty > 0)
);

create index if not exists order_items_order_idx on public.order_items (order_id);

-- Одна строка с настройками магазина (название, телефон, доставка…)
create table if not exists public.settings (
  id                 int primary key default 1 check (id = 1),
  store_name         text not null default 'Health Matrix',
  tagline            text,
  phone              text,
  email              text,
  address            text,
  telegram           text,
  working_hours      text,
  delivery_cost      numeric(10, 2) not null default 0,
  free_delivery_from numeric(10, 2) not null default 0,
  delivery_info      text,
  payment_info       text,
  translations       jsonb not null default '{}'::jsonb,   -- переводы: { en: {...}, ro: {...} }
  updated_at         timestamptz not null default now()
);

insert into public.settings (id) values (1) on conflict (id) do nothing;

-- Кто имеет доступ к админке
create table if not exists public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
--  updated_at
-- ---------------------------------------------------------------------

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_touch on public.products;
create trigger products_touch before update on public.products
  for each row execute function public.touch_updated_at();

drop trigger if exists orders_touch on public.orders;
create trigger orders_touch before update on public.orders
  for each row execute function public.touch_updated_at();

drop trigger if exists settings_touch on public.settings;
create trigger settings_touch before update on public.settings
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------
--  Проверка прав администратора
-- ---------------------------------------------------------------------

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

grant execute on function public.is_admin() to anon, authenticated;

-- ---------------------------------------------------------------------
--  Row Level Security
-- ---------------------------------------------------------------------

alter table public.categories       enable row level security;
alter table public.products         enable row level security;
alter table public.product_variants enable row level security;
alter table public.certificates     enable row level security;
alter table public.orders           enable row level security;
alter table public.order_items      enable row level security;
alter table public.settings         enable row level security;
alter table public.admins           enable row level security;

-- Категории: читают все, меняют админы
drop policy if exists "categories read" on public.categories;
create policy "categories read" on public.categories
  for select using (true);
drop policy if exists "categories admin" on public.categories;
create policy "categories admin" on public.categories
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Товары: покупатели видят опубликованные, админы — все
drop policy if exists "products read" on public.products;
create policy "products read" on public.products
  for select using (is_published or public.is_admin());
drop policy if exists "products admin" on public.products;
create policy "products admin" on public.products
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "variants read" on public.product_variants;
create policy "variants read" on public.product_variants
  for select using (
    public.is_admin() or exists (
      select 1 from public.products p where p.id = product_id and p.is_published
    )
  );
drop policy if exists "variants admin" on public.product_variants;
create policy "variants admin" on public.product_variants
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "certificates read" on public.certificates;
create policy "certificates read" on public.certificates
  for select using (is_published or public.is_admin());
drop policy if exists "certificates admin" on public.certificates;
create policy "certificates admin" on public.certificates
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Заказы: создаются только через функцию place_order, читают и меняют админы
drop policy if exists "orders admin" on public.orders;
create policy "orders admin" on public.orders
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "order items admin" on public.order_items;
create policy "order items admin" on public.order_items
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "settings read" on public.settings;
create policy "settings read" on public.settings
  for select using (true);
drop policy if exists "settings admin" on public.settings;
create policy "settings admin" on public.settings
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admins self" on public.admins;
create policy "admins self" on public.admins
  for select to authenticated using (user_id = auth.uid());

-- ---------------------------------------------------------------------
--  Оформление заказа
--  Цены берутся из базы, а не из браузера покупателя.
-- ---------------------------------------------------------------------

create or replace function public.place_order(p_customer jsonb, p_items jsonb)
returns table (order_id uuid, order_number bigint)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order_id  uuid;
  v_number    bigint;
  v_item      jsonb;
  v_qty       int;
  v_product   record;
  v_variant   record;
  v_price     numeric;
  v_label     text;
  v_subtotal  numeric := 0;
  v_delivery  numeric := 0;
  v_method    text := coalesce(nullif(p_customer ->> 'delivery_method', ''), 'courier');
  v_settings  record;
begin
  if coalesce(trim(p_customer ->> 'customer_name'), '') = '' then
    raise exception 'Укажите имя';
  end if;
  if length(regexp_replace(coalesce(p_customer ->> 'phone', ''), '\D', '', 'g')) < 8 then
    raise exception 'Укажите телефон';
  end if;
  if jsonb_typeof(p_items) <> 'array'
     or jsonb_array_length(p_items) = 0
     or jsonb_array_length(p_items) > 50 then
    raise exception 'Корзина пуста';
  end if;

  insert into public.orders (
    customer_name, phone, email, delivery_method, city, address, payment_method, comment
  ) values (
    left(trim(p_customer ->> 'customer_name'), 120),
    left(trim(p_customer ->> 'phone'), 40),
    nullif(left(trim(coalesce(p_customer ->> 'email', '')), 120), ''),
    v_method,
    nullif(left(trim(coalesce(p_customer ->> 'city', '')), 120), ''),
    nullif(left(trim(coalesce(p_customer ->> 'address', '')), 300), ''),
    coalesce(nullif(p_customer ->> 'payment_method', ''), 'cash'),
    nullif(left(trim(coalesce(p_customer ->> 'comment', '')), 1000), '')
  )
  returning id, number into v_order_id, v_number;

  for v_item in select value from jsonb_array_elements(p_items) loop
    v_qty := greatest(1, least(99, coalesce((v_item ->> 'qty')::int, 1)));

    select id, name, price, is_published
      into v_product
      from public.products
     where id = (v_item ->> 'product_id')::uuid;

    if not found or not v_product.is_published then
      raise exception 'Один из товаров больше недоступен';
    end if;

    v_price := v_product.price;
    v_label := null;

    if coalesce(v_item ->> 'variant_id', '') <> '' then
      select id, label, price
        into v_variant
        from public.product_variants
       where id = (v_item ->> 'variant_id')::uuid
         and product_id = v_product.id;

      if not found then
        raise exception 'Вариант товара «%» больше недоступен', v_product.name;
      end if;

      v_price := v_variant.price;
      v_label := v_variant.label;

      update public.product_variants
         set stock = greatest(0, stock - v_qty)
       where id = v_variant.id;
    else
      update public.products
         set stock = greatest(0, stock - v_qty)
       where id = v_product.id;
    end if;

    insert into public.order_items (order_id, product_id, variant_id, name, variant_label, price, qty)
    values (
      v_order_id,
      v_product.id,
      case when v_label is null then null else (v_item ->> 'variant_id')::uuid end,
      v_product.name,
      v_label,
      v_price,
      v_qty
    );

    v_subtotal := v_subtotal + v_price * v_qty;
  end loop;

  select delivery_cost, free_delivery_from into v_settings from public.settings where id = 1;

  if v_method = 'pickup' or v_subtotal >= coalesce(v_settings.free_delivery_from, 0) then
    v_delivery := 0;
  else
    v_delivery := coalesce(v_settings.delivery_cost, 0);
  end if;

  update public.orders
     set subtotal = v_subtotal,
         delivery_cost = v_delivery,
         total = v_subtotal + v_delivery
   where id = v_order_id;

  return query select v_order_id, v_number;
end;
$$;

revoke all on function public.place_order(jsonb, jsonb) from public;
grant execute on function public.place_order(jsonb, jsonb) to anon, authenticated;

-- ---------------------------------------------------------------------
--  Отмена заказа возвращает товар на склад (и наоборот), см. order-stock.sql
-- ---------------------------------------------------------------------

create or replace function public.restock_on_cancel()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_sign int;
begin
  if new.status = 'cancelled' and old.status <> 'cancelled' then
    v_sign := 1;     -- вернуть на склад
  elsif old.status = 'cancelled' and new.status <> 'cancelled' then
    v_sign := -1;    -- снова списать
  else
    return new;
  end if;

  update public.product_variants v
     set stock = greatest(0, v.stock + v_sign * i.qty)
    from (
      select variant_id, sum(qty) as qty
        from public.order_items
       where order_id = new.id and variant_id is not null
       group by variant_id
    ) i
   where v.id = i.variant_id;

  update public.products p
     set stock = greatest(0, p.stock + v_sign * i.qty)
    from (
      select product_id, sum(qty) as qty
        from public.order_items
       where order_id = new.id and variant_id is null and product_id is not null
       group by product_id
    ) i
   where p.id = i.product_id;

  return new;
end;
$$;

drop trigger if exists orders_restock on public.orders;
create trigger orders_restock after update of status on public.orders
  for each row execute function public.restock_on_cancel();

-- ---------------------------------------------------------------------
--  Хранилище файлов: фото товаров и PDF сертификатов
-- ---------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

drop policy if exists "media read" on storage.objects;
create policy "media read" on storage.objects
  for select using (bucket_id = 'media');

drop policy if exists "media admin insert" on storage.objects;
create policy "media admin insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'media' and public.is_admin());

drop policy if exists "media admin update" on storage.objects;
create policy "media admin update" on storage.objects
  for update to authenticated using (bucket_id = 'media' and public.is_admin());

drop policy if exists "media admin delete" on storage.objects;
create policy "media admin delete" on storage.objects
  for delete to authenticated using (bucket_id = 'media' and public.is_admin());
