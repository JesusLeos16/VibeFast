/** Zona horaria de academias Kickiie (MVP). */
export const ACADEMIA_TZ = "America/Mexico_City"

/**
 * Fecha civil YYYY-MM-DD en la zona de la academia
 * (evita el “día UTC” del servidor de Vercel).
 */
export function fechaHoyAcademia(date = new Date(), timeZone = ACADEMIA_TZ) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date)
}

/** Hora corta en zona academia, p.ej. "9:25 p.m." */
export function formatHoraAcademia(isoOrDate, timeZone = ACADEMIA_TZ) {
  if (!isoOrDate) return ""
  const d = isoOrDate instanceof Date ? isoOrDate : new Date(isoOrDate)
  if (Number.isNaN(d.getTime())) return ""
  return d.toLocaleTimeString("es-MX", {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
  })
}
