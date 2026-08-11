"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { escanearAsistencia } from "@/app/(app)/asistencias/actions"

export default function RegistrarManualForm({ alumnos }) {
  const router = useRouter()
  const [msg, setMsg] = useState(null)
  const [pending, startTransition] = useTransition()

  function onSubmit(e) {
    e.preventDefault()
    setMsg(null)
    const fd = new FormData(e.currentTarget)
    const alumnoId = fd.get("alumno_id")?.toString()
    if (!alumnoId) return
    startTransition(async () => {
      const res = await escanearAsistencia({ alumnoId, origen: "manual" })
      if (res.ok && res.code === "ok") {
        setMsg({ type: "ok", text: `Asistencia: ${res.alumno?.nombre}` })
        router.refresh()
      } else if (res.ok && res.code === "already") {
        setMsg({
          type: "warn",
          text: `${res.alumno?.nombre} ya tenía asistencia hoy`,
        })
      } else if (res.code === "inactive") {
        setMsg({
          type: "err",
          text: "Alumno inactivo: reactívalo primero",
        })
      } else {
        setMsg({ type: "err", text: res.error || "No se pudo registrar" })
      }
    })
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-wrap items-end gap-2 rounded-box border border-dashed border-base-300 p-3"
    >
      <label className="form-control min-w-[200px] flex-1">
        <span className="label-text text-xs">Alumno activo</span>
        <select
          name="alumno_id"
          required
          className="select select-bordered select-sm"
          defaultValue=""
        >
          <option value="" disabled>
            Seleccionar…
          </option>
          {alumnos.map((a) => (
            <option key={a.id} value={a.id}>
              {a.nombre}
            </option>
          ))}
        </select>
      </label>
      <button type="submit" disabled={pending} className="btn btn-sm btn-outline">
        {pending ? "…" : "Registrar"}
      </button>
      {msg ? (
        <p
          className={`w-full text-sm ${
            msg.type === "ok"
              ? "text-success"
              : msg.type === "warn"
                ? "text-warning"
                : "text-error"
          }`}
        >
          {msg.text}
        </p>
      ) : null}
    </form>
  )
}
