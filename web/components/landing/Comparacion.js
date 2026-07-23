import config from "@/config"
import Reveal from "./Reveal"

export default function Comparacion() {
  const { id, eyebrow, headline, sistema, tarjeta } = config.landing.comparacion

  return (
    <section id={id} className="border-t border-base-300/70 px-4 pb-12 pt-10 md:px-16 md:pb-14 md:pt-12">
      <div className="mx-auto max-w-5xl">
        <Reveal className="mb-8 max-w-3xl text-left">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-primary">
            {eyebrow}
          </p>
          <h2 className="mt-1.5 text-3xl font-extrabold tracking-tight md:text-[2.15rem] md:leading-[1.15]">
            {headline}
          </h2>
        </Reveal>

        <div className="grid gap-8 border-t border-base-300 pt-8 md:grid-cols-[1.5fr_1fr] md:gap-0">
          <Reveal className="md:border-r md:border-base-300 md:pr-10">
            <h3 className="mb-3 text-xl font-extrabold tracking-tight md:text-2xl">
              {sistema.title}
            </h3>
            <p className="mb-6 max-w-md text-base leading-relaxed text-base-content/70">
              {sistema.body}
            </p>
            <ul className="space-y-3">
              {sistema.items.map((label) => (
                <li key={label} className="flex items-start gap-3 text-sm md:text-base">
                  <span className="mt-2 h-px w-4 shrink-0 bg-primary" aria-hidden />
                  {label}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal className="md:pl-10">
            <h3 className="mb-3 text-lg font-extrabold tracking-tight md:text-xl">
              {tarjeta.title}
            </h3>
            <p className="mb-6 max-w-sm text-sm leading-relaxed text-base-content/65 md:text-base">
              {tarjeta.body}
            </p>
            <ul className="space-y-3">
              {tarjeta.items.map((label) => (
                <li key={label} className="flex items-start gap-3 text-sm text-base-content/80">
                  <span className="mt-2 h-px w-4 shrink-0 bg-base-content/35" aria-hidden />
                  {label}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
