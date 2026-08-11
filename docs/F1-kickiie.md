# Kickiie — Fase 1 (F1) Núcleo

**Estado:** Implementado en código (pendiente aplicar migración en Supabase)  
**Fecha:** 10 de agosto de 2026  
**Producto:** Kickiie (marca) · Primera academia: **Ronin Defense**

---

## 1. Qué es F1

La **Fase 1** es el núcleo operativo de Kickiie sin pagos ni kiosco:

- Multi-academia (tenancy aislado)
- Autenticación (Google vía Supabase, ya existente)
- Memberships: `admin` | `colaborador`
- Familias
- Tutores
- Alumnos (cintas Lima Lama, activo/inactivo)
- Historial básico de cambios de cinta

**Hito funcional F1:**  
Admin de Ronin inicia sesión → reclama academia (si es el primero) → crea familia + tutor + alumno → lista alumnos y puede inactivar/reactivar.

**Fuera de F1 (siguiente):**  
F2 pagos · F3 kiosco QR · F4 docs/PDF · F5 inactividad automática.

---

## 2. Decisiones de producto (esta fase)

| Tema | Decisión |
|------|----------|
| Backend | **Supabase** (no Firebase) |
| Curso vs producto | VibeFast/landing del curso se mantiene; F1 es producto Kickiie real |
| Registro de academias | Controlado: seed Ronin + claim del primer admin |
| Unidades administrativas | **Familia** agrupa tutores y alumnos |
| Cintas | Solo **Lima Lama** (ver §4) |
| Borrado | Preferir **inactivar** alumno; no hard-delete en flujo de UI F1 |
| Kiosco | Es parte de Kickiie, pero **F3** — no se construye en F1 |

---

## 3. Modelo de datos (migración `009_f1_kickiie_nucleo.sql`)

```
academias
  └── memberships (user_id, role)
  └── familias
        ├── tutores (es_principal opcional)
        └── alumnos (cinta, status, fecha_nacimiento, …)
              └── historial_cintas
```

### Tablas

- **academias** — `nombre`, `slug` único  
- **memberships** — `academia_id`, `user_id`, `role` (`admin` \| `colaborador`)  
- **familias** — `academia_id`, `nombre`, `notas`  
- **tutores** — `familia_id`, `nombre`, `telefono`, `email`, `relacion`, `es_principal`  
- **alumnos** — `academia_id`, `familia_id`, `nombre`, `fecha_nacimiento`, `cinta`, `telefono`, `notas`, `status` (`active` \| `inactive`)  
- **historial_cintas** — `alumno_id`, `cinta_antes`, `cinta_despues`, `changed_by`

### Legacy

Si existía la tabla plana `alumnos` (CRUD v0 con `user_id`), la migración la renombra a **`alumnos_v0_legacy`** y crea el nuevo `alumnos` F1.

### RLS

- Helper `is_academia_member(academia_id)` (SECURITY DEFINER)  
- Lectura/escritura de familias, tutores, alumnos solo si el usuario es miembro de la academia  
- Reclamo: insert en `memberships` si la academia **aún no tiene miembros** (primer admin)

### Seed

Inserta academia:

- Nombre: `Ronin Defense`  
- Slug: `ronin-defense`

---

## 4. Cintas Lima Lama

Código en app: [`web/lib/kickiie/cintas.js`](../web/lib/kickiie/cintas.js)

| Código | Label |
|--------|--------|
| blanca | Blanca |
| naranja | Naranja |
| morada | Morada |
| azul | Azul |
| verde_1 … verde_3 | Verde 1–3 |
| cafe_1 … cafe_3 | Café 1–3 |
| negra_1 … negra_8 | Negra 1–8 |

Edad del alumno: calculada en UI con `calcularEdad(fecha_nacimiento)`.

---

## 5. Archivos tocados / creados

### Base de datos
- `supabase/migrations/009_f1_kickiie_nucleo.sql` **(nuevo)**

### Librerías
- `web/lib/kickiie/cintas.js` **(nuevo)**
- `web/lib/kickiie/academy.js` **(nuevo)** — contexto de academia + `claimRoninAdmin`
- `web/lib/supabase/middleware.js` — protege `/familias`, `/alumnos`, `/setup`

### App (zona privada)
- `web/app/(app)/layout.js` — nav: Inicio · Familias · Alumnos  
- `web/app/(app)/dashboard/page.js` — resumen conteos F1  
- `web/app/(app)/dashboard/actions.js` — reexport F1  
- `web/app/(app)/setup/page.js` **(nuevo)** — reclamar Ronin  
- `web/app/(app)/familias/page.js` **(nuevo)** — lista + alta rápida  
- `web/app/(app)/familias/actions.js` **(nuevo)** — server actions  
- `web/app/(app)/familias/[id]/page.js` **(nuevo)** — detalle tutores/alumnos  
- `web/app/(app)/alumnos/page.js` **(nuevo)** — listado activos/inactivos  

### Tools AI (alineados a F1)
- `web/lib/tools/examples/crearAlumno.js`  
- `web/lib/tools/examples/buscarAlumnos.js`  

### Documentación
- Este archivo: `docs/F1-kickiie.md`

---

## 6. Rutas de la app F1

| URL | Uso |
|-----|-----|
| `/login` | Google Auth (existente) |
| `/setup` | Sin membership → reclamar Ronin Defense |
| `/dashboard` | Inicio / conteos |
| `/familias` | Lista + crear familia+tutor+alumno |
| `/familias/[id]` | Tutores, alumnos, editar, inactivar |
| `/alumnos` | Lista activos; `?estado=inactive` inactivos |

---

## 7. Cómo probar (checklist)

1. **Aplicar migración** (una de las dos):

```bash
# desde la raíz del repo, con proyecto linkeado
npx supabase db push
```

O pega el SQL de `009_f1_kickiie_nucleo.sql` en **Supabase → SQL Editor → Run**.

2. En Table Editor verifica tablas: `academias`, `memberships`, `familias`, `tutores`, `alumnos`, `historial_cintas`.  
3. Confirma fila **Ronin Defense** en `academias`.  
4. Local: `yarn dev` → `http://localhost:3000/login`  
5. Entra con Google.  
6. Si rediriges a `/setup`, pulsa **Soy admin de Ronin Defense**.  
7. Ve a **Familias** → alta rápida → guarda.  
8. Abre la familia, agrega un segundo tutor/alumno si quieres.  
9. En **Alumnos**, inactiva y reactiva.  

---

## 8. Limitaciones conocidas (aceptadas en F1)

- No hay invitación formal de colaboradores por email (solo claim del primer admin / insert manual en `memberships`).  
- No hay pagos, QR, kiosco ni PDF.  
- Un usuario con varias academias usa la primera membership (se amplía después).  
- Chat/Agente del boilerplate siguen en el repo pero fuera del nav F1.  

---

## 9. Siguiente fase (F2) — no implementada

Cuando F1 esté validada en Ronin:

1. Planes individual/familiar  
2. Registro de pagos (sin pasarela)  
3. Vencimientos y al corriente/vencido  
4. Cancelar pago con historial  

---

## 10. Comandos útiles

```bash
# migrar
npx supabase db push

# dev
yarn dev
# o puerto 3001:
yarn workspace web dev -- -p 3001
```

**Vincular membership manual** (SQL, si el claim no aplica):

```sql
insert into public.memberships (academia_id, user_id, role)
select a.id, p.id, 'admin'
from public.academias a
join public.profiles p on p.email = 'TU_EMAIL@gmail.com'
where a.slug = 'ronin-defense'
on conflict do nothing;
```
