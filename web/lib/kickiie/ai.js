import { z } from "zod"

// Contrato estable para la primera capacidad de Kickiie AI.
// Los nombres son deliberadamente simples para poder reutilizarlos cuando
// Semana 4 agregue una tool de escritura.
export const seguimientoSchema = z.object({
  student: z
    .string()
    .nullable()
    .describe("Nombre del alumno mencionado; null si no se identifica."),
  type: z
    .enum(["absence", "payment", "medical", "document", "event", "general"])
    .describe("Tipo principal del seguimiento."),
  summary: z.string().describe("Resumen breve y fiel de la nota en español."),
  return_date: z
    .string()
    .nullable()
    .describe(
      "Fecha o referencia de regreso tal como fue expresada; no inventar mes ni año."
    ),
  priority: z
    .enum(["low", "normal", "high"])
    .describe("Prioridad del seguimiento, sin inventar urgencia."),
  suggested_action: z
    .enum([
      "crear_seguimiento",
      "revisar_pago",
      "revisar_documento",
      "contactar_tutor",
      "revisar_manualmente",
      "sin_accion",
    ])
    .describe("Siguiente paso sugerido; todavía no se ejecuta."),
  missing_information: z
    .array(z.string())
    .describe("Datos que harían falta para actuar con seguridad; [] si no falta nada."),
})

export function buildSeguimientoPrompt(note) {
  return [
    "Eres Kickiie AI, el asistente administrativo de una academia de artes marciales.",
    "Interpreta una nota escrita por un administrador y devuelve únicamente la estructura solicitada por el schema.",
    "",
    "Reglas:",
    "- No ejecutes acciones, no guardes nada y no afirmes que modificaste la academia.",
    "- Extrae el nombre del alumno solo si aparece en la nota; si no, usa null.",
    "- Clasifica la intención principal como absence, payment, medical, document, event o general.",
    "- Resume sin agregar hechos que no estén en la nota.",
    "- Conserva una fecha incompleta tal como aparece (por ejemplo, \"el 28\"); nunca inventes mes o año.",
    "- Usa high solo cuando la nota indique urgencia, riesgo o una situación sensible; normalmente usa normal.",
    "- suggested_action es una recomendación para revisión humana, no una orden.",
    "- Si hay ambigüedad importante, enumérala en missing_information y usa revisar_manualmente.",
    "- Responde en español en summary y missing_information.",
    "",
    `Nota del administrador:\n\"\"\"${note}\"\"\"`,
  ].join("\n")
}
