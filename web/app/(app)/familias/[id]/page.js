import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { getAcademyContext } from "@/lib/kickiie/academy"
import { calcularEdad, cintaLabel, CINTAS_LIMA_LAMA } from "@/lib/kickiie/cintas"
import {
  calcularMontoEsperado,
  estadoFinanciero,
  labelEstadoFinanciero,
  METODOS_PAGO,
} from "@/lib/kickiie/pagos"
import RegistrarPagoForm from "@/components/kickiie/RegistrarPagoForm"
import { cancelarPago } from "../../pagos/actions"
import {
  addAlumnoAFamilia,
  addTutor,
  toggleAlumnoStatus,
  updateAlumnoF1,
} from "../actions"

export const metadata = { title: "Familia" }

const METODO_MAP = Object.fromEntries(METODOS_PAGO.map((m) => [m.value, m.label]))

export default async function FamiliaDetailPage({ params }) {
  const { id } = await params
  const { academia, supabase, membership } = await getAcademyContext()
  if (!membership) redirect("/setup")

  const { data: familia } = await supabase
    .from("familias")
    .select("id, nombre, notas, fecha_vencimiento, tutores(*), alumnos(*)")
    .eq("id", id)
    .eq("academia_id", academia.id)
    .maybeSingle()

  if (!familia) notFound()

  const tutores = familia.tutores || []
  const alumnos = familia.alumnos || []
  const nActivos = alumnos.filter((a) => a.status === "active").length

  const [{ data: plan }, { data: pagos }] = await Promise.all([
    supabase
      .from("academia_plan_config")
      .select("precio_base, precio_adicional, moneda")
      .eq("academia_id", academia.id)
      .maybeSingle(),
    supabase
      .from("pagos")
      .select("id, monto, fecha_pago, metodo, periodos, status, notas")
      .eq("familia_id", id)
      .eq("academia_id", academia.id)
      .order("fecha_pago", { ascending: false })
      .limit(20),
  ])

  const montoSugerido = calcularMontoEsperado(nActivos, plan || {})
  const fin = estadoFinanciero(familia.fecha_vencimiento)

  return (
    <div className="space-y-8">
      <div>
        <Link href="/familias" className="text-sm text-primary hover:underline">
          ← Familias
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">
            Familia {familia.nombre}
          </h1>
          <span
            className={
              fin === "vencido"
                ? "badge badge-error"
                : fin === "al_corriente"
                  ? "badge badge-success"
                  : "badge badge-ghost"
            }
          >
            {labelEstadoFinanciero(fin)}
          </span>
        </div>
        <p className="mt-1 text-sm text-base-content/70">
          Vence: {familia.fecha_vencimiento || "sin fecha"} · {nActivos} alumno
          {nActivos === 1 ? "" : "s"} activo{nActivos === 1 ? "" : "s"}
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Pagos</h2>
        <RegistrarPagoForm
          familiaId={familia.id}
          montoSugerido={montoSugerido}
          moneda={plan?.moneda || "MXN"}
        />
        <ul className="space-y-2">
          {(pagos || []).map((p) => (
            <li
              key={p.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-box border border-base-200 bg-base-100 px-3 py-2 text-sm"
            >
              <span>
                {p.fecha_pago} · ${Number(p.monto).toLocaleString("es-MX")} ·{" "}
                {METODO_MAP[p.metodo] || p.metodo}
                {p.status === "cancelado" ? " (cancelado)" : ""}
              </span>
              {p.status === "activo" ? (
                <form action={cancelarPago}>
                  <input type="hidden" name="pago_id" value={p.id} />
                  <button type="submit" className="btn btn-ghost btn-xs">
                    Cancelar
                  </button>
                </form>
              ) : null}
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Tutores</h2>
        <ul className="space-y-2">
          {tutores.map((t) => (
            <li
              key={t.id}
              className="rounded-box border border-base-200 bg-base-100 px-4 py-3 text-sm"
            >
              <p className="font-medium">
                {t.nombre}
                {t.es_principal ? (
                  <span className="ml-2 text-xs font-normal text-primary">
                    Principal
                  </span>
                ) : null}
              </p>
              <p className="text-base-content/60">
                {[t.relacion, t.telefono, t.email].filter(Boolean).join(" · ") ||
                  "Sin contacto"}
              </p>
            </li>
          ))}
        </ul>
        <form
          action={addTutor}
          className="grid gap-2 rounded-box border border-dashed border-base-300 p-3 sm:grid-cols-2"
        >
          <input type="hidden" name="familia_id" value={familia.id} />
          <input
            name="nombre"
            required
            placeholder="Nombre del tutor"
            className="input input-bordered input-sm"
          />
          <input
            name="telefono"
            placeholder="Teléfono"
            className="input input-bordered input-sm"
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            className="input input-bordered input-sm"
          />
          <input
            name="relacion"
            placeholder="Relación"
            className="input input-bordered input-sm"
          />
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input type="checkbox" name="es_principal" className="checkbox checkbox-sm" />
            Marcar como principal
          </label>
          <button type="submit" className="btn btn-sm btn-outline sm:col-span-2">
            Agregar tutor
          </button>
        </form>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Alumnos</h2>
        <ul className="space-y-3">
          {alumnos.map((a) => {
            const edad = calcularEdad(a.fecha_nacimiento)
            return (
              <li
                key={a.id}
                className="rounded-box border border-base-200 bg-base-100 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p
                      className={
                        a.status === "inactive"
                          ? "font-medium text-base-content/40 line-through"
                          : "font-medium"
                      }
                    >
                      <Link
                        href={`/alumnos/${a.id}`}
                        className="hover:text-primary hover:underline"
                      >
                        {a.nombre}
                      </Link>
                    </p>
                    <p className="text-sm text-base-content/60">
                      {cintaLabel(a.cinta)}
                      {edad != null ? ` · ${edad} años` : ""}
                      {a.telefono ? ` · ${a.telefono}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Link
                      href={`/alumnos/${a.id}`}
                      className="btn btn-ghost btn-xs"
                    >
                      Expediente
                    </Link>
                    <form action={toggleAlumnoStatus}>
                      <input type="hidden" name="id" value={a.id} />
                      <input type="hidden" name="status" value={a.status} />
                      <button type="submit" className="btn btn-ghost btn-xs">
                        {a.status === "inactive" ? "Reactivar" : "Inactivar"}
                      </button>
                    </form>
                  </div>
                </div>
                <details className="mt-3 border-t border-base-200 pt-3">
                  <summary className="cursor-pointer text-sm font-medium text-base-content/70">
                    Editar
                  </summary>
                  <form
                    action={updateAlumnoF1}
                    className="mt-2 grid gap-2 sm:grid-cols-2"
                  >
                    <input type="hidden" name="id" value={a.id} />
                    <input
                      name="nombre"
                      required
                      defaultValue={a.nombre}
                      className="input input-bordered input-sm"
                    />
                    <input
                      name="fecha_nacimiento"
                      type="date"
                      defaultValue={a.fecha_nacimiento || ""}
                      className="input input-bordered input-sm"
                    />
                    <select
                      name="cinta"
                      defaultValue={a.cinta}
                      className="select select-bordered select-sm"
                    >
                      {CINTAS_LIMA_LAMA.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                    <input
                      name="telefono"
                      defaultValue={a.telefono || ""}
                      placeholder="Teléfono"
                      className="input input-bordered input-sm"
                    />
                    <input
                      name="notas"
                      defaultValue={a.notas || ""}
                      placeholder="Notas"
                      className="input input-bordered input-sm sm:col-span-2"
                    />
                    <button
                      type="submit"
                      className="btn btn-primary btn-sm sm:col-span-2"
                    >
                      Guardar
                    </button>
                  </form>
                </details>
              </li>
            )
          })}
        </ul>

        <form
          action={addAlumnoAFamilia}
          className="grid gap-2 rounded-box border border-dashed border-base-300 p-3 sm:grid-cols-2"
        >
          <p className="text-sm font-semibold sm:col-span-2">
            Agregar alumno a esta familia
          </p>
          <input type="hidden" name="familia_id" value={familia.id} />
          <input
            name="nombre"
            required
            placeholder="Nombre"
            className="input input-bordered input-sm"
          />
          <input
            name="fecha_nacimiento"
            type="date"
            className="input input-bordered input-sm"
          />
          <select
            name="cinta"
            className="select select-bordered select-sm"
            defaultValue="blanca"
          >
            {CINTAS_LIMA_LAMA.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </select>
          <input
            name="telefono"
            placeholder="Teléfono"
            className="input input-bordered input-sm"
          />
          <button type="submit" className="btn btn-sm btn-outline sm:col-span-2">
            Agregar alumno
          </button>
        </form>
      </section>
    </div>
  )
}
