-- =====================================================================
--  Нельзя заказать больше, чем есть на складе.
--
--  place_order проверяет остаток каждого товара и варианта и отказывает,
--  если в корзине больше. Строки товаров блокируются на время заказа,
--  чтобы два покупателя одновременно не купили последнюю штуку.
--
--  Запустите один раз в Supabase → SQL Editor. Повторный запуск безопасен.
-- =====================================================================

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

    -- for update: два одновременных заказа не купят один и тот же последний товар
    select id, name, price, stock, is_published
      into v_product
      from public.products
     where id = (v_item ->> 'product_id')::uuid
       for update;

    if not found or not v_product.is_published then
      raise exception 'Один из товаров больше недоступен';
    end if;

    v_price := v_product.price;
    v_label := null;

    if coalesce(v_item ->> 'variant_id', '') <> '' then
      select id, label, price, stock
        into v_variant
        from public.product_variants
       where id = (v_item ->> 'variant_id')::uuid
         and product_id = v_product.id
         for update;

      if not found then
        raise exception 'Вариант товара «%» больше недоступен', v_product.name;
      end if;
      if v_variant.stock < v_qty then
        raise exception 'Недостаточно товара «% %»: в наличии %', v_product.name, v_variant.label, v_variant.stock;
      end if;

      v_price := v_variant.price;
      v_label := v_variant.label;

      update public.product_variants
         set stock = greatest(0, stock - v_qty)
       where id = v_variant.id;
    else
      if v_product.stock < v_qty then
        raise exception 'Недостаточно товара «%»: в наличии %', v_product.name, v_product.stock;
      end if;

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
