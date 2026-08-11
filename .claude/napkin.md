# Napkin Runbook

## Curation Rules
- Re-prioritize on every read.
- Keep recurring, high-value notes only.
- Max 10 items per category.
- Each item includes date + "Do instead".

## Domain Behavior Guardrails
1. **[2026-08-10] Kickiie F1 = multi-academia Supabase + familia**
   Do instead: schema 009; tablas academias/memberships/familias/tutores/alumnos; cintas Lima Lama en `lib/kickiie/cintas.js`; no Firebase. Doc: `docs/F1-kickiie.md`. F2+ pagos/kiosco después.
2. **[2026-07-20] Landing anti-slop: editorial, no cards SaaS**
   Do instead: headers a la izquierda; CTA login; waitlist secundario; hero `hero-dojo.png`.
3. **[2026-07-20] Kickiie = sistema primero; tarjeta = acceso**
   Do instead: vender gestión; QR/kiosco es F3 del producto, no del curso aparte.
4. **[2026-07-19] Dashboard F1: Inicio / Familias / Alumnos**
   Do instead: no volver al CRUD flat `user_id` en alumnos (legacy = `alumnos_v0_legacy`).

## User Directives
1. **[2026-08-10] Fases Kickiie en orden: F1 → F2 → F3…**
   Do instead: no implementar pagos/kiosco hasta cerrar F1. Doc de fase actual en `docs/F1-kickiie.md`.
2. **[2026-07-20] CTAs fuertes → `/login`; waitlist solo al final**
   Do instead: nav/hero/finalCta a login; waitlist “Avisarme”.
3. **[2026-07-19] Waitlist del curso: flag en config**
   Do instead: `features.waitlist: true`.

## Shell & Command Reliability
1. **[2026-07-19] `NEXT_PUBLIC_SUPABASE_URL` sin `/rest/v1/` ni espacio tras `=`**
   Do instead: usar `https://<project-ref>.supabase.co` (Project URL del dashboard), no la URL REST.
2. **[2026-07-19] Migrar schema remoto con `supabase db push`**
   Do instead: desde la raíz del repo, con proyecto linkeado: `npx supabase db push` (o pegar el SQL de `008_alumnos.sql` en SQL Editor).
