import { z } from "zod"
import { getAcademyContext } from "@/lib/kickiie/academy"
import { logEvento } from "@/lib/kickiie/eventos"

const inputSchema = z.object({
  alumno_id: z.string().uuid(),
  tipo: z.enum(["absence", "payment", "medical", "document", "event", "general"]),
  resumen: z.string().trim().min(1).max(1200),
  fecha_retorno: z.string().trim().max(100).nullable().optional(),
  prioridad: z.enum(["low", "normal", "high"]).default("normal"),
  accion_sugerida: z
    .enum([
      "crear_seguimiento",
      "revisar_pago",
      "revisar_documento",
      "contactar_tutor",
      "revisar_manualmente",
      "sin_accion",
    ])
    .default("crear_seguimiento"),
  nota_original: z.string().trim().max(2000).nullable().optional(),
  idempotency_key: z.string().uuid().nullable().optional(),
})

export const registrarSeguimiento = {
  name: "registrar_seguimiento",
  description:
    "Registra un seguimiento administrativo para un alumno de la academia activa. Requiere confirmación explícita del administrador.",
  parameters: {
    type: "object",
    properties: {
      alumno_id: { type: "string", description: "UUID del alumno confirmado." },
      tipo: {
        type: "string",
        enum: ["absence", "payment", "medical", "document", "event", "general"],
        description: "Tipo principal del seguimiento.",
      },
      resumen: { type: "string", description: "Resumen fiel de la nota." },
      fecha_retorno: {
        type: "string",
        description: "Fecha o referencia tal como se expresó, por ejemplo: el 28.",
      },
      prioridad: {
        type: "string",
        enum: ["low", "normal", "high"],
        description: "Prioridad del seguimiento.",
      },
      accion_sugerida: {
        type: "string",
        enum: [
          "crear_seguimiento",
          "revisar_pago",
          "revisar_documento",
          "contactar_tutor",
          "revisar_manualmente",
          "sin_accion",
        ],
        description: "Acción sugerida que el administrador revisó.",
      },
      nota_original: {
        type: "string",
        description: "Nota libre original del administrador.",
      },
      idempotency_key: {
        type: "string",
        description: "UUID para evitar duplicar una confirmación reintentada.",
      },
    },
    required: ["alumno_id", "tipo", "resumen", "prioridad", "accion_sugerida"],
    additionalProperties: false,
  },
  requiresConfirmation: true,

  async execute(input) {
    const parsed = inputSchema.safeParse(input)
    if (!parsed.success) {
      throw new Error("Los datos del seguimiento no son válidos.")
    }

    const values = parsed.data
    const { supabase, user, membership, academia } = await getAcademyContext()
    if (!user) throw new Error("No autenticado")
    if (!membership || !academia) throw new Error("Sin academia asignada")

    const { data: alumno, error: alumnoError } = await supabase
      .from("alumnos")
      .select("id, nombre, academia_id, status")
      .eq("id", values.alumno_id)
      .eq("academia_id", academia.id)
      .maybeSingle()

    if (alumnoError) throw new Error(alumnoError.message)
    if (!alumno) throw new Error("El alumno no pertenece a la academia activa.")

    if (values.idempotency_key) {
      const { data: existing, error: existingError } = await supabase
        .from("seguimientos")
        .select("*")
        .eq("academia_id", academia.id)
        .eq("idempotency_key", values.idempotency_key)
        .maybeSingle()

      if (existingError) throw new Error(existingError.message)
      if (existing) {
        return {
          ok: true,
          already_exists: true,
          seguimiento: { ...existing, alumno: { id: alumno.id, nombre: alumno.nombre } },
        }
      }
    }

    const { data, error } = await supabase
      .from("seguimientos")
      .insert({
        academia_id: academia.id,
        alumno_id: alumno.id,
        tipo: values.tipo,
        resumen: values.resumen,
        fecha_retorno: values.fecha_retorno || null,
        prioridad: values.prioridad,
        accion_sugerida: values.accion_sugerida,
        nota_original: values.nota_original || null,
        origen: "kickiie_ai",
        idempotency_key: values.idempotency_key || null,
        registrado_por: user.id,
      })
      .select("*")
      .single()

    if (error) throw new Error(error.message)

    await logEvento(supabase, {
      academia_id: academia.id,
      entity_type: "alumno",
      entity_id: alumno.id,
      tipo: "seguimiento_creado",
      actor_id: user.id,
      meta: { seguimiento_id: data.id, origen: "kickiie_ai" },
    })

    return {
      ok: true,
      already_exists: false,
      seguimiento: { ...data, alumno: { id: alumno.id, nombre: alumno.nombre } },
    }
  },
}
