"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { uploadDocumentoFirmado } from "@/app/(app)/alumnos/actions"

export default function UploadDocumentoForm({ alumnoId, tipo }) {
  const router = useRouter()
  const [msg, setMsg] = useState(null)
  const [pending, startTransition] = useTransition()

  function onSubmit(e) {
    e.preventDefault()
    setMsg(null)
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const res = await uploadDocumentoFirmado(fd)
      if (res?.ok) {
        setMsg({ ok: true, text: "Firmado subido" })
        e.target.reset()
        router.refresh()
      } else {
        setMsg({ ok: false, text: res?.error || "Error al subir" })
      }
    })
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="alumno_id" value={alumnoId} />
      <input type="hidden" name="tipo" value={tipo} />
      <input
        type="file"
        name="file"
        required
        accept="image/*,application/pdf"
        className="file-input file-input-bordered file-input-xs max-w-xs"
      />
      <button type="submit" disabled={pending} className="btn btn-xs btn-outline">
        {pending ? "Subiendo…" : "Subir firmado"}
      </button>
      {msg ? (
        <span className={msg.ok ? "text-xs text-success" : "text-xs text-error"}>
          {msg.text}
        </span>
      ) : null}
    </form>
  )
}
