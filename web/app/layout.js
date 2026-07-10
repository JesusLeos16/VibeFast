import "./globals.css"
import { Bricolage_Grotesque, Inter } from "next/font/google"
import config from "@/config"
import FaviconTheme from "@/components/FaviconTheme"

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-display",
  display: "swap",
})

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
  display: "swap",
})

export const metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || config.app.defaultUrl
  ),
  title: {
    default: config.app.name,
    template: `%s · ${config.app.name}`,
  },
  description: config.app.description,
  openGraph: {
    title: config.app.name,
    description: config.app.description,
    type: "website",
    locale: config.app.locale === "es" ? "es_MX" : "en_US",
    images: [{ url: config.assets.og, width: 1200, height: 630, alt: config.app.name }],
  },
  twitter: { card: "summary_large_image", images: [config.assets.og] },
  icons: {
    icon: [{ url: config.brand.logoIconSrc, type: "image/svg+xml" }],
    apple: "/kickiie/logo-icon.png",
  },
}

export const viewport = {
  themeColor: config.brand.primary,
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({ children }) {
  return (
    <html
      lang={config.app.locale}
      data-theme="vibefast"
      suppressHydrationWarning
      className={`${bricolage.variable} ${inter.variable}`}
      style={{ "--color-primary": config.brand.primary }}
    >
      <body className="bg-base-100 text-base-content">
        <link rel="icon" href="/kickiie/logo-icon.svg" type="image/svg+xml" sizes="any" />
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('theme');if(t==='vibefast'||t==='vibefast-dark'){document.documentElement.setAttribute('data-theme',t)}}catch(e){}`,
          }}
        />
        <FaviconTheme />
        {children}
      </body>
    </html>
  )
}
