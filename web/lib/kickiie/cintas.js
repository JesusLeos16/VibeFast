// Cintas Lima Lama — catálogo Kickiie F1
// Códigos estables en DB; labels en UI.

export const CINTAS_LIMA_LAMA = [
  { code: "blanca", label: "Blanca" },
  { code: "naranja", label: "Naranja" },
  { code: "morada", label: "Morada" },
  { code: "azul", label: "Azul" },
  { code: "verde_1", label: "Verde 1" },
  { code: "verde_2", label: "Verde 2" },
  { code: "verde_3", label: "Verde 3" },
  { code: "cafe_1", label: "Café 1" },
  { code: "cafe_2", label: "Café 2" },
  { code: "cafe_3", label: "Café 3" },
  { code: "negra_1", label: "Negra 1" },
  { code: "negra_2", label: "Negra 2" },
  { code: "negra_3", label: "Negra 3" },
  { code: "negra_4", label: "Negra 4" },
  { code: "negra_5", label: "Negra 5" },
  { code: "negra_6", label: "Negra 6" },
  { code: "negra_7", label: "Negra 7" },
  { code: "negra_8", label: "Negra 8" },
]

const byCode = Object.fromEntries(CINTAS_LIMA_LAMA.map((c) => [c.code, c.label]))

export function cintaLabel(code) {
  return byCode[code] || code || "—"
}

export function isValidCinta(code) {
  return Boolean(byCode[code])
}

/** Edad en años a partir de fecha YYYY-MM-DD o Date. */
export function calcularEdad(fechaNacimiento) {
  if (!fechaNacimiento) return null
  const d = typeof fechaNacimiento === "string"
    ? new Date(fechaNacimiento + "T00:00:00")
    : new Date(fechaNacimiento)
  if (Number.isNaN(d.getTime())) return null
  const hoy = new Date()
  let edad = hoy.getFullYear() - d.getFullYear()
  const m = hoy.getMonth() - d.getMonth()
  if (m < 0 || (m === 0 && hoy.getDate() < d.getDate())) edad -= 1
  return edad
}
