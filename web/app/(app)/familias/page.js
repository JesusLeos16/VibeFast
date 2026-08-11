import Link from "next/link"
import { redirect } from "next/navigation"
import { getAcademyContext } from "@/lib/kickiie/academy"
import { createFamiliaConAlumno } from "./actions"
import { CINTAS_LIMA_LAMA } from "@/lib/kickiie/cintas"

export const metadata = { title: "Familias" }

export default async function FamiliasPage() {
  const { academia, supabase, membership } = await getAcademyContext()
  if (!membership) redirect("/setup")

  const { data: familias, error } = await supabase
    .from("familias")
    .select("id, nombre, created_at, alumnos(count), tutores(count)")
    .eq("academia_id", academia.id)
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Familias</h1>
        <p className="mt-1 text-sm text-base-content/70">
          Unidad administrativa de {academia.nombre}. Cada familia agrupa tutores y
          alumnos.
        </p>
      </div>

      <form
        action={createFamiliaConAlumno}
        className="space-y-4 rounded-box border border-base-200 bg-base-100 p-4"
      >
        <p className="text-sm font-semibold">Alta rápida (familia + tutor + alumno)</p>
        <div className="grid gap-2 sm:grid-cols-2">
          <input
            name="familia_nombre"
            required
            maxLength={120}
            placeholder="Nombre de la familia (ej. García)"
            className="input input-bordered sm:col-span-2"
          />
          <input
            name="tutor_nombre"
            required
            maxLength={120}
            placeholder="Tutor principal — nombre"
            className="input input-bordered"
          />
          <input
            name="tutor_telefono"
            maxLength={40}
            placeholder="Teléfono del tutor"
            className="input input-bordered"
          />
          <input
            name="tutor_email"
            type="email"
            maxLength={160}
            placeholder="Email del tutor (opcional)"
            className="input input-bordered"
          />
          <input
            name="tutor_relacion"
            maxLength={60}
            placeholder="Relación (madre, padre…)"
            className="input input-bordered"
          />
          <input
            name="alumno_nombre"
            required
            maxLength={120}
            placeholder="Nombre del alumno"
            className="input input-bordered"
          />
          <input
            name="fecha_nacimiento"
            type="date"
            className="input input-bordered"
            aria-label="Fecha de nacimiento"
          />
          <select name="cinta" className="select select-bordered" defaultValue="blanca">
            {CINTAS_LIMA_LAMA.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </select>
          <input
            name="alumno_telefono"
            maxLength={40}
            placeholder="Teléfono del alumno (opcional)"
            className="input input-bordered"
          />
          <input
            name="notas"
            maxLength={280}
            placeholder="Notas (opcional)"
            className="input input-bordered sm:col-span-2"
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Guardar familia
        </button>
      </form>

      {error && (
        <div className="rounded-lg border border-error/40 bg-error/10 px-4 py-3 text-sm text-error">
          {error.message}
        </div>
      )}

      {!familias?.length ? (
        <p className="text-sm text-base-content/60">Aún no hay familias registradas.</p>
      ) : (
        <ul className="divide-y divide-base-200 rounded-box border border-base-200 bg-base-100">
          {familias.map((f) => {
            const nAlumnos = f.alumnos?.[0]?.count ?? 0
            const nTutores = f.tutores?.[0]?.count ?? 0
            return (
              <li key={f.id}>
                <Link
                  href={`/familias/${f.id}`}
                  className="flex items-center justify-between gap-3 px-4 py-3 transition hover:bg-base-200/60"
                >
                  <span className="font-medium">{f.nombre}</span>
                  <span className="text-sm text-base-content/55">
                    {nTutores} tutor{nTutores === 1 ? "" : "es"} · {nAlumnos} alumno
                    {nAlumnos === 1 ? "" : "s"}
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
