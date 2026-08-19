import { NextResponse } from "next/server"
import { z } from "zod"
import { generateObject } from "@/lib/openai/structured"
import { getAcademyContext } from "@/lib/kickiie/academy"
import { buildSeguimientoPrompt, seguimientoSchema } from "@/lib/kickiie/ai"

const inputSchema = z.object({
  prompt: z.string().trim().min(1).max(2000),
})

export async function POST(request) {
  let body

  try {
    body = await request.json()
  } catch (err) {
    return NextResponse.json(
      { error: "El cuerpo de la solicitud no es válido." },
      { status: 400 }
    )
  }

  const parsedInput = inputSchema.safeParse(body)
  if (!parsedInput.success) {
    return NextResponse.json(
      { error: "Escribe una nota de hasta 2000 caracteres." },
      { status: 400 }
    )
  }

  // La academia se obtiene de la sesión en el servidor. El cliente nunca
  // puede elegir un academy_id para cambiar el contexto de la IA.
  let context
  try {
    context = await getAcademyContext()
  } catch (err) {
    console.error("[ai/structured] contexto no disponible:", err?.message)
    return NextResponse.json(
      { error: "No pudimos verificar la academia activa." },
      { status: 503 }
    )
  }

  if (!context.user) {
    return NextResponse.json({ error: "Necesitas iniciar sesión." }, { status: 401 })
  }

  if (!context.membership || !context.academia) {
    return NextResponse.json(
      { error: "Configura o reclama una academia antes de usar Kickiie AI." },
      { status: 403 }
    )
  }

  try {
    const result = await generateObject(
      seguimientoSchema,
      buildSeguimientoPrompt(parsedInput.data.prompt)
    )

    return NextResponse.json({
      schema: "seguimiento_v1",
      mode: "read_only",
      result,
    })
  } catch (err) {
    console.error("[ai/structured] OpenAI error:", err?.message)
    return NextResponse.json(
      {
        error: process.env.OPENAI_API_KEY
          ? "No pudimos interpretar la nota. Intenta de nuevo en unos segundos."
          : "Falta configurar OPENAI_API_KEY en web/.env.local.",
      },
      { status: process.env.OPENAI_API_KEY ? 502 : 503 }
    )
  }
}
