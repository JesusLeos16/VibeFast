import { createClient } from "@/lib/supabase/server"

/**
 * Sesión + membership a una academia Kickiie.
 * @returns {{ supabase, user, membership, academia } | { supabase, user, membership: null, academia: null }}
 */
export async function getAcademyContext() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { supabase, user: null, membership: null, academia: null }

  const { data: membership } = await supabase
    .from("memberships")
    .select("id, role, academia_id, academias ( id, nombre, slug )")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle()

  if (!membership) {
    return { supabase, user, membership: null, academia: null }
  }

  const academia = membership.academias
  return {
    supabase,
    user,
    membership: {
      id: membership.id,
      role: membership.role,
      academia_id: membership.academia_id,
    },
    academia: academia
      ? { id: academia.id, nombre: academia.nombre, slug: academia.slug }
      : null,
  }
}

/**
 * Reclama Ronin Defense como admin si la academia no tiene miembros.
 * Llamar una vez desde /setup o dashboard vacío.
 */
export async function claimRoninAdmin(supabase, userId) {
  const { data: academia } = await supabase
    .from("academias")
    .select("id")
    .eq("slug", "ronin-defense")
    .maybeSingle()

  if (!academia) {
    return { ok: false, error: "No existe la academia Ronin Defense. Corre la migración 009." }
  }

  const { count } = await supabase
    .from("memberships")
    .select("*", { count: "exact", head: true })
    .eq("academia_id", academia.id)

  if (count && count > 0) {
    return {
      ok: false,
      error: "Ronin Defense ya tiene miembros. Pide a un admin que te invite.",
    }
  }

  const { error } = await supabase.from("memberships").insert({
    academia_id: academia.id,
    user_id: userId,
    role: "admin",
  })

  if (error) return { ok: false, error: error.message }
  return { ok: true, academia_id: academia.id }
}
