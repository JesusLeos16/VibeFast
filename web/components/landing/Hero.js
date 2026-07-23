import Image from "next/image"
import Link from "next/link"
import config from "@/config"
import Reveal from "./Reveal"

export default function Hero() {
  const { eyebrow, title, subtitle, cta } = config.landing.hero

  return (
    <section className="px-4 pb-10 pt-8 md:px-16 md:pb-14 md:pt-10">
      <div className="mx-auto grid max-w-5xl items-end gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:gap-12">
        <Reveal className="max-w-md text-center lg:max-w-[26rem] lg:text-left">
          {eyebrow && (
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-primary">
              {eyebrow}
            </p>
          )}
          <h1 className="text-balance text-[2.15rem] font-extrabold leading-[1.08] tracking-tight md:text-[2.75rem]">
            {title}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-base-content/70 md:text-lg">
            {subtitle}
          </p>
          {cta?.href && (
            <div className="mt-7 flex justify-center lg:justify-start">
              <Link
                href={cta.href}
                className="inline-flex rounded-sm bg-primary px-6 py-3 text-[14px] font-semibold text-primary-content transition-opacity hover:opacity-90"
              >
                {cta.label}
              </Link>
            </div>
          )}
        </Reveal>

        <Reveal className="flex justify-center lg:justify-end lg:pt-4">
          <div className="w-full max-w-[340px] sm:max-w-[380px] lg:translate-y-3">
            <p className="mb-2 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-base-content/45">
              Acceso al sistema
            </p>
            <Image
              src={config.assets.heroCard}
              alt="Credencial PVC con QR: acceso físico al sistema Kickiie"
              width={640}
              height={404}
              priority
              className="h-auto w-full"
              sizes="(max-width: 1024px) 80vw, 380px"
            />
          </div>
        </Reveal>
      </div>
    </section>
  )
}
