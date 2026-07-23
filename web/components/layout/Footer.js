import Link from "next/link"
import config from "@/config"
import Logo from "@/components/Logo"

export default function Footer() {
  const { links, copyright } = config.landing.footer

  return (
    <footer className="border-t border-base-300 bg-base-100 px-5 py-8 md:px-16">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-6">
          <Logo className="text-[1.35rem]" />
          <p className="hidden text-xs text-base-content/50 md:block">{copyright}</p>
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm text-base-content/60 transition-colors hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <p className="text-xs text-base-content/50 md:hidden">{copyright}</p>
      </div>
    </footer>
  )
}
