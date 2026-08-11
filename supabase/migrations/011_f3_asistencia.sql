-- ============================================================
-- 011 · Kickiie F3 — Asistencia y QR fijo
-- ============================================================

alter table public.alumnos
  add column if not exists qr_token uuid unique default gen_random_uuid();

update public.alumnos set qr_token = gen_random_uuid() where qr_token is null;

alter table public.alumnos
  alter column qr_token set not null,
  alter column qr_token set default gen_random_uuid();

create table if not exists public.asistencias (
  id              uuid primary key default gen_random_uuid(),
  academia_id     uuid not null references public.academias (id) on delete cascade,
  alumno_id       uuid not null references public.alumnos (id) on delete cascade,
  fecha           date not null,
  scanned_at      timestamptz not null default now(),
  origen          text not null default 'qr'
                    check (origen in ('qr','manual')),
  registrado_por  uuid references auth.users (id) on delete set null,
  unique (alumno_id, fecha)
);

create index if not exists asistencias_academia_fecha_idx
  on public.asistencias (academia_id, fecha desc);
create index if not exists asistencias_alumno_id_idx
  on public.asistencias (alumno_id, fecha desc);

alter table public.asistencias enable row level security;

drop policy if exists "asistencias_select" on public.asistencias;
create policy "asistencias_select"
  on public.asistencias for select to authenticated
  using (public.is_academia_member(academia_id));

drop policy if exists "asistencias_insert" on public.asistencias;
create policy "asistencias_insert"
  on public.asistencias for insert to authenticated
  with check (public.is_academia_member(academia_id));
