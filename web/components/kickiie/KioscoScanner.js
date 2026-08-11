"use client"

import { useCallback, useEffect, useRef, useState, useTransition } from "react"
import { Html5Qrcode } from "html5-qrcode"
import { escanearAsistencia } from "@/app/(app)/asistencias/actions"

function playTone(kind) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    if (kind === "ok") {
      osc.frequency.value = 880
      gain.gain.value = 0.08
    } else if (kind === "already") {
      osc.frequency.value = 440
      gain.gain.value = 0.06
    } else {
      osc.frequency.value = 220
      gain.gain.value = 0.08
    }
    osc.start()
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25)
    osc.stop(ctx.currentTime + 0.26)
  } catch {
    /* ignore */
  }
}

function extractToken(raw) {
  if (!raw) return null
  const s = String(raw).trim()
  const uuidRe =
    /[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i
  const m = s.match(uuidRe)
  if (m) return m[0]
  const path = s.split("/").filter(Boolean)
  const last = path[path.length - 1]
  if (last && uuidRe.test(last)) return last
  return s.length > 8 ? s : null
}

export default function KioscoScanner({ academiaNombre }) {
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [pending, startTransition] = useTransition()
  const scanningRef = useRef(true)
  const lastTokenRef = useRef("")
  const lastAtRef = useRef(0)
  const scannerRef = useRef(null)

  const handleToken = useCallback((raw) => {
    if (!scanningRef.current || pending) return
    const token = extractToken(raw)
    if (!token) return
    const now = Date.now()
    if (token === lastTokenRef.current && now - lastAtRef.current < 4000) return
    lastTokenRef.current = token
    lastAtRef.current = now
    scanningRef.current = false

    startTransition(async () => {
      const res = await escanearAsistencia({ qrToken: token, origen: "qr" })
      setResult(res)
      setError(null)
      if (res.ok && res.code === "ok") playTone("ok")
      else if (res.ok && res.code === "already") playTone("already")
      else playTone("err")

      window.setTimeout(() => {
        setResult(null)
        scanningRef.current = true
      }, 2800)
    })
  }, [pending])

  useEffect(() => {
    let alive = true
    const id = "kiosco-qr-reader"
    const scanner = new Html5Qrcode(id)
    scannerRef.current = scanner

    scanner
      .start(
        { facingMode: "environment" },
        { fps: 8, qrbox: { width: 240, height: 240 } },
        (decoded) => {
          if (alive) handleToken(decoded)
        },
        () => {}
      )
      .catch((e) => {
        if (alive) {
          setError(
            e?.message ||
              "No se pudo abrir la cámara. Usa HTTPS o localhost y otorga permiso."
          )
        }
      })

    return () => {
      alive = false
      scanner
        .stop()
        .then(() => scanner.clear())
        .catch(() => {})
    }
  }, [handleToken])

  const showConfirm = result?.ok && result.alumno

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-neutral text-neutral-content">
      <header className="flex items-center justify-between px-4 py-3">
        <div>
          <p className="text-xs uppercase tracking-widest opacity-70">Kickiie</p>
          <p className="text-lg font-semibold">{academiaNombre}</p>
        </div>
        <a href="/asistencias" className="btn btn-sm btn-ghost text-neutral-content">
          Salir
        </a>
      </header>

      <div className="relative mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center px-4 pb-8">
        <div
          id="kiosco-qr-reader"
          className={`w-full overflow-hidden rounded-xl ${showConfirm ? "opacity-30" : ""}`}
        />

        {error ? (
          <p className="mt-4 text-center text-sm text-error">{error}</p>
        ) : (
          <p className="mt-4 text-center text-sm opacity-70">
            Apunta el QR de la credencial
          </p>
        )}

        {showConfirm ? (
          <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 rounded-2xl bg-base-100 p-8 text-center text-base-content shadow-xl">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">
              {result.code === "already" ? "Ya registrado hoy" : "Asistencia OK"}
            </p>
            <p className="mt-3 text-3xl font-bold">{result.alumno.nombre}</p>
            <p className="mt-1 text-lg text-base-content/70">
              {result.alumno.cintaLabel}
            </p>
            <p className="mt-4 text-sm text-base-content/50">{academiaNombre}</p>
            {result.staffNotice ? (
              <p className="mt-4 rounded-lg bg-warning/20 px-3 py-2 text-xs font-medium text-warning-content">
                Staff: {result.staffNotice.mensaje}
              </p>
            ) : null}
          </div>
        ) : null}

        {result && !result.ok ? (
          <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 rounded-2xl bg-error p-8 text-center text-error-content shadow-xl">
            <p className="text-xl font-bold">
              {result.code === "inactive"
                ? "Alumno inactivo"
                : result.code === "not_found"
                  ? "QR no reconocido"
                  : "Error"}
            </p>
            {result.alumno?.nombre ? (
              <p className="mt-2">{result.alumno.nombre}</p>
            ) : null}
            {result.code === "inactive" ? (
              <p className="mt-2 text-sm opacity-90">
                Reactívalo desde el expediente o familias
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  )
}
