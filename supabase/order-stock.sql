-- =====================================================================
--  Возврат товара на склад при отмене заказа.
--
--  Заказ → «Отменён»: количество из заказа возвращается в остаток.
--  Отменённый заказ снова сделали активным: количество списывается обратно.
--  Работает для товаров и для их вариантов (дозировок).
--
--  Запустите один раз в Supabase → SQL Editor. Повторный запуск безопасен.
--  Заказы, отменённые ДО запуска этого файла, остаток не вернут —
--  поправьте его вручную в Админке → «Товары».
-- =====================================================================

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
