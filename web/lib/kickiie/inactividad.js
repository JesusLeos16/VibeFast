/**
 * Marca alumnos active sin actividad en 60 días como inactive.
 * Referencia: última asistencia o created_at si nunca asistió.
 */
export async function marcarInactivos60d(
  supabase,
  { academiaId = null, actorId = null } = {}
) {
  const since = new Date()
  since.setDate(since.getDate() - 60)

  let query = supabase
    .from("alumnos")
    .select("id, academia_id, nombre, created_at")
    .eq("status", "active")

  if (academiaId) query = query.eq("academia_id", academiaId)

  const { data: alumnos, error } = await query
  if (error) {
    return { ok: false, error: error.message, marked: 0, details: [] }
  }

  let marked = 0
  const details = []

  for (const alumno of alumnos || []) {
    const { data: last } = await supabase
      .from("asistencias")
      .select("fecha, scanned_at")
      .eq("alumno_id", alumno.id)
      .order("fecha", { ascending: false })
      .limit(1)
      .maybeSingle()

    let reference = null
    if (last?.scanned_at) reference = new Date(last.scanned_at)
    else if (last?.fecha) reference = new Date(`${last.fecha}T00:00:00`)
    else if (alumno.created_at) reference = new Date(alumno.created_at)
    else continue

    if (reference >= since) continue

    const { error: upErr } = await supabase
      .from("alumnos")
      .update({ status: "inactive" })
      .eq("id", alumno.id)
      .eq("status", "active")

    if (upErr) continue

    await supabase.from("eventos_historial").insert({
      academia_id: alumno.academia_id,
      entity_type: "alumno",
      entity_id: alumno.id,
      tipo: "status_alumno",
      actor_id: actorId,
      meta: {
        status: "inactive",
        motivo: "inactividad_60d",
        referencia: reference.toISOString(),
      },
    })

    marked += 1
    details.push({ id: alumno.id, nombre: alumno.nombre })
  }

  return { ok: true, marked, details }
}
