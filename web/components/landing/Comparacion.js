import { Check, RefreshCw, CreditCard } from "lucide-react"
import config from "@/config"
import Reveal from "./Reveal"

const ICONS = { Check, RefreshCw, CreditCard }

export default function Comparacion() {
  const { id, imprime, cambia } = config.landing.comparacion

  return (
    <section id={id} className="border-t border-base-300 px-4 py-16 md:px-16 md:py-20">
      <div className="mx-auto grid max-w-5xl gap-12 md:grid-cols-2 md:gap-6">
        <Reveal>
          <h2 className="mb-4 text-3xl font-extrabold tracking-tight md:text-[40px] md:leading-[1.12]">
            {imprime.title}
          </h2>
          <p className="mb-8 text-base leading-relaxed text-base-content/70">{imprime.body}</p>
          <ul className="space-y-4">
            {imprime.items.map(({ icon, label }) => {
              const Icon = ICONS[icon] || Check
              return (
                <li key={label} className="flex items-center gap-3">
                  <Icon className="size-5 shrink-0 text-primary" strokeWidth={2} />
                  {label}
                </li>
              )
            })}
          </ul>
        </Reveal>

        <Reveal>
          <h2 className="mb-4 text-3xl font-extrabold tracking-tight md:text-[40px] md:leading-[1.12]">
            {cambia.title}
          </h2>
          <p className="mb-8 text-base leading-relaxed text-base-content/70">{cambia.body}</p>
          <ul className="space-y-4">
            {cambia.items.map(({ icon, label }) => {
              const Icon = ICONS[icon] || RefreshCw
              return (
                <li key={label} className="flex items-center gap-3">
                  <Icon className="size-5 shrink-0 text-primary" strokeWidth={2} />
                  {label}
                </li>
              )
            })}
          </ul>
        </Reveal>
      </div>
    </section>
  )
}
