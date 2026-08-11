"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { getAcademyContext } from "@/lib/kickiie/academy"
import { logEvento } from "@/lib/kickiie/eventos"

async function requireMember() {
  const ctx = await getAcademyContext()
  if (!ctx.user) throw new Error("No autenticado")
  if (!ctx.membership || !ctx.academia) redirect("/setup")
  return ctx
}

export async function updateExpedienteMedico(formData) {
  const { supabase, academia } = await requireMember()
  const id = formData.get("alumno_id")?.toString()
  if (!id) return

  await supabase
    .from("alumnos")
    .update({
      info_medica: formData.get("info_medica")?.toString().trim() || null,
      seguro: formData.get("seguro")?.toString().trim() || null,
    })
    .eq("id", id)
    .eq("academia_id", academia.id)

  revalidatePath(`/alumnos/${id}`)
}

export async function addContactoEmergencia(formData) {
  const { supabase, academia } = await requireMember()
  const alumnoId = formData.get("alumno_id")?.toString()
  const nombre = formData.get("nombre")?.toString().trim()
  if (!alumnoId || !nombre) return

  const { data: alumno } = await supabase
    .from("alumnos")
    .select("id")
    .eq("id", alumnoId)
    .eq("academia_id", academia.id)
    .maybeSingle()
  if (!alumno) return

  await supabase.from("contactos_emergencia").insert({
    alumno_id: alumnoId,
    nombre,
    telefono: formData.get("telefono")?.toString().trim() || null,
    relacion: formData.get("relacion")?.toString().trim() || null,
  })

  revalidatePath(`/alumnos/${alumnoId}`)
}

export async function deleteContactoEmergencia(formData) {
  const { supabase, academia } = await requireMember()
  const contactoId = formData.get("contacto_id")?.toString()
  const alumnoId = formData.get("alumno_id")?.toString()
  if (!contactoId || !alumnoId) return

  const { data: alumno } = await supabase
    .from("alumnos")
    .select("id")
    .eq("id", alumnoId)
    .eq("academia_id", academia.id)
    .maybeSingle()
  if (!alumno) return

  await supabase.from("contactos_emergencia").delete().eq("id", contactoId)
  revalidatePath(`/alumnos/${alumnoId}`)
}

export async function ensureDocumento(formData) {
  const { supabase, academia } = await requireMember()
  const alumnoId = formData.get("alumno_id")?.toString()
  const tipo = formData.get("tipo")?.toString() || "responsiva"
  if (!alumnoId) return

  const { data: alumno } = await supabase
    .from("alumnos")
    .select("id")
    .eq("id", alumnoId)
    .eq("academia_id", academia.id)
    .maybeSingle()
  if (!alumno) return

  const { data: existing } = await supabase
    .from("documentos")
    .select("id, estado")
    .eq("alumno_id", alumnoId)
    .eq("tipo", tipo)
    .maybeSingle()

  if (existing) {
    if (existing.estado === "pendiente") {
      await supabase
        .from("documentos")
        .update({ estado: "generado", updated_at: new Date().toISOString() })
        .eq("id", existing.id)
    }
  } else {
    await supabase.from("documentos").insert({
      academia_id: academia.id,
      alumno_id: alumnoId,
      tipo,
      estado: "generado",
    })
  }

  revalidatePath(`/alumnos/${alumnoId}`)
}

export async function uploadDocumentoFirmado(formData) {
  const { supabase, academia, user } = await requireMember()
  const alumnoId = formData.get("alumno_id")?.toString()
  const tipo = formData.get("tipo")?.toString() || "responsiva"
  const file = formData.get("file")
  if (!alumnoId || !file || typeof file === "string") {
    return { ok: false, error: "Falta archivo" }
  }

  const { data: alumno } = await supabase
    .from("alumnos")
    .select("id")
    .eq("id", alumnoId)
    .eq("academia_id", academia.id)
    .maybeSingle()
  if (!alumno) return { ok: false, error: "Alumno no encontrado" }

  const ext = (file.name || "bin").split(".").pop() || "bin"
  const path = `${academia.id}/${alumnoId}/${tipo}-${Date.now()}.${ext}`

  const { error: upErr } = await supabase.storage
    .from("documentos-firmados")
    .upload(path, file, { upsert: true, contentType: file.type || undefined })

  if (upErr) {
    console.error("[uploadDoc]", upErr.message)
    return { ok: false, error: upErr.message }
  }

  const { data: existing } = await supabase
    .from("documentos")
    .select("id")
    .eq("alumno_id", alumnoId)
    .eq("tipo", tipo)
    .maybeSingle()

  if (existing) {
    await supabase
      .from("documentos")
      .update({
        estado: "firmado",
        file_path: path,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id)
  } else {
    await supabase.from("documentos").insert({
      academia_id: academia.id,
      alumno_id: alumnoId,
      tipo,
      estado: "firmado",
      file_path: path,
    })
  }

  await logEvento(supabase, {
    academia_id: academia.id,
    entity_type: "documento",
    entity_id: alumnoId,
    tipo: "documento_firmado",
    actor_id: user.id,
    meta: { tipo, path },
  })

  revalidatePath(`/alumnos/${alumnoId}`)
  return { ok: true }
}
