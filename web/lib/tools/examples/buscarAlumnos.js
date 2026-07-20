import { createClient } from "@/lib/supabase/server"

// Tool: busca alumnos del instructor por nombre.
export const buscarAlumnos = {
  name: "buscar_alumnos",
  description: "Busca alumnos del instructor por coincidencia en el nombre.",
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

    const { data, error } = await supabase
      .from("alumnos")
      .select("id, nombre, grado, grupo, email_tutor, status")
      .eq("user_id", user.id)
      .ilike("nombre", `%${query}%`)
    if (error) throw new Error(error.message)
    return { ok: true, alumnos: data }
  },
}
