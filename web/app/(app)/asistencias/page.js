import Link from "next/link"
import { redirect } from "next/navigation"
import { getAcademyContext } from "@/lib/kickiie/academy"
import { cintaLabel } from "@/lib/kickiie/cintas"
import { formatDateISO } from "@/lib/kickiie/pagos"
import RegistrarManualForm from "@/components/kickiie/RegistrarManualForm"

export const metadata = { title: "Asistencias" }

export default async function AsistenciasPage() {
  const { academia, supabase, membership } = await getAcademyContext()
  if (!membership) redirect("/setup")

  const hoy = formatDateISO(new Date())

  const [{ data: lista }, { data: alumnos }] = await Promise.all([
    supabase
      .from("asistencias")
      .select(
        "id, fecha, scanned_at, origen, alumno_id, alumnos(nombre, cinta, status)"
      )
      .eq("academia_id", academia.id)
      .eq("fecha", hoy)
      .order("scanned_at", { ascending: false }),
    supabase
      .from("alumnos")
      .select("id, nombre, status")
      .eq("academia_id", academia.id)
      .eq("status", "active")
      .order("nombre"),
  ])

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Asistencias</h1>
          <p className="mt-1 text-sm text-base-content/70">
            Hoy {hoy} · {lista?.length ?? 0} registro
            {(lista?.length ?? 0) === 1 ? "" : "s"}
          </p>
        </div>
        <Link href="/kiosco" className="btn btn-primary">
          Abrir kiosco QR
        </Link>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Registro manual</h2>
        <RegistrarManualForm alumnos={alumnos || []} />
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Lista del día</h2>
        <ul className="space-y-2">
          {(lista || []).length === 0 ? (
            <li className="text-sm text-base-content/60">
              Nadie ha entrado todavía
            </li>
          ) : (
            (lista || []).map((a) => (
              <li
                key={a.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-box border border-base-200 bg-base-100 px-4 py-3 text-sm"
              >
                <div>
                  <p className="font-medium">{a.alumnos?.nombre || "Alumno"}</p>
                  <p className="text-base-content/60">
                    {cintaLabel(a.alumnos?.cinta)} · {a.origen}
                    {a.scanned_at
                      ? ` · ${new Date(a.scanned_at).toLocaleTimeString("es-MX", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}`
                      : ""}
                  </p>
                </div>
                {a.alumno_id ? (
                  <Link
                    href={`/alumnos/${a.alumno_id}`}
                    className="link link-primary text-xs"
                  >
                    Ver
                  </Link>
                ) : null}
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  )
}
