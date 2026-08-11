import { createClient } from "@/lib/supabase/server"
import { isValidCinta } from "@/lib/kickiie/cintas"

// Tool F1: crea un alumno en la academia del usuario (requiere familia_id).
export const crearAlumno = {
  name: "crear_alumno",
  description:
    "Crea un alumno en una familia de la academia del instructor. Requiere familia_id.",
  parameters: {
    type: "object",
    properties: {
      familia_id: { type: "string", description: "UUID de la familia." },
      nombre: { type: "string", description: "Nombre del alumno." },
      cinta: {
        type: "string",
        description: "Código de cinta Lima Lama (ej. blanca, verde_2).",
      },
    },
    required: ["familia_id", "nombre"],
    additionalProperties: false,
  },
  async execute({ familia_id, nombre, cinta = "blanca" }) {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("No autenticado")

    const { data: membership } = await supabase
      .from("memberships")
      .select("academia_id")
      .eq("user_id", user.id)
      .limit(1)
      .maybeSingle()
    if (!membership) throw new Error("Sin academia asignada")

    const code = isValidCinta(cinta) ? cinta : "blanca"
    const { data, error } = await supabase
      .from("alumnos")
      .insert({
        academia_id: membership.academia_id,
        familia_id,
        nombre,
        cinta: code,
        status: "active",
      })
      .select()
      .single()
    if (error) throw new Error(error.message)
    return { ok: true, alumno: data }
  },
}
