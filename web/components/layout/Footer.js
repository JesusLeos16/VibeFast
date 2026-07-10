import Link from "next/link"
import config from "@/config"
import Logo from "@/components/Logo"

export default function Footer() {
  const { links, copyright } = config.landing.footer

  return (
    <footer className="border-t border-base-300 bg-base-200 px-5 py-16 md:px-16">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 md:flex-row md:justify-between">
        <Logo className="text-xl" />

        <div className="flex flex-wrap justify-center gap-6">
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-base text-base-content/70 transition-colors hover:text-primary hover:underline"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <p className="text-center text-sm text-base-content/70 md:text-right">{copyright}</p>
      </div>
    </footer>
  )
}
