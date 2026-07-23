# Napkin Runbook

## Curation Rules
- Re-prioritize on every read.
- Keep recurring, high-value notes only.
- Max 10 items per category.
- Each item includes date + "Do instead".

## Domain Behavior Guardrails
1. **[2026-07-20] Landing anti-slop: editorial, no cards SaaS**
   Do instead: headers a la izquierda; features sin chips pastel; bento sin pills; FAQ con líneas; CTA login rojo; waitlist secundario abajo. Brief visual llega por capturas → implementar sin reinventar.
2. **[2026-07-20] Kickiie = sistema primero; tarjeta = acceso**
   Do instead: hero y features venden gestión (asistencia, alumnos, familias); la credencial QR es diferenciador secundario. Landing: Hero → Features → Bento → Comparacion → FAQ.
3. **[2026-07-19] Dashboard = Alumnos (no core_items)**
   Do instead: tabla `alumnos` (migración `008_alumnos.sql`); UI en `/dashboard`; credencial PVC/PDF queda fuera hasta la siguiente iteración.
4. **[2026-07-10] Producto = Kickiie (artes marciales + QR)**
   Do instead: ICP = dueño/instructor de academia pequeña/mediana; dolor = pase de lista + visibilidad + papás; acento `#C92A2A`, base clara `#FAFAF7` / tinta `#18181B`.

## User Directives
1. **[2026-07-20] CTAs fuertes → `/login`; waitlist solo al final**
   Do instead: nav/hero/finalCta a login; formulario waitlist secundario (“Avisarme”), no confundir con Entrar.
2. **[2026-07-20] Nav en español + Login visible en móvil**
   Do instead: labels ES; un solo CTA primario “Entrar a Kickiie”; sticky nav más bajo.
3. **[2026-07-19] Waitlist del curso: flag en config**
   Do instead: `features.waitlist: true`; sección al final de `page.js`.
4. **[2026-07-10] Sin sección “Regla de Oro” en landing**
   Do instead: no montar `ReglaDeOro` ni links a `#card`.

## Shell & Command Reliability
1. **[2026-07-19] `NEXT_PUBLIC_SUPABASE_URL` sin `/rest/v1/` ni espacio tras `=`**
   Do instead: usar `https://<project-ref>.supabase.co` (Project URL del dashboard), no la URL REST.
2. **[2026-07-19] Migrar schema remoto con `supabase db push`**
   Do instead: desde la raíz del repo, con proyecto linkeado: `npx supabase db push` (o pegar el SQL de `008_alumnos.sql` en SQL Editor).
