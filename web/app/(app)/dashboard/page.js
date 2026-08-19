import Link from "next/link"
import { redirect } from "next/navigation"
import { getAcademyContext } from "@/lib/kickiie/academy"
import { estadoFinanciero } from "@/lib/kickiie/pagos"
import { fechaHoyAcademia } from "@/lib/kickiie/timezone"
import ChequeoInactividadButton from "@/components/kickiie/ChequeoInactividadButton"

export const metadata = { title: "Inicio" }

export default async function DashboardPage() {
  const { academia, supabase, membership } = await getAcademyContext()
  if (!membership) redirect("/setup")

  const hoy = fechaHoyAcademia()

  const [
    { count: nFamilias },
    { count: nAlumnos },
    { count: nActivos },
    { data: familiasVen },
    { count: nAsistHoy },
  ] = await Promise.all([
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
    supabase
      .from("familias")
      .select("id, fecha_vencimiento")
      .eq("academia_id", academia.id),
    supabase
      .from("asistencias")
      .select("*", { count: "exact", head: true })
      .eq("academia_id", academia.id)
      .eq("fecha", hoy),
  ])

  const nVencidos = (familiasVen || []).filter(
    (f) => estadoFinanciero(f.fecha_vencimiento) === "vencido"
  ).length

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-medium text-primary">{academia.nombre}</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">Inicio</h1>
        <p className="mt-1 text-sm text-base-content/70">
          Núcleo F1–F5: familias, pagos, kiosco, expediente e inactividad.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
            Familias vencidas
          </p>
          <p
            className={`mt-1 text-3xl font-bold ${nVencidos > 0 ? "text-error" : ""}`}
          >
            {nVencidos}
          </p>
        </div>
        <div className="rounded-box border border-base-200 bg-base-100 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-base-content/50">
            Asistencias hoy
          </p>
          <p className="mt-1 text-3xl font-bold">{nAsistHoy ?? 0}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/familias" className="btn btn-primary">
          Familias
        </Link>
        <Link href="/pagos" className="btn btn-outline">
          Pagos
        </Link>
        <Link href="/kiosco" className="btn btn-outline">
          Kiosco
        </Link>
        <Link href="/asistencias" className="btn btn-outline">
          Asistencias
        </Link>
        <Link href="/alumnos" className="btn btn-ghost">
          Alumnos ({nAlumnos ?? 0})
        </Link>
      </div>

      {membership.role === "admin" ? (
        <section className="rounded-box border border-base-200 bg-base-100 p-4">
          <h2 className="text-sm font-semibold">Admin · Inactividad 60 días</h2>
          <p className="mt-1 text-xs text-base-content/60">
            Fallback si el cron de Vercel no está configurado. Requiere{" "}
            <code className="text-xs">CRON_SECRET</code> en deploy para el job
            automático.
          </p>
          <div className="mt-3">
            <ChequeoInactividadButton />
          </div>
        </section>
      ) : null}
    </div>
  )
}
