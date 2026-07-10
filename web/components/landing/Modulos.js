import { QrCode, MonitorSmartphone, Users } from "lucide-react"
import config from "@/config"
import Reveal from "./Reveal"

const ICONS = { QrCode, MonitorSmartphone, Users }

export default function Modulos() {
  const { id, title, subtitle, featured, items } = config.landing.modulos
  const FeaturedIcon = ICONS[featured.icon] || QrCode

  return (
    <section id={id} className="border-y border-base-300 bg-base-200 py-20 md:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-12 max-w-xl">
          <h2 className="text-balance text-3xl font-extrabold tracking-tight md:text-4xl">
            {title}
          </h2>
          <p className="mt-3 text-lg text-base-content/70">{subtitle}</p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Módulo estrella: generador de credenciales */}
          <Reveal className="col-span-full flex flex-wrap items-start gap-7 rounded-2xl bg-neutral p-8 text-neutral-content transition-transform duration-200 hover:-translate-y-0.5 md:p-10">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary text-white">
              <FeaturedIcon className="size-[22px]" strokeWidth={1.8} />
            </span>
            <div className="min-w-[220px] flex-1">
              <span className="mb-2.5 block text-xs font-semibold uppercase tracking-[0.06em] text-warning">
                {featured.tag}
              </span>
              <h3 className="mb-2.5 text-2xl font-bold tracking-tight text-white">
                {featured.title}
              </h3>
              <p className="max-w-2xl text-neutral-content/70">{featured.body}</p>
            </div>
          </Reveal>

          {items.map((item) => {
            const Icon = item.icon ? ICONS[item.icon] || QrCode : null
            const glow =
              item.tint === "glow"
                ? "bg-[radial-gradient(ellipse_at_22%_0%,rgba(201,42,42,.09)_0%,var(--color-base-100)_62%)]"
                : "bg-base-100"
            return (
              <Reveal
                key={item.title}
                className={`group rounded-2xl border border-base-300 p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_14px_32px_-18px_rgba(24,24,27,.2)] ${glow}`}
              >
                {Icon ? (
                  <span className="mb-4 flex size-10 items-center justify-center rounded-xl bg-base-200 text-base-content/70 transition-colors duration-200 group-hover:bg-primary group-hover:text-white">
                    <Icon className="size-[19px]" strokeWidth={1.75} />
                  </span>
                ) : (
                  <div className="mb-4">
                    <span className="font-heading block text-4xl font-extrabold leading-none text-primary">
                      {item.stat.num}
                    </span>
                    <span className="mt-1 block text-xs text-base-content/50">
                      {item.stat.label}
                    </span>
                  </div>
                )}
                <h3 className="mb-2 text-lg font-bold tracking-tight">{item.title}</h3>
                <p className="text-sm leading-relaxed text-base-content/70">{item.body}</p>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
