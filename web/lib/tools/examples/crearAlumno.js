import { createClient } from "@/lib/supabase/server"

// Tool: crea un alumno en la academia del instructor autenticado.
export const crearAlumno = {
  name: "crear_alumno",
  description:
    "Crea un nuevo alumno en la academia del instructor autenticado.",
  parameters: {
    type: "object",
    properties: {
      nombre: { type: "string", description: "Nombre completo del alumno." },
      grado: {
        type: "string",
        description: "Grado o cinturón (ej. Cinturón azul).",
      },
      grupo: { type: "string", description: "Grupo u horario (opcional)." },
      email_tutor: {
        type: "string",
        description: "Email del tutor/papá autorizado (opcional).",
      },
      notas: { type: "string", description: "Notas opcionales." },
    },
    required: ["nombre"],
    additionalProperties: false,
  },
  async execute({
    nombre,
    grado = "Cinturón blanco",
    grupo = null,
    email_tutor = null,
    notas = null,
  }) {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("No autenticado")

    const { data, error } = await supabase
      .from("alumnos")
      .insert({
        user_id: user.id,
        nombre,
        grado,
        grupo,
        email_tutor,
        notas,
      })
      .select()
      .single()
    if (error) throw new Error(error.message)
    return { ok: true, alumno: data }
  },
}
