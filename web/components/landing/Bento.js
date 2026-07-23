import Image from "next/image"
import { Users, Monitor, RectangleHorizontal, UsersRound } from "lucide-react"
import config from "@/config"
import Reveal from "./Reveal"

const ICONS = { Users, Monitor, RectangleHorizontal, UsersRound, Badge: RectangleHorizontal }

export default function Bento() {
  const { id, title, items } = config.landing.bento
  const kiosco = items.find((i) => i.id === "kiosco")
  const alumnos = items.find((i) => i.id === "alumnos")
  const tarjetas = items.find((i) => i.id === "tarjetas")
  const familias = items.find((i) => i.id === "familias")

  return (
    <section id={id} className="px-4 py-12 md:px-16 md:py-14">
      <div className="mx-auto max-w-5xl">
        <h2 className="mb-8 max-w-xl text-left text-2xl font-extrabold tracking-tight md:mb-10 md:text-[1.85rem] md:leading-[1.15]">
          {title}
        </h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
          {kiosco && (
            <Reveal className="group flex flex-col overflow-hidden rounded border border-base-300/70 bg-base-200/40 md:col-span-2 md:row-span-2">
              <div className="p-5 pb-3 md:p-6 md:pb-3">
                <Monitor className="mb-3 size-5 text-base-content" strokeWidth={1.5} />
                <h3 className="mb-1.5 text-xl font-bold md:text-2xl">{kiosco.title}</h3>
                <p className="max-w-md text-sm leading-relaxed text-base-content/70 md:text-base">
                  {kiosco.body}
                </p>
              </div>
              {kiosco.image && (
                <div className="relative mt-2 aspect-[16/11] w-full overflow-hidden border-t border-base-300/60 md:min-h-[280px] md:flex-1 md:aspect-auto">
                  <Image
                    src={kiosco.image}
                    alt={`Vista de ${kiosco.title}`}
                    fill
                    className="object-cover object-[center_30%] transition-transform duration-500 group-hover:scale-[1.02]"
                    sizes="(max-width: 768px) 100vw, 66vw"
                  />
                </div>
              )}
            </Reveal>
          )}

          {alumnos && (
            <Reveal className="group flex flex-col overflow-hidden rounded border border-base-300/70 bg-base-200/40">
              <div className="p-4 pb-2">
                <Users className="mb-2 size-4 text-base-content" strokeWidth={1.5} />
                <h3 className="mb-1 text-lg font-bold">{alumnos.title}</h3>
                <p className="text-sm leading-relaxed text-base-content/70">{alumnos.body}</p>
              </div>
              {alumnos.image && (
                <div className="relative mt-2 aspect-[16/10] w-full overflow-hidden border-t border-base-300/60">
                  <Image
                    src={alumnos.image}
                    alt={`Vista de ${alumnos.title}`}
                    fill
                    className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.02]"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
              )}
            </Reveal>
          )}

          {tarjetas && (
            <Reveal className="group flex flex-col overflow-hidden rounded border border-base-300/70 bg-base-200/40">
              <div className="p-4 pb-2">
                <RectangleHorizontal className="mb-2 size-4 text-base-content" strokeWidth={1.5} />
                <h3 className="mb-1 text-lg font-bold">{tarjetas.title}</h3>
                <p className="text-sm leading-relaxed text-base-content/70">{tarjetas.body}</p>
              </div>
              {tarjetas.image && (
                <div className="relative mt-1 aspect-[16/9] w-full overflow-hidden border-t border-base-300/60">
                  <Image
                    src={tarjetas.image}
                    alt={`Vista de ${tarjetas.title}`}
                    fill
                    className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.02]"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
              )}
            </Reveal>
          )}
        </div>

        {familias && (
          <Reveal className="mt-10 overflow-hidden bg-[#ebe7df] md:mt-14">
            <div className="flex flex-col gap-6 px-5 py-7 md:flex-row md:items-stretch md:gap-10 md:px-8 md:py-8">
              <div className="flex max-w-md flex-col justify-center md:w-[42%] md:shrink-0">
                <UsersRound className="mb-3 size-5 text-base-content" strokeWidth={1.5} />
                <h3 className="mb-2 text-xl font-bold md:text-2xl">{familias.title}</h3>
                <p className="max-w-sm text-sm leading-relaxed text-base-content/70 md:text-base">
                  {familias.body}
                </p>
              </div>
              {familias.image && (
                <div className="relative min-h-[200px] flex-1 overflow-hidden md:min-h-[260px]">
                  <Image
                    src={familias.image}
                    alt={`Vista de ${familias.title}`}
                    fill
                    className="object-cover object-[center_20%]"
                    sizes="(max-width: 768px) 100vw, 55vw"
                  />
                </div>
              )}
            </div>
          </Reveal>
        )}
      </div>
    </section>
  )
}
