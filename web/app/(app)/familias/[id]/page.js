import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { getAcademyContext } from "@/lib/kickiie/academy"
import { calcularEdad, cintaLabel, CINTAS_LIMA_LAMA } from "@/lib/kickiie/cintas"
import {
  addAlumnoAFamilia,
  addTutor,
  toggleAlumnoStatus,
  updateAlumnoF1,
} from "../actions"

export const metadata = { title: "Familia" }

export default async function FamiliaDetailPage({ params }) {
  const { id } = await params
  const { academia, supabase, membership } = await getAcademyContext()
  if (!membership) redirect("/setup")

  const { data: familia } = await supabase
    .from("familias")
    .select("id, nombre, notas, tutores(*), alumnos(*)")
    .eq("id", id)
    .eq("academia_id", academia.id)
    .maybeSingle()

  if (!familia) notFound()

  const tutores = familia.tutores || []
  const alumnos = familia.alumnos || []

  return (
    <div className="space-y-8">
      <div>
        <Link href="/familias" className="text-sm text-primary hover:underline">
          ← Familias
        </Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">
          Familia {familia.nombre}
        </h1>
      </div>

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
                      {a.nombre}
                    </p>
                    <p className="text-sm text-base-content/60">
                      {cintaLabel(a.cinta)}
                      {edad != null ? ` · ${edad} años` : ""}
                      {a.telefono ? ` · ${a.telefono}` : ""}
                    </p>
                  </div>
                  <form action={toggleAlumnoStatus}>
                    <input type="hidden" name="id" value={a.id} />
                    <input type="hidden" name="status" value={a.status} />
                    <button type="submit" className="btn btn-ghost btn-xs">
                      {a.status === "inactive" ? "Reactivar" : "Inactivar"}
                    </button>
                  </form>
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
