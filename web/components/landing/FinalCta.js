import Link from "next/link"
import config from "@/config"
import Reveal from "./Reveal"

export default function FinalCta() {
  const { id, title, subtitle, cta } = config.landing.finalCta

  return (
    <section id={id} className="border-t border-base-300/70 px-4 py-12 md:px-16 md:py-14">
      <Reveal className="mx-auto max-w-5xl text-left">
        <div className="max-w-md translate-x-0 md:translate-x-2">
          <h2 className="mb-3 text-3xl font-extrabold tracking-tight md:text-[2.15rem] md:leading-[1.15]">
            {title}
          </h2>
          <p className="mb-7 text-base leading-relaxed text-base-content/70">{subtitle}</p>
          <Link
            href={cta.href}
            className="inline-flex rounded-sm bg-primary px-6 py-3 text-[14px] font-semibold text-primary-content transition-opacity hover:opacity-90"
          >
            {cta.label}
          </Link>
        </div>
      </Reveal>
    </section>
  )
}
