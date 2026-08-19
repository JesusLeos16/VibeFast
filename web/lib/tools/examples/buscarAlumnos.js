import { getAcademyContext } from "@/lib/kickiie/academy"

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
    const { supabase, user, membership, academia } = await getAcademyContext()
    if (!user) throw new Error("No autenticado")
    if (!membership || !academia) throw new Error("Sin academia asignada")

    const cleanQuery = query?.trim()
    if (!cleanQuery) return { ok: true, alumnos: [] }

    const { data, error } = await supabase
      .from("alumnos")
      .select("id, nombre, cinta, status, familia_id")
      .eq("academia_id", academia.id)
      .ilike("nombre", `%${cleanQuery}%`)
      .order("nombre", { ascending: true })
      .limit(20)
    if (error) throw new Error(error.message)
    return { ok: true, alumnos: data }
  },
}
