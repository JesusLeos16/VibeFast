import Link from "next/link"
import { redirect } from "next/navigation"
import { getAcademyContext } from "@/lib/kickiie/academy"

export const metadata = { title: "Inicio" }

export default async function DashboardPage() {
  const { academia, supabase, membership } = await getAcademyContext()
  if (!membership) redirect("/setup")

  const [{ count: nFamilias }, { count: nAlumnos }, { count: nActivos }] =
    await Promise.all([
      supabase
        .from("familias")
        .select("*", { count: "exact", head: true })
        .eq("academia_id", academia.id),
      supabase
        .from("alumnos")
        .select("*", { count: "exact", head: true })
        .eq("academia_id", academia.id),
      supabase
        .from("alumnos")
        .select("*", { count: "exact", head: true })
        .eq("academia_id", academia.id)
        .eq("status", "active"),
    ])

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-medium text-primary">{academia.nombre}</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">Inicio · F1 Núcleo</h1>
        <p className="mt-1 text-sm text-base-content/70">
          Familias, tutores y alumnos. Pagos y kiosco llegan en fases siguientes.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-box border border-base-200 bg-base-100 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-base-content/50">
            Familias
          </p>
          <p className="mt-1 text-3xl font-bold">{nFamilias ?? 0}</p>
        </div>
        <div className="rounded-box border border-base-200 bg-base-100 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-base-content/50">
            Alumnos activos
          </p>
          <p className="mt-1 text-3xl font-bold">{nActivos ?? 0}</p>
        </div>
        <div className="rounded-box border border-base-200 bg-base-100 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-base-content/50">
            Alumnos total
          </p>
          <p className="mt-1 text-3xl font-bold">{nAlumnos ?? 0}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/familias" className="btn btn-primary">
          Ir a Familias
        </Link>
        <Link href="/alumnos" className="btn btn-outline">
          Ver alumnos
        </Link>
      </div>
    </div>
  )
}
