-- ============================================================
-- 010 · Kickiie F2 — Pagos y plan familiar
-- ============================================================

-- Plan por academia (mensual familiar)
create table if not exists public.academia_plan_config (
  academia_id          uuid primary key references public.academias (id) on delete cascade,
  precio_base          numeric(12,2) not null default 400,
  precio_adicional     numeric(12,2) not null default 300,
  moneda               text not null default 'MXN',
  unidad_periodo       text not null default 'month'
                         check (unidad_periodo in ('month')),
  updated_at           timestamptz not null default now()
);

comment on table public.academia_plan_config is
  'Plan mensual familiar: base + adicional por alumno activo. Monto override en cada pago.';

-- Seed Ronin
insert into public.academia_plan_config (academia_id, precio_base, precio_adicional)
select id, 400, 300 from public.academias where slug = 'ronin-defense'
on conflict (academia_id) do nothing;

-- Familias: vencimiento compartido
alter table public.familias
  add column if not exists fecha_vencimiento date;

-- Pagos (sin pasarela; solo registro)
create table if not exists public.pagos (
  id              uuid primary key default gen_random_uuid(),
  academia_id     uuid not null references public.academias (id) on delete cascade,
  familia_id      uuid not null references public.familias (id) on delete cascade,
  monto           numeric(12,2) not null check (monto > 0),
  fecha_pago      date not null default (timezone('America/Mexico_City', now()))::date,
  metodo          text not null default 'efectivo'
                    check (metodo in ('efectivo','transferencia','terminal','mercadopago','otro')),
  periodos        int not null default 1 check (periodos >= 1),
  periodo_inicio  date,
  periodo_fin     date,
  notas           text,
  registrado_por  uuid references auth.users (id) on delete set null,
  status          text not null default 'activo'
                    check (status in ('activo','cancelado')),
  created_at      timestamptz not null default now()
);

create index if not exists pagos_familia_id_idx on public.pagos (familia_id, created_at desc);
create index if not exists pagos_academia_id_idx on public.pagos (academia_id, fecha_pago desc);

alter table public.academia_plan_config enable row level security;
alter table public.pagos enable row level security;

drop policy if exists "plan_config_select" on public.academia_plan_config;
create policy "plan_config_select"
  on public.academia_plan_config for select to authenticated
  using (public.is_academia_member(academia_id));

drop policy if exists "plan_config_update" on public.academia_plan_config;
create policy "plan_config_update"
  on public.academia_plan_config for update to authenticated
  using (public.is_academia_member(academia_id))
  with check (public.is_academia_member(academia_id));

drop policy if exists "plan_config_insert" on public.academia_plan_config;
create policy "plan_config_insert"
  on public.academia_plan_config for insert to authenticated
  with check (public.is_academia_member(academia_id));

drop policy if exists "pagos_select" on public.pagos;
create policy "pagos_select"
  on public.pagos for select to authenticated
  using (public.is_academia_member(academia_id));

drop policy if exists "pagos_insert" on public.pagos;
create policy "pagos_insert"
  on public.pagos for insert to authenticated
  with check (public.is_academia_member(academia_id));

drop policy if exists "pagos_update" on public.pagos;
create policy "pagos_update"
  on public.pagos for update to authenticated
  using (public.is_academia_member(academia_id))
  with check (public.is_academia_member(academia_id));
