import Image from "next/image"
import { Users, Monitor, Badge, UsersRound } from "lucide-react"
import config from "@/config"
import Reveal from "./Reveal"

const ICONS = { Users, Monitor, Badge, UsersRound }

export default function Bento() {
  const { id, title, items } = config.landing.bento

  return (
    <section id={id} className="px-4 py-16 md:px-16 md:py-20">
      <div className="mx-auto max-w-5xl">
        <h2 className="mb-12 text-center text-3xl font-extrabold tracking-tight md:text-[40px] md:leading-[1.12]">
          {title}
        </h2>

        <div className="grid auto-rows-auto grid-cols-1 gap-6 md:grid-cols-3 md:auto-rows-[minmax(250px,auto)]">
          {items.map((item) => {
            const Icon = ICONS[item.icon] || Users
            const isLarge = item.span === "large"
            const isWide = item.span === "wide"

            if (isWide) {
              return (
                <Reveal
                  key={item.id}
                  className="col-span-full flex flex-col items-center justify-between gap-8 overflow-hidden rounded-lg border border-base-300 bg-base-200 p-8 transition-colors hover:bg-base-300/60 md:flex-row"
                >
                  <div className="max-w-xl">
                    <Icon className="mb-4 size-8 text-base-content" strokeWidth={1.5} />
                    <h3 className="mb-2 text-2xl font-bold">{item.title}</h3>
                    <p className="text-base leading-relaxed text-base-content/70">{item.body}</p>
                  </div>
                  {item.image && (
                    <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-lg border border-base-300 md:aspect-video md:w-[42%]">
                      <Image
                        src={item.image}
                        alt={`Vista de ${item.title}`}
                        fill
                        className="object-cover object-center transition-transform duration-500 hover:scale-[1.02]"
                        sizes="(max-width: 768px) 100vw, 40vw"
                      />
                    </div>
                  )}
                </Reveal>
              )
            }

            return (
              <Reveal
                key={item.id}
                className={`group flex flex-col overflow-hidden rounded-lg border border-base-300 bg-base-200 transition-colors hover:bg-base-300/60 ${
                  isLarge ? "md:col-span-2 md:row-span-2" : ""
                }`}
              >
                <div className={isLarge ? "p-8 pb-6" : "p-6 pb-4"}>
                  <Icon className="mb-4 size-8 text-base-content" strokeWidth={1.5} />
                  <h3 className="mb-2 text-xl font-bold md:text-2xl">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-base-content/70 md:text-base">
                    {item.body}
                  </p>
                  {item.tags && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {item.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-base-300 bg-base-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                {item.image && (
                  <div className="relative mt-auto aspect-[16/10] w-full overflow-hidden border-t border-base-300">
                    <Image
                      src={item.image}
                      alt={`Vista de ${item.title}`}
                      fill
                      className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]"
                      sizes={isLarge ? "(max-width: 768px) 100vw, 66vw" : "(max-width: 768px) 100vw, 33vw"}
                    />
                  </div>
                )}
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
