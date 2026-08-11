import Link from "next/link"
import { redirect } from "next/navigation"
import { getAcademyContext } from "@/lib/kickiie/academy"
import {
  estadoFinanciero,
  labelEstadoFinanciero,
  METODOS_PAGO,
} from "@/lib/kickiie/pagos"
import { cancelarPago } from "./actions"

export const metadata = { title: "Pagos" }

const METODO_MAP = Object.fromEntries(METODOS_PAGO.map((m) => [m.value, m.label]))

export default async function PagosPage({ searchParams }) {
  const sp = await searchParams
  const filtro = sp?.estado || "todos"
  const { academia, supabase, membership } = await getAcademyContext()
  if (!membership) redirect("/setup")

  const { data: plan } = await supabase
    .from("academia_plan_config")
    .select("precio_base, precio_adicional, moneda")
    .eq("academia_id", academia.id)
    .maybeSingle()

  const { data: familias } = await supabase
    .from("familias")
    .select("id, nombre, fecha_vencimiento")
    .eq("academia_id", academia.id)
    .order("nombre")

  const { data: pagos } = await supabase
    .from("pagos")
    .select("id, monto, fecha_pago, metodo, periodos, status, notas, familia_id, familias(nombre)")
    .eq("academia_id", academia.id)
    .order("fecha_pago", { ascending: false })
    .limit(100)

  let filas = familias || []
  if (filtro === "vencido") {
    filas = filas.filter((f) => estadoFinanciero(f.fecha_vencimiento) === "vencido")
  } else if (filtro === "al_corriente") {
    filas = filas.filter(
      (f) => estadoFinanciero(f.fecha_vencimiento) === "al_corriente"
    )
  } else if (filtro === "sin_pago") {
    filas = filas.filter((f) => estadoFinanciero(f.fecha_vencimiento) === "sin_pago")
  }

  const nVencidos = (familias || []).filter(
    (f) => estadoFinanciero(f.fecha_vencimiento) === "vencido"
  ).length

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Pagos</h1>
        <p className="mt-1 text-sm text-base-content/70">
          Plan familiar mensual: ${plan?.precio_base ?? 400} base + $
          {plan?.precio_adicional ?? 300} por alumno adicional ·{" "}
          {plan?.moneda || "MXN"}
        </p>
        {nVencidos > 0 ? (
          <p className="mt-2 text-sm font-medium text-error">
            {nVencidos} familia{nVencidos === 1 ? "" : "s"} vencida
            {nVencidos === 1 ? "" : "s"}
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2 text-sm">
        {[
          ["todos", "Todas"],
          ["vencido", "Vencidas"],
          ["al_corriente", "Al corriente"],
          ["sin_pago", "Sin pago"],
        ].map(([key, label]) => (
          <Link
            key={key}
            href={key === "todos" ? "/pagos" : `/pagos?estado=${key}`}
            className={
              filtro === key
                ? "btn btn-sm btn-primary"
                : "btn btn-sm btn-ghost"
            }
          >
            {label}
          </Link>
        ))}
      </div>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Estado por familia</h2>
        <div className="overflow-x-auto rounded-box border border-base-200 bg-base-100">
          <table className="table table-sm">
            <thead>
              <tr>
                <th>Familia</th>
                <th>Vencimiento</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filas.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-base-content/60">
                    Sin familias en este filtro
                  </td>
                </tr>
              ) : (
                filas.map((f) => {
                  const est = estadoFinanciero(f.fecha_vencimiento)
                  return (
                    <tr key={f.id}>
                      <td className="font-medium">{f.nombre}</td>
                      <td>{f.fecha_vencimiento || "—"}</td>
                      <td>
                        <span
                          className={
                            est === "vencido"
                              ? "badge badge-error badge-sm"
                              : est === "al_corriente"
                                ? "badge badge-success badge-sm"
                                : "badge badge-ghost badge-sm"
                          }
                        >
                          {labelEstadoFinanciero(est)}
                        </span>
                      </td>
                      <td>
                        <Link
                          href={`/familias/${f.id}`}
                          className="link link-primary text-sm"
                        >
                          Registrar pago
                        </Link>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Historial reciente</h2>
        <ul className="space-y-2">
          {(pagos || []).length === 0 ? (
            <li className="text-sm text-base-content/60">Aún no hay pagos</li>
          ) : (
            (pagos || []).map((p) => (
              <li
                key={p.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-box border border-base-200 bg-base-100 px-4 py-3 text-sm"
              >
                <div>
                  <p className="font-medium">
                    {p.familias?.nombre || "Familia"} · $
                    {Number(p.monto).toLocaleString("es-MX")}
                    {p.status === "cancelado" ? (
                      <span className="ml-2 badge badge-ghost badge-xs">
                        Cancelado
                      </span>
                    ) : null}
                  </p>
                  <p className="text-base-content/60">
                    {p.fecha_pago} · {METODO_MAP[p.metodo] || p.metodo} ·{" "}
                    {p.periodos} mes{p.periodos === 1 ? "" : "es"}
                    {p.notas ? ` · ${p.notas}` : ""}
                  </p>
                </div>
                {p.status === "activo" ? (
                  <form action={cancelarPago}>
                    <input type="hidden" name="pago_id" value={p.id} />
                    <button type="submit" className="btn btn-ghost btn-xs">
                      Cancelar
                    </button>
                  </form>
                ) : null}
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  )
}
