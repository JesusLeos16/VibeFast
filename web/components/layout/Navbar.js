import Link from "next/link"
import { Menu } from "lucide-react"
import config from "@/config"
import Logo from "@/components/Logo"

export default function Navbar() {
  const { nav, navCta, navLogin } = config.landing

  return (
    <header className="fixed top-0 z-50 w-full border-b border-base-300 bg-base-100/85 backdrop-blur-md">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4 md:px-16">
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
            </ul>
          </div>
          <Link href="/">
            <Logo />
          </Link>
        </div>

        <ul className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 md:flex">
          {nav.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="text-[15px] font-semibold text-base-content/70 transition-colors hover:text-primary"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-4">
          {config.features.googleAuth && (
            <Link
              href={navLogin.href}
              className="hidden text-[15px] font-semibold text-base-content transition-opacity hover:opacity-80 md:inline"
            >
              {navLogin.label}
            </Link>
          )}
          <Link
            href={navCta.href}
            className="rounded bg-primary px-6 py-3 text-[15px] font-semibold text-primary-content transition-all duration-200 hover:-translate-y-px hover:opacity-90 active:translate-y-0 active:scale-[0.98]"
          >
            {navCta.label}
          </Link>
        </div>
      </nav>
    </header>
  )
}
