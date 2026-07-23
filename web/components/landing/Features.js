import * as LucideIcons from "lucide-react"
import config from "@/config"
import Reveal from "./Reveal"

function Icon({ name, className }) {
  const Cmp = LucideIcons[name] || LucideIcons.Square
  return <Cmp className={className} strokeWidth={1.5} />
}

export default function Features() {
  const { eyebrow, title, subtitle, primary, secondary } = config.landing.features

  return (
    <section id="features" className="border-t border-base-300/70 px-4 py-14 md:px-16 md:py-16">
      <div className="mx-auto max-w-5xl">
        <Reveal className="max-w-2xl text-left">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-primary">
            {eyebrow}
          </p>
          <h2 className="mt-1.5 text-3xl font-extrabold tracking-tight md:text-[2.15rem] md:leading-[1.15]">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-3 max-w-xl text-base leading-relaxed text-base-content/70">
              {subtitle}
            </p>
          )}
        </Reveal>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1.35fr_0.9fr] lg:gap-14">
          <div className="space-y-0">
            {primary.map((item, i) => (
              <Reveal
                key={item.title}
                className={`border-t border-base-300 py-7 ${i === primary.length - 1 ? "border-b" : ""}`}
              >
                <Icon name={item.icon} className="mb-3 size-5 text-primary" />
                <h3
                  className={
                    i === 0
                      ? "text-2xl font-bold tracking-tight md:text-[1.75rem]"
                      : "text-xl font-bold tracking-tight md:text-2xl"
                  }
                >
                  {item.title}
                </h3>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-base-content/65 md:text-base">
                  {item.body}
                </p>
              </Reveal>
            ))}
          </div>

          <div className="space-y-0 border-t border-base-300 lg:border-t-0 lg:border-l lg:border-base-300 lg:pl-10">
            {secondary.map((item, i) => (
              <Reveal
                key={item.title}
                className={`border-base-300 py-5 ${i === 0 ? "lg:pt-0" : "border-t"} ${
                  i === secondary.length - 1 ? "border-b lg:border-b-0" : ""
                }`}
              >
                <Icon name={item.icon} className="mb-2 size-4 text-base-content" />
                <h3 className="text-base font-bold tracking-tight">{item.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-base-content/60">{item.body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
