"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { getAcademyContext } from "@/lib/kickiie/academy"
import { logEvento } from "@/lib/kickiie/eventos"
import {
  calcularMontoEsperado,
  calcularNuevoVencimiento,
  formatDateISO,
} from "@/lib/kickiie/pagos"

async function requireMember() {
  const ctx = await getAcademyContext()
  if (!ctx.user) throw new Error("No autenticado")
  if (!ctx.membership || !ctx.academia) redirect("/setup")
  return ctx
}

export async function registrarPago(formData) {
  const { supabase, academia, user } = await requireMember()
  const familiaId = formData.get("familia_id")?.toString()
  if (!familiaId) return { ok: false, error: "Falta familia" }

  const { data: familia } = await supabase
    .from("familias")
    .select("id, fecha_vencimiento")
    .eq("id", familiaId)
    .eq("academia_id", academia.id)
    .maybeSingle()
  if (!familia) return { ok: false, error: "Familia no encontrada" }

  const montoRaw = formData.get("monto")?.toString().trim()
  const monto = Number(montoRaw)
  if (!Number.isFinite(monto) || monto <= 0) {
    return { ok: false, error: "Monto inválido" }
  }

  const periodos = Math.max(1, parseInt(formData.get("periodos") || "1", 10) || 1)
  const metodo = formData.get("metodo")?.toString() || "efectivo"
  const fechaPago =
    formData.get("fecha_pago")?.toString().trim() || formatDateISO(new Date())
  const notas = formData.get("notas")?.toString().trim() || null

  const { periodo_inicio, periodo_fin, fecha_vencimiento } =
    calcularNuevoVencimiento({
      vencimientoActual: familia.fecha_vencimiento,
      fechaPago,
      periodos,
    })

  const { data: pago, error } = await supabase
    .from("pagos")
    .insert({
      academia_id: academia.id,
      familia_id: familiaId,
      monto,
      fecha_pago: fechaPago,
      metodo,
      periodos,
      periodo_inicio,
      periodo_fin,
      notas,
      registrado_por: user.id,
      status: "activo",
    })
    .select("id")
    .single()

  if (error) {
    console.error("[registrarPago]", error.message)
    return { ok: false, error: error.message }
  }

  await supabase
    .from("familias")
    .update({ fecha_vencimiento })
    .eq("id", familiaId)
    .eq("academia_id", academia.id)

  await logEvento(supabase, {
    academia_id: academia.id,
    entity_type: "pago",
    entity_id: pago.id,
    tipo: "pago_registrado",
    actor_id: user.id,
    meta: { familia_id: familiaId, monto, periodos, fecha_vencimiento },
  })

  revalidatePath("/pagos")
  revalidatePath("/dashboard")
  revalidatePath(`/familias/${familiaId}`)
  return { ok: true }
}

export async function cancelarPago(formData) {
  const { supabase, academia, user } = await requireMember()
  const pagoId = formData.get("pago_id")?.toString()
  if (!pagoId) return

  const { data: pago } = await supabase
    .from("pagos")
    .update({ status: "cancelado" })
    .eq("id", pagoId)
    .eq("academia_id", academia.id)
    .eq("status", "activo")
    .select("id, familia_id, monto")
    .maybeSingle()

  if (pago) {
    await logEvento(supabase, {
      academia_id: academia.id,
      entity_type: "pago",
      entity_id: pago.id,
      tipo: "pago_cancelado",
      actor_id: user.id,
      meta: { familia_id: pago.familia_id, monto: pago.monto },
    })
    revalidatePath("/pagos")
    revalidatePath("/dashboard")
    if (pago.familia_id) revalidatePath(`/familias/${pago.familia_id}`)
  }
}

/** Helper for UI prefill */
export async function getMontoSugerido(familiaId) {
  const { supabase, academia } = await requireMember()
  const [{ count }, { data: plan }] = await Promise.all([
    supabase
      .from("alumnos")
      .select("*", { count: "exact", head: true })
      .eq("familia_id", familiaId)
      .eq("academia_id", academia.id)
      .eq("status", "active"),
    supabase
      .from("academia_plan_config")
      .select("precio_base, precio_adicional, moneda")
      .eq("academia_id", academia.id)
      .maybeSingle(),
  ])
  return {
    nActivos: count ?? 0,
    monto: calcularMontoEsperado(count ?? 0, plan || {}),
    moneda: plan?.moneda || "MXN",
    plan: plan || { precio_base: 400, precio_adicional: 300 },
  }
}
