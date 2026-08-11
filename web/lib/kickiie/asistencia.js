import { estadoFinanciero } from "./pagos"
import { cintaLabel } from "./cintas"

/**
 * Registra asistencia 1/día. No expone deuda al alumno.
 * @returns {{ ok, code, alumno?, asistencia?, staffNotice? }}
 */
export async function registrarAsistencia(
  supabase,
  {
    academiaId,
    alumnoId = null,
    qrToken = null,
    origen = "qr",
    userId = null,
  }
) {
  let alumno = null

  if (qrToken) {
    const { data } = await supabase
      .from("alumnos")
      .select(
        "id, nombre, cinta, status, academia_id, familia_id, familias(fecha_vencimiento)"
      )
      .eq("qr_token", qrToken)
      .eq("academia_id", academiaId)
      .maybeSingle()
    alumno = data
  } else if (alumnoId) {
    const { data } = await supabase
      .from("alumnos")
      .select(
        "id, nombre, cinta, status, academia_id, familia_id, familias(fecha_vencimiento)"
      )
      .eq("id", alumnoId)
      .eq("academia_id", academiaId)
      .maybeSingle()
    alumno = data
  }

  if (!alumno) {
    return { ok: false, code: "not_found" }
  }

  if (alumno.status === "inactive") {
    return {
      ok: false,
      code: "inactive",
      alumno: {
        id: alumno.id,
        nombre: alumno.nombre,
        cinta: alumno.cinta,
        cintaLabel: cintaLabel(alumno.cinta),
      },
    }
  }

  const hoy = new Date()
  const fecha = [
    hoy.getFullYear(),
    String(hoy.getMonth() + 1).padStart(2, "0"),
    String(hoy.getDate()).padStart(2, "0"),
  ].join("-")

  const { data: existing } = await supabase
    .from("asistencias")
    .select("id")
    .eq("alumno_id", alumno.id)
    .eq("fecha", fecha)
    .maybeSingle()

  if (existing) {
    return {
      ok: true,
      code: "already",
      alumno: {
        id: alumno.id,
        nombre: alumno.nombre,
        cinta: alumno.cinta,
        cintaLabel: cintaLabel(alumno.cinta),
      },
      staffNotice: staffNotice(alumno),
    }
  }

  const { data: asistencia, error } = await supabase
    .from("asistencias")
    .insert({
      academia_id: academiaId,
      alumno_id: alumno.id,
      fecha,
      origen,
      registrado_por: userId,
    })
    .select()
    .single()

  if (error) {
    if (error.code === "23505") {
      return {
        ok: true,
        code: "already",
        alumno: {
          id: alumno.id,
          nombre: alumno.nombre,
          cinta: alumno.cinta,
          cintaLabel: cintaLabel(alumno.cinta),
        },
        staffNotice: staffNotice(alumno),
      }
    }
    return { ok: false, code: "error", error: error.message }
  }

  return {
    ok: true,
    code: "ok",
    asistencia,
    alumno: {
      id: alumno.id,
      nombre: alumno.nombre,
      cinta: alumno.cinta,
      cintaLabel: cintaLabel(alumno.cinta),
    },
    staffNotice: staffNotice(alumno),
  }
}

function staffNotice(alumno) {
  const ven = alumno.familias?.fecha_vencimiento
  const fin = estadoFinanciero(ven)
  if (fin === "vencido") {
    return { tipo: "vencido", mensaje: "Cuenta familiar vencida (solo staff)" }
  }
  if (fin === "sin_pago") {
    return { tipo: "sin_pago", mensaje: "Sin fecha de pago registrada" }
  }
  return null
}
