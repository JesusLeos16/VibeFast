-- ============================================================
-- 012 · Kickiie F4 — Expediente, contactos, documentos
-- ============================================================

alter table public.alumnos
  add column if not exists info_medica text,
  add column if not exists seguro text;

create table if not exists public.contactos_emergencia (
  id           uuid primary key default gen_random_uuid(),
  alumno_id    uuid not null references public.alumnos (id) on delete cascade,
  nombre       text not null,
  telefono     text,
  relacion     text,
  created_at   timestamptz not null default now()
);

create index if not exists contactos_emergencia_alumno_idx
  on public.contactos_emergencia (alumno_id);

create table if not exists public.documentos (
  id            uuid primary key default gen_random_uuid(),
  academia_id   uuid not null references public.academias (id) on delete cascade,
  alumno_id     uuid not null references public.alumnos (id) on delete cascade,
  tipo          text not null
                  check (tipo in ('responsiva','consentimiento','privacidad','otro')),
  estado        text not null default 'pendiente'
                  check (estado in ('pendiente','generado','firmado')),
  file_path     text,
  notas         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists documentos_alumno_idx on public.documentos (alumno_id);

drop trigger if exists documentos_set_updated_at on public.documentos;
create trigger documentos_set_updated_at
  before update on public.documentos
  for each row execute function public.set_updated_at();

-- Helper: alumno → academia
create or replace function public.alumno_academia_id(p_alumno_id uuid)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select a.academia_id from public.alumnos a where a.id = p_alumno_id;
$$;

alter table public.contactos_emergencia enable row level security;
alter table public.documentos enable row level security;

drop policy if exists "contactos_select" on public.contactos_emergencia;
create policy "contactos_select"
  on public.contactos_emergencia for select to authenticated
  using (public.is_academia_member(public.alumno_academia_id(alumno_id)));

drop policy if exists "contactos_insert" on public.contactos_emergencia;
create policy "contactos_insert"
  on public.contactos_emergencia for insert to authenticated
  with check (public.is_academia_member(public.alumno_academia_id(alumno_id)));

drop policy if exists "contactos_update" on public.contactos_emergencia;
create policy "contactos_update"
  on public.contactos_emergencia for update to authenticated
  using (public.is_academia_member(public.alumno_academia_id(alumno_id)))
  with check (public.is_academia_member(public.alumno_academia_id(alumno_id)));

drop policy if exists "contactos_delete" on public.contactos_emergencia;
create policy "contactos_delete"
  on public.contactos_emergencia for delete to authenticated
  using (public.is_academia_member(public.alumno_academia_id(alumno_id)));

drop policy if exists "documentos_select" on public.documentos;
create policy "documentos_select"
  on public.documentos for select to authenticated
  using (public.is_academia_member(academia_id));

drop policy if exists "documentos_insert" on public.documentos;
create policy "documentos_insert"
  on public.documentos for insert to authenticated
  with check (public.is_academia_member(academia_id));

drop policy if exists "documentos_update" on public.documentos;
create policy "documentos_update"
  on public.documentos for update to authenticated
  using (public.is_academia_member(academia_id))
  with check (public.is_academia_member(academia_id));

drop policy if exists "documentos_delete" on public.documentos;
create policy "documentos_delete"
  on public.documentos for delete to authenticated
  using (public.is_academia_member(academia_id));

-- Storage bucket (privado). Políticas vía storage.objects
insert into storage.buckets (id, name, public)
values ('documentos-firmados', 'documentos-firmados', false)
on conflict (id) do nothing;

drop policy if exists "docs_storage_select" on storage.objects;
create policy "docs_storage_select"
  on storage.objects for select to authenticated
  using (bucket_id = 'documentos-firmados');

drop policy if exists "docs_storage_insert" on storage.objects;
create policy "docs_storage_insert"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'documentos-firmados');

drop policy if exists "docs_storage_update" on storage.objects;
create policy "docs_storage_update"
  on storage.objects for update to authenticated
  using (bucket_id = 'documentos-firmados');

drop policy if exists "docs_storage_delete" on storage.objects;
create policy "docs_storage_delete"
  on storage.objects for delete to authenticated
  using (bucket_id = 'documentos-firmados');
