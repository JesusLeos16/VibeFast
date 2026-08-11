-- ============================================================
-- 009 · Kickiie F1 — Núcleo multi-academia
-- ------------------------------------------------------------
-- Entidades: academias, memberships, familias, tutores, alumnos
-- (+ historial de cintas). Aísla datos por academia (RLS).
--
-- La tabla legacy `alumnos` (user_id flat) se renombra a
-- alumnos_v0_legacy para no chocar con el modelo F1.
-- ============================================================

-- ------------------------------------------------------------
-- Legacy: renombrar CRUD v0 (si existe)
-- ------------------------------------------------------------
do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'alumnos'
  ) and not exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'alumnos_v0_legacy'
  ) then
    -- solo renombrar si aún es el schema v0 (columna user_id sin academia_id)
    if exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'alumnos' and column_name = 'user_id'
    ) and not exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'alumnos' and column_name = 'academia_id'
    ) then
      alter table public.alumnos rename to alumnos_v0_legacy;
      -- policies viejas quedan en la tabla renombrada; se ignoran
    end if;
  end if;
end $$;

-- ------------------------------------------------------------
-- academias
-- ------------------------------------------------------------
create table if not exists public.academias (
  id          uuid primary key default gen_random_uuid(),
  nombre      text not null,
  slug        text not null unique,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.academias is 'Academia / dojo Kickiie. Unidad de tenancy.';

drop trigger if exists academias_set_updated_at on public.academias;
create trigger academias_set_updated_at
  before update on public.academias
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- memberships (admin | colaborador)
-- ------------------------------------------------------------
create table if not exists public.memberships (
  id           uuid primary key default gen_random_uuid(),
  academia_id  uuid not null references public.academias (id) on delete cascade,
  user_id      uuid not null references auth.users (id) on delete cascade,
  role         text not null default 'colaborador'
                 check (role in ('admin', 'colaborador')),
  created_at   timestamptz not null default now(),
  unique (academia_id, user_id)
);

comment on table public.memberships is 'Usuarios vinculados a una academia (admin o colaborador).';

create index if not exists memberships_user_id_idx on public.memberships (user_id);
create index if not exists memberships_academia_id_idx on public.memberships (academia_id);

-- ------------------------------------------------------------
-- Helper RLS: ¿el usuario pertenece a esta academia?
-- SECURITY DEFINER evita recursión al leer memberships.
-- ------------------------------------------------------------
create or replace function public.is_academia_member(p_academia_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.memberships m
    where m.academia_id = p_academia_id
      and m.user_id = auth.uid()
  );
$$;

-- ------------------------------------------------------------
-- familias
-- ------------------------------------------------------------
create table if not exists public.familias (
  id           uuid primary key default gen_random_uuid(),
  academia_id  uuid not null references public.academias (id) on delete cascade,
  nombre       text not null,
  notas        text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

comment on table public.familias is 'Unidad administrativa Kickiie F1. Agrupa tutores y alumnos.';

create index if not exists familias_academia_id_idx
  on public.familias (academia_id, created_at desc);

drop trigger if exists familias_set_updated_at on public.familias;
create trigger familias_set_updated_at
  before update on public.familias
  for each row execute function public.set_updated_at();

-- Helper RLS (después de crear familias)
create or replace function public.familia_academia_id(p_familia_id uuid)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select f.academia_id from public.familias f where f.id = p_familia_id;
$$;

-- ------------------------------------------------------------
-- tutores
-- ------------------------------------------------------------
create table if not exists public.tutores (
  id             uuid primary key default gen_random_uuid(),
  familia_id     uuid not null references public.familias (id) on delete cascade,
  nombre         text not null,
  telefono       text,
  email          text,
  relacion       text,
  es_principal   boolean not null default false,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

comment on table public.tutores is 'Contactos / tutores de una familia. es_principal es solo referencia.';

create index if not exists tutores_familia_id_idx on public.tutores (familia_id);

drop trigger if exists tutores_set_updated_at on public.tutores;
create trigger tutores_set_updated_at
  before update on public.tutores
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- alumnos (F1)
-- ------------------------------------------------------------
create table if not exists public.alumnos (
  id                 uuid primary key default gen_random_uuid(),
  academia_id        uuid not null references public.academias (id) on delete cascade,
  familia_id         uuid not null references public.familias (id) on delete cascade,
  nombre             text not null,
  fecha_nacimiento   date,
  cinta              text not null default 'blanca',
  telefono           text,
  notas              text,
  status             text not null default 'active'
                       check (status in ('active', 'inactive')),
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

comment on table public.alumnos is 'Alumnos de la academia. Cintas Lima Lama. status active|inactive.';

create index if not exists alumnos_academia_id_idx
  on public.alumnos (academia_id, status, created_at desc);
create index if not exists alumnos_familia_id_idx on public.alumnos (familia_id);

drop trigger if exists alumnos_set_updated_at on public.alumnos;
create trigger alumnos_set_updated_at
  before update on public.alumnos
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- historial_cintas
-- ------------------------------------------------------------
create table if not exists public.historial_cintas (
  id           uuid primary key default gen_random_uuid(),
  alumno_id    uuid not null references public.alumnos (id) on delete cascade,
  cinta_antes  text,
  cinta_despues text not null,
  changed_by   uuid references auth.users (id) on delete set null,
  created_at   timestamptz not null default now()
);

create index if not exists historial_cintas_alumno_id_idx
  on public.historial_cintas (alumno_id, created_at desc);

-- ------------------------------------------------------------
-- Seed: academia Ronin Defense (sin membership — se reclama en app)
-- ------------------------------------------------------------
insert into public.academias (nombre, slug)
values ('Ronin Defense', 'ronin-defense')
on conflict (slug) do nothing;

-- ------------------------------------------------------------
-- RLS
-- ------------------------------------------------------------
alter table public.academias enable row level security;
alter table public.memberships enable row level security;
alter table public.familias enable row level security;
alter table public.tutores enable row level security;
alter table public.alumnos enable row level security;
alter table public.historial_cintas enable row level security;

-- academias: miembros ven su academia; cualquiera autenticado puede listar
-- academias sin miembros (para reclamar la primera) vía claim en app
drop policy if exists "academias_select_member" on public.academias;
create policy "academias_select_member"
  on public.academias for select
  to authenticated
  using (
    public.is_academia_member(id)
    or not exists (select 1 from public.memberships m where m.academia_id = id)
  );

-- memberships
drop policy if exists "memberships_select_own" on public.memberships;
create policy "memberships_select_own"
  on public.memberships for select
  to authenticated
  using (user_id = auth.uid() or public.is_academia_member(academia_id));

drop policy if exists "memberships_insert_claim" on public.memberships;
create policy "memberships_insert_claim"
  on public.memberships for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and (
      -- reclamar academia sin miembros (primer admin)
      not exists (
        select 1 from public.memberships m where m.academia_id = memberships.academia_id
      )
      or public.is_academia_member(academia_id)
    )
  );

-- familias
drop policy if exists "familias_select" on public.familias;
create policy "familias_select"
  on public.familias for select
  to authenticated
  using (public.is_academia_member(academia_id));

drop policy if exists "familias_insert" on public.familias;
create policy "familias_insert"
  on public.familias for insert
  to authenticated
  with check (public.is_academia_member(academia_id));

drop policy if exists "familias_update" on public.familias;
create policy "familias_update"
  on public.familias for update
  to authenticated
  using (public.is_academia_member(academia_id))
  with check (public.is_academia_member(academia_id));

drop policy if exists "familias_delete" on public.familias;
create policy "familias_delete"
  on public.familias for delete
  to authenticated
  using (public.is_academia_member(academia_id));

-- tutores (vía familia → academia)
drop policy if exists "tutores_select" on public.tutores;
create policy "tutores_select"
  on public.tutores for select
  to authenticated
  using (public.is_academia_member(public.familia_academia_id(familia_id)));

drop policy if exists "tutores_insert" on public.tutores;
create policy "tutores_insert"
  on public.tutores for insert
  to authenticated
  with check (public.is_academia_member(public.familia_academia_id(familia_id)));

drop policy if exists "tutores_update" on public.tutores;
create policy "tutores_update"
  on public.tutores for update
  to authenticated
  using (public.is_academia_member(public.familia_academia_id(familia_id)))
  with check (public.is_academia_member(public.familia_academia_id(familia_id)));

drop policy if exists "tutores_delete" on public.tutores;
create policy "tutores_delete"
  on public.tutores for delete
  to authenticated
  using (public.is_academia_member(public.familia_academia_id(familia_id)));

-- alumnos
drop policy if exists "alumnos_select" on public.alumnos;
create policy "alumnos_select"
  on public.alumnos for select
  to authenticated
  using (public.is_academia_member(academia_id));

drop policy if exists "alumnos_insert" on public.alumnos;
create policy "alumnos_insert"
  on public.alumnos for insert
  to authenticated
  with check (public.is_academia_member(academia_id));

drop policy if exists "alumnos_update" on public.alumnos;
create policy "alumnos_update"
  on public.alumnos for update
  to authenticated
  using (public.is_academia_member(academia_id))
  with check (public.is_academia_member(academia_id));

-- F1: no hard-delete preferido; permitimos update status. delete solo para error de captura temprana
drop policy if exists "alumnos_delete" on public.alumnos;
create policy "alumnos_delete"
  on public.alumnos for delete
  to authenticated
  using (public.is_academia_member(academia_id));

-- historial_cintas
drop policy if exists "historial_cintas_select" on public.historial_cintas;
create policy "historial_cintas_select"
  on public.historial_cintas for select
  to authenticated
  using (
    exists (
      select 1 from public.alumnos a
      where a.id = alumno_id and public.is_academia_member(a.academia_id)
    )
  );

drop policy if exists "historial_cintas_insert" on public.historial_cintas;
create policy "historial_cintas_insert"
  on public.historial_cintas for insert
  to authenticated
  with check (
    exists (
      select 1 from public.alumnos a
      where a.id = alumno_id and public.is_academia_member(a.academia_id)
    )
  );
