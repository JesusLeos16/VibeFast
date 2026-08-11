"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { ejecutarChequeoInactividad } from "@/app/(app)/dashboard/inactividad-actions"

export default function ChequeoInactividadButton() {
  const router = useRouter()
  const [msg, setMsg] = useState(null)
  const [pending, startTransition] = useTransition()

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        disabled={pending}
        className="btn btn-sm btn-outline"
        onClick={() => {
          setMsg(null)
          startTransition(async () => {
            const res = await ejecutarChequeoInactividad()
            if (res?.ok) {
              setMsg(`Marcados inactivos: ${res.marked}`)
              router.refresh()
            } else {
              setMsg(res?.error || "Error")
            }
          })
        }}
      >
        {pending ? "Ejecutando…" : "Ejecutar chequeo"}
      </button>
      {msg ? <span className="text-sm text-base-content/70">{msg}</span> : null}
    </div>
  )
}
