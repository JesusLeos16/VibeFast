"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { getAcademyContext } from "@/lib/kickiie/academy"
import { registrarAsistencia } from "@/lib/kickiie/asistencia"
import { logEvento } from "@/lib/kickiie/eventos"

async function requireMember() {
  const ctx = await getAcademyContext()
  if (!ctx.user) throw new Error("No autenticado")
  if (!ctx.membership || !ctx.academia) redirect("/setup")
  return ctx
}

export async function escanearAsistencia({ qrToken, alumnoId, origen = "qr" }) {
  const { supabase, academia, user } = await requireMember()

  const result = await registrarAsistencia(supabase, {
    academiaId: academia.id,
    qrToken: qrToken || null,
    alumnoId: alumnoId || null,
    origen,
    userId: user.id,
  })

  if (result.ok && result.code === "ok") {
    await logEvento(supabase, {
      academia_id: academia.id,
      entity_type: "asistencia",
      entity_id: result.asistencia?.id,
      tipo: "asistencia",
      actor_id: user.id,
      meta: {
        alumno_id: result.alumno?.id,
        origen,
      },
    })
    revalidatePath("/asistencias")
    revalidatePath("/dashboard")
  }

  return {
    ok: result.ok,
    code: result.code,
    alumno: result.alumno || null,
    staffNotice: result.staffNotice || null,
    error: result.error || null,
    academiaNombre: academia.nombre,
  }
}

export async function registrarAsistenciaManual(formData) {
  const alumnoId = formData.get("alumno_id")?.toString()
  if (!alumnoId) return { ok: false, code: "error", error: "Falta alumno" }
  return escanearAsistencia({ alumnoId, origen: "manual" })
}
