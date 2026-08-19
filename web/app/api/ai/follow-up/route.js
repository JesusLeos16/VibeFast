import { NextResponse } from "next/server"
import { z } from "zod"
import { executeTool } from "@/lib/tools/index.js"
import { seguimientoSchema } from "@/lib/kickiie/ai"
import { logToolCall } from "@/lib/audit"

const matchInputSchema = z.object({
  action: z.literal("match"),
  student: z.string().trim().min(1).max(120),
})

const createInputSchema = z.object({
  action: z.literal("create"),
  alumno_id: z.string().uuid(),
  draft: seguimientoSchema,
  source_note: z.string().trim().min(1).max(2000),
  idempotency_key: z.string().uuid(),
  confirmed: z.literal(true),
})

const inputSchema = z.discriminatedUnion("action", [
  matchInputSchema,
  createInputSchema,
])

async function audit({ toolName, args, result, reasoning }) {
  await logToolCall({ toolName, args, result, reasoning })
}

export async function POST(request) {
  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: "El cuerpo de la solicitud no es válido." },
      { status: 400 }
    )
  }

  const parsed = inputSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "La solicitud de seguimiento no es válida." },
      { status: 400 }
    )
  }

  if (parsed.data.action === "match") {
    const args = { query: parsed.data.student }
    try {
      const result = await executeTool("buscar_alumnos", args)
      await audit({
        toolName: "buscar_alumnos",
        args,
        result,
        reasoning: "Buscar al alumno mencionado antes de proponer una escritura.",
      })

      return NextResponse.json({
        ok: true,
        candidates: (result.alumnos || []).map((alumno) => ({
          id: alumno.id,
          nombre: alumno.nombre,
          cinta: alumno.cinta,
          status: alumno.status,
        })),
      })
    } catch (err) {
      const result = { ok: false, error: err?.message || "No se pudo buscar al alumno." }
      await audit({
        toolName: "buscar_alumnos",
        args,
        result,
        reasoning: "Buscar al alumno mencionado antes de proponer una escritura.",
      })
      return NextResponse.json(result, { status: 500 })
    }
  }

  const { draft, alumno_id, source_note, idempotency_key } = parsed.data
  const args = {
    alumno_id,
    tipo: draft.type,
    resumen: draft.summary,
    fecha_retorno: draft.return_date,
    prioridad: draft.priority,
    accion_sugerida: draft.suggested_action,
    nota_original: source_note,
    idempotency_key,
  }

  try {
    const result = await executeTool("registrar_seguimiento", args)
    await audit({
      toolName: "registrar_seguimiento",
      args,
      result,
      reasoning: "El administrador confirmó explícitamente la propuesta de seguimiento.",
    })

    return NextResponse.json(result)
  } catch (err) {
    const result = {
      ok: false,
      error: err?.message || "No se pudo registrar el seguimiento.",
    }
    await audit({
      toolName: "registrar_seguimiento",
      args,
      result,
      reasoning: "El administrador confirmó explícitamente la propuesta de seguimiento.",
    })
    return NextResponse.json(result, { status: 500 })
  }
}
