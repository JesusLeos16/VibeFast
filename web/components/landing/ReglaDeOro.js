import config from "@/config"
import Reveal from "./Reveal"

export default function ReglaDeOro() {
  const { id, quote, attribution } = config.landing.regla

  return (
    <section
      id={id}
      className="my-12 border-y border-base-300 bg-white px-4 py-20 md:px-16 md:py-24"
    >
      <Reveal className="mx-auto max-w-3xl text-center">
        <blockquote>
          <p className="text-balance text-3xl font-extrabold leading-tight tracking-tight md:text-[56px] md:leading-[1.06]">
            &ldquo;{quote}&rdquo;
          </p>
          <footer className="mt-6 text-lg text-base-content/70">{attribution}</footer>
        </blockquote>
      </Reveal>
    </section>
  )
}
