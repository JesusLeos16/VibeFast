/**
 * Eventos críticos Kickiie F5
 */
export async function logEvento(
  supabase,
  {
    academia_id,
    entity_type,
    entity_id = null,
    tipo,
    actor_id = null,
    meta = {},
  }
) {
  if (!academia_id || !tipo) return
  try {
    await supabase.from("eventos_historial").insert({
      academia_id,
      entity_type: entity_type || "system",
      entity_id,
      tipo,
      actor_id,
      meta,
    })
  } catch (e) {
    console.error("[eventos]", e?.message || e)
  }
}
