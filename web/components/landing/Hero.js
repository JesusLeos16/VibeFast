import Image from "next/image"
import Link from "next/link"
import config from "@/config"
import Reveal from "./Reveal"

export default function Hero() {
  const { eyebrow, title, subtitle, cta, secondaryCta } = config.landing.hero
  const heroImage = config.assets.heroDojo || config.assets.kiosco

  return (
    <section className="px-4 pb-10 pt-4 md:px-16 md:pb-12 md:pt-5">
      <div className="mx-auto grid max-w-6xl items-center gap-8 lg:grid-cols-[0.9fr_1.35fr] lg:gap-12">
        <Reveal className="order-2 max-w-md text-left lg:order-1">
          {eyebrow && (
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-primary">
              {eyebrow}
            </p>
          )}
          <h1 className="text-balance text-[2.15rem] font-extrabold leading-[1.05] tracking-tight md:text-[2.65rem]">
            {title}
          </h1>
          <p className="mt-4 max-w-[22rem] text-[15px] leading-relaxed text-base-content/70 md:text-base">
            {subtitle}
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3">
            <Link
              href={cta.href}
              className="inline-flex rounded-sm bg-primary px-5 py-2.5 text-[14px] font-semibold text-primary-content transition-opacity hover:opacity-90"
            >
              {cta.label}
            </Link>
            {secondaryCta && (
              <Link
                href={secondaryCta.href}
                className="text-[14px] font-medium text-base-content/55 underline-offset-4 transition-colors hover:text-primary hover:underline"
              >
                {secondaryCta.label}
              </Link>
            )}
          </div>
        </Reveal>

        <Reveal className="order-1 lg:order-2">
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-md sm:aspect-[5/3] lg:min-h-[420px] lg:aspect-auto">
            <Image
              src={heroImage}
              alt="Alumno escaneando su credencial en el kiosco Kickiie, con el panel del instructor y el portal de familias"
              fill
              priority
              className="object-cover object-center"
              sizes="(max-width: 1024px) 100vw, 58vw"
            />
          </div>
        </Reveal>
      </div>
    </section>
  )
}
