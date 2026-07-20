# Napkin Runbook

## Curation Rules
- Re-prioritize on every read.
- Keep recurring, high-value notes only.
- Max 10 items per category.
- Each item includes date + "Do instead".

## Domain Behavior Guardrails
1. **[2026-07-19] Dashboard = Alumnos (no core_items)**
   Do instead: tabla `alumnos` (migración `008_alumnos.sql`); UI en `/dashboard`; credencial PVC/PDF queda fuera hasta la siguiente iteración.
2. **[2026-07-10] Producto = Kickiie (artes marciales + QR)**
   Do instead: ICP = dueño/instructor de academia pequeña/mediana; dolor = pase de lista + visibilidad + papás; acento `#C92A2A`, base clara `#FAFAF7` / tinta `#18181B`. Editar copy en `web/config.js` sin romper la forma del objeto.

## User Directives
1. **[2026-07-19] Waitlist del curso: flag en config**
   Do instead: para el checklist Semana 1, `features.waitlist: true`; la sección ya está en `page.js` detrás del flag. Verificar fila en Table Editor → `waitlist`.
2. **[2026-07-10] Sin sección “Regla de Oro” en landing**
   Do instead: no montar `ReglaDeOro` ni links a `#card`; el quote cliché no va en la home.
3. **[2026-07-10] `web/config.js` es la fuente de copy de landing**
   Do instead: al cambiar marca/hero/features/faq, actualizar solo los campos pedidos y devolver/preservar la estructura completa del objeto `config`.

## Shell & Command Reliability
1. **[2026-07-19] `NEXT_PUBLIC_SUPABASE_URL` sin `/rest/v1/` ni espacio tras `=`**
   Do instead: usar `https://<project-ref>.supabase.co` (Project URL del dashboard), no la URL REST.
2. **[2026-07-19] Migrar schema remoto con `supabase db push`**
   Do instead: desde la raíz del repo, con proyecto linkeado: `npx supabase db push` (o pegar el SQL de `008_alumnos.sql` en SQL Editor).
