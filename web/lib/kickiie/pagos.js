/**
 * Plan familiar mensual Ronin (defaults).
 * 1 alumno = precio_base; cada adicional = precio_adicional.
 */

export function calcularMontoEsperado(nAlumnosActivos, config = {}) {
  const base = Number(config.precio_base ?? 400)
  const adicional = Number(config.precio_adicional ?? 300)
  const n = Math.max(0, Number(nAlumnosActivos) || 0)
  if (n === 0) return 0
  return base + adicional * (n - 1)
}

/** Parse YYYY-MM-DD as local date. */
export function parseDate(value) {
  if (!value) return null
  if (value instanceof Date) return value
  const [y, m, d] = String(value).slice(0, 10).split("-").map(Number)
  if (!y || !m || !d) return null
  return new Date(y, m - 1, d)
}

export function formatDateISO(date) {
  if (!date) return null
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

export function addMonths(date, months) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  d.setMonth(d.getMonth() + months)
  return d
}

/**
 * Reglas doc Kickiie:
 * - si vencido o sin fecha: nuevo periodo desde fechaPago
 * - si al corriente: suma periodos al vencimiento actual
 */
export function calcularNuevoVencimiento({
  vencimientoActual,
  fechaPago,
  periodos = 1,
}) {
  const pago = parseDate(fechaPago) || new Date()
  const p = Math.max(1, Number(periodos) || 1)
  const actual = parseDate(vencimientoActual)
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  pago.setHours(0, 0, 0, 0)

  let inicioBase
  if (!actual || actual < pago || actual < hoy) {
    inicioBase = pago
  } else {
    inicioBase = actual
  }

  const fin = addMonths(inicioBase, p)
  return {
    periodo_inicio: formatDateISO(inicioBase),
    periodo_fin: formatDateISO(fin),
    fecha_vencimiento: formatDateISO(fin),
  }
}

/** al_corriente | vencido | sin_pago */
export function estadoFinanciero(fechaVencimiento, today = new Date()) {
  const v = parseDate(fechaVencimiento)
  if (!v) return "sin_pago"
  const t = new Date(today)
  t.setHours(0, 0, 0, 0)
  v.setHours(0, 0, 0, 0)
  // Vencido desde el día siguiente al vencimiento
  if (t > v) return "vencido"
  return "al_corriente"
}

export function labelEstadoFinanciero(estado) {
  if (estado === "al_corriente") return "Al corriente"
  if (estado === "vencido") return "Vencido"
  return "Sin pago"
}

export const METODOS_PAGO = [
  { value: "efectivo", label: "Efectivo" },
  { value: "transferencia", label: "Transferencia" },
  { value: "terminal", label: "Terminal" },
  { value: "mercadopago", label: "Mercado Pago" },
  { value: "otro", label: "Otro" },
]
