import {
  User,
  Image as ImageIcon,
  QrCode,
  Shield,
  Star,
  CalendarCheck,
  CalendarPlus,
} from "lucide-react"
import config from "@/config"
import Reveal from "./Reveal"

const ICONS = {
  User,
  Image: ImageIcon,
  QrCode,
  Shield,
  Star,
  CalendarCheck,
  CalendarPlus,
}

function ItemList({ items, className = "" }) {
  return (
    <ul className={`flex flex-col gap-4 ${className}`}>
      {items.map(({ icon, label }) => {
        const Icon = ICONS[icon] || QrCode
        return (
          <li key={label} className="flex items-center gap-3 text-[0.95rem]">
            <Icon className="size-[18px] shrink-0 opacity-85" strokeWidth={1.75} />
            {label}
          </li>
        )
      })}
    </ul>
  )
}

export default function DosCaras() {
  const { id, title, subtitle, permanente, cambia, trail } = config.landing.dosCaras

  return (
    <section id={id} className="py-20 md:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-12 max-w-xl">
          <h2 className="text-balance text-3xl font-extrabold tracking-tight md:text-4xl">
            {title}
          </h2>
          <p className="mt-3 text-lg text-base-content/70">{subtitle}</p>
        </div>

        {/* Dos paneles unidos por el QR */}
        <Reveal className="mb-16 flex flex-col overflow-hidden rounded-2xl shadow-[0_24px_56px_-32px_rgba(24,24,27,.22)] md:flex-row">
          <div className="flex-1 bg-neutral p-8 text-neutral-content md:p-11">
            <span className="mb-1 block text-[0.78rem] font-semibold opacity-70">
              {permanente.eyebrow}
            </span>
            <h3 className="mb-5 text-xl font-bold tracking-tight">{permanente.title}</h3>
            <ItemList items={permanente.items} />
            <p className="mt-6 text-sm text-neutral-content/70">{permanente.note}</p>
          </div>

          {/* Puente: el QR en el centro */}
          <div className="relative h-0 w-auto md:h-auto md:w-0">
            <span className="absolute left-1/2 top-1/2 z-10 flex size-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-4 border-base-100 bg-primary text-white shadow-[0_8px_24px_-8px_rgba(24,24,27,.4)]">
              <QrCode className="size-[22px]" strokeWidth={1.9} />
            </span>
          </div>

          <div className="flex-1 bg-base-200 p-8 md:p-11">
            <span className="mb-1 block text-[0.78rem] font-semibold text-base-content/70">
              {cambia.eyebrow}
            </span>
            <div className="mb-6 mt-2">
              <span className="font-heading block text-5xl font-extrabold leading-none tracking-tight text-primary">
                {cambia.stat.num}
              </span>
              <span className="mt-1.5 block text-sm text-base-content/70">{cambia.stat.label}</span>
            </div>
            <ItemList items={cambia.items} />
          </div>
        </Reveal>

        {/* Proceso: imprime → escanea → consulta */}
        <ol className="reveal-stagger relative flex flex-col gap-7 md:flex-row md:justify-between md:gap-8">
          <span
            className="absolute bottom-0 left-[5px] top-0 w-px bg-base-300 md:bottom-auto md:left-0 md:right-0 md:top-[5px] md:h-px md:w-auto"
            aria-hidden
          />
          {trail.map((stop) => (
            <Reveal as="li" key={stop.title} className="relative flex-1">
              <span className="mb-3 block size-[11px] rounded-full border-[3px] border-base-100 bg-primary md:mb-4" />
              <h4 className="mb-1.5 text-base font-bold tracking-tight">{stop.title}</h4>
              <p className="max-w-xs text-sm text-base-content/70">{stop.body}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  )
}
