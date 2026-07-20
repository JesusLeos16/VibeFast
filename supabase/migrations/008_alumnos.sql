-- ============================================================
-- 008 · alumnos (Kickiie)
-- ------------------------------------------------------------
-- Reemplaza el CRUD genérico de core_items por alumnos de la
-- academia. Cada instructor/dueño (auth.users) solo ve los suyos.
-- Credenciales PVC / PDF quedan para una migración posterior.
-- ============================================================

create table if not exists public.alumnos (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  nombre       text not null,
  grado        text not null default 'Cinturón blanco',
  grupo        text,
  email_tutor  text,
  notas        text,
  status       text not null default 'active', -- active | inactive
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

comment on table public.alumnos is
  'Alumnos de la academia Kickiie. Pertenece al instructor logueado (user_id).';

create index if not exists alumnos_user_id_idx
  on public.alumnos (user_id, created_at desc);

drop trigger if exists alumnos_set_updated_at on public.alumnos;
create trigger alumnos_set_updated_at
  before update on public.alumnos
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- RLS
-- ------------------------------------------------------------
alter table public.alumnos enable row level security;

drop policy if exists "alumnos_select_own" on public.alumnos;
create policy "alumnos_select_own"
  on public.alumnos for select
  using (auth.uid() = user_id);

drop policy if exists "alumnos_insert_own" on public.alumnos;
create policy "alumnos_insert_own"
  on public.alumnos for insert
  with check (auth.uid() = user_id);

drop policy if exists "alumnos_update_own" on public.alumnos;
create policy "alumnos_update_own"
  on public.alumnos for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "alumnos_delete_own" on public.alumnos;
create policy "alumnos_delete_own"
  on public.alumnos for delete
  using (auth.uid() = user_id);
