import { Pencil, RotateCcw, Trash2, UserMinus, UserPlus } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import {
  createAlumno,
  updateAlumno,
  toggleAlumno,
  deleteAlumno,
} from "./actions"

export const metadata = { title: "Alumnos" }

const GRADOS = [
  "Cinturón blanco",
  "Cinturón amarillo",
  "Cinturón naranja",
  "Cinturón verde",
  "Cinturón azul",
  "Cinturón café",
  "Cinturón negro",
]

function statusLabel(status) {
  return status === "inactive" ? "Baja" : "Activo"
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: alumnos, error } = await supabase
    .from("alumnos")
    .select("*")
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Alumnos</h1>
        <p className="mt-1 text-sm text-base-content/70">
          Registra a tus alumnos, su grado y grupo. La credencial física con QR
          llega en la próxima actualización.
        </p>
      </div>

      {/* Crear */}
      <form
        action={createAlumno}
        className="space-y-3 rounded-box border border-base-200 bg-base-100 p-4"
      >
        <p className="text-sm font-semibold">Nuevo alumno</p>
        <div className="grid gap-2 sm:grid-cols-2">
          <input
            name="nombre"
            required
            maxLength={120}
            placeholder="Nombre completo"
            aria-label="Nombre del alumno"
            className="input input-bordered"
          />
          <select
            name="grado"
            aria-label="Grado / cinturón"
            className="select select-bordered"
            defaultValue="Cinturón blanco"
          >
            {GRADOS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
          <input
            name="grupo"
            maxLength={80}
            placeholder="Grupo (ej. Infantes mar/jue)"
            aria-label="Grupo"
            className="input input-bordered"
          />
          <input
            name="email_tutor"
            type="email"
            maxLength={160}
            placeholder="Email del tutor / papá (opcional)"
            aria-label="Email del tutor"
            className="input input-bordered"
          />
          <input
            name="notas"
            maxLength={280}
            placeholder="Notas (opcional)"
            aria-label="Notas"
            className="input input-bordered sm:col-span-2"
          />
        </div>
        <button type="submit" className="btn btn-primary">
          <UserPlus className="size-4" />
          Agregar alumno
        </button>
      </form>

      {error && (
        <div className="rounded-lg border border-error/40 bg-error/10 px-4 py-3 text-sm text-error">
          No pudimos cargar tus alumnos: {error.message}
        </div>
      )}

      {/* Lista */}
      {!alumnos?.length ? (
        <div className="rounded-box border border-dashed border-base-300 bg-base-100 px-4 py-12 text-center text-base-content/60">
          Aún no tienes alumnos. Registra el primero arriba.
        </div>
      ) : (
        <ul className="space-y-3">
          {alumnos.map((alumno) => (
            <li
              key={alumno.id}
              className="rounded-box border border-base-200 bg-base-100 px-4 py-3"
            >
              <div className="flex flex-wrap items-start gap-3">
                <div className="min-w-0 flex-1">
                  <p
                    className={
                      alumno.status === "inactive"
                        ? "truncate font-medium text-base-content/40 line-through"
                        : "truncate font-medium"
                    }
                  >
                    {alumno.nombre}
                  </p>
                  <p className="mt-0.5 truncate text-sm text-base-content/60">
                    {alumno.grado}
                    {alumno.grupo ? ` · ${alumno.grupo}` : ""}
                    {alumno.email_tutor ? ` · ${alumno.email_tutor}` : ""}
                  </p>
                  {alumno.notas && (
                    <p className="mt-1 truncate text-sm text-base-content/50">
                      {alumno.notas}
                    </p>
                  )}
                </div>

                <span
                  className={`badge badge-sm ${
                    alumno.status === "inactive"
                      ? "badge-ghost"
                      : "badge-success"
                  }`}
                >
                  {statusLabel(alumno.status)}
                </span>

                <form action={toggleAlumno}>
                  <input type="hidden" name="id" value={alumno.id} />
                  <input type="hidden" name="status" value={alumno.status} />
                  <button
                    type="submit"
                    className="btn btn-ghost btn-sm btn-square"
                    title={
                      alumno.status === "inactive"
                        ? "Reactivar alumno"
                        : "Dar de baja"
                    }
                    aria-label={
                      alumno.status === "inactive"
                        ? `Reactivar ${alumno.nombre}`
                        : `Dar de baja a ${alumno.nombre}`
                    }
                  >
                    {alumno.status === "inactive" ? (
                      <RotateCcw className="size-4" />
                    ) : (
                      <UserMinus className="size-4" />
                    )}
                  </button>
                </form>

                <form action={deleteAlumno}>
                  <input type="hidden" name="id" value={alumno.id} />
                  <button
                    type="submit"
                    className="btn btn-ghost btn-sm btn-square text-error"
                    title="Borrar"
                    aria-label={`Borrar ${alumno.nombre}`}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </form>
              </div>

              <details className="mt-3 border-t border-base-200 pt-3">
                <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-medium text-base-content/70">
                  <Pencil className="size-3.5" />
                  Editar alumno
                </summary>
                <form action={updateAlumno} className="mt-3 grid gap-2 sm:grid-cols-2">
                  <input type="hidden" name="id" value={alumno.id} />
                  <input
                    name="nombre"
                    required
                    maxLength={120}
                    defaultValue={alumno.nombre}
                    aria-label="Nombre del alumno"
                    className="input input-bordered input-sm"
                  />
                  <select
                    name="grado"
                    aria-label="Grado / cinturón"
                    className="select select-bordered select-sm"
                    defaultValue={
                      GRADOS.includes(alumno.grado)
                        ? alumno.grado
                        : "Cinturón blanco"
                    }
                  >
                    {!GRADOS.includes(alumno.grado) && (
                      <option value={alumno.grado}>{alumno.grado}</option>
                    )}
                    {GRADOS.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                  <input
                    name="grupo"
                    maxLength={80}
                    defaultValue={alumno.grupo || ""}
                    placeholder="Grupo"
                    aria-label="Grupo"
                    className="input input-bordered input-sm"
                  />
                  <input
                    name="email_tutor"
                    type="email"
                    maxLength={160}
                    defaultValue={alumno.email_tutor || ""}
                    placeholder="Email del tutor"
                    aria-label="Email del tutor"
                    className="input input-bordered input-sm"
                  />
                  <input
                    name="notas"
                    maxLength={280}
                    defaultValue={alumno.notas || ""}
                    placeholder="Notas"
                    aria-label="Notas"
                    className="input input-bordered input-sm sm:col-span-2"
                  />
                  <button type="submit" className="btn btn-primary btn-sm sm:col-span-2">
                    Guardar cambios
                  </button>
                </form>
              </details>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
