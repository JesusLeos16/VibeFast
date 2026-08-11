"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { claimRoninAdmin, getAcademyContext } from "@/lib/kickiie/academy"
import { isValidCinta } from "@/lib/kickiie/cintas"
import { logEvento } from "@/lib/kickiie/eventos"

async function requireMember() {
  const ctx = await getAcademyContext()
  if (!ctx.user) throw new Error("No autenticado")
  if (!ctx.membership || !ctx.academia) {
    redirect("/setup")
  }
  return ctx
}

export async function claimRoninAction() {
  const ctx = await getAcademyContext()
  if (!ctx.user) redirect("/login")
  const result = await claimRoninAdmin(ctx.supabase, ctx.user.id)
  revalidatePath("/setup")
  revalidatePath("/dashboard")
  revalidatePath("/familias")
  if (result.ok) redirect("/dashboard")
  return result
}

export async function createFamiliaConAlumno(formData) {
  const { supabase, academia } = await requireMember()

  const familiaNombre = formData.get("familia_nombre")?.toString().trim()
  const tutorNombre = formData.get("tutor_nombre")?.toString().trim()
  const tutorTelefono = formData.get("tutor_telefono")?.toString().trim() || null
  const tutorEmail = formData.get("tutor_email")?.toString().trim() || null
  const tutorRelacion = formData.get("tutor_relacion")?.toString().trim() || null

  const alumnoNombre = formData.get("alumno_nombre")?.toString().trim()
  const fechaNacimiento = formData.get("fecha_nacimiento")?.toString().trim() || null
  let cinta = formData.get("cinta")?.toString().trim() || "blanca"
  if (!isValidCinta(cinta)) cinta = "blanca"
  const alumnoTelefono = formData.get("alumno_telefono")?.toString().trim() || null
  const notas = formData.get("notas")?.toString().trim() || null

  if (!familiaNombre || !tutorNombre || !alumnoNombre) return

  const { data: familia, error: famErr } = await supabase
    .from("familias")
    .insert({
      academia_id: academia.id,
      nombre: familiaNombre,
    })
    .select("id")
    .single()

  if (famErr || !familia) {
    console.error("[createFamilia]", famErr?.message)
    return
  }

  await supabase.from("tutores").insert({
    familia_id: familia.id,
    nombre: tutorNombre,
    telefono: tutorTelefono,
    email: tutorEmail,
    relacion: tutorRelacion,
    es_principal: true,
  })

  const { data: alumno } = await supabase
    .from("alumnos")
    .insert({
      academia_id: academia.id,
      familia_id: familia.id,
      nombre: alumnoNombre,
      fecha_nacimiento: fechaNacimiento || null,
      cinta,
      telefono: alumnoTelefono,
      notas,
      status: "active",
    })
    .select("id")
    .single()

  if (alumno) {
    await supabase.from("historial_cintas").insert({
      alumno_id: alumno.id,
      cinta_antes: null,
      cinta_despues: cinta,
    })
  }

  revalidatePath("/familias")
  revalidatePath("/alumnos")
  revalidatePath("/dashboard")
  redirect(`/familias/${familia.id}`)
}

export async function addTutor(formData) {
  const { supabase, academia } = await requireMember()
  const familiaId = formData.get("familia_id")?.toString()
  const nombre = formData.get("nombre")?.toString().trim()
  if (!familiaId || !nombre) return

  // Verificar familia de la academia
  const { data: fam } = await supabase
    .from("familias")
    .select("id")
    .eq("id", familiaId)
    .eq("academia_id", academia.id)
    .maybeSingle()
  if (!fam) return

  await supabase.from("tutores").insert({
    familia_id: familiaId,
    nombre,
    telefono: formData.get("telefono")?.toString().trim() || null,
    email: formData.get("email")?.toString().trim() || null,
    relacion: formData.get("relacion")?.toString().trim() || null,
    es_principal: formData.get("es_principal") === "on",
  })

  revalidatePath(`/familias/${familiaId}`)
}

export async function addAlumnoAFamilia(formData) {
  const { supabase, academia, user } = await requireMember()
  const familiaId = formData.get("familia_id")?.toString()
  const nombre = formData.get("nombre")?.toString().trim()
  if (!familiaId || !nombre) return

  const { data: fam } = await supabase
    .from("familias")
    .select("id")
    .eq("id", familiaId)
    .eq("academia_id", academia.id)
    .maybeSingle()
  if (!fam) return

  let cinta = formData.get("cinta")?.toString().trim() || "blanca"
  if (!isValidCinta(cinta)) cinta = "blanca"

  const { data: alumno } = await supabase
    .from("alumnos")
    .insert({
      academia_id: academia.id,
      familia_id: familiaId,
      nombre,
      fecha_nacimiento: formData.get("fecha_nacimiento")?.toString().trim() || null,
      cinta,
      telefono: formData.get("telefono")?.toString().trim() || null,
      notas: formData.get("notas")?.toString().trim() || null,
      status: "active",
    })
    .select("id")
    .single()

  if (alumno) {
    await supabase.from("historial_cintas").insert({
      alumno_id: alumno.id,
      cinta_antes: null,
      cinta_despues: cinta,
      changed_by: user.id,
    })
  }

  revalidatePath(`/familias/${familiaId}`)
  revalidatePath("/alumnos")
}

export async function updateAlumnoF1(formData) {
  const { supabase, academia, user } = await requireMember()
  const id = formData.get("id")?.toString()
  if (!id) return

  const nombre = formData.get("nombre")?.toString().trim()
  if (!nombre) return

  let cinta = formData.get("cinta")?.toString().trim() || "blanca"
  if (!isValidCinta(cinta)) cinta = "blanca"

  const { data: prev } = await supabase
    .from("alumnos")
    .select("cinta, familia_id")
    .eq("id", id)
    .eq("academia_id", academia.id)
    .maybeSingle()
  if (!prev) return

  await supabase
    .from("alumnos")
    .update({
      nombre,
      fecha_nacimiento: formData.get("fecha_nacimiento")?.toString().trim() || null,
      cinta,
      telefono: formData.get("telefono")?.toString().trim() || null,
      notas: formData.get("notas")?.toString().trim() || null,
    })
    .eq("id", id)
    .eq("academia_id", academia.id)

  if (prev.cinta !== cinta) {
    await supabase.from("historial_cintas").insert({
      alumno_id: id,
      cinta_antes: prev.cinta,
      cinta_despues: cinta,
      changed_by: user.id,
    })
    await logEvento(supabase, {
      academia_id: academia.id,
      entity_type: "alumno",
      entity_id: id,
      tipo: "cinta",
      actor_id: user.id,
      meta: { cinta_antes: prev.cinta, cinta_despues: cinta },
    })
  }

  revalidatePath("/alumnos")
  revalidatePath(`/alumnos/${id}`)
  if (prev.familia_id) revalidatePath(`/familias/${prev.familia_id}`)
}

export async function toggleAlumnoStatus(formData) {
  const { supabase, academia, user } = await requireMember()
  const id = formData.get("id")?.toString()
  const status = formData.get("status")?.toString()
  if (!id) return

  const next = status === "inactive" ? "active" : "inactive"
  const { data: row } = await supabase
    .from("alumnos")
    .update({ status: next })
    .eq("id", id)
    .eq("academia_id", academia.id)
    .select("familia_id")
    .maybeSingle()

  if (row) {
    await logEvento(supabase, {
      academia_id: academia.id,
      entity_type: "alumno",
      entity_id: id,
      tipo: "status_alumno",
      actor_id: user.id,
      meta: { status: next, anterior: status },
    })
  }

  revalidatePath("/alumnos")
  revalidatePath(`/alumnos/${id}`)
  revalidatePath("/dashboard")
  if (row?.familia_id) revalidatePath(`/familias/${row.familia_id}`)
}
