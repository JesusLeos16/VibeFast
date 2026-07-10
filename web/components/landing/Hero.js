import Image from "next/image"
import config from "@/config"
import Reveal from "./Reveal"

export default function Hero() {
  const { title, subtitle } = config.landing.hero
  const [line1, line2] = title.split("\n")

  return (
    <section className="px-4 py-12 md:px-16 md:py-20">
      <div className="mx-auto grid max-w-5xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <Reveal className="text-center lg:text-left">
          <h1 className="text-balance text-4xl font-extrabold leading-[1.06] tracking-tight md:text-[56px]">
            {line1}
            <br />
            {line2}
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-base-content/70 lg:mx-0">
            {subtitle}
          </p>
        </Reveal>

        <Reveal className="flex justify-center lg:justify-end">
          <Image
            src={config.assets.heroCard}
            alt="Credencial PVC de alumno con código QR generada por Kickiie"
            width={640}
            height={404}
            priority
            className="pvc-card w-full max-w-md rounded-xl"
            sizes="(max-width: 1024px) 90vw, 420px"
          />
        </Reveal>
      </div>
    </section>
  )
}
