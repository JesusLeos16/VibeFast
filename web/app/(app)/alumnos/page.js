import Link from "next/link"
import { redirect } from "next/navigation"
import { getAcademyContext } from "@/lib/kickiie/academy"
import { calcularEdad, cintaLabel } from "@/lib/kickiie/cintas"
import { toggleAlumnoStatus } from "../familias/actions"

export const metadata = { title: "Alumnos" }

export default async function AlumnosPage({ searchParams }) {
  const params = await searchParams
  const showInactive = params?.estado === "inactive"

  const { academia, supabase, membership } = await getAcademyContext()
  if (!membership) redirect("/setup")

  let query = supabase
    .from("alumnos")
    .select("id, nombre, cinta, fecha_nacimiento, telefono, status, familia_id, familias(nombre)")
    .eq("academia_id", academia.id)
    .order("nombre", { ascending: true })

  if (!showInactive) {
    query = query.eq("status", "active")
  } else {
    query = query.eq("status", "inactive")
  }

  const { data: alumnos, error } = await query

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Alumnos</h1>
          <p className="mt-1 text-sm text-base-content/70">
            {showInactive ? "Inactivos" : "Activos"} · {academia.nombre}
          </p>
        </div>
        <div className="flex gap-2 text-sm">
          <Link
            href="/alumnos"
            className={!showInactive ? "font-semibold text-primary" : "text-base-content/60"}
          >
            Activos
          </Link>
          <span className="text-base-content/30">·</span>
          <Link
            href="/alumnos?estado=inactive"
            className={showInactive ? "font-semibold text-primary" : "text-base-content/60"}
          >
            Inactivos
          </Link>
          <span className="text-base-content/30">·</span>
          <Link href="/familias" className="text-base-content/60 hover:text-primary">
            + Alta en Familias
          </Link>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-error/40 bg-error/10 px-4 py-3 text-sm text-error">
          {error.message}
          {error.message?.includes("does not exist") || error.code === "42P01" ? (
            <span className="mt-1 block">
              Corre la migración{" "}
              <code className="text-xs">009_f1_kickiie_nucleo.sql</code> en Supabase.
            </span>
          ) : null}
        </div>
      )}

      {!alumnos?.length ? (
        <p className="text-sm text-base-content/60">
          No hay alumnos {showInactive ? "inactivos" : "activos"}.{" "}
          <Link href="/familias" className="text-primary hover:underline">
            Crea una familia
          </Link>
          .
        </p>
      ) : (
        <ul className="divide-y divide-base-200 rounded-box border border-base-200 bg-base-100">
          {alumnos.map((a) => {
            const edad = calcularEdad(a.fecha_nacimiento)
            const famNombre = a.familias?.nombre
            return (
              <li
                key={a.id}
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{a.nombre}</p>
                  <p className="text-sm text-base-content/60">
                    {cintaLabel(a.cinta)}
                    {edad != null ? ` · ${edad} años` : ""}
                    {famNombre ? ` · Familia ${famNombre}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {a.familia_id && (
                    <Link
                      href={`/familias/${a.familia_id}`}
                      className="btn btn-ghost btn-xs"
                    >
                      Ver familia
                    </Link>
                  )}
                  <form action={toggleAlumnoStatus}>
                    <input type="hidden" name="id" value={a.id} />
                    <input type="hidden" name="status" value={a.status} />
                    <button type="submit" className="btn btn-ghost btn-xs">
                      {a.status === "inactive" ? "Reactivar" : "Inactivar"}
                    </button>
                  </form>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
