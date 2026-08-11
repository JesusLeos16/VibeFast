# Kickiie — Fases 2 a 5 (F2–F5)

**Estado:** Implementado en código  
**Fecha:** 10 de agosto de 2026  
**Producto:** Kickiie · Primera academia: **Ronin Defense**  
**Base:** [F1 Núcleo](./F1-kickiie.md)

---

## 1. Alcance

| Fase | Qué incluye |
|------|-------------|
| **F2** | Plan familiar mensual, registro de pagos, vencimiento, badges vencido / al corriente |
| **F3** | QR fijo por alumno, kiosco cámara, 1 asistencia/día, registro manual |
| **F4** | Expediente médico, contactos emergencia, docs + Storage, PDF credencial 85×55 mm, responsiva carta |
| **F5** | `eventos_historial`, cron inactividad 60 días, botón admin de fallback |

**Fuera de este epic:** portal padres, pasarela de pagos, WhatsApp, torneos, multi-academia UI avanzada.

---

## 2. Decisiones de producto

| Tema | Decisión |
|------|----------|
| Plan familiar | **$400** base + **$300** por alumno activo adicional (mensual, MXN) |
| Override de monto | Manual en cada pago |
| Cancelación de pago | Solo `status = cancelado` (no hard-delete) |
| Credencial PDF | **85 × 55 mm** en hoja carta (una cara) |
| Responsiva | Carta, textos **placeholder** legales |
| QR | UUID fijo en `alumnos.qr_token` (no rotar) |
| Deuda en kiosco | **Never** al alumno; badge solo staff |
| Inactivo en scan | No marca asistencia; staff debe reactivar |
| Zona horaria asistencia | Fecha local del servidor al escanear (staff en MX) |
| Cron | `GET /api/cron/inactividad` + `CRON_SECRET` · fallback admin en dashboard |

---

## 3. Migraciones

| Archivo | Contenido |
|---------|-----------|
| `010_f2_pagos.sql` | `academia_plan_config`, `pagos`, `familias.fecha_vencimiento`, seed Ronin 400/300 |
| `011_f3_asistencia.sql` | `alumnos.qr_token`, `asistencias` unique `(alumno_id, fecha)` |
| `012_f4_expediente.sql` | médico, `contactos_emergencia`, `documentos`, bucket `documentos-firmados` |
| `013_f5_eventos.sql` | `eventos_historial` |

Aplicar:

```bash
npx supabase db push
```

En prod: Storage habilitado; `CRON_SECRET` y opcionalmente `SUPABASE_SERVICE_ROLE_KEY` para el cron.

---

## 4. Rutas

| Ruta | Fase |
|------|------|
| `/pagos` | F2 historial + filtros |
| `/familias/[id]` | F2 form pago + badge estado |
| `/kiosco` | F3 fullscreen cámara |
| `/asistencias` | F3 lista del día + manual |
| `/alumnos/[id]` | F4 expediente |
| `/api/credenciales/[id]` | F4 PDF |
| `/api/responsiva/[id]` | F4 PDF placeholder |
| `/api/cron/inactividad` | F5 |

Nav app: Inicio · Familias · Alumnos · Pagos · Asistencias · Kiosco

---

## 5. Lógica de dominio

### Pagos (`web/lib/kickiie/pagos.js`)

- `calcularMontoEsperado(nActivos, config)`
- `calcularNuevoVencimiento({ vencimientoActual, fechaPago, periodos })`
  - si vencido / sin fecha / anterior a pago → base = fechaPago
  - si al corriente → suma meses al vencimiento actual
- `estadoFinanciero` → `al_corriente` \| `vencido` \| `sin_pago` (vencido desde el día siguiente)

### Asistencia (`web/lib/kickiie/asistencia.js`)

- Lookup por `qr_token` o `alumno_id`
- Bloqueo si `inactive`
- Unique por día; respuesta `already` sin re-insert
- `staffNotice` por cuenta vencida / sin pago

### Eventos (`web/lib/kickiie/eventos.js`)

Tipos usados: `pago_registrado`, `pago_cancelado`, `cinta`, `status_alumno`, `asistencia`, `documento_firmado`

---

## 6. Dependencias nuevas (workspace `web`)

- `pdf-lib` — PDFs
- `qrcode` — payload QR en credencial
- `html5-qrcode` — kiosco cámara

---

## 7. Variables de entorno

| Variable | Uso |
|----------|-----|
| `CRON_SECRET` | Auth del cron diario |
| `SUPABASE_SERVICE_ROLE_KEY` | Cron sin sesión de usuario |
| `NEXT_PUBLIC_SUPABASE_URL` | Ya existente |
| `NEXT_PUBLIC_APP_URL` | OAuth / links; en local usar localhost en redirect Supabase |

`web/vercel.json` agenda el cron a las 08:00 UTC (`0 8 * * *`).

---

## 8. Checklist de prueba E2E manual

1. [ ] Login Google → membership Ronin  
2. [ ] Crear familia + alumno  
3. [ ] Registrar pago familiar (sugerido / override) → vence al corriente  
4. [ ] Cancelar pago en historial  
5. [ ] Abrir kiosco, escanear QR de credencial PDF (o pegar token)  
6. [ ] Segundo scan mismo día → “Ya registrado”  
7. [ ] Alumno inactivo no entra; reactivar y reintentar  
8. [ ] Staff ve aviso de vencido; pantalla principal del kiosco no habla de deuda al alumno  
9. [ ] Expediente: médico, contacto, subir responsiva firmada  
10. [ ] Descargar PDF credencial 85×55 y responsiva carta  
11. [ ] Admin: “Ejecutar chequeo” inactividad (o cron con secret)  

---

## 9. Criterio de listo

- Ronin registra familia, pago, ve vencido / al corriente  
- Kiosco 1 asistencia/día + confirmación + aviso staff  
- PDF reimprimible con mismo `qr_token`  
- Responsiva firmada en Storage + flag expediente  
- 60 días sin asistencia → inactive (cron o botón admin)
