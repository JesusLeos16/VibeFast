import Link from "next/link"
import { Menu } from "lucide-react"
import config from "@/config"
import Logo from "@/components/Logo"

export default function Navbar() {
  const { nav, navCta } = config.landing

  return (
    <header className="sticky top-0 z-50 w-full border-b border-base-300/60 bg-base-100/95 backdrop-blur-sm">
      <nav className="mx-auto flex max-w-6xl items-center gap-6 px-5 py-2 md:px-16 md:py-2.5">
        <div className="flex shrink-0 items-center gap-2">
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
            <Logo className="text-[1.7rem] md:text-[1.9rem]" />
          </Link>
        </div>

        <ul className="ml-2 hidden items-center gap-4 md:flex">
          {nav.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="text-[13px] font-semibold text-base-content/55 transition-colors hover:text-primary"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <Link
          href={navCta.href}
          className="ml-auto rounded-sm border border-primary/20 bg-transparent px-3.5 py-1.5 text-[13px] font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-content sm:px-4 sm:py-2"
        >
          {navCta.label}
        </Link>
      </nav>
    </header>
  )
}
