-- ============================================================
-- 013 · Kickiie F5 — Eventos e inactividad
-- ============================================================

create table if not exists public.eventos_historial (
  id            uuid primary key default gen_random_uuid(),
  academia_id   uuid not null references public.academias (id) on delete cascade,
  entity_type   text not null,
  entity_id     uuid,
  tipo          text not null,
  actor_id      uuid references auth.users (id) on delete set null,
  meta          jsonb not null default '{}'::jsonb,
  created_at    timestamptz not null default now()
);

create index if not exists eventos_historial_academia_idx
  on public.eventos_historial (academia_id, created_at desc);

alter table public.eventos_historial enable row level security;

drop policy if exists "eventos_select" on public.eventos_historial;
create policy "eventos_select"
  on public.eventos_historial for select to authenticated
  using (public.is_academia_member(academia_id));

drop policy if exists "eventos_insert" on public.eventos_historial;
create policy "eventos_insert"
  on public.eventos_historial for insert to authenticated
  with check (public.is_academia_member(academia_id));
