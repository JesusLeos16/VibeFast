import Link from "next/link"
import { Menu } from "lucide-react"
import config from "@/config"
import Logo from "@/components/Logo"

export default function Navbar() {
  const { nav, navCta } = config.landing

  return (
    <header className="sticky top-0 z-50 w-full border-b border-base-300/80 bg-base-100/90 backdrop-blur-md">
      <nav className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-2.5 md:px-16 md:py-3">
        <div className="flex items-center gap-2">
          <div className="dropdown md:hidden">
            <label tabIndex={0} className="btn btn-ghost btn-sm px-2" aria-label="Abrir menú">
              <Menu className="size-5" />
            </label>
            <ul
              tabIndex={0}
              className="menu dropdown-content z-50 mt-2 w-52 rounded-box border border-base-300 bg-base-100 p-2 shadow"
            >
              {nav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>{item.label}</Link>
                </li>
              ))}
              <li>
                <Link href={navCta.href}>{navCta.label}</Link>
              </li>
            </ul>
          </div>
          <Link href="/" className="inline-flex items-center">
            <Logo className="text-[1.55rem] md:text-[1.7rem]" />
          </Link>
        </div>

        <ul className="hidden items-center gap-5 md:flex">
          {nav.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="text-[14px] font-semibold text-base-content/65 transition-colors hover:text-primary"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <Link
          href={navCta.href}
          className="rounded-sm bg-primary px-4 py-2 text-sm font-semibold text-primary-content transition-opacity hover:opacity-90 sm:px-5 sm:py-2.5 sm:text-[14px]"
        >
          {navCta.label}
        </Link>
      </nav>
    </header>
  )
}
