import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { getAcademyContext } from "@/lib/kickiie/academy"
import { calcularEdad, cintaLabel, CINTAS_LIMA_LAMA } from "@/lib/kickiie/cintas"
import {
  estadoFinanciero,
  labelEstadoFinanciero,
} from "@/lib/kickiie/pagos"
import { toggleAlumnoStatus, updateAlumnoF1 } from "../../familias/actions"
import {
  addContactoEmergencia,
  deleteContactoEmergencia,
  ensureDocumento,
  updateExpedienteMedico,
} from "../actions"
import UploadDocumentoForm from "@/components/kickiie/UploadDocumentoForm"

export const metadata = { title: "Expediente" }

const DOC_TIPOS = [
  { value: "responsiva", label: "Responsiva" },
  { value: "consentimiento", label: "Consentimiento" },
  { value: "privacidad", label: "Privacidad" },
  { value: "otro", label: "Otro" },
]

export default async function AlumnoDetallePage({ params }) {
  const { id } = await params
  const { academia, supabase, membership } = await getAcademyContext()
  if (!membership) redirect("/setup")

  const { data: alumno } = await supabase
    .from("alumnos")
    .select(
      "*, familias(id, nombre, fecha_vencimiento), contactos_emergencia(*), documentos(*)"
    )
    .eq("id", id)
    .eq("academia_id", academia.id)
    .maybeSingle()

  if (!alumno) notFound()

  const edad = calcularEdad(alumno.fecha_nacimiento)
  const fin = estadoFinanciero(alumno.familias?.fecha_vencimiento)
  const contactos = alumno.contactos_emergencia || []
  const docs = alumno.documentos || []

  const incompleto =
    !alumno.info_medica ||
    contactos.length === 0 ||
    !docs.some((d) => d.tipo === "responsiva" && d.estado === "firmado")

  return (
    <div className="space-y-8">
      <div>
        <Link href="/alumnos" className="text-sm text-primary hover:underline">
          ← Alumnos
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">{alumno.nombre}</h1>
          {alumno.status === "inactive" ? (
            <span className="badge badge-ghost">Inactivo</span>
          ) : null}
          {incompleto ? (
            <span className="badge badge-warning badge-sm">
              Expediente incompleto
            </span>
          ) : (
            <span className="badge badge-success badge-sm">Expediente ok</span>
          )}
        </div>
        <p className="mt-1 text-sm text-base-content/70">
          {cintaLabel(alumno.cinta)}
          {edad != null ? ` · ${edad} años` : ""}
          {alumno.familias ? (
            <>
              {" "}
              ·{" "}
              <Link
                href={`/familias/${alumno.familias.id}`}
                className="text-primary hover:underline"
              >
                Familia {alumno.familias.nombre}
              </Link>
            </>
          ) : null}
          {" · "}
          <span
            className={
              fin === "vencido" ? "font-medium text-error" : "text-base-content/60"
            }
          >
            {labelEstadoFinanciero(fin)} (solo staff)
          </span>
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <a
          href={`/api/credenciales/${alumno.id}`}
          className="btn btn-primary btn-sm"
          target="_blank"
          rel="noreferrer"
        >
          Descargar credencial PDF
        </a>
        <a
          href={`/api/responsiva/${alumno.id}`}
          className="btn btn-outline btn-sm"
          target="_blank"
          rel="noreferrer"
        >
          Descargar responsiva PDF
        </a>
        <form action={toggleAlumnoStatus}>
          <input type="hidden" name="id" value={alumno.id} />
          <input type="hidden" name="status" value={alumno.status} />
          <button type="submit" className="btn btn-ghost btn-sm">
            {alumno.status === "inactive" ? "Reactivar" : "Inactivar"}
          </button>
        </form>
      </div>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Datos básicos</h2>
        <form
          action={updateAlumnoF1}
          className="grid gap-2 rounded-box border border-base-200 bg-base-100 p-4 sm:grid-cols-2"
        >
          <input type="hidden" name="id" value={alumno.id} />
          <input
            name="nombre"
            required
            defaultValue={alumno.nombre}
            className="input input-bordered input-sm"
          />
          <input
            name="fecha_nacimiento"
            type="date"
            defaultValue={alumno.fecha_nacimiento || ""}
            className="input input-bordered input-sm"
          />
          <select
            name="cinta"
            defaultValue={alumno.cinta}
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
            defaultValue={alumno.telefono || ""}
            placeholder="Teléfono"
            className="input input-bordered input-sm"
          />
          <input
            name="notas"
            defaultValue={alumno.notas || ""}
            placeholder="Notas"
            className="input input-bordered input-sm sm:col-span-2"
          />
          <p className="text-xs text-base-content/50 sm:col-span-2">
            QR token: <code className="text-xs">{alumno.qr_token || "—"}</code>
          </p>
          <button type="submit" className="btn btn-primary btn-sm sm:col-span-2">
            Guardar datos
          </button>
        </form>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Información médica</h2>
        <form
          action={updateExpedienteMedico}
          className="grid gap-2 rounded-box border border-base-200 bg-base-100 p-4"
        >
          <input type="hidden" name="alumno_id" value={alumno.id} />
          <textarea
            name="info_medica"
            rows={3}
            defaultValue={alumno.info_medica || ""}
            placeholder="Alergias, padecimientos, notas médicas…"
            className="textarea textarea-bordered textarea-sm"
          />
          <input
            name="seguro"
            defaultValue={alumno.seguro || ""}
            placeholder="Seguro médico (opcional)"
            className="input input-bordered input-sm"
          />
          <button type="submit" className="btn btn-outline btn-sm">
            Guardar médico
          </button>
        </form>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Contactos de emergencia</h2>
        <ul className="space-y-2">
          {contactos.map((c) => (
            <li
              key={c.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-box border border-base-200 bg-base-100 px-3 py-2 text-sm"
            >
              <span>
                {c.nombre}
                {c.telefono ? ` · ${c.telefono}` : ""}
                {c.relacion ? ` · ${c.relacion}` : ""}
              </span>
              <form action={deleteContactoEmergencia}>
                <input type="hidden" name="contacto_id" value={c.id} />
                <input type="hidden" name="alumno_id" value={alumno.id} />
                <button type="submit" className="btn btn-ghost btn-xs">
                  Quitar
                </button>
              </form>
            </li>
          ))}
        </ul>
        <form
          action={addContactoEmergencia}
          className="grid gap-2 rounded-box border border-dashed border-base-300 p-3 sm:grid-cols-3"
        >
          <input type="hidden" name="alumno_id" value={alumno.id} />
          <input
            name="nombre"
            required
            placeholder="Nombre"
            className="input input-bordered input-sm"
          />
          <input
            name="telefono"
            placeholder="Teléfono"
            className="input input-bordered input-sm"
          />
          <input
            name="relacion"
            placeholder="Relación"
            className="input input-bordered input-sm"
          />
          <button type="submit" className="btn btn-sm btn-outline sm:col-span-3">
            Agregar contacto
          </button>
        </form>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Documentos</h2>
        <p className="text-xs text-base-content/50">
          Textos legales placeholder — revisa con abogado antes de uso real.
        </p>
        <ul className="space-y-3">
          {DOC_TIPOS.map((t) => {
            const doc = docs.find((d) => d.tipo === t.value)
            return (
              <li
                key={t.value}
                className="rounded-box border border-base-200 bg-base-100 p-4 text-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-medium">{t.label}</p>
                    <p className="text-base-content/60">
                      Estado: {doc?.estado || "pendiente"}
                      {doc?.file_path ? " · archivo en storage" : ""}
                    </p>
                  </div>
                  <form action={ensureDocumento}>
                    <input type="hidden" name="alumno_id" value={alumno.id} />
                    <input type="hidden" name="tipo" value={t.value} />
                    <button type="submit" className="btn btn-ghost btn-xs">
                      Marcar generado
                    </button>
                  </form>
                </div>
                <div className="mt-3">
                  <UploadDocumentoForm alumnoId={alumno.id} tipo={t.value} />
                </div>
              </li>
            )
          })}
        </ul>
      </section>
    </div>
  )
}
