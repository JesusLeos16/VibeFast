import config from "@/config"

export default function FAQ() {
  const { eyebrow, title, items } = config.landing.faq

  return (
    <section id="faq" className="border-t border-base-300/70 px-4 py-12 md:px-16 md:py-14">
      <div className="mx-auto max-w-5xl">
        <div className="max-w-xl text-left">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-primary">
            {eyebrow}
          </p>
          <h2 className="mt-1.5 text-3xl font-extrabold tracking-tight md:text-[2.15rem] md:leading-[1.15]">
            {title}
          </h2>
        </div>

        <div className="mt-8 max-w-2xl border-t border-base-300">
          {items.map((item, i) => (
            <details
              key={i}
              open={i === 0}
              className="group border-b border-base-300"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 font-semibold marker:content-none [&::-webkit-details-marker]:hidden">
                <span>{item.q}</span>
                <span className="shrink-0 text-lg font-normal text-primary group-open:hidden">
                  +
                </span>
                <span className="hidden shrink-0 text-lg font-normal text-primary group-open:inline">
                  –
                </span>
              </summary>
              <p className="max-w-lg pb-4 pr-8 text-sm leading-relaxed text-base-content/65">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
