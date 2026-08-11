"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { registrarPago } from "@/app/(app)/pagos/actions"
import { METODOS_PAGO } from "@/lib/kickiie/pagos"

export default function RegistrarPagoForm({
  familiaId,
  montoSugerido,
  moneda = "MXN",
}) {
  const router = useRouter()
  const [error, setError] = useState(null)
  const [ok, setOk] = useState(false)
  const [pending, startTransition] = useTransition()

  function onSubmit(e) {
    e.preventDefault()
    setError(null)
    setOk(false)
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const res = await registrarPago(fd)
      if (res?.ok) {
        setOk(true)
        e.target.reset()
        router.refresh()
      } else {
        setError(res?.error || "No se pudo registrar")
      }
    })
  }

  return (
    <form
      onSubmit={onSubmit}
      className="grid gap-2 rounded-box border border-base-200 bg-base-100 p-4 sm:grid-cols-2"
    >
      <input type="hidden" name="familia_id" value={familiaId} />
      <p className="text-sm font-semibold sm:col-span-2">Registrar pago</p>
      <p className="text-xs text-base-content/60 sm:col-span-2">
        Sugerido: ${Number(montoSugerido).toLocaleString("es-MX")} {moneda}{" "}
        (puedes sobrescribir)
      </p>
      <label className="form-control">
        <span className="label-text text-xs">Monto</span>
        <input
          name="monto"
          type="number"
          step="0.01"
          min="0.01"
          required
          defaultValue={montoSugerido || ""}
          className="input input-bordered input-sm"
        />
      </label>
      <label className="form-control">
        <span className="label-text text-xs">Periodos (meses)</span>
        <input
          name="periodos"
          type="number"
          min="1"
          defaultValue={1}
          className="input input-bordered input-sm"
        />
      </label>
      <label className="form-control">
        <span className="label-text text-xs">Fecha de pago</span>
        <input
          name="fecha_pago"
          type="date"
          className="input input-bordered input-sm"
        />
      </label>
      <label className="form-control">
        <span className="label-text text-xs">Método</span>
        <select
          name="metodo"
          className="select select-bordered select-sm"
          defaultValue="efectivo"
        >
          {METODOS_PAGO.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
      </label>
      <input
        name="notas"
        placeholder="Notas (opcional)"
        className="input input-bordered input-sm sm:col-span-2"
      />
      {error ? (
        <p className="text-sm text-error sm:col-span-2">{error}</p>
      ) : null}
      {ok ? (
        <p className="text-sm text-success sm:col-span-2">Pago registrado</p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="btn btn-primary btn-sm sm:col-span-2"
      >
        {pending ? "Guardando…" : "Registrar pago"}
      </button>
    </form>
  )
}
