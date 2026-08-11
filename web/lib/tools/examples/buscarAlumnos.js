import { createClient } from "@/lib/supabase/server"

export const buscarAlumnos = {
  name: "buscar_alumnos",
  description: "Busca alumnos de la academia del instructor por nombre.",
  parameters: {
    type: "object",
    properties: {
      query: { type: "string", description: "Texto a buscar en el nombre." },
    },
    required: ["query"],
    additionalProperties: false,
  },
  async execute({ query }) {
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

    const { data, error } = await supabase
      .from("alumnos")
      .select("id, nombre, cinta, status, familia_id")
      .eq("academia_id", membership.academia_id)
      .ilike("nombre", `%${query}%`)
    if (error) throw new Error(error.message)
    return { ok: true, alumnos: data }
  },
}
