-- ============================================================
-- 014 · Kickiie AI · Seguimientos
-- ------------------------------------------------------------
-- Semana 4: la IA puede proponer un seguimiento y, después de
-- una confirmación explícita, una tool controlada lo registra.
-- La fecha se conserva como texto porque una nota puede decir
-- "el 28" sin indicar todavía mes o año.
-- ============================================================

create table if not exists public.seguimientos (
  id                uuid primary key default gen_random_uuid(),
  academia_id       uuid not null references public.academias (id) on delete cascade,
  alumno_id         uuid not null references public.alumnos (id) on delete cascade,
  tipo              text not null
                     check (tipo in ('absence','payment','medical','document','event','general')),
  resumen           text not null check (char_length(resumen) between 1 and 1200),
  fecha_retorno     text,
  prioridad         text not null default 'normal'
                     check (prioridad in ('low','normal','high')),
  accion_sugerida   text not null default 'crear_seguimiento'
                     check (accion_sugerida in (
                       'crear_seguimiento',
                       'revisar_pago',
                       'revisar_documento',
                       'contactar_tutor',
                       'revisar_manualmente',
                       'sin_accion'
                     )),
  nota_original     text check (nota_original is null or char_length(nota_original) <= 2000),
  origen            text not null default 'manual'
                     check (origen in ('manual','kickiie_ai')),
  status            text not null default 'pendiente'
                     check (status in ('pendiente','resuelto','cancelado')),
  idempotency_key   uuid,
  registrado_por    uuid references auth.users (id) on delete set null,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

comment on table public.seguimientos is
  'Notas y seguimientos administrativos por alumno. Las escrituras de IA pasan por confirmación y tool controlada.';

create index if not exists seguimientos_academia_created_idx
  on public.seguimientos (academia_id, created_at desc);
create index if not exists seguimientos_alumno_status_idx
  on public.seguimientos (alumno_id, status, created_at desc);
create unique index if not exists seguimientos_idempotency_idx
  on public.seguimientos (academia_id, idempotency_key)
  where idempotency_key is not null;

drop trigger if exists seguimientos_set_updated_at on public.seguimientos;
create trigger seguimientos_set_updated_at
  before update on public.seguimientos
  for each row execute function public.set_updated_at();

alter table public.seguimientos enable row level security;

drop policy if exists "seguimientos_select" on public.seguimientos;
create policy "seguimientos_select"
  on public.seguimientos for select to authenticated
  using (public.is_academia_member(academia_id));

drop policy if exists "seguimientos_insert" on public.seguimientos;
create policy "seguimientos_insert"
  on public.seguimientos for insert to authenticated
  with check (public.is_academia_member(academia_id));

drop policy if exists "seguimientos_update" on public.seguimientos;
create policy "seguimientos_update"
  on public.seguimientos for update to authenticated
  using (public.is_academia_member(academia_id))
  with check (public.is_academia_member(academia_id));
