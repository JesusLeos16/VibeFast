"use client"

import { useState } from "react"
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Clipboard,
  FileText,
  Search,
  ShieldCheck,
  Sparkles,
  UserCheck,
} from "lucide-react"

const DEFAULT_NOTE =
  "La mamá de Diego dijo que no vendrá dos semanas porque salen de viaje y regresa el 28."

const EXAMPLES = [
  { label: "Ausencia", value: DEFAULT_NOTE },
  {
    label: "Pago",
    value: "La familia de Mateo avisó que hará la transferencia el viernes; confirmar cuando llegue.",
  },
  {
    label: "Documento",
    value: "A Sofía todavía le falta entregar la responsiva firmada antes del próximo examen.",
  },
]

const TYPE_LABELS = {
  absence: "Ausencia",
  payment: "Pago",
  medical: "Salud / emergencia",
  document: "Documento",
  event: "Evento",
  general: "General",
}

const PRIORITY_LABELS = { low: "Baja", normal: "Normal", high: "Alta" }

const ACTION_LABELS = {
  crear_seguimiento: "Crear seguimiento",
  revisar_pago: "Revisar pago",
  revisar_documento: "Revisar documento",
  contactar_tutor: "Contactar tutor",
  revisar_manualmente: "Revisar manualmente",
  sin_accion: "Sin acción sugerida",
}

function Field({ label, children }) {
  return (
    <div className="rounded-xl border border-base-300/80 bg-base-200/40 p-3">
      <dt className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-base-content/50">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-medium">{children}</dd>
    </div>
  )
}

function newIdempotencyKey() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
    const random = (Date.now() + Math.random() * 16) % 16 | 0
    return (char === "x" ? random : (random & 0x3) | 0x8).toString(16)
  })
}

export default function SeguimientoInterpreter() {
  const [note, setNote] = useState(DEFAULT_NOTE)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [matching, setMatching] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [matchError, setMatchError] = useState(null)
  const [candidates, setCandidates] = useState([])
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [savedFollowUp, setSavedFollowUp] = useState(null)
  const [copied, setCopied] = useState(false)
  const [idempotencyKey, setIdempotencyKey] = useState(null)

  function resetFlow() {
    setResult(null)
    setCandidates([])
    setSelectedStudent(null)
    setSavedFollowUp(null)
    setMatchError(null)
    setIdempotencyKey(null)
    setError(null)
    setCopied(false)
  }

  async function findStudent(student) {
    if (!student) {
      setMatchError("No se identificó un alumno en la nota.")
      return
    }

    setMatching(true)
    setMatchError(null)

    try {
      const response = await fetch("/api/ai/follow-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "match", student }),
      })
      const payload = await response.json()

      if (!response.ok) {
        throw new Error(payload.error || "No pudimos buscar al alumno.")
      }

      setCandidates(payload.candidates || [])
    } catch (err) {
      setMatchError(err?.message || "No pudimos buscar al alumno.")
    } finally {
      setMatching(false)
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const value = note.trim()
    if (!value || loading) return

    resetFlow()
    setLoading(true)

    try {
      const response = await fetch("/api/ai/structured", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: value }),
      })
      const payload = await response.json()

      if (!response.ok) {
        throw new Error(payload.error || "No pudimos interpretar la nota.")
      }

      setResult(payload.result)
      setIdempotencyKey(newIdempotencyKey())
      await findStudent(payload.result?.student)
    } catch (err) {
      setError(err?.message || "Algo salió mal. Intenta de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate() {
    if (!result || !selectedStudent || !idempotencyKey || saving) return

    setSaving(true)
    setError(null)

    try {
      const response = await fetch("/api/ai/follow-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          alumno_id: selectedStudent.id,
          draft: result,
          source_note: note.trim(),
          idempotency_key: idempotencyKey,
          confirmed: true,
        }),
      })
      const payload = await response.json()

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || "No se pudo registrar el seguimiento.")
      }

      setSavedFollowUp(payload)
    } catch (err) {
      setError(err?.message || "No se pudo registrar el seguimiento.")
    } finally {
      setSaving(false)
    }
  }

  async function copyJson() {
    if (!result || !navigator.clipboard) return
    await navigator.clipboard.writeText(JSON.stringify(result, null, 2))
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  const priorityClass =
    result?.priority === "high"
      ? "bg-error/10 text-error"
      : result?.priority === "low"
        ? "bg-base-200 text-base-content/70"
        : "bg-warning/15 text-warning-content"

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <section className="rounded-[1.5rem] border border-base-300 bg-base-100 p-5 shadow-sm md:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
              Entrada libre
            </p>
            <h2 className="mt-2 text-xl font-bold tracking-tight">
              Cuéntale qué pasó.
            </h2>
          </div>
          <div className="rounded-2xl bg-primary/10 p-3 text-primary">
            <FileText className="size-5" aria-hidden="true" />
          </div>
        </div>

        <p className="mt-3 text-sm leading-6 text-base-content/65">
          Escribe la nota como la dirías normalmente. Kickiie AI la interpreta,
          busca al alumno y prepara un registro para tu confirmación.
        </p>

        <div className="mt-5 flex flex-wrap gap-2" aria-label="Ejemplos de notas">
          {EXAMPLES.map((example) => (
            <button
              key={example.label}
              type="button"
              disabled={loading || saving}
              onClick={() => {
                setNote(example.value)
                resetFlow()
              }}
              className="rounded-full border border-base-300 px-3 py-1.5 text-xs font-semibold text-base-content/70 transition hover:border-primary hover:text-primary"
            >
              {example.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="mt-4">
          <label htmlFor="seguimiento-note" className="sr-only">
            Nota del administrador
          </label>
          <textarea
            id="seguimiento-note"
            value={note}
            disabled={loading || saving}
            onChange={(event) => {
              setNote(event.target.value)
              if (result) resetFlow()
            }}
            maxLength={2000}
            rows={7}
            placeholder="Ej. La mamá de Diego avisó que..."
            className="textarea textarea-bordered w-full resize-y bg-base-100 text-base leading-7"
          />

          <div className="mt-2 flex items-center justify-between gap-3 text-xs text-base-content/50">
            <span>Máximo 2000 caracteres</span>
            <span>{note.length}/2000</span>
          </div>

          <button
            type="submit"
            disabled={loading || !note.trim()}
            className="btn btn-primary mt-5 w-full gap-2"
          >
            {loading ? (
              <span className="loading loading-spinner loading-sm" aria-hidden="true" />
            ) : (
              <Sparkles className="size-4" aria-hidden="true" />
            )}
            {loading ? "Interpretando y buscando…" : "Interpretar nota"}
          </button>
        </form>

        <div className="mt-5 flex gap-3 rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs leading-5 text-base-content/65">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
          <p>
            <strong className="text-base-content">La escritura requiere confirmación.</strong>{" "}
            La herramienta nunca recibe un academy_id del navegador y no cambia
            pagos ni asistencias.
          </p>
        </div>
      </section>

      <section className="rounded-[1.5rem] border border-base-300 bg-base-100 p-5 shadow-sm md:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
              Propuesta + tool
            </p>
            <h2 className="mt-2 text-xl font-bold tracking-tight">
              Revisa antes de guardar.
            </h2>
          </div>
          {result ? (
            <button
              type="button"
              onClick={copyJson}
              className="btn btn-ghost btn-sm gap-2"
              title="Copiar JSON"
            >
              {copied ? (
                <Check className="size-4 text-success" aria-hidden="true" />
              ) : (
                <Clipboard className="size-4" aria-hidden="true" />
              )}
              {copied ? "Copiado" : "Copiar JSON"}
            </button>
          ) : null}
        </div>

        {error ? (
          <div role="alert" className="alert alert-error mt-6 text-sm">
            <AlertCircle className="size-5" aria-hidden="true" />
            <span>{error}</span>
          </div>
        ) : result ? (
          <div className="mt-6 space-y-5">
            <dl className="grid gap-3 sm:grid-cols-2">
              <Field label="Alumno mencionado">
                {result.student || "No identificado"}
              </Field>
              <Field label="Tipo">{TYPE_LABELS[result.type] || result.type}</Field>
              <Field label="Regreso / fecha">
                {result.return_date || "No indicada"}
              </Field>
              <Field label="Prioridad">
                <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${priorityClass}`}>
                  {PRIORITY_LABELS[result.priority] || result.priority}
                </span>
              </Field>
            </dl>

            <div className="rounded-xl border-l-4 border-primary bg-primary/5 p-4">
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-primary">
                Resumen
              </p>
              <p className="mt-2 text-sm leading-6">{result.summary}</p>
            </div>

            <div className="rounded-xl border border-base-300 p-4">
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-base-content/50">
                Acción sugerida
              </p>
              <p className="mt-2 text-sm font-semibold">
                {ACTION_LABELS[result.suggested_action] || result.suggested_action}
              </p>
            </div>

            {(result.missing_information || []).length > 0 ? (
              <div className="rounded-xl border border-warning/30 bg-warning/10 p-4 text-sm">
                <p className="font-bold">Falta revisar</p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-base-content/70">
                  {result.missing_information.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="rounded-xl border border-base-300 bg-base-200/30 p-4">
              <div className="flex items-start gap-3">
                <Search className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-base-content/50">
                    Alumno en la academia activa
                  </p>
                  {matching ? (
                    <p className="mt-2 flex items-center gap-2 text-sm text-base-content/65">
                      <span className="loading loading-spinner loading-xs" />
                      Buscando coincidencias…
                    </p>
                  ) : matchError ? (
                    <p className="mt-2 text-sm text-error">{matchError}</p>
                  ) : candidates.length > 0 ? (
                    <p className="mt-2 text-sm text-base-content/65">
                      Selecciona el alumno correcto antes de guardar.
                    </p>
                  ) : (
                    <p className="mt-2 text-sm text-base-content/65">
                      No encontré coincidencias. No se puede guardar sin confirmar
                      una identidad.
                    </p>
                  )}
                </div>
              </div>

              {candidates.length > 0 ? (
                <div className="mt-4 grid gap-2">
                  {candidates.map((candidate) => {
                    const selected = selectedStudent?.id === candidate.id
                    return (
                      <button
                        key={candidate.id}
                        type="button"
                        onClick={() => setSelectedStudent(candidate)}
                        className={`flex items-center justify-between gap-3 rounded-xl border p-3 text-left transition ${
                          selected
                            ? "border-primary bg-primary/10"
                            : "border-base-300 bg-base-100 hover:border-primary/60"
                        }`}
                      >
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-semibold">
                            {candidate.nombre}
                          </span>
                          <span className="mt-1 block text-xs text-base-content/55">
                            {candidate.cinta || "Sin cinta"} · {candidate.status === "active" ? "Activo" : "Inactivo"}
                          </span>
                        </span>
                        {selected ? (
                          <CheckCircle2 className="size-5 shrink-0 text-primary" aria-hidden="true" />
                        ) : null}
                      </button>
                    )
                  })}
                </div>
              ) : null}
            </div>

            {savedFollowUp ? (
              <div role="status" className="alert alert-success text-sm">
                <CheckCircle2 className="size-5" aria-hidden="true" />
                <span>
                  Seguimiento guardado para {savedFollowUp.seguimiento?.alumno?.nombre || selectedStudent?.nombre}.
                  {savedFollowUp.already_exists ? " La confirmación ya existía." : ""}
                </span>
              </div>
            ) : selectedStudent ? (
              <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
                <div className="flex items-start gap-3">
                  <UserCheck className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
                  <div>
                    <p className="font-bold">Confirmación requerida</p>
                    <p className="mt-1 text-sm leading-6 text-base-content/70">
                      Se guardará este seguimiento para <strong>{selectedStudent.nombre}</strong>.
                      El registro no cambia su pago, asistencia ni cinta.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCreate}
                  disabled={saving}
                  className="btn btn-primary mt-4 w-full gap-2"
                >
                  {saving ? (
                    <span className="loading loading-spinner loading-sm" aria-hidden="true" />
                  ) : (
                    <CheckCircle2 className="size-4" aria-hidden="true" />
                  )}
                  {saving ? "Guardando…" : "Confirmar y guardar seguimiento"}
                </button>
              </div>
            ) : null}

            <details className="rounded-xl border border-base-300 bg-neutral text-neutral-content">
              <summary className="cursor-pointer px-4 py-3 text-sm font-semibold">
                Ver JSON validado
              </summary>
              <pre className="overflow-x-auto border-t border-neutral-content/15 p-4 text-xs leading-5">
                {JSON.stringify(result, null, 2)}
              </pre>
            </details>
          </div>
        ) : (
          <div className="mt-6 flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-base-300 bg-base-200/30 px-6 text-center">
            <div className="rounded-2xl bg-base-100 p-3 text-primary shadow-sm">
              <Sparkles className="size-6" aria-hidden="true" />
            </div>
            <p className="mt-4 max-w-xs text-sm font-semibold">
              Tu resultado aparecerá aquí.
            </p>
            <p className="mt-2 max-w-sm text-xs leading-5 text-base-content/55">
              Primero se valida la salida; después se busca al alumno y se pide
              confirmación antes de escribir.
            </p>
          </div>
        )}
      </section>
    </div>
  )
}
