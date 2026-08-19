import { Sparkles, ShieldCheck } from "lucide-react"
import SeguimientoInterpreter from "@/components/ai/SeguimientoInterpreter"

export const metadata = { title: "Kickiie AI" }

export default function AiPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-8">
      <header className="relative overflow-hidden rounded-[1.75rem] border border-base-300 bg-neutral px-6 py-7 text-neutral-content shadow-sm md:px-8 md:py-9">
        <div
          className="absolute -right-10 -top-16 size-48 rounded-full bg-primary/30 blur-3xl"
          aria-hidden="true"
        />
        <div className="relative max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-neutral-content/20 bg-neutral-content/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-neutral-content/75">
            <Sparkles className="size-3.5 text-primary" aria-hidden="true" />
            Semana 3 → 4 · Structured Outputs + Tool Use
          </div>
          <h1 className="mt-5 max-w-2xl text-3xl font-bold tracking-tight md:text-5xl">
            Notas sueltas, seguimiento claro.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-neutral-content/70 md:text-base">
            Kickiie AI entiende una nota administrativa, busca al alumno correcto
            y prepara una escritura controlada para tu confirmación.
          </p>
          <div className="mt-5 flex items-center gap-2 text-xs font-semibold text-neutral-content/60">
            <ShieldCheck className="size-4 text-success" aria-hidden="true" />
            Interpreta · busca · confirma · registra
          </div>
        </div>
      </header>

      <SeguimientoInterpreter />
    </div>
  )
}
