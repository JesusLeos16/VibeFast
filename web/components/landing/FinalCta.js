import Link from "next/link"
import config from "@/config"
import Reveal from "./Reveal"

export default function FinalCta() {
  const { id, title, subtitle, cta } = config.landing.finalCta

  return (
    <section id={id} className="flex flex-col items-center px-4 py-20 text-center md:px-16 md:py-24">
      <Reveal className="max-w-lg">
        <h2 className="mb-6 text-3xl font-extrabold tracking-tight md:text-[40px] md:leading-[1.12]">
          {title}
        </h2>
        <p className="mb-10 text-base leading-relaxed text-base-content/70">{subtitle}</p>
        <Link
          href={cta.href}
          className="inline-block rounded bg-neutral px-8 py-4 text-[15px] font-semibold text-neutral-content transition-all duration-300 hover:-translate-y-px hover:bg-primary active:translate-y-0 active:scale-[0.98]"
        >
          {cta.label}
        </Link>
      </Reveal>
    </section>
  )
}
