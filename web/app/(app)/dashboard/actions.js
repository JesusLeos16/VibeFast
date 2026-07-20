"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

// CRUD de alumnos vía Server Actions. La RLS de Supabase ya
// garantiza que cada quien solo toca sus filas; aun así filtramos
// por user_id como defensa en profundidad.

async function requireUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("No autenticado")
  return { supabase, user }
}

function readAlumnoFields(formData) {
  const nombre = formData.get("nombre")?.toString().trim()
  const grado = formData.get("grado")?.toString().trim() || "Cinturón blanco"
  const grupo = formData.get("grupo")?.toString().trim() || null
  const emailTutor = formData.get("email_tutor")?.toString().trim() || null
  const notas = formData.get("notas")?.toString().trim() || null
  return { nombre, grado, grupo, emailTutor, notas }
}

export async function createAlumno(formData) {
  const { nombre, grado, grupo, emailTutor, notas } = readAlumnoFields(formData)
  if (!nombre) return

  const { supabase, user } = await requireUser()
  await supabase.from("alumnos").insert({
    user_id: user.id,
    nombre,
    grado,
    grupo,
    email_tutor: emailTutor,
    notas,
  })
  revalidatePath("/dashboard")
}

export async function updateAlumno(formData) {
  const id = formData.get("id")?.toString()
  if (!id) return

  const { nombre, grado, grupo, emailTutor, notas } = readAlumnoFields(formData)
  if (!nombre) return

  const { supabase, user } = await requireUser()
  await supabase
    .from("alumnos")
    .update({
      nombre,
      grado,
      grupo,
      email_tutor: emailTutor,
      notas,
    })
    .eq("id", id)
    .eq("user_id", user.id)
  revalidatePath("/dashboard")
}

export async function toggleAlumno(formData) {
  const id = formData.get("id")?.toString()
  const status = formData.get("status")?.toString()
  if (!id) return

  const next = status === "inactive" ? "active" : "inactive"
  const { supabase, user } = await requireUser()
  await supabase
    .from("alumnos")
    .update({ status: next })
    .eq("id", id)
    .eq("user_id", user.id)
  revalidatePath("/dashboard")
}

export async function deleteAlumno(formData) {
  const id = formData.get("id")?.toString()
  if (!id) return

  const { supabase, user } = await requireUser()
  await supabase
    .from("alumnos")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)
  revalidatePath("/dashboard")
}
