"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { getAcademyContext } from "@/lib/kickiie/academy"
import { marcarInactivos60d } from "@/lib/kickiie/inactividad"

export async function ejecutarChequeoInactividad() {
  const { supabase, academia, membership, user } = await getAcademyContext()
  if (!user) redirect("/login")
  if (!membership || !academia) redirect("/setup")
  if (membership.role !== "admin") {
    return { ok: false, error: "Solo admin" }
  }

  const result = await marcarInactivos60d(supabase, {
    academiaId: academia.id,
    actorId: user.id,
  })

  // Ajustar meta motivo en logs is fine as inactividad_60d
  revalidatePath("/dashboard")
  revalidatePath("/alumnos")
  return result
}
