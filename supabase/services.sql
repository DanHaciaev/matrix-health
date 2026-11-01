-- =====================================================================
--  Услуги специалиста: консультация по подбору пептидов и ежемесячное
--  сопровождение. Заявки с сайта попадают в Админку → «Заявки».
--
--  Запустите один раз в Supabase → SQL Editor ПОСЛЕ schema.sql.
--  Повторный запуск безопасен: тексты и цены, изменённые в админке, не перезаписываются.
-- =====================================================================

create table if not exists public.services (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name         text not null,
  summary      text,                                   -- одна-две фразы под названием
  features     text[] not null default '{}',           -- что входит, по пункту в строке
  price        numeric(10, 2) check (price is null or price >= 0),   -- пусто = «цена по запросу»
  period       text not null default 'once' check (period in ('once', 'month')),
  sort         int not null default 0,
  is_published boolean not null default true,
  translations jsonb not null default '{}'::jsonb,     -- { en: { name, summary, features }, ro: {...} }
  created_at   timestamptz not null default now()
);

create table if not exists public.service_requests (
  id             uuid primary key default gen_random_uuid(),
  number         bigint generated always as identity (start with 1001) unique,
  service_id     uuid references public.services (id) on delete set null,
  service_name   text not null,                        -- копия на момент заявки
  price          numeric(10, 2),
  period         text,
  status         text not null default 'new' check (status in ('new', 'in_work', 'done', 'cancelled')),
  customer_name  text not null,
  phone          text not null,
  contact_method text not null default 'phone' check (contact_method in ('phone', 'telegram', 'viber', 'whatsapp')),
  comment        text,
  admin_note     text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists service_requests_created_idx on public.service_requests (created_at desc);

drop trigger if exists service_requests_touch on public.service_requests;
create trigger service_requests_touch before update on public.service_requests
  for each row execute function public.touch_updated_at();

alter table public.services         enable row level security;
alter table public.service_requests enable row level security;

drop policy if exists "services read" on public.services;
create policy "services read" on public.services
  for select using (is_published or public.is_admin());
drop policy if exists "services admin" on public.services;
create policy "services admin" on public.services
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Заявки создаются только через функцию request_service, читают и меняют админы
drop policy if exists "service requests admin" on public.service_requests;
create policy "service requests admin" on public.service_requests
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------
--  Заявка с сайта. Название и цена услуги берутся из базы.
-- ---------------------------------------------------------------------

create or replace function public.request_service(p_service uuid, p_request jsonb)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_service record;
  v_number  bigint;
  v_method  text := coalesce(p_request ->> 'contact_method', '');
begin
  if coalesce(trim(p_request ->> 'customer_name'), '') = '' then
    raise exception 'Укажите имя';
  end if;
  if length(regexp_replace(coalesce(p_request ->> 'phone', ''), '\D', '', 'g')) < 8 then
    raise exception 'Укажите телефон';
  end if;

  select id, name, price, period
    into v_service
    from public.services
   where id = p_service and is_published;

  if not found then
    raise exception 'Услуга недоступна';
  end if;

  insert into public.service_requests (
    service_id, service_name, price, period, customer_name, phone, contact_method, comment
  ) values (
    v_service.id,
    v_service.name,
    v_service.price,
    v_service.period,
    left(trim(p_request ->> 'customer_name'), 120),
    left(trim(p_request ->> 'phone'), 40),
    case when v_method in ('phone', 'telegram', 'viber', 'whatsapp') then v_method else 'phone' end,
    nullif(left(trim(coalesce(p_request ->> 'comment', '')), 2000), '')
  )
  returning number into v_number;

  return v_number;
end;
$$;

revoke all on function public.request_service(uuid, jsonb) from public;
grant execute on function public.request_service(uuid, jsonb) to anon, authenticated;

-- ---------------------------------------------------------------------
--  Две услуги. Цены не заданы — на сайте будет «Цена по запросу»,
--  пока вы не укажете их в Админке → «Услуги».
-- ---------------------------------------------------------------------

insert into public.services (slug, name, summary, features, period, sort, translations) values
(
  'consultation',
  'Консультация по подбору пептидов',
  'Специалист разберёт вашу цель и подберёт пептиды и схему приёма.',
  array[
    'Разбор цели, самочувствия и препаратов, которые вы уже принимаете',
    'Подбор пептидов и схемы приёма под вашу задачу',
    'Список анализов, которые стоит сдать перед курсом',
    'Ответы на вопросы о хранении и применении'
  ],
  'once',
  1,
  jsonb_build_object(
    'en', jsonb_build_object(
      'name', 'Peptide selection consultation',
      'summary', 'A specialist reviews your goal and selects peptides and a dosing schedule.',
      'features', jsonb_build_array(
        'Review of your goal, well-being and the medications you already take',
        'Selection of peptides and a dosing schedule for your goal',
        'A list of lab tests to take before the course',
        'Answers to your questions about storage and use'
      )
    ),
    'ro', jsonb_build_object(
      'name', 'Consultație pentru alegerea peptidelor',
      'summary', 'Specialistul analizează obiectivul dvs. și alege peptidele și schema de administrare.',
      'features', jsonb_build_array(
        'Analiza obiectivului, a stării de sănătate și a medicamentelor pe care le luați',
        'Alegerea peptidelor și a schemei de administrare pentru obiectivul dvs.',
        'Lista analizelor de efectuat înainte de cură',
        'Răspunsuri la întrebări despre păstrare și utilizare'
      )
    )
  )
),
(
  'support',
  'Сопровождение по пептидам',
  'Специалист ведёт ваш курс от месяца к месяцу и на связи каждый день.',
  array[
    'План курса на месяц и корректировка по результатам',
    'Какие анализы сдать до начала курса и во время него',
    'Ежедневная поддержка в мессенджере'
  ],
  'month',
  2,
  jsonb_build_object(
    'en', jsonb_build_object(
      'name', 'Peptide course support',
      'summary', 'A specialist guides your course month by month and is in touch every day.',
      'features', jsonb_build_array(
        'A monthly course plan, adjusted to your results',
        'Which lab tests to take before and during the course',
        'Daily support via messenger'
      )
    ),
    'ro', jsonb_build_object(
      'name', 'Însoțire pe durata curei de peptide',
      'summary', 'Specialistul vă ghidează cura lună de lună și este disponibil zilnic.',
      'features', jsonb_build_array(
        'Planul curei pe o lună, ajustat după rezultate',
        'Ce analize să faceți înainte de cură și pe parcursul ei',
        'Suport zilnic prin mesagerie'
      )
    )
  )
)
on conflict (slug) do nothing;

-- Проверка: должно быть 2 услуги
select slug, name, price, period from public.services order by sort;
